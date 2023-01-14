const { isEmpty } = require('lodash');

// * require transaction queries
const transactionQueries = require('../models/queries/transaction.queries');

// * get customer transactions
const getCustomeTransactions = async (req, res) => {
  try {
    // -> get customer id from params
    const { customer_id } = req.params;

    if (!customer_id) {
      return res.status(400).json({
        success: 0,
        message: 'Customer id is required',
        data: null,
      });
    }

    const customerTransactions = await transactionQueries.getByCustomerId(
      customer_id
    );

    if (isEmpty(customerTransactions)) {
      return res.status(400).json({
        success: 0,
        message: 'Fail to get transaction details',
        data: null,
      });
    }

    return res.status(200).json({
      success: 1,
      message: 'Transaction details found',
      data: customerTransactions,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: 'Unexpected error occurred',
      data: null,
    });
  }
};

module.exports = {
  getCustomeTransactions,
};
