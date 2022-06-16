import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    influencer: {
      type: String,
      required: true,
    },
    downloadedVideos: [
      {
        id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        path: {
          type: String,
          required: true,
        },
        uploaded: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Videos || mongoose.model("Videos", videoSchema);
