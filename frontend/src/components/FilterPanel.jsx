import React from "react";

const ROLES = ["admin", "manager", "editor", "viewer", "system"];
const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const STATUSES = ["Resolved", "Unresolved", "In Progress"];
const RESOURCE_TYPES = ["USER", "ORDER", "PAYMENT", "FILE", "SETTINGS", "AUTH"];

const FilterPanel = ({ filters, onFilterChange, onReset, availableRegions = [] }) => {
  const handleChange = (field) => (e) => {
    onFilterChange({ ...filters, [field]: e.target.value });
  };

  return (
    <div className="row g-2 align-items-center">
      <div className="col-12 col-md-2">
        <select
          className="form-select form-select-sm"
          value={filters.role}
          onChange={handleChange("role")}
          aria-label="Filter by role"
        >
          <option value="">All Roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div className="col-12 col-md-2">
        <select
          className="form-select form-select-sm"
          value={filters.severity}
          onChange={handleChange("severity")}
          aria-label="Filter by severity"
        >
          <option value="">All Severities</option>
          {SEVERITIES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="col-12 col-md-2">
        <select
          className="form-select form-select-sm"
          value={filters.status}
          onChange={handleChange("status")}
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="col-12 col-md-2">
        <select
          className="form-select form-select-sm"
          value={filters.resourceType}
          onChange={handleChange("resourceType")}
          aria-label="Filter by resource type"
        >
          <option value="">All Resource Types</option>
          {RESOURCE_TYPES.map((rt) => (
            <option key={rt} value={rt}>
              {rt}
            </option>
          ))}
        </select>
      </div>

      <div className="col-12 col-md-2">
        <select
          className="form-select form-select-sm"
          value={filters.region}
          onChange={handleChange("region")}
          aria-label="Filter by region"
        >
          <option value="">All Regions</option>
          {availableRegions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div className="col-12 col-md-2 d-grid">
        <button className="btn btn-sm btn-outline-danger" onClick={onReset} type="button">
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
