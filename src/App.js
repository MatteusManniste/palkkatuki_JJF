import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";
import Hallintapaneeli from "./Hallintapaneeli";
import Etusivu from "./Etusivu";
import Editor from "./Editor";
import Sivu from "./Sivu";
import SivuEditor from "./SivuEditor";
import "./css/App.css";
import Apua from "./Apua";
import Laskuri from "./Laskuri";

function App() {
  return (
    <div className="app-container">
      <Router>
        <div className="container-header">
          <div className="logo-nav"></div>
          <Apua />
        </div>

        <div className="container-content">
          <Routes>
            <Route path="/hallintapaneeli" element={<Hallintapaneeli />} />
            <Route path="/" element={<Etusivu />} />
            <Route path="/editor" element={<Editor />} />
            <Route path="/sivu/:otsikko" element={<Sivu />} />
            <Route path="/sivueditor/:id" element={<SivuEditor />} />
            <Route path="/laskuri" element={<Laskuri />} />
          </Routes>
        </div>

        <div className="container-footer">
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
        </div>
      </Router>
    </div>
  );
}

export default App;
