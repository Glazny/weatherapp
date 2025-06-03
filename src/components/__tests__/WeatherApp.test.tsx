import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import WeatherApp from '../WeatherApp';
import { WeatherProvider } from '../../context/WeatherContext';

describe('WeatherApp', () => {
  it('renders the header', () => {
    render(
      <WeatherProvider>
        <WeatherApp />
      </WeatherProvider>
    );
    
    expect(screen.getByText('WeatherNow')).toBeInTheDocument();
  });

  it('renders the search bar', () => {
    render(
      <WeatherProvider>
        <WeatherApp />
      </WeatherProvider>
    );
    
    expect(screen.getByPlaceholderText('Search city or zip code...')).toBeInTheDocument();
  });
});