const { sumBy } = require('lodash');

const generateRandomNumber = (min = 0, max = 500000) => {
  min = Math.ceil(min);
  max = Math.floor(max);

  const num = Math.floor(Math.random() * (max - min + 1)) + min;
  return num.toString().padStart(6, '0');
};

// -> calculate debt
const calculateDebt = (paid_amount, required_amout) => {
  if (paid_amount > required_amout) {
    let amount = paid_amount - required_amout;
    return amount;
  }

  let debt = required_amout - paid_amount;
  return debt;
};

// -> sum customer debt
const sumAllCustomerDebt = (payload) => {
  const totalDebt = sumBy(payload, (obj) => obj.debt);
  return totalDebt;
};

module.exports = {
  generateRandomNumber,
  calculateDebt,
  sumAllCustomerDebt,
};
