const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { userFunctions } = require("./db");
const sendEmail = require("./utils/mailHelper");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware for role-based authentication
// 1: administrador
// 2: operador
// 3: supervisor
// 4: tecnico
// 5: cliente

function authenticateRole(...roles) {
  roles.push(1);
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decodedToken = jwt.verify(token, JWT_SECRET);
      const user = await userFunctions.getById(decodedToken.userId);
      if (!roles.includes(user.roleId)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Authentication error:", error.message);
      res.status(401).json({ message: "Unauthorized" });
    }
  };
}

/**
 * @route POST /register
 * @description Register a new user
 * @access Public
 * @param {Object} req.body - The request body
 * @param {string} req.body.username - The username of the user
 * @param {string} req.body.password - The password of the user
 * @param {string} req.body.email - The email address of the user
 * @param {string} req.body.name - The first name of the user
 * @param {string} req.body.lastname - The last name of the user
 * @param {number} req.body.roleId - The role ID of the user
 * @param {string} [req.body.phone] - The phone number of the user (optional)
 * @returns {Object}
 * @returns {string} message - A message indicating the result of the operation
 */
async function register(req, res) {
  try {
    const { username, password, email, name, lastname, roleId, phone, clientId, companyId } =
      req.body;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    await userFunctions.create(
      username,
      passwordHash,
      salt,
      email,
      name,
      lastname,
      roleId,
      phone,
      clientId,
      companyId
    );
    res.status(201).json({ message: "Usuario registrado con éxito. Credenciales de inicio de sesión enviados al correo." });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * @route POST /login
 * @description Authenticate and login a user
 * @access Public
 * @param {Object} req.body - The request body
 * @param {string} req.body.usernameOrEmail - The username or email of the user
 * @param {string} req.body.password - The password of the user
 * @returns {Object}
 * @returns {string} token - The JWT token for authentication
 */
async function login(req, res) {
  try {
    const { usernameOrEmail, password } = req.body;
    let user;
    // Check if the provided input is an email or username
    if (usernameOrEmail.includes("@")) {
      // If it contains '@', assume it's an email
      user = await userFunctions.getByEmail(usernameOrEmail);
    } else {
      // Otherwise, assume it's a username
      user = await userFunctions.getByUsername(usernameOrEmail);
    }
    
    user = Array.isArray(user) ? user.at(0) : user;

    if (!user) {
      return res.status(401).json({ message: "Credenciales ingresados inválidos." });
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Credenciales ingresados inválidos." });
    }
    const token = jwt.sign(
      { userId: user.id, roleId: user.roleId, name: user.name, clientId: user.idClient, siteId: user.idSite },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * @route POST /logout
 * @description Logout the user
 * @access Public
 * @returns {Object}
 * @returns {string} message - A message indicating the result of the operation
 */
function logout(req, res) {
  res.json({ message: "Logout successful" });
}

/**
 * @route POST /forgot-password
 * @description Send a password reset email to the user
 * @access Public
 * @param {Object} req.body - The request body
 * @param {string} req.body.usernameOrEmail - The username or email of the user
 * @returns {Object}
 * @returns {string} message - A message indicating the result of the operation
 */
async function forgotPassword(req, res) {
  try {
    const { usernameOrEmail } = req.body;
    let user;

    // Check if the provided input is an email or username
    if (usernameOrEmail.includes("@")) {
      // If it contains '@', assume it's an email
      user = await userFunctions.getByEmail(usernameOrEmail);
    } else {
      // Otherwise, assume it's a username
      user = await userFunctions.getByUsername(usernameOrEmail);
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a unique password reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 1800000);

    // Save the reset token and expiration time to the user's record
    await userFunctions.savePasswordResetToken(
      user.id,
      resetToken,
      resetTokenExpires
    );

    // Construct the password reset link
    const resetLink = `${process.env.PAGE_URL}/reset-password-token?token=${resetToken}`;

    const subject= 'Reinicio de contraseña. Página Edintel';
    const emailBody = `
    <html>
      <body>
        <p>Has solicitado reiniciar la contraseña de tu cuenta.</p>
        <p>Por favor, dar click en el siguiente link para completar su reinicio de contraseña:</p>
        <p><a href="${resetLink}">Haz click aquí para reiniciar tu contraseña</a></p>
        <p></p>
        <p>Si no has sido tu el que lo solicitó puedes ignora este mensaje.</p>
      </body>
    </html>
  `;

    await sendEmail(subject, emailBody, [user.email]);
      
    res.json({ message: "El link para el reinicio de contraseña ha sido enviado a su correo." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: error.message });
  }
}

/**
 * @route POST /reset-password
 * @description Reset the user's password
 * @access Public
 * @param {Object} req.body - The request body
 * @param {string} req.body.newPassword - The new password
 * @param {string} req.body.token - The token to reset the password
 * @returns {Object}
 * @returns {string} message - A message indicating the result of the operation
 */
async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;
    // Find the user with the provided reset token
    const user = await userFunctions.getByResetToken(token);

    if (!user) {
      return res.status(400).json({
        message: "Token inválido o expirado. Por favor intente el proceso de reiniciar la contraseña de nuevo para obtener un nuevo link.",
      });
    }

    // If user is an array, get the first element
    const singleUser = Array.isArray(user) ? user[0] : user;

    // Convert resetTokenExpires to local time zone
    const resetTokenExpiresLocal = new Date(singleUser.resetTokenExpires);
    const localOffsetInMs = resetTokenExpiresLocal.getTimezoneOffset() * 60 * 1000;
    resetTokenExpiresLocal.setTime(resetTokenExpiresLocal.getTime() + localOffsetInMs);

    if (resetTokenExpiresLocal < Date.now()) {
      return res.status(400).json({
        message: "Token inválido o expirado. Por favor intente el proceso de reiniciar la contraseña de nuevo para obtener un nuevo link.",
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Update the user's password and clear the reset token
    await userFunctions.resetPassword(
      singleUser.id,
      newPasswordHash,
      salt
    );

    const subject= 'Reinicio de contraseña exitoso. Página Edintel';
    const emailBody = `
    <html>
      <body>
        <p>Has cambiado exitosamente tu contraseña a tu cuenta asociada de Edintel.</p>
        <p>En caso de no haber sido usted, comuníquese inmediatamente con Edintel.</p>
      </body>
    </html>
  `;

    await sendEmail(subject, emailBody, [singleUser.email]);
    res.json({ message: "Contraseña restaurada con éxito" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  authenticateRole,
  register,
  login,
  logout,
  resetPassword,
  forgotPassword,
};
