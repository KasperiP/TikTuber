import dotenv from "dotenv";
import mongoose from "mongoose";
import cron from "node-cron";
import { tiktokerList } from "./constants/tiktokerList";
import { checkTiktokPage } from "./functions/checkTiktokPage";
import { initializeBot } from "./functions/initializeBot";
import { logger } from "./utils/logger";
dotenv.config();
const MongoURI = process.env.MONGODB_URI;

const checkVideos = async () => {
  for await (const influencer of tiktokerList) {
    const uploaded = await checkTiktokPage(influencer);

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
};

(async () => {
  if (!MongoURI) {
    throw new Error("MongoDB URI not found");
  }

  try {
    await mongoose.connect(MongoURI);
    logger.info("Connected to MongoDB.");
  } catch (err) {
    throw new Error("MongoDB connection error");
  }

  await initializeBot();

  checkVideos();
  cron.schedule("*/10 * * * *", () => {
    checkVideos();
  });
})();
