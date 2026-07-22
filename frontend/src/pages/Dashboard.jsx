import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

import SearchBar from "../components/SearchBar";
import FilterPanel from "../components/FilterPanel";
import UploadLogs from "../components/UploadLogs";
import LogTable from "../components/LogTable";
import Pagination from "../components/Pagination";
import Loader from "../components/Loader";
import DashboardCards from "../components/DashboardCards";

import { fetchLogs, fetchDashboardStats } from "../services/api";

const DEFAULT_FILTERS = {
  role: "",
  severity: "",
  status: "",
  region: "",
  resourceType: "",
};

const KNOWN_REGIONS = [
  "us-east-1",
  "us-west-2",
  "eu-west-1",
  "eu-central-1",
  "ap-south-1",
  "ap-southeast-1",
];

const Dashboard = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState("timestamp");
  const [order, setOrder] = useState("desc");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        search: search || undefined,
        ...Object.fromEntries(
          Object.entries(filters).filter(([, v]) => v !== "")
        ),
        sortBy,
        order,
        page,
        limit,
      };

      const result = await fetchLogs(params);
      setLogs(result.data);
      setTotalPages(result.totalPages);
      setTotalRecords(result.totalRecords);
    } catch (err) {
      setError(err.message || "Failed to load logs");
      toast.error(err.message || "Failed to load logs");
    } finally {
      setLoading(false);
    }
  }, [search, filters, sortBy, order, page, limit]);

  const loadStats = useCallback(async () => {
    try {
      const result = await fetchDashboardStats();
      setStats(result.data);
    } catch (err) {
      // Stats failure shouldn't block the rest of the dashboard
      console.error("Failed to load dashboard stats:", err.message);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Reset to page 1 whenever search/filters/sort change
  useEffect(() => {
    setPage(1);
  }, [search, filters, sortBy, order, limit]);

  const handleSort = (column, newOrder) => {
    setSortBy(column);
    setOrder(newOrder);
  };

  const handleUploadSuccess = () => {
    loadLogs();
    loadStats();
  };

  const handleLogDeleted = () => {
    loadLogs();
    loadStats();
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handleExportCSV = () => {
    if (!logs || logs.length === 0) {
      toast.info("No data to export on this page");
      return;
    }

    const headers = [
      "Actor",
      "Role",
      "Action",
      "Resource",
      "Resource Type",
      "IP Address",
      "Region",
      "Severity",
      "Status",
      "Timestamp",
    ];

    const rows = logs.map((log) => [
      log.actor,
      log.role,
      log.action,
      log.resource,
      log.resourceType,
      log.ipAddress,
      log.region,
      log.severity,
      log.status,
      new Date(log.timestamp).toISOString(),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `audit_logs_page_${page}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("CSV exported successfully");
  };

  return (
    <div className="container-fluid py-4">
      <DashboardCards stats={stats} />

      <UploadLogs onUploadSuccess={handleUploadSuccess} />

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-5">
              <SearchBar onSearch={setSearch} />
            </div>
            <div className="col-12 col-md-5">
              <FilterPanel
                filters={filters}
                onFilterChange={setFilters}
                onReset={handleResetFilters}
                availableRegions={KNOWN_REGIONS}
              />
            </div>
            <div className="col-12 col-md-2 d-grid">
              <button className="btn btn-outline-success" onClick={handleExportCSV} type="button">
                <i className="bi bi-download me-1"></i>
                Export CSV
              </button>
            </div>
          </div>

          {loading ? (
            <Loader />
          ) : error ? (
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-circle-fill me-2"></i>
              {error}
            </div>
          ) : (
            <>
              <LogTable
                logs={logs}
                sortBy={sortBy}
                order={order}
                onSort={handleSort}
                onLogDeleted={handleLogDeleted}
              />
              <Pagination
                page={page}
                totalPages={totalPages}
                limit={limit}
                totalRecords={totalRecords}
                onPageChange={setPage}
                onLimitChange={setLimit}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
