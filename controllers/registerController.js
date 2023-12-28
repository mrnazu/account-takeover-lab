const bcrypt = require('bcryptjs');
const User = require('../models/user');
// Input validation function
function validateInputs(req) {
  const errors = [];

  // Validate username
  const username = req.body.username;
  if (!username || username.length < 5 || !/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push("Username is required and must be at least 5 characters long. It can only contain letters, numbers, and underscores.");
  }

  // Validate password
  const password = req.body.password;
  if (!password || password.length < 8) {
    errors.push("Password is required and must be at least 8 characters long.");
  }

  return errors.length === 0 ? null : errors;
}

module.exports.registerUser = async (req, res) => {
  try {
    console.log(req.body);
    const validationErrors = validateInputs(req);
    if (validationErrors) {
      res.status(400).json({ errors: validationErrors });
      return;
    }

    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.status(400).json({ error: "Username is already taken." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Consider Argon2 for stronger hashing

    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    req.session.user = newUser; // Ensure session middleware is configured

    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed due to an unexpected error: " + err.message });
  }
};
