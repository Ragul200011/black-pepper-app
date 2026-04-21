// App.js — Black Pepper AI Root v4
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store, persistor } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';

function Loading() {
  return (
    <View style={s.loading}>
      <ActivityIndicator size="large" color="#A8D96C" />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PersistGate loading={<Loading />} persistor={persistor}>
          <AppNavigator />
          <StatusBar style="light" />
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  loading: { flex:1, backgroundColor:'#080F05', justifyContent:'center', alignItems:'center' },
});