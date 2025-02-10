//code writeen here is taken from docs of mailtrap
import { mailtrapClient, sender } from "../lib/mailtrap.js";
import { createCommentNotificationEmailTemplate, createWelcomeEmailTemplate} from "./emailTemplates.js";

export const sendWelcomeEmail = async (email, name, profileUrl) => {
    const recipient = [{email}]

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Welcome to CareerNet",
            html: createWelcomeEmailTemplate(name, profileUrl),
            category: "welcome",
        });

        console.log("Welcome email sent successfully", response);
    } catch (error) {
        throw error;
    }
}

export const sendCommentNotificationEmail = async (
    recipientMail,
    recipientName,
    CommenterName,
    postUrl,
    commentContent
) => {
    const recipient = [{recipientMail}]
    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "New Comment on your post",
            html: createCommentNotificationEmailTemplate(recipientName, CommenterName, postUrl, commentContent),
            category:"comment_notification"
        });
        console.log("Comment notification email sent successfully.", response)
    } catch (error) {
        throw error
    }
}

export const sendConnectionAcceptedEmail = async (
    senderEmail, 
    senderName, 
    recipentName, 
    profileUrl) => {
        const recipent = [{email: senderEmail}]
        try {
            const response = await mailtrapClient.send({
                from: sender,
                to: recipent,
                subject: `${recipentName} accepted your connection request`,
                html: createAcceptedConnectionEmailTemplate(senderName, recipentName, profileUrl)
            });
        } catch (error) {
            throw error
        }
    }