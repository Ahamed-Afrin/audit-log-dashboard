import React from "react";

const Pagination = ({ page, totalPages, limit, totalRecords, onPageChange, onLimitChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-3">
      <div className="text-muted small">
        Showing page {page} of {totalPages} ({totalRecords.toLocaleString()} total records)
      </div>

      <nav aria-label="Log pagination">
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
              Previous
            </button>
          </li>

          {getPageNumbers()[0] > 1 && (
            <li className="page-item disabled">
              <span className="page-link">…</span>
            </li>
          )}

          {getPageNumbers().map((p) => (
            <li key={p} className={`page-item ${p === page ? "active" : ""}`}>
              <button className="page-link" onClick={() => onPageChange(p)}>
                {p}
              </button>
            </li>
          ))}

          {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
            <li className="page-item disabled">
              <span className="page-link">…</span>
            </li>
          )}

          <li className={`page-item ${page >= totalPages ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>

      <div className="d-flex align-items-center gap-2">
        <label htmlFor="rowsPerPage" className="small text-muted mb-0">
          Rows per page:
        </label>
        <select
          id="rowsPerPage"
          className="form-select form-select-sm"
          style={{ width: "80px" }}
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
        >
          {[10, 20, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Pagination;
