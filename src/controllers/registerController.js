
const { v4: uuidv4 } = require('uuid')
const moment = require('moment')
const { Kafka } = require('kafkajs')
const { Meeting, Visitor } = require('../../schema/schema');
require("dotenv").config();
//POST visitor details
const registerController = async (req, res) => {
  try {
    console.log('inside visitor register controller');
    let visitor_id = uuidv4().slice(0, 8);
    let vm_request_id = uuidv4().slice(0, 8);
    const name = req.body.VisitorName
    const hostname = req.body.hostname
    const hostemail = req.body.hostemail
    const email = req.body.email
    const mobile = req.body.mobileNumber
    const office_loc = req.body.location
    
    let arr = [name, hostname, hostemail, email, mobile, office_loc]

    console.log(name, hostname, hostemail, email, mobile, office_loc, 'details visitor');

    //send status 400 when something is missing
    if(!arr.every((item) => {
      if (item == null || item == undefined) {
        return false;
      }
      console.log(item)
      return true;
    }
    )){
      console.log('hit')
      return res.status(400).json({message:"Invalid input"})
    }

    //first we check whether visitor has already been visited or not
    let visitor = await Visitor.findAll({
      where: { visitor_mobile: mobile }
    });

    if (visitor.length == 0) {
      //if no visitor exists then we create a new visitor
      const insert_visitor = await Visitor.create({
        visitor_id: visitor_id,
        visitor_mobile: mobile,
        visitor_email: email,
        visitor_name: name
      })
      visitor=insert_visitor;
    }
    else {
      visitor_id = visitor[0].visitor_id;
    }

    //now we combine the visitor_id with vm_request_id to generate a unique meeting id
    vm_request_id = `${visitor_id}-${vm_request_id}`;

    const insertMeetingsQuery = await Meeting.create({
      vm_request_id,
      visitor_id,
      host_employee: hostname,
      employee_email: hostemail,
      purpose_of_visit:null,
      start_time:null,
      end_time:null,
      office_loc
    })

    return res.status(200).json({
      message: 'Registration Successful!', data:visitor,vm_request_id:vm_request_id});

    // insertMeetingsQuery.then(

    // let insertMeetings = 'INSERT INTO meeting (vm_request_id,visitor_id,host_employee,purpose_of_visit,employee_email,start_time,end_time,office_loc,accompany) VALUES(?,?,?,?,?,?,?,?,?)';
    // let insert_query = `INSERT INTO visitor (visitor_id,visitor_name,visitor_mobile,visitor_email) VALUES (?,?,?,?);`;

    // //check query if mobile number already exists
    // let check_query = `SELECT * FROM visitor WHERE visitor_mobile = ?;`;
    // sqlConnection.query(check_query, [mobile], (err, result) => {
    //   if (err) {
    //     console.error('Error inserting data:', err);
    //     res.status(500).json({ error: 'Failed to insert data' });
    //     return;
    //   }
    //   if (result.length > 0) {
    //     console.log('Mobile number already exists!');
    //     res.status(201).json({ message: 'Mobile number already exists!' });
    //     return;
    //   } else {
    //     sqlConnection.query(insert_query, [
    //       visitor_id, name, mobile, email],
    //       function (err, result) {
    //         if (err) {
    //           console.error('Error inserting data in Table Visitor:', err);
    //           res.status(500).json({ error: 'Failed to insert data in table Visitor' });
    //           return;
    //         } else {
    //           console.log('data inserted in Table Visitor');
    //           sqlConnection.query(insertMeetings, [vm_request_id, visitor_id, hostname, " ", hostemail, "", "", office_loc, ""], function (err, result) {
    //             if (err) {
    //               console.log(`Error during insertion for Table Meeting : ${err}`)
    //             }
    //             else {
    //               console.log('Data Inserted for Table Meeting');
    //               res.status(200).json({ message: 'Registration Successful!', vm_request_id });
    //             }
    //           });
    //         }
    //       })
    //   }
    // });
  }
  catch (err) {
    console.log(err, 'botform api failed');
    return res.status(500).json({ error: 'Failed to call api for botform page' });
  }
}

const registerMailer = async (req, res) => {
  try {
    console.log('inside register mailer');
    const name = req.body.VisitorName
    const hostname = req.body.hostname
    const hostemail = req.body.hostemail
    const email = req.body.email
    const vm_request_id = req.body.vm_request_id
    console.log(name, hostname, hostemail, email, vm_request_id, 'details');

    const htmlTemplate = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body>
      <div>
          Hi ${name}, <br/>
          ${hostname} has requested to arrange a meeting with you. 
          Please provide additional details through this meeting link<br/>
          <a href="https://vms-frontend-vms2-qa.apps.ocpnonprodcl01.goindigo.in/meeting/${vm_request_id}">
              Meeting Link
          </a>
          <br/>
          <br/>
          Regards, <br/>
          Visitor Management Bot<br/>
  
          <h6>This message is automated, do not reply to this message</h6>
      </div>
  </body>
  </html>
  `;

    //Convert to Base64

    const base64Template = Buffer.from(htmlTemplate).toString('base64');

    //notification service function
    async function run() {
      console.log('inside run kafka function');
      const kafka = new Kafka({ brokers: [process.env.kafka] });
      const producer = kafka.producer();
      await producer.connect();
      producer.send({
        // Kafka topic name to which the applciation will produce the message .
        topic: "vms-email-topic",
        messages: [
          {
            value: `{"meetingId":"SGML","message":{"body":"${base64Template}","fromEmail":"no-reply-lab37@goindogo.in","toEmail":"${email}","ccEmail":"${hostemail}","subject":"Indigo | Register for Meeting"},"meetingTimeFrom":"20230902T103400","meetingTimeTo":"20230902T103400","meetingLocation":"Gurgaon"}`
          }
        ]

      })
      res.status(200).send('Botform Mail send successfully')
    }
    run();
  }
  catch (err) {
    console.log('Error during mailer api call from bot form', err);
    res.status(400).send('Bot form mailer failed')
  }

}

module.exports = { registerController, registerMailer }