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
    debt,
    phone_number,
  } = req.body;

  if (
    !month ||
    !year ||
    !required_amount ||
    !meter_number ||
    !unit_consumed ||
    !reading_day ||
    !debt ||
    !phone_number
  ) {
    return res.status(400).json({
      success: 0,
      data: 'Fill the required fields',
    });
  }

  // pull debt
  const data = await Invoice.find({ meter_number: meter_number });

  const total_debt = data.reduce((accumulator, object) => {
    return accumulator + object.debt;
  }, 0);

  const invoice = new Invoice({
    meter_number,
    month,
    year,
    required_amount,
    unit_consumed,
    reading_day,
    debt,
    phone_number,
  });

  const totalBill = required_amount + debt;

  const message = `Ndugu mteja, kiasi cha bili unayodaiwa kwa mwezi ${month} ni Tsh${required_amount}. Deni la nyuma ${debt}. Jumla kuu ${totalBill}. Tafadhali lipa deni lako ndani ya siku 7 kutoka tarehe uliotumiwa ankara kupitia NMB bank akaunti namba 4090250094. Maji ni uhai`;

  try {
    await invoice.save();

    const receiver = {
      recipient_id: 1,
      dest_addr: phone_number,
    };

    // send_sms(message, receiver);
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
  let { invoice_id } = req.params;
  const { paid_amount, receipt_number } = req.body;

  // return invoice_id;

  try {
    // update invoice
    const pay_invoice = await Invoice.findByIdAndUpdate(
      invoice_id,
      {
        paid_amount: paid_amount,
        receipt_number: receipt_number,
      },
      {
        returnDocument: 'after',
        timestamps: true,
      }
    );

    if (paid_amount > pay_invoice.required_amount || paid_amount <= 0) {
      return res.status(400).json({
        success: 1,
        message: 'The paid amount is greater/less than required',
        data: null,
      });
    }

    if (pay_invoice.meter_number) {
      // check if paid amount is equal to required amount
      const { required_amount, debt } = pay_invoice;

      if (required_amount + debt > paid_amount) {
        let new_debt = required_amount + debt - paid_amount;

        // update invoice
        const debt_invoice = await Invoice.findByIdAndUpdate(
          invoice_id,
          {
            paid_amount: paid_amount,
            debt: new_debt,
          },
          {
            returnDocument: 'after',
            timestamps: true,
          }
        );

        return res.status(201).json({
          success: 1,
          message: 'Invoice paid with the debt',
          data: debt_invoice,
        });
      }

      if (required_amount + debt === paid_amount) {
        // update invoice
        const complete_invoice = await Invoice.findByIdAndUpdate(
          invoice_id,
          {
            paid_amount: paid_amount,
            debt: 0,
            isComplete: true,
          },
          {
            returnDocument: 'after',
            timestamps: true,
          }
        );

        return res.status(201).json({
          success: 1,
          message: 'Invoice paid without debt',
          data: complete_invoice,
        });
      }
    }
    return res.status(404).json({
      success: 1,
      message: 'invoice not found',
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: 'Fail to get invoices',
      data: error,
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

const payInvoiceDebt = async (req, res) => {
  let { invoice_id } = req.params;
  const { paid_amount, receipt_number } = req.body;

  try {
    // pull debt
    const invoice = await Invoice.findById(invoice_id);

    // return res.status(400).json({
    //   success: 1,
    //   message: 'Pai',
    //   data: invoice,
    // });

    if (paid_amount > invoice.debt || paid_amount <= 0) {
      return res.status(400).json({
        success: 1,
        message: 'Paid amount is greater/less than required',
        data: null,
      });
    }

    if (paid_amount === invoice.debt) {
      const debt_payed = await Invoice.findByIdAndUpdate(
        invoice_id,
        { debt: 0, paid_amount: required_amount, isComplete: true },
        {
          returnDocument: 'after',
          timestamps: true,
        }
      );

      return res.status(200).json({
        success: 1,
        message: 'compute deni',
        data: debt_payed,
      });
    } else {
      const debt = invoice.debt - paid_amount;
      const total_paid = paid_amount + invoice.paid_amount;
      const debt_payed = await Invoice.findByIdAndUpdate(
        invoice_id,
        { debt: debt, paid_amount: total_paid },
        {
          returnDocument: 'after',
          timestamps: true,
        }
      );

      return res.status(200).json({
        success: 1,
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
  payInvoiceDebt,
  deleteInvoice,
  payInvoice,
};
