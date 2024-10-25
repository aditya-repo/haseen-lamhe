const User = require('./models/User'); // Adjust path as necessary
const Event = require('./models/Event'); // Adjust path as necessary

const getEventRequests = async (req, res) => {
    try {
        const events = await Event.find(
            { 'visitors.permission': false },
            { eventid: 1, studioid: 1, 'visitors.$': 1 }
        );

        const eventRequests = events.map(event => ({
            eventid: event.eventid,
            studioid: event.studioid,
            requests: event.visitors.filter(visitor => !visitor.permission)
        }));

        res.status(200).json({ success: true, eventRequests });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching event requests', error });
    }
};

const requestEventPermission = async (req, res) => {
    try {
        const { userId, eventId } = req.body;

        const event = await Event.findOne({ eventid: eventId });
        const user = await User.findById(userId);

        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Check if the user has already requested permission for this event
        const hasRequested = event.visitors.some(v => v.userid === userId);
        if (hasRequested) return res.status(400).json({ success: false, message: 'Permission request already sent' });

        // Add visitor to event's visitors array with permission set to false
        event.visitors.push({
            userid: userId,
            permission: false
        });

        // Add event to user's myevent array with permission set to false
        user.myevent.push({
            eventid: eventId,
            permission: false
        });

        await event.save();
        await user.save();

        res.status(200).json({ success: true, message: 'Permission request sent successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error sending permission request', error });
    }
};

const acceptEventRequest = async (req, res) => {
    try {
        const { adminId, eventId, userId } = req.body;

        const event = await Event.findOne({ eventid: eventId, admin: adminId });
        if (!event) return res.status(403).json({ success: false, message: 'Unauthorized or event not found' });

        const visitor = event.visitors.find(v => v.userid === userId);
        if (!visitor || visitor.permission) return res.status(400).json({ success: false, message: 'Request not found or already accepted' });

        // Update visitor's permission to true in the event's visitors array
        visitor.permission = true;
        await event.save();

        // Update user's myevent array to reflect accepted permission
        await User.updateOne(
            { _id: userId, 'myevent.eventid': eventId },
            { $set: { 'myevent.$.permission': true } }
        );

        res.status(200).json({ success: true, message: 'Request accepted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error accepting request', error });
    }
};

const getAllFoldersByEventId = async (req, res) => {
    try {
        const { clientId } = req.params;

        const service = await Service.findOne({ clientId });
        if (!service) return res.status(404).json({ success: false, message: 'Service not found for this client' });

        const folders = service.folder.map(({ foldername, count, _id }) => ({ _id, foldername, count }));

        res.status(200).json({ success: true, folders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching folder list', error });
    }
};

const getSingleFolderByEventIdAndFolderId = async (req, res) => {
    try {
      const { clientId, folderId } = req.params;
  
      const service = await Service.findOne(
        { clientId, 'folder._id': folderId },
        { 'folder.$': 1 }
      );
  
      if (!service || !service.folder.length) {
        return res.status(404).json({ success: false, message: 'Folder not found for this client' });
      }
  
      const folder = service.folder[0];
      res.status(200).json({ success: true, folder });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching folder', error });
    }
  };
  
  module.exports = { getSingleFolderByClientIdAndFolderId };

module.exports = { requestEventPermission, getEventRequests, acceptEventRequest, getAllFoldersByEventId, getSingleFolderByEventIdAndFolderId };