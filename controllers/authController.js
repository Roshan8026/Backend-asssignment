const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const nodemailer = require('nodemailer');

exports.register = async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  // Check if user exists
  let user = await User.findOne({ where: { email } });
  if (user) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Encrypt password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  user = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role,
  });

  // Send verification email
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
  await sendVerificationEmail(email, token);

  res.status(201).json({ message: 'User registered. Please verify your email.' });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = await User.findOne({ where: { email } });
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ status:401, message: 'Invalid email or password' });
  }

  // Role check for admin login page
  if (user.role == 'customer') {
    return res.status(403).json({status:403, message: 'You are not allowed to login from here' });
  }

  // Generate JWT token
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: '3h',
  });

  res.json({ status:200, token:token ,  message: 'Login successfully'});
};

// Helper function to send verification email
const sendVerificationEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const url = `http://localhost:3000/verify-email?token=${token}`;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify your email',
    html: `<a href="${url}">Verify Email</a>`,
  });
};
