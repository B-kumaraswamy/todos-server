import { Context, requireAuth } from "../middleware/authMiddleware";
import Todo, { Status, Priority } from "../models/Todo";
import mongoose from "mongoose";
import { GraphQLError } from "graphql";

interface TodoInput {
  title: string;
  description: string;
  priority?: Priority;
  status?: Status;
  dueDate?: string;
}

interface TodoUpdateInput {
  title?: string;
  description?: string;
  priority?: Priority;
  status?: Status;
  dueDate?: string | null;
}

export default {
  Query: {
    todos: async (_: any, __: any, context: Context) => {
      const user = requireAuth(context);
      return await Todo.find({ userId: user._id }).sort({ createdAt: -1 });
    },

    /**
     * Returns a single todo by its ID. The todo must be created by the current user.
     * @throws {GraphQLError} If the ID is invalid or the todo does not exist.
     * @throws {GraphQLError} If the current user is not authorized to view the todo.
     * @param {string} id The ID of the todo to retrieve.
     * @returns {Todo} The retrieved todo.
     */
    todo: async (_: any, { id }: { id: string }, context: Context) => {
      const user = requireAuth(context); // Ensure the user is authenticated

      //validate the id
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new GraphQLError("Invalid todo ID", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const todo = await Todo.findById(id);

      if (!todo) {
        throw new GraphQLError("Todo not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      if (todo.userId !== user._id.toString()) {
        throw new GraphQLError("You are not authorized to view this todo", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      return todo;
    },

    todosByStatus: async (
      _: any,
      { status }: { status: Status },
      context: Context
    ) => {
      const user = requireAuth(context); // Ensure the user is authenticated
      return await Todo.find({ userId: user._id, status }).sort({
        createdAt: -1,
      });
    },

    todosByPriority: async (
      _: any,
      { priority }: { priority: Priority },
      context: Context
    ) => {
      const user = requireAuth(context); // Ensure the user is authenticated
      return await Todo.find({ userId: user._id, priority }).sort({
        createdAt: -1,
      });
    },
  },

  Mutation: {
    createTodo: async (
      _: any,
      { input }: { input: TodoInput },
      context: Context
    ) => {
      const user = requireAuth(context); // Ensure the user is authenticated
      if (!input.title || !input.description) {
        throw new GraphQLError("Title and description are required", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
      let dueDate;
      if (input.dueDate) {
        dueDate = new Date(input.dueDate);
        if (isNaN(dueDate.getTime())) {
          throw new GraphQLError("Invalid date format", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }

      const newTodo = new Todo({
        ...input,
        dueDate,
        userId: user._id,
      });
      await newTodo.save(); // Save the new todo to the database
      return newTodo; // Return the newly created todo
    },

    updateTodo: async (
      _: any,
      { id, input }: { id: string; input: TodoUpdateInput },
      context: Context
    ) => {
      const user = requireAuth(context); // Ensure the user is authenticated

      //validate the id
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new GraphQLError("Invalid todo ID", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      let updateData: any = { ...input };
      if (input.dueDate) {
        const dueDate = new Date(input.dueDate);
        if (isNaN(dueDate.getTime())) {
          throw new GraphQLError("Invalid date format", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
        updateData.dueDate = dueDate;
      } else if (input.dueDate === null) {
        updateData.dueDate = null; // Set dueDate to null if input is null
      }

      const todo = await Todo.findById(id);

      if (!todo) {
        throw new GraphQLError("Todo not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      if (todo.userId !== user._id.toString()) {
        throw new GraphQLError("You are not authorized to update this todo", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      const updatedTodo = await Todo.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true } // Return the updated todo and validate the updated data
      );
      return updatedTodo;
    },

    deleteTodo: async (_: any, { id }: { id: string }, context: Context) => {
      const user = requireAuth(context);

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new GraphQLError("Invalid todo ID", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const todo = await Todo.findById(id);

      if (!todo) {
        throw new GraphQLError("Todo not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      if (todo.userId !== user._id.toString()) {
        throw new GraphQLError("You are not authorized to delete this todo", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      // Delete and return a boolean
      await Todo.findByIdAndDelete(id);
      return true; // Return a boolean, not the Todo object
    },

    deleteCompletedTodos: async (_: any, __: any, context: Context) => {
      const user = requireAuth(context); // Ensure the user is authenticated
      const result = await Todo.deleteMany({
        userId: user._id,
        status: Status.DONE,
      });
      return result.deletedCount; // Return the number of deleted todos
    },
  },
};
