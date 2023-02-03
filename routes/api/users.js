const router = require('express').Router();
const {getUsers, createUser} = require('../../controllers/user');

const {genericController} = require('../../utils/controller');


router.route('/')
    .get(genericController(getUsers))
    .post(genericController(createUser))


module.exports = router;
