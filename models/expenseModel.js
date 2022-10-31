const mongoose = require("mongoose");

const expenseUser = {
  amount: Number,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
};

const expenseSchema = mongoose.Schema({
  amount: { type: Number, required: true },
  title: { type: String, required: true },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Groups",
  },
  users: [
    {
      amount: Number,
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    },
  ],
});

module.exports = mongoose.model("Expenses", expenseSchema);
