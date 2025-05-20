import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import axios from 'axios';
import { WeatherData, WeatherContextType, TemperatureUnit } from '../types/weather';

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = 'https://api.weatherapi.com/v1';

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const WeatherProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<string>('');
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>('celsius');

  const fetchWeather = useCallback(async (searchLocation?: string) => {
    if (!API_KEY) {
      setError('Weather API key is not configured. Please add your API key to the .env file.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const locationToFetch = searchLocation || location || 'auto:ip';
      
      const response = await axios.get(`${BASE_URL}/forecast.json`, {
        params: {
          key: API_KEY,
          q: locationToFetch,
          days: 3,
          aqi: 'no',
          alerts: 'no'
        }
      });
      
      setWeatherData(response.data);
      if (!searchLocation && !location) {
        setLocation(response.data.location.name);
      }
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Failed to fetch weather data. Please verify your API key and try again.');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  }, [location]);

  const toggleTemperatureUnit = useCallback(() => {
    setTemperatureUnit(prev => prev === 'celsius' ? 'fahrenheit' : 'celsius');
  }, []);

  return (
    <WeatherContext.Provider 
      value={{ 
        weatherData, 
        loading, 
        error, 
        location, 
        setLocation, 
        fetchWeather,
        temperatureUnit,
        toggleTemperatureUnit
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = (): WeatherContextType => {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
};