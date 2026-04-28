const CryptoJS = require("crypto-js");

const KEY = process.env.ENCRYPTION_KEY || "default_32_char_key_placeholder!";

const encrypt = (data) => {
  if (!data) return null;
  const str = typeof data === "string" ? data : JSON.stringify(data);
  return CryptoJS.AES.encrypt(str, KEY).toString();
};

const decrypt = (cipherText) => {
  if (!cipherText) return null;
  const bytes = CryptoJS.AES.decrypt(cipherText, KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

module.exports = { encrypt, decrypt };