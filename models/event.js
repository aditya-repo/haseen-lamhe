const mongoose = require("mongoose")

const eventSchema = new mongoose.Schema({
    eventid: {
        type: String
    },
    studioid: {
        type: String
    },
    admin: {
        type: Number
    },
    visitors: [{
        userid: Number,
        permission: Boolean
    }]
}, { timestamps: true })

const Event = mongoose.model('Events', eventSchema)

module.exports = Event