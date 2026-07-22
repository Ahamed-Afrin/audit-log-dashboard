const express = require("express");
const router = express.Router();

const {
  bulkUploadLogs,
  getLogs,
  getLogById,
  deleteLog,
  getDashboardStats,
} = require("../controllers/logController");

// NOTE: /stats/summary must be declared before /:id so Express does not
// mistake "stats" for an :id param.
router.get("/stats/summary", getDashboardStats);

router.post("/bulk-upload", bulkUploadLogs);
router.get("/", getLogs);
router.get("/:id", getLogById);
router.delete("/:id", deleteLog);

module.exports = router;
