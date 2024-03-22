import React from "react";
import {
  BrowserRouter as Router,
} from "react-router-dom";

import "./css/App.css";
import Apua from "./Apua";
import { AuthProvider } from "./backend/AuthWrapper";
import AppRoutes from "./AppRoutes";
import AppLinks from "./AppLinks";

function App() {
  return (
    <AuthProvider>
      <div className="app-container">
        <Router>
          <div className="container-header">
            <div className="logo-nav">
              <img className="logo" src="/yrityssalo-logo.png" alt="yrityssalo logo"></img>
              <Apua />
            </div>
          </div>

          <div className="container-content">
            <AppRoutes />
          </div>

          <div className="container-footer">
            <nav>
              <AppLinks />
            </nav>
          </div>
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;
