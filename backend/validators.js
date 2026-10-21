const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function checkName(name) {
  if (!name || name.length < 20 || name.length > 60)
    return "Name must be 20 to 60 characters";
}

function checkEmail(email) {
  if (!email || !emailRe.test(email)) return "Enter a valid email";
}

function checkAddress(address) {
  if (address && address.length > 400) return "Address can be max 400 characters";
}

function checkPassword(password) {
  if (!password || password.length < 8 || password.length > 16)
    return "Password must be 8 to 16 characters";
  if (!/[A-Z]/.test(password)) return "Password needs one uppercase letter";
  if (!/[^A-Za-z0-9]/.test(password)) return "Password needs one special character";
}

// Returns the first error message, or undefined if all is fine
function validateUser({ name, email, address, password }) {
  return (
    checkName(name) || checkEmail(email) || checkAddress(address) || checkPassword(password)
  );
}

// Builds a safe ORDER BY clause (only allowed column names are used)
function orderBy(query, allowedColumns, defaultColumn) {
  const col = allowedColumns.includes(query.sortBy) ? query.sortBy : defaultColumn;
  const dir = query.order === "desc" ? "DESC" : "ASC";
  return `ORDER BY "${col}" ${dir}`;
}

module.exports = { validateUser, checkName, checkEmail, checkAddress, checkPassword, orderBy };
