const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userid:{type: String},
    name: {
        type: String,
        required: true,
    },
    dob: {
        type: Date,
        required: true,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    profileUrl: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
        maxlength: 500,
    },
    active: {
        type: Boolean
    },
    follower:
      [{
        userid: {type: String},
        name: {type: String},
        phone: {type: String},
        username: {type: String},
        permission: {type: Boolean}
      }]  
    ,
    following:[
        {
            userid: {type: String},
            name: {type: String},
            phone: {type: String},
            username: {type: String},
        }
    ]
    ,
    myevent: [{
        eventid:{
            type: String
        },
        permission: {
            type: Boolean
        }
    }],
    eventqr: [
        {
            eventid: {type: String}
        }
    ],
    shareurl: {type: String}
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
