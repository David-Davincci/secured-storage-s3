import path from "path";
import { version } from "../package.json";
import _ from "lodash";
import { User, File, Post } from "./db/models/index.js";
import FileArchiver from "./archiver";
import Email from "./email";
import S3 from "./s3";
import { authMiddleware, generateToken } from "./middleware/auth-middleware.js";
import { encryptFile, decryptFile, generateRSAKeyPair } from "./utils/crypto-utils.js";
import multerS3 from "multer-s3";
import multer from "multer";

class AppRouter {
  constructor(app) {
    this.app = app;
    this.setupRouters();
  }

  setupRouters() {
    const app = this.app;
    const uploadDir = app.get("storageDir");
    const s3 = app.s3;

    // Configure S3 uploader for encrypted files
    const uploadS3 = multer({
      storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET,
        metadata: function (req, file, cb) {
          cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
          cb(null, Date.now().toString() + '-' + file.originalname);
        }
      }),
      limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
    });

    // Root endpoint
    app.get("/", (req, res) => {
      return res.status(200).json({
        version: version,
        message: "Secured Storage API"
      });
    });

    // ============================================
    // AUTHENTICATION ROUTES
    // ============================================

    // User registration
    app.post("/api/users", async (req, res) => {
      try {
        const { email, password, name } = req.body;

        if (!email || !password) {
          return res.status(400).json({
            error: { message: "Email and password are required" }
          });
        }

        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
          return res.status(400).json({
            error: { message: "Email already exists" }
          });
        }

        // Generate RSA key pair for the user
        const { publicKey, privateKey } = generateRSAKeyPair();

        // Create user
        const user = await User.create({
          email,
          password,
          name,
          rsaPublicKey: publicKey,
          rsaPrivateKeyEncrypted: privateKey // In production, encrypt this with user password
        });

        // Generate email verification token
        const token = user.generateEmailVerificationToken();
        await user.save();

        // Send verification email
        const emailService = new Email(app);
        emailService.sendVerificationEmail(user, token, (err, info) => {
          if (err) {
            console.error("Error sending verification email:", err);
          }
        });

        return res.status(201).json({
          message: "User created successfully. Please check your email to verify your account.",
          user: user.toJSON()
        });
      } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({
          error: { message: "Error creating user" }
        });
      }
    });

    // User login
    app.post("/api/users/login", async (req, res) => {
      try {
        const { email, password } = req.body;

        if (!email || !password) {
          return res.status(400).json({
            error: { message: "Email and password are required" }
          });
        }

        // Find user
        const user = await User.findByEmail(email);
        if (!user) {
          return res.status(401).json({
            error: { message: "Invalid email or password" }
          });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
          return res.status(401).json({
            error: { message: "Invalid email or password" }
          });
        }

        // Generate JWT token
        const token = generateToken(user);

        return res.status(200).json({
          token,
          user: user.toJSON()
        });
      } catch (error) {
        console.error("Error logging in:", error);
        return res.status(500).json({
          error: { message: "Error logging in" }
        });
      }
    });

    // Verify email
    app.post("/api/auth/verify-email", async (req, res) => {
      try {
        const { token } = req.body;

        if (!token) {
          return res.status(400).json({
            error: { message: "Verification token is required" }
          });
        }

        const user = await User.findByVerificationToken(token);
        if (!user) {
          return res.status(400).json({
            error: { message: "Invalid or expired verification token" }
          });
        }

        user.verifyEmail();
        await user.save();

        return res.status(200).json({
          message: "Email verified successfully. You can now log in."
        });
      } catch (error) {
        console.error("Error verifying email:", error);
        return res.status(500).json({
          error: { message: "Error verifying email" }
        });
      }
    });

    // Resend verification email
    app.post("/api/auth/resend-verification", async (req, res) => {
      try {
        const { email } = req.body;

        if (!email) {
          return res.status(400).json({
            error: { message: "Email is required" }
          });
        }

        const user = await User.findByEmail(email);
        if (!user) {
          return res.status(404).json({
            error: { message: "User not found" }
          });
        }

        if (user.isEmailVerified) {
          return res.status(400).json({
            error: { message: "Email is already verified" }
          });
        }

        // Generate new verification token
        const token = user.generateEmailVerificationToken();
        await user.save();

        // Send verification email
        const emailService = new Email(app);
        emailService.sendVerificationEmail(user, token, (err, info) => {
          if (err) {
            console.error("Error sending verification email:", err);
          }
        });

        return res.status(200).json({
          message: "Verification email sent. Please check your inbox."
        });
      } catch (error) {
        console.error("Error resending verification email:", error);
        return res.status(500).json({
          error: { message: "Error resending verification email" }
        });
      }
    });

    // Forgot password
    app.post("/api/auth/forgot-password", async (req, res) => {
      try {
        const { email } = req.body;

        if (!email) {
          return res.status(400).json({
            error: { message: "Email is required" }
          });
        }

        const user = await User.findByEmail(email);
        if (!user) {
          // Don't reveal that user doesn't exist
          return res.status(200).json({
            message: "If the email exists, a password reset link has been sent."
          });
        }

        // Generate password reset token
        const token = user.generatePasswordResetToken();
        await user.save();

        // Send password reset email
        const emailService = new Email(app);
        emailService.sendPasswordResetEmail(user, token, (err, info) => {
          if (err) {
            console.error("Error sending password reset email:", err);
          }
        });

        return res.status(200).json({
          message: "If the email exists, a password reset link has been sent."
        });
      } catch (error) {
        console.error("Error in forgot password:", error);
        return res.status(500).json({
          error: { message: "Error processing password reset request" }
        });
      }
    });

    // Reset password
    app.post("/api/auth/reset-password", async (req, res) => {
      try {
        const { token, password } = req.body;

        if (!token || !password) {
          return res.status(400).json({
            error: { message: "Token and new password are required" }
          });
        }

        if (password.length < 6) {
          return res.status(400).json({
            error: { message: "Password must be at least 6 characters" }
          });
        }

        const user = await User.findByResetToken(token);
        if (!user) {
          return res.status(400).json({
            error: { message: "Invalid or expired reset token" }
          });
        }

        // Update password
        user.password = password;
        user.passwordResetToken = null;
        user.passwordResetExpires = null;
        await user.save();

        return res.status(200).json({
          message: "Password reset successfully. You can now log in with your new password."
        });
      } catch (error) {
        console.error("Error resetting password:", error);
        return res.status(500).json({
          error: { message: "Error resetting password" }
        });
      }
    });

    // Get current user
    app.get("/api/users/me", authMiddleware, async (req, res) => {
      return res.status(200).json(req.user.toJSON());
    });

    // ============================================
    // FILE ROUTES (Authenticated)
    // ============================================

    // Upload files with encryption
    app.post("/api/upload", authMiddleware, uploadS3.array("files"), async (req, res) => {
      try {
        const files = _.get(req, "files", []);
        const user = req.user;

        if (!files || files.length === 0) {
          return res.status(400).json({
            error: { message: "No files provided" }
          });
        }

        const fileRecords = [];

        for (const fileObject of files) {
          // Note: Encryption happens in the S3 upload middleware
          // For simplicity, we'll store encryption metadata
          const fileRecord = await File.create({
            name: fileObject.key,
            originalName: fileObject.originalname,
            mimeType: fileObject.mimetype,
            size: fileObject.size,
            s3Key: fileObject.key,
            encryptedAesKey: "placeholder", // Will be updated with actual encryption
            iv: "placeholder",
            ownerId: user.id
          });

          fileRecords.push(fileRecord);
        }

        // Create post
        const post = await Post.create({
          fromEmail: _.get(req, "body.from") || user.email,
          toEmail: _.get(req, "body.to"),
          message: _.get(req, "body.message"),
          ownerId: user.id
        });

        // Associate files with post
        await post.addFiles(fileRecords);

        // Send email notification if 'to' email provided
        if (post.toEmail) {
          const emailService = new Email(app);
          emailService.sendDownloadLink(post, (err, info) => {
            if (err) {
              console.error("Error sending download link:", err);
            }
          });
        }

        return res.status(200).json({
          post,
          files: fileRecords
        });
      } catch (error) {
        console.error("Error uploading files:", error);
        return res.status(500).json({
          error: { message: "Error uploading files" }
        });
      }
    });

    // List user's files
    app.get("/api/files", authMiddleware, async (req, res) => {
      try {
        const user = req.user;
        const files = await File.findAll({
          where: { ownerId: user.id },
          order: [['createdAt', 'DESC']]
        });

        return res.status(200).json(files);
      } catch (error) {
        console.error("Error fetching files:", error);
        return res.status(500).json({
          error: { message: "Error fetching files" }
        });
      }
    });

    // Get file details
    app.get("/api/files/:id", authMiddleware, async (req, res) => {
      try {
        const fileId = req.params.id;
        const user = req.user;

        const file = await File.findByPk(fileId);
        if (!file) {
          return res.status(404).json({
            error: { message: "File not found" }
          });
        }

        // Check ownership
        if (file.ownerId !== user.id) {
          return res.status(403).json({
            error: { message: "Access denied" }
          });
        }

        return res.status(200).json(file);
      } catch (error) {
        console.error("Error fetching file:", error);
        return res.status(500).json({
          error: { message: "Error fetching file" }
        });
      }
    });

    // Download file
    app.get("/api/files/:id/download", authMiddleware, async (req, res) => {
      try {
        const fileId = req.params.id;
        const user = req.user;

        const file = await File.findByPk(fileId);
        if (!file) {
          return res.status(404).json({
            error: { message: "File not found" }
          });
        }

        // Check ownership
        if (file.ownerId !== user.id) {
          return res.status(403).json({
            error: { message: "Access denied" }
          });
        }

        // Get file from S3
        const s3Service = new S3(app);
        const fileData = await s3Service.getFile(file.s3Key);

        // Send file
        res.set({
          'Content-Type': file.mimeType,
          'Content-Disposition': `attachment; filename="${file.originalName}"`,
          'Content-Length': file.size
        });

        return res.send(fileData);
      } catch (error) {
        console.error("Error downloading file:", error);
        return res.status(500).json({
          error: { message: "Error downloading file" }
        });
      }
    });

    // Preview file
    app.get("/api/files/:id/preview", authMiddleware, async (req, res) => {
      try {
        const fileId = req.params.id;
        const user = req.user;

        const file = await File.findByPk(fileId);
        if (!file) {
          return res.status(404).json({
            error: { message: "File not found" }
          });
        }

        // Check ownership
        if (file.ownerId !== user.id) {
          return res.status(403).json({
            error: { message: "Access denied" }
          });
        }

        // Get file from S3
        const s3Service = new S3(app);
        const fileData = await s3Service.getFile(file.s3Key);

        // Send file for preview (inline)
        res.set({
          'Content-Type': file.mimeType,
          'Content-Disposition': `inline; filename="${file.originalName}"`,
          'Content-Length': file.size
        });

        return res.send(fileData);
      } catch (error) {
        console.error("Error previewing file:", error);
        return res.status(500).json({
          error: { message: "Error previewing file" }
        });
      }
    });

    // Delete file
    app.delete("/api/files/:id", authMiddleware, async (req, res) => {
      try {
        const fileId = req.params.id;
        const user = req.user;

        const file = await File.findByPk(fileId);
        if (!file) {
          return res.status(404).json({
            error: { message: "File not found" }
          });
        }

        // Check ownership
        if (file.ownerId !== user.id) {
          return res.status(403).json({
            error: { message: "Access denied" }
          });
        }

        // Delete from S3
        const s3Service = new S3(app);
        await s3Service.deleteFile(file.s3Key);

        // Delete from database
        await file.destroy();

        return res.status(200).json({
          message: "File deleted successfully"
        });
      } catch (error) {
        console.error("Error deleting file:", error);
        return res.status(500).json({
          error: { message: "Error deleting file" }
        });
      }
    });

    // ============================================
    // POST/SHARE ROUTES
    // ============================================

    // Get post by ID (public for sharing)
    app.get("/api/posts/:id", async (req, res) => {
      try {
        const postId = req.params.id;

        const post = await Post.findByPk(postId, {
          include: [{
            model: File,
            as: 'files'
          }]
        });

        if (!post) {
          return res.status(404).json({
            error: { message: "Post not found" }
          });
        }

        return res.status(200).json(post);
      } catch (error) {
        console.error("Error fetching post:", error);
        return res.status(500).json({
          error: { message: "Error fetching post" }
        });
      }
    });

    // Download post files as ZIP
    app.get("/api/posts/:id/download", async (req, res) => {
      try {
        const postId = req.params.id;

        const post = await Post.findByPk(postId, {
          include: [{
            model: File,
            as: 'files'
          }]
        });

        if (!post) {
          return res.status(404).json({
            error: { message: "Post not found" }
          });
        }

        const files = post.files || [];
        if (files.length === 0) {
          return res.status(404).json({
            error: { message: "No files found in this post" }
          });
        }

        // Create ZIP archive
        const archiver = new FileArchiver(app, files, res);
        return archiver.download();
      } catch (error) {
        console.error("Error downloading post:", error);
        return res.status(500).json({
          error: { message: "Error downloading post" }
        });
      }
    });
  }
}

export default AppRouter;
