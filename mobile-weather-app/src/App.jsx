import React from 'react';
import Weather from './weather.jsx'; // Importing the file we just made
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Weather App</h1>
      </header>
      <main>
        {/* We call the component like a custom HTML tag */}
        <Weather />
      </main>
    </div>
  );
}

export default App;