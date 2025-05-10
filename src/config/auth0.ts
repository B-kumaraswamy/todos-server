// This file protects your backend routes by checking if a user has a valid Auth0 token (JWT) before allowing access.

import { expressjwt as jwt } from "express-jwt";
import { expressJwtSecret } from "jwks-rsa";
import dotenv from "dotenv";

dotenv.config();

const domain = process.env.AUTH0_DOMAIN as string;
const audience = process.env.AUTH0_AUDIENCE as string;

if (!domain || !audience) {
  throw new Error("Auth0 configuration is missing");
}


export const checkJwt = jwt({
    //How to get the public keys from Auth0 to verify the token's signature
  secret: expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${domain}/.well-known/jwks.json`, //// URL to fetch Auth0's public keys
  }) as any,
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