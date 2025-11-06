import dayjs from "dayjs";
import { JobModel } from "../models/job.model.js";
import { sendApplicationEmail } from "../utils/mailer.js";

function parseSkills(skills) {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills;
  // comma-separated
  return String(skills)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export const JobController = {
  // View: list jobs
  list(req, res) {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const q = String(req.query.q || "");
    const date = req.query.date; // '24h' | '3d' | 'week' | 'month'
    const levels = Array.isArray(req.query.levels)
      ? req.query.levels
      : req.query.levels
      ? String(req.query.levels).split(",")
      : [];
    const types = Array.isArray(req.query.types)
      ? req.query.types
      : req.query.types
      ? String(req.query.types).split(",")
      : [];
    const loc = String(req.query.loc || "").toLowerCase();
    const sort = String(req.query.sort || "recent");

    const { data: all } = JobModel.getAll({ q, page: 1, limit: 10000 });

    function withinRange(jobPosted) {
      if (!date) return true;
      const d = dayjs(jobPosted);
      const now = dayjs();
      const hasTimeComponent =
        typeof jobPosted === "string" && jobPosted.length > 10;
      const ref = hasTimeComponent ? d : d.endOf("day");
      switch (date) {
        case "24h":
          return ref.isAfter(now.subtract(24, "hour"));
        case "3d":
          return ref.isAfter(now.subtract(3, "day"));
        case "week":
          return ref.isAfter(now.subtract(7, "day"));
        case "month":
          return ref.isAfter(now.subtract(30, "day"));
        default:
          return true;
      }
    }

    let filtered = all.filter((j) => {
      const okDate = withinRange(j.job_posted);
      const okLevel = levels.length
        ? j.experience && levels.includes(j.experience)
        : true;
      const okType = types.length
        ? j.job_type && types.includes(j.job_type)
        : true;
      const okLoc = loc
        ? (() => {
            const city = (j.job_location || "").toLowerCase();
            if (!city) return false;
            if (loc === "india" || loc === "bharat") return true;
            return city.includes(loc);
          })()
        : true;
      return okDate && okLevel && okType && okLoc;
    });

    function parseSalaryToNumber(s) {
      if (!s) return 0;
      const cleaned = String(s)
        .replace(/[^0-9\-–.\s]/g, "")
        .trim();
      const parts = cleaned.split(/[\-–]/).map((x) => parseFloat(x.trim()));
      if (parts.length === 1 && !isNaN(parts[0])) return parts[0];
      const nums = parts.filter((n) => !isNaN(n));
      if (nums.length === 0) return 0;
      return Math.max(...nums);
    }

    if (sort === "salary-high") {
      filtered.sort(
        (a, b) => parseSalaryToNumber(b.salary) - parseSalaryToNumber(a.salary)
      );
    } else if (sort === "salary-low") {
      filtered.sort(
        (a, b) => parseSalaryToNumber(a.salary) - parseSalaryToNumber(b.salary)
      );
    } else if (sort === "relevant") {
      const term = q.toLowerCase();
      filtered.sort((a, b) => {
        const at = [
          a.job_designation,
          a.company_name,
          ...(a.skills_required || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        const bt = [
          b.job_designation,
          b.company_name,
          ...(b.skills_required || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        const as = term ? (at.includes(term) ? 0 : 1) : 0;
        const bs = term ? (bt.includes(term) ? 0 : 1) : 0;
        if (as !== bs) return as - bs;
        return dayjs(b.job_posted).valueOf() - dayjs(a.job_posted).valueOf();
      });
    } else {
      filtered.sort(
        (a, b) => dayjs(b.job_posted).valueOf() - dayjs(a.job_posted).valueOf()
      );
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    const jobs = data.map((j) => ({
      id: j.id,
      job_designation: j.job_designation,
      company_name: j.company_name,
      job_location: j.job_location,
      experience: j.experience || "0-1 yrs",
      salary: j.salary || "—",
      employees: j.employees || "— employees",
      job_posted: j.job_posted || dayjs().format("YYYY-MM-DD"),
      skills_required: j.skills_required || [],
      logo: j.logo
        ? `${j.logo.startsWith("/") ? j.logo : "/" + j.logo}`
        : "/images/google.png",
      featured: j.featured || false,
    }));

    res.render("list-all-jobs", {
      title: "All Jobs",
      jobs,
      pagination: { total, page, limit },
      q,
      filters: { date, levels, types, loc, sort },
    });
  },

  // View: new job page
  renderNew(req, res) {
    res.render("new-job", { title: "Post Job" });
  },

  // Create job
  create(req, res) {
    const {
      job_category,
      job_designation,
      job_location,
      company_name,
      company_founded,
      employees,
      salary,
      number_of_openings,
      apply_by,
      experience,
      job_type,
      skills_required,
    } = req.body;

    // Basic validation
    if (
      !job_category ||
      !job_designation ||
      !job_location ||
      !company_name ||
      !salary
    ) {
      return res.status(400).send("Missing required fields");
    }
    const logo = req.file ? `uploads/${req.file.filename}` : null;
    const job = JobModel.create({
      recruiterId: req.session.user.id,
      job_category,
      job_designation,
      job_location,
      company_name,
      company_founded,
      employees,
      salary,
      number_of_openings: Number(number_of_openings || 1),
      apply_by,
      experience,
      job_type,
      skills_required: parseSkills(skills_required),
      logo,
    });
    res.redirect(`/job/${job.id}`);
  },

  // View: job details
  details(req, res) {
    const job = JobModel.findById(req.params.id);
    if (!job) return res.status(404).render("404");
    const data = {
      ...job,
      company_description:
        job.company_description ||
        "Easily connects talented professionals with top companies. We value innovation and growth.",
      company_founded: job.company_founded || "—",
      employees: job.employees || "— employees",
      // job-details.ejs uses "/<%= data.logo %>" so pass path without leading slash
      logo: job.logo
        ? job.logo.startsWith("/")
          ? job.logo.slice(1)
          : job.logo
        : "images/google.png",
      apply_by: job.apply_by || dayjs().add(14, "day").format("YYYY-MM-DD"),
      number_of_openings: job.number_of_openings || 1,
      experience: job.experience || "0-1 yrs",
    };
    res.render("job-details", { title: job.job_designation, data });
  },

  // View: update job form
  renderUpdate(req, res) {
    const job = JobModel.findById(req.params.id);
    if (!job) return res.status(404).render("404");
    if (job.recruiterId !== req.session.user.id)
      return res.status(403).send("Forbidden");
    res.render("update-job", { title: "Update Job", job });
  },

  // Update job
  update(req, res) {
    const job = JobModel.findById(req.params.id);
    if (!job) return res.status(404).render("404");
    if (job.recruiterId !== req.session.user.id)
      return res.status(403).send("Forbidden");
    const fields = { ...req.body };
    fields.number_of_openings = Number(
      fields.number_of_openings || job.number_of_openings
    );
    fields.skills_required =
      parseSkills(fields.skills_required) || job.skills_required;
    if (req.file) fields.logo = `uploads/${req.file.filename}`;
    JobModel.update(job.id, fields);
    res.redirect(`/job/${job.id}`);
  },

  // Delete job
  remove(req, res) {
    const job = JobModel.findById(req.params.id);
    if (!job) return res.status(404).render("404");
    if (job.recruiterId !== req.session.user.id)
      return res.status(403).send("Forbidden");
    JobModel.remove(job.id);
    res.redirect("/jobs");
  },

  // Applicants view
  applicantsView(req, res) {
    const job = JobModel.findById(req.params.id);
    if (!job) return res.status(404).render("404");
    if (job.recruiterId !== req.session.user.id)
      return res.status(403).send("Forbidden");
    const { data: allApplicants } = JobModel.getApplicants(job.id, {
      page: 1,
      limit: 50,
    });
    res.render("all-applicants", { title: "Applicants", allApplicants, job });
  },

  // Applicants API (optional extra endpoints)
  getApplicants(req, res) {
    const job = JobModel.findById(req.params.id);
    if (!job) return res.status(404).json([]);
    const { data, total } = JobModel.getApplicants(job.id, {
      page: Number(req.query.page || 1),
      limit: Number(req.query.limit || 10),
    });
    res.json({ data, total });
  },

  // Apply to job
  async apply(req, res) {
    const jobId = req.params.id;
    const job = JobModel.findById(jobId);
    if (!job) return res.status(404).render("404");
    const { name, email, contact } = req.body;
    if (!name || !email || !contact)
      return res.status(400).send("Missing fields");
    const resumePath = req.file ? `uploads/${req.file.filename}` : null;
    JobModel.addApplicant(jobId, {
      name,
      email,
      contact,
      resumePath,
      applied_at: dayjs().format("YYYY-MM-DD"),
      status: "Submitted",
    });
    try {
      await sendApplicationEmail({
        to: email,
        job,
        applicant: { name, email },
      });
    } catch (e) {
      // Non-fatal in dev
      console.error("Email send failed", e.message);
    }
    res.redirect(`/job/${jobId}`);
  },
  // List applications for the logged-in seeker (by session email)
  myApplications(req, res) {
    const user = req.session.user;
    if (!user) return res.redirect("/seeker/login");
    const email = String(user.email || "").toLowerCase();
    const q = String(req.query.q || "").toLowerCase();
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);

    const { data: allJobs } = JobModel.getAll({ page: 1, limit: 10000 });
    let applications = [];
    for (const j of allJobs) {
      for (const a of j.applicants || []) {
        if (String(a.email || "").toLowerCase() === email) {
          applications.push({
            jobId: j.id,
            job_designation: j.job_designation,
            company_name: j.company_name,
            job_location: j.job_location,
            salary: j.salary,
            status: a.status || "Submitted",
            applied_at: a.applied_at || j.job_posted,
            resumePath: a.resumePath ? `/${a.resumePath}` : null,
            logo: j.logo ? `/${j.logo}` : "/images/google.png",
          });
        }
      }
    }

    if (q) {
      applications = applications.filter((a) => {
        const t = `${a.job_designation} ${a.company_name}`.toLowerCase();
        return t.includes(q);
      });
    }

    applications.sort(
      (a, b) => dayjs(b.applied_at).valueOf() - dayjs(a.applied_at).valueOf()
    );

    const total = applications.length;
    const start = (page - 1) * limit;
    const paged = applications.slice(start, start + limit);

    res.render("seeker-applications", {
      title: "My Applications",
      applications: paged,
      q: req.query.q || "",
      pagination: { page, limit, total },
    });
  },
  // REST JSON endpoints
  apiList(req, res) {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const q = req.query.q || "";
    const { data, total } = JobModel.getAll({ q, page, limit });
    res.json({ data, total, page, limit });
  },
  apiGetOne(req, res) {
    const job = JobModel.findById(req.params.id);
    if (!job) return res.status(404).json({ error: "Not found" });
    res.json(job);
  },
  apiCreate(req, res) {
    if (!req.session.user)
      return res.status(401).json({ error: "Unauthorized" });
    const fields = { ...req.body };
    fields.recruiterId = req.session.user.id;
    fields.skills_required = Array.isArray(fields.skills_required)
      ? fields.skills_required
      : (fields.skills_required || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
    const job = JobModel.create(fields);
    res.status(201).json(job);
  },
  apiUpdate(req, res) {
    const job = JobModel.findById(req.params.id);
    if (!job) return res.status(404).json({ error: "Not found" });
    if (!req.session.user || job.recruiterId !== req.session.user.id)
      return res.status(403).json({ error: "Forbidden" });
    const updated = JobModel.update(job.id, req.body);
    res.json(updated);
  },
  apiDelete(req, res) {
    const job = JobModel.findById(req.params.id);
    if (!job) return res.status(404).json({ error: "Not found" });
    if (!req.session.user || job.recruiterId !== req.session.user.id)
      return res.status(403).json({ error: "Forbidden" });
    JobModel.remove(job.id);
    res.status(204).send();
  },
};
