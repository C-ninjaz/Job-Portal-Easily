export function validateJob(req, res, next) {
  const {
    job_category,
    job_designation,
    job_location,
    company_name,
    salary,
    number_of_openings,
  } = req.body;
  const errors = [];
  if (!job_category) errors.push("job_category");
  if (!job_designation) errors.push("job_designation");
  if (!job_location) errors.push("job_location");
  if (!company_name) errors.push("company_name");
  if (!salary) errors.push("salary");
  if (number_of_openings && isNaN(Number(number_of_openings)))
    errors.push("number_of_openings must be a number");
  if (errors.length)
    return res.status(400).send(`Missing/invalid fields: ${errors.join(", ")}`);
  next();
}
