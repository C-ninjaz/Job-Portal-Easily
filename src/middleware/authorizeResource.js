import { JobModel } from "../models/job.model.js";

export function authorizeJobOwner(req, res, next) {
  const job = JobModel.findById(req.params.id);
  if (!job) return res.status(404).render("404");
  if (!req.session.user || job.recruiterId !== req.session.user.id) {
    return res.status(403).send("Forbidden");
  }
  next();
}
