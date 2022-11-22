const { isEmpty } = require('lodash');
const Customer = require('../models/customer.model');
const Location = require('../models/location.model');

const helper = require('../utils/helpers');

const createCustomer = async (req, res) => {
  const { fullname, gender, phone_number, location } = req.body;

  if (!fullname || !gender || !phone_number || !location) {
    return res.status(400).json({
      success: 0,
      data: 'Fill the required fields',
    });
  }

  const meter_number = `MW-${helper.generateRandomNumber()}`;
  const customer = new Customer({
    fullname,
    gender,
    phone_number,
    location,
    meter_number
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
    const customer = await Customer.find().populate('location', 'location_name');

    if (!isEmpty(customer)) {
      return res.status(200).json({
        success: 1,
        message: 'Customers found',
        data: customer,
      });
    }

    return res.status(400).json({
        success: 0,
        message: 'No Customers found',
        data: null,
      });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: 'Fail to get customers',
      data: null,
    });
  }
};

const getInvoicedCustomers = async (req, res) => {
  try {
    const customer = await Customer.find({ isInvoiced: true }).populate('location', 'location_name');

    if (!isEmpty(customer)) {
      return res.status(200).json({
        success: 1,
        message: 'Customers found',
        data: customer,
      });
    }

    return res.status(400).json({
        success: 0,
        message: 'No Customers found',
        data: null,
      });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: 'Fail to get customers',
      data: null,
    });
  }
};

const getUnInvoicedCustomers = async (req, res) => {
  try {
    const customer = await Customer.find({ isInvoiced: false }).populate('location', 'location_name');

    if (!isEmpty(customer)) {
      return res.status(200).json({
        success: 1,
        message: 'Customers found',
        data: customer,
      });
    }

    return res.status(400).json({
        success: 0,
        message: 'No Customers found',
        data: null,
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
    const customer = await Customer.findById(id).populate('location', 'location_name');

    if (customer) {
      return res.status(201).json({
        success: 1,
        message: 'Customer found',
        data: customer,
      });
    }

    return res.status(400).json({
        success: 0,
        message: 'No Customers found',
        data: null,
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

  const { fullname, gender, phone_number, location } = req.body;

  if (!fullname || !gender || !phone_number || !location) {
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
  try {
    let id = req.params.id;

    const customer = await Customer.findByIdAndDelete(id, { returnDocument: 'after'});
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
  getInvoicedCustomers,
  getUnInvoicedCustomers,
  getAllCustomers,
  getSingleCustomer,
  updateCustomer,
  deleteCustomer,
};
