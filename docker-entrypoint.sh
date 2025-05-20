#!/bin/bash

# Replace environment variables in the built JavaScript files
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|VITE_WEATHER_API_KEY_PLACEHOLDER|$VITE_WEATHER_API_KEY|g" {} +

# Start nginx
exec "$@"