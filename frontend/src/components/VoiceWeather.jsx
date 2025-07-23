import { useState, useEffect } from 'react';
import axios from 'axios';

export default function VoiceWeather() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);

  const addToHistory = (message, isUser = false) => {
    const newMessage = {
      id: Date.now(),
      text: message,
      isUser,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setConversationHistory(prev => [...prev, newMessage]);
  };

  const askWeather = async (query) => {
    setLoading(true);
    addToHistory(query, true);
    
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/ask-weather', { query });
      setResponse(res.data);

      const temp = res.data.weather.temperature_2m;
      const responseText = `In ${res.data.location}, it's currently ${temp} degrees Celsius.`;
      
      // Add AI response to history
      addToHistory(responseText, false);
      
      // Text-to-speech
      const speech = new SpeechSynthesisUtterance(responseText);
      speech.rate = 0.9;
      speech.pitch = 1;
      speechSynthesis.speak(speech);
      
    } catch (error) {
      const errorMsg = 'Sorry, I couldn\'t fetch the weather data right now. Please try again.';
      addToHistory(errorMsg, false);
      console.error('Weather API error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMic = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser.');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };
    
    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      setTranscript(transcript);
      
      if (event.results[current].isFinal) {
        askWeather(transcript);
      }
    };
    
    recognition.onend = () => {
      setIsListening(false);
      setTranscript('');
    };
    
    recognition.onerror = (event) => {
      setIsListening(false);
      console.error('Speech recognition error:', event.error);
      addToHistory('Sorry, I couldn\'t understand. Please try again.', false);
    };
    
    recognition.start();
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chat Container - takes 2 columns on large screens */}
      <div className="lg:col-span-2 bg-black bg-opacity-40 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-6 shadow-2xl">
        {/* Chat History */}
        <div className="h-64 lg:h-80 overflow-y-auto mb-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {conversationHistory.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <div className="w-16 h-16 bg-white bg-opacity-5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                </div>
                <p className="text-lg font-medium mb-2">Start a conversation</p>
                <p className="text-sm">Ask me about weather conditions anywhere in the world</p>
              </div>
            </div>
          ) : (
            conversationHistory.map((message) => (
              <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  message.isUser 
                    ? 'bg-white text-black' 
                    : 'bg-gray-800 bg-opacity-50 text-white border border-gray-600'
                }`}>
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${message.isUser ? 'text-gray-600' : 'text-gray-400'}`}>
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))
          )}
          
          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 bg-opacity-50 border border-gray-600 px-4 py-3 rounded-2xl">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-gray-400 text-sm">Analyzing weather data...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Voice Input Section */}
        <div className="flex flex-col items-center space-y-3">
          {/* Live transcript */}
          {(isListening || transcript) && (
            <div className="w-full p-3 bg-gray-900 bg-opacity-50 rounded-lg border border-gray-600">
              <p className="text-xs text-gray-400 mb-1">Listening...</p>
              <p className="text-white text-sm">{transcript || 'Say something...'}</p>
            </div>
          )}

          {/* Voice Button */}
          <button
            onClick={handleMic}
            disabled={loading}
            className={`relative group w-16 h-16 rounded-full transition-all duration-300 transform hover:scale-105 ${
              isListening 
                ? 'bg-red-500 shadow-lg shadow-red-500/30 animate-pulse' 
                : loading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-white hover:bg-gray-100 shadow-lg shadow-white/20'
            }`}
          >
            <div className={`absolute inset-0 rounded-full ${
              isListening ? 'animate-ping bg-red-400 opacity-30' : ''
            }`}></div>
            
            <div className="relative flex items-center justify-center h-full">
              {loading ? (
                <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg 
                  className={`w-6 h-6 ${isListening ? 'text-white' : 'text-black'}`} 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
                </svg>
              )}
            </div>
          </button>

          {/* Status text */}
          <p className="text-center text-xs text-gray-400">
            {isListening 
              ? 'Listening...'
              : loading 
              ? 'Processing...'
              : 'Press to ask'
            }
          </p>
        </div>
      </div>

      {/* Right Sidebar - Weather Info & Quick Actions */}
      <div className="lg:col-span-1 space-y-4">
        {/* Current Weather Display */}
        {response && (
          <div className="bg-gradient-to-r from-gray-900 to-black border border-white border-opacity-10 rounded-2xl p-6 backdrop-blur-lg shadow-2xl">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">{response.location}</h3>
              <div className="text-3xl font-bold text-white mb-2">
                {response.weather.temperature_2m}°C
              </div>
              <div className="flex items-center justify-center space-x-2 text-gray-400 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.002 4.002 0 003 15z" />
                </svg>
                <span>Live Data</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-black bg-opacity-40 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-4 shadow-2xl">
          <h4 className="text-white font-semibold mb-3 text-center">Quick Actions</h4>
          <div className="space-y-2">
            {['Weather in Tokyo', 'Current temperature', 'Weather forecast'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => askWeather(suggestion)}
                disabled={loading}
                className="w-full px-3 py-2 bg-gray-800 bg-opacity-50 border border-gray-600 rounded-lg text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Help Text */}
        <div className="bg-black bg-opacity-20 backdrop-blur-lg border border-white border-opacity-10 rounded-2xl p-4">
          <h4 className="text-white font-semibold mb-2 text-sm">How to use:</h4>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Press the mic button</li>
            <li>• Ask about any location</li>
            <li>• Get instant weather data</li>
            <li>• Voice responses included</li>
          </ul>
        </div>
      </div>
    </div>
  );
}