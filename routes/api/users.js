const router = require('express').Router();
const {getUsers, createUser} = require('../../controllers/userController');

const {genericController} = require('../../utils/controller');


router.route('/')
    .get(genericController(getUsers))
    .post(genericController(createUser))


module.exports = router;
