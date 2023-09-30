const { Sequelize } = require('sequelize');
require("dotenv").config();

const sequelize = new Sequelize("vms2_test","root","root",{
    //const sequelize = new Sequelize(process.env.dbName,process.env.dbUser,process.env.dbPassword ,{
    dialect:"mysql",
    //host:process.env.dbHost,
    host:'localhost'
  
});
module.exports = sequelize;

// const mysql2 = require('mysql2');
// const connection=mysql2.createConnection({
//     host:"vms2-database.vms-dev-env.svc.cluster.local",
//     user:"vmsuser",
//     password:"vmsindigo",
//     database:"vms",
//     keepAliveInitialDelay: 10000,
//     enableKeepAlive: true,
//     // host:"localhost",
//     // user:"root",
//     // password:"root",
//     // database:"vms2_local"
// })
// //connection successfully created
// module.exports=connection;
