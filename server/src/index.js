const { ApolloServer, gql } = require("apollo-server-express");
const express = require("express");
const { createServer } = require("http");
const dotenv = require("dotenv");
//const db = require('./db');
const Mutation = require("./resolvers/Mutation");
const Query = require("./resolvers/Query");
const { Prisma } = require("prisma-binding");
const { importSchema } = require("graphql-import");
const typeDefs = importSchema("./src/schema.graphql");
const expressJwt = require("express-jwt");

dotenv.config();

const PORT = 4000;

const app = express();
const server = createServer(app);

app.use(
  expressJwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
    credentialsRequired: false
  })
);

const apollo = new ApolloServer({
  resolvers: {
    Query,
    Mutation,
    Node: {
      __resolveType() {
        return null;
      },
    },
  },
  typeDefs,
  context: ({ req }) => {
  	const user = req.user || null;
    return {
       user,
      ...req,
      db: new Prisma({
        typeDefs: "./src/generated/prisma.graphql",
        endpoint: `${process.env.PRISMA_ENDPOINT}`,
      }),
    };
  },
});
apollo.applyMiddleware({ app,cors: { origin: process.env.CLIENT_URL, credentials: true }});

server.listen({ port: PORT }, () => {
  console.log(`Server is running at port ${PORT}${apollo.graphqlPath}\n`);
});
