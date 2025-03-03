import cors from 'cors';
import express from 'express';
import { v2 as cloudinary } from "cloudinary";
import * as dotenv from "dotenv";

const app = express();
app.use(cors());
app.use(express.json());

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
  app.listen(port);
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

    console.log(result);

    // Send back the found images
    res.json(result.resources);
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ error: "Failed to fetch images" });
  }
});