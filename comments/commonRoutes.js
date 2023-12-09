import express from "express";
import Comment from "./commentModel.js";
import {
  createComment,
  getCommentsForMovie,
  getUserRatings,
} from "./commentService.js";
import jwt from "jsonwebtoken";
import User from "../users/model.js";

const commonRoutes = express.Router();

// get reviews from a userID
commonRoutes.get("/api/userRatings/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const ratings = await getUserRatings(userId);
    res.json(ratings);
  } catch (error) {
    console.error("Error occurred while fetching user ratings:", error);
    res.status(500).json({ message: error.message });
  }
});

// create reviews
commonRoutes.post("/api/comments", async (req, res) => {
  console.log("Received request data1207:", req.body);
  try {
    console.log("Received POST request to create a new comment.");
    const { userId, movieId, comment, rating } = req.body;

    if (!userId) {
      console.log("userId is missing in the request body");
      return res.status(400).json({ message: "userId is required" });
    }

    if (typeof comment !== "string" || comment.trim() === "") {
      return res
        .status(400)
        .json({ error: "comment must not be empty and must be a string" });
    }

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      console.log("Invalid rating:", rating);
      return res
        .status(400)
        .json({ message: "Invalid rating. Must be between 1 and 5." });
    }
    console.log("Received comment data:");
    console.log("userId:", userId);
    console.log("movieId:", movieId);
    console.log("comment:", comment);
    console.log("rating:", rating);

    const savedComment = await createComment({
      userId,
      movieId,
      comment,
      rating,
    });
    console.log("savedComment:", savedComment);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const commentWithUser = {
      ...savedComment.toObject(),
      user: {
        _id: user._id,
        username: user.username,
      },
    };

    res.status(201).json(commentWithUser);
  } catch (error) {
    console.error("Error occurred while creating a comment:", error);
    res.status(500).json({ message: error.message });
  }
});

// get reviews of a movie
commonRoutes.get("/api/comments/:movieId", async (req, res) => {
  try {
    const comments = await getCommentsForMovie(req.params.movieId);
    console.log("comments66:", comments);

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

commonRoutes.get("/api/comments/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const userComments = await Comment.find({ userId }).populate(
      "movieId",
      "title"
    );
    res.json(userComments);
  } catch (error) {
    console.error("Error occurred while fetching user comments:", error);
    res.status(500).json({ message: error.message });
  }
});

commonRoutes.delete("/api/comments/:commentId", async (req, res) => {
  try {
    console.log(
      "Delete comment request received. Comment ID:",
      req.params.commentId
    );
    const commentId = req.params.commentId;
    // const currentUser = req.session["currentUser"];
    // console.log("Current user from session:", currentUser);
    const authHeader = req.headers.authorization;
    console.log("authHeader:", authHeader);
    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "No authorization token provided" });
    }

    const token = authHeader.split(" ")[1];
    console.log("token1206:", token);
    let userId;

    try {
      console.log("Verifying token:", token);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("decoded 1206::", decoded);

      userId = decoded.userId;
      console.log("userId 1206::", userId);
    } catch (error) {
      console.error("Error verifying token:", error);
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    const currentUser = await User.findById(userId);
    console.log("currentUser1206:", currentUser);

    if (!currentUser) {
      return res.status(403).json({ message: "User not found" });
    }
    const comment = await Comment.findById(commentId);
    console.log("Comment fetched from database:", comment);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (
      currentUser._id.toString() !== comment.userId.toString() &&
      currentUser.role !== "ADMIN"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId);
    res.json({ message: "Comment deleted successfully", deletedComment });
  } catch (error) {
    console.error("Error occurred while deleting the comment:", error);
    res.status(500).json({ message: error.message });
  }
});

commonRoutes.put("/api/comments/:commentId", async (req, res) => {
  try {
    console.log("Received update for comment:", req.params.commentId, req.body);
    const commentId = req.params.commentId;
    const updateData = req.body;
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      updateData,
      { new: true }
    );
    if (!updatedComment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    console.log("Updated comment in DB:", updatedComment);
    res.json({ message: "Comment updated successfully", updatedComment });
  } catch (error) {
    console.error("Error occurred while updating the comment:", error);
    res.status(500).json({ message: error.message });
  }
});

export default commonRoutes;
