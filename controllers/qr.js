const Client = require("../models/client");

const getOccasionDetailsByQrCode = async (req, res) => {
    try {
        const { clientId } = req.params;

        const service = await Client.findOne(
            { clientId },
            'occassionname occassiontype occassiondate'
        );

        if (!service) {
            return res.status(404).json({ success: false, message: 'Occasion details not found for this client' });
        }

        const { occassionname, occassiontype, occassiondate } = service;
        res.status(200).json({
            success: true,
            occasionDetails: { occassionname, occassiontype, occassiondate }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching occasion details', error });
    }
};


const addEventToUser = async (req, res) => {
    try {
        const { userid } = req.params;
        const { clientId } = req.body; // Assuming eventqr is sent in the request body

        const user = await User.findOne({ userid });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.event.push({ eventid: clientId });
        await user.save();

        res.status(200).json({ success: true, message: 'Event added successfully', event: user.event });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error adding event to user', error });
    }
};


const deleteEventFromUser = async (req, res) => {
    try {
        const { userid } = req.params;
        const { eventId } = req.body; // Assuming eventId is sent in the request body

        const user = await User.findOne({ userid });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const eventIndex = user.event.findIndex(event => event._id.toString() === eventId);
        if (eventIndex === -1) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        user.event.splice(eventIndex, 1);
        await user.save();

        res.status(200).json({ success: true, message: 'Event deleted successfully', event: user.event });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting event from user', error });
    }
};


module.exports = { getOccasionDetailsByQrCode, addEventToUser, deleteEventFromUser }