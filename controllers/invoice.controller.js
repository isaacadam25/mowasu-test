const Invoice = require('../models/invoice.model');
const Customer = require('../models/customer.model');
const Transaction = require('../models/transaction.model');
const { isEmpty, sumBy } = require('lodash');
const { send_sms } = require('../services/message.services');

// -> require helpers
const {
  calculateDebt,
  sumAllCustomerDebt,
  generateRandomNumber,
} = require('../utils/helpers');

const invoiceQueries = require('../models/queries/invoice.queries');
const customerQueries = require('../models/queries/customerQueries');
const transactionQuery = require('../models/queries/transaction.queries');

const createInvoice = async (req, res) => {
  try {
    let totalDebt = 0;

    const {
      current_count,
      previous_count,
      customer_id,
      invoice_number,
      reading_day,
    } = req.body;

    if (
      !current_count ||
      !customer_id ||
      !invoice_number ||
      !reading_day ||
      !previous_count
    ) {
      return res.status(400).json({
        success: 0,
        data: 'Fill the required fields',
      });
    }

    //* -> get customer details
    const customerDetails = await customerQueries.getCustomerById(customer_id);

    if (isEmpty(customerDetails)) {
      return res.status(400).json({
        success: 0,
        message: 'Customer Details Not found',
        data: null,
      });
    }

    //* -> get customer invoices for calculating debt
    const customerInvoices = await invoiceQueries.getInvoiceByQuery({
      customer_id,
    });

    //* -> sum total debt if customer has debts
    if (!isEmpty(customerInvoices)) {
      totalDebt = sumAllCustomerDebt(customerInvoices);
    }

    const { phone_number } = customerDetails;

    if (previous_count > current_count) {
      return res.status(400).json({
        success: 0,
        data: null,
        message: `Previous units can not be greater than current units. ${previous_count} - ${current_count}`,
      });
    }

    const date = new Date(reading_day);

    //* -> get day, month and year from reading day
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    //* -> calculate total bill for the current month
    const required_amount =
      (parseInt(current_count) - parseInt(previous_count)) * 1300;

    if (required_amount <= 0) {
      return res.status(200).json({
        success: 0,
        message: 'Amount is not be less or equal to zero',
        data: null,
      });
    }

    const newInvoice = await invoiceQueries.createInvoice({
      day,
      year,
      month,
      required_amount,
      current_count,
      previous_count,
      invoice_number,
      customer_id,
    });

    if (isEmpty(newInvoice)) {
      return res.status(400).json({
        success: 0,
        message: 'Fail to create customer invoice',
      });
    }

    const totalBill = parseInt(required_amount) + totalDebt;

    const message = `Ndugu mteja, bili unayodaiwa mwezi ${month}. Tsh ${required_amount}. Deni la nyuma ${totalDebt}. Jumla ${totalBill}. Unit ${previous_count}-${current_count}. Lipa ndani ya siku 7 kuanzia leo, NMB bank A/C 40902500794.`;

    const receiver = {
      recipient_id: 3,
      dest_addr: phone_number,
    };

    if (!isEmpty(phone_number)) {
      send_sms(message, receiver);

      return res.status(200).json({
        success: 0,
        message: 'Invoice created successfully',
        data: newInvoice,
      });
    }
    // gdjhsgghj;
    return res.status(200).json({
      success: 0,
      message: 'Invoice created successfully',
      data: newInvoice,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: 'Fail to create new invoice',
      data: null,
    });
  }
};

const payInvoice = async (req, res) => {
  try {
    let { invoice_id } = req.params;
    const { paid_amount: amount_paid, receipt_number } = req.body;

    const paid_amount = parseInt(amount_paid);

    if (paid_amount <= 0) {
      return res.status(400).json({
        success: 0,
        message: 'The paid amount is can not be less or equal to zero',
        data: null,
      });
    }

    // * -> check if transaction receipt number is entered
    if (isEmpty(receipt_number)) {
      return res.status(400).json({
        success: 0,
        message: 'Transaction receipt number is required',
        data: null,
      });
    }

    //* -> get invoice details
    const invoice = await invoiceQueries.getInvoiceById(invoice_id);

    if (isEmpty(invoice)) {
      return res.status(404).json({
        success: 0,
        data: null,
        message: 'Invoice details not found',
      });
    }

    const { required_amount, customer_id } = invoice;

    //* -> check if required amount is greater than zero
    if (required_amount <= 0) {
      return res.status(400).json({
        success: 0,
        data: null,
        message: 'Required amount can not be less or equal to zero',
      });
    }

    //* -> check if paid amount is less than required amount
    //* -> calculate debt if the above condition meet
    if (paid_amount < required_amount) {
      const new_debt = calculateDebt(paid_amount, required_amount);

      const updatedInvoice = await invoiceQueries.updateInvoice(invoice_id, {
        debt: new_debt,
        isComplete: true,
        receipt_number: receipt_number,
        paid_amount: paid_amount,
      });

      if (isEmpty(updatedInvoice)) {
        return res.status(400).json({
          success: 0,
          message: 'Invoice not paid successfully',
          data: null,
        });
      }

      //* -> store transaction reference
      const transactionDetails = await transactionQuery.createTransaction({
        reference_number: `ref-${generateRandomNumber(1111, 9999)}`,
        customer: customer_id,
        invoice: invoice_id,
        amount: paid_amount,
        receipt_number: receipt_number,
        description: 'Paid with debt',
      });

      if (!isEmpty(transactionDetails)) {
        return res.status(200).json({
          success: 1,
          message: 'Invoice paid successfully',
          data: updatedInvoice,
        });
      }
    }

    //* -> check if paid amount is greater than required amount
    //* -> calculate balance if above condition meet
    if (paid_amount > required_amount) {
      const balance = calculateDebt(paid_amount, required_amount);

      const updatedInvoice = await invoiceQueries.updateInvoice(invoice_id, {
        balance: balance,
        isComplete: true,
        receipt_number: receipt_number,
        paid_amount: paid_amount,
      });

      if (isEmpty(updatedInvoice)) {
        return res.status(400).json({
          success: 0,
          message: 'Invoice not paid successfully',
          data: null,
        });
      }

      //* -> store transaction reference
      const transactionDetails = await transactionQuery.createTransaction({
        reference_number: `ref-${generateRandomNumber(1111, 9999)}`,
        customer: customer_id,
        invoice: invoice_id,
        amount: paid_amount,
        receipt_number: receipt_number,
        description: 'Paid with balance',
      });

      if (!isEmpty(transactionDetails)) {
        return res.status(200).json({
          success: 1,
          message: 'Invoice paid successfully',
          data: updatedInvoice,
        });
      }
    }

    //* -> check if paid amount is equal to required amount
    if (paid_amount === required_amount) {
      const updatedInvoice = await invoiceQueries.updateInvoice(invoice_id, {
        paid_amount: paid_amount,
        isComplete: true,
        receipt_number: receipt_number,
      });

      if (isEmpty(updatedInvoice)) {
        return res.status(400).json({
          success: 0,
          message: 'Invoice not paid successfully',
          data: null,
        });
      }

      //* -> store transaction reference
      const transactionDetails = await transactionQuery.createTransaction({
        reference_number: `ref-${generateRandomNumber(1111, 9999)}`,
        customer: customer_id,
        invoice: invoice_id,
        amount: paid_amount,
        receipt_number: receipt_number,
        description: 'Paid without debt',
      });

      if (!isEmpty(transactionDetails)) {
        return res.status(200).json({
          success: 1,
          message: 'Invoice paid successfully',
          data: updatedInvoice,
        });
      }
    }

    return res.status(400).json({
      success: 0,
      data: null,
      message: 'Fail to pay invoice',
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: 'Unexpected error occurred',
      data: error,
    });
  }
};

const getAllInvoices = async (req, res) => {
  try {
    const invoice = await Invoice.find().populate('customer_id');
    return res.status(201).json({
      success: 1,
      message: 'invoices found',
      data: invoice,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: 'Fail to get invoices',
      data: null,
    });
  }
};

const getSingleInvoice = async (req, res) => {
  let id = req.params.id;

  try {
    const invoice = await Invoice.findById(id).populate('customer_id');
    return res.status(201).json({
      success: 1,
      message: 'invoice found',
      data: invoice,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: 'Fail to get invoice',
      data: null,
    });
  }
};

const payInvoiceDebt = async (req, res) => {
  try {
    let { invoice_id } = req.params;
    const { paid_amount: paid, receipt_number } = req.body;

    //* -> pull invoice debt
    const invoice = await invoiceQueries.getInvoiceById(invoice_id);

    if (isEmpty(invoice)) {
      return res.status(400).json({
        success: 0,
        message: 'Invoice Details Not Found',
        data: null,
      });
    }

    const { debt, required_amount, customer_id } = invoice;
    const paid_amount = parseInt(paid);

    if (paid_amount > debt || paid_amount <= 0) {
      return res.status(400).json({
        success: 0,
        message: `Paid amount is greater/less than required (Tsh: ${debt})`,
        data: null,
      });
    }

    if (paid_amount === debt) {
      const debt_payed = await invoiceQueries.updateInvoice(invoice_id, {
        debt: 0,
        paid_amount: required_amount,
      });

      if (isEmpty(debt_payed)) {
        return res.status(400).json({
          success: 0,
          message: 'Failed to pay invoice debt',
          data: null,
        });
      }

      //* -> store transaction reference
      const transactionDetails = await transactionQuery.createTransaction({
        reference_number: `ref-${generateRandomNumber(1111, 9999)}`,
        customer: customer_id,
        invoice: invoice_id,
        amount: paid_amount,
        receipt_number: receipt_number,
        description: 'Debt cleared',
      });

      if (!isEmpty(transactionDetails)) {
        return res.status(200).json({
          success: 1,
          message: 'Invoice paid successfully',
          data: debt_payed,
        });
      }

      return res.status(200).json({
        success: 1,
        message: 'Invoice debt cleared successfully',
        data: debt_payed,
      });
    } else {
      const total_debt = debt - paid_amount;
      const total_paid = paid_amount + invoice.paid_amount;

      const debt_payed = await invoiceQueries.updateInvoice(invoice_id, {
        debt: total_debt,
        paid_amount: total_paid,
      });

      if (isEmpty(debt_payed)) {
        return res.status(400).json({
          success: 0,
          message: 'Failed to pay invoice debt',
          data: null,
        });
      }

      //* -> store transaction reference
      const transactionDetails = await transactionQuery.createTransaction({
        reference_number: `ref-${generateRandomNumber(1111, 999)}`,
        customer: customer_id,
        invoice: invoice_id,
        amount: paid_amount,
        receipt_number: receipt_number,
        description: 'Debt paid',
      });

      if (!isEmpty(transactionDetails)) {
        return res.status(200).json({
          success: 1,
          message: 'Invoice paid successfully',
          data: debt_payed,
        });
      }

      return res.status(200).json({
        success: 1,
        message: 'Invoice debt paid successfully',
        data: debt_payed,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: 0,
      data: 'Unexpected error occurred',
    });
  }
};

const getUnitsStatistics = async (req, res) => {
  const { month } = req.params;

  const invoices = await invoiceQueries.getInvoiceByQuery({
    month,
  });

  if (isEmpty(invoices)) {
    return res.status(400).json({
      success: 0,
      message: `No invoices found for month ${month}`,
      data: null,
    });
  }

  //* getting total paid units for each object
  const paid_units = sumBy(invoices, (invoice) => {
    let total_unit = 0;
    if (invoice.isComplete) {
      total_unit = invoice.current_count - invoice.previous_count;
    }
    return total_unit;
  });

  //* getting total unpaid units for each object
  const unpaid_units = sumBy(invoices, (invoice) => {
    let total_unit = 0;
    if (!invoice.isComplete) {
      total_unit = invoice.current_count - invoice.previous_count;
    }
    return total_unit;
  });

  const total_units = paid_units + unpaid_units;
  const total_earnings = paid_units * 1300;
  const total_debt = unpaid_units * 1300;

  const response = {
    month,
    paid_units,
    unpaid_units,
    total_units,
    total_earnings,
    total_debt,
    invoices,
  };

  return res.status(200).json({
    success: 1,
    message: 'Invoices found',
    data: response,
  });
};

module.exports = {
  createInvoice,
  getAllInvoices,
  getSingleInvoice,
  payInvoiceDebt,
  getUnitsStatistics,
  payInvoice,
};
