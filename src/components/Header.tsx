import React from 'react';
import { Thermometer, ToggleLeft, ToggleRight } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';

const Header: React.FC = () => {
  const { temperatureUnit, toggleTemperatureUnit } = useWeather();
  
  return (
    <header className="flex justify-between items-center mb-8">
      <div className="flex items-center">
        <Thermometer size={28} className="text-blue-500 mr-2" />
        <h1 className="text-2xl font-bold text-gray-800">WeatherNow</h1>
      </div>
      
      <button 
        onClick={toggleTemperatureUnit}
        className="flex items-center bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200"
        aria-label={`Switch to ${temperatureUnit === 'celsius' ? 'Fahrenheit' : 'Celsius'}`}
      >
        <span className={`mr-2 ${temperatureUnit === 'celsius' ? 'font-semibold' : 'text-gray-500'}`}>°C</span>
        {temperatureUnit === 'celsius' ? (
          <ToggleLeft className="text-gray-400" size={20} />
        ) : (
          <ToggleRight className="text-blue-500" size={20} />
        )}
        <span className={`ml-2 ${temperatureUnit === 'fahrenheit' ? 'font-semibold' : 'text-gray-500'}`}>°F</span>
      </button>
    </header>
  );
};

export default Header;