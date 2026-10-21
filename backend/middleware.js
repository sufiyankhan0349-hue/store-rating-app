const jwt = require("jsonwebtoken");

// Checks the token and puts the user info in req.user
function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.replace("Bearer ", "");
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ message: "Please login again" });
  }
}

// Allows only the given roles, e.g. allow("admin")
function allow(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Not allowed" });
    }
    next();
  };
}

module.exports = { auth, allow };
