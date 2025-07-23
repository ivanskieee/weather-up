Voice-Activated Weather App

A voice-based weather assistant built using Laravel (backend) and React (frontend), powered by Cohere AI and Open-Meteo API.

Tech Stack:
- Frontend: React + Vite + Axios + Web Speech API
- Backend: Laravel (REST API)
- AI Integration: Cohere's Command-R+ model
- Weather Data: Open-Meteo API
- Geocoding: Open-Meteo Geocoding API

Features:
- Ask for weather using voice
- AI detects the location from your spoken sentence
- Real-time weather for specific locations in the Philippines
- Voice playback of weather information using text-to-speech

Getting Started:

Backend (Laravel):
1. Clone the repo and enter the Laravel project:
   git clone <repo-url>
   cd backend-laravel

2. Install dependencies:
   composer install

3. Create a .env file and add:
   COHERE_API_KEY=your_cohere_api_key_here

4. Run Laravel server:
   php artisan serve

Frontend (React):
1. Navigate to the frontend directory:
   cd frontend-react

2. Install dependencies:
   npm install

3. Run development server:
   npm run dev

Note: Make sure Laravel runs at http://localhost:8000 and React at http://localhost:5173

License:
This project is licensed under the MIT License. See LICENSE.txt for details.
