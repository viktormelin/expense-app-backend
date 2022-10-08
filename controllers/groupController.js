const asyncHandler = require('express-async-handler');
const { PrismaClient } = require('@prisma/client');
const { createMembersArray } = require('../helpers/groupUtils');
const prisma = new PrismaClient();

const fetchGroups = asyncHandler(async (req, res) => {
	const myGroups =
		(await prisma.groups.findMany({
			where: {
				members: {
					has: req.user.id,
				},
			},
		})) ?? [];

	let data = [];

	if (myGroups.length > 0) {
		for (const group of myGroups) {
			let tempObject = {
				id: group.id,
				expenses: group.expenses,
				members: group.members,
				owner: group.owner,
				title: group.title,
			};

			data.push(tempObject);
		}
	}

	return res.status(200).json({
		data,
	});
});

const fetchGroup = asyncHandler(async (req, res) => {
	const { groupId } = req.body;
	const group = await prisma.groups.findFirst({
		where: { id: groupId },
	});

	if (group) {
		let data = {
			id: group.id,
			expenses: [],
			members: [],
			owner: group.owner,
			title: group.title,
		};

		for (const memberId of group.members) {
			const populatedMember = await prisma.user.findFirst({
				where: {
					id: memberId,
				},
			});

			if (populatedMember) {
				data.members.push({
					id: populatedMember.id,
					email: populatedMember.email,
					firstname: populatedMember.firstname,
					lastname: populatedMember.lastname,
					phone: populatedMember.phone,
				});
			}
		}

		if (group.expenses.length > 0) {
			for (const expenseId of group.expenses) {
				const populatedExpense = await prisma.expenses.findFirst({
					where: {
						id: expenseId,
					},
				});

				if (populatedExpense) {
					data.expenses.push({
						id: populatedExpense.id,
						amount: populatedExpense.amount,
						group: populatedExpense.group,
						owner: populatedExpense.owner,
						title: populatedExpense.title,
						users: populatedExpense.users,
					});
				}
			}
		}

		return res.status(200).json({
			data,
		});
	} else {
		res.status(500);
		throw new Error('Could not find group');
	}
});

const createGroup = asyncHandler(async (req, res) => {
	const { title, users } = req.body;
	const userId = req.user.id;

	if (!title || !users) {
		res.status(400);
		throw new Error('Please provide all required fields');
	}

	const members = await createMembersArray(userId, users);

	const group = await prisma.groups.create({
		data: {
			title,
			members,
			owner: userId,
			expenses: [],
		},
	});

	if (group) {
		return res.status(201).json({
			group,
		});
	} else {
		res.status(500);
		throw new Error('Could not create new group');
	}
});

const deleteGroup = asyncHandler(async (req, res) => {
	const { groupId } = req.body;
	const userId = req.user.id;

	if (!groupId) {
		res.status(400);
		throw new Error('No group id provided');
	}

	const deletedGroup = await prisma.groups.delete({
		where: {
			AND: [{ id: groupId }, { owner: userId }],
		},
	});

	if (deletedGroup) {
		return res.status(201);
	} else {
		res.status(500);
		throw new Error('Could not delete group');
	}
});

module.exports = {
	fetchGroups,
	fetchGroup,
	createGroup,
	deleteGroup,
};
