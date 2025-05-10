"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authMiddleware_1 = require("../middleware/authMiddleware");
const User_1 = __importDefault(require("../models/User"));
exports.default = {
    Query: {
        me: async (_, __, context) => {
            const user = (0, authMiddleware_1.requireAuth)(context); // Ensure the user is authenticated
            return user; // Return the authenticated user
        },
    },
    Mutation: {
        updateUser: async (_, { name, picture }, context) => {
            const user = (0, authMiddleware_1.requireAuth)(context); // Ensure the user is authenticated
            const updateData = {};
            if (name)
                updateData.name = name;
            if (picture)
                updateData.picture = picture;
            const updatedUser = await User_1.default.findByIdAndUpdate(user.id, updateData, { new: true, runValidators: true } // Return the updated user and validate the updated data
            );
            return updatedUser; // Return the updated user
        },
    },
};
/*
Query: me — "Get my user info"

Goal: Return the logged-in user’s data.

context contains user info (only if the request had a valid token).

requireAuth(context):
→ If the user isn’t logged in, it throws an error.
→ If logged in, it gives us the user from DB.

✅ Returns the user data (like name, email, etc.).

 Sample Query:
 query {
  me {
    name
    email
  }
}
======================

Mutation: updateUser — "Edit my name or picture"
Goal: Update your own name or picture.

requireAuth(context) ensures you're logged in.

Only updates fields that are provided.

Returns the updated user object.

 Sample Mutation:
 mutation {
  updateUser(name: "Alice", picture: "https://my-avatar.com/alice.png") {
    id
    name
    picture
  }
}

=======================

 Why those 3 parameters?
 async (_: any, __: any, context: Context)
| Parameter | Meaning                     |
| --------- | --------------------------- |
| `_`       | Parent object (unused here) |
| `__`      | Arguments from GraphQL      |
| `context` | Auth & request info         |

*/ 
