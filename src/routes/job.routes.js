import { Router } from "express";
import { JobController } from "../controllers/job.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { authorizeJobOwner } from "../middleware/authorizeResource.js";
import { upload } from "../middleware/upload.js";
import { validateJob } from "../middleware/validate.js";

const router = Router();

// Public: list all jobs, details, apply
router.get("/jobs", JobController.list);
router.get("/job/:id", JobController.details);
router.post("/apply/:id", upload.single("resume"), JobController.apply);
// Job seeker: My Applications
router.get("/seeker/applications", JobController.myApplications);

// Recruiter-only pages
router.get("/postjob", requireAuth, JobController.renderNew);
router.post(
  "/job",
  requireAuth,
  upload.single("logo"),
  validateJob,
  JobController.create
);

router.get(
  "/job/update/:id",
  requireAuth,
  authorizeJobOwner,
  JobController.renderUpdate
);
router.post(
  "/job/update/:id",
  requireAuth,
  authorizeJobOwner,
  upload.single("logo"),
  validateJob,
  JobController.update
);

router.get(
  "/job/delete/:id",
  requireAuth,
  authorizeJobOwner,
  JobController.remove
);

// Applicants view & API
router.get(
  "/job/applicants/:id",
  requireAuth,
  authorizeJobOwner,
  JobController.applicantsView
);
router.get(
  "/jobs/:id/applicants",
  requireAuth,
  authorizeJobOwner,
  JobController.getApplicants
);

// REST JSON API (additional)
router.get("/api/jobs", JobController.apiList);
router.get("/api/jobs/:id", JobController.apiGetOne);
router.post("/api/jobs", requireAuth, JobController.apiCreate);
router.put("/api/jobs/:id", requireAuth, JobController.apiUpdate);
router.delete("/api/jobs/:id", requireAuth, JobController.apiDelete);

export default router;
