const express = require("express");
const { authenticateRole } = require("../auth");
const {
  companyFunctions,
  clientFunctions,
} = require("../db");
const router = express.Router();

// Create a new company
router.post("/", authenticateRole(2), async (req, res) => {
  try {
    const { name } = req.body;
    const result = await companyFunctions.create(name);
    res.status(201).json({ message: result.message });
  } catch (error) {
    console.error("Create company error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get all companies
router.get("/", authenticateRole(2, 3), async (req, res) => {
  try {
    const companies = await companyFunctions.getAll();
    res.json(companies);
  } catch (error) {
    console.error("Get companies error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get a company by ID
router.get("/:id", authenticateRole(2, 3), async (req, res) => {
  try {
    const { id } = req.params;
    const company = await companyFunctions.get(id);
    if (company) {
      res.json(company);
    } else {
      res.status(404).json({ message: "Company not found" });
    }
  } catch (error) {
    console.error("Get company by ID error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update a company
router.put("/:id", authenticateRole(2), async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const result = await companyFunctions.update(id, name);
    res.status(200).json({ message: result.message });
  } catch (error) {
    console.error("Update company error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Delete a company
router.delete("/:id", authenticateRole(2), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await companyFunctions.delete(id);
    res.status(200).json({ message: result.message });
  } catch (error) {
    console.error("Delete company error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get all clients associated with a company
router.get("/:id/clients", authenticateRole(2, 3), async (req, res) => {
  try {
    const { id } = req.params;
    const clients = await clientFunctions.getByCompany(id);
    res.json(clients);
  } catch (error) {
    console.error("Get clients per company error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;