const { default: mongoose } = require('mongoose');
const { User, Thought } = require('../models');

const {NotFoundError, HTTPError} = require('../utils/errors');

const USER_NOT_FOUND = 'No user found with that ID :(';

// Execute the aggregate method on the User model and calculate the overall grade by using the $avg operator
const getUsers = async({query}) => {
    if(query.userId) {
        const user = await User.findOne({ _id: query.userId }).select('-__v').lean()
        if(!user) {
            throw new NotFoundError(USER_NOT_FOUND);
        }
        return {user};
    }
    const users = await User.find().populate('friends').populate('thoughts')
    .select('-__v')
    .lean()
    .exec();
    return {users};
}


const createUser = async(req) => {
    try {
        const [user] = await User.create([req.body]);
        return {user};
    }
    catch (err) {
        if(err.code === 11000) {
            throw new HTTPError('Username or email already exists', 400);
        }
        if(err instanceof mongoose.Error.ValidationError) {
            throw new HTTPError(err.message, 400);
        }
        throw err;
    }
};

const updateUser = async(req) => {
    const user = await User.findOneAndUpdate({ _id: req.query.userId }, req.body, { new: true });
    if (!user) {
        throw new NotFoundError(USER_NOT_FOUND);
    }
    return {user};
};

const deleteUser = async(req) => {
    const user = await User.findOneAndRemove({ _id: req.query.userId })
    if(!user) { throw new NotFoundError(USER_NOT_FOUND); }
    await Thought.deleteMany({ username: user.username });
    return 'User deleted';
}

const addFriend = async(req) => {
    const friend = await User.findOne({ _id: req.query.friendId });
    if(!friend) {
        throw new NotFoundError('No friend found with that ID :(');
    }
    const user = await User.findOneAndUpdate({ _id: req.params.userId }, { $addToSet: { friends: req.query.friendId } }, { runValidators: true, new: true });
    if(!user) {
        throw new NotFoundError(USER_NOT_FOUND);
    }
    await User.findOneAndUpdate({ _id: req.query.friendId },{ $addToSet: { friends: req.params.userId } },{ runValidators: true, new: true });
    return 'Friend added! :)';
};

const removeFriend = async(req) => {
    const friend = await User.findOne({ _id: req.query.friendId });
    if(!friend) {
        throw new NotFoundError('No friend found with that ID :(');
    }
    if(!friend.friends.includes(req.params.userId)) {
        throw new NotFoundError('You are not friend with that user! :(');
    }
    const user = await User.findOneAndUpdate({ _id: req.params.userId }, { $pull: { friends: req.query.friendId } }, { runValidators: true, new: false });
    
    if(!user) {
        throw new NotFoundError(USER_NOT_FOUND);
    }
    
    await User.findOneAndUpdate({ _id: req.query.friendId },{ $pull: { friends: req.params.userId } },{ runValidators: true, new: true });
    
    return 'Friend removed! :(';
};

module.exports = {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    addFriend,
    removeFriend
}            
