const express    = require("express");
const router     = express.Router();
const autenticar = require("../middlewares/autenticar");
const { cadastro, login, me } = require("../controllers/authController");

router.post("/cadastro", cadastro);  // público
router.post("/login",    login);     // público
router.get("/me",        autenticar, me); // 🔒 protegido

module.exports = router;