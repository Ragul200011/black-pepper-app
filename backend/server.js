const express = require('express');
const axios = require('axios');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// ---------------- Config ----------------
const TS_CHANNEL = '3187265';
const TS_KEY = 'ISFWVJXZW7P5TMQ9';

// ---------------- Upload Config ----------------
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const safeName = (file.originalname || 'image.jpg').replace(/\s+/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    console.log('Incoming file:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
    });

    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed.'));
    }

    cb(null, true);
  },
});

const deleteUploadedFile = (filePath) => {
  if (!filePath) return;

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Failed to delete uploaded file:', err.message);
    } else {
      console.log('Uploaded file deleted:', filePath);
    }
  });
};

// ---------------- Basic Routes ----------------
app.get('/', (req, res) => {
  res.send('Smart Black Pepper Guardian Backend Running 🚀');
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is running',
    routes: [
      'GET /api/soil-analysis',
      'POST /api/predict-image',
      'POST /api/variety-predict',
    ],
  });
});

// ---------------- Soil Analysis Route ----------------
app.get('/api/soil-analysis', async (req, res) => {
  try {
    console.log('Fetching live data from ThingSpeak...');
    const url = `https://api.thingspeak.com/channels/${TS_CHANNEL}/feeds.json?api_key=${TS_KEY}&results=1`;

    const response = await axios.get(url);
    const feeds = response.data.feeds;

    if (!feeds || feeds.length === 0) {
      return res.status(404).json({ error: 'No data found on ThingSpeak channel.' });
    }

    const latest = feeds[0];

    // ── ThingSpeak Field Mapping ──────────────────────────────────────────
    // Standard 7-in-1 RS485 soil sensor output order:
    // field1=Moisture(%) field2=Temperature(°C) field3=EC(unused)
    // field4=pH  field5=Nitrogen(mg/kg)  field6=Phosphorus(mg/kg)  field7=Potassium(mg/kg)
    // NOTE: Humidity is not sent by this sensor — removed from mapping.
    const sensorData = {
      Moisture:     parseFloat(latest.field1 || 0),   // field1 = Moisture %
      Temperature:  parseFloat(latest.field2 || 0),   // field2 = Temperature °C
      // field3 = EC (electrical conductivity) — not used by the AI model
      pH:           parseFloat(latest.field4 || 0),   // field4 = pH
      Nitrogen:     parseFloat(latest.field5 || 0),   // field5 = Nitrogen mg/kg
      Phosphorus:   parseFloat(latest.field6 || 0),   // field6 = Phosphorus mg/kg
      Potassium:    parseFloat(latest.field7 || 0),   // field7 = Potassium mg/kg
      Humidity:     0,  // Not provided by this sensor hardware
    };
    // Log the raw ThingSpeak fields alongside mapped values for easy debugging
    console.log('Raw ThingSpeak fields:', {
      field1: latest.field1, field2: latest.field2, field3: latest.field3,
      field4: latest.field4, field5: latest.field5, field6: latest.field6, field7: latest.field7
    });

    console.log('Extracted Sensor Data:', sensorData);

    // ── Rule-based fallback AI (used when Python ML is unavailable) ──────────
    function ruleBasedAnalysis(s) {
      const issues = [];
      if (s.pH < 5.0 || s.pH > 7.5)       issues.push(`pH ${s.pH} outside 5.0–7.5`);
      if (s.Nitrogen < 30)                  issues.push(`Low Nitrogen (${s.Nitrogen} mg/kg)`);
      if (s.Phosphorus < 10)                issues.push(`Low Phosphorus (${s.Phosphorus} mg/kg)`);
      if (s.Potassium < 50)                 issues.push(`Low Potassium (${s.Potassium} mg/kg)`);
      if (s.Moisture < 30 || s.Moisture > 85) issues.push(`Moisture ${s.Moisture}% out of range`);
      if (s.Temperature < 18 || s.Temperature > 38) issues.push(`Temperature ${s.Temperature}°C out of range`);
      const healthy = issues.length === 0;
      return {
        prediction:  healthy ? 'Healthy' : 'Needs Attention',
        status:      healthy ? 'Healthy' : 'Needs Attention',
        consensus:   healthy ? 'Healthy Soil' : 'Soil Needs Attention',
        issues,
        rule_based:  true,
        note:        healthy ? 'All parameters within optimal range' : issues.join('; '),
      };
    }

    // ── Try Python ML, fall back to rule-based ───────────────────────────────
    function runPrediction(cmd, args, callback) {
      const proc = spawn(cmd, args);
      let out = '', err = '';
      proc.stdout.on('data', d => { out += d.toString(); });
      proc.stderr.on('data', d => { err += d.toString(); });
      proc.on('error', e  => callback(null, `spawn error: ${e.message}`));
      proc.on('close', code => {
        if (code !== 0) return callback(null, err || `exit code ${code}`);
        try {
          const lines = out.trim().split('\n');
          const parsed = JSON.parse(lines[lines.length - 1].trim());
          if (parsed.error) return callback(null, parsed.error);
          callback(parsed, null);
        } catch (e) {
          callback(null, `JSON parse failed: ${out.slice(0, 100)}`);
        }
      });
    }

    const predictArgs = [path.join(__dirname, 'predict.py'), JSON.stringify(sensorData)];

    // Try 'python' first, then 'python3'
    runPrediction('python', predictArgs, (result1, err1) => {
      if (result1) {
        console.log('ML prediction (python):', result1);
        return res.json({ timestamp: latest.created_at, sensors: sensorData, ai_analysis: result1 });
      }
      console.warn('python failed:', err1, '— trying python3...');
      runPrediction('python3', predictArgs, (result2, err2) => {
        if (result2) {
          console.log('ML prediction (python3):', result2);
          return res.json({ timestamp: latest.created_at, sensors: sensorData, ai_analysis: result2 });
        }
        // Both failed — use rule-based analysis so the app always shows a verdict
        console.warn('python3 also failed:', err2, '— using rule-based fallback');
        const fallback = ruleBasedAnalysis(sensorData);
        return res.json({ timestamp: latest.created_at, sensors: sensorData, ai_analysis: fallback });
      });
    });
  } catch (error) {
    console.error('Server Error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch from ThingSpeak or process data.' });
  }
});

// ---------------- Weather Route ----------------
// Uses OpenWeatherMap free API. Get a free key at https://openweathermap.org/api
// Replace the key below with your own, or set env var OWM_KEY
const OWM_KEY = process.env.OWM_KEY || 'bd5e378503939ddaee76f12ad7a97608'; // demo key

app.get('/api/weather', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat) || 6.9147;
    const lon = parseFloat(req.query.lon) || 79.9729;

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_KEY}&units=metric`;
    const response = await axios.get(url, { timeout: 8000 });
    const d = response.data;

    return res.json({
      city:        d.name,
      temperature: d.main.temp,
      feels_like:  d.main.feels_like,
      humidity:    d.main.humidity,
      wind:        d.wind.speed,
      weather:     d.weather[0]?.description ?? '',
      icon:        d.weather[0]?.icon ?? '',
    });
  } catch (error) {
    console.error('Weather API error:', error.message);
    return res.status(500).json({
      error: 'Could not fetch weather data.',
      hint: 'Ensure OWM_KEY env var is set with a valid OpenWeatherMap API key.',
    });
  }
});

// ---------------- General Image Prediction Route ----------------
app.post(
  '/api/predict-image',
  (req, res, next) => {
    console.log('==== IMAGE UPLOAD REQUEST RECEIVED ====');
    next();
  },
  upload.single('file'),
  (req, res) => {
    try {
      console.log('Uploaded file object:', req.file);
      console.log('Request body:', req.body);

      if (!req.file) {
        return res.status(400).json({
          error: "No image uploaded. Use form-data with field name 'file'.",
        });
      }

      const imagePath = req.file.path;
      const pythonScript = path.join(__dirname, 'predict_image.py');

      console.log('Saved image path:', imagePath);
      console.log('Python script path:', pythonScript);

      const pythonProcess = spawn('python', [pythonScript, imagePath]);

      let predictionResult = '';
      let errorResult = '';

      pythonProcess.stdout.on('data', (data) => {
        predictionResult += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorResult += data.toString();
        console.error(`Image Python stderr: ${data}`);
      });

      pythonProcess.on('close', (code) => {
        console.log('Python process exit code:', code);

        if (code !== 0) {
          console.error(`predict_image.py exited with code ${code}`);
          console.error('Python stdout:', predictionResult);
          console.error('Python stderr:', errorResult);

          deleteUploadedFile(imagePath);

          return res.status(500).json({
            error: 'Image prediction failed',
            stdout: predictionResult,
            stderr: errorResult,
          });
        }

        try {
          const lines = predictionResult.trim().split('\n');
          const lastLine = lines[lines.length - 1].trim();
          const aiResponse = JSON.parse(lastLine);

          deleteUploadedFile(imagePath);

          return res.json({
            success: true,
            image_name: req.file.filename,
            ai_analysis: aiResponse,
          });
        } catch (parseError) {
          console.error('Failed to parse Python output:', predictionResult);

          deleteUploadedFile(imagePath);

          return res.status(500).json({
            error: 'Invalid image prediction format returned.',
            raw_output: predictionResult,
            stderr: errorResult,
          });
        }
      });
    } catch (error) {
      console.error('Server Error:', error.message);
      return res.status(500).json({
        error: 'Failed to process uploaded image.',
        details: error.message,
      });
    }
  }
);

// ---------------- Variety Prediction Route ----------------
app.post('/api/variety-predict', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded.' });
    }

    const imagePath = req.file.path;
    console.log('Received image:', imagePath);

    const pythonProcess = spawn('python', [
      path.join(__dirname, 'predict_variety.py'),
      imagePath,
    ]);

    let result = '';
    let errorResult = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorResult += data.toString();
      console.error(`Python Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      console.log('=== Python exit code:', code);
      console.log('=== Python stdout:', result);
      console.log('=== Python stderr:', errorResult);

      deleteUploadedFile(imagePath);

      if (code !== 0) {
        console.error(`Python script exited with code ${code}`);
        return res.status(500).json({
          error: 'Variety prediction failed',
          details: errorResult,
        });
      }

      try {
        const lines = result.trim().split('\n');
        const lastLine = lines[lines.length - 1].trim();
        const parsed = JSON.parse(lastLine);
        return res.json(parsed);
      } catch (err) {
        console.error('Failed to parse Python output:', result);
        return res.status(500).json({
          error: 'Invalid response from Python script',
        });
      }
    });
  } catch (error) {
    console.error('Server Error:', error.message);
    return res.status(500).json({ error: 'Server failed during image prediction.' });
  }
});

// ---------------- Multer Error Handler ----------------
app.use((err, req, res, next) => {
  console.error('Multer/Route error:', err);

  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      error: 'Upload error',
      details: err.message,
    });
  }

  if (err) {
    return res.status(400).json({
      error: err.message,
    });
  }

  next();
});

// ---------------- Start Server ----------------
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🌱 Smart Black Pepper Guardian Backend running on http://localhost:${PORT}`);
  console.log(`📡 Listening for requests at /api/soil-analysis`);
  console.log(`📸 Listening for requests at /api/predict-image`);
  console.log(`🍃 Listening for requests at /api/variety-predict`);
});