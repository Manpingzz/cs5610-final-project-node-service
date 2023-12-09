import Comment from "./commentModel.js";

const createComment = async (data) => {
  const newComment = new Comment(data);
  return await newComment.save();
};

const getCommentsForMovie = async (movieId) => {
  return await Comment.find({ movieId }).populate("userId");
};

const getUserRatings = async (userId) => {
  return await Comment.find({ userId }).select("movieId rating -_id");
};

export { createComment, getCommentsForMovie, getUserRatings };
