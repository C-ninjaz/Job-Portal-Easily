import dayjs from "dayjs";
import { v4 as uuid } from "uuid";

const jobs = [];

function expandQuery(q) {
  const term = q.toLowerCase();
  const synonyms = new Set();
  const rawTokens = term
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);

  for (const t of rawTokens) {
    synonyms.add(t);
    if (t.includes("software")) {
      ["software", "developer", "engineer"].forEach((x) => synonyms.add(x));
    }
    if (t.includes("frontend") || t.includes("front")) {
      ["frontend", "front end", "react", "javascript"].forEach((x) =>
        synonyms.add(x)
      );
    }
    if (t.includes("backend") || t.includes("back")) {
      ["backend", "back end", "node", "express"].forEach((x) =>
        synonyms.add(x)
      );
    }
    if (t.includes("full") && t.includes("stack")) {
      [
        "full stack",
        "fullstack",
        "frontend",
        "backend",
        "react",
        "node",
      ].forEach((x) => synonyms.add(x));
    }
    if (t.includes("data")) {
      ["data", "analyst", "sql", "python"].forEach((x) => synonyms.add(x));
    }
    if (t.includes("ux") || t.includes("design")) {
      ["ux", "designer", "figma", "design"].forEach((x) => synonyms.add(x));
    }
    if (t.includes("product")) {
      ["product", "pm", "product manager"].forEach((x) => synonyms.add(x));
    }
  }

  return Array.from(synonyms);
}

export const JobModel = {
  // Job shape: { id, recruiterId, job_category, job_designation, job_location, company_name, company_founded, employees, salary, number_of_openings, experience, skills_required:[], logo, apply_by, job_posted, applicants:[] }
  create(job) {
    const data = {
      id: uuid(),
      job_posted: dayjs().format("YYYY-MM-DD"),
      applicants: [],
      ...job,
    };
    jobs.push(data);
    return data;
  },
  getAll({ q, page = 1, limit = 10 } = {}) {
    let list = jobs
      .slice()
      .sort(
        (a, b) => dayjs(b.job_posted).valueOf() - dayjs(a.job_posted).valueOf()
      );
    if (q) {
      const terms = expandQuery(q);
      list = list.filter((j) => {
        const text = [
          j.job_designation,
          j.company_name,
          j.job_location,
          j.job_category,
          j.experience,
          ...(j.skills_required || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return terms.some((t) => text.includes(t));
      });
    }
    const total = list.length;
    const start = (page - 1) * limit;
    const paged = list.slice(start, start + limit);
    return { data: paged, total };
  },
  findById(id) {
    return jobs.find((j) => j.id === id);
  },
  update(id, fields) {
    const job = this.findById(id);
    if (!job) return null;
    Object.assign(job, fields);
    return job;
  },
  remove(id) {
    const idx = jobs.findIndex((j) => j.id === id);
    if (idx === -1) return false;
    jobs.splice(idx, 1);
    return true;
  },
  // Applicants
  addApplicant(jobId, applicant) {
    const job = this.findById(jobId);
    if (!job) return null;
    const app = { applicant: uuid(), ...applicant };
    job.applicants.push(app);
    return app;
  },
  getApplicants(jobId, { page = 1, limit = 10 } = {}) {
    const job = this.findById(jobId);
    if (!job) return { data: [], total: 0 };
    const total = job.applicants.length;
    const start = (page - 1) * limit;
    return { data: job.applicants.slice(start, start + limit), total };
  },
  findApplicant(jobId, applicant) {
    const job = this.findById(jobId);
    if (!job) return null;
    return job.applicants.find((a) => a.applicant === applicant);
  },
  updateApplicant(jobId, applicant, fields) {
    const app = this.findApplicant(jobId, applicant);
    if (!app) return null;
    Object.assign(app, fields);
    return app;
  },
  removeApplicant(jobId, applicant) {
    const job = this.findById(jobId);
    if (!job) return false;
    const idx = job.applicants.findIndex((a) => a.applicant === applicant);
    if (idx === -1) return false;
    job.applicants.splice(idx, 1);
    return true;
  },
};
