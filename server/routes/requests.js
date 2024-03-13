const express = require('express');
const { authenticateRole } = require('../auth');
const { requestFunctions, userFunctions } = require('../db');

const router = express.Router();

router.post('/', authenticateRole(2), async (req, res) => {
  try {
    const { idSite, code, type, scope, idSystem, idSystemType } = req.body;
    await requestFunctions.create(idSite, code, type, scope, req.user.id, idSystem, idSystemType);
    res.status(201).json({ message: 'Request created successfully' });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/', authenticateRole(2, 3), async (req, res) => {
  try {
    const requests = await requestFunctions.getAll();
    res.json(requests);
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', authenticateRole(2), async (req, res) => {
  try {
    const { id } = req.params;
    const { idSite, code, type, scope, idSystem } = req.body;
    await requestFunctions.update(id, idSite, code, type, scope, idSystem);
    res.json({ message: 'Request updated successfully' });
  } catch (error) {
    console.error('Request update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', authenticateRole(2,3), async (req, res) => {
  try {
    const { id } = req.params;
    await requestFunctions.getById(id);
    res.json({ message: 'Request by id obtained successfully' });
  } catch (error) {
    console.error('Obtain by id request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.post('/:id/assign', authenticateRole(2,3), async (req, res) => {
  try {
    const { id } = req.params;
    const { idTechnician } = req.body;
    await requestFunctions.assignTechnician(id, idTechnician);
    res.json({ message: 'Technician assigned successfully' });
  } catch (error) {
    console.error('Assign technician error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;