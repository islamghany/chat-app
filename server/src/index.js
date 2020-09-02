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
//const expressJwt = require("express-jwt");
const {validateTokenAndSeeUser} = require('./helpers/auth');
const db = require('./db');

dotenv.config();

const PORT = 4000;
// start
const app = express();
const server = createServer(app);

app.use( async (req,res,next)=>{
     const token = req.header('Authorization');
     try {
       const user = await validateTokenAndSeeUser(token,process.env.JWT_SECRET);
       if(user){
         req.user = user;
       }
     }catch(err){}
      return next()
}
);

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
  subscriptions: {
     onConnect:async (connectionParams, webSocket) => {
      if (connectionParams.Authorization) {
       const user = await validateTokenAndSeeUser(connectionParams.Authorization,process.env.JWT_SECRET);
       if(user){
         return {
           user
         }
       }
      }

      throw new Error('Missing auth token!');
    }
  },
  context: ({ req ,connection,payload }) => {
      if (connection ){
      // check connection for metadata
      return { user:connection.context , db};
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

