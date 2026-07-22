import React, { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import "./App.css";

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", darkMode ? "dark" : "light");
    document.body.classList.toggle("bg-dark", darkMode);
    document.body.classList.toggle("text-light", darkMode);
  }, [darkMode]);

  return (
    <div className={darkMode ? "min-vh-100 bg-dark text-light" : "min-vh-100 bg-light"}>
      <Navbar darkMode={darkMode} onToggleDarkMode={() => setDarkMode((d) => !d)} />
      <Dashboard />
      <ToastContainer position="top-right" autoClose={3000} theme={darkMode ? "dark" : "light"} />
    </div>
  );
}

export default App;
