const express = require("express");
const bcrypt = require("bcrypt");
const { authenticateRole } = require("../auth");
const { userFunctions } = require("../db");
const { generateRandomPassword } = require("../utils/randomHelper")
const sendEmail = require("../utils/mailHelper");
const router = express.Router();
require("dotenv").config();


router.get("/roles", authenticateRole(2), async (req, res) => {
  try {
    const roles = await userFunctions.roles();
    res.json(roles);
  } catch (error) {
    console.error("Get user roles error:", error);
    res.status(500).json({ message: error.message });
  }
});


router.post("/", authenticateRole(2), async (req, res) => {
  try {
    const { username, email, name, lastname, roleId, phone, companyId, clientId } =
      req.body;

    const randomPassword = generateRandomPassword(16, true, true, true, true);

    // Generate salt and hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(randomPassword, salt);

    // Create the user with the generated passwordHash and salt
    const result = await userFunctions.create(
      username,
      passwordHash,
      salt,
      email,
      name,
      lastname,
      roleId,
      phone,
      companyId,
      clientId
    );

    const subject = "Bienvenido a Edintel";
    //TODO: Añadir link a la página de Edintel
    const url = process.env.PAGE_URL;
    const body = `
    <html>
      <body>
        <p>Bienvenido a Edintel.</p>
        <p></p>
        <p>Ahora formas parte de la página web de Edintel. En la misma, podrás encontrar toda la información que necesitas saber sobre los proyectos de los que formas parte.</p>
        <p>Aquí tienes la información relacionada a tu cuenta para poder iniciar sesión correctamente:</p>
        <p><strong>Nombre de usuario: </strong>${username}</p>
        <p><strong>Correo:</strong> ${email}</p>
        <p><strong>Contraseña:</strong> ${randomPassword}</p>
        <p>Puedes ingresar a la aplicación utilizando este <a href="${url}">link</a>.</p>
        <p></p>
        <p>Muchas gracias por formar parte de la familia Edintel.</p>
      </body>
    </html>
    `;
    sendEmail(subject, body, [email]);
    res.status(201).json({ message: result.message });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: error.message });
  }
});


router.get("/", authenticateRole(2), async (req, res) => {
  try {
    const users = await userFunctions.getAll();
    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: error.message });
  }
});


router.get("/:id", authenticateRole(2, 3, 4, 5), async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userFunctions.getById(id);
    res.json(user);
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ message: error.message });
  }
});


router.get("/username/:username", authenticateRole(2), async (req, res) => {
  try {
    const { username } = req.params;
    const user = await userFunctions.getByUsername(username);
    res.json(user);
  } catch (error) {
    console.error("Get user by username error:", error);
    res.status(500).json({ message: error.message });
  }
});


router.put("/:id", authenticateRole(2), async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, name, lastname, roleId, phone, clientId, companyId } = req.body;
    const result = await userFunctions.update(
      id,
      username,
      email,
      name,
      lastname,
      roleId,
      phone,
      clientId,
      companyId
    );
    res.json({ message: result.message });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: error.message });
  }
});


router.delete("/:id", authenticateRole(2), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await userFunctions.deactivate(id);
    res.json({ message: result.message });
  } catch (error) {
    console.error("Deactivate user error:", error);
    res.status(500).json({ message: error.message });
  }
});


router.put("/:id/reactivate", authenticateRole(2), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await userFunctions.reactivate(id);
    res.json({ message: result.message });
  } catch (error) {
    console.error("Reactivate user error:", error);
    res.status(500).json({ message: error.message });
  }
});


router.put("/:id/role", authenticateRole(2), async (req, res) => {
  try {
    const { id } = req.params;
    const { roleId } = req.body;
    const result = await userFunctions.updateRole(id, roleId);
    res.json({ message: result.message });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({ message: error.message });
  }
});


router.post(
  "/:id/reset-password",
  authenticateRole(2, 3, 4, 5),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { actualPassword, newPassword } = req.body;
      let user = await userFunctions.getById(id);
      if (!user) {
        return res.status(401).json({ message: "Contraseña ingresada incorrecta." });
      }
      const isPasswordValid = await bcrypt.compare(
        actualPassword,
        user.passwordHash
      );

      if (!isPasswordValid) {
        return res.status(401).json({ message: "Contraseña ingresada incorrecta." });
      }
      const salt = await bcrypt.genSalt(10);
      const newPasswordHash = await bcrypt.hash(newPassword, salt);
      await userFunctions.resetPassword(id, newPasswordHash, salt);

      const subject= 'Reinicio de contraseña exitoso. Página Edintel';
      const emailBody = `
      <html>
        <body>
          <p>Has cambiado exitosamente tu contraseña a tu cuenta asociada de Edintel.</p>
          <p>En caso de no haber sido usted, comuníquese inmediatamente con Edintel.</p>
        </body>
      </html>
    `;
  
      await sendEmail(subject, emailBody, [user.email]);

      res.status(201).json({ message: "Contraseña reestablecida con éxito." });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

router.put("/:id/role", authenticateRole(2), async (req, res) => {
  try {
    const { id } = req.params;
    const { roleId } = req.body;
    const result = await userFunctions.updateRole(id, roleId);
    res.json({ message: result.message });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id/assignSite", authenticateRole(2), async (req, res) => {
  try{
    const { id } = req.params;
    const { idSite } = req.body;
    const result = await userFunctions.assignSite(idSite, id);
    res.json({message: result.message});
  } catch (error){
    console.error("Assign site to user error:", error);
    res.status(500).json({message: error.message});
  }
});

router.put("/:id/dissociateSite", authenticateRole(2), async (req, res) => {
  try{
    const { id } = req.params;
    const { idSite } = req.body;
    const result = await userFunctions.assignSite(idSite, id);
    res.json({message: result.message});
  } catch (error){
    console.error("Assign site to user error:", error);
    res.status(500).json({message: error.message});
  }
});

module.exports = router;