import Notification from "../models/notification.model.js";

export const getUserNotification = async (req,res) => {
    try {
        const notification = await Notification.find({recipient: req.user._id})
        .sort({createdAt: -1})
        .populate("relatedUser", "name username profilePicture")
        .populate("relatedPost", "content image")
        
        res.status(201).json(notification);
    } catch (error) {
        console.error("Error in getnotification controller:", error);
        res.status(500).json({message: "Internal server error"})
    }
}

export const markNotificationAsRead = async (req,res) => {
    const notificationId = req.params.id;
    try {
        const notication = await Notification.findByIdAndUpdate(
            {_id: notificationId, recipient:req.user._id},
            {read: true},
            {new:true}
        );

        res.json(notication);
    } catch (error) {
        console.error("Error in markNotificationAsRead controller:",error);
        res.status(500).json({message: "Internal Server error"})
    }
}

export const deleteNotification = async (req,res) => {
    const notificationId  = req.params.id;
    try {
        await Notification.findByIdAndDelete(
            {_id: notificationId, recipient: req.user._id}
        );

        res.json({message: "Notification deleted successfully"})
    } catch (error) {
        console.error("error in deleteNotification controller", error);
        res.status(500).json({message: "Internal server error"})
    }
}