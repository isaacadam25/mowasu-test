require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/dbconfig');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const customerRouter = require('./routes/customer.routes');
const userRouter = require('./routes/user.routes');
const invoiceRouter = require('./routes/invoice.routes');
const locationRouter = require('./routes/location.routes');

app.use('/api/v1/customers', customerRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/invoices', invoiceRouter);
app.use('/api/v1/locations', locationRouter);

connectDB();

app.listen(process.env.APP_PORT || process.env.PORT, () => {
  console.log(`Server is up and running on port ${process.env.APP_PORT || 4000}`);
});
