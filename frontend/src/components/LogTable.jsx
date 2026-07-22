import React from "react";
import { toast } from "react-toastify";
import { deleteLogById } from "../services/api";

const SORTABLE_COLUMNS = [
  { key: "actor", label: "Actor" },
  { key: "role", label: "Role" },
  { key: "severity", label: "Severity" },
  { key: "timestamp", label: "Timestamp" },
];

const SEVERITY_BADGE = {
  LOW: "bg-secondary",
  MEDIUM: "bg-info text-dark",
  HIGH: "bg-warning text-dark",
  CRITICAL: "bg-danger",
};

const STATUS_BADGE = {
  Resolved: "bg-success",
  Unresolved: "bg-danger",
  "In Progress": "bg-warning text-dark",
};

const LogTable = ({ logs, sortBy, order, onSort, onLogDeleted }) => {
  const handleSortClick = (column) => {
    if (sortBy === column) {
      onSort(column, order === "asc" ? "desc" : "asc");
    } else {
      onSort(column, "asc");
    }
  };

  const renderSortIcon = (column) => {
    const isNonSortableActive = SORTABLE_COLUMNS.find((c) => c.key === column);
    if (!isNonSortableActive) return null;
    if (sortBy !== column) return <i className="bi bi-arrow-down-up text-muted ms-1 small"></i>;
    return order === "asc" ? (
      <i className="bi bi-caret-up-fill ms-1"></i>
    ) : (
      <i className="bi bi-caret-down-fill ms-1"></i>
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this log entry?")) return;

    try {
      await deleteLogById(id);
      toast.success("Log deleted successfully");
      if (onLogDeleted) onLogDeleted();
    } catch (error) {
      toast.error(error.message || "Failed to delete log");
    }
  };

  const formatTimestamp = (ts) => {
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return ts;
    }
  };

  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <i className="bi bi-inbox fs-1 d-block mb-2"></i>
        No logs found. Try adjusting your search or filters.
      </div>
    );
  }

  return (
    <div className="table-responsive" style={{ maxHeight: "65vh", overflowY: "auto" }}>
      <table className="table table-hover align-middle mb-0">
        <thead className="table-dark" style={{ position: "sticky", top: 0, zIndex: 1 }}>
          <tr>
            <th
              role="button"
              onClick={() => handleSortClick("actor")}
              className="user-select-none"
            >
              Actor {renderSortIcon("actor")}
            </th>
            <th
              role="button"
              onClick={() => handleSortClick("role")}
              className="user-select-none"
            >
              Role {renderSortIcon("role")}
            </th>
            <th>Action</th>
            <th>Resource</th>
            <th>Resource Type</th>
            <th>IP Address</th>
            <th>Region</th>
            <th
              role="button"
              onClick={() => handleSortClick("severity")}
              className="user-select-none"
            >
              Severity {renderSortIcon("severity")}
            </th>
            <th>Status</th>
            <th
              role="button"
              onClick={() => handleSortClick("timestamp")}
              className="user-select-none"
            >
              Timestamp {renderSortIcon("timestamp")}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, idx) => (
            <tr key={log._id} className={idx % 2 === 0 ? "" : "table-light"}>
              <td className="text-truncate" style={{ maxWidth: "180px" }} title={log.actor}>
                {log.actor}
              </td>
              <td>
                <span className="badge bg-primary-subtle text-primary-emphasis text-capitalize">
                  {log.role}
                </span>
              </td>
              <td>{log.action}</td>
              <td className="text-truncate" style={{ maxWidth: "160px" }} title={log.resource}>
                {log.resource}
              </td>
              <td>{log.resourceType}</td>
              <td>{log.ipAddress}</td>
              <td>{log.region}</td>
              <td>
                <span className={`badge ${SEVERITY_BADGE[log.severity] || "bg-secondary"}`}>
                  {log.severity}
                </span>
              </td>
              <td>
                <span className={`badge ${STATUS_BADGE[log.status] || "bg-secondary"}`}>
                  {log.status}
                </span>
              </td>
              <td className="small">{formatTimestamp(log.timestamp)}</td>
              <td>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(log._id)}
                  title="Delete log"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LogTable;
