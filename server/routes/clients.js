const express = require('express');
const { authenticateRole } = require('../auth');
const { clientFunctions, systemFunctions, siteFunctions, requestFunctions } = require('../db');
const router = express.Router();

router.post('/', authenticateRole(2), async (req, res) => {
  try {
    const { name, phone, email, contactName, contactLastName, contactPhone, contactEmail } = req.body;
    await clientFunctions.create(name, phone, email, contactName, contactLastName, contactPhone, contactEmail);
    res.status(201).json({ message: 'Client created successfully' });
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/', authenticateRole(2, 3), async (req, res) => {
  try {
    const clients = await clientFunctions.getAll();
    res.json(clients);
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', authenticateRole(2, 3, 5), async (req, res) => {
  try {
    const { id } = req.params;
    const client = await clientFunctions.get(id);
    if (client) {
      res.json(client);
    } else {
      res.status(404).json({ message: 'Client not found' });
    }
  } catch (error) {
    console.error('Get client by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', authenticateRole(2, 3), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, contactName, contactLastName, contactPhone, contactEmail } = req.body;
    await clientFunctions.update(id, name, phone, email, contactName, contactLastName, contactPhone, contactEmail);
    res.status(200).json({ message: 'Client updated successfully' });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id/sites', authenticateRole(2, 3, 5), async (req, res) => {
  try {
    const { id } = req.params;
    const sites = await siteFunctions.getByClient(id);
    res.json(sites);
  } catch (error) {
    console.error('Get sites per client error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/:id/sites', authenticateRole(2), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, supervisor } = req.body;
    await siteFunctions.create(id, name, supervisor);
    res.status(201).json({ message: 'Site created successfully' });
  } catch (error) {
    console.error('Create site error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id/sites/:idSite', authenticateRole(2), async (req, res) => {
  try {
    const { id, idSite } = req.params;
    const { name, supervisor, isActive } = req.body;
    await siteFunctions.update(idSite, name, supervisor, isActive);
    res.status(200).json({ message: 'Site updated successfully' });
  } catch (error) {
    console.error('Site update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id/sites/:idSite', authenticateRole(2, 3, 5), async (req, res) => {
  try {
    const { id, idSite } = req.params;
    const sites = await siteFunctions.getById(idSite);
    res.json(sites);
  } catch (error) {
    console.error('Get sites per id error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id/sites/:idSite/systems', authenticateRole(2, 3, 5), async (req, res) => {
  try {
    const { id, idSite } = req.params;
    const systems = await systemFunctions.getSystemTypesPerSite(idSite);
    res.json(systems);
  } catch (error) {
    console.error('Get systems per site error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/:id/sites/:idSite/systems/assign', authenticateRole(2, 3), async (req, res) => {
  try {
    const { id, idSite } = req.params;
    const { idSystem, idSystemType } = req.body;
    await siteFunctions.assignSystem(idSite, idSystem, idSystemType);
    res.status(200).json({ message: 'System assigned to site successfully' });
  } catch (error) {
    console.error('Assign system to site error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id/sites/:idSite/systems/disassociate', authenticateRole(2, 3), async (req, res) => {
  try {
    const { id, idSite } = req.params;
    const { idSystem, idSystemType } = req.body;
    await siteFunctions.disassociateSystem(idSite, idSystem, idSystemType);
    res.status(200).json({ message: 'System disassociated to site successfully' });
  } catch (error) {
    console.error('Disassociated system to site error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id/sites/:idSite/requests', authenticateRole(2, 3), async (req, res) => {
  try {
    const { id, idSite } = req.params;
    const requests = await requestFunctions.getBySite(idSite);
    res.status(201).json(requests);
  } catch (error) {
    console.error('Get requests by site error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/:id/sites/:idSite/requests', authenticateRole(2, 5), async (req, res) => {
  try {
    const { id, idSite } = req.params;
    const { code, type, scope, idSystem, idSystemType } = req.body;
    await requestFunctions.create(idSite, code, type, scope, req.user.id, idSystem, idSystemType);
    res.status(201).json({ message: 'Request created successfully' });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id/sites/:idSite/requests/:idRequest', authenticateRole(2, 3), async (req, res) => {
  try {
    const { id, idSite, idRequest } = req.params;
    const request = await requestFunctions.getById(idRequest);
    res.status(201).json(request);
  } catch (error) {
    console.error('Get request by id error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id/sites/:idSite/requests/:idRequest', authenticateRole(2), async (req, res) => {
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

module.exports = router;