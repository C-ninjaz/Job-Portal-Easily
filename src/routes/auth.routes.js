import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";

const router = Router();

router.get("/", AuthController.renderLanding);
router.get("/login", AuthController.renderLogin);
router.post("/login", AuthController.login);
router.post("/register", AuthController.register);
router.get("/signup", AuthController.renderSignup);
// Seeker auth screens
router.get("/seeker/login", AuthController.renderSeekerLogin);
router.post("/seeker/login", AuthController.seekerLogin);
router.get("/seeker/signup", AuthController.renderSeekerSignup);
router.post("/seeker/register", AuthController.seekerRegister);
// Forgot password (demo: show success screen)
router.get("/forgot-password", AuthController.renderForgotPassword);
router.post("/forgot-password", AuthController.forgotPassword);
router.get("/logout", AuthController.logout);
router.post("/logout", AuthController.logout);
router.get("/404", (req, res) =>
  res.status(404).render("404", { title: "Not Found" })
);

export default router;
