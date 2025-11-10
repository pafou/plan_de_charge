import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import List from './components/List';
import Show from './components/Show';
import Modif from './components/Modif';
import Insert from './components/Insert';

// Déclare le composant Home
function Home() {
  return <h2>Home Page</h2>;
}

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>plan de charge</h1>
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
        </Routes>
      </div>
    </Router>
  );
}

// Exporte App par défaut
export default App;
