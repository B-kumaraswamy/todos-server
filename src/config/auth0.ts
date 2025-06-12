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

// Add debug logging
console.log("Auth0 Configuration:");
console.log("- Domain:", domain);
console.log("- Audience:", audience);

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
  // IMPORTANT: This is the key fix - explicitly handle how we get the token
  getToken: function fromHeaderOrQuerystring(req) {
    console.debug(` fromHeaderOrQuerystring > req.headers.authorization---->`, req.headers.authorization)
    // Look for the JWT in the Authorization header
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      const token = req.headers.authorization.split(' ')[1];
      console.log(`Auth0: Processing token: ${token.substring(0, 15)}...`);
      return token;
    }
    console.log('Auth0: No valid Authorization header found');
    return undefined; // Changed from null to undefined to match TokenGetter type
  },
  // Handle errors when token is invalid
  credentialsRequired: false, // Don't throw error, just set auth to undefined
});

/*
Your Auth0 + JWT Flow:

User logs in using Auth0 (in frontend).
Auth0 sends back a JWT token to your frontend.
Your frontend sends this token with every request to your backend/server.

Your backend:
Uses jwks-rsa to fetch the public key from Auth0's .well-known/jwks.json endpoint.
Uses that public key to verify the token's signature.

If the token is valid → allow access. Otherwise → deny it. 
*/