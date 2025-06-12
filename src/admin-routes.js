const express = require('express');
const router = express.Router();
const adminRoutes = require("./modules/ADMIN/routes/admin.routes");


router.use("/", adminRoutes);

module.exports = router;