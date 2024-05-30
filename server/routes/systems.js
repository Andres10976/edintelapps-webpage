const express = require("express");
const { authenticateRole } = require("../auth");
const { systemFunctions } = require("../db");

const router = express.Router();

router.post("/", authenticateRole(2, 3), async (req, res) => {
  try {
    const { name } = req.body;
    const result = await systemFunctions.createSystem(name);
    res.status(201).json({ message: result.message });
  } catch (error) {
    console.error("Create system error:", error);
    res.status(500).json({ message: error.message });
  }
});


router.get("/", authenticateRole(2, 3), async (req, res) => {
  try {
    const systems = await systemFunctions.getSystems();
    res.json(systems);
  } catch (error) {
    console.error("Get systems error:", error);
    res.status(500).json({ message: error.message });
  }
});


router.put("/:id", authenticateRole(2, 3), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isActive } = req.body;
    const result = await systemFunctions.updateSystem(id, name, isActive);
    res.json({ message: result.message });
  } catch (error) {
    console.error("Update system error:", error);
    res.status(500).json({ message: error.message });
  }
});


router.delete("/:id", authenticateRole(2, 3), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await systemFunctions.deleteSystem(id);
    res.status(201).json({ message: result.message });
  } catch (error) {
    console.error("Delete system error:", error);
    res.status(500).json({ message: error.message });
  }
});


router.get("/:id/types", authenticateRole(2, 3), async (req, res) => {
  try {
    const { id } = req.params;
    const systemTypes = await systemFunctions.getSystemTypesPerSystem(id);
    res.json(systemTypes);
  } catch (error) {
    console.error("Get system types error:", error);
    res.status(500).json({ message: error.message });
  }
});


router.post("/:id/types", authenticateRole(2, 3), async (req, res) => {
  try {
    const { id: idSystem } = req.params;
    const { name } = req.body;
    const result = await systemFunctions.createSystemType(name, idSystem);
    res.status(201).json({ message: result.message });
  } catch (error) {
    console.error("Create system type error:", error);
    res.status(500).json({ message: error.message });
  }
});


router.put("/:id/types/:idType", authenticateRole(2, 3), async (req, res) => {
  try {
    const { id, idType } = req.params;
    const { name, isActive } = req.body;
    const result = await systemFunctions.updateSystemType(idType, name, id, isActive);
    res.json({ message: result.message });
  } catch (error) {
    console.error("Update system type error:", error);
    res.status(500).json({ message: error.message });
  }
});


router.delete(
  "/:id/types/:idType",
  authenticateRole(2, 3),
  async (req, res) => {
    try {
      const { id, idType } = req.params;
      const result = await systemFunctions.deleteSystemType(idType);
      res.json({ message: result.message });
    } catch (error) {
      console.error("Delete system type error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);


router.get("/types/all", authenticateRole(2, 3, 5), async (req, res) => {
  try {
    const systemTypes =
      await systemFunctions.getSystemTypesPerSystemWithNames();
    res.json(systemTypes);
  } catch (error) {
    console.error("Get system types error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
