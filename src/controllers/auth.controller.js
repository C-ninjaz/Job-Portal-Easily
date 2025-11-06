import { UserModel } from "../models/user.model.js";

export const AuthController = {
  renderLanding(req, res) {
    if (req.session.user) {
      return res.redirect("/jobs");
    }
    res.render("landing-page", { title: "Easily - Home" });
  },
  renderLogin(req, res) {
    if (req.session.user) {
      return res.redirect("/jobs");
    }
    res.render("user-login", { title: "Login" });
  },
  // Seeker screens
  renderSeekerLogin(req, res) {
    if (req.session.user) return res.redirect("/jobs");
    res.render("seeker-login", { title: "Seeker Login" });
  },
  renderSeekerSignup(req, res) {
    if (req.session.user) return res.redirect("/jobs");
    res.render("seeker-signup", { title: "Seeker Sign Up" });
  },
  renderSignup(req, res) {
    if (req.session.user) return res.redirect("/jobs");
    res.render("user-signup", { title: "Sign Up" });
  },
  register(req, res) {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).send("All fields are required");
      }
      const user = UserModel.add({ name, email, password });
      req.session.user = { id: user.id, name: user.name, email: user.email };
      res.redirect("/jobs");
    } catch (err) {
      if (err.code === "EMAIL_EXISTS") {
        return res.status(409).send("Email already registered");
      }
      res.status(500).send("Registration failed");
    }
  },
  seekerRegister(req, res) {
    // Same behavior as register but renders seeker flows
    return AuthController.register(req, res);
  },
  login(req, res) {
    const { email, password } = req.body;
    const user = UserModel.verifyLogin({ email, password });
    if (!user) return res.status(401).send("Invalid email or password");
    req.session.user = { id: user.id, name: user.name, email: user.email };
    res.redirect("/jobs");
  },
  seekerLogin(req, res) {
    return AuthController.login(req, res);
  },
  // Forgot password (demo-only)
  renderForgotPassword(req, res) {
    res.render("forgot-password", { title: "Forgot Password" });
  },
  forgotPassword(req, res) {
    // In demo we just show a success message regardless of email existence
    res.render("forgot-password", { title: "Forgot Password", sent: true });
  },
  logout(req, res) {
    req.session.destroy(() => {
      res.redirect("/");
    });
  },
};
