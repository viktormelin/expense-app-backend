const { response } = require("express");
const asyncHandler = require("express-async-handler");
const { createMembersArray } = require("../helpers/groupUtils");
const Expenses = require("../models/expenseModel");
const Groups = require("../models/groupModel");

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

  return res.status(200).json(data);
});

const fetchGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.body;
  const group = await Groups.findOne({
    id: groupId,
  })
    .populate("members")
    .populate("expenses")
    .populate("owner")
    .exec();

  let populatedExpenses = [];

  for (const expense of group.expenses) {
    const curExpense = await Expenses.findOne({ _id: expense._id })
      .populate("owner")
      .populate("users.user")
      .exec();

    populatedExpenses.push(curExpense);
  }

  const data = {
    _id: group._id,
    expenses: populatedExpenses,
    members: group.members,
    owner: group.owner,
    title: group.title,
  };

  return res.status(200).json(data);
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
