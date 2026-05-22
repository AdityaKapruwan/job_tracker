import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import applicationsRouter from "./routes/applications.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/applications", applicationsRouter);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/job-tracker")
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
