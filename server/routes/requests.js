const express = require("express");
const { authenticateRole } = require("../auth");
const { requestFunctions } = require("../db");
const { generateUniqueFilenameWithUUID } = require("../utils/randomHelper");
const multer = require('multer');
const path = require('path');
const router = express.Router();
const fs = require('fs').promises;

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../files'));
  },
  filename: function (req, file, cb) {
    const uniqueFileName = generateUniqueFilenameWithUUID(file.originalname);
    cb(null, uniqueFileName);
  }
});

const upload = multer({ storage: storage });

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
 * @returns {Object}
 * @returns {string} message - A message indicating the result of the operation
 */
router.post("/", authenticateRole(2, 5), async (req, res) => {
  try {
    let { idSite, code, type, scope, idSystem } = req.body;
    if(code === '')
      code = null;
    const result = await requestFunctions.create(
      idSite,
      code,
      type,
      scope,
      req.user.id,
      idSystem
    );
    res.status(201).json({ message: result.message });
  } catch (error) {
    console.error("Create request error:", error);
    res.status(500).json({ message: error.message });
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
 * @returns {number} requests[].idType - The ID of the request type
 * @returns {string} requests[].requestTypeName - The name of the request type
 * @returns {string} requests[].scope - The scope of the request
 * @returns {number} requests[].idStatus - The ID of the request status
 * @returns {string} requests[].statusName - The name of the request status
 * @returns {number} requests[].idCreatedBy - The ID of the user who created the request
 * @returns {string} requests[].createdByUsername - The username of the user who created the request
 * @returns {Date} requests[].createdAt - The date and time when the request was created
 */
router.get("/", authenticateRole(2, 3), async (req, res) => {
  try {
    const requests = await requestFunctions.getAll();
    res.json(requests);
  } catch (error) {
    console.error("Get requests error:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /types
 * @description Get all request types
 * @access Private
 * @returns {Object[]} requestsTypes - An array of request objects
 * @returns {number} requestTypes[].id - The ID of the request type
 * @returns {number} requestTypes[].name - The name of the request type
 */
router.get("/types", authenticateRole(2, 3), async (req, res) => {
  try {
    const requestTypes = await requestFunctions.getTypes();
    res.json(requestTypes);
  } catch (error) {
    console.error("Get request types error:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /status
 * @description Get all request status
 * @access Private
 * @returns {Object[]} requestStatus - An array of request objects
 * @returns {number} requestStatus[].id - The ID of the request status
 * @returns {number} requestStatus[].name - The name of the request status
 */
router.get("/statuses", authenticateRole(2, 3), async (req, res) => {
  try {
    const requestStatus = await requestFunctions.getStatus();
    res.json(requestStatus);
  } catch (error) {
    console.error("Get request status error:", error);
    res.status(500).json({ message: error.message });
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
router.put("/:id", authenticateRole(2), async (req, res) => {
  try {
    const { id } = req.params;
    const { idSite, code, type, scope, idSystem } = req.body;
    const result = await requestFunctions.update(id, idSite, code, type, scope, idSystem);
    res.json({ message: result.message });
  } catch (error) {
    console.error("Request update error:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route DELETE /:id
 * @description Deletes a request
 * @access Private
 * @param {string} req.params.id - The ID of the request to update
 * @returns {Object}
 * @returns {string} message - A message indicating the result of the operation
 */
router.delete("/:id", authenticateRole(2), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await requestFunctions.delete(id);
    res.json({ message: result.message });
  } catch (error) {
    console.error("Request deleted error:", error);
    res.status(500).json({ message: error.message });
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
router.get("/:id", authenticateRole(2, 3), async (req, res) => {
  try {
    const { id } = req.params;
    const request = await requestFunctions.getById(id);
    res.json(request);
  } catch (error) {
    console.error("Obtain by id request error:", error);
    res.status(500).json({ message: error.message });
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
router.post("/:id/assign", authenticateRole(2, 3), async (req, res) => {
  try {
    const { id } = req.params;
    const { idTechnician } = req.body;
    const request = await requestFunctions.getById(id);
    `if(request.idTechnicianAssigned){
      //Se envia correo diciendo que se deshafilio a la solicitud
    }`
    const result = await requestFunctions.assignTechnician(id, idTechnician);
    res.json({ message: result.message });
  } catch (error) {
    console.error("Assign technician error:", error);
    res.status(500).json({ message: error.message });
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
router.post("/:id/assignDateTime", authenticateRole(2, 3), async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time } = req.body;
    const result = await requestFunctions.assignTentativeDateTime(id, date, time);

    res.json({ message: result.message });
  } catch (error) {
    console.error("Assign DateTime error:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route POST /:id/ticketAndReport
 * @description Assign a technician to a request
 * @access Private
 * @param {string} req.params.id - The ID of the request
 * @param {Object} req.body - The request body
 * @param {File} req.body.ticket - The ticket to be saved.
 * @param {File} req.body.report - The ticket to be saved. 
* @returns {Object}
 * @returns {string} message - A message indicating the result of the operation
 */
router.post("/:id/ticketAndReport", authenticateRole(1,2,3,4), upload.fields([{ name: 'ticket', maxCount: 1 }, { name: 'report', maxCount: 1 }]), async (req, res) => {
  try {
    const { id } = req.params;
    const { ticket, report } = req.files;

    let ticketPath = null;
    let reportPath = null;

    // Check if a ticket file is provided
    if (ticket) {
      // Get the existing ticket path
      let existingTicketPath = await requestFunctions.getTicketPathOfRequest(id);
      existingTicketPath = existingTicketPath.ticketFilePath
      // Delete the existing ticket file if it exists
      if (existingTicketPath) {
        await fs.unlink(existingTicketPath);
      }
      
      ticketPath = ticket[0].path;

    }

    // Check if a report file is provided
    if (report) {
      // Get the existing report path
      let existingReportPath = await requestFunctions.getReportPathOfRequest(id);
      existingReportPath = existingReportPath.reportFilePath
      
      // Delete the existing report file if it exists
      if (existingReportPath) {
        await fs.unlink(existingReportPath);
      }
      
      reportPath = report[0].path;
      console.log("reportPath: ", reportPath);
    }

    const result = await requestFunctions.assignTicketAndReportPathToRequest(id, ticketPath, reportPath);
    res.json({ message: result.message });
  } catch (error) {
    console.error("Assign TicketAndReport error:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /:id/report
 * @description Get the report of a request.
 * @access Private
 * @param {string} req.params.id - The ID of the request
 * @param {Object} req.body - The request body
* @returns {Object}
 * @returns {File} message - A message indicating the result of the operation
 */
router.get("/:id/report", authenticateRole(1,2,3,5), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await requestFunctions.getReportPathOfRequest(id);
    if (result) {
      res.download(result.reportFilePath);
    } else {
      res.status(404).json({ message: "Error: Reporte no encontrado" });
    }
  } catch (error) {
    console.error("Get report error:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /:id/ticket
 * @description Get the ticket of a request.
 * @access Private
 * @param {string} req.params.id - The ID of the request
 * @param {Object} req.body - The request body
* @returns {Object}
 * @returns {File} message - A message indicating the result of the operation
 */
router.get("/:id/ticket", authenticateRole(1,2,3,5), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await requestFunctions.getTicketPathOfRequest(id);
    if (result) {
      res.download(result.ticketFilePath);
    } else {
      res.status(404).json({ message: "Error: Boleta no encontrada" });
    }
  } catch (error) {
    console.error("Get ticket error:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route POST /:id/close
 * @description Close a request.
 * @access Private
 * @param {string} req.params.id - The ID of the request
 * @returns {Object}
 * @returns {string} message - A message indicating the result of the operation
 */
router.post("/:id/close", authenticateRole(1,2), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await requestFunctions.close(id);

    res.json({ message: result.message });
  } catch (error) {
    console.error("Close request error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
