const Invoice = require('../invoice.model');

//* -> create new invoice
const createInvoice = (payload) => {
  return Invoice.create(payload);
};

//* -> update invoice details by id
const updateInvoice = (id, query) => {
  return Invoice.findByIdAndUpdate(id, query, {
    returnDocument: 'after',
    timestamps: true,
  });
};

//* -> get invoice by id
const getInvoiceById = (invoice_id) => {
  return Invoice.findById(invoice_id).populate('customer_id');
};

//* -> get invoice by id
const getInvoiceByQuery = (query) => {
  return Invoice.find(query).populate('customer_id');
};

module.exports = {
  createInvoice,
  getInvoiceById,
  updateInvoice,
  getInvoiceByQuery,
};
