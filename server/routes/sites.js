const express = require("express");
const { authenticateRole } = require("../auth");
const { siteFunctions, requestFunctions, systemFunctions } = require("../db");

const router = express.Router();

router.post("/", authenticateRole(2, 3), async (req, res) => {
  try {
    const { idClient, name, supervisor, contactName, contactPhone, contactMail } = req.body;
    const result = await siteFunctions.create(idClient, name, supervisor, contactName, contactPhone, contactMail);
    res.status(201).json({ message: result.message });
  } catch (error) {
    console.error("Create site error:", error);
    res.status(500).json({ message: error.message });
  }
});


router.get("/", authenticateRole(2, 3), async (req, res) => {
  try {
    const sites = await siteFunctions.getAll();
    res.json(sites);
  } catch (error) {
    console.error("Get sites error:", error);
    res.status(500).json({ message: error.message });
  }
});


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

router.get("/user/:id", authenticateRole(2, 3, 5), async (req, res) => {
  try {
    const { id } = req.params;
    const sites = await siteFunctions.getByClientUser(id);
    res.json(sites);
  } catch (error) {
    console.error("Get site by id error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", authenticateRole(2, 3), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, idClient, supervisor, contactName, contactPhone, contactMail } = req.body;
    const result = await siteFunctions.update(id, name, supervisor, idClient, contactName, contactPhone, contactMail);
    res.status(201).json({ message: result.message });
  } catch (error) {
    console.error("Update site error:", error);
    res.status(500).json({ message: error.message });
  }
});


router.delete("/:id", authenticateRole(2, 3), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await siteFunctions.delete(id);
    res.status(201).json({ message: result.message });
  } catch (error) {
    console.error("Deleted site error:", error);
    res.status(500).json({ message: error.message });
  }
});


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


router.put(
  "/:id/systems/dissociate",
  authenticateRole(2, 3),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { idSystem } = req.body;
      const result = await siteFunctions.dissociateSystem(id, idSystem);
      res.json({ message: result.message });
    } catch (error) {
      console.error("Disassociate system from site error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
