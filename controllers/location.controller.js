const Location = require('../models/location.model');
const Customer = require('../models/customer.model');

const createLocation = async (req, res) => {
    try {
        const { location_name } = req.body;

        if(!location_name) {
            return res.status(400).json({
                success: 0,
                message: "Fill Required Fields"
            });
        }

        const location = new Location({ location_name });

        await location.save();

        return res.status(201).json({
        success: 1,
        message: 'Location created',
        data: location,
        });

    } catch (error) {
    return res.status(500).json({
      success: 0,
      message: 'Fail to create new location',
      data: null,
    });
  }
}

const getAllLocations = async (req, res) => {
  try {
    const location = await Location.find();

    if (location.length) {
      return res.status(200).json({
        success: 1,
        message: 'locations found',
        data: location,
      });
    }

    return res.status(400).json({
        success: 0,
        message: 'No locations found',
        data: null,
      });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: 'Fail to get locations',
      data: null,
    });
  }
};

const getSingleLocation = async (req, res) => {
    try {
        let id = req.params.id;

        const location = await Location.findById(id);
        const customers = await Customer.find({ location: id });

        if (location) {
        return res.status(201).json({
            success: 1,
            message: 'location found',
            data: {
                    location,
                    total_customers: customers.length
                },
        });
        }

        return res.status(400).json({
            success: 0,
            message: 'No location found',
            data: null,
        });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: 'Fail to get location',
      data: null,
    });
  }
};

const updateCustomer = async (req, res) => {
    try{
    let id = req.params.id;

    const { location_name } = req.body;

    if (!location_name) {
        return res.status(400).json({
        success: 0,
        data: 'Fill the required fields',
        });
    }

    const location = await Location.findByIdAndUpdate(
      id,
      {
        location_name
      },
      {
        returnDocument: 'after',
        timestamps: true,
      }
    );
    return res.status(201).json({
      success: 1,
      message: 'Location updated',
      data: location,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: 'Fail to update location',
      data: null,
    });
  }
};

const deleteLocation = async (req, res) => {
    try {
    let id = req.params.id;

    const location = await Location.findByIdAndDelete(id);
    return res.status(201).json({
      success: 1,
      message: 'Location deleted',
      data: location,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: 'Fail to delete location',
      data: null,
    });
  }
};


module.exports = {
    createLocation,
    getAllLocations,
    getSingleLocation,
    updateCustomer,
    deleteLocation
}