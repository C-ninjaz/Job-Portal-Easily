import detect from "detect-port";
import dotenv from "dotenv";
import { createApp } from "./app.js";
import { connectToDb } from "./utils/db.js";
import { seedJobsIfEmpty } from "./utils/seed.js";

dotenv.config();

// Connect to MongoDB (optional). Regardless of DB status, ensure demo data is seeded.
try {
  await connectToDb();
} catch (e) {
  console.warn("Starting without MongoDB; using in-memory store only.");
} finally {
  // Always seed in-memory demo data so /jobs isn't empty on cold starts
  await seedJobsIfEmpty();
}

const app = createApp();

const DEFAULT_PORT = Number(process.env.PORT || 3201);
const port = await detect(DEFAULT_PORT);
if (port !== DEFAULT_PORT) {
  console.warn(
    `Port ${DEFAULT_PORT} is busy. Using available port ${port} instead.`
  );
}

app.listen(port, () => {
  console.log(`Easily server running at http://localhost:${port}`);
});
