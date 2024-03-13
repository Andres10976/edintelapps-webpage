const express = require('express');
const { authenticateRole } = require('../auth');
const { siteFunctions, requestFunctions, systemFunctions } = require('../db');

const router = express.Router();

router.post('/', authenticateRole(2, 3), async (req, res) => {
  try {
    const { idClient, name, supervisor } = req.body;
    await siteFunctions.create(idClient, name, supervisor);
    res.status(201).json({ message: 'Site created successfully' });
  } catch (error) {
    console.error('Create site error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/', authenticateRole(2, 3), async (req, res) => {
  try {
    const sites = await siteFunctions.getAll();
    res.json(sites);
  } catch (error) {
    console.error('Get sites error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', authenticateRole(2, 3), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, supervisor, isActive } = req.body;
    await siteFunctions.update(id, name, supervisor, isActive);
    res.status(201).json({ message: 'Site updated successfully' });
  } catch (error) {
    console.error('Update site error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id/requests', authenticateRole(2, 3), async (req, res) => {
  try {
    const { id } = req.params;
    const requests = await requestFunctions.getBySite(id);
    res.status(200).json(requests);
  } catch (error) {
    console.error('Get requests by site error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/:id/requests', authenticateRole(2), async (req, res) => {
  try {
    const { id } = req.params;
    const { code, type, scope, idSystem, idSystemType } = req.body;
    await requestFunctions.create(id, code, type, scope, req.user.id, idSystem, idSystemType);
    res.status(201).json({ message: 'Request created successfully' });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id/requests/:idRequest', authenticateRole(2, 3), async (req, res) => {
  try {
    const { id, idRequest } = req.params;
    const request = await requestFunctions.getById(idRequest);
    res.status(200).json(request);
  } catch (error) {
    console.error('Get request by id error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id/requests/:idRequest', authenticateRole(2), async (req, res) => {
  try {
    const { id, idRequest } = req.params;
    const { code, type, scope, idSystem } = req.body;
    await requestFunctions.update(idRequest, id, code, type, scope, idSystem);
    res.status(200).json(sites);
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id/systems', authenticateRole(2, 3), async (req, res) => {
  try {
    const { id } = req.params;
    const systems = await systemFunctions.getSystemTypesPerSite(id);
    res.json(systems);
  } catch (error) {
    console.error('Get systems per site error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/:id/systems/assign', authenticateRole(2, 3), async (req, res) => {
  try {
    const { id } = req.params;
    const { idSystem, idSystemType } = req.body;
    await siteFunctions.assignSystem(id, idSystem, idSystemType);
    res.json({ message: 'System assigned to site successfully' });
  } catch (error) {
    console.error('Assign system to site error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id/systems/disassociate', authenticateRole(2, 3), async (req, res) => {
  try {
    const { id } = req.params;
    const { idSystem, idSystemType } = req.body;
    await siteFunctions.disassociateSystem(id, idSystem, idSystemType);
    res.json({ message: 'System disassociated to site successfully' });
  } catch (error) {
    console.error('Disassociated system to site error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;