const express = require('express');

const router = express.Router();

const {
  createUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
} = require('../controllers/user.controller');

router.get('/', getAllUsers);
router.get('/:id', getSingleUser);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
