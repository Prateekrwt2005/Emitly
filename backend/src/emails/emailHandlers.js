import { resend,sender } from "../lib/resend.js";
import { createWelcomeEmailTemplate } from "./emailTemplates.js";

export const sendWelcomeEmail = async (email, name, clientURL) => {
    const {data,error}= await resend.emails.send({
        from: `${sender.name} <${sender.email}>`,
        to: email,
        subject: "Welcome to Emitly!",
        html: createWelcomeEmailTemplate(name, clientURL),
    });

    if (error) {
        console.error("Error sending welcome email:", error);
        throw new Error("Failed to send welcome email");
    }
    console.log("Welcome email sent successfully:", data);
}