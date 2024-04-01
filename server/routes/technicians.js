const express = require("express");
const { authenticateRole } = require("../auth");
const { requestFunctions } = require("../db");

const router = express.Router();

/**
 * @route GET /technicians/:id/requests
 * @description Get requests assigned to a specific technician.
 * @param {number} id - The ID of the technician.
 * @returns {Object[]} An array of request objects assigned to the technician.
 * @returns {number} request.id - The ID of the request.
 * @returns {number} request.idSite - The ID of the site.
 * @returns {string} request.siteName - The name of the site.
 * @returns {string} request.code - The code of the request.
 * @returns {number} request.idSystem - The ID of the system.
 * @returns {string} request.systemName - The name of the system.
 * @returns {number} request.idType - The ID of the request type.
 * @returns {string} request.requestTypeName - The name of the request type.
 * @returns {string} request.scope - The scope of the request.
 * @returns {number} request.idStatus - The ID of the request status.
 * @returns {string} request.statusName - The name of the request status.
 * @returns {number} request.idCreatedBy - The ID of the user who created the request.
 * @returns {string} request.createdByUsername - The username of the user who created the request.
 * @returns {string} request.createdAt - The date and time when the request was created.
 */
router.get("/:id/requests", authenticateRole(4, 3), async (req, res) => {
  try {
    const { id } = req.params;
    const requests = await requestFunctions.getByAssignedTechnician(id);
    res.status(200).json(requests);
  } catch (error) {
    console.error("Get requests by technician error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @route POST /technicians/:id/requests/:idRequest/acknowledge
 * @description Acknowledge a request by a technician.
 * @param {number} id - The ID of the technician.
 * @param {number} idRequest - The ID of the request.
 * @returns {Object} An object containing the success message.
 * @returns {string} message - The success message.
 */
router.post(
  "/:id/requests/:idRequest/acknowledge",
  authenticateRole(4, 3),
  async (req, res) => {
    try {
      const { id, idRequest } = req.params;
      await requestFunctions.acknowledgeTechnician(idRequest, req.user.id);
      res.json({ message: "Request acknowledged successfully" });
    } catch (error) {
      console.error("Acknowledge request error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

/**
 * @route POST /technicians/:id/requests/:idRequest/start
 * @description Start a request by a technician.
 * @param {number} id - The ID of the technician.
 * @param {number} idRequest - The ID of the request.
 * @returns {Object} An object containing the success message.
 * @returns {string} message - The success message.
 */
router.post(
  "/:id/requests/:idRequest/start",
  authenticateRole(4, 3),
  async (req, res) => {
    try {
      const { id, idRequest } = req.params;
      await requestFunctions.startTechnician(idRequest, req.user.id);
      res.json({ message: "Request started successfully" });
    } catch (error) {
      console.error("Start request error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

module.exports = router;
