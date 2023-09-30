// const schedule_meet = require("../assets/schedule_meeting.json");
// console.log(schedule_meet);

const { Meeting, Visitor, VisitorHistory, VisitorIdentity } = require("../../schema/schema");
const { Op } = require("sequelize");



// 1. meeting requests route - to fetch the all meeting requests
// @desc : GET request security-api/meeting_requests
const meeting_requests_controller = async (req, res) => {
  try {
    //fetching data from schedule_meeting table from sqlite database
    const selectQuery = await Meeting.findAll({
      include: [
        {
          model: Visitor,
          attributes: ["visitor_name", "visitor_mobile"]
        },
        {
          model: VisitorIdentity,
          attributes: ["id_proof"]
        },
        {
          model: VisitorHistory,
          attributes: ["check_in", "check_out"]
        },

      ],
      order: [["start_time", "DESC"]],
      limit:10,
    });


    //now i'm flattening this data 
    // Process the data to flatten the response
    // const list=selectQuery.flat()
    // console.log("list",list);
    const flattenData = selectQuery.map((meeting) => {
      // Extract visitor and identityVisitor data
      const visitor = meeting.visitor;
      const identityVisitor = meeting.visitor_identity;
      const visitorHistory = meeting.visitor_history;

      // Create a new object with flattened structure
      const flattenedMeeting = {
        vm_request_id: meeting.vm_request_id,
        host_employee: meeting.host_employee,
        purpose_of_visit: meeting.purpose_of_visit,
        start_time: meeting.start_time,
        end_time: meeting.end_time,
        office_loc: meeting.office_loc,
        status: meeting.status,
        visitor_id: meeting.visitor_id,
        employee_email: meeting.employee_email
      };

      // Add visitor data if available
      if (visitor) {
        flattenedMeeting.visitor_name = visitor.visitor_name;
        flattenedMeeting.visitor_mobile = visitor.visitor_mobile;
      }

      // Add identityVisitor data if available
      if (identityVisitor) {
        flattenedMeeting.id_proof = identityVisitor.id_proof;
      }

      //Add visitor history data if available
      if(visitorHistory) {
        flattenedMeeting.check_in= visitorHistory.check_in;
        flattenedMeeting.check_out= visitorHistory.check_out;
      }

      return flattenedMeeting;
    });

    return res.status(200).json({
      success: true,
      message: 'Data fetched successfully',
      data: flattenData 
    })

  }
  catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


// 2. Security Action route
// @desc: PUT request  security-api/security_approval
const security_approval_controller = async (req, res) => {
  try {
    // const currentTime = moment.currentTime();
    // fetching data from frontend 
    const vm_request_id = req.body.vm_request_id;
    const status = req.body.status;
    console.log(vm_request_id);
    console.log(status);

    const checkEntry = await Meeting.findAll({
      where: {
        vm_request_id
      }
    });

    if (checkEntry.length > 0) {
      const updateStatus = await Meeting.update({ status }, {
        where: {
          vm_request_id
        }
      });
      return res.status(200).json({
        success: true,
        message: 'Meeting status updated successfully',
        data: updateStatus
      });
    }
    else {
      return res.status(400).json({
        success: false,
        message: 'No such meeting id exists in the database',
        data: checkEntry
      })
    }
  }
  catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


// 3. Search bar in visitor history
// GET request security-api/approval_search_bar?q=
const approval_search_bar_controller = async (req, res) => {
  try {
    const searchKeyword = req.query.q;
    const getQuery = await Meeting.findAll({
      where: {
        [Op.or]: [
          { vm_request_id: { [Op.like]: `%${searchKeyword}%` } },
          { employee_email: { [Op.like]: `%${searchKeyword}%` } }
        ]
      },
      include: {
        model: Visitor,
        attributes: ["visitor_name", "visitor_mobile", "visitor_email"]
      }
    });
    res.status(200).json({
      success: true,
      message: 'Data fetched successfully',
      data: getQuery
    })
  }
  catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}




module.exports = { security_approval_controller, meeting_requests_controller, approval_search_bar_controller };