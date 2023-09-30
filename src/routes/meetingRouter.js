const Router= require("express").Router();
const scheduleMeeting = require("../controllers/meetingController")
const multer = require('multer')
const upload = multer()

Router.get('/test',scheduleMeeting.testConnection)
Router.post('/meeting',upload.single('idUpload'),scheduleMeeting.schedule)
Router.get('/formDataEmployee',scheduleMeeting.getEmployeeDetails)
Router.get('/formDataVisitor',scheduleMeeting.getVisitorDetails)
Router.post('/mailer',scheduleMeeting.approveMail)


module.exports=Router