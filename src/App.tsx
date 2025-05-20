import React from 'react';
import { WeatherProvider } from './context/WeatherContext';
import WeatherApp from './components/WeatherApp';

function App() {
  return (
    <WeatherProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <WeatherApp />
      </div>
    </WeatherProvider>
  );
}

export default App;