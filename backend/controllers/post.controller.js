import cloudinary from "../lib/cloudinary.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";
import { sendCommentNotificationEmail } from "../emails/emailHandlers.js";

export const getFeedPosts = async (req,res) => {
    try {
        const posts = await Post.find({author: {  $in: [...req.user.connections, req.user._id] }})
        .populate("author", "username name profilePicture headline")
        .populate("comments.user", "name profilePicture")
        .sort({cretedAt: -1}) //used to show latest posts

        res.status(200).json(posts);
    } catch (error) {
        console.error("Error in getfeedpost controller: ", error);
        res.status(500).json({message: "Internal Server error"})
    }
}

export const createPost = async (req,res) => {
    try {
        const {image, content} = req.body;

        let newPost 

        if (image){
            const imgResult = await cloudinary.uploader.upload(image)
            newPost = new Post({
                author: req.user._id,
                content,
                image: imgResult.secure_url
            })
        } else {
            newPost = new Post({
                author: req.user._id,
                content
            }) 
        }

        await newPost.save();

        res.status(201).json(newPost);
        
    } catch (error) {
        console.error("Error in createpost controller:", error);
        res.status(500).json({message: "Internal Server Error"})
    }
}

export const deletePost = async (req,res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({message: "Post not found"});
        }

        //check if current user is author of the post
        if (post.author.toString() !== userId.toString()) {
            return res.status(403).json({message: "You are not authorized to delete this post"})
        }

        //if img in post then delete it from cloudinary also
        if (post.image){
            //this deletes img from cloudinary
            //we checked what is like uploaded img looks on cloudinary and just get imgId
            await cloudinary.uploader.destroy(post.image.split("/").pop().split(".")[0]); 
        }

        //delete complete post
        await Post.findByIdAndDelete(postId);

        res.status(200).json({message: "Post deleted successfully"})

    } catch (error) {
        console.error("Error in deletepost controller:", error);
        res.status(500).json({message:"Internal server error"})
    }
}

export const getPostById = async (req,res) => {
try {
    const postId = req.params.id;
    const post = await Post.findById(postId)
    .populate("author", "name username profileProfile headline")
    .populate("comments.user", "name username profilePicture headline")

    res.status(200).json(post);
} catch (error) {
    console.error("Error in getpostbyid controller:", error);
    res.status(500).json({message: "Internal server error"})
}
}

export const createComment = async (req,res) => {
    try {
        const postId = req.params.id;
        const {content} = req.body;

        const post = await Post.findByIdAndUpdate(postId,
            {
            $push: {comments: {user:req.user._id, content}}
            }, {new:true})
            .populate("author", "name email username profilePicture headline");

        //send notification if comment owner and post owner is not same
        if (post.author._id.toString() !== req.user._id.toString()){
            const newNotification = new Notification({
                recipient:post.author,
                type: "comment",
                relatedUser: req.user._id,
                relatedPost: postId
            });

            // await post.save();
            await newNotification.save();
            //send email to post owner after comment

            try {
                const postUrl = process.env.CLIENT_URL + "/post/" + postId;
                await sendCommentNotificationEmail(post.author.email,post.author.name, req.user.name, postUrl, content);
            } catch (error) {
                console.error("Error in sending email on comment:", error);
            }

            res.status(200).json(post);
        }

    } catch (error) {
        console.error("Error in notification controller:", error);
        res.status(500).json({message: "Internal server error"})
    }
}

export const likePost = async (req,res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);
        const userId = req.user._id;

        //check if user likes post of unlike the post
        if (post.likes.includes(userId)){
            //unlike post
            post.likes = post.likes.filter(id => id.toString() !== userId.toString());
        } else {
            post.likes.push(userId);

            //create notification if post owner is not user who liked
            if (post.author.toString() !== userId.toString()){
                const newNotification = new Notification({
                    recipient: post.author,
                    type: "like",
                    relatedUser: userId,
                    relatedPost: postId
                });

                await newNotification.save();
            } 
        }

        await post.save();

        res.status(200).json(post)
    } catch (error) {
        console.error("Error in likepost controller:", error);
        res.status(500).json({message: "Internal Server error"})
    }
}