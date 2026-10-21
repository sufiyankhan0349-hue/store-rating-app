const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function checkName(v) {
  if (v.length < 20 || v.length > 60) return "Name must be 20 to 60 characters";
  return "";
}

export function checkEmail(v) {
  return emailRe.test(v) ? "" : "Enter a valid email";
}

export function checkAddress(v) {
  return v.length > 400 ? "Address can be max 400 characters" : "";
}

export function checkPassword(v) {
  if (v.length < 8 || v.length > 16) return "Password must be 8 to 16 characters";
  if (!/[A-Z]/.test(v)) return "Password needs one uppercase letter";
  if (!/[^A-Za-z0-9]/.test(v)) return "Password needs one special character";
  return "";
}
