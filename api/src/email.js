import _ from "lodash";
import { url } from "./config";

export default class Email {
  constructor(app) {
    this.app = app;
  }

  sendDownloadLink(post, callback = () => { }) {
    const app = this.app;
    const email = app.email;

    const from = _.get(post, "fromEmail") || _.get(post, "from");
    const to = _.get(post, "toEmail") || _.get(post, "to");
    const message = _.get(post, "message", "");
    const postId = _.get(post, "id") || _.get(post, "_id");
    const downloadLink = `${url}/share/${postId}`;

    let messageOptions = {
      from: from,
      to: to,
      subject: "[Share] Download Invitation",
      text: message,
      html: `<p>${from} has sent you a file. Click <a href="${downloadLink}">here</a> to download.</p><p>Message: ${message}</p>`,
    };

    email.sendMail(messageOptions, (error, info) => {
      console.log("Sending an email with callback", error, info);
      return callback(error, info);
    });
  }

  sendVerificationEmail(user, token, callback = () => { }) {
    const app = this.app;
    const email = app.email;

    const verificationLink = `${url}/verify-email?token=${token}`;
    const to = _.get(user, "email");

    let messageOptions = {
      from: process.env.SMTP_USER || "noreply@secured-storage.com",
      to: to,
      subject: "Verify Your Email Address",
      text: `Please verify your email address by clicking the link: ${verificationLink}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Secured Storage!</h2>
          <p>Thank you for registering. Please verify your email address to activate your account.</p>
          <p style="margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Verify Email Address
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationLink}">${verificationLink}</a>
          </p>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 24 hours.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            If you didn't create an account, please ignore this email.
          </p>
        </div>
      `,
    };

    email.sendMail(messageOptions, (error, info) => {
      if (error) {
        console.log("Error sending verification email:", error);
      } else {
        console.log("Verification email sent:", info);
      }
      return callback(error, info);
    });
  }

  sendPasswordResetEmail(user, token, callback = () => { }) {
    const app = this.app;
    const email = app.email;

    const resetLink = `${url}/reset-password?token=${token}`;
    const to = _.get(user, "email");

    let messageOptions = {
      from: process.env.SMTP_USER || "noreply@secured-storage.com",
      to: to,
      subject: "Reset Your Password",
      text: `You requested a password reset. Click the link to reset your password: ${resetLink}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>We received a request to reset your password for your Secured Storage account.</p>
          <p style="margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetLink}">${resetLink}</a>
          </p>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 1 hour.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
          </p>
        </div>
      `,
    };

    email.sendMail(messageOptions, (error, info) => {
      if (error) {
        console.log("Error sending password reset email:", error);
      } else {
        console.log("Password reset email sent:", info);
      }
      return callback(error, info);
    });
  }

  resendVerificationEmail(user, callback = () => { }) {
    const token = user.emailVerificationToken;
    if (!token) {
      return callback(new Error("No verification token found"), null);
    }
    return this.sendVerificationEmail(user, token, callback);
  }
}
