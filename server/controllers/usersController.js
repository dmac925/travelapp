const Users = require("../models/users");
const Tasks = require('../models/tasks');
const jwt = require("jsonwebtoken");
const validator = require("validator");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt_secret = process.env.JWT_SECRET;

const findAll = async (req, res) => {
  try {
    const users = await Users.find({});
    res.send(users);
  } catch (e) {
    res.send({ e });
  }
};

const getUserIDByEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await Users.findOne({ email }, '_id');
    if (user) {
      res.json({ ok: true, user_id: user._id });
    } else {
      res.json({ ok: false, message: 'User not found' });
    }
  } catch (e) {
    res.send({ e });
  }
};

const register = async (req, res) => {
  const { email, password, password2, admin } = req.body;
  
  if (!email || !password || !password2) {
    return res.json({ ok: false, message: "All fields required" });
  }
  if (password !== password2) {
    return res.json({ ok: false, message: "Passwords must match" });
  }
  if (!validator.isEmail(email)) {
    return res.json({ ok: false, message: "Invalid email" });
  }
  
  try {
    const user = await Users.findOne({ email });
    if (user) return res.json({ ok: false, message: "User exists!" });
  
    const hash = await bcrypt.hash(password, saltRounds);
  
    const newUser = await Users.create({
      email,
      password: hash,
      admin: admin || false,
    });
    console.log("Creating new user:", newUser);
  
    const initialTasks = [
      
      { title: 'Tell your employer you are pregnant', category: 'Work', status: 'To Do', user_id: newUser._id },
      { title: 'Check your life insurance', category: 'Personal Admin', status: 'To Do', user_id: newUser._id },
      { title: 'Set up a Lasting Power of Attorney', category: 'Personal Admin', status: 'To Do', user_id: newUser._id },
      { title: 'Cut some monthly subscriptions', category: 'Personal Admin', status: 'To Do', user_id: newUser._id }
    ];

    await Tasks.insertMany(initialTasks);


    res.json({ ok: true, message: "Successfully registered" });
  } catch (error) {
    res.json({ ok: false, error });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.json({ ok: false, message: "All fields are required" });
  }
  if (!validator.isEmail(email)) {
    return res.json({ ok: false, message: "Invalid email provided" });
  }
  
  try {
    const user = await Users.findOne({ email });
    if (!user) return res.json({ ok: false, message: "Invalid user provided" });
  
    const match = await bcrypt.compare(password, user.password);
  
    if (match) {
      const token = jwt.sign({ userId: user._id.toString(), userEmail: user.email, userAdmin: user.admin }, jwt_secret, { expiresIn: "1h" });
      res.json({ ok: true, message: "welcome back", token, email });
    } else return res.json({ ok: false, message: "Invalid data provided" });
  } catch (error) {
    res.json({ ok: false, error });
  }
};

const verify_token = (req, res) => {
  const token = req.headers.authorization;
  jwt.verify(token, jwt_secret, (err, succ) => {
    err
      ? res.json({ ok: false, message: "Token is corrupted" })
      : res.json({ ok: true, succ });
  });
};

const findUserByEmail = async (req, res) => {
  const email = req.params.email;
  try {
    const user = await Users.findOne({ email: email }, '_id'); 
    if (user) {
      res.json({ ok: true, user_id: user._id });
    } else {
      res.json({ ok: false, message: 'User not found' });
    }
  } catch (e) {
    res.send({ e });
  }
};


module.exports = { register, login, verify_token, findAll, findUserByEmail, getUserIDByEmail  };
