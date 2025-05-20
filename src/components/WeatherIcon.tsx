import React from 'react';
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  CloudFog, 
  CloudDrizzle,
  Moon,
  CloudMoon
} from 'lucide-react';

interface WeatherIconProps {
  conditionCode: number;
  isDay: number;
  size?: number;
  className?: string;
}

const WeatherIcon: React.FC<WeatherIconProps> = ({ 
  conditionCode, 
  isDay, 
  size = 64,
  className = "" 
}) => {
  // Map condition codes to icons
  const getIcon = () => {
    // Clear
    if ([1000].includes(conditionCode)) {
      return isDay ? <Sun size={size} className={`text-yellow-400 ${className}`} /> 
                   : <Moon size={size} className={`text-blue-200 ${className}`} />;
    }
    
    // Partly cloudy
    if ([1003].includes(conditionCode)) {
      return isDay ? <Cloud size={size} className={`text-gray-400 ${className}`} />
                   : <CloudMoon size={size} className={`text-gray-400 ${className}`} />;
    }
    
    // Cloudy
    if ([1006, 1009].includes(conditionCode)) {
      return <Cloud size={size} className={`text-gray-500 ${className}`} />;
    }
    
    // Fog, mist
    if ([1030, 1135, 1147].includes(conditionCode)) {
      return <CloudFog size={size} className={`text-gray-400 ${className}`} />;
    }
    
    // Drizzle, light rain
    if ([1063, 1150, 1153, 1180, 1183, 1240].includes(conditionCode)) {
      return <CloudDrizzle size={size} className={`text-blue-400 ${className}`} />;
    }
    
    // Rain
    if ([1186, 1189, 1192, 1195, 1243, 1246].includes(conditionCode)) {
      return <CloudRain size={size} className={`text-blue-500 ${className}`} />;
    }
    
    // Snow
    if ([1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258].includes(conditionCode)) {
      return <CloudSnow size={size} className={`text-blue-200 ${className}`} />;
    }
    
    // Thunderstorm
    if ([1087, 1273, 1276, 1279, 1282].includes(conditionCode)) {
      return <CloudLightning size={size} className={`text-purple-500 ${className}`} />;
    }
    
    // Default
    return isDay ? <Sun size={size} className={`text-yellow-400 ${className}`} /> 
                 : <Moon size={size} className={`text-blue-200 ${className}`} />;
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {getIcon()}
    </div>
  );
};

export default WeatherIcon;