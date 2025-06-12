const express = require('express');
const router = express.Router();
const cutomerRoutes = require("./modules/API/customers/routes/customer.routes")


router.use("/",cutomerRoutes)

module.exports = router;