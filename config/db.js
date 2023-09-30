const { Sequelize } = require('sequelize');
require("dotenv").config();

const sequelize = new Sequelize("postgres","postgres","postgres",{
    dialect:"postgres",
    host:'localhost'
});
module.exports = sequelize;
