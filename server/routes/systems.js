const express = require('express');
const { authenticateRole } = require('../auth');
const { systemFunctions } = require('../db');

const router = express.Router();

router.post('/', authenticateRole(2, 3), async (req, res) => {
  try {
    const { name } = req.body;
    await systemFunctions.createSystem(name);
    res.status(201).json({ message: 'System created successfully' });
  } catch (error) {
    console.error('Create system error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/', authenticateRole(2, 3), async (req, res) => {
  try {
    const systems = await systemFunctions.getSystems();
    res.json(systems);
  } catch (error) {
    console.error('Get systems error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', authenticateRole(2, 3), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isActive } = req.body;
    await systemFunctions.updateSystem(id, name, isActive);
    res.json({ message: 'System updated successfully' });
  } catch (error) {
    console.error('Update system error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id/types', authenticateRole(2, 3), async (req, res) => {
  try {
    const { id } = req.params;
    await systemFunctions.getSystemTypesPerSystem(id, name, isActive);
    res.json({ message: 'System updated successfully' });
  } catch (error) {
    console.error('Update system error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/:id/types', authenticateRole(2, 3), async (req, res) => {
  try {
    const { idSystem } = req.params;
    const { name } = req.body;
    await systemFunctions.createSystemType(name, idSystem);
    res.status(201).json({ message: 'System type created successfully' });
  } catch (error) {
    console.error('Create system type error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id/types/:idType', authenticateRole(2, 3), async (req, res) => {
  try {
    const { id, idType } = req.params;
    const { name, isActive } = req.body;
    await systemFunctions.updateSystemType(idType, name, id, isActive);
    res.json({ message: 'System type updated successfully' });
  } catch (error) {
    console.error('Update system type error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/types/all', authenticateRole(2, 3), async (req, res) => {
  try {
    const systemTypes = await systemFunctions.getSystemTypesPerSystemWithNames();
    res.json(systemTypes);
  } catch (error) {
    console.error('Get system types error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



module.exports = router;