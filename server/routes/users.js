const express = require('express');
const bcrypt = require('bcrypt');
const { authenticateRole } = require('../auth');
const { userFunctions } = require('../db');

const router = express.Router();

/**
 * Retrieves a list of user roles.
 * @route GET /users/roles
 * @returns {Array<Object>} An array of user objects.
 * @access Private (Admin only)
 */
router.get('/roles', authenticateRole(2), async (req, res) => {
  try {
    const roles = await userFunctions.roles();
    res.json(roles);
  } catch (error) {
    console.error('Get user roles error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Creates a new user.
 * @route POST /users
 * @returns {Object} Message indicating the user creation status.
 * @returns {string} message - The success message.
 * @access Private (Admin only)
 */
router.post('/', authenticateRole(2), async (req, res) => {
  try {
    const { username, password, email, name, lastname, roleId, phone } = req.body;

    // Generate salt and hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create the user with the generated passwordHash and salt
    await userFunctions.create(username, passwordHash, salt, email, name, lastname, roleId, phone);
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Retrieves a list of users.
 * @route GET /users
 * @returns {Array<Object>} An array of user objects.
 * @access Private (Admin only)
 */
router.get('/', authenticateRole(2), async (req, res) => {
  try {
    const users = await userFunctions.getAll();
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Retrieves a user by their ID.
 * @route GET /users/:id
 * @param {number} id - The ID of the user.
 * @returns {Object} The user object.
 * @returns {number} id - The ID of the user.
 * @returns {string} email - The email address of the user.
 * @returns {string} phone - The phone number of the user.
 * @returns {string} username - The username of the user.
 * @returns {number} roleId - The role ID of the user.
 * @returns {string} rolename - The name of the user's role.
 * @returns {string} name - The first name of the user.
 * @returns {string} lastname - The last name of the user.
 * @returns {boolean} isActive - Indicates whether the user is active.
 * @returns {string} passwordHash - The hashed password of the user.
 * @returns {string} salt - The salt used for password hashing.
 * @returns {Date} createdAt - The date and time when the user was created.
 * @access Private (Admin only)
 */
router.get('/:id', authenticateRole(2,3,4,5), async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userFunctions.getById(id);
    res.json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Retrieves a user by their username.
 * @route GET /users/username/:username
 * @param {string} username - The username of the user.
 * @returns {Object} The user object.
 * @returns {number} id - The ID of the user.
 * @returns {string} email - The email address of the user.
 * @returns {string} username - The username of the user.
 * @returns {string} phone - The phone number of the user.
 * @returns {number} roleId - The role ID of the user.
 * @returns {string} roleName - The name of the user's role.
 * @returns {string} name - The first name of the user.
 * @returns {string} lastname - The last name of the user.
 * @returns {string} passwordHash - The hashed password of the user.
 * @returns {string} salt - The salt used for password hashing.
 * @returns {boolean} isActive - Indicates whether the user is active.
 * @returns {Date} createdAt - The date and time when the user was created.
 * @access Private (Admin only)
 */
router.get('/username/:username', authenticateRole(2), async (req, res) => {
  try {
    const { username } = req.params;
    const user = await userFunctions.getByUsername(username);
    res.json(user);
  } catch (error) {
    console.error('Get user by username error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Updates a user's information.
 * @route PUT /users/:id
 * @param {number} id - The ID of the user.
 * @returns {Object} Message indicating the user update status.
 * @returns {string} message - The success message.
 * @access Private (Admin only)
 */
router.put('/:id', authenticateRole(2), async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, name, lastname, roleId, phone } = req.body;
    await userFunctions.update(id, username, email, name, lastname, roleId, phone);
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Delete a user.
 * @route PUT /users/:id/deactivate
 * @param {number} id - The ID of the user to deactivate.
 * @returns {Object} Message indicating the user deactivation status.
 * @returns {string} message - The success message.
 * @access Private (Admin only)
 */
router.delete('/:id', authenticateRole(2), async (req, res) => {
  try {
    const { id } = req.params;
    await userFunctions.deactivate(id);
    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Reactivates a user.
 * @route PUT /users/:id/reactivate
 * @param {number} id - The ID of the user to reactivate.
 * @returns {Object} Message indicating the user reactivation status.
 * @returns {string} message - The success message.
 * @access Private (Admin only)
 */
router.put('/:id/reactivate', authenticateRole(2), async (req, res) => {
  try {
    const { id } = req.params;
    await userFunctions.reactivate(id);
    res.json({ message: 'User reactivated successfully' });
  } catch (error) {
    console.error('Reactivate user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Updates a user's role.
 * @route PUT /users/:id/role
 * @param {number} id - The ID of the user.
 * @returns {Object} Message indicating the user role update status.
 * @returns {string} message - The success message.
 * @access Private (Admin only)
 */
router.put('/:id/role', authenticateRole(2), async (req, res) => {
  try {
    const { id } = req.params;
    const { roleId } = req.body;
    await userFunctions.updateRole(id, roleId);
    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Resets a user's password.
 * @route POST /users/:id/reset-password
 * @param {number} id - The ID of the user.
 * @returns {Object} Message indicating the password reset status.
 * @returns {string} message - The success message.
 * @access Private (Authenticated users)
 */
router.post('/:id/reset-password', authenticateRole(2, 3, 4, 5), async (req, res) => {
  try {
    const { id } = req.params;
    const { actualPassword, newPassword } = req.body;
    let user = await userFunctions.getById(id);
    user = user.at(0);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(actualPassword, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);
    await userFunctions.resetPassword(id, newPasswordHash, salt);
    //TODO: Envia correo a la persona
    res.status(201).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;