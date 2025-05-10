"use strict";
// This file protects your backend routes by checking if a user has a valid Auth0 token (JWT) before allowing access.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkJwt = void 0;
const express_jwt_1 = require("express-jwt");
const jwks_rsa_1 = require("jwks-rsa");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const domain = process.env.AUTH0_DOMAIN;
const audience = process.env.AUTH0_AUDIENCE;
if (!domain || !audience) {
    throw new Error("Auth0 configuration is missing");
}
exports.checkJwt = (0, express_jwt_1.expressjwt)({
    //How to get the public keys from Auth0 to verify the token's signature
    secret: (0, jwks_rsa_1.expressJwtSecret)({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${domain}/.well-known/jwks.json`, //// URL to fetch Auth0's public keys
    }),
    audience: audience, //Check if the token's audience (who the token is for) matches this
    issuer: `https://${domain}/`, //Verify that the token was issued by your Auth0 domain
    algorithms: ["RS256"],
});
/*
Your Auth0 + JWT Flow:

User logs in using Auth0 (in frontend).
Auth0 sends back a JWT token to your frontend.
Your frontend sends this token with every request to your backend/server.

Your backend:
Uses jwks-rsa to fetch the public key from Auth0’s .well-known/jwks.json endpoint.
Uses that public key to verify the token's signature.

If the token is valid → allow access. Otherwise → deny it.
*/ 
