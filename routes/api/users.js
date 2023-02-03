const router = require('express').Router();
const {
  getUsers,
  createUser,
  deleteUser,
  updateUser,
  addFriend,
  removeFriend,
} = require('../../controllers/userController');

const { genericController } = require('../../utils/controller');


router.route('/')
  .get(genericController(getUsers))
  .post(genericController(createUser))
  .delete(genericController(deleteUser))
  .put(genericController(updateUser));
router.route('/:userId/friends/')
  .delete(genericController(removeFriend))
  .post(genericController(addFriend));

module.exports = router;
