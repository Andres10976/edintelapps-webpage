const express = require('express');
const { authenticateRole } = require('../auth');
const { clientFunctions, systemFunctions, siteFunctions, requestFunctions } = require('../db');
const router = express.Router();

/**
 * @route POST /
 * @description Create a new client
 * @access Private
 * @param {Object} req.body - The request body
 * @param {string} req.body.name - The name of the client
 * @param {string} req.body.phone - The phone number of the client
 * @param {string} req.body.email - The email address of the client
 * @param {string} req.body.contactName - The name of the contact person
 * @param {string} req.body.contactLastName - The last name of the contact person
 * @param {string} req.body.contactPhone - The phone number of the contact person
 * @param {string} req.body.contactEmail - The email address of the contact person
 * @returns {Object}
 * @returns {string} message - A message indicating the result of the operation
 */
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

/**
 * @route GET /
 * @description Get a list of active clients
 * @access Private
 * @returns {Object[]}
 * @returns {number} id - The ID of the client
 * @returns {string} name - The name of the client
 * @returns {string} phone - The phone number of the client
 * @returns {string} email - The email address of the client
 * @returns {string} contactName - The name of the contact person
 * @returns {string} contactLastname - The last name of the contact person
 * @returns {string} contactEmail - The email address of the contact person
 * @returns {string} contactPhone - The phone number of the contact person
 * @returns {string} createdAt - The timestamp of when the client was created
 */
router.get('/', authenticateRole(2, 3), async (req, res) => {
  try {
    const clients = await clientFunctions.getAll();
    res.json(clients);
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route GET /:id
 * @description Get a client by their ID
 * @access Private
 * @param {string} req.params.id - The ID of the client to retrieve
 * @returns {Object}
 * @returns {number} id - The ID of the client
 * @returns {string} name - The name of the client
 * @returns {string} phone - The phone number of the client
 * @returns {string} email - The email address of the client
 * @returns {string} contactName - The name of the contact person
 * @returns {string} contactLastname - The last name of the contact person
 * @returns {string} contactEmail - The email address of the contact person
 * @returns {string} contactPhone - The phone number of the contact person
 * @returns {string} createdAt - The timestamp of when the client was created
 */
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

/**
 * @route PUT /:id
 * @description Update an existing client
 * @access Private
 * @param {string} req.params.id - The ID of the client to update
 * @param {Object} req.body - The request body
 * @param {string} req.body.name - The updated name of the client
 * @param {string} req.body.phone - The updated phone number of the client
 * @param {string} req.body.email - The updated email address of the client
 * @param {string} req.body.contactName - The updated name of the contact person
 * @param {string} req.body.contactLastName - The updated last name of the contact person
 * @param {string} req.body.contactPhone - The updated phone number of the contact person
 * @param {string} req.body.contactEmail - The updated email address of the contact person
 * @returns {Object}
 * @returns {string} message - A message indicating the result of the operation
 */
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

/**
 * @route GET /:id/sites
 * @description Get sites associated with a specific client
 * @access Private
 * @param {string} req.params.id - The ID of the client
 * @returns {Object[]}
 * @returns {number} id - The ID of the site
 * @returns {number} idClient - The ID of the client associated with the site
 * @returns {string} ClientName - The name of the client associated with the site
 * @returns {string} SupervisorName - The name of the supervisor for the site
 * @returns {number} idSystem - The ID of the system associated with the site
 * @returns {string} systemName - The name of the system associated with the site
 * @returns {number} idSystemType - The ID of the system type associated with the site
 * @returns {string} systemTypeName - The name of the system type associated with the site
 */
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

/**
 * @route POST /:id/sites
 * @description Create a new site for a specific client
 * @access Private
 * @param {string} req.params.id - The ID of the client
 * @param {Object} req.body - The request body
 * @param {string} req.body.name - The name of the site
 * @param {number} req.body.supervisor - The ID of the supervisor for the site
 * @returns {Object}
 * @returns {string} message - A message indicating the result of the operation
 */
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

/**
 * @route PUT /:id/sites/:idSite
 * @description Update an existing site
 * @access Private
 * @param {string} req.params.id - The ID of the client
 * @param {string} req.params.idSite - The ID of the site to update
 * @param {Object} req.body - The request body
 * @param {string} req.body.name - The updated name of the site
 * @param {number} req.body.supervisor - The updated ID of the supervisor for the site
 * @param {boolean} req.body.isActive - The updated active status of the site
 * @returns {Object}
 * @returns {string} message - A message indicating the result of the operation
 */
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

/**
 * @route GET /:id/sites/:idSite
 * @description Get a specific site by its ID
 * @access Private
 * @param {string} req.params.id - The ID of the client
 * @param {string} req.params.idSite - The ID of the site
 * @returns {Object}
 * @returns {number} id - The ID of the site
 * @returns {number} idClient - The ID of the client associated with the site
 * @returns {string} ClientName - The name of the client associated with the site
 * @returns {string} SupervisorName - The name of the supervisor for the site
 * @returns {number} idSystem - The ID of the system associated with the site
 * @returns {string} systemName - The name of the system associated with the site
 * @returns {number} idSystemType - The ID of the system type associated with the site
 * @returns {string} systemTypeName - The name of the system type associated with the site
 */
router.get('/:id/sites/:idSite', authenticateRole(2, 3, 5), async (req, res) => {
  try {
    const { id, idSite } = req.params;
    const site = await siteFunctions.getById(idSite);
    res.json(site);
  } catch (error) {
    console.error('Get site by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route GET /:id/sites/:idSite/systems
 * @description Get system types per site
 * @access Private
 * @param {string} req.params.id - The ID of the client
 * @param {string} req.params.idSite - The ID of the site
 * @returns {Object[]}
 * @returns {number} idSystem - The ID of the associated system
 * @returns {string} SystemName - The name of the associated system
 * @returns {number} idSystemType - The ID of the system type
 * @returns {string} SystemTypeName - The name of the system type
 */
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

/**
 * @route POST /:id/sites/:idSite/systems/assign
 * @description Assign a system to a site
 * @access Private
 * @param {string} req.params.id - The ID of the client
 * @param {string} req.params.idSite - The ID of the site
 * @param {Object} req.body - The request body
 * @param {number} req.body.idSystem - The ID of the system to assign
 * @param {number} req.body.idSystemType - The ID of the system type to assign
 * @returns {Object}
 * @returns {string} message - A message indicating the result of the operation
 */
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

/**
 * @route PUT /:id/sites/:idSite/systems/disassociate
 * @description Disassociate a system from a site
 * @access Private
 * @param {string} req.params.id - The ID of the client
 * @param {string} req.params.idSite - The ID of the site
 * @param {Object} req.body - The request body
 * @param {number} req.body.idSystem - The ID of the system to disassociate
 * @param {number} req.body.idSystemType - The ID of the system type to disassociate
 * @returns {Object}
 * @returns {string} message - A message indicating the result of the operation
 */
router.put('/:id/sites/:idSite/systems/disassociate', authenticateRole(2, 3), async (req, res) => {
  try {
    const { id, idSite } = req.params;
    const { idSystem, idSystemType } = req.body;
    await siteFunctions.disassociateSystem(idSite, idSystem, idSystemType);
    res.status(200).json({ message: 'System disassociated from site successfully' });
  } catch (error) {
    console.error('Disassociate system from site error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route GET /:id/sites/:idSite/requests
 * @description Get requests associated with a specific site
 * @access Private
 * @param {string} req.params.id - The ID of the client
 * @param {string} req.params.idSite - The ID of the site
 * @returns {Object[]}
 * @returns {number} id - The ID of the request
 * @returns {number} idSite - The ID of the site
 * @returns {string} siteName - The name of the site
 * @returns {string} code - The code of the request
 * @returns {number} idSystem - The ID of the system
 * @returns {string} systemName - The name of the system
 * @returns {number} idSystemType - The ID of the system type
 * @returns {string} systemTypeName - The name of the system type
 * @returns {number} idType - The ID of the request type
 * @returns {string} requestTypeName - The name of the request type
 * @returns {string} scope - The scope of the request
 * @returns {number} idStatus - The ID of the request status
 * @returns {string} statusName - The name of the request status
 * @returns {number} idCreatedBy - The ID of the user who created the request
 * @returns {string} createdByUsername - The username of the user who created the request
 * @returns {string} createdAt - The date and time when the request was created
 */
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


/**
 * @route POST /:id/sites/:idSite/requests
 * @description Create a new request for a specific site
 * @access Private
 * @param {string} req.params.id - The ID of the client
 * @param {string} req.params.idSite - The ID of the site
 * @param {Object} req.body - The request body
 * @param {string} req.body.code - The code of the request
 * @param {number} req.body.type - The type of the request
 * @param {string} req.body.scope - The scope of the request
 * @param {number} req.body.idSystem - The ID of the system
 * @param {number} req.body.idSystemType - The ID of the system type
 * @returns {Object}
 * @returns {string} message - A message indicating the result of the operation
 * @returns {number} idRequest - The ID of the created request (if successful)
 */
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

/**
 * @route GET /:id/sites/:idSite/requests/:idRequest
 * @description Get a specific request by its ID
 * @access Private
 * @param {string} req.params.id - The ID of the client
 * @param {string} req.params.idSite - The ID of the site
 * @param {string} req.params.idRequest - The ID of the request
 * @returns {Object}
 * @returns {number} id - The ID of the request
 * @returns {number} idSite - The ID of the site
 * @returns {string} siteName - The name of the site
 * @returns {string} code - The code of the request
 * @returns {number} idSystem - The ID of the system
 * @returns {string} systemName - The name of the system
 * @returns {number} idSystemType - The ID of the system type
 * @returns {string} systemTypeName - The name of the system type
 * @returns {number} idRequestType - The ID of the request type
 * @returns {string} requestTypeName - The name of the request type
 * @returns {string} scope - The scope of the request
 * @returns {number} idStatus - The ID of the request status
 * @returns {string} statusName - The name of the request status
 * @returns {number} idCreatedBy - The ID of the user who created the request
 * @returns {string} createdByUsername - The username of the user who created the request
 * @returns {string} createdAt - The date and time when the request was created
 * @returns {number} idTechnicianAssigned - The ID of the technician assigned to the request
 * @returns {string} technicianUsername - The username of the technician assigned to the request
 * @returns {string} technicianFullName - The full name of the technician assigned to the request
 * @returns {string} technicianAssignedDatetime - The date and time when the technician was assigned to the request
 * @returns {string} technicianAcknowledgeDatetime - The date and time when the technician acknowledged the request
 * @returns {string} technicianStartingWorkDatetime - The date and time when the technician started working on the request
 */
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

/**
 * @route PUT /:id/sites/:idSite/requests/:idRequest
 * @description Update a request
 * @access Private
 * @param {string} req.params.id - The ID of the client
 * @param {string} req.params.idRequest - The ID of the request to update
 * @param {Object} req.body - The request body
 * @param {number} req.body.idSite - The ID of the site
 * @param {string} req.body.code - The code of the request
 * @param {number} req.body.type - The type of the request
 * @param {string} req.body.scope - The scope of the request
 * @param {number} req.body.idSystem - The ID of the system
 * @returns {Object}
 * @returns {string} message - A message indicating the result of the operation
 */
router.put('/:id/sites/:idSite/requests/:idRequest', authenticateRole(2), async (req, res) => {
  try {
    const { id, idRequest } = req.params;
    const { code, type, scope, idSystem } = req.body;
    await requestFunctions.update(idRequest, id, code, type, scope, idSystem);
    res.status(200).json({ message: 'Request updated successfully' });
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;