import mongoose from "mongoose";
export const connection = () => {
  mongoose
    .connect(process.env.DB_CONNECTION)
    .then(() => {
      console.log("Database connected successfully");
    })
    .catch((err) => {
      console.log(err);
    });
};
