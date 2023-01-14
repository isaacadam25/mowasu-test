const Customer = require('../customer.model');

//* -> create customer
const addNewCustomer = (payload) => {
  return Customer.create(payload);
};

//* -> create customer
const getCustomerById = (customer_id) => {
  return Customer.findById(customer_id);
};

//* -> update customer details
const updateCustomerDetails = (customer_id, query) => {
  return Customer.findByIdAndUpdate(customer_id, query, {
    returnDocument: 'after',
    timestamps: true,
  });
};

module.exports = {
  addNewCustomer,
  getCustomerById,
  updateCustomerDetails,
};
