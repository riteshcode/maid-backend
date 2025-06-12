const express = require('express');
const router = express.Router();
const userRoutes = require("./modules/ADMIN/routes/admin.routes");


router.use("/", userRoutes);

module.exports = router;