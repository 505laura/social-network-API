const router = require('express').Router();
const {getUsers,} = require('../../controllers/userController');

const {genericController} = require('../../utils/controller');


router.route('/').get(genericController(getUsers))

module.exports = router;
