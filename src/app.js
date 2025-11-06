import cookieParser from "cookie-parser";
import dayjs from "dayjs";
import dotenv from "dotenv";
import express from "express";
import expressLayouts from "express-ejs-layouts";
import session from "express-session";
import methodOverride from "method-override";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import { lastVisitCookie } from "./middleware/lastVisit.js";
import authRoutes from "./routes/auth.routes.js";
import jobRoutes from "./routes/job.routes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  // Views and templating
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "..", "views"));
  app.use(expressLayouts);
  app.set("layout", path.join("layouts", "layout"));

  // Static assets (css/images inside views) and uploads
  app.use("/css", express.static(path.join(__dirname, "..", "views", "css")));
  app.use(
    "/images",
    express.static(path.join(__dirname, "..", "views", "images"))
  );
  app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

  // Common middlewares
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(methodOverride("_method"));
  app.use(morgan("dev"));

  // Sessions
  const SESSION_SECRET = process.env.SESSION_SECRET || "dev_secret_change_me";
  app.use(
    session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 1000 * 60 * 60 * 24 },
    })
  );

  // Expose auth user and last visit to views
  app.use(lastVisitCookie);
  app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.lastVisit = req.cookies.lastVisit
      ? dayjs(Number(req.cookies.lastVisit)).format("YYYY-MM-DD HH:mm")
      : null;
    next();
  });

  // Routes
  app.use("/", authRoutes);
  app.use("/", jobRoutes);

  // 404
  app.use((req, res) => {
    res.status(404);
    res.render("404", { title: "404 - Not Found" });
  });

  return app;
}
