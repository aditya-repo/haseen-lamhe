const User = require('./models/users');

const sendFollowRequest = async (req, res) => {
    try {
        const { userId, followerId } = req.body;

        const user = await User.findById(userId);
        const follower = await User.findById(followerId);

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (!follower) return res.status(404).json({ success: false, message: 'Follower not found' });

        const alreadyRequested = user.follower.some(f => f.userid === followerId);
        if (alreadyRequested) return res.status(400).json({ success: false, message: 'Follow request already sent' });

        user.follower.push({
            userid: follower.userid,
        });

        follower.following.push({
            userid: user.userid,
        });

        await user.save();
        await follower.save();

        res.status(200).json({ success: true, message: 'Follow request sent successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error sending follow request', error });
    }
};

const acceptFollowRequest = async (req, res) => {
    try {
        const { userId, followerId } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const followerRequest = user.follower.find(f => f.userid === followerId);
        if (!followerRequest) return res.status(404).json({ success: false, message: 'Follow request not found' });

        followerRequest.permission = true;
        await user.save();

        res.status(200).json({ success: true, message: 'Follow request accepted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error accepting follow request', error });
    }
};

const removeFollower = async (req, res) => {
    try {
        const { userId, followerId } = req.body;

        const user = await User.findById(userId);
        const follower = await User.findById(followerId);

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (!follower) return res.status(404).json({ success: false, message: 'Follower not found' });

        user.follower = user.follower.filter(f => f.userid !== followerId);
        follower.following = follower.following.filter(f => f.userid !== userId);

        await user.save();
        await follower.save();

        res.status(200).json({ success: true, message: 'Follower removed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error removing follower', error });
    }
};

const removeFollowing = async (req, res) => {
    try {
        const { userId, followingId } = req.body;

        const user = await User.findById(userId);
        const followingUser = await User.findById(followingId);
        getUserProfilebyShareLinkus(404).json({ success: false, message: 'User not found' });
        if (!followingUser) return res.status(404).json({ success: false, message: 'Following user not found' });

        user.following = user.following.filter(f => f.userid !== followingId);
        followingUser.follower = followingUser.follower.filter(f => f.userid !== userId);

        await user.save();
        await followingUser.save();

        res.status(200).json({ success: true, message: 'Following removed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error removing following', error });
    }
};

const searchUsers = async (req, res) => {
    try {
        const { pattern } = req.body;

        if (!pattern) return res.status(400).json({ success: false, message: 'Pattern is required' });

        const regex = new RegExp(pattern, 'i'); // 'i' for case-insensitive search

        const users = await User.find({
            $or: [
                { name: { $regex: regex } },
                { username: { $regex: regex } }
            ]
        }, { name: 1, username: 1, imageUrl: 1 });

        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error searching users', error });
    }
};

const getFollowerList = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Filter follower list by permission
        const permittedFollowers = user.follower.filter(follower => follower.permission).map(follower => follower.userid);

        // Fetch full details of permitted followers
        const followers = await User.find({ userid: { $in: permittedFollowers } }, 'username name bio gender profileUrl');

        res.status(200).json({ success: true, followers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching follower list', error });
    }
};

const getFollowerRequestList = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Filter follower list by permission
        const permittedFollowers = user.follower.filter(follower => follower.permission ? true : false).map(follower => follower.userid);

        // Fetch full details of permitted followers
        const followers = await User.find({ userid: { $in: permittedFollowers } }, 'username name bio gender profileUrl');

        res.status(200).json({ success: true, followers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching follower list', error });
    }
};

const getFollowingList = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Extract following user ids
        const followingUserIds = user.following.map(following => following.userid);

        // Fetch full details of following users
        const following = await User.find({ userid: { $in: followingUserIds } }, 'username name bio gender profileUrl');

        res.status(200).json({ success: true, following });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching following list', error });
    }
};


module.exports = { sendFollowRequest, acceptFollowRequest, removeFollower, removeFollowing, searchUsers, getFollowerList, getFollowingList,getFollowerRequestList  };