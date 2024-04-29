const { v4: uuidv4 } = require('uuid');
const path = require('node:path'); 

function generateRandomPassword(length, includeUppercase, includeLowercase, includeNumbers, includeSymbols) {
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+~`|}{[]\:;?><,./-=';
  
    let charset = '';
    if (includeUppercase) charset += uppercaseChars;
    if (includeLowercase) charset += lowercaseChars;
    if (includeNumbers) charset += numberChars;
    if (includeSymbols) charset += symbolChars;
  
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
  
    return password;
  }


  function generateUniqueFilenameWithUUID(originalFileName) {
    const fileExtension = path.extname(originalFileName);
    const uniqueFileName = `${uuidv4()}${fileExtension}`;
    return uniqueFileName;
  }

module.exports = {
    generateRandomPassword,
    generateUniqueFilenameWithUUID
}