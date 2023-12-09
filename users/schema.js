import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: {
      type: String,
      enum: ["ADMIN", "USER", "CRITIC"],
      default: "USER",
    },
    certifications: [
      {
        type: String,
        required: function () {
          return this.role === "CRITIC";
        },
      },
    ],
    adminLevel: {
      type: Number,
      required: function () {
        return this.role === "ADMIN";
      },
      default: 1,
    },
    dob: {
      type: Date,
      required: false,
    },

    favorites: [Number],
    ratings: [{ movieId: Number, rating: Number }],
  },
  {
    collection: "users",
  }
);

export default schema;
