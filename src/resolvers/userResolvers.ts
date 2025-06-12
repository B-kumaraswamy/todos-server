import { Context, requireAuth } from "../middleware/authMiddleware";
import User from "../models/User";

export default {
  Query: {
    me: async (_: any, __: any, context: Context) => {
      const user = requireAuth(context); // Ensure the user is authenticated
      console.debug(` me: > user---->`, user);
      return user; // Return the authenticated user
    },
  },

  Mutation: {
    // In your userResolvers.ts file
    updateUser: async (
      _: any,
      { name, picture }: { name?: string; picture?: string },
      context: Context
    ) => {
      const user = requireAuth(context);

      try {
        // Get the complete user document first
        const currentUser = await User.findById(user._id);

        if (!currentUser) {
          throw new Error(`User not found with ID: ${user._id}`);
        }

        // Only update the fields that were provided, preserving all others
        if (name !== undefined) currentUser.name = name;
        if (picture !== undefined) currentUser.picture = picture;

        // IMPORTANT: Use save() to ensure all fields are preserved
        await currentUser.save();

        // Fetch the user again to ensure we have the most up-to-date data
        const updatedUser = await User.findById(user._id);

        return updatedUser;
      } catch (error) {
        console.error("Error updating user:", error);
        throw error;
      }
    },
    // Add this to your Mutation object in userResolvers.ts
    createUser: async (
      _: any,
      {
        auth0Id,
        email,
        name,
        picture,
      }: { auth0Id: string; email: string; name?: string; picture?: string },
      _context: Context
    ) => {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ auth0Id });
        if (existingUser) {
          return existingUser; // Return existing user if found
        }

        // Create a new user
        const newUser = await User.create({
          auth0Id,
          email,
          name: name || email.split("@")[0], // Fallback to email username if no name
          picture: picture || "",
        });

        return newUser;
      } catch (error) {
        console.error("Error creating user:", error);
        throw error;
      }
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
