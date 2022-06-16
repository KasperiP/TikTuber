import { upload } from "youtube-videos-uploader"; //Typescript
import { logger } from "../utils/logger";

export const uploadToYoutube = async (
  path: string,
  title: string,
  influencer: string
): Promise<string> => {
  // recoveryemail is optional, only required to bypass login with recovery email if prompted for confirmation
  const credentials = {
    email: process.env.YOUTUBE_EMAIL || "",
    pass: process.env.YOUTUBE_PASSWORD || "",
  };

  const onVideoUploadSuccess = (videoUrl: string) => {
    logger.info(`Video uploaded to YouTube: ${videoUrl}`);
  };
  // Extra options like tags, thumbnail, language, playlist etc

  const influencerUpper =
    influencer.charAt(0).toUpperCase() + influencer.slice(1);

  const video = {
    path: path,
    title: `${influencerUpper} - ${title}`,
    description: `${influencerUpper} - https://www.tiktok.com/@${influencer} #tiktoksuomi #suomitiktok #shorts`,
    language: "finnish",
    tags: ["tiktoksuomi", "suomitiktok", "shorts", influencer],
    channelName: "TikTok Suomi - Shorts",
    onSuccess: onVideoUploadSuccess,
    skipProcessingWait: true,
  };

  // Returns uploaded video links in array
  const uploadedVideo = await upload(credentials, [video], {
    headless: true,
    //executablePath: "/usr/bin/chromium",
  });
  return uploadedVideo[0];

  // Refer Puppeteer documentation for more launch configurations like proxy etc
  // https://pptr.dev/#?product=Puppeteer&version=main&show=api-puppeteerlaunchoptions
};
