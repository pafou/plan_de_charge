import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import List from './components/List';
import Show from './components/Show';
import Modif from './components/Modif';
import Insert from './components/Insert';

// Déclare le composant Home
import UserSelect from './components/UserSelect';

function Home() {
  const token = localStorage.getItem('jwtToken');
  const decodedToken = token ? JSON.parse(atob(token.split('.')[1])) : null;
  const userId = decodedToken ? decodedToken.userId : '';

  useEffect(() => {
    if (userId) {
      document.title = `Plan de charge - User: ${userId}`;
    } else {
      document.title = 'Plan de charge';
    }
  }, [userId]);

  return (
    <div>
      <h2>Home Page - User: {userId}</h2>
      <UserSelect />
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      setUser(decodedToken.userId);
      document.title = `Plan de charge - User: ${decodedToken.userId}`;
    } else {
      setUser(null);
      document.title = 'Plan de charge';
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Plan de charge - User: {user}</h1>
          <nav className="banner">
            <Link to="/" className="banner-button">Home</Link>
            <Link to="/show" className="banner-button">Show</Link>
            <Link to="/modif" className="banner-button">Modif</Link>
            <Link to="/list" className="banner-button">List_all</Link>
            <Link to="/insert" className="banner-button">Insert</Link>
          </nav>
        </header>
        <Routes>
          <Route path="/" element={<Home />} />
        <Route path="/show" element={<Show />} />
        <Route path="/modif" element={<Modif />} />
        <Route path="/list" element={<List />} />
        <Route path="/insert" element={<Insert />} />
        <Route path="*" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

// Exporte App par défaut
export default App;
