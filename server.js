import cors from "cors";
import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware as appoloMiddleware } from "@apollo/server/express4";
import { authMiddleware, handleLogin } from "./auth.js";
import { readFile } from "node:fs/promises";
import { resolvers } from "./resolvers.js";
import { getUser } from "./db/users.js";
import { createCompanyLoader } from "./db/companies.js";
const PORT = 9000;

const app = express();
app.use(cors(), express.json(), authMiddleware);

app.post("/login", handleLogin);
const typeDefs = await readFile("./schema.graphql", "utf8");
async function getContext({ req }) {
  const companyLoader = await createCompanyLoader();
  const context = { companyLoader };
  if (req.auth) {
    context.user = await getUser(req.auth.sub);
  }
  return context;
}
const appolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});
await appolloServer.start();
app.use("/graphql", appoloMiddleware(appolloServer, { context: getContext }));
app.listen({ port: PORT }, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`GraphQL endpoint:http:localhost:${PORT}/graphql`);
});
