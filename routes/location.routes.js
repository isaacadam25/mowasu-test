const express = require('express');

const router = express.Router();

const locationController = require('../controllers/location.controller');

router.route('/')
        .post(locationController.createLocation)
        .get(locationController.getAllLocations);

router.route('/:id')
    .get(locationController.getSingleLocation)
    .put(locationController.updateCustomer)
    .delete(locationController.deleteLocation);

module.exports = router;