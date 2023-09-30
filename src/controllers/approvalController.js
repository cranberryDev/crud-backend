const sqlConnection = require('../../config/db.js')
const { Kafka } = require('kafkajs')
const { Meeting } = require('../../schema/schema.js')
require("dotenv").config();


const approvalMailer = async (req, res) => {
    try {
        const id = req.body.id
        const visitorname = req.body.visitorName
        const visitoremail = req.body.visitorEmail
        let purpose,start_time, end_time, office_loc, hostname, hostemail; 
        let check_query = `SELECT * FROM meeting WHERE vm_request_id = ?;`;

        const selectQuery = await Meeting.findAll({
            where:{
                vm_request_id:id
            }
        });

        if(selectQuery.length>0){
           
                // If there are rows, you can access the values in each row
                selectQuery.forEach((row) => {
                    console.log('Purpose of visit:', row.purpose_of_visit); 
                    purpose = row.purpose_of_visit
                    start_time= row.start_time
                    end_time=row.end_time
                    office_loc = row.office_loc
                    hostemail=row.employee_email
                    hostname = row.host_employee
                    console.log(purpose)
                    console.log(start_time)
                    console.log(hostname)
                    console.log(office_loc)
                    console.log(end_time)// Access other columns similarly
                });

                const htmlTemplate = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body>
                <div>
                Hi ,
                <p>A meeting has been scheduled between ${visitorname} and ${hostname}<br />
                    Here are the additional details for the meeting</p>
                <table>
                    <tr>
                        <td>Meeting ID:</td>
                        <td>${id}</td>
                    </tr>
                    <tr>
                        <td>Purpose of Meeting:</td>
                        <td>${purpose}</td>
                    </tr>
                    <tr>
                        <td>Start Time:</td>
                        <td>${start_time}</td>
                    </tr>
                    <tr>
                        <td>End Time:</td>
                        <td>${end_time}</td>
                    </tr>
                    <tr>
                        <td>Office Location:</td>
                        <td>${office_loc}</td>
                    </tr>
                </table>
                Regards, <br />
                Visitor Management Bot<br />
                <h6>This message is automated, do not reply to this message</h6>
            </div>
                </body>
                </html>
              `;
    
                    const base64Template = Buffer.from(htmlTemplate).toString('base64');
    
                    //notification service function
                    async function run() {
                        console.log('inside run kafka function');
                        console.log(purpose)
                        console.log(start_time)
                        console.log(hostname)
                        console.log(office_loc)
                        const kafka = new Kafka({ brokers: [process.env.kafka] });
                        const producer = kafka.producer();
                        await producer.connect();
                        producer.send({
                            // Kafka topic name to which the applciation will produce the message .
                            topic: "vms-email-topic",
                            messages: [
                                {
                                    value: `{"meetingId":"SGML","message":{"body":"${base64Template}","fromEmail":"no-reply-lab37@goindogo.in","toEmail":"${visitoremail}","ccEmail":"${hostemail}","subject":"Approved Meeting"},"meetingTimeFrom":"20230902T103400","meetingTimeTo":"20230902T103400","meetingLocation":"${office_loc}"}`
                                }
                            ]
    
                        })
    
                        console.log('Message sent successfully');
                        
                    }
    
                    //run()
                    //run()
                    res.status(200).send('Meeting approval Mail send successfully')
                
            
        }
        else {
            console.log('No meetings found for the given ID.');
        }

        // Execute the query with a parameterized value           

    } catch (err) {
        console.log('Error during mailer api call from bot form', err);
        res.status(400).send('Approval mailer api call failed')
    }
}

module.exports ={ approvalMailer}