const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { userFunctions } = require('./db');
//Se importa el util de correo
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware for role-based authentication
// 1: administrador
// 2: operador
// 3: tecnico
// 4: cliente

function authenticateRole(...roles) {
  roles.push(1);
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decodedToken = jwt.verify(token, JWT_SECRET);
      const user = await userFunctions.getById(decodedToken.userId);
      if (roles.includes(user.roleId)) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Authentication error:', error.message);
      res.status(401).json({ message: 'Unauthorized' });
    }
  };
}

// User registration
async function register(req, res) {
  try {
    const { username, password, email, name, lastname, roleId, phone } = req.body;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await userFunctions.create(username, passwordHash, salt, email, name, lastname, roleId, phone);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

// User login
async function login(req, res) {
  try {
    const { usernameOrEmail, password } = req.body;
    let user;
    // Check if the provided input is an email or username
    if (usernameOrEmail.includes('@')) {
      // If it contains '@', assume it's an email
      user = await userFunctions.getByEmail(usernameOrEmail);
    } else {
      // Otherwise, assume it's a username
      user = await userFunctions.getByUsername(usernameOrEmail);
    }

    user = Array.isArray(user) ? user.at(0) : user;
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

function logout(req, res) {
  res.json({ message: 'Logout successful' });
}

async function forgotPassword(req, res) {
  try {
    const { usernameOrEmail  } = req.body;
    let user;

    // Check if the provided input is an email or username
    if (usernameOrEmail.includes('@')) {
      // If it contains '@', assume it's an email
      user = await userFunctions.getUserByEmail(usernameOrEmail);
    } else {
      // Otherwise, assume it's a username
      user = await userFunctions.getByUsername(usernameOrEmail);
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a unique password reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpires = Date.now() + 1800000; // 1 hour from now

    // Save the reset token and expiration time to the user's record
    await userFunctions.savePasswordResetToken(user.id, resetToken, resetTokenExpires);

    // Construct the password reset link
    const resetLink = `http://edintelapps/reset-password?token=${resetToken}`;

    // TODO:Send the password reset email
    `await transporter.sendMail({
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Password Reset',
      html: \`
        <p>You have requested to reset your password.</p>
        <p>Please click the following link to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
      \`,
    });`

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    // Find the user with the provided reset token
    const user = await userFunctions.getByResetToken(token);

    if (!user || user.resetTokenExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user = Array.isArray(user) ? user.at(0) : user;

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Update the user's password and clear the reset token
    await userFunctions.resetPasswordById(user.id, newPasswordHash, null, null);

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  authenticateRole,
  register,
  login,
  logout,
  resetPassword,
  forgotPassword
};