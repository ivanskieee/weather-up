import { useState } from 'react';
import axios from 'axios';

export default function VoiceWeather() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const askWeather = async (query) => {
    setLoading(true);
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/ask-weather', { query });
      setResponse(res.data);

      const temp = res.data.weather.temperature_2m;
      const speakText = `In ${res.data.location}, it's currently ${temp} degrees Celsius.`;
      const speech = new SpeechSynthesisUtterance(speakText);
      speechSynthesis.speak(speech);
    } catch (error) {
      alert('Failed to get weather.');
    } finally {
      setLoading(false);
    }
  };

  const handleMic = () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      askWeather(transcript);
    };
    recognition.start();
  };

  return (
    <div className="mt-10 flex flex-col items-center">
      <button
        onClick={handleMic}
        className="px-6 py-3 bg-white text-black font-semibold rounded-full shadow hover:bg-gray-200 transition"
      >
        Ask Weather
      </button>

      {loading && <p className="mt-6 text-gray-400 animate-pulse">Getting weather...</p>}
      {response && (
        <div className="mt-6 text-xl font-medium border border-gray-600 px-6 py-4 rounded-lg">
          🌦 <span className="text-white">{response.location}</span>:{" "}
          <span className="text-white">{response.weather.temperature_2m}°C</span>
        </div>
      )}
    </div>
  );
}
