import dayjs from "dayjs";
import { JobModel } from "../models/job.model.js";

const logos = [
  "images/google.png",
  "images/micro.png",
  "images/amz.png",
  "images/ibm.png",
  "images/orc.png",
  "images/flip.png",
  "images/sales.png",
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function seedJobsIfEmpty() {
  const { total: existing } = JobModel.getAll({ page: 1, limit: 1 });
  // If plenty of jobs exist, skip. Otherwise, top up to provide good coverage.
  if (existing >= 150) return;

  const base = [
    // Past 24 hours
    {
      job_posted: dayjs().subtract(6, "hour").format("YYYY-MM-DD"),
      level: "Internship",
      type: "Full-time",
    },
    {
      job_posted: dayjs().subtract(12, "hour").format("YYYY-MM-DD"),
      level: "Entry level",
      type: "Remote",
    },
    // Past 3 days
    {
      job_posted: dayjs().subtract(2, "day").format("YYYY-MM-DD"),
      level: "Associate",
      type: "Part-time",
    },
    {
      job_posted: dayjs().subtract(3, "day").format("YYYY-MM-DD"),
      level: "Mid-Senior",
      type: "Contract",
    },
    // Past week
    {
      job_posted: dayjs().subtract(5, "day").format("YYYY-MM-DD"),
      level: "Director",
      type: "Full-time",
    },
    {
      job_posted: dayjs().subtract(6, "day").format("YYYY-MM-DD"),
      level: "Associate",
      type: "Remote",
    },
    // Past month
    {
      job_posted: dayjs().subtract(2, "week").format("YYYY-MM-DD"),
      level: "Entry level",
      type: "Part-time",
    },
    {
      job_posted: dayjs().subtract(3, "week").format("YYYY-MM-DD"),
      level: "Mid-Senior",
      type: "Contract",
    },
  ];

  const companies = [
    {
      name: "Google",
      location: "Bangalore",
      founded: 1998,
      employees: "100k+",
    },
    {
      name: "Microsoft",
      location: "Hyderabad",
      founded: 1975,
      employees: "200k+",
    },
    { name: "Amazon", location: "Pune", founded: 1994, employees: "1.5M+" },
    { name: "IBM", location: "Noida", founded: 1911, employees: "300k+" },
    { name: "Oracle", location: "Mumbai", founded: 1977, employees: "130k+" },
    {
      name: "Flipkart",
      location: "Bangalore",
      founded: 2007,
      employees: "30k+",
    },
    {
      name: "Salesforce",
      location: "Gurgaon",
      founded: 1999,
      employees: "70k+",
    },
  ];

  const roles = [
    {
      design: "Frontend Developer",
      category: "Tech",
      skills: ["React", "JavaScript", "CSS", "HTML"],
    },
    {
      design: "Backend Developer",
      category: "Tech",
      skills: ["NodeJs", "Express", "MongoDB", "SQL"],
    },
    {
      design: "Full Stack Engineer",
      category: "Tech",
      skills: ["React", "NodeJs", "Express", "SQL"],
    },
    {
      design: "Data Analyst",
      category: "Non-Tech",
      skills: ["SQL", "Python", "Data Visualization"],
    },
    {
      design: "Product Manager",
      category: "Non-Tech",
      skills: ["Product Management", "Agile"],
    },
    {
      design: "UX designer",
      category: "Non-Tech",
      skills: ["Figma", "Prototyping", "User Research"],
    },
  ];

  // Seed a small base set when empty to guarantee immediate visibility
  if (existing === 0) {
    base.forEach((b, idx) => {
      const company = companies[idx % companies.length];
      const role = roles[idx % roles.length];
      JobModel.create({
        recruiterId: "seed",
        job_category: role.category,
        job_designation: role.design,
        job_location: company.location,
        company_name: company.name,
        company_founded: company.founded,
        employees: company.employees,
        salary: pick(["₹6–10 LPA", "₹10–18 LPA", "₹20–30 LPA"]),
        number_of_openings: pick([1, 2, 3, 5]),
        experience: b.level,
        job_type: b.type,
        skills_required: role.skills,
        logo: pick(logos),
        apply_by: dayjs().add(20, "day").format("YYYY-MM-DD"),
        job_posted: b.job_posted,
        featured: idx % 3 === 0,
        company_description: `${company.name} is hiring ${role.design} in ${company.location}.`,
      });
    });
  }

  // Top up to ~200 jobs by distributing across companies, roles, and date ranges with varied levels/types
  const levels = [
    "Internship",
    "Entry level",
    "Associate",
    "Mid-Senior",
    "Director",
  ];
  const types = ["Full-time", "Part-time", "Contract", "Remote"];
  const buckets = [
    // within 24h
    dayjs().subtract(6, "hour").format("YYYY-MM-DD"),
    dayjs().subtract(12, "hour").format("YYYY-MM-DD"),
    dayjs().subtract(20, "hour").format("YYYY-MM-DD"),
    // within 3 days
    dayjs().subtract(1, "day").format("YYYY-MM-DD"),
    dayjs().subtract(2, "day").format("YYYY-MM-DD"),
    dayjs().subtract(3, "day").format("YYYY-MM-DD"),
    // within week
    dayjs().subtract(5, "day").format("YYYY-MM-DD"),
    dayjs().subtract(6, "day").format("YYYY-MM-DD"),
    // within month
    dayjs().subtract(2, "week").format("YYYY-MM-DD"),
    dayjs().subtract(3, "week").format("YYYY-MM-DD"),
  ];

  const { total: afterBase } = JobModel.getAll({ page: 1, limit: 1 });
  const target = 260;
  let toAdd = Math.max(0, target - afterBase);
  outer: for (let c = 0; c < companies.length; c++) {
    for (let r = 0; r < roles.length; r++) {
      for (let b = 0; b < buckets.length; b++) {
        if (toAdd <= 0) break outer;
        const company = companies[c];
        const role = roles[r];
        JobModel.create({
          recruiterId: "seed",
          job_category: role.category,
          job_designation: role.design,
          job_location: company.location,
          company_name: company.name,
          company_founded: company.founded,
          employees: company.employees,
          salary: pick(["₹6–10 LPA", "₹10–18 LPA", "₹20–30 LPA"]),
          number_of_openings: pick([1, 2, 3, 5]),
          experience: pick(levels),
          job_type: pick(types),
          skills_required: role.skills,
          logo: pick(logos),
          apply_by: dayjs().add(20, "day").format("YYYY-MM-DD"),
          job_posted: buckets[b],
          featured: (c + r + b) % 4 === 0,
          company_description: `${company.name} is hiring ${role.design} in ${company.location}.`,
        });
        toAdd--;
      }
    }
  }
}
