const Router=require("express").Router();

const { checkin_controller, checkout_controller } = require("../controllers/checkInController");
const {security_approval_controller,approval_search_bar_controller, meeting_requests_controller}=require("../controllers/securityApprovalController");
const { search_bar_controller,visitor_history_controller } = require("../controllers/visitorHistoryController");

Router.get("/pending_requests",meeting_requests_controller);
Router.put("/security_approval",security_approval_controller);
Router.get("/approval_search_bar",approval_search_bar_controller);

Router.get("/visitor_history",visitor_history_controller);
Router.get("/history_search_bar",search_bar_controller);
Router.put("/checkin",checkin_controller);
Router.put("/checkout",checkout_controller);

module.exports=Router;