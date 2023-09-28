import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Hallintapaneeli from './Hallintapaneeli';
import Etusivu from './Etusivu';
import Editor from './Editor';
import Sivu from './Sivu';
import SivuEditor from './SivuEditor';

function App() {
  return (
    <Router>
      <nav>
        <ul>
          <li>
            <NavLink to="/">Etusivu</NavLink>
          </li>
          <li>
            <NavLink to="/hallintapaneeli">Hallintapaneeli</NavLink>
          </li>
        </ul>
      </nav>
      
      <Routes>
        <Route path="/hallintapaneeli" element={<Hallintapaneeli />} />
        <Route path="/" element={<Etusivu />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/sivu/:otsikko" element={<Sivu />} />
        <Route path="/sivueditor/:id" element={<SivuEditor />} />
      </Routes>
    </Router>
  );
}

export default App;
