import cors from 'cors';
import express from 'express';
import fileUpload from "express-fileupload";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import * as dotenv from "dotenv";
import { db } from './firebase.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tmp/" })); // Enable file uploads

dotenv.config({ path: ".env" });

const port = process.env.PORT || 3001;

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

async function setup() {
  // start server
  app.listen(port, () => console.log(`Server running on port ${port}`));
}

await setup();

/**
 * Consumes a list of tags and fetches images from external service.
 */
app.post("/find", async (req, res) => {
  try {
    const { tags } = req.body; // Expecting { tags: ["tag1", "tag2", "tag3"] }

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ error: "No tags were selected" });
    }

    // Construct a search expression to match at least one tag
    const searchExpression = tags.map(tag => `tags:${tag}`).join(" OR ");

    // Fetch images from Cloudinary
    const result = await cloudinary.search
      .expression(searchExpression)
      .sort_by("created_at", "desc") // Sort by latest images
      .max_results(20) // Limit the number of results
      .execute();

    // Send back the found images
    res.json(result.resources);
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ error: "Failed to fetch images" });
  }
});

/**
 * Consumes an image and tags and uploads it to external service.
 */
app.post("/upload", async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const image = req.files.image;

    // Allowed MIME types
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

    // Allowed file extensions
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif"];

    // Max file size (e.g., 5MB)
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    // Get file extension
    const fileExt = path.extname(image.name).toLowerCase();

    // Validate MIME type
    if (!allowedTypes.includes(image.mimetype)) {
      return res.status(400).json({ error: "Invalid file type. Only JPG, PNG, and GIF are allowed." });
    }

    // Validate file extension
    if (!allowedExtensions.includes(fileExt)) {
      return res.status(400).json({ error: "Invalid file extension. Only .jpg, .png, and .gif are allowed." });
    }

    // Validate file size
    if (image.size > maxFileSize) {
      return res.status(400).json({ error: "File size exceeds 5MB limit." });
    }

    // Sanitize file name (remove special characters)
    // const sanitizedFileName = image.name.replace(/[^a-zA-Z0-9.]/g, "_");

    // Parse tags from request body
    let tags = req.body.tags || "";
    let tagArray = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    // Upload to Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(image.tempFilePath, {
      //public_id: sanitizedFileName,
      tags: tagArray
    });

    // Store tags in Firestore (avoid duplicates)
    try {
      for (const tag of tagArray) {
        const tagRef = db.collection("tags").doc(tag);
        const tagDoc = await tagRef.get();
        if (!tagDoc.exists) {
          await tagRef.set({name: tag}); // Add tag if it doesn't exist
        }
      }
    } catch (error) {
      console.error("Error storing tags in Firestore:", error);
    }

    let result = {
      message: "Upload successful",
      imageUrl: cloudinaryResponse.secure_url, // Cloudinary image URL
      tags: cloudinaryResponse.tags, // Tags stored in Cloudinary
      public_id: cloudinaryResponse.public_id, // Unique Cloudinary ID
    };

    console.log(result);

    res.json(result);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

app.get("/tags", async (req, res) => {
  try {
    const tagsSnapshot = await db.collection("tags").get();
    const tags = tagsSnapshot.docs.map(doc => doc.id); // Get tag names
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve tags" });
  }
});
