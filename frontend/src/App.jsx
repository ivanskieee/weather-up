import VoiceWeather from './components/VoiceWeather';
function App() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-xl w-full text-center">
        <h1 className="text-4xl font-bold mb-2">Weather-Up</h1>
        <p className="text-gray-400 mb-8">Ask about the weather using your voice</p>
        <VoiceWeather />
      </div>
    </div>
  );
}

export default App;
