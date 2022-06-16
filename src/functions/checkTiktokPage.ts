import axios from "axios";
import fs from "fs";
import puppeteer from "puppeteer";
import Videos from "../schemas/videoSchema";
import { sendWebhook } from "./webhookSender";

const BASE_URL = "https://www.tiktok.com/";

export const checkTiktokPage = async (influencer: string): Promise<boolean> => {
  console.log(`> Checking ${influencer} page for new videos...`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
  );

  try {
    await page.goto(`${BASE_URL}/@${influencer}`);
  } catch (error) {
    await browser.close();
    console.error("> Loading page took too long. Skipping...");
    return false;
  }

  // There is always only one video tag on the latest video
  const videoLinks = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll("video"));
    return links.map((link) => link.src);
  });

  if (videoLinks.length !== 1) {
    console.log("> Cound't find video link");
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
    console.log("> No new videos found");
    await browser.close();
    return false;
  }

  console.log("> Found new video:", link);

  const response = await axios.get(link + ".mp4", {
    responseType: "stream",
  });

  const FILE_NAME = `${influencer}-${videoId}`;
  const PATH = `./videos/${influencer}/${FILE_NAME}.mp4`;

  console.log("> Saving video to:", PATH);

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
