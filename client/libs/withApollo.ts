import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
  createHttpLink,
  makeVar,
} from "@apollo/client";
import withApollo from "next-with-apollo";
import { getCookie } from "./auth";
import { setContext } from "@apollo/client/link/context";

interface User {
  name: string;
  username: string;
  email: string;
  id: string;
}
export const currentUser = makeVar<User | null>(null);

const httpLink = createHttpLink({
  uri: "http://localhost:4000/graphql",
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = getCookie(`${process.env.APP_SECRET}`);
  // return the headers to the context so httpLink can read them
  let allHeaders = token
    ? { ...headers, authorization: `Bearer ${token}` }
    : { ...headers };
  return {
    headers: allHeaders,
  };
});

function createClient(): ApolloClient<NormalizedCacheObject> {
  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache({}),
    connectToDevTools: true,
  });
}

export default withApollo(createClient);
