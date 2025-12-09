const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public.controller');

/**
 * Public Routes - No authentication required
 * These endpoints are accessible to everyone
 */

// Get all available test types/catalog
router.get('/tests/catalog', publicController.getTestCatalog);

// Get specific exam details by ID
router.get('/tests/catalog/:id', publicController.getTestCatalogById);

module.exports = router;
