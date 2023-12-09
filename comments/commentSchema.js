import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    movieId: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comment: {
      type: String,
      // required: true,
    },
    rating: {
      type: Number,
      required: false,
      min: 0,
      max: 5,
    },
    postedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "comments",
  }
);

export default commentSchema;
