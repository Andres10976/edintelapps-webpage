const express = require("express");
const { authenticateRole } = require("../auth");
const {
  clientFunctions,
  systemFunctions,
  siteFunctions,
  requestFunctions,
} = require("../db");
const router = express.Router();


router.post("/", authenticateRole(2), async (req, res) => {
  try {
    const {
      name,
      companyId
    } = req.body;
    const result = await clientFunctions.create(
      name,
      companyId
    );
    res.status(201).json({ message: result.message });
  } catch (error) {
    console.error("Create client error:", error);
    res.status(500).json({ message: error.message });
  }
});


router.get("/", authenticateRole(2, 3), async (req, res) => {
  try {
    const clients = await clientFunctions.getAll();
    res.json(clients);
  } catch (error) {
    console.error("Get clients error:", error);
    res.status(500).json({ message: error.message});
  }
});


router.get("/:id", authenticateRole(2, 3, 5), async (req, res) => {
  try {
    const { id } = req.params;
    const client = await clientFunctions.get(id);
    if (client) {
      res.json(client);
    } else {
      res.status(404).json({ message: "Edificio no encontrado" });
    }
  } catch (error) {
    console.error("Get client by ID error:", error);
    res.status(500).json({ message: error.message });
  }
});


router.put("/:id", authenticateRole(2, 3), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      companyId
    } = req.body;
    const result = await clientFunctions.update(
      id,
      name,
      companyId
    );
    res.status(200).json({ message: result.message });
  } catch (error) {
    console.error("Update client error:", error);
    res.status(500).json({ message: error.message });
  }
});


router.delete("/:id", authenticateRole(2, 3), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await clientFunctions.delete(id);
    res.status(200).json({ message: result.message });
  } catch (error) {
    console.error("Delete client error:", error);
    res.status(500).json({ message: error.message });
  }
});


router.get("/:id/sites", authenticateRole(2, 3, 5), async (req, res) => {
  try {
    const { id } = req.params;
    const sites = await siteFunctions.getByClient(id);
    res.json(sites);
  } catch (error) {
    console.error("Get sites per client error:", error);
    res.status(500).json({ message: error.message});
  }
});


router.get("/:id/requests", authenticateRole(2, 3, 5), async (req, res) => {
  try {
    const { id } = req.params;
    const requests = await requestFunctions.getByClient(id);
    res.json(requests);
  } catch (error) {
    console.error("Get requests per client error:", error);
    res.status(500).json({ message: error.message });
  }
});


router.post("/:id/sites", authenticateRole(2), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, supervisor, contactName, contactPhone, contactMail, address } = req.body;
    const result = await siteFunctions.create(id, name, supervisor, contactName, contactPhone, contactMail, address);
    res.status(201).json({ message: result.message });
  } catch (error) {
    console.error("Create site error:", error);
    res.status(500).json({ message: error.message });
  }
});


router.put("/:id/sites/:idSite", authenticateRole(2), async (req, res) => {
  try {
    const { id, idSite } = req.params;
    const { name, supervisor, contactName, contactPhone, contactMail, address } = req.body;
    const result = await siteFunctions.update(idSite, name, supervisor, id, contactName, contactMail, contactPhone, address );
    res.status(200).json({ message: result.message });
  } catch (error) {
    console.error("Site update error:", error);
    res.status(500).json({ message: error.message });
  }
});


router.get(
  "/:id/sites/:idSite",
  authenticateRole(2, 3, 5),
  async (req, res) => {
    try {
      const { id, idSite } = req.params;
      const site = await siteFunctions.getById(idSite);
      res.json(site);
    } catch (error) {
      console.error("Get site by ID error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);


router.get(
  "/:id/sites/:idSite/systems",
  authenticateRole(2, 3, 5),
  async (req, res) => {
    try {
      const { id, idSite } = req.params;
      const systems = await systemFunctions.getSystemPerSite(idSite);
      res.json(systems);
    } catch (error) {
      console.error("Get systems per site error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);


router.post(
  "/:id/sites/:idSite/systems/assign",
  authenticateRole(2, 3),
  async (req, res) => {
    try {
      const { id, idSite } = req.params;
      const { idSystem } = req.body;
      const result = await siteFunctions.assignSystem(idSite, idSystem);
      res.status(200).json({ message: result.message });
    } catch (error) {
      console.error("Assign system to site error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);


router.put(
  "/:id/sites/:idSite/systems/dissociate",
  authenticateRole(2, 3),
  async (req, res) => {
    try {
      const { id, idSite } = req.params;
      const { idSystem } = req.body;
      const result = await siteFunctions.dissociateSystem(idSite, idSystem);
      res
        .status(200)
        .json({ message: result.message });
    } catch (error) {
      console.error("Disassociate system from site error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);


router.get(
  "/:id/sites/:idSite/requests",
  authenticateRole(2, 3),
  async (req, res) => {
    try {
      const { id, idSite } = req.params;
      const requests = await requestFunctions.getBySite(idSite);
      res.status(201).json(requests);
    } catch (error) {
      console.error("Get requests by site error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);


router.post(
  "/:id/sites/:idSite/requests",
  authenticateRole(2, 5),
  async (req, res) => {
    try {
      const { id, idSite } = req.params;
      const { code, type, scope, idSystem } = req.body;
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
  }
);


router.get(
  "/:id/sites/:idSite/requests/:idRequest",
  authenticateRole(2, 3),
  async (req, res) => {
    try {
      const { id, idSite, idRequest } = req.params;
      const request = await requestFunctions.getById(idRequest);
      res.status(201).json(request);
    } catch (error) {
      console.error("Get request by id error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);


router.put(
  "/:id/sites/:idSite/requests/:idRequest",
  authenticateRole(2),
  async (req, res) => {
    try {
      const { id, idRequest } = req.params;
      const { code, type, scope, idSystem } = req.body;
      const result = await requestFunctions.update(idRequest, id, code, type, scope, idSystem);
      res.status(200).json({ message: result.message });
    } catch (error) {
      console.error("Update request error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
