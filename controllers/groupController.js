const { response } = require("express");
const asyncHandler = require("express-async-handler");
const { createMembersArray } = require("../helpers/groupUtils");
const Expenses = require("../models/expenseModel");
const Groups = require("../models/groupModel");
const Users = require("../models/userModel");

const fetchGroups = asyncHandler(async (req, res) => {
  const myGroups =
    (await Groups.find({
      members: req.user.id,
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
  const group = await Groups.findOne({
    id: groupId,
  })
    .populate("members")
    .populate("expenses")
    .exec();

  const groupOwner = await Users.findOne({
    id: group.owner,
  });

  console.log(group);

  return res.status(200).json(group);

  // if (group) {
  // 	let data = {
  // 		id: group.id,
  // 		expenses: [],
  // 		members: [],
  // 		owner: {
  // 			id: groupOwner.id,
  // 			email: groupOwner.email,
  // 			firstname: groupOwner.firstname,
  // 			lastname: groupOwner.lastname,
  // 			phone: groupOwner.phone,
  // 		},
  // 		title: group.title,
  // 	};

  // 	for (const memberId of group.members) {
  // 		const populatedMember = await Users.findOne({
  // 			id: memberId,
  // 		});

  // 		if (populatedMember) {
  // 			data.members.push({
  // 				id: populatedMember.id,
  // 				email: populatedMember.email,
  // 				firstname: populatedMember.firstname,
  // 				lastname: populatedMember.lastname,
  // 				phone: populatedMember.phone,
  // 			});
  // 		}
  // 	}

  // 	if (group.expenses.length > 0) {
  // 		for (const expenseId of group.expenses) {
  // 			const populatedExpense = await Expenses.findOne({
  // 				id: expenseId,
  // 			});

  // 			let populatedExpenseOwner;
  // 			if (populatedExpense) {
  // 				populatedExpenseOwner = await Users.findOne({
  // 					id: populatedExpense.owner,
  // 				});
  // 			}

  // 			let populatedExpenseUsers = [];
  // 			if (populatedExpense) {
  // 				for (const user of populatedExpense.users) {
  // 					const tempUser = await Users.findOne({
  // 						id: user.user,
  // 					});
  // 					populatedExpenseUsers.push({
  // 						id: tempUser.id,
  // 						email: tempUser.email,
  // 						firstname: tempUser.firstname,
  // 						lastname: tempUser.lastname,
  // 						phone: tempUser.phone,
  // 						amount: user.amount,
  // 					});
  // 				}
  // 			}

  // 			if (populatedExpense) {
  // 				data.expenses.push({
  // 					id: populatedExpense.id,
  // 					amount: populatedExpense.amount,
  // 					group: populatedExpense.group,
  // 					owner: {
  // 						id: populatedExpenseOwner.id,
  // 						email: populatedExpenseOwner.email,
  // 						firstname: populatedExpenseOwner.firstname,
  // 						lastname: populatedExpenseOwner.lastname,
  // 						phone: populatedExpenseOwner.phone,
  // 					},
  // 					title: populatedExpense.title,
  // 					users: populatedExpenseUsers,
  // 				});
  // 			}
  // 		}
  // 	}

  // 	return res.status(200).json({
  // 		data,
  // 	});
  // } else {
  // 	res.status(500);
  // 	throw new Error('Could not find group');
  // }
});

const createGroup = asyncHandler(async (req, res) => {
  const { title, users } = req.body;
  const userId = req.user.id;

  if (!title || !users) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  const members = await createMembersArray(userId, users);

  const group = await Groups.create({
    title,
    members,
    owner: userId,
    expenses: [],
  });

  if (group) {
    return res.status(201).json({
      group,
    });
  } else {
    res.status(500);
    throw new Error("Could not create new group");
  }
});

const deleteGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.body;
  const userId = req.user.id;

  if (!groupId) {
    res.status(400);
    throw new Error("No group id provided");
  }

  const deletedGroup = await Groups.deleteOne({
    id: groupId,
    owner: userId,
  });

  if (deletedGroup) {
    return res.status(201);
  } else {
    res.status(500);
    throw new Error("Could not delete group");
  }
});

module.exports = {
  fetchGroups,
  fetchGroup,
  createGroup,
  deleteGroup,
};
