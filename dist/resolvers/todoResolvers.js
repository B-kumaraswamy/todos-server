"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authMiddleware_1 = require("../middleware/authMiddleware");
const Todo_1 = __importStar(require("../models/Todo"));
const mongoose_1 = __importDefault(require("mongoose"));
const graphql_1 = require("graphql");
exports.default = {
    Query: {
        todos: async (_, __, context) => {
            const user = (0, authMiddleware_1.requireAuth)(context);
            return await Todo_1.default.find({ userId: user.autho0Id }).sort({ createdAt: -1 });
        },
        todo: async (_, { id }, context) => {
            const user = (0, authMiddleware_1.requireAuth)(context); // Ensure the user is authenticated
            //validate the id
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                throw new graphql_1.GraphQLError("Invalid todo ID", {
                    extensions: { code: "BAD_USER_INPUT" },
                });
            }
            const todo = await Todo_1.default.findById(id);
            if (!todo) {
                throw new graphql_1.GraphQLError("Todo not found", {
                    extensions: { code: "NOT_FOUND" },
                });
            }
            if (todo.userId !== user.autho0Id) {
                throw new graphql_1.GraphQLError("You are not authorized to view this todo", {
                    extensions: { code: "UNAUTHORIZED" },
                });
            }
            return todo;
        },
        todosByStatus: async (_, { status }, context) => {
            const user = (0, authMiddleware_1.requireAuth)(context); // Ensure the user is authenticated
            return await Todo_1.default.find({ userId: user.autho0Id, status }).sort({
                createdAt: -1,
            });
        },
        todosByPriority: async (_, { priority }, context) => {
            const user = (0, authMiddleware_1.requireAuth)(context); // Ensure the user is authenticated
            return await Todo_1.default.find({ userId: user.autho0Id, priority }).sort({
                createdAt: -1,
            });
        },
    },
    Mutation: {
        createTodo: async (_, { input }, context) => {
            const user = (0, authMiddleware_1.requireAuth)(context); // Ensure the user is authenticated
            if (!input.title || !input.description) {
                throw new graphql_1.GraphQLError("Title and description are required", {
                    extensions: { code: "BAD_USER_INPUT" },
                });
            }
            let dueDate;
            if (input.dueDate) {
                dueDate = new Date(input.dueDate);
                if (isNaN(dueDate.getTime())) {
                    throw new graphql_1.GraphQLError("Invalid date format", {
                        extensions: { code: "BAD_USER_INPUT" },
                    });
                }
            }
            const newTodo = new Todo_1.default({
                ...input,
                dueDate,
                userId: user.autho0Id,
            });
            await newTodo.save(); // Save the new todo to the database
            return newTodo; // Return the newly created todo
        },
        updateTodo: async (_, { id, input }, context) => {
            const user = (0, authMiddleware_1.requireAuth)(context); // Ensure the user is authenticated
            //validate the id
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                throw new graphql_1.GraphQLError("Invalid todo ID", {
                    extensions: { code: "BAD_USER_INPUT" },
                });
            }
            let updateData = { ...input };
            if (input.dueDate) {
                const dueDate = new Date(input.dueDate);
                if (isNaN(dueDate.getTime())) {
                    throw new graphql_1.GraphQLError("Invalid date format", {
                        extensions: { code: "BAD_USER_INPUT" },
                    });
                }
                updateData.dueDate = dueDate;
            }
            else if (input.dueDate === null) {
                updateData.dueDate = null; // Set dueDate to null if input is null
            }
            const todo = await Todo_1.default.findById(id);
            if (!todo) {
                throw new graphql_1.GraphQLError("Todo not found", {
                    extensions: { code: "NOT_FOUND" },
                });
            }
            if (todo.userId !== user.autho0Id) {
                throw new graphql_1.GraphQLError("You are not authorized to update this todo", {
                    extensions: { code: "UNAUTHORIZED" },
                });
            }
            const updatedTodo = await Todo_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true } // Return the updated todo and validate the updated data
            );
            return updatedTodo;
        },
        deleteTodo: async (_, { id }, context) => {
            const user = (0, authMiddleware_1.requireAuth)(context); // Ensure the user is authenticated
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                throw new graphql_1.GraphQLError("Invalid todo ID", {
                    extensions: { code: "BAD_USER_INPUT" },
                });
            }
            const todo = await Todo_1.default.findById(id);
            if (!todo) {
                throw new graphql_1.GraphQLError("Todo not found", {
                    extensions: { code: "NOT_FOUND" },
                });
            }
            if (todo.userId !== user.autho0Id) {
                throw new graphql_1.GraphQLError("You are not authorized to delete this todo", {
                    extensions: { code: "UNAUTHORIZED" },
                });
            }
            const deletedTodo = await Todo_1.default.findByIdAndDelete(id);
            return true; // Return true to indicate successful deletion
        },
    },
    deleteCompletedTodos: async (_, __, context) => {
        const user = (0, authMiddleware_1.requireAuth)(context); // Ensure the user is authenticated
        const result = await Todo_1.default.deleteMany({
            userId: user.autho0Id,
            status: Todo_1.Status.DONE,
        });
        return result.deletedCount; // Return the number of deleted todos
    },
};
