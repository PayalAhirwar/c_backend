const db = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Email validation
function validateEmail(email) {
  const re =  /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{5,}@gmail\.com$/;
  return re.test(email);
}

// Add new admin
const addAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "All fields are required" });

  if (!validateEmail(email))
    return res.status(400).json({
      message: "Enter a valid email",
    });

  try {
    const existingUser = await db.User.findOne({ email });
    if (existingUser)
      return res
        .status(400)
        .json({ message: "Email is already been registered." });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    await db.User.create({ email, password: hash });

    if (process.env.NODE_ENV !== "prod") {
      res.status(200).json({ message: "Admin added successfully." });
    }
  } catch (err) {
    res.status(500).json({ message: "Something went wrong, try again" });
  }
};

// Login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res
      .status(400)
      .json({ message: "Please enter both your email and password" });

  if (!validateEmail(email))
    return res.status(400).json({
      message: "Please enter a valid email",
    });

  try {
    const user = await db.User.findOne({ email });
    if (!user)
      return res.status(400).json({
        message:
          "Email address is not associated with any account. Please check and try again",
      });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ message: "Email or Password is not correct." });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "10h" }
    );

    res.status(200).json({ jwt: token, userId: user._id });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again" });
  }
};

// Create new campaign
const create = async (req, res) => {
  const campaign = { ...req.body, raised: 0 };

  if (!campaign.title || !campaign.description || !campaign.subTitle)
    return res.status(400).json({ message: "All fields are required" });

  if (campaign.required <= 0)
    return res.status(400).json({
      message: "The required amount cannot be equal to or smaller than 0",
    });

  try {
    const newCampaign = await db.Campaign.create(campaign);
    res.status(200).json(newCampaign);
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong when creating a new campaign",
    });
  }
};

// Update campaign
const update = async (req, res) => {
  const { id } = req.params;

  if (!id.match(/^[0-9a-fA-F]{24}$/))
    return res.status(404).json({ message: "No such campaign exists." });

  try {
    const updated = await db.Campaign.findByIdAndUpdate(id, req.body, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong while updating campaign. Try again.",
    });
  }
};

// Delete campaign
const deleteCampaign = async (req, res) => {
  const { id } = req.params;

  if (!id.match(/^[0-9a-fA-F]{24}$/))
    return res.status(404).json({ message: "No such campaign exists." });

  try {
    await db.Campaign.findByIdAndRemove(id);
    res
      .status(200)
      .json({ message: "Successfully deleted the campaign." });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong while deleting campaign. Try again.",
    });
  }
};

module.exports = {
  addAdmin,
  login,
  create,
  update,
  deleteCampaign,
};
