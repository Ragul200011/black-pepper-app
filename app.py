import streamlit as st
import pandas as pd
import numpy as np
import joblib
import time
import os
import random
from collections import Counter
import plotly.graph_objects as go

# --- CONFIGURATION ---
st.set_page_config(
    page_title="Smart Black Pepper Guardian",
    layout="wide",
    page_icon="🌿"
)

# Constants for file paths (relative to app.py)
MODEL_DIR = "model_results_smote"
RF_PATH = os.path.join(MODEL_DIR, "Random Forest_model.pkl")
XGB_PATH = os.path.join(MODEL_DIR, "XGBoost_model.pkl")
SVM_PATH = os.path.join(MODEL_DIR, "SVM_model.pkl")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.pkl")
ENCODER_PATH = os.path.join(MODEL_DIR, "label_encoder.pkl")

# --- MODEL LOADING ---
@st.cache_resource
def load_resources():
    """Loads models and scalers once to optimize performance."""
    try:
        resources = {
            "rf": joblib.load(RF_PATH),
            "xgb": joblib.load(XGB_PATH),
            "svm": joblib.load(SVM_PATH),
            "scaler": joblib.load(SCALER_PATH),
            "encoder": joblib.load(ENCODER_PATH)
        }
        return resources
    except FileNotFoundError as e:
        st.error(f"❌ Error loading models: {e}. Please ensure 'model_results_smote/' directory exists.")
        return None
    except Exception as e:
        st.error(f"❌ Unexpected error loading models: {e}")
        return None

resources = load_resources()

import requests

# --- SENSOR INTERFACE ---
def get_sensor_data(mode, com_port, baudrate=9600, slave_id=1, timeout=1, function_code=3, ts_channel="", ts_key="", mapping=None):
    """
    Retrieves sensor data either from simulation, live Modbus hardware, or ThingSpeak Cloud.
    Returns: dict of sensor values or None on critical error.
    """
    data = {
        "Temperature": 0.0, "Moisture": 0.0, 
        "Nitrogen": 0.0, "Phosphorus": 0.0, "Potassium": 0.0, 
        "pH": 0.0, "Humidity": 0.0 
    }

    if mode == "Simulation Mode":
        # Generate realistic random data for Black Pepper soil
        data["Temperature"] = round(random.uniform(22.0, 35.0), 1)
        data["Moisture"] = round(random.uniform(40.0, 80.0), 1)
        data["Nitrogen"] = round(random.uniform(100.0, 250.0), 0)
        data["Phosphorus"] = round(random.uniform(10.0, 60.0), 0)
        data["Potassium"] = round(random.uniform(150.0, 300.0), 0)
        data["pH"] = round(random.uniform(5.5, 7.5), 2)
        data["Humidity"] = round(random.uniform(60.0, 90.0), 1)
        time.sleep(0.5) # Simulate read delay
        return data

    elif mode == "ThingSpeak Cloud":
        try:
            url = f"https://api.thingspeak.com/channels/{ts_channel}/feeds.json?api_key={ts_key}&results=1"
            response = requests.get(url, timeout=5)
            response.raise_for_status()
            feed = response.json()
            
            if feed['feeds']:
                latest = feed['feeds'][-1]
                
                # Show raw data for debugging
                st.sidebar.markdown("---")
                st.sidebar.markdown("### 📥 Raw Data Payload")
                st.sidebar.caption(f"Created: {latest['created_at']}")
                st.sidebar.json(latest)
                
                # Use User-Defined Mapping
                if mapping:
                    data["Temperature"] = float(latest.get(mapping["Temperature"]) or 0)
                    data["Moisture"] = float(latest.get(mapping["Moisture"]) or 0)
                    data["Nitrogen"] = float(latest.get(mapping["Nitrogen"]) or 0)
                    data["Phosphorus"] = float(latest.get(mapping["Phosphorus"]) or 0)
                    data["Potassium"] = float(latest.get(mapping["Potassium"]) or 0)
                    data["pH"] = float(latest.get(mapping["pH"]) or 0)
                    data["Humidity"] = float(latest.get(mapping["Humidity"]) or 0)
                else:
                    # Fallback default
                    data["Temperature"] = float(latest.get("field1") or 0)
                    # ... others ...

                return data
            else:
                st.warning("⚠️ ThingSpeak connected, but channel is empty.")
                return None
                
        except Exception as e:
            st.error(f"❌ ThingSpeak Error: {e}")
            return None

    elif mode == "Live Sensor Mode":
        instrument = None
        try:
            import minimalmodbus
            instrument = minimalmodbus.Instrument(com_port, slave_id)  # Port, Slave Address
            instrument.serial.baudrate = baudrate
            instrument.serial.timeout = timeout
            # Setup serial parameters - commonly 8N1
            instrument.serial.bytesize = 8
            instrument.serial.parity = minimalmodbus.serial.PARITY_NONE
            instrument.serial.stopbits = 1
            instrument.mode = minimalmodbus.MODE_RTU
            instrument.clear_buffers_before_each_transaction = True
            
            # NOTE: Register addresses vary by sensor manufacturer. 
            # Assuming contiguous registers 0-6 or similar. Adjust offsets if needed.
            # Reading 7 registers starting from address 0 (common for 7-in-1 sensors)
            # You may need to change functioncode to 3 or 4 depending on datasheet.
            
            # Implementation for reading 7 contiguous registers
            # Many cheap RS485 sensors map: Moist, Temp, EC, pH, N, P, K.
            # We map blindly here assuming standard order or User's register map implementation.
            
            # NOTE: Since no specific register map was provided in prompt, 
            # I will assume standard individual register reads for safety.
            
            # These are placeholder addresses. USER MUST VERIFY DATASHEET.
            # Usually: 
            # Reg 0: Moisture, Reg 1: Temp, Reg 2: EC, Reg 3: pH, Reg 4: N, Reg 5: P, Reg 6: K.
            # But user list order: Temp, Moist, N, P, K, pH, Hum.
            
            # Using reads for demonstration (assuming values are scaled x10 or x1)
            # minimalmodbus read_register(address, number_of_decimals, function_code, signed)
            
            # Example heuristic mapping:
            data["Temperature"] = instrument.read_register(0, 1, functioncode=function_code) # e.g. 256 -> 25.6
            data["Moisture"] = instrument.read_register(1, 1, functioncode=function_code)
            data["Nitrogen"] = instrument.read_register(2, 0, functioncode=function_code)
            data["Phosphorus"] = instrument.read_register(3, 0, functioncode=function_code)
            data["Potassium"] = instrument.read_register(4, 0, functioncode=function_code)
            data["pH"] = instrument.read_register(5, 1, functioncode=function_code)
            data["Humidity"] = instrument.read_register(6, 1, functioncode=function_code)
            
            return data

        except ImportError:
            st.error("❌ 'minimalmodbus' library not found. Please pip install it.")
            return None
        except Exception as e:
            st.error(f"❌ Sensor Connection Error: {e}")
            return None
        finally:
            if instrument and instrument.serial:
                instrument.serial.close()

# --- UI LAYOUT ---
# Sidebar
st.sidebar.title("🎮 Controls")
mode = st.sidebar.radio("Operation Mode", ["Simulation Mode", "Live Sensor Mode", "ThingSpeak Cloud"])

com_port = "COM3"
baudrate = 9600
slave_id = 1
timeout = 1.0
function_code = 3
ts_channel = "3187265"
ts_key = "ISFWVJXZW7P5TMQ9"
ts_mapping = {}

if mode == "ThingSpeak Cloud":
    st.sidebar.markdown("### ☁️ Cloud Settings")
    ts_channel = st.sidebar.text_input("Channel ID", "3187265")
    ts_key = st.sidebar.text_input("Read API Key", "ISFWVJXZW7P5TMQ9", type="password")
    
    with st.sidebar.expander("🛠️ Map Fields (Click to Open)", expanded=False):
        st.write("Match ThingSpeak Fields to Sensor Values:")
        fields = [f"field{i}" for i in range(1, 9)]
        ts_mapping["Temperature"] = st.selectbox("Temperature", fields, index=0) # field1
        ts_mapping["Moisture"] = st.selectbox("Moisture", fields, index=1)       # field2
        ts_mapping["Nitrogen"] = st.selectbox("Nitrogen", fields, index=2)       # field3
        ts_mapping["Phosphorus"] = st.selectbox("Phosphorus", fields, index=3)   # field4
        ts_mapping["Potassium"] = st.selectbox("Potassium", fields, index=4)     # field5
        ts_mapping["pH"] = st.selectbox("pH Level", fields, index=5)             # field6
        ts_mapping["Humidity"] = st.selectbox("Humidity", fields, index=6)       # field7

if mode == "Live Sensor Mode":
    import serial.tools.list_ports
    ports_info = serial.tools.list_ports.comports()
    # Create a list of "COMx - Description" strings
    port_options = [f"{p.device}" for p in ports_info]
    
    if not port_options:
        st.sidebar.warning("⚠️ No COM ports detected! Check USB connection.")
        com_port = st.sidebar.text_input("Manually Enter Port", "COM3")
    else:
        com_port = st.sidebar.selectbox("Select COM Port", port_options)
        # Show full description for context
        selected_desc = next((p.description for p in ports_info if p.device == com_port), "Unknown")
        st.sidebar.caption(f"Device: {selected_desc}")
    
    st.sidebar.markdown("### ⚙️ Modbus Settings")
    baudrate = st.sidebar.selectbox("Baudrate", [4800, 9600, 19200, 38400, 115200], index=1)
    slave_id = st.sidebar.number_input("Slave ID", min_value=1, max_value=247, value=1)
    timeout = st.sidebar.number_input("Timeout (sec)", min_value=0.1, max_value=5.0, value=1.0)
    function_code = st.sidebar.radio("Function Code", [3, 4])
    st.sidebar.caption("3: Holding Reg, 4: Input Reg")

st.sidebar.markdown("---")
st.sidebar.info("Select 'Live Sensor Mode' to connect to RS485 hardware.")

# Main Header
st.title("🌿 Smart Black Pepper Guardian")
st.markdown("### AI-Powered Fertilizer Recommendation System")

# Placeholder for auto-refresh loop
if 'history' not in st.session_state:
    st.session_state.history = {'N': [], 'P': [], 'pH': [], 'time': []}

# Main Application Loop
placeholder = st.empty()

# We use a button to trigger 'Run Once' or loop if desired. 
# For Streamlit, infinite loops with sleep are one way to do 'Live' dashboards.
auto_refresh = st.sidebar.checkbox("Auto-Refresh Data (Live Monitor)", value=False)

if auto_refresh:
    loop_condition = True
else:
    # Run once manually if checkbox off, effectively
    loop_condition = False

# Function to run one update cycle
def run_dashboard_cycle():
    sensor_vals = get_sensor_data(mode, com_port, baudrate, slave_id, timeout, function_code, ts_channel, ts_key, ts_mapping)
    
    if sensor_vals and resources:
        # 1. Live Metrics Row
        with st.container():
            cols = st.columns(7)
            metrics = [
                ("Temperature", f"{sensor_vals['Temperature']} °C"),
                ("Moisture", f"{sensor_vals['Moisture']} %"),
                ("Nitrogen", f"{sensor_vals['Nitrogen']} mg/kg"),
                ("Phosphorus", f"{sensor_vals['Phosphorus']} mg/kg"),
                ("Potassium", f"{sensor_vals['Potassium']} mg/kg"),
                ("pH", f"{sensor_vals['pH']}"),
                ("Humidity", f"{sensor_vals['Humidity']} %"),
            ]
            
            for col, (label, val) in zip(cols, metrics):
                col.metric(label, val)

        # 2. AI Inference
        # Prepare input vector (Must match training order: Temp, Moist, N, P, K, pH)
        # Note: Humidity is EXCLUDED as per training data mismatch check.
        input_data = np.array([[
            sensor_vals['Temperature'],
            sensor_vals['Moisture'],
            sensor_vals['Nitrogen'],
            sensor_vals['Phosphorus'],
            sensor_vals['Potassium'],
            sensor_vals['pH']
        ]])
        
        # Scale features
        scaled_features = resources['scaler'].transform(input_data)
        
        # Predictions
        rf_code = resources['rf'].predict(scaled_features)[0]
        xgb_code = resources['xgb'].predict(scaled_features)[0]
        svm_code = resources['svm'].predict(scaled_features)[0]
        
        # Decode
        rf_pred = resources['encoder'].inverse_transform([rf_code])[0]
        xgb_pred = resources['encoder'].inverse_transform([xgb_code])[0]
        svm_pred = resources['encoder'].inverse_transform([svm_code])[0]
        
        # Consensus
        votes = [rf_pred, xgb_pred, svm_pred]
        consensus = Counter(votes).most_common(1)[0][0]
        
        # Display Verdict
        st.markdown("---")
        st.subheader("🤖 AI Council Verdict")
        
        p_col1, p_col2, p_col3, p_col4 = st.columns(4)
        
        p_col1.info(f"**Random Forest**\n\n{rf_pred}")
        p_col2.info(f"**XGBoost**\n\n{xgb_pred}")
        p_col3.info(f"**SVM**\n\n{svm_pred}")
        
        # Highlight Final Consensus
        if consensus == "Healthy":
            p_col4.success(f"**FINAL CONSENSUS**\n\n### {consensus}")
        else:
            p_col4.error(f"**FINAL CONSENSUS**\n\n### {consensus}")

        # 3. Live Graph Update
        # Update history
        st.session_state.history['N'].append(sensor_vals['Nitrogen'])
        st.session_state.history['P'].append(sensor_vals['Phosphorus'])
        st.session_state.history['pH'].append(sensor_vals['pH'])
        st.session_state.history['time'].append(time.strftime("%H:%M:%S"))
        
        # Keep last 30
        if len(st.session_state.history['time']) > 30:
            for key in st.session_state.history:
                st.session_state.history[key].pop(0)
        
        # Plot
        fig = go.Figure()
        fig.add_trace(go.Scatter(x=st.session_state.history['time'], y=st.session_state.history['N'], name='Nitrogen', mode='lines+markers'))
        fig.add_trace(go.Scatter(x=st.session_state.history['time'], y=st.session_state.history['P'], name='Phosphorus', mode='lines+markers'))
        
        # Create secondary y-axis for pH since scale is different (0-14 vs 0-300)
        fig.add_trace(go.Scatter(x=st.session_state.history['time'], y=st.session_state.history['pH'], name='pH', mode='lines+markers', yaxis='y2'))
        
        fig.update_layout(
            title="Real-time Soil Trends",
            xaxis_title="Time",
            yaxis=dict(title="Nutrients (mg/kg)"),
            yaxis2=dict(title="pH Level", overlaying='y', side='right'),
            height=400,
            margin=dict(l=0, r=0, t=40, b=0),
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
        )
        
        st.plotly_chart(fig, use_container_width=True)

# Run logic
if auto_refresh:
    # Use an empty container to redraw the whole dashboard content fresh each time
    # (Streamlit 'rerun' feels less flicker-y than clearing, but 'empty()' container is standard for simple loops)
    with placeholder.container():
        run_dashboard_cycle()
    time.sleep(1)
    st.rerun()
else:
    if st.button("Reads Sensors Once"):
        with placeholder.container():
            run_dashboard_cycle()
    else:
        st.info("Click 'Auto-Refresh' in sidebar for continuous monitoring or button above for single read.")
