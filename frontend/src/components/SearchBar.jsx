import React, { useState, useEffect, useRef } from "react";

const DEBOUNCE_MS = 500;

const SearchBar = ({ onSearch }) => {
  const [value, setValue] = useState("");
  const debounceTimer = useRef(null);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      onSearch(value.trim());
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="input-group">
      <span className="input-group-text bg-transparent">
        <i className="bi bi-search"></i>
      </span>
      <input
        type="text"
        className="form-control"
        placeholder="Search by actor, resource, action, IP, or region..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Search logs"
      />
      {value && (
        <button
          className="btn btn-outline-secondary"
          type="button"
          onClick={() => setValue("")}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default SearchBar;
