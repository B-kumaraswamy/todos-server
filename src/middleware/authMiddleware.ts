/*
Know who the user is (based on the Auth0 token).
Create a new user in your MongoDB if it doesn't exist.
Ensure that only logged-in users can access certain features.
*/

import { Request } from "express";
import { GraphQLError } from "graphql";

import User from "../models/User";

export interface AuthRequest extends Request {
  auth?: {
    sub: string;
    email?: string;
    name?: string;
    picture?: string;
    [key: string]: any; // Other token data
  };
}

export interface Context {
  req: AuthRequest;
  user?: any; // actual user from MongoDB
  userId?: string; // user's unique ID
}

export const getUser = async (req: AuthRequest) => {
  console.debug(` getUser > req---->`, req.auth)
  if (!req.auth) {
    return null;
  }

  try {
    const auth0Id = req.auth.sub;
    let user = await User.findOne({ auth0Id });

    // If user doesn't exist, create one with proper data
    // if (!user) {
    //   // Always ensure we have valid values from Auth0
    //   const email =
    //     req.auth.email || `unknown-${auth0Id.replace(/\|/g, "-")}@example.com`;
    //   const name =
    //     req.auth.name || `User-${auth0Id.split("|")[1] || "unknown"}`;

    //   user = await User.create({
    //     auth0Id,
    //     email,
    //     name,
    //     picture: req.auth.picture || "",
    //   });
    // } else {
    //   // UPDATE EXISTING USER - this is what's missing in your code
    //   // If the user exists but Auth0 has newer info, update the record
    //   const updates: any = {};
    //   if (req.auth.email && req.auth.email !== user.email)
    //     updates.email = req.auth.email;
    //   if (req.auth.name && req.auth.name !== user.name)
    //     updates.name = req.auth.name;
    //   if (req.auth.picture && req.auth.picture !== user.picture)
    //     updates.picture = req.auth.picture;

    //   // Only update if there are changes
    //   if (Object.keys(updates).length > 0) {
    //     user = await User.findOneAndUpdate(
    //       { auth0Id },
    //       { $set: updates },
    //       { new: true } // Return the updated document
    //     );
    //   }
    // }

    return user;
  } catch (err) {
    console.error("Error in getUser function:", err);
    return null;
  }
};

export const requireAuth = (context: Context) => {
  console.debug(` requireAuth > context---->`, context);
  if (!context.user) {
    throw new GraphQLError("You must be logged in to perform this action", {
      extensions: {
        code: "UNAUTHENTICATED",
      },
    });
  }
  return context.user;
};
