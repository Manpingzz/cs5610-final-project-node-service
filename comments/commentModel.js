import mongoose from "mongoose";
import commentSchema from "./commentSchema.js";
import schema from "../users/schema.js";

const User = mongoose.model("User", schema);
const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
