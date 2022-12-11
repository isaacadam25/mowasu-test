const Invoice = require('../models/invoice.model');
const Customer = require('../models/customer.model');
const Transaction = require('../models/transaction.model');
const { isEmpty, last, sortBy } = require('lodash');
const { send_sms } = require('../services/message.services');

const createInvoice = async (req, res) => {
  try {
    const {
      current_count: current,
      customer_id,
      phone_number,
      invoice_number,
      reading_day,
    } = req.body;

    if (!current || !customer_id || !invoice_number) {
      return res.status(400).json({
        success: 0,
        data: 'Fill the required fields',
      });
    }

    // -> pull debt and previous units
    const data = await Invoice.find({ customer_id });

    if (isEmpty(data)) {
      return res.status(400).json({
        success: 0,
        data: null,
        message: 'Fail to get customer details',
      });
    }

    // -> sort data by month
    const sorted = sortBy(data, (o) => o.month);

    // -> extract current unit form last invoice
    const { current_count, debt } = last(sorted);

    if (!current_count) {
      return res.status(400).json({
        success: 0,
        data: null,
        message: 'Fail to get customer details',
      });
    }

    if (current_count > current) {
      return res.status(400).json({
        success: 0,
        data: null,
        message: `Previous units can not be greater than current units. ${current_count} - ${current}`,
      });
    }

    const deni = parseInt(debt);

    const date = new Date(reading_day);

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const required_amount =
      (parseInt(current) - parseInt(current_count)) * 1300;

    if (required_amount <= 0) {
      return res.status(200).json({
        success: 0,
        message: 'Amount is not be less or equal to zero',
        data: null,
      });
    }

    const invoice = new Invoice({
      day,
      year,
      month,
      required_amount,
      current_count: current,
      previous_count: current_count,
      invoice_number,
      customer_id,
      debt: deni,
    });

    await invoice.save();

    if (isEmpty(invoice)) {
      return res.status(400).json({
        success: 0,
        message: 'Fail to create an invoice',
      });
    }

    const totalBill = parseInt(required_amount) + deni;

    const message = `Ndugu mteja, bili unayodaiwa mwezi ${month}. Tsh ${required_amount}. Deni la nyuma ${deni}. Jumla ${totalBill}. Unit ${current_count}-${current}. Lipa ndani ya siku 7 kuanzia leo, NMB bank A/C 40902500794.`;

    const receiver = {
      recipient_id: 3,
      dest_addr: phone_number,
    };

    const isInvoiced = await Customer.findByIdAndUpdate(
      customer_id,
      { isInvoiced: true },
      {
        returnDocument: 'after',
        timestamps: true,
      }
    );

    if (!isEmpty(isInvoiced) || !isEmpty(invoice)) {
      if (phone_number) {
        send_sms(message, receiver);
      }
      return res.status(201).json({
        success: 1,
        message: 'invoice created',
        data: { invoice },
      });
    }

    return res.status(400).json({
      success: 0,
      message: 'Fail to create an invoice',
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
  try {
    let { invoice_id } = req.params;
    const { paid_amount, receipt_number, customer_id } = req.body;

    if (paid_amount <= 0) {
      return res.status(400).json({
        success: 0,
        message: 'The paid amount is can not be less or equal to zero',
        data: null,
      });
    }

    // -> get invoice details
    const invoice = await Invoice.findById(invoice_id);

    if (isEmpty(invoice)) {
      return res.status(404).json({
        success: 0,
        data: null,
        message: 'Invoice details not found',
      });
    }

    const { required_amount, debt } = invoice;

    // -> check if required amount is greater than zero
    if (required_amount <= 0) {
      return res.status(400).json({
        success: 0,
        data: null,
        message: 'Required amount can not be less or equal to zero',
      });
    }

    // -> check if required amount is greater than paid amount required amount
    if (required_amount > parseInt(paid_amount)) {
      let new_debt = debt + (required_amount - paid_amount);

      // -> set isInvoiced == false
      const customer = await Customer.findByIdAndUpdate(
        customer_id,
        {
          isInvoiced: false,
        },
        {
          returnDocument: 'after',
          timestamps: true,
        }
      );

      if (isEmpty(customer)) {
        return res.status(400).json({
          success: 0,
          data: null,
          message: 'Fail to pay invoice. Please try again later',
        });
      }

      // -> generate transaction
      const transaction = new Transaction({
        customer: customer_id,
        invoice: invoice_id,
        amount: paid_amount,
        receipt_number: receipt_number,
        description: 'Monthly payment',
      });

      await transaction.save();

      if (isEmpty(transaction)) {
        return res.status(400).json({
          success: 0,
          data: null,
          message: 'Fail to pay invoice. Please try again later',
        });
      }

      // -> update invoice debt
      const updatedInvoice = await Invoice.findByIdAndUpdate(
        invoice_id,
        {
          debt: new_debt,
          isComplete: true,
          paid_amount: paid_amount,
        },
        {
          returnDocument: 'after',
          timestamps: true,
        }
      );

      if (isEmpty(updatedInvoice)) {
        return res.status(400).json({
          success: 0,
          data: null,
          message: 'Fail to pay invoice. Please try again later',
        });
      }

      return res.status(200).json({
        success: 1,
        data: updatedInvoice,
        message: 'Invoice paid Successfully',
      });
    }

    // -> check if paid amount is equal to required amount
    if (parseInt(paid_amount) === required_amount) {
      // -> set isInvoiced == false
      const customer = await Customer.findByIdAndUpdate(
        customer_id,
        {
          isInvoiced: false,
        },
        {
          returnDocument: 'after',
          timestamps: true,
        }
      );

      if (isEmpty(customer)) {
        return res.status(400).json({
          success: 0,
          data: null,
          message: 'Fail to pay invoice. Please try again later',
        });
      }

      // -> generate transaction
      const transaction = new Transaction({
        customer: customer_id,
        invoice: invoice_id,
        amount: paid_amount,
        receipt_number: receipt_number,
        description: 'Monthly payment',
      });

      await transaction.save();

      if (isEmpty(transaction)) {
        return res.status(400).json({
          success: 0,
          data: null,
          message: 'Fail to pay invoice. Please try again later',
        });
      }

      // -> update invoice debt
      const updatedInvoice = await Invoice.findByIdAndUpdate(
        invoice_id,
        {
          isComplete: true,
          paid_amount: paid_amount,
        },
        {
          returnDocument: 'after',
          timestamps: true,
        }
      );

      if (isEmpty(updatedInvoice)) {
        return res.status(400).json({
          success: 0,
          data: null,
          message: 'Fail to pay invoice. Please try again later',
        });
      }

      return res.status(200).json({
        success: 1,
        data: updatedInvoice,
        message: 'Invoice paid Successfully',
      });
    }

    // -> check if paid amount is greater than required amount
    if (parseInt(paid_amount) > required_amount) {
      let balance = paid_amount - required_amount;

      if (balance > debt) {
        // -> update invoice details
        const paidInvoice = await Invoice.findByIdAndUpdate(
          invoice_id,
          {
            debt: 0,
            isComplete: true,
            balance: balance,
            paid_amount: paid_amount,
          },
          {
            new: true,
            timestamps: true,
          }
        );

        if (isEmpty(paidInvoice)) {
          return res.status(400).json({
            success: 0,
            message: 'Fail to pay invoices 1',
            data: null,
          });
        }

        const updatedCustomer = await Customer.findByIdAndUpdate(
          customer_id,
          {
            isInvoiced: false,
          },
          {
            returnDocument: 'after',
          }
        );

        // -> generate transaction
        const transaction = new Transaction({
          customer: customer_id,
          invoice: invoice_id,
          amount: paid_amount,
          receipt_number: receipt_number,
          description: 'Monthly payment',
        });

        await transaction.save();

        if (
          !isEmpty(updatedCustomer) &&
          !isEmpty(transaction) &&
          !isEmpty(paidInvoice)
        ) {
          return res.status(200).json({
            success: 1,
            message: 'Invoice paid successfully',
            data: paidInvoice,
          });
        }
      }

      let new_debt = debt - balance;

      if (new_debt < 0) {
        return res.status(400).json({
          success: 0,
          message: 'Fail to pay invoices 2',
          data: null,
        });
      }

      // -> update invoice details
      const paidInvoice = await Invoice.findByIdAndUpdate(
        invoice_id,
        {
          debt: new_debt,
          isComplete: true,
          paid_amount: paid_amount,
        },
        {
          new: true,
          timestamps: true,
        }
      );

      // -> update customer details
      const updatedCustomer = await Customer.findByIdAndUpdate(
        customer_id,
        {
          isInvoiced: false,
        },
        {
          returnDocument: 'after',
          timestamps: true,
        }
      );

      // -> generate transaction
      const transaction = new Transaction({
        customer: customer_id,
        invoice: invoice_id,
        amount: paid_amount,
        receipt_number: receipt_number,
        description: 'Monthly payment',
      });

      await transaction.save();

      if (
        isEmpty(paidInvoice) ||
        isEmpty(updatedCustomer) ||
        isEmpty(transaction)
      ) {
        return res.status(400).json({
          success: 0,
          message: 'Fail to pay invoices 3',
          data: null,
        });
      }

      return res.status(200).json({
        success: 1,
        message: 'Invoice payed successfully',
        data: paidInvoice,
      });
    }

    return res.status(400).json({
      success: 0,
      data: null,
      message: 'Invoice details not found',
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
