"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const server_1 = require("@apollo/server");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const schemas_1 = __importDefault(require("./schemas"));
const resolvers_1 = __importDefault(require("./resolvers"));
const db_1 = __importDefault(require("./config/db"));
const auth0_1 = require("./config/auth0");
const authMiddleware_1 = require("./middleware/authMiddleware");
const express4_1 = require("@apollo/server/express4");
dotenv_1.default.config();
(0, db_1.default)();
async function startServer() {
    const app = (0, express_1.default)();
    const server = new server_1.ApolloServer({
        typeDefs: schemas_1.default,
        resolvers: resolvers_1.default,
        introspection: process.env.NODE_ENV !== "production",
    });
    await server.start();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json()); // Parse JSON bodies
    app.get("/health", (_, res) => {
        res.status(200).send("Server is running");
    });
    app.use("/graphql", auth0_1.checkJwt);
    app.use("/graphql", (0, express4_1.expressMiddleware)(server, {
        context: async ({ req }) => {
            const user = await (0, authMiddleware_1.getUser)(req); // Get the user from the request
            return {
                req: req,
                user,
                userId: user?.auth0Id,
            };
        },
    }) // Explicitly cast to RequestHandler
    );
    app.listen(process.env.PORT || 4000, () => {
        console.log(`Server is running on port ${process.env.PORT || 4000}`);
    });
}
startServer().catch((err) => {
    console.error("Error starting server", err);
});
