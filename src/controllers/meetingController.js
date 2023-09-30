const { v4: uuidv4 } = require('uuid')

//const mailer = require('.././notificationService/kafkaMailer.js')
const { Kafka } = require('kafkajs')
const otpGenerator = require('otp-generator')
const { Meeting, Visitor, VisitorIdentity } = require('../../schema/schema.js')

require("dotenv").config();

/*
*paths: /test
    GET:
      summary: api skeleton for testing connection with frontend.
      responses:
        200:
          description: OK
        400:
          description: Failed
*/

const testConnection = async (req, res) => {
    try {
        console.log('Inside test connection')
        return res.status(200).send('Test Connection Working')
    }
    catch (error) {
        console.error('Error in main function:', error)
    }

}


/*
*paths: /formDataEmployee
    POST:
      summary: get the details of the employee from table meeting.
      responses:
        200:
          description: OK
        400:
          description: Failed
*/

const getEmployeeDetails = async (req, res) => {
    try {
        console.log('inside get visitor details');
        var vm_id = req.headers.id;
        console.log(vm_id, 'vid');

        const getQuery = await Meeting.findAll(
            {
                where: {
                    vm_request_id: vm_id
                }
            }
        );

        return res.status(200).json({ 'Form Data': getQuery })
    }
    catch (err) {
        console.log(err);
        return res.status(400).json(`Error:${err}`)
    }
}

/*
*paths: /formDataVisitor
    GET:
      summary: get the details of the visitor from table visitor.
      responses:
        200:
          description: OK
        400:
          description: Failed
*/

const getVisitorDetails = async (req, res) => {
    try {
        console.log('inside get visitor details');
        var visitor_id = req.headers.vid;
        console.log(visitor_id, 'vid');

        const getQuery = await Visitor.findAll({
            where: {
                visitor_id
            }
        });

        return res.status(200).json({
            "Form Data": getQuery
        });
    }
    catch (err) {
        console.log(err);
        return res.status(400).json(`Error:${err}`)
    }
}

/*
*paths: /schedule
    POST:
      summary: Insert the details of the meeting in table meeting.
      responses:
        200:
          description: OK
        400:
          description: Failed
*/

const schedule = async (req, res) => {
    try {
        let vid = uuidv4().slice(0, 5);
        let vm_request_id = req.headers.id;
        let purpose_of_visit = req.body.purpose
        let id_type = req.body.id || ''
        let id_number = req.body.idNumber || ''
        let id_proof = req.file
        console.log(id_proof, 'id proof inside meeting');
        let start_time = req.body.startTime
        let end_time = req.body.endTime
        let accompany = req.body.accompany || ''


        const getVisitorId = await Meeting.findAll({
            where: {
                vm_request_id
            }
        });

        if (getVisitorId.length > 0) {
            const visitor_id = getVisitorId[0].visitor_id;

            const checkIdVisIdentity = await VisitorIdentity.findAll({
                where:{
                    visitor_id
                }
            });
            if(checkIdVisIdentity.length==0){
                const insertIdQuery = await VisitorIdentity.create({
                    vid,
                    visitor_id,
                    id_type,
                    id_number,
                    id_proof: id_proof?.buffer
                });
                console.log('Data Inserted for Table Visitor ID:', insertIdQuery);
            }

            const updateMeetingQuery = await Meeting.update({
                purpose_of_visit,
                start_time,
                end_time,
                accompany
            }, {
                where: {
                    vm_request_id
                }
            });
            console.log('Data Inserted for Table Meeting:', updateMeetingQuery);
            return res.status(200).json({ updateMeetingQuery })
        }

        res.status(404).json({
            success: false,
            message: "Couldn't Find Meeting For This Id",
            data: getVisitorId
        })

    }
    catch (err) {
        console.log(err);
        return res.status(400).json({ err })
    }
}

/*
*paths: /sendApproveMail
    POST
      summary: api will trigger mail that will be sent to the employee for approval.
      responses:
        200:
          description: OK
        400:
          description: Failed
*/
const approveMail = (req, res) => {
    try {
        var employee_name = req.body.empName;
        var visitor_name = req.body.visitorName;
        var employee_mail = req.body.empMail;
        var vm_request_id = req.body.id;
        var startTime = req.body.startTime;
        var endTime = req.body.endTime;
        var location = req.body.location;

        console.log(employee_name, visitor_name, employee_mail, vm_request_id, 'details');

        //Mail Template
        const htmlTemplate = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
            <div>
                Hi ${employee_name}, <br/>
                ${visitor_name} has been registered for a meeting with you. 
                Please approve/reject the meeting through the link below.<br/>
                <a href="${process.env.prod}/approval/${vm_request_id}">
                    Meeting Approval Link
                </a>
                <br/>
                <br/>
                Regards, <br/>
                Team Indigo<br/>
        
                <h6>This message is automated, do not reply to this message</h6>
            </div>
        </body>
        </html>
        `;

        //Convert to Base64
        const base64Template = Buffer.from(htmlTemplate).toString('base64');


        //Kafka Function
        async function run() {
            console.log('inside run function');
            var otp = otpGenerator.generate(5, { upperCaseAlphabets: false, specialChars: false, alphabets: false, lowerCaseAlphabets: false });
            console.log(otp, 'otp generator');
            // Kafka Producer configuration , bootstrap-server details from OCP
            const kafka = new Kafka({ brokers: [process.env.kafka] });
            // const kafka = new Kafka({ brokers: ["localhost:29092"] });

            const producer = kafka.producer();
            await producer.connect();

            producer.send({
                // Kafka topic name to which the applciation will produce the message .
                topic: "vms-email-topic",
                // Message in JSon format .
                messages: [
                    {

                        value: `{"meetingId":"SGML","message":{"body":"${base64Template}","fromEmail":"no-reply_lab37@goindogo.in","toEmail":"${employee_mail}","ccEmail":"tanuj.pant@goindigo.in","subject":"VMS Approval Request Mail"},"meetingTimeFrom":"20230902T103400","meetingTimeTo":"20230902T103400","meetingLocation":"${location}"}`

                    }
                ]
            });
            console.log('Message sent successfully');
        }
        //run();
        res.status(200).send('Approve Mail Sent Successfully')

    }
    catch (err) {
        console.log(err);
        return res.status(400).json(`Error sending Mail ${err}`)

    }

}

module.exports = { testConnection, schedule, getEmployeeDetails, getVisitorDetails, approveMail }