const router = require('express').Router();
const {
  getThoughts,
  createThought,
  updateThought,
  deleteThought,
  addReaction,
  deleteReaction
} = require('../../controllers/thoughtController');

const {genericController} = require('../../utils/controller');

router.route('/')
  .get(genericController(getThoughts))
  .post(genericController(createThought))
  .put(genericController(updateThought))
  .delete(genericController(deleteThought));

router.route('/:thoughtId/reactions')
  .post(genericController(addReaction))
  .delete(genericController(deleteReaction));

module.exports = router;
