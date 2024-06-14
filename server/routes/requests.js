const express = require("express");
const { authenticateRole } = require("../auth");
const { requestFunctions, userFunctions, siteFunctions, clientFunctions } = require("../db");
const { generateUniqueFilenameWithUUID } = require("../utils/randomHelper");
const multer = require('multer');
const path = require('path');
const router = express.Router();
const fs = require('fs').promises;
const sendEmail = require("../utils/mailHelper");
const archiver = require('archiver');
require("dotenv").config();

function formatTime(datetimeString) {
  const date = new Date(datetimeString);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
}

function formatDate(dateString) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: 'UTC'
  };
  return new Date(dateString).toLocaleDateString('es-ES', options);
}

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../files'));
  },
  filename: function (req, file, cb) {
    const fileExtension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, fileExtension);
    const uniqueTextPart = generateUniqueFilenameWithUUID(file.originalname);
    const uniqueFileName = `${baseName}_${uniqueTextPart}`;
    cb(null, uniqueFileName);
  }
});

const upload = multer({ storage: storage });


router.post("/", authenticateRole(2, 5), async (req, res) => {
  try {
    let { idSite, code, type, scope, idSystem } = req.body;
    if (code === '')
      code = null;
    const result = await requestFunctions.create(
      idSite,
      code,
      type,
      scope,
      req.user.id,
      idSystem
    );

    const createdBy = await userFunctions.getById(req.user.id);
    let site = await siteFunctions.getById(idSite);

    const system = site.find(sys => sys.idSystem === idSystem);
    const systemName = system.systemName;

    site = site.at(0);
    const operators = await userFunctions.getOperators();

    const subject = "Nueva ST creada. Edintel";

    let body = "";
    if (code) {
      body = `
<html>
  <body>
    <p>El usuario ${createdBy.name} ${createdBy.lastname} a creado una nueva solicutud.</p>
    <p>La solicitud posee las siguientes características:</p>
    <p>
      <strong>Código ST:</strong> ${code}<br>
      <strong>Tipo solicitud:</strong> ${type === 1 ? "Correctiva" : "Preventiva"}<br>
      <strong>Cliente:</strong> ${site.clientName}<br>
      <strong>Sitio:</strong> ${site.name}<br>
      <strong>Sistema:</strong> ${systemName}<br>
      <strong>Alcance:</strong> ${scope}
    </p>
  </body>
</html>
`;
    }
    else {
      body = `
<html>
  <body>
    <p>El cliente ${createdBy.name} ${createdBy.lastname} a creado una nueva solicutud a la espera de asignarle código ST.</p>
    <p>La solicitud posee las siguientes características:</p>
    <p>
      <strong>Código ST:</strong> ${code}<br>
      <strong>Tipo solicitud:</strong> ${type === 1 ? "Correctiva" : "Preventiva"}<br>
      <strong>Cliente:</strong> ${site.clientName}<br>
      <strong>Sitio:</strong> ${site.name}<br>
      <strong>Sistema:</strong> ${systemName}<br>
      <strong>Alcance:</strong> ${scope}
    </p>
  </body>
</html>
`;
    }

    const recipients = operators.map((operator) => operator.email);
    sendEmail(subject, body, recipients);

    res.status(201).json({ message: result.message });
  } catch (error) {
    console.error("Create request error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/", authenticateRole(2, 3), async (req, res) => {
  try {
    const requests = await requestFunctions.getAll();
    res.json(requests);
  } catch (error) {
    console.error("Get requests error:", error);
    res.status(500).json({ message: error.message });
  }
});

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


router.post("/:id/assign", authenticateRole(2, 3), async (req, res) => {
  try {
    const { id } = req.params;
    const { idTechnician } = req.body;
    const request = await requestFunctions.getById(id);
    if (request.idTechnicianAssigned) {
      const pastTechnician = await userFunctions.getById(request.idTechnicianAssigned);
      const subject = `La solicitud código ${request.code} ha sido reasignada`;
      const emailBody = `
<html>
  <body>
    <p>Anteriormente la solicitud ${request.code} estaba asignada a usted pero la misma fue reasignada a otro técnico. La información de la ST era la siguiente:.</p>
    <p>
      <strong>Tipo solicitud:</strong> ${request.idType === 1 ? "Correctiva" : "Preventiva"}<br>
      <strong>Cliente:</strong> ${request.clientName}<br>
      <strong>Sitio:</strong> ${request.siteName}<br>
      <strong>Sistema:</strong> ${request.systemName}<br>
      <strong>Alcance:</strong> ${request.scope}<br>
      <strong>Fecha:</strong> ${request?.tentativeDate ? formatDate(request.tentativeDate) : "Sin asignar"}<br>
      <strong>Hora:</strong> ${request?.tentativeTime ? formatTime(request.tentativeTime) : "Sin asignar"}
    </p>
    <p>En caso de tener dudas con este proceso, comuníquese con su supervisor.</p>
  </body>
</html>
`;

      sendEmail(subject, emailBody, [pastTechnician.email]);
    }
    const result = await requestFunctions.assignTechnician(id, idTechnician);

    const subject = `La solicitud código ${request.code} se te ha asignado.`;
    const url = process.env.PAGE_URL;
    const emailBody = `
<html>
  <body>
    <p>La solicitud ${request.code} se te ha asignado. Esta posee las siguientes características:</p>
    <p>
      <strong>Tipo solicitud:</strong> ${request.idType === 1 ? "Correctiva" : "Preventiva"}<br>
      <strong>Cliente:</strong> ${request.clientName}<br>
      <strong>Sitio:</strong> ${request.siteName}<br>
      <strong>Sistema:</strong> ${request.systemName}<br>
      <strong>Alcance:</strong> ${request.scope}<br>
      <strong>Fecha:</strong> ${request?.tentativeDate ? formatDate(request.tentativeDate) : "Sin asignar"}<br>
      <strong>Hora:</strong> ${request?.tentativeTime ? formatTime(request.tentativeTime) : "Sin asignar"}
    </p>
    <p>Por favor entra a la página para reconocer la tarea tan pronto como veas este correo.</p>
    <p>Para más información, ingresa a la página de Edintel <a href="${url}">aquí</a>. Si después de esto, aún te quedan dudas, contacta a tu supervisor.</p>
  </body>
</html>
`;
    const actualTechnician = await userFunctions.getById(idTechnician);
    sendEmail(subject, emailBody, [actualTechnician.email]);
    res.json({ message: result.message });
  } catch (error) {
    console.error("Assign technician error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/:id/assignDateTime", authenticateRole(2, 3), async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time } = req.body;
    const result = await requestFunctions.assignTentativeDateTime(id, date, time);
    const request = await requestFunctions.getById(id);
    if(request.idTechnicianAssigned){
      const technician = await userFunctions.getById(request.idTechnicianAssigned);
      const subject = `Fecha y hora tentativa asginada a solicitud código ${request.code}.`;
      const emailBody = `
<html>
  <body>
    <p>La solicitud código ${request.code} que tienes asignada se le ha asignado una fecha y hora tentativa. Esta posee las siguientes características:</p>
    <p>
      <strong>Fecha:</strong> ${formatDate(request.tentativeDate)}<br>
      <strong>Hora:</strong> ${formatTime(request.tentativeTime)}
    </p>
    <p>Por favor tenerlo en consideración.</p>
  </body>
</html>
`;
      sendEmail(subject, emailBody, [technician.email]);
    }
    res.json({ message: result.message });
  } catch (error) {
    console.error("Assign DateTime error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/:id/ticketAndReport", authenticateRole(2, 3, 4), upload.fields([{ name: 'ticket', maxCount: 10 }, { name: 'report', maxCount: 1 }]), async (req, res) => {
  try {
    const { id } = req.params;
    const { ticket, report } = req.files;
    const request = await requestFunctions.getById(id);
    let ticketPaths = [];
    let reportPath = null;
    let ticketPathString = null;

    // Check if ticket files are provided
    if (ticket) {
      // Get the existing ticket paths
      let existingTicketPaths = await requestFunctions.getTicketPathOfRequest(id);
      existingTicketPaths = existingTicketPaths.ticketFilePath;

      // Delete the existing ticket files if they exist
      if (existingTicketPaths) {
        const existingTicketPathsArray = existingTicketPaths.split(';');
        for (const existingTicketPath of existingTicketPathsArray) {
          await fs.unlink(existingTicketPath);
        }
      }

      // Concatenate ticket filenames with a separator
      ticketPaths = ticket.map(file => file.path);
      ticketPathString = ticketPaths.join(';');
    }

    // Check if a report file is provided
    if (report) {
      // Get the existing report path
      let existingReportPath = await requestFunctions.getReportPathOfRequest(id);
      existingReportPath = existingReportPath.reportFilePath;

      // Delete the existing report file if it exists
      if (existingReportPath) {
        await fs.unlink(existingReportPath);
      }

      reportPath = report[0].path;
    }

    const result = await requestFunctions.assignTicketAndReportPathToRequest(id, ticketPathString, reportPath);

    const subject = `La solicitud ${request.code} ha sido finalizada.`;
    //TODO: Añadir link a la página de Edintel
    const body = `
<html>
  <body>
    <p>La solicitud ${request.code} ha sido finalizada.</p>
    <p>Las caracteríticas de esta ST son las siguientes:</p>
    <p>
      <strong>Tipo solicitud:</strong> ${request.idType === 1 ? "Correctiva" : "Preventiva"}<br>
      <strong>Cliente:</strong> ${request.clientName}<br>
      <strong>Sitio:</strong> ${request.siteName}<br>
      <strong>Sistema:</strong> ${request.systemName}<br>
      <strong>Alcance:</strong> ${request.scope}
    </p>
    <p>Por favor realizar la revisión de documentos para procesar el cierre de la misma.</p>
  </body>
</html>
`;

    if (request.idType === 1) {
      const operators = await userFunctions.getOperators();
      const operatorEmails = operators.map((operator) => operator.email);
      sendEmail(subject, body, operatorEmails);
    } else {
      const supervisors = await userFunctions.getSupervisors();
      const supervisorEmails = supervisors.map((supervisor) => supervisor.email);
      sendEmail(subject, body, supervisorEmails);
    }

    res.json({ message: result.message });
  } catch (error) {
    console.error("Assign TicketAndReport error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id/report", authenticateRole(1, 2, 3, 4, 5), async (req, res) => {
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



// Utility function to send a single ticket file
async function sendSingleTicket(res, filePath) {
  const fileName = path.basename(filePath);
  const file = await fs.readFile(filePath);
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.send(file);
}

// Utility function to send multiple ticket files as a zip
function sendMultipleTickets(res, ticketPaths, requestCode) {
  const archive = archiver('zip', { zlib: { level: 9 } });
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="boletas-${requestCode}.zip"`);

  ticketPaths.forEach(ticketPath => archive.file(ticketPath, { name: path.basename(ticketPath) }));
  archive.pipe(res);
  archive.finalize();
}

// Route handler to get ticket(s)
router.get("/:id/ticket", authenticateRole(1, 2, 3, 4, 5), async (req, res) => {
  try {
    const { id } = req.params;
    const request = await requestFunctions.getById(id);
    const result = await requestFunctions.getTicketPathOfRequest(id);

    if (result) {
      const ticketPaths = result.ticketFilePath.split(';');
      ticketPaths.length === 1
        ? await sendSingleTicket(res, ticketPaths[0])
        : sendMultipleTickets(res, ticketPaths, request.code);
    } else {
      res.status(404).json({ message: "Error: Boleta no encontrada" });
    }
  } catch (error) {
    console.error("Get ticket error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/:id/close", authenticateRole(1, 2, 3), async (req, res) => {
  try {
    const { id } = req.params;
    const request = await requestFunctions.getById(id);
    const result = await requestFunctions.close(id);
    const operators = await userFunctions.getOperators();
    const cierres = await userFunctions.getCierres();
    const subject = `La solicitud ${request.code} ha sido cerrada`;
    //TODO: Añadir link a la página de Edintel
    const body = `
<html>
  <body>
    <p>La solicitud ${request.code} ha sido cerrada.</p>
    <p>Las características de esta ST son las siguientes:</p>
    <p>
      <strong>Tipo solicitud:</strong> ${request.idType === 1 ? "Correctiva" : "Preventiva"}<br>
      <strong>Cliente:</strong> ${request.clientName}<br>
      <strong>Sitio:</strong> ${request.name}<br>
      <strong>Sistema:</strong> ${request.systemName}<br>
      <strong>Alcance:</strong> ${request.scope}
    </p>
    <p>Para mayor información, ver la información de la ST en la página. De igual manera, los documentos adjuntos están disponibles para su descarga.</p>
  </body>
</html>
`;

    const recipients = [...operators, ...cierres].map((recipient) => recipient.email);

    // Get the file paths of the report and ticket(s)
    const reportPath = await requestFunctions.getReportPathOfRequest(id);
    const ticketResult = await requestFunctions.getTicketPathOfRequest(id);
    const ticketPaths = ticketResult.ticketFilePath.split(';');

    // Combine the file paths into a single array
    const attachmentPaths = [reportPath.reportFilePath, ...ticketPaths];

    // Send the email with the attachments
    sendEmail(subject, body, recipients, attachmentPaths);

    res.json({ message: result.message });
  } catch (error) {
    console.error("Close request error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
