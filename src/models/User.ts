import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  auth0Id: string;
  email: string;
  name?: string;
  picture?: string; //The picture field is optional (?) and typically comes from the user's Auth0 profile
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema = new Schema(
  {
    auth0Id: {
      type: String,
      required: true,
      unique: true, //Ensure that each user has a unique Auth0 ID
    },
    email: {
      type: String,
      required: true,
      unique: true, //Ensure that each user has a unique email
    },
    name: {
      type: String,
    },
    picture: {
      type: String,
    },
  },

  {
    timestamps: true, //Automatically add createdAt and updatedAt fields
  }
);
export default mongoose.model<IUser>("User", userSchema);
