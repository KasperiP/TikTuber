import axios from "axios";
import fs from "fs";
import puppeteer from "puppeteer";
import Videos from "../schemas/videoSchema";
import { logger } from "../utils/logger";
import { sendWebhook } from "./webhookSender";

const BASE_URL = "https://www.tiktok.com/";

export const checkTiktokPage = async (influencer: string): Promise<boolean> => {
  logger.info(`Checking ${influencer} page for new videos`);

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--proxy-server='direct://'",
      "--proxy-bypass-list=*",
    ],
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64; rv:102.0) Gecko/20100101 Firefox/102.0"
  );

  try {
    await page.goto(`${BASE_URL}/@${influencer}`, {
      waitUntil: "networkidle0",
    });
  } catch (error) {
    await browser.close();
    logger.info("Loading page took too long. Skipping...");
    return false;
  }

  // There is always only one video tag on the latest video
  const videoLinks = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll("video"));
    return links.map((link) => link.src);
  });

  if (
    videoLinks.length !== 1 ||
    !videoLinks[0].includes("v16-webapp.tiktok.com")
  ) {
    logger.info("Couldn't find video link. Skipping...");
    await browser.close();
    return false;
  }

  const link = videoLinks[0];
  const linkSplit = link.split("/");
  const videoId = linkSplit[linkSplit.length - 2];

  const exists = await Videos.findOne({
    influencer,
    "downloadedVideos.id": videoId,
  });

  if (exists) {
    logger.info("Video already exists. Skipping...");
    await browser.close();
    return false;
  }

  logger.info(`Found new video`);

  const response = await axios.get(link + ".mp4", {
    responseType: "stream",
  });

  const FILE_NAME = `${influencer}-${videoId}`;
  const PATH = `./videos/${influencer}/${FILE_NAME}.mp4`;

  logger.info(`Saving video to ${PATH}`);

  // If path does not exist, create it
  if (!fs.existsSync(`./videos/${influencer}`)) {
    fs.mkdirSync(`./videos/${influencer}`);
  }

  response.data.pipe(fs.createWriteStream(PATH));

  const promise = new Promise<void>((resolve, reject) => {
    response.data.on("end", () => {
      resolve();
    });

    response.data.on("error", (err: any) => {
      reject(err);
    });
  });

  await promise;

  // Check if influencer exists
  const influencerExists = await Videos.findOne({ influencer });
  if (!influencerExists) {
    const newVideos = new Videos({
      influencer,
      downloadedVideos: [
        {
          id: videoId,
          url: link,
          path: PATH,
        },
      ],
    });
    await newVideos.save();
  } else {
    await Videos.updateOne(
      { influencer },
      {
        $push: {
          downloadedVideos: {
            id: videoId,
            url: link,
            path: PATH,
          },
        },
      }
    );
  }

  await browser.close();

  await sendWebhook(videoId, link, influencer);

  return true;
};
