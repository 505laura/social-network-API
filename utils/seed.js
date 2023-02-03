const connection = require('../config/connection');
const { Thought, User } = require('../models');
const { getRandomUser, getRandomArrItem } = require('./data');

connection.on('error', (err) => err);

connection.once('open', async () => {
  console.log('connected');

  await Thought.deleteMany({});
  await User.deleteMany({});

  const users = [];
  const thoughts = [];

  const userByUserName = {};
  const friendsByUserName = {};

  for (let i = 0; i < 5; i++) {
    const {username, email} = getRandomUser();

    users.push({
      username,
      email,
      thoughts: [],
      friends: [],
    });

    userByUserName[username] = users[i];
    friendsByUserName[username] = [];
  }

  
  friendsByUserName[users[0].username].push(users[1].username);
  friendsByUserName[users[1].username].push(users[0].username);

  for (let i = 0; i < 5; i++) {
    const username = getRandomArrItem(users).username;
    const user = users.find((user) => user.username === username);

    const friendCount = Math.floor(Math.random() * 3) + 1;
    for(let j = 0; j < friendCount; j++) {
      let friend = getRandomArrItem(users);
      if(friend.username !== user.username && !friendsByUserName[user.username].includes(friend.username)) {
        friendsByUserName[user.username].push(friend.username);
        friendsByUserName[friend.username].push(user.username);
      }
    }
  }



  for (let i = 0; i < 5; i++) {
    const thoughtText = `test ${i}`;
    const username = getRandomArrItem(users).username;

    thoughts.push({
      thoughtText,
      username,
      reactions: []
    });

    const user = users.find((user) => user.username === username);
    user.thoughts.push(thoughts[i]);

    // Add friends

  }
  await User.collection.insertMany(users);
  await Thought.collection.insertMany(thoughts);

  // Add friends
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const friends = friendsByUserName[user.username];
    for(let j = 0; j < friends.length; j++) {
      const friend = userByUserName[friends[j]];
      user.friends.push(friend._id);
    }

    await User.findByIdAndUpdate(user._id, {friends: user.friends});
  }

  // Log out the seed data to indicate what should appear in the database
  // console.table(users);
  console.info('Seeding complete! 🌱');

  console.log('UserId   ', `${users[0]._id}`);
  console.log('FriendId ', `${users[1]._id}`);

  console.log('ThoughtId', `${thoughts[0]._id}`);

  process.exit(0);
});
