const express = require('express');
const router = express.Router();

const {
	fetchGroups,
	fetchGroup,
	createGroup,
	deleteGroup,
} = require('../controllers/groupController');

router.post('/fetchall', fetchGroups);
router.post('/fetch', fetchGroup);
router.post('/create', createGroup);
router.post('/delete', deleteGroup);

module.exports = router;
