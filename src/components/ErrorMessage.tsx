import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md shadow-sm my-4 animate-fade-in">
      <div className="flex items-center">
        <AlertTriangle className="text-red-500 mr-3" size={24} />
        <p className="text-red-700">{message}</p>
      </div>
    </div>
  );
};

export default ErrorMessage;