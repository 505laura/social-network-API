const {Thought, User} = require('../models');

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

const createThought = async({body}) => {
  const [thought] = await Thought.create([body]);
  const user = await User.findOneAndUpdate({_id: body.userId}, {$addToSet: {thoughts: thought._id}}, {runValidators: true});
  if (!user) {
    throw new NotFoundError('No user with that ID :(');
  }
  return {thought};
};

const updateThought = async({query, body}) => {
  const thought = await Thought.findOneAndUpdate({ _id: query.thoughtId }, body, { new: true });
  if(!thought) {
    throw new NotFoundError('No thought with that ID :(');
  }
  return 'Thought updated';
};

const deleteThought = async({query}) => {
  const thought = await Thought.findOneAndDelete({ _id: query.thoughtId });
  if(!thought) {
    throw new NotFoundError('No thought with that ID :(');
  }
  await User.findOneAndUpdate({username: thought.username}, {$pull: {thoughts: query.thoughtId}});
  return 'Thought deleted';
};

const addReaction = async({params, body}) => {
  const thought = await Thought.findOneAndUpdate({_id: params.thoughtId}, {$addToSet: {reactions: body}}, {runValidators: true, new: true});
  if(!thought) {
    throw new NotFoundError('No thought with that ID :(');
  }
  return 'Reaction added';
};

const deleteReaction = async(req) => {
  const thought = await Thought.findOneAndUpdate({_id: req.params.thoughtId}, {$pull: {reactions: {reactionId: req.query.reactionId}}}, {new: true});
  if(!thought) {
    throw new NotFoundError('No thought with that ID :(');
  }
  return 'Reaction deleted';
};

module.exports = {
  getThoughts,
  createThought,
  updateThought,
  deleteThought,
  addReaction,
  deleteReaction
};
