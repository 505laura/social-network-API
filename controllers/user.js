const {User} = require('../models');

const {NotFoundError} = require('../utils/errors');

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

module.exports = {
    getUsers
}            
