const { Kafka } = require('kafkajs')
const { Meeting } = require('../../schema/schema.js')
require("dotenv").config();
const rejectedMailer = async (req, res) => {
    try {
        const id = req.body.id
        const visitoremail = req.body.visitorEmail
        let office_loc, hostname, hostemail; 
       

        const selectQuery = await Meeting.findAll({
            where:{
                vm_request_id:id
            }
        });

        if(selectQuery.length>0){
                // If there are rows, you can access the values in each row
                selectQuery.forEach((row) => {
                    office_loc = row.office_loc
                    hostemail=row.employee_email
                    hostname = row.host_employee  
                    console.log(hostname)
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
                        Hi , <br/>
                        The meeting was rejected by  ${hostname}  
                        <br/>
                        <br/>
                        Regards, <br/>
                        Visitor Management Bot<br/>
    
                        <h6>This message is automated, do not reply to this message</h6>
                    </div>
                </body>
                </html>
              `;
    
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
                                    value: `{"meetingId":"SGML","message":{"body":"${base64Template}","fromEmail":"no-reply-lab37@goindogo.in","toEmail":"${visitoremail}","ccEmail":"${hostemail}","subject":"Rejected Meeting"},"meetingTimeFrom":"20230902T103400","meetingTimeTo":"20230902T103400","meetingLocation":"${office_loc}"}`
                                }
                            ]
    
                        })
    
                        console.log('Message sent successfully');
                        
                    }
    
                    run()
                    //run()
                    res.status(200).send('Meeting approval Mail send successfully')
                
            
        }
        else{
            console.log('No meetings found for the given ID.');

        }         
    } catch (err) {
        console.log('Error during mailer api call from bot form', err);
        res.status(400).send('Approval mailer api call failed')
    }
}

module.exports ={ rejectedMailer}