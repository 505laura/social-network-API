const {Thought} = require('../models');

const {NotFoundError} = require('../utils/errors');

const getThoughts = async({query}) => {
  if(query.thoughtId) {
    const thought = await Thought.findOne({ _id: query.thoughtId }).select('-__v').lean();
    if(!thought) {
      throw new NotFoundError('No thought with that ID :(');
    } 
    return {thought};
  }
  
  const thoughts = await Thought.find().select('-__v').lean();
  return {thoughts};
};

module.exports = {
  getThoughts
};
