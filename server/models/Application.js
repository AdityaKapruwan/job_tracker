import mongoose from "mongoose";

export const STATUSES = [
  "Applied",
  "Screening",
  "Interview",
  "Offer",
  "Rejected",
  "Ghosted",
  "Withdrawn",
];

export const ROUND_STATUSES = [
  "Pending",
  "Scheduled",
  "Completed",
  "Passed",
  "Failed",
];

export const SOURCES = [
  "LinkedIn",
  "Handshake",
  "Referral",
  "Company Site",
  "Career Fair",
  "Other",
];

const roundSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ROUND_STATUSES,
      default: "Pending",
    },
    scheduledDate: { type: Date },
    notes: { type: String, trim: true },
  },
  { _id: true }
);

const applicationSchema = new mongoose.Schema(
  {
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: STATUSES,
      default: "Applied",
    },
    appliedDate: { type: Date, default: Date.now },
    deadline: { type: Date },
    followUpDate: { type: Date },
    location: { type: String, trim: true },
    jobUrl: { type: String, trim: true },
    salary: { type: String, trim: true },
    notes: { type: String, trim: true },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    source: {
      type: String,
      enum: SOURCES,
      default: "Other",
    },
    expectedRounds: { type: Number, min: 0, default: 0 },
    rounds: { type: [roundSchema], default: [] },
  },
  { timestamps: true }
);

export function getRoundProgress(rounds = []) {
  const passed = rounds.filter((r) => r.status === "Passed").length;
  const failed = rounds.filter((r) => r.status === "Failed").length;
  const pending = rounds.filter((r) =>
    ["Pending", "Scheduled"].includes(r.status)
  ).length;
  const done = rounds.filter((r) =>
    ["Passed", "Failed", "Completed"].includes(r.status)
  ).length;
  const next = rounds.find((r) =>
    ["Pending", "Scheduled"].includes(r.status)
  );
  return {
    total: rounds.length,
    passed,
    failed,
    pending,
    done,
    nextRound: next?.name || null,
    nextDate: next?.scheduledDate || null,
  };
}

export default mongoose.model("Application", applicationSchema);
