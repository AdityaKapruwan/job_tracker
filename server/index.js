import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import applicationsRouter from "./routes/applications.js";

const app = express();
const PORT = process.env.PORT || 8000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDistPath = path.resolve(__dirname, "../client/dist");

app.use(cors());
app.use(express.json());
app.use("/api/applications", applicationsRouter);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use(express.static(clientDistPath));

app.get("*", (_req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
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
