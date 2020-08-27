const { ApolloServer, gql } = require("apollo-server-express");
const express = require("express");
const { createServer } = require("http");
const dotenv = require("dotenv");

const Mutation = require("./resolvers/Mutation");
const Query = require("./resolvers/Query");
const Subscription = require("./resolvers/Subscription");

const { Prisma ,forwardTo} = require("prisma-binding");
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
const db = new Prisma({
        typeDefs: "./src/generated/prisma.graphql",
        endpoint: `${process.env.PRISMA_ENDPOINT}`,
      });
const apollo = new ApolloServer({
  resolvers: {
    Query,
    Subscription,
    Mutation,
    Node: {
      __resolveType() {
        return null;
      },
    },
  },
  typeDefs,
  context: ({ req ,connection}) => {
      if (connection) {
      // check connection for metadata
      return { ...connection.context , db};
    }
  	const user = req.user || null;
    return {
       user,
      ...req,
      introspection: true,
      db
    };
  
  },
});

apollo.applyMiddleware({ app,cors: { origin: process.env.CLIENT_URL, credentials: true }});

server.listen({ port: PORT }, () => {
  console.log(`Server is running at port ${PORT}${apollo.graphqlPath}\n`);
});

apollo.installSubscriptionHandlers(server);

