const mongoose = require("mongoose");

const IP_REGEX =
  /^(25[0-5]|2[0-4]\d|[01]?\d\d?)(\.(25[0-5]|2[0-4]\d|[01]?\d\d?)){3}$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const logSchema = new mongoose.Schema(
  {
    actor: {
      type: String,
      required: [true, "Actor is required"],
      trim: true,
      validate: {
        validator: function (value) {
          // Actor is typically an email in this system; allow non-email
          // service accounts (e.g. "system") but still enforce format
          // when an "@" is present.
          if (value.includes("@")) {
            return EMAIL_REGEX.test(value);
          }
          return value.length > 0;
        },
        message: (props) => `${props.value} is not a valid actor identifier`,
      },
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      trim: true,
      enum: {
        values: ["admin", "manager", "editor", "viewer", "system"],
        message: "{VALUE} is not a supported role",
      },
    },
    action: {
      type: String,
      required: [true, "Action is required"],
      trim: true,
      uppercase: true,
    },
    resource: {
      type: String,
      required: [true, "Resource is required"],
      trim: true,
    },
    resourceType: {
      type: String,
      required: [true, "Resource type is required"],
      trim: true,
      uppercase: true,
    },
    ipAddress: {
      type: String,
      required: [true, "IP address is required"],
      trim: true,
      validate: {
        validator: function (value) {
          return IP_REGEX.test(value);
        },
        message: (props) => `${props.value} is not a valid IP address`,
      },
    },
    region: {
      type: String,
      required: [true, "Region is required"],
      trim: true,
    },
    severity: {
      type: String,
      required: [true, "Severity is required"],
      enum: {
        values: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
        message: "{VALUE} is not a supported severity level",
      },
      uppercase: true,
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: {
        values: ["Resolved", "Unresolved", "In Progress"],
        message: "{VALUE} is not a supported status",
      },
    },
    timestamp: {
      type: Date,
      required: [true, "Timestamp is required"],
    },
  },
  {
    timestamps: true, // adds createdAt / updatedAt
  }
);

// Unique-ish compound index used to detect duplicate log entries during
// bulk ingestion (same actor performing the same action on the same
// resource at the same instant is considered a duplicate record).
logSchema.index(
  { actor: 1, action: 1, resource: 1, timestamp: 1 },
  { unique: true, name: "unique_log_signature" }
);

// Individual indexes to speed up filtering / sorting per requirements
logSchema.index({ actor: 1 });
logSchema.index({ role: 1 });
logSchema.index({ severity: 1 });
logSchema.index({ status: 1 });
logSchema.index({ timestamp: -1 });
logSchema.index({ resourceType: 1 });
logSchema.index({ region: 1 });

// Text-friendly indexes for regex search fields (regex on indexed fields
// still benefits from anchored patterns; these keep field-scoped lookups fast)
logSchema.index({ resource: 1 });
logSchema.index({ ipAddress: 1 });

module.exports = mongoose.model("Log", logSchema, "logs");
