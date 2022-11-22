const { isEmpty }  = require('lodash');
const Invoice = require('../models/invoice.model');
const Customer = require('../models/customer.model');
const { send_sms } = require('../services/message.services');

const createInvoice = async (req, res) => {
  try{
  const {
    current_count,
    previous_count,
    customer_id,
    phone_number,
    invoice_number,
    debt,
    reading_day
  } = req.body;

  if (
    !current_count ||
    !previous_count ||
    !customer_id ||
    !invoice_number ||
    !debt
  ) {
    return res.status(400).json({
      success: 0,
      data: 'Fill the required fields',
    });
  }

  //TODO: pull debt
  // const data = await Invoice.find({ customer_id });

  // const total_debt = data.reduce((accumulator, object) => {
  //   return accumulator + object.debt;
  // }, 0);

  const total_debt = parseInt(debt);

  const date = new Date(reading_day);

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const required_amount = (parseInt(current_count) - parseInt(previous_count)) * 1300;

  if (required_amount <= 0) {
    return res.status(200).json({
      success: 0,
      message: "Amount is not valid",
      data: null,
    });
  }

  const invoice = new Invoice({
    day,
    year,
    month,
    required_amount,
    current_count,
    previous_count,
    invoice_number,
    customer_id,
    debt
  });

  await invoice.save();

  if (isEmpty(invoice)) {
    return res.status(400).json({
      success: 0,
      message: "Fail to create an invoice"
    });
  }
  
  const totalBill = parseInt(required_amount) + total_debt;

  const message = `Ndugu mteja, bili unayodaiwa mwezi ${month}. Tsh ${required_amount}. Deni la nyuma ${total_debt}. Jumla kuu ${totalBill}. Unit ${previous_count}-${current_count}. Lipa deni ndani ya siku 7 kuanzia leo, NMB bank A/C 4090250094.`;

    const receiver = {
      recipient_id: 3,
      dest_addr: phone_number,
    };
    
    const isInvoiced = await Customer.findByIdAndUpdate(customer_id, 
                              { isInvoiced: true}, {
                                returnDocument: 'after',
                                timestamps: true
                              });

    if (!isEmpty(isInvoiced) || !isEmpty(invoice)) {
      const sent_message = send_sms(message, receiver);
      return res.status(201).json({
        success: 1,
        message: 'invoice created',
        data: {invoice, sent_message}
      });
    }

    return res.status(400).json({
      success: 0,
      message: "Fail to create an invoice"
    })
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
  try{
    let { invoice_id } = req.params;
    const { paid_amount, receipt_number, phone_number } = req.body;

    if (paid_amount <= 0) {
      return res.status(400).json({
          success: 0,
          message: 'The paid amount is invalid',
          data: null,
        });
    }

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

    
    if (isEmpty(pay_invoice)) {
      return res.status(400).json({
        success: 0,
        message: 'Invoice Not Found 1',
        data: null,
      });
    }
    
    if (paid_amount > pay_invoice.required_amount) {
      return res.status(400).json({
        success: 0,
        message: 'The paid amount is greater than required',
        data: null,
      });
    }
    
    // check if paid amount is equal to required amount
    const { required_amount, debt } = pay_invoice;
    
    if (parseInt(required_amount) + parseInt(debt) > parseInt(paid_amount)) {
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
        
        if (!isEmpty(debt_invoice)) {
          const receiver = {
            recipient_id: 3,
            dest_addr: phone_number,
          };
          const message = `Ndugu mteja, Umelipa ankara Tsh ${paid_amount}. Kiasi unachodaiwa kwa mwezi ${debt_invoice.month} ni Tsh ${debt_invoice.debt}`;
  
          const send_text = send_sms(message, receiver);

         const isInv = await Customer.updateOne({phone_number: phone_number}, {isInvoiced: false}, {timestamps});
  
         if (!isInv || isInv) {
           return res.status(201).json({
             success: 1,
             message: 'Invoice paid with the debt',
             data: {debt_invoice, send_text},
           });
         }
        }
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

        if (!isEmpty(complete_invoice)) {
          const receiver = {
            recipient_id: 3,
            dest_addr: phone_number,
          };
          const message = `Ndugu mteja, Umelipa ankara Tsh ${paid_amount}. Kiasi unachodaiwa kwa mwezi ${complete_invoice.month} ni Tsh ${complete_invoice.debt}`;
  
          const send_text = send_sms(message, receiver);
  
         const isInv = await Customer.updateOne({phone_number: phone_number}, {isInvoiced: false}, {timestamps});
         if (!isInv || isInv) {
          return res.status(201).json({
            success: 1,
            message: 'Invoice paid without the debt',
            data: {complete_invoice, send_text},
          });
        }
        }
      }

    return res.status(404).json({
      success: 0,
      message: 'Fail to pay invoice',
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
