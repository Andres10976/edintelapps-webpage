const express = require('express');
const bcrypt = require('bcrypt');
const { authenticateRole } = require('../auth');
const { userFunctions } = require('../db');

const router = express.Router();

router.post('/', authenticateRole(2), async (req, res) => {
  try {
    const { username, passwordHash, salt, email, name, lastname, roleId, phone } = req.body;
    await userFunctions.create(username, passwordHash, salt, email, name, lastname, roleId, phone);
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/', authenticateRole(2), async (req, res) => {
  try {
    const users = await userFunctions.getAll();
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', authenticateRole(2), async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userFunctions.getById(id);
    res.json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

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

router.put('/:id', authenticateRole(2), async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, name, lastname, roleId, phone, isActive } = req.body;
    await userFunctions.update(id, username, email, name, lastname, roleId, phone, isActive);
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id/deactivate', authenticateRole(2), async (req, res) => {
  try {
    const { id } = req.params;
    await userFunctions.deactivate(id);
    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

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