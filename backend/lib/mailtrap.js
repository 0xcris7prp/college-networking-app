import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv";

dotenv.config();

const TOKEN = process.env.MAILTRAP_TOKEN;

export const mailtrapClient = new MailtrapClient({
    token: TOKEN
});

export const sender = {
    email: process.env.SENDER_EMAIL,
    name: process.env.SENDER_EMAIL_NAME
}