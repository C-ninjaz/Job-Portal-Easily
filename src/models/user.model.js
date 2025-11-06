import { v4 as uuid } from "uuid";

const users = [];

export const UserModel = {
  getAll() {
    return users;
  },
  findByEmail(email) {
    return users.find(
      (u) => u.email.toLowerCase() === String(email).toLowerCase()
    );
  },
  add({ name, email, password }) {
    if (this.findByEmail(email)) {
      const err = new Error("Email already registered");
      err.code = "EMAIL_EXISTS";
      throw err;
    }
    const user = { id: uuid(), name, email, password };
    users.push(user);
    return user;
  },
  verifyLogin({ email, password }) {
    const user = this.findByEmail(email);
    if (!user) return null;
    // For simplicity, plaintext comparison (in-memory). In real apps, hash with bcrypt.
    return user.password === password ? user : null;
  },
};
