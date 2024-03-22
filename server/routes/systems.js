const express = require('express');
const { authenticateRole } = require('../auth');
const { systemFunctions } = require('../db');

const router = express.Router();

/**
 * @route POST /
 * @description Create a new system
 * @access Private (Roles: 2, 3)
 * @param {Object} req.body - The request body
 * @param {string} req.body.name - The name of the system
 * @returns {Object} 201 - An object with a success message
 * @returns {Object} 500 - An object with an error message
 */
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



/**
 * @route GET /
 * @description Get a list of active systems
 * @access Private (Roles: 2, 3)
 * @returns {Object[]} 200 - An array of system objects
 * @returns {number} 200.id - The ID of the system
 * @returns {string} 200.name - The name of the system
 * @returns {Object} 500 - An object with an error message
 */
router.get('/', authenticateRole(2, 3), async (req, res) => {
  try {
    const systems = await systemFunctions.getSystems();
    res.json(systems);
  } catch (error) {
    console.error('Get systems error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route PUT /:id
 * @description Update an existing system
 * @access Private (Roles: 2, 3)
 * @param {Object} req.params - The request parameters
 * @param {number} req.params.id - The ID of the system to update
 * @param {Object} req.body - The request body
 * @param {string} req.body.name - The updated name of the system
 * @param {boolean} req.body.isActive - The updated active status of the system
 * @returns {Object} 200 - An object with a success message
 * @returns {Object} 500 - An object with an error message
 */
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

/**
 * @route DELETE /
 * @description Delete an existing system
 * @access Private (Roles: 2, 3)
 * @param {Object} req.params - The request body
 * @returns {Object} 201 - An object with a success message
 * @returns {Object} 500 - An object with an error message
 */
router.delete('/:id', authenticateRole(2, 3), async (req, res) => {
  try {
    const { id } = req.params;
    await systemFunctions.deleteSystem(id);
    res.status(201).json({ message: 'System deleted successfully' });
  } catch (error) {
    console.error('Delete system error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route GET /:id/types
 * @description Get a list of active system types for a specific system
 * @access Private (Roles: 2, 3)
 * @param {Object} req.params - The request parameters
 * @param {number} req.params.id - The ID of the system
 * @returns {Object[]} 200 - An array of system type objects
 * @returns {number} 200.id - The ID of the system type
 * @returns {string} 200.name - The name of the system type
 * @returns {number} 200.idSystem - The ID of the associated system
 * @returns {string} 200.systemName - The name of the associated system
 * @returns {Object} 500 - An object with an error message
 */
router.get('/:id/types', authenticateRole(2, 3), async (req, res) => {
  try {
    const { id } = req.params;
    const systemTypes = await systemFunctions.getSystemTypesPerSystem(id);
    res.json(systemTypes);
  } catch (error) {
    console.error('Get system types error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route POST /:id/types
 * @description Create a new system type for a specific system
 * @access Private (Roles: 2, 3)
 * @param {Object} req.params - The request parameters
 * @param {number} req.params.id - The ID of the system
 * @param {Object} req.body - The request body
 * @param {string} req.body.name - The name of the system type
 * @returns {Object} 201 - An object with a success message
 * @returns {Object} 500 - An object with an error message
 */
router.post('/:id/types', authenticateRole(2, 3), async (req, res) => {
  try {
    const { id: idSystem } = req.params;
    const { name } = req.body;
    await systemFunctions.createSystemType(name, idSystem);
    res.status(201).json({ message: 'System type created successfully' });
  } catch (error) {
    console.error('Create system type error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route PUT /:id/types/:idType
 * @description Update an existing system type
 * @access Private (Roles: 2, 3)
 * @param {Object} req.params - The request parameters
 * @param {number} req.params.id - The ID of the system
 * @param {number} req.params.idType - The ID of the system type
 * @param {Object} req.body - The request body
 * @param {string} req.body.name - The updated name of the system type
 * @param {boolean} req.body.isActive - The updated active status of the system type
 * @returns {Object} 200 - An object with a success message
 * @returns {Object} 500 - An object with an error message
 */
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

/**
 * @route DELETE /:id/types/:idType
 * @description Delete an existing system type
 * @access Private (Roles: 2, 3)
 * @param {Object} req.params - The request parameters
 * @param {number} req.params.id - The ID of the system
 * @param {number} req.params.idType - The ID of the system type
 * @returns {Object} 200 - An object with a success message
 * @returns {Object} 500 - An object with an error message
 */
router.delete('/:id/types/:idType', authenticateRole(2, 3), async (req, res) => {
  try {
    const { id, idType } = req.params;
    await systemFunctions.deleteSystemType(idType);
    res.json({ message: 'System type deleted successfully' });
  } catch (error) {
    console.error('Delete system type error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route GET /types/all
 * @description Get a list of active system types with their associated system names
 * @access Private (Roles: 2, 3)
 * @returns {Object[]} 200 - An array of system type objects
 * @returns {number} 200.idSystem - The ID of the associated system
 * @returns {string} 200.SystemName - The name of the associated system
 * @returns {number} 200.idSystemType - The ID of the system type
 * @returns {string} 200.SystemTypeName - The name of the system type
 * @returns {Object} 500 - An object with an error message
 */
router.get('/types/all', authenticateRole(2, 3, 5), async (req, res) => {
  try {
    const systemTypes = await systemFunctions.getSystemTypesPerSystemWithNames();
    res.json(systemTypes);
  } catch (error) {
    console.error('Get system types error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;