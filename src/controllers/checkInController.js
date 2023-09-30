const connection = require("../../config/db");
const { VisitorHistory,Meeting } = require("../../schema/schema");

// 1. Checkin API- to checkin the user
// @desc: PUT security-api /checkin/
const checkin_controller = async (req, res) => {
    try {

        let {  vm_request_id, check_in,visitor_id} = req.body;
        console.log(req.body);
        if (check_in == null || check_in == undefined) {
            return res.status(400).json({
                status: false,
                message: "Please enter check in time"
            })
        }
        console.log(check_in, vm_request_id,visitor_id)
        // first check whether user is already checkedIn or not
        const visitorHistoryQuery = await VisitorHistory.findAll({
            where:{
                vm_request_id
            }
        });
        // console.log(visitorHistoryQuery)
        if(visitorHistoryQuery.length==0){
            const meetingQuery = await Meeting.findAll({
                where:{
                    vm_request_id
                }
            });
            // console.log(meetingQuery)
            // meetingQuery = meetingQuery.map((meeting) => meeting.get({ plain: true }));
            // console.log(meetingQuery)
            if(meetingQuery.length==0){
                // console.log("outside")
                return res.status(200).json({
                    success: false,
                    message: 'No meeting found for this id'
                });
            }
            // console.log("abc");
            // console.log(meetingQuery)
            const insertVisitorHistory = await VisitorHistory.create({
                visitor_id,
                vm_request_id,
                check_in,
                check_out:null
            });
            console.log("inside",insertVisitorHistory);
            return res.status(200).json({
                success: true,
                message: 'Checked in successfully',
                data: insertVisitorHistory
            });
        }
        else{
            return res.status(200).json({
                success: false,
                message: 'User already checked in'
            });
        }
    }
    catch (e) {
        res.status(500).json({
            success: false,
            message: e.message
        })
    }
}


// 2. Checkout API
// @desc: PUT security-api /checkout/
const checkout_controller = async (req, res) => {
    try {
        let { vm_request_id, check_out } = req.body;
        if (check_out == null || check_out == undefined) {
            return res.status(400).json({
                status: false,
                message: "Please enter check out time"
            })
        }
        const visitorHistoryQuery = await VisitorHistory.findAll({
            where:{
                vm_request_id
            }
        });

        if(visitorHistoryQuery.length==0){
            return res.status(200).json({
                success: false,
                message: 'No meeting found for this id'
            })
        }
        else if(visitorHistoryQuery.length>0){
            if(visitorHistoryQuery[0]?.check_in==null){
                return res.status(200).json({
                    success: false,
                    message: 'User has not checked in yet'
                })
            }
            else if(visitorHistoryQuery[0]?.check_out!==null){
                return res.status(200).json({
                    success: false,
                    message: 'User already checked out'
                })
            };

            const updateQuery = await VisitorHistory.update({
                check_out
            },{
                where:{
                    vm_request_id
                }
            });

            return res.status(200).json({
                success: true,
                message: 'Checked Out successfully',
                data: updateQuery
            })

        }
    }
    catch (e) {
        res.status(500).json({
            success: false,
            message: e.message
        })
    }
}


module.exports = { checkin_controller, checkout_controller };