import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      min: 16,
      max: 100,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "not specific"],
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const userModel = model("user", userSchema);
