import { Router } from "express";
import Application, {
  STATUSES,
  ROUND_STATUSES,
  SOURCES,
} from "../models/Application.js";
import { buildAnalytics } from "../utils/analytics.js";

const router = Router();

router.get("/meta", (_req, res) => {
  res.json({
    statuses: STATUSES,
    roundStatuses: ROUND_STATUSES,
    sources: SOURCES,
  });
});

router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      const q = new RegExp(req.query.search, "i");
      filter.$or = [{ company: q }, { role: q }, { notes: q }];
    }
    const apps = await Application.find(filter).sort({ updatedAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/analytics", async (_req, res) => {
  try {
    const apps = await Application.find().lean();
    res.json(buildAnalytics(apps));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ message: "Not found" });
    res.json(app);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const app = await Application.create(req.body);
    res.status(201).json(app);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const app = await Application.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!app) return res.status(404).json({ message: "Not found" });
    res.json(app);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const app = await Application.findByIdAndDelete(req.params.id);
    if (!app) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
