const Customer = require('../models/customer.model');

const createCustomer = async (req, res) => {
  const { fullname, gender, phone_number, meter_number, location } = req.body;

  if (!fullname || !gender || !phone_number || !meter_number || !location) {
    return res.status(400).json({
      success: 0,
      data: 'Fill the required fields',
    });
  }

  const customer = new Customer({
    fullname,
    gender,
    phone_number,
    meter_number,
    location,
  });

  try {
    await customer.save();
    return res.status(201).json({
      success: 1,
      message: 'Customer created',
      data: customer,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: 'Fail to create new customer',
      data: null,
    });
  }
};

const getAllCustomers = async (req, res) => {
  try {
    const customer = await Customer.find();
    return res.status(201).json({
      success: 1,
      message: 'Customers found',
      data: customer,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: 'Fail to get customers',
      data: null,
    });
  }
};

const getSingleCustomer = async (req, res) => {
  let id = req.params.id;

  try {
    const customer = await Customer.findById(id);
    return res.status(201).json({
      success: 1,
      message: 'Customer found',
      data: customer,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: 'Fail to get customer',
      data: null,
    });
  }
};

const updateCustomer = async (req, res) => {
  let id = req.params.id;

  const { fullname, gender, phone_number, meter_number, location } = req.body;

  if (!fullname || !gender || !phone_number || !meter_number || !location) {
    return res.status(400).json({
      success: 0,
      data: 'Fill the required fields',
    });
  }

  try {
    const customer = await Customer.findByIdAndUpdate(
      id,
      {
        fullname,
        gender,
        phone_number,
        meter_number,
        location,
      },
      {
        returnDocument: 'after',
        timestamps: true,
      }
    );
    return res.status(201).json({
      success: 1,
      message: 'Customer updated',
      data: customer,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: 'Fail to update customer',
      data: null,
    });
  }
};

const deleteCustomer = async (req, res) => {
  let id = req.params.id;

  try {
    const customer = await Customer.deleteOne({ id: id });
    return res.status(201).json({
      success: 1,
      message: 'Customer deleted',
      data: customer,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: 'Fail to delete customer',
      data: null,
    });
  }
};

module.exports = {
  createCustomer,
  getAllCustomers,
  getSingleCustomer,
  updateCustomer,
  deleteCustomer,
};
