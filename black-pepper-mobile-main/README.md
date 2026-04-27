# Black Pepper Mobile App

React Native mobile application for Black Pepper AI - Visual Analysis for Black Pepper Health and Post-Harvest Grading.

## Features

- 🏠 **Home Screen**: Beautiful landing page with feature overview
- 📊 **Analysis Screen**: Upload images and analyze black pepper berries
- 🔐 **Sign In**: User authentication (backend integration pending)
- 🎨 **Modern UI**: Gradient backgrounds and smooth animations
- 📱 **Cross-platform**: Works on iOS and Android

## Project Structure

```
black-pepper-mobile/
├── src/
│   ├── navigation/
│   │   └── AppNavigator.js      # Navigation setup
│   ├── redux/
│   │   ├── store.js              # Redux store configuration
│   │   └── slices/
│   │       └── userSlice.js     # User state management
│   └── screens/
│       ├── HomeScreen.js         # Home/Landing page
│       ├── AnalysisScreen.js     # Berry analysis page
│       └── SignInScreen.js       # Sign in page
├── App.js                        # Main app component
├── package.json                  # Dependencies
└── app.json                      # Expo configuration
```

## Installation

1. Navigate to the project directory:
```bash
cd black-pepper-mobile
```

2. Install dependencies:
```bash
npm install
```

## Running the App

### Start the development server:
```bash
npm start
```

### Run on specific platform:
- **iOS**: `npm run ios` (requires macOS and Xcode)
- **Android**: `npm run android` (requires Android Studio)
- **Web**: `npm run web`

## Dependencies

- **Expo**: ~54.0.30
- **React**: 19.1.0
- **React Native**: 0.81.5
- **React Navigation**: For navigation
- **Redux Toolkit**: For state management
- **Expo Image Picker**: For image selection
- **Axios**: For API calls (backend integration pending)

## Backend Integration

The app is currently set up with frontend-only functionality. To connect to the backend:

1. Update the API URL in `src/screens/AnalysisScreen.js`:
   - Current: `http://localhost:5001/api/analyze`
   - Update to your backend server URL

2. Implement authentication in `src/screens/SignInScreen.js`

3. Add API service files for better organization

## Notes

- The app uses Expo for easier development and testing
- Image picker requires camera/gallery permissions
- Backend API integration is pending - currently shows mock/placeholder responses
- Redux store is configured with persistence using AsyncStorage

## Next Steps

1. Test the app on a device or simulator
2. Connect to backend API when ready
3. Implement full authentication flow
4. Add error handling and loading states
5. Add more screens as needed (Profile, History, etc.)

