const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const slugify = require('../utils/slugify');

async function makeUniqueSlug(businessName) {
  const base = slugify(businessName) || 'business';
  let slug = base;
  let counter = 1;

  while (await User.exists({ businessSlug: slug })) {
    slug = `${base}-${counter}`;
    counter += 1;
  }

  return slug;
}

async function register(req, res) {
  const { name, email, password, businessName, phone } = req.body;

  if (!name || !email || !password || !businessName) {
    return res.status(400).json({ message: 'name, email, password and businessName are required' });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const businessSlug = await makeUniqueSlug(businessName);
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    businessName,
    businessSlug,
    phone,
  });

  res.status(201).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      businessName: user.businessName,
      businessSlug: user.businessSlug,
    },
    token: generateToken(user._id),
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      businessName: user.businessName,
      businessSlug: user.businessSlug,
    },
    token: generateToken(user._id),
  });
}

async function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { register, login, me };
