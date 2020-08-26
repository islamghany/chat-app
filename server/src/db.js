const { Prisma } = require('prisma-binding');

const db = new Prisma({
      typeDefs: "./src/generated/prisma.graphql",
      endpoint: "https://eu1.prisma.sh/islam-mostafa-ef8610/note-app/dev",
 })

db.query.users({}).then(res=>console.log(res)).catch(err=>console.log(err))
