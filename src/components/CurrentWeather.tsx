import React from 'react';
import { useWeather } from '../context/WeatherContext';
import WeatherIcon from './WeatherIcon';
import { Droplets, Wind, Thermometer } from 'lucide-react';

const CurrentWeather: React.FC = () => {
  const { weatherData, temperatureUnit } = useWeather();
  
  if (!weatherData) return null;
  
  const { location, current } = weatherData;
  const temp = temperatureUnit === 'celsius' ? current.temp_c : current.temp_f;
  const feelsLike = temperatureUnit === 'celsius' ? current.feelslike_c : current.feelslike_f;
  const tempSymbol = temperatureUnit === 'celsius' ? '°C' : '°F';
  
  // Extract date and format it
  const localDate = new Date(location.localtime);
  const formattedDate = localDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
  
  const formattedTime = localDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  // Determine background classes based on weather condition and day/night
  const getBgClass = () => {
    const isDay = current.is_day === 1;
    const condition = current.condition.code;
    
    // Clear sky
    if (condition === 1000) {
      return isDay ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gradient-to-br from-blue-900 to-indigo-900';
    }
    
    // Partly cloudy
    if (condition === 1003) {
      return isDay ? 'bg-gradient-to-br from-blue-300 to-blue-500' : 'bg-gradient-to-br from-blue-800 to-indigo-900';
    }
    
    // Cloudy
    if ([1006, 1009].includes(condition)) {
      return isDay ? 'bg-gradient-to-br from-gray-300 to-blue-400' : 'bg-gradient-to-br from-gray-800 to-blue-900';
    }
    
    // Rainy
    if ([1063, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(condition)) {
      return isDay ? 'bg-gradient-to-br from-gray-400 to-blue-500' : 'bg-gradient-to-br from-gray-900 to-blue-900';
    }
    
    // Default
    return isDay ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gradient-to-br from-blue-900 to-indigo-900';
  };

  return (
    <div 
      className={`rounded-xl p-6 shadow-lg text-white transition-all duration-500 ease-in-out ${getBgClass()}`}
    >
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="mb-4 md:mb-0">
          <h2 className="text-2xl font-semibold mb-1">{location.name}, {location.country}</h2>
          <p className="text-sm opacity-90">{formattedDate} • {formattedTime}</p>
          
          <div className="flex items-center mt-6">
            <div className="text-6xl font-bold mr-4">{Math.round(temp)}{tempSymbol}</div>
            <WeatherIcon 
              conditionCode={current.condition.code} 
              isDay={current.is_day} 
              size={56} 
            />
          </div>
          
          <p className="text-lg mt-2">{current.condition.text}</p>
        </div>
        
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 w-full md:w-auto">
          <h3 className="text-lg font-medium mb-3">Weather Details</h3>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center">
              <Thermometer className="mr-2" size={18} />
              <span>Feels like: {Math.round(feelsLike)}{tempSymbol}</span>
            </div>
            
            <div className="flex items-center">
              <Droplets className="mr-2" size={18} />
              <span>Humidity: {current.humidity}%</span>
            </div>
            
            <div className="flex items-center">
              <Wind className="mr-2" size={18} />
              <span>Wind: {current.wind_kph} km/h {current.wind_dir}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather;