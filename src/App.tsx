import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import './App.css';
import ListPage from './pages/HomePage'; // ListPage is HomePage
import GalleryPage from './pages/GalleryPage';
import DetailPage from './pages/DetailPage';

const App: React.FC = () => {
  return (
    <Router basename="/mp2">
      <div className="App">
        <header className="App-header">
          <div className="header-content">
            <h1 className="app-title">🏎️ F1 Racing Hub</h1>
            <nav className="App-nav">
              <NavLink to="/" className="nav-link" end>Drivers</NavLink>
              <NavLink to="/gallery" className="nav-link">Teams</NavLink>
            </nav>
          </div>
        </header>
        <main className="App-main">
          <Routes>
            <Route path="/" element={<ListPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/driver/:driverNumber" element={<DetailPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
