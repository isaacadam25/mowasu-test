const User = require('../models/user.model');

const createUser = async (req, res) => {
  const { username, password, phone_number } = req.body;

  if (!username || !password || !phone_number) {
    return res.status(400).json({
      success: 0,
      data: 'Fill the required fields',
    });
  }

  const user = new User({
    username,
    password,
    phone_number,
  });

  try {
    await user.save();
    return res.status(201).json({
      success: 1,
      message: 'user created',
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: 'Fail to create new user',
      data: null,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const user = await User.find();
    return res.status(201).json({
      success: 1,
      message: 'users found',
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: 'Fail to get users',
      data: null,
    });
  }
};

const getSingleUser = async (req, res) => {
  let id = req.params.id;

  try {
    const user = await User.findById(id);
    return res.status(201).json({
      success: 1,
      message: 'user found',
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: 'Fail to get user',
      data: null,
    });
  }
};

const updateUser = async (req, res) => {
  let id = req.params.id;

  const { username, password, phone_number } = req.body;

  if (!username || !password || !phone_number) {
    return res.status(400).json({
      success: 0,
      data: 'Fill the required fields',
    });
  }

  try {
    const user = await User.findByIdAndUpdate(
      id,
      {
        username,
        password,
        phone_number,
      },
      {
        returnDocument: 'after',
        timestamps: true,
      }
    );
    return res.status(201).json({
      success: 1,
      message: 'user found',
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: 'Fail to get user',
      data: null,
    });
  }
};

const deleteUser = async (req, res) => {
  let id = req.params.id;

  try {
    const user = await User.deleteOne({ id: id });
    return res.status(201).json({
      success: 1,
      message: 'user deleted',
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: 'Fail to delete user',
      data: null,
    });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
};
