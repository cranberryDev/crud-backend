const app = require("express")();
const cors = require("cors");
const bodyParser = require("body-parser");
const meetingapi = require("./src/routes/meetingRouter");
const visitorRoute = require("./src/routes/visitorRoute");
const securityRouter = require("./src/routes/securityRouter");
const sequelize = require("./config/db");


require("dotenv").config();

const PORT = process.env.PORT || 8080;

//MIDDLEWARES
const allowedOrigins = ['http://localhost:3000', process.env.prod];
app.use(cors({origin:allowedOrigins}));
app.use(cors({
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
      Accept: "application/json",
    },
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//API routes
app.use("/api", visitorRoute);
app.use("/meeting", meetingapi);
app.use("/security-api", securityRouter);
app.get("/", (req, res) => {
  res.send("Welcome to VMS Backend API");
});

//CREATING A SERVER
app.listen(PORT, () => {
  sequelize
    .authenticate()
    .then(() => {
      console.log("Connection has been established successfully.");
    })
    .catch((error) => {
      console.error("Unable to connect to the database:", error);
    });
  console.log("SERVER is running on port " + PORT);
});
