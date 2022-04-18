const express = require("express");
const router = express.Router();

const message_controller = require("../controllers/messageController");
const membership_controller = require("../controllers/membershipController");

// message routes
router.get("/message", message_controller.get_form);
router.post("/message", message_controller.post_form);
router.get("/message/user/:id", message_controller.get_user_message);

// membership routes
router.get("/membership", membership_controller.get_membership);
router.post('/membership', membership_controller.post_membership)

module.exports = router;
