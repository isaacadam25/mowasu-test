const { connect } = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await connect(process.env.MONGO_DB_URI);
    console.log(`Database connected on host ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
  }
};

module.exports = { connectDB };
