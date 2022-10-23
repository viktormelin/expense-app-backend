const getUserFromEmail = async (email) => {
  const user = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  if (user) {
    return user.id;
  } else {
    throw new Error("Could not find user");
  }
};

const getUserFromId = async (id) => {
  const user = await prisma.user.findFirst({
    where: {
      id,
    },
  });

  if (user) {
    return user;
  } else {
    throw new Error("Could not find user");
  }
};

const createMembersArray = async (userId, users) => {
  let tempArr = [];

  if (users) {
    for (const email of users) {
      const member = await getUserFromEmail(email);
      if (member) {
        tempArr.push(member);
      }
    }

    tempArr.unshift(userId);
    return tempArr;
  } else {
    tempArr.push(userId);
    return tempArr;
  }
};

module.exports = {
  getUserFromEmail,
  createMembersArray,
};
