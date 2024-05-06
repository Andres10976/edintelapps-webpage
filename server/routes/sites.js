const express = require("express");
const { authenticateRole } = require("../auth");
const { siteFunctions, requestFunctions, systemFunctions } = require("../db");

const router = express.Router();

/**
 * @route POST /sites
 * @summary Create a new site
 * @param {object} req.body - The request body
 * @param {number} req.body.idClient - The ID of the client associated with the site
 * @param {string} req.body.name - The name of the site
 * @param {number} req.body.supervisor - The ID of the supervisor for the site
 * @returns {object} 201 - Success message
 * @returns {object} 500 - Internal server error
 */
router.post("/", authenticateRole(2, 3), async (req, res) => {
  try {
    const { idClient, name, supervisor } = req.body;
    const result = await siteFunctions.create(idClient, name, supervisor);
    res.status(201).json({ message: result.message });
  } catch (error) {
    console.error("Create site error:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /sites
 * @summary Get all sites
 * @returns {Array<object>} 200 - An array of site objects
 * @returns {object} 500 - Internal server error
 * @returns {Array<object>} site - A site object
 * @returns {number} site.id - The ID of the site
 * @returns {number} site.idClient - The ID of the client associated with the site
 * @returns {string} site.name - The name of the site
 * @returns {string} site.ClientName - The name of the client associated with the site
 * @returns {string} site.SupervisorName - The name of the supervisor for the site
 * @returns {number} site.idSystem - The ID of the system associated with the site
 * @returns {string} site.systemName - The name of the system associated with the site
 */
router.get("/", authenticateRole(2, 3), async (req, res) => {
  try {
    const sites = await siteFunctions.getAll();
    res.json(sites);
  } catch (error) {
    console.error("Get sites error:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /sites/{id}
 * @summary Get a site by id
 * @returns {object} 200 - An object site
 * @returns {object} 500 - Internal server error
 * @returns {object} site - A site object
 * @returns {number} site.id - The ID of the site
 * @returns {number} site.idClient - The ID of the client associated with the site
 * @returns {string} site.ClientName - The name of the client associated with the site
 * @returns {string} site.SupervisorName - The name of the supervisor for the site
 * @returns {number} site.idSystem - The ID of the system associated with the site
 * @returns {string} site.systemName - The name of the system associated with the site
 */
router.get("/:id", authenticateRole(2, 3, 5), async (req, res) => {
  try {
    const { id } = req.params;
    const site = await siteFunctions.getById(id);
    res.json(site);
  } catch (error) {
    console.error("Get site by id error:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route PUT /sites/{id}
 * @summary Update a site
 * @param {object} req.params - The request parameters
 * @param {number} req.params.id - The ID of the site to update
 * @param {object} req.body - The request body
 * @param {string} req.body.name - The updated name of the site
 * @param {number} req.body.supervisor - The updated ID of the supervisor for the site
 * @param {boolean} req.body.isActive - The updated active status of the site
 * @returns {object} 201 - Success message
 * @returns {object} 500 - Internal server error
 */
router.put("/:id", authenticateRole(2, 3), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, idClient, supervisor } = req.body;
    const result = await siteFunctions.update(id, name, supervisor, idClient);
    res.status(201).json({ message: result.message });
  } catch (error) {
    console.error("Update site error:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route DELETE /sites/{id}
 * @summary Delete a site
 * @param {object} req.params - The request parameters
 * @param {number} req.params.id - The ID of the site to delete
 * @returns {object} 201 - Success message
 * @returns {object} 500 - Internal server error
 */
router.delete("/:id", authenticateRole(2, 3), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, supervisor, isActive } = req.body;
    const result = await siteFunctions.delete(id, name, supervisor, isActive);
    res.status(201).json({ message: result.message });
  } catch (error) {
    console.error("Deleted site error:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /sites/{id}/requests
 * @summary Get requests associated with a specific site
 * @param {object} req.params - The request parameters
 * @param {number} req.params.id - The ID of the site
 * @returns {Array<object>} 200 - An array of request objects associated with the site
 * @returns {object} 500 - Internal server error
 * @returns {Array<object>} requests - An array of request objects
 * @returns {number} requests[].id - The ID of the request
 * @returns {number} requests[].idSite - The ID of the site
 * @returns {string} requests[].siteName - The name of the site
 * @returns {string} requests[].code - The code of the request
 * @returns {number} requests[].idSystem - The ID of the system
 * @returns {string} requests[].systemName - The name of the system
 * @returns {number} requests[].idType - The ID of the request type
 * @returns {string} requests[].requestTypeName - The name of the request type
 * @returns {string} requests[].scope - The scope of the request
 * @returns {number} requests[].idStatus - The ID of the request status
 * @returns {string} requests[].statusName - The name of the request status
 * @returns {number} requests[].idCreatedBy - The ID of the user who created the request
 * @returns {string} requests[].createdByUsername - The username of the user who created the request
 * @returns {string} requests[].createdAt - The date and time when the request was created
 */
router.get("/:id/requests", authenticateRole(2, 3, 5), async (req, res) => {
  try {
    const { id } = req.params;
    const requests = await requestFunctions.getBySite(id);
    res.status(200).json(requests);
  } catch (error) {
    console.error("Get requests by site error:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route POST /sites/{id}/requests
 * @summary Create a new request associated with a specific site
 * @param {object} req.params - The request parameters
 * @param {number} req.params.id - The ID of the site
 * @param {object} req.body - The request body
 * @param {string} req.body.code - The code of the request
 * @param {number} req.body.type - The type of the request
 * @param {string} req.body.scope - The scope of the request
 * @param {number} req.body.idSystem - The ID of the system
 * @returns {object} 201 - Success message
 * @returns {object} 500 - Internal server error
 */
router.post("/:id/requests", authenticateRole(2), async (req, res) => {
  try {
    const { id } = req.params;
    const { code, type, scope, idSystem } = req.body;
    const result = await requestFunctions.create(id, code, type, scope, req.user.id, idSystem);
    res.status(201).json({ message: result.message });
  } catch (error) {
    console.error("Create request error:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /sites/{id}/requests/{idRequest}
 * @summary Get a specific request associated with a site
 * @param {object} req.params - The request parameters
 * @param {number} req.params.id - The ID of the site
 * @param {number} req.params.idRequest - The ID of the request
 * @returns {object} 200 - The request object
 * @returns {object} 500 - Internal server error
 * @returns {object} request - The request object
 * @returns {number} request.id - The ID of the request
 * @returns {number} request.idSite - The ID of the site
 * @returns {string} request.siteName - The name of the site
 * @returns {string} request.code - The code of the request
 * @returns {number} request.idSystem - The ID of the system
 * @returns {string} request.systemName - The name of the system
 * @returns {number} request.idRequestType - The ID of the request type
 * @returns {string} request.requestTypeName - The name of the request type
 * @returns {string} request.scope - The scope of the request
 * @returns {number} request.idStatus - The ID of the request status
 * @returns {string} request.statusName - The name of the request status
 * @returns {number} request.idCreatedBy - The ID of the user who created the request
 * @returns {string} request.createdByUsername - The username of the user who created the request
 * @returns {string} request.createdAt - The date and time when the request was created
 * @returns {number} request.idTechnicianAssigned - The ID of the technician assigned to the request
 * @returns {string} request.technicianUsername - The username of the technician assigned to the request
 * @returns {string} request.technicianFullName - The full name of the technician assigned to the request
 * @returns {string} request.technicianAssignedDatetime - The date and time when the technician was assigned to the request
 * @returns {string} request.technicianAcknowledgeDatetime - The date and time when the technician acknowledged the request
 * @returns {string} request.technicianStartingWorkDatetime - The date and time when the technician started working on the request
 */
router.get(
  "/:id/requests/:idRequest",
  authenticateRole(2, 3),
  async (req, res) => {
    try {
      const { id, idRequest } = req.params;
      const request = await requestFunctions.getById(idRequest);
      res.status(200).json(request);
    } catch (error) {
      console.error("Get request by id error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @route PUT /sites/{id}/requests/{idRequest}
 * @summary Update a specific request associated with a site
 * @param {object} req.params - The request parameters
 * @param {number} req.params.id - The ID of the site
 * @param {number} req.params.idRequest - The ID of the request to update
 * @param {object} req.body - The request body
 * @param {string} req.body.code - The updated code of the request
 * @param {number} req.body.type - The updated type of the request
 * @param {string} req.body.scope - The updated scope of the request
 * @param {number} req.body.idSystem - The updated ID of the system
 * @returns {object} 200 - The updated request object
 * @returns {object} 500 - Internal server error
 */
router.put(
  "/:id/requests/:idRequest",
  authenticateRole(2),
  async (req, res) => {
    try {
      const { id, idRequest } = req.params;
      const { code, type, scope, idSystem } = req.body;
      await requestFunctions.update(idRequest, id, code, type, scope, idSystem);
      res.status(200).json(sites);
    } catch (error) {
      console.error("Update request error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @route GET /sites/{id}/systems
 * @summary Get systems associated with a specific site
 * @param {object} req.params - The request parameters
 * @param {number} req.params.id - The ID of the site
 * @returns {Array<object>} 200 - An array of system objects associated with the site
 * @returns {object} 500 - Internal server error
 * @returns {Array<object>} systems - An array of system objects
 * @returns {number} system[].idSystem - The ID of the associated system
 * @returns {string} system[].SystemName - The name of the associated system
 */
router.get("/:id/systems", authenticateRole(2, 3), async (req, res) => {
  try {
    const { id } = req.params;
    const systems = await systemFunctions.getSystemPerSite(id);
    res.json(systems);
  } catch (error) {
    console.error("Get systems per site error:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route POST /sites/{id}/systems/assign
 * @summary Assign a system to a site
 * @param {object} req.params - The request parameters
 * @param {number} req.params.id - The ID of the site
 * @param {object} req.body - The request body
 * @param {number} req.body.idSystem - The ID of the system to assign
 * @returns {object} 200 - Success message
 * @returns {object} 500 - Internal server error
 */
router.post("/:id/systems/assign", authenticateRole(2, 3), async (req, res) => {
  try {
    const { id } = req.params;
    const { idSystem } = req.body;
    const result = await siteFunctions.assignSystem(id, idSystem);
    res.json({ message: result.message });
  } catch (error) {
    console.error("Assign system to site error:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route PUT /sites/{id}/systems/disassociate
 * @summary Disassociate a system from a site
 * @param {object} req.params - The request parameters
 * @param {number} req.params.id - The ID of the site
 * @param {object} req.body - The request body
 * @param {number} req.body.idSystem - The ID of the system to disassociate
 * @returns {object} 200 - Success message
 * @returns {object} 500 - Internal server error
 */
router.put(
  "/:id/systems/disassociate",
  authenticateRole(2, 3),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { idSystem } = req.body;
      const result = await siteFunctions.disassociateSystem(id, idSystem);
      res.json({ message: result.message });
    } catch (error) {
      console.error("Disassociate system from site error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
