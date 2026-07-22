const mongoose = require("mongoose");
const Log = require("../models/Log");
const { validateBulkLogs } = require("../utils/validators");

/**
 * @desc    Bulk upload log records (supports large arrays, e.g. 10,000 records)
 * @route   POST /api/logs/bulk-upload
 * @access  Public
 */
const bulkUploadLogs = async (req, res, next) => {
  try {
    const records = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body must be a non-empty array of log objects",
      });
    }

    const { validRecords, invalidRecords } = validateBulkLogs(records);

    if (validRecords.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid records found in upload",
        totalReceived: records.length,
        invalidCount: invalidRecords.length,
        sampleErrors: invalidRecords.slice(0, 10),
      });
    }

    let insertedCount = 0;
    let duplicateCount = 0;

    // insertMany with ordered:false lets valid inserts continue past
    // duplicate-key errors, which is efficient for large batches.
    try {
      const result = await Log.insertMany(validRecords, {
        ordered: false,
        rawResult: true,
      });
      insertedCount = result.insertedCount || 0;
      duplicateCount = validRecords.length - insertedCount;
    } catch (bulkError) {
      // Mongo throws BulkWriteError when some documents fail (e.g. duplicate key)
      // while others succeed. We recover the counts from the error object.
      if (bulkError.name === "MongoBulkWriteError" || bulkError.writeErrors) {
        const writeErrors = bulkError.writeErrors || [];
        const duplicateErrors = writeErrors.filter((e) => e.code === 11000);

        duplicateCount = duplicateErrors.length;
        insertedCount = validRecords.length - writeErrors.length;

        // Any non-duplicate write errors are unexpected; surface them
        const otherErrors = writeErrors.filter((e) => e.code !== 11000);
        if (otherErrors.length > 0) {
          console.error("Unexpected bulk write errors:", otherErrors.slice(0, 5));
        }
      } else {
        throw bulkError;
      }
    }

    return res.status(201).json({
      success: true,
      inserted: insertedCount,
      duplicates: duplicateCount,
      invalid: invalidRecords.length,
      totalReceived: records.length,
      ...(invalidRecords.length > 0 && {
        invalidSample: invalidRecords.slice(0, 10),
      }),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Fetch logs with search, filtering, sorting & pagination
 * @route   GET /api/logs
 * @access  Public
 */
const getLogs = async (req, res, next) => {
  try {
    const {
      search,
      role,
      severity,
      status,
      region,
      resourceType,
      sortBy = "timestamp",
      order = "desc",
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    // ---- Server-side search (regex across multiple fields) ----
    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(escapeRegex(search.trim()), "i");
      query.$or = [
        { actor: searchRegex },
        { resource: searchRegex },
        { action: searchRegex },
        { ipAddress: searchRegex },
        { region: searchRegex },
      ];
    }

    // ---- Server-side filtering (supports multiple simultaneous filters) ----
    // Each filter can also accept comma-separated values for multi-select, e.g. role=admin,editor
    if (role) query.role = buildFilterValue(role);
    if (severity) query.severity = buildFilterValue(severity, true);
    if (status) query.status = buildFilterValue(status);
    if (region) query.region = buildFilterValue(region);
    if (resourceType) query.resourceType = buildFilterValue(resourceType, true);

    // ---- Sorting ----
    const allowedSortFields = ["timestamp", "actor", "role", "severity"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "timestamp";
    const sortOrder = order === "asc" ? 1 : -1;

    // ---- Pagination ----
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 500); // cap at 500/page
    const skip = (pageNum - 1) * limitNum;

    const [data, totalRecords] = await Promise.all([
      Log.find(query)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Log.countDocuments(query),
    ]);

    const totalPages = Math.max(Math.ceil(totalRecords / limitNum), 1);

    return res.status(200).json({
      page: pageNum,
      limit: limitNum,
      totalPages,
      totalRecords,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single log by ID
 * @route   GET /api/logs/:id
 * @access  Public
 */
const getLogById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid log ID format" });
    }

    const log = await Log.findById(id).lean();

    if (!log) {
      return res.status(404).json({ success: false, message: "Log not found" });
    }

    return res.status(200).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a log by ID
 * @route   DELETE /api/logs/:id
 * @access  Public
 */
const deleteLog = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid log ID format" });
    }

    const deleted = await Log.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Log not found" });
    }

    return res.status(200).json({ success: true, message: "Log deleted successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get aggregate dashboard statistics (total, severity & status breakdowns)
 * @route   GET /api/logs/stats/summary
 * @access  Public
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const [totalLogs, severityCounts, statusCounts] = await Promise.all([
      Log.countDocuments(),
      Log.aggregate([{ $group: { _id: "$severity", count: { $sum: 1 } } }]),
      Log.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ]);

    const severityMap = severityCounts.reduce((acc, cur) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {});

    const statusMap = statusCounts.reduce((acc, cur) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      data: {
        totalLogs,
        highSeverity: severityMap.HIGH || 0,
        criticalSeverity: severityMap.CRITICAL || 0,
        resolved: statusMap.Resolved || 0,
        unresolved: statusMap.Unresolved || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ---------------- Helper functions ----------------

/**
 * Escapes special regex characters in user-provided search strings
 * to prevent regex injection / invalid pattern errors.
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Builds a Mongo filter value that supports comma-separated multi-select
 * filters, e.g. "HIGH,CRITICAL" -> { $in: ["HIGH", "CRITICAL"] }
 */
function buildFilterValue(rawValue, uppercase = false) {
  const values = rawValue
    .split(",")
    .map((v) => (uppercase ? v.trim().toUpperCase() : v.trim()))
    .filter(Boolean);

  return values.length > 1 ? { $in: values } : values[0];
}

module.exports = {
  bulkUploadLogs,
  getLogs,
  getLogById,
  deleteLog,
  getDashboardStats,
};
