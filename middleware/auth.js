const jwt = require("jsonwebtoken");
require("dotenv").config();

const verify = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(403).json({ message: "You are not authorized" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "You are not authorized" });
      }

      req.curUserId = decoded.foo;
      next();
    });
  } catch (err) {
    console.error("Server error.");
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

module.exports = { verify };
