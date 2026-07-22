const IP_REGEX =
  /^(25[0-5]|2[0-4]\d|[01]?\d\d?)(\.(25[0-5]|2[0-4]\d|[01]?\d\d?)){3}$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ALLOWED_ROLES = [
  "admin",
  "manager",
  "editor",
  "viewer",
  "system",
  "user"
];
const ALLOWED_SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const ALLOWED_STATUSES = [
  "Resolved",
  "Unresolved",
  "In Progress",
  "SUCCESS",
  "FAILED"
];

const REQUIRED_FIELDS = [
  "actor",
  "role",
  "action",
  "resource",
  "resourceType",
  "ipAddress",
  "region",
  "severity",
  "status",
  "timestamp",
];

/**
 * Validates a single raw log record before it is inserted into MongoDB.
 * Returns { valid: boolean, errors: string[] }
 */
function validateLogRecord(record, index) {
  const errors = [];

  if (!record || typeof record !== "object") {
    return { valid: false, errors: [`Record at index ${index} is not a valid object`] };
  }

  REQUIRED_FIELDS.forEach((field) => {
    if (
      record[field] === undefined ||
      record[field] === null ||
      record[field] === ""
    ) {
      errors.push(`Record at index ${index}: missing required field "${field}"`);
    }
  });

  if (errors.length > 0) {
    // If required fields are missing, skip deeper format checks
    return { valid: false, errors };
  }

  if (record.actor.includes("@") && !EMAIL_REGEX.test(record.actor)) {
    errors.push(`Record at index ${index}: "actor" is not a valid email`);
  }

  if (!IP_REGEX.test(record.ipAddress)) {
    errors.push(`Record at index ${index}: "ipAddress" is not a valid IP address`);
  }

  if (!ALLOWED_ROLES.includes(record.role)) {
    errors.push(`Record at index ${index}: "role" must be one of ${ALLOWED_ROLES.join(", ")}`);
  }

  if (!ALLOWED_SEVERITIES.includes(String(record.severity).toUpperCase())) {
    errors.push(
      `Record at index ${index}: "severity" must be one of ${ALLOWED_SEVERITIES.join(", ")}`
    );
  }

  if (!ALLOWED_STATUSES.includes(record.status)) {
    errors.push(`Record at index ${index}: "status" must be one of ${ALLOWED_STATUSES.join(", ")}`);
  }

  const parsedDate = new Date(record.timestamp);
  if (isNaN(parsedDate.getTime())) {
    errors.push(`Record at index ${index}: "timestamp" is not a valid date`);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates an entire array of log records for bulk upload.
 * Returns { validRecords: [], invalidRecords: [{index, errors}] }
 */
function validateBulkLogs(records) {
  const validRecords = [];
  const invalidRecords = [];

  records.forEach((record, index) => {
    const { valid, errors } = validateLogRecord(record, index);
    if (valid) {
      validRecords.push({
        ...record,
        action: record.action.toUpperCase(),
        resourceType: record.resourceType.toUpperCase(),
        severity: String(record.severity).toUpperCase(),
        timestamp: new Date(record.timestamp),
      });
    } else {
      invalidRecords.push({ index, errors });
    }
  });

  return { validRecords, invalidRecords };
}

module.exports = {
  validateLogRecord,
  validateBulkLogs,
  ALLOWED_ROLES,
  ALLOWED_SEVERITIES,
  ALLOWED_STATUSES,
};
