const express = require('express');
const router = express();
const controller = require('../controller/customer');
const asyncMiddleware = require('../middleware/async');
 
router.post('/payment-success', asyncMiddleware(controller.stripeWebhook))

module.exports = router;
