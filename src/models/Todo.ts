import mongoose, { Document, Schema } from "mongoose";

export enum Priority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export enum Status {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  DONE = "done",
}

export interface ITodo extends Document {
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  dueDate?: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const TodoSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxLength: [100, "Title cannot exceed 100 characters"],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxLength: [500, "Description cannot exceed 500 characters"],
    },

    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.TODO,
    },
    priority: {
      type: String,
      enum: Object.values(Priority),
      default: Priority.MEDIUM,
    },

    dueDate: {
      type: Date,
    },

    userId: {
      type: String,
      required: true,
      index: true, // Index for faster lookups by userId
    },
  },

  {
    timestamps: true,
  }
);


export default mongoose.model<ITodo>("Todo", TodoSchema);
