const express = require('express');
const {
	fetchExpense,
	createExpense,
	handleExpensePayment,
} = require('../controllers/expenseController');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

router.get('/fetch', protect, fetchExpense);
router.post('/create', protect, createExpense);
router.post('/pay', protect, handleExpensePayment);

module.exports = router;
