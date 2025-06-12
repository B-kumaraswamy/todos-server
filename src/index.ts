import express from "express";
import { ApolloServer } from "@apollo/server";
import cors from "cors";
import dotenv from "dotenv";
import typeDefs from "./schemas";
import resolvers from "./resolvers";
import connectDB from "./config/db";
import { checkJwt } from "./config/auth0";
import { getUser, AuthRequest, Context } from "./middleware/authMiddleware";
import { expressMiddleware } from "@apollo/server/express4";

dotenv.config();

connectDB();

async function startServer() {
  const app = express();
  app.use(
    cors({
      origin: "http://localhost:5173", 
      credentials: true,
    })
  );
  app.use(express.json()); // Parse JSON bodies

  app.get("/health", (_, res) => {
    res.status(200).send("Server is running");
  });
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: process.env.NODE_ENV !== "production",
  });

  await server.start();

  app.use("/graphql", checkJwt);

  
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }): Promise<Context> => {
        console.debug(` context: > req---->`, req)
        const user = await getUser(req as unknown as AuthRequest); // Get the user from the request
        return {
          req: req as unknown as AuthRequest,
          user,
          userId: user?.auth0Id,
        };
      },
    }) as unknown as express.RequestHandler // Explicitly cast to RequestHandler
    
  );

  app.listen(process.env.PORT || 4000, () => {
    console.log(`Server is running on port ${process.env.PORT || 4000}`);
  });
}

startServer().catch((err) => {
  console.error("Error starting server", err);
});
