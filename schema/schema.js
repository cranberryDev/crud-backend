const { DataTypes } = require("sequelize");
const sequelize = require("./../config/db");

const Visitor = sequelize.define("visitor",{
    visitor_id:{
        type:DataTypes.STRING,
            allowNull:false,
            primaryKey:true
    },
    visitor_name:{
        type:DataTypes.STRING,
    },
    visitor_mobile:{
        type:DataTypes.STRING,
    },
    visitor_email:{
        type:DataTypes.STRING,
    },
    created_at:{
        type: DataTypes.DATE,
        defaultValue: new Date()
    }
},
{
    freezeTableName:true,
    timestamps:false
});


const Meeting = sequelize.define("meeting",{
    vm_request_id:{
        type:DataTypes.STRING,
        allowNull:false,
        primaryKey:true
    },
    visitor_id:{
        type:DataTypes.STRING,
    },
    host_employee:{
        type:DataTypes.STRING,
    },
    employee_email:{
        type:DataTypes.STRING,
    },
    purpose_of_visit:{
        type:DataTypes.STRING,
    },
    start_time:{
        type:DataTypes.STRING,
    },
    end_time:{
        type:DataTypes.STRING,
    },
    office_loc:{
        type:DataTypes.STRING,
    },
    created_at:{
        type: DataTypes.DATE,
        defaultValue: new Date()
    },
    status:{
        type:DataTypes.STRING,
        defaultValue:"pending"
    }
},
{
    freezeTableName:true,
    timestamps:false
});


Visitor.hasMany(Meeting,{
    foreignKey:"visitor_id"
});

Meeting.belongsTo(Visitor,{
    foreignKey:"visitor_id",
});

const VisitorHistory = sequelize.define("visitor_history",{
    vm_request_id:{
        type:DataTypes.STRING,
        allowNull:false,
        primaryKey:true
    },
    visitor_id:{
        type:DataTypes.STRING,
    },
    check_in:{
        type:DataTypes.TEXT
    },
    check_out:{
        type:DataTypes.TEXT
    },
    created_at:{
        type: DataTypes.DATE,
        defaultValue: new Date()
    }
},
{
    freezeTableName:true,
    timestamps:false
});

Meeting.hasOne(VisitorHistory,{
    foreignKey: "vm_request_id"
});

VisitorHistory.belongsTo(Meeting,{
    foreignKey: "vm_request_id"
})

const VisitorIdentity = sequelize.define("visitor_identity",{
    vid:{
        type:DataTypes.STRING,
    },
    visitor_id:{
        type:DataTypes.STRING,
        allowNull:false,
        primaryKey:true
    },
    id_type:{
        type:DataTypes.STRING,
    },
    id_number:{
        type:DataTypes.STRING,
    },
    id_proof:{
        type:DataTypes.BLOB("long")
    },    
    created_at:{
        type: DataTypes.DATE,
        defaultValue: new Date()
    }
},
{
    freezeTableName:true,
    timestamps:false
});


Visitor.hasOne(VisitorIdentity,{
    foreignKey:"visitor_id"
});

VisitorIdentity.belongsTo(Visitor,{
    foreignKey:"visitor_id"
});

Meeting.belongsTo(VisitorIdentity,{
    foreignKey:"visitor_id"
});

VisitorIdentity.hasMany(Meeting,{
    foreignKey:"visitor_id"
});



//Doubt Here Regarding Relation Between Meeting, Visitor and VisitorHistory

// sequelize.sync({ force: true }).then(()=>{
//     console.log("All models were synchronized successfully.");
// })

sequelize.sync().then(() => {
    console.log('Database synchronized');
  });


module.exports = {Visitor, Meeting, VisitorHistory, VisitorIdentity};