import React, { useState, useEffect } from 'react';

const Weather = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

  // 1. PWA Logic: Install Button
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    }
  };

  // 2. Dynamic Background Logic: Changes the sky color based on Temp
  useEffect(() => {
    if (weather) {
      const temp = weather.main.temp;
      if (temp > 28) {
        document.body.style.background = 'linear-gradient(135deg, #f83600 0%, #f9d423 100%)'; // Hot
      } else if (temp < 10) {
        document.body.style.background = 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)'; // Cold
      } else {
        document.body.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'; // Mild
      }
    } else {
      document.body.style.background = 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'; // Default
    }
  }, [weather]);

  // 3. Prioritized Prescription Logic (Fixes the "Stuck on Grey" issue)
  const getPrescription = (temp, condition) => {
    const desc = condition.toLowerCase();

    if (desc.includes("rain") || desc.includes("drizzle") || desc.includes("thunderstorm")) {
      return "It's raining! Keep your umbrella close and stay dry. ☔";
    } 
    if (temp > 32) {
      return "Heat warning! Seek shade and drink plenty of water. 🥵";
    }
    if (temp < 5) {
      return "It's freezing! Layer up with a heavy coat and scarf. 🧣";
    }
    if (desc.includes("snow")) {
      return "Snow is falling! Wear boots and enjoy the view. ❄️";
    }
    if (desc.includes("cloud")) {
      return "A bit cloudy today. Perfect for a cozy cafe visit! ☁️";
    }
    if (temp > 20 && desc.includes("clear")) {
      return "Sun's out! Great weather for a walk or the park. ☀️";
    }
    
    return "The weather is mild. Have a fantastic day! ✨";
  };

  const fetchWeather = async (e) => {
    e.preventDefault();
    const searchCity = city.trim();
    if (!searchCity) return;

    try {
      setLoading(true);
      setError('');
      if (document.activeElement) document.activeElement.blur();

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&units=metric&appid=${apiKey}`
      );
      
      if (!response.ok) throw new Error(response.status === 404 ? 'City not found' : 'Fetch failed');
      
      const data = await response.json();
      setWeather(data);
      setCity(''); 
    } catch (err) {
      setError(err.message);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="weather-container">
      {deferredPrompt && (
        <button className="install-button" onClick={handleInstallClick} 
          style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid white', marginBottom: '20px', padding: '8px 15px', borderRadius: '10px', cursor: 'pointer' }}>
          ➕ Install App
        </button>
      )}

      <form onSubmit={fetchWeather}>
        <input 
          type="text" 
          placeholder="Search City..." 
          value={city}
          onChange={(e) => setCity(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching' : 'Search'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {weather && !loading && (
        <div className="weather-info">
          <h2>{weather.name}, {weather.sys?.country}</h2>
          
          <div className="temp">
            {Math.round(weather.main?.temp)}°
          </div>

          <p className="description">{weather.weather?.[0]?.description}</p>

          <div className="prescription-box">
            {getPrescription(weather.main?.temp, weather.weather?.[0]?.description)}
          </div>

          <div className="details">
            <div className="detail-item">
              <small>HUMIDITY</small>
              <div>{weather.main?.humidity}%</div>
            </div>
            <div className="detail-item">
              <small>WIND</small>
              <div>{weather.wind?.speed} m/s</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather;