const Invoice = require('../models/invoice.model');
const { send_sms } = require('../services/message.services');

const createInvoice = async (req, res) => {
  const {
    meter_number,
    month,
    year,
    required_amount,
    unit_consumed,
    reading_day,
    past_debt,
    phone_number,
  } = req.body;

  if (
    !month ||
    !year ||
    !required_amount ||
    !meter_number ||
    !unit_consumed ||
    !reading_day ||
    !past_debt ||
    !phone_number
  ) {
    return res.status(400).json({
      success: 0,
      data: 'Fill the required fields',
    });
  }

  // const { remain_amount: debt } = await Invoice.findOne({
  //   meter_number: meter_number,
  // });

  const invoice = new Invoice({
    meter_number,
    month,
    year,
    required_amount,
    unit_consumed,
    reading_day,
    past_debt,
    phone_number,
  });

  const totalBill = parseInt(required_amount) + parseInt(past_debt);

  const message = `Ndugu mteja, kiasi cha bili unayodaiwa kwa mwezi ${month} ni Tsh${required_amount}. Deni la nyuma ${past_debt}. Jumla kuu ${totalBill}. Tafadhali lipa deni lako ndani ya siku 7 kutoka tarehe uliotumiwa ankara kupitia NMB bank akaunti namba 4090250094. Maji ni uhai`;

  try {
    await invoice.save();

    const receiver = {
      recipient_id: 1,
      dest_addr: phone_number,
    };

    send_sms(message, receiver);
    return res.status(201).json({
      success: 1,
      message: 'invoice created',
      data: invoice,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: 'Fail to create new invoice',
      data: null,
    });
  }
};

// TODO: PAY INVOICE HERE
const payInvoice = async (req, res) => {
  let invoice_id = req.params.invoice_id;
  const { meter_number, paid_amount, receipt_number } = req.body;

  try {
    const invoice = await Invoice.find({ meter_number: meter_number });
    const debt = 0;

    const db = invoice.map((element) => element.remain_amount);

    return res.status(201).json({
      success: 1,
      message: 'invoices found',
      data: db,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: 'Fail to get invoices',
      data: null,
    });
  }
};

const getAllInvoices = async (req, res) => {
  try {
    const invoice = await Invoice.find();
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
    const invoice = await Invoice.findById(id);
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

const updateInvoice = async (req, res) => {
  return res.status(200).json({
    success: 1,
    data: 'Invoice created',
  });
};

const deleteInvoice = async (req, res) => {
  return res.status(200).json({
    success: 1,
    data: 'Invoice created',
  });
};

module.exports = {
  createInvoice,
  getAllInvoices,
  getSingleInvoice,
  updateInvoice,
  deleteInvoice,
  payInvoice,
};
