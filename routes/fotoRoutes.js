const express = require("express");
const router = express.Router({ mergeParams: true });
const fotoController = require("../controllers/fotoController");
const verificarToken = require("../middlewares/authMiddleware");
const upload = require("../config/upload");

router.use(verificarToken);

router.get("/", fotoController.index);
router.post("/", upload.array("fotos", 3), fotoController.upload);

module.exports = router;
