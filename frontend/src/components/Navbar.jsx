import React from "react";

const Navbar = ({ darkMode, onToggleDarkMode }) => {
  return (
    <nav className={`navbar navbar-expand-lg shadow-sm px-3 ${darkMode ? "navbar-dark bg-dark" : "navbar-light bg-white"}`}>
      <div className="container-fluid">
        <span className="navbar-brand fw-bold d-flex align-items-center gap-2">
          <i className="bi bi-shield-lock-fill text-primary"></i>
          Audit Log Dashboard
        </span>

        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className={`btn btn-sm ${darkMode ? "btn-outline-light" : "btn-outline-dark"}`}
            onClick={onToggleDarkMode}
            aria-label="Toggle dark mode"
          >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
