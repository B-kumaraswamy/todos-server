"use strict";
/*
Know who the user is (based on the Auth0 token).
Create a new user in your MongoDB if it doesn’t exist.
Ensure that only logged-in users can access certain features.
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = exports.getUser = void 0;
const graphql_1 = require("graphql");
const User_1 = __importDefault(require("../models/User"));
const getUser = async (req) => {
    // If no auth object, this request didn't pass the JWT check
    if (!req.auth) {
        return null;
    }
    try {
        // The Auth0 user id is in the 'sub' field of the token
        // It usually looks like 'auth0|1234567890'
        const auth0Id = req.auth.sub; // Get the Auth0 ID from the token
        let user = await User_1.default.findOne({ auth0Id });
        if (!user && req.auth.email) {
            user = await User_1.default.create({
                auth0Id,
                email: req.auth.email,
                name: req.auth.name,
                picture: req.auth.picture,
            });
        }
        return user;
    }
    catch (err) {
        console.error("Error getting user", err);
        return null;
    }
};
exports.getUser = getUser;
/*
This is a helper to protect certain GraphQL queries or mutations.
If no user is found in the context (i.e. not logged in), it throws an error.
*/
const requireAuth = (context) => {
    if (!context.user) {
        throw new graphql_1.GraphQLError("You must be logged in to perform this action", {
            extensions: {
                code: "UNAUTHENTICATED", //This sets a custom error code that the client can check for specific types of errors (like if the user is not logged in).
            },
        });
    }
    return context.user;
};
exports.requireAuth = requireAuth;
