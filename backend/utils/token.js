const crypto = require("crypto");

function generateToken(length = 7) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  while (token.length < length) {
    const byte = crypto.randomBytes(1)[0];
    if (byte < chars.length * 4) {
      token += chars[byte % chars.length];
    }
  }
  return token;
}

module.exports = generateToken;
