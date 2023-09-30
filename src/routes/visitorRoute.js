const express = require('express');
const registerControl = require('../controllers/registerController');
const approvalMailer = require('../controllers/approvalController');
const rejectedMailer = require('../controllers/rejectedController');
const { token_controller } = require('../controllers/tokenGenerator');
const route = express.Router();

route.post('/register', registerControl.registerController);
route.post('/registermail', registerControl.registerMailer);
route.post('/approvalmail',approvalMailer.approvalMailer);
route.post('/rejectedmail',rejectedMailer.rejectedMailer);
route.get('/token', token_controller)

module.exports = route;