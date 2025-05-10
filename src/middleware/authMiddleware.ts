/*
Know who the user is (based on the Auth0 token).
Create a new user in your MongoDB if it doesn’t exist.
Ensure that only logged-in users can access certain features.
*/

import { Request } from "express";
import { GraphQLError } from "graphql";

import User from "../models/User";

export interface AuthRequest extends Request {
  auth?: {
    sub: string;
    [key: string]: string; // Other token data like email, name
  };
}

export interface Context {
  req: AuthRequest;
  user?: any; // actual user from MongoDB
  userId?: string; // user’s unique ID
}

export const getUser = async (req: AuthRequest) => {
  // If no auth object, this request didn't pass the JWT check
  if (!req.auth) {
    return null;
  }

  try {
    // The Auth0 user id is in the 'sub' field of the token
    // It usually looks like 'auth0|1234567890'
    const auth0Id = req.auth.sub; // Get the Auth0 ID from the token

    let user = await User.findOne({ auth0Id });

    if (!user && req.auth.email) {
      user = await User.create({
        auth0Id,
        email: req.auth.email,
        name: req.auth.name,
        picture: req.auth.picture,
      });
    }

    return user;
  } catch (err) {
    console.error("Error getting user", err);
    return null;
  }
};

/*
This is a helper to protect certain GraphQL queries or mutations.
If no user is found in the context (i.e. not logged in), it throws an error.
*/
export const requireAuth = (context: Context) => {
  if (!context.user) {
    throw new GraphQLError("You must be logged in to perform this action", {
      extensions: {
        code: "UNAUTHENTICATED", //This sets a custom error code that the client can check for specific types of errors (like if the user is not logged in).
      },
    });
  }
  return context.user;
};
