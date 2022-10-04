require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const customerRouter = require('./routes/customer.routes');
const userRouter = require('./routes/user.routes');
const invoiceRouter = require('./routes/invoice.routes');

app.use('/api/v1/customers', customerRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/invoices', invoiceRouter);

const { connectDB } = require('./config/dbconfig');
connectDB();

app.listen(process.env.APP_PORT, () => {
  console.log(`Server is up and running on port ${process.env.APP_PORT}`);
});
