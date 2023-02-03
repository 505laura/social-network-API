const router = require('express').Router();
const {getThoughts} = require('../../controllers/thought');

const {genericController} = require('../../utils/controller');

router.route('/').get(genericController(getThoughts));

module.exports = router;
