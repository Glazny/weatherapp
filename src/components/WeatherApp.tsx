import React, { useEffect } from 'react';
import { useWeather } from '../context/WeatherContext';
import Header from './Header';
import SearchBar from './SearchBar';
import CurrentWeather from './CurrentWeather';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const WeatherApp: React.FC = () => {
  const { weatherData, loading, error, fetchWeather } = useWeather();

  useEffect(() => {
    fetchWeather();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderContent = () => {
    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;
    if (!weatherData) return null;
    
    return <CurrentWeather />;
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Header />
        <SearchBar />
        {renderContent()}
      </div>
    </div>
  );
};

export default WeatherApp;