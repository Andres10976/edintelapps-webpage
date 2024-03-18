const express = require('express');
const { authenticateRole } = require('../auth');
const { requestFunctions } = require('../db');

const router = express.Router();

/**
 * @route POST /
 * @description Create a new request
 * @access Private
 * @param {Object} req.body - The request body
 * @param {number} req.body.idSite - The ID of the site
 * @param {string} req.body.code - The code of the request
 * @param {number} req.body.type - The type of the request
 * @param {string} req.body.scope - The scope of the request
 * @param {number} req.body.idSystem - The ID of the system
 * @param {number} req.body.idSystemType - The ID of the system type
 * @returns {Object} 
 * @returns {string} message - A message indicating the result of the operation
 */
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

/**
 * @route GET /
 * @description Get all requests
 * @access Private
 * @returns {Object[]} requests - An array of request objects
 * @returns {number} requests[].id - The ID of the request
 * @returns {number} requests[].idSite - The ID of the site
 * @returns {string} requests[].siteName - The name of the site
 * @returns {string} requests[].code - The code of the request
 * @returns {number} requests[].idSystem - The ID of the system
 * @returns {string} requests[].systemName - The name of the system
 * @returns {number} requests[].idSystemType - The ID of the system type
 * @returns {string} requests[].systemTypeName - The name of the system type
 * @returns {number} requests[].idType - The ID of the request type
 * @returns {string} requests[].requestTypeName - The name of the request type
 * @returns {string} requests[].scope - The scope of the request
 * @returns {number} requests[].idStatus - The ID of the request status
 * @returns {string} requests[].statusName - The name of the request status
 * @returns {number} requests[].idCreatedBy - The ID of the user who created the request
 * @returns {string} requests[].createdByUsername - The username of the user who created the request
 * @returns {Date} requests[].createdAt - The date and time when the request was created
 */
router.get('/', authenticateRole(2, 3), async (req, res) => {
  try {
    const requests = await requestFunctions.getAll();
    res.json(requests);
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route PUT /:id
 * @description Update a request
 * @access Private
 * @param {string} req.params.id - The ID of the request to update
 * @param {Object} req.body - The request body
 * @param {number} req.body.idSite - The ID of the site
 * @param {string} req.body.code - The code of the request
 * @param {number} req.body.type - The type of the request
 * @param {string} req.body.scope - The scope of the request
 * @param {number} req.body.idSystem - The ID of the system
 * @returns {Object}
 * @returns {string} message - A message indicating the result of the operation
 */
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

/**
 * @route GET /:id
 * @description Get a request by ID
 * @access Private
 * @param {string} req.params.id - The ID of the request
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
 * @returns {Date} createdAt - The date and time when the request was created
 * @returns {number} idTechnicianAssigned - The ID of the technician assigned to the request
 * @returns {string} technicianUsername - The username of the technician assigned to the request
 * @returns {string} technicianFullName - The full name of the technician assigned to the request
 * @returns {Date} technicianAssignedDatetime - The date and time when the technician was assigned to the request
 * @returns {Date} technicianAcknowledgeDatetime - The date and time when the technician acknowledged the request
 * @returns {Date} technicianStartingWorkDatetime - The date and time when the technician started working on the request
 */
router.get('/:id', authenticateRole(2, 3), async (req, res) => {
  try {
    const { id } = req.params;
    const request = await requestFunctions.getById(id);
    res.json(request);
  } catch (error) {
    console.error('Obtain by id request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route POST /:id/assign
 * @description Assign a technician to a request
 * @access Private
 * @param {string} req.params.id - The ID of the request
 * @param {Object} req.body - The request body
 * @param {number} req.body.idTechnician - The ID of the technician to assign
 * @returns {Object}
 * @returns {string} message - A message indicating the result of the operation
 */
router.post('/:id/assign', authenticateRole(2, 3), async (req, res) => {
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