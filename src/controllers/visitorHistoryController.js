const { Op } = require('sequelize');
const sequelize = require('../../config/db');
const connection=require('../../config/db');
const { VisitorHistory, Meeting, Visitor, VisitorIdentity } = require('../../schema/schema');
const moment = require("moment");

// fetch the all history of visitors who visited the campus
// @desc GET request security-api/visitor_history
const visitor_history_controller= async (req, res) => {
    try {
            const visitorHistory = await VisitorHistory.findAll({
              order: [
                sequelize.literal(`
                  CASE
                    WHEN check_in IS NULL THEN 0
                    ELSE 1
                  END`),
                [sequelize.literal('STR_TO_DATE(check_in, "%Y-%m-%d %H:%i:%s")'), 'DESC'],
              ],
            });
           return res.status(200).json({
              success: true,
              message: 'Data fetched successfully',
              data: visitorHistory
            })
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            })
        }
}


// 2. Search bar in visitor history
// @desc GET request security-api/history_search_bar?q=
const search_bar_controller= async (req, res) => {
    try {
            const searchKeyword=req.query.name || "";
            const searchDate = req.query.date
            console.log("Search Keyword",searchKeyword);
            const formattedDate = moment(searchDate, 'YYYY/MM/DD').startOf("day").toDate();
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
              order:[[sequelize.literal("check_in >= CURDATE()"),"DESC"]],
              where:{
                [Op.or]: [
                  { vm_request_id: { [Op.like]: `%${searchKeyword}%` } },
                  { employee_email: { [Op.like]: `%${searchKeyword}%` } },
                  sequelize.literal(`visitor.visitor_name LIKE '%${searchKeyword}%'`),
                  sequelize.literal(`visitor.visitor_mobile LIKE '%${searchKeyword}%'`),
                ],
                start_time:{
                  [Op.gte]: formattedDate
                }
              }
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
                employee_email: meeting.employee_email,
                id_proof:identityVisitor?.id_proof
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



            // const stmt='SELECT * FROM visitor_history WHERE vm_request_id LIKE ? OR visitor_id LIKE ? ORDER BY check_in >= CURDATE() DESC';
            // connection.query(stmt,[`%${searchKeyword}%`,`%${searchKeyword}%`] ,(err, rows) => {
            //     if (err) {
            //       console.error('Error executing query: ', err);
            //     } else {
            //       console.log('Result:', rows);
            //       res.status(200).json({
            //         success: true,
            //         message: 'Data fetched successfully',
            //         data: rows
            //       })
            //     }
            // });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            })
        }
}


 module.exports={visitor_history_controller,search_bar_controller};