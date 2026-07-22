import React from "react";

const CARD_CONFIG = [
  { key: "totalLogs", label: "Total Logs", color: "primary", icon: "bi-list-columns-reverse" },
  { key: "highSeverity", label: "High Severity", color: "warning", icon: "bi-exclamation-triangle-fill" },
  { key: "criticalSeverity", label: "Critical Logs", color: "danger", icon: "bi-fire" },
  { key: "resolved", label: "Resolved", color: "success", icon: "bi-check-circle-fill" },
  { key: "unresolved", label: "Unresolved", color: "secondary", icon: "bi-hourglass-split" },
];

const DashboardCards = ({ stats }) => {
  return (
    <div className="row g-3 mb-4">
      {CARD_CONFIG.map(({ key, label, color, icon }) => (
        <div className="col-6 col-md-4 col-lg" key={key}>
          <div className={`card border-0 shadow-sm h-100 border-start border-${color} border-4`}>
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <p className="text-muted mb-1 small text-uppercase">{label}</p>
                <h4 className="mb-0 fw-bold">
                  {stats ? (stats[key] ?? 0).toLocaleString() : "—"}
                </h4>
              </div>
              <i className={`bi ${icon} text-${color} fs-2`}></i>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;
