const express = require("express");
const router = express();
const authController = require("../controller/auth");
const asyncMiddleware = require("../middleware/async");

// Unified sign-in for the combined Admin + Warehouse panel.
// Public (no token) — same as admin/signin and warehouse/signin.
router.post("/signin", asyncMiddleware(authController.signIn));

module.exports = router;
