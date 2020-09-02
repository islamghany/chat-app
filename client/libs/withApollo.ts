import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
  createHttpLink,
  makeVar,
  split,
} from "@apollo/client";
import withApollo from "next-with-apollo";
import { getCookie } from "./auth";
import { setContext } from "@apollo/client/link/context";
import { getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from '@apollo/client/link/ws';

interface ChatInfo {
  name: string;
  id: string;
}

interface User {
  name: string;
  username: string;
  email: string;
  id: string;
}

const token = ()=>getCookie(`${process.env.APP_SECRET}`);

export const currentUser = makeVar<User | null>(null);
export const openedChat = makeVar<ChatInfo | null>(null);
export const keyword = makeVar<string>('');
export const isDrawerOpen = makeVar<boolean>(false);
export const isModalOpen = makeVar<boolean>(false);
export const searchKeyword = makeVar<string>('');
const httpLink = createHttpLink({
  uri: "http://localhost:4000/graphql",
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  // return the headers to the context so httpLink can read them
  let allHeaders = token()
    ? { ...headers, authorization: `Bearer ${token()}` }
    : { ...headers };
  return {
    headers: allHeaders,
  };
});

let link = authLink.concat(httpLink);
if(process.browser){
const wsLink = new WebSocketLink({
  uri: `ws://localhost:4000/graphql`,
  options: {
    reconnect: true,
    connectionParams: {
      Authorization:`Bearer ${token()}`,
    },
  }
});

  link = split(
      // split based on operation type
      ({ query }) => {
        const { kind, operation } = getMainDefinition(query);
        return kind === "OperationDefinition" && operation === "subscription";
      },
      wsLink,
      authLink.concat(httpLink)
    );

}


export const client:ApolloClient<NormalizedCacheObject | null> = new ApolloClient({
  ssrMode: !process.browser, // Disables forceFetch on the server (so queries are only run once)
    link,
    cache: new InMemoryCache({
       typePolicies:{
    Query:{
      fields:{
        openedChat:{
        read(){
          return openedChat()
        },
      },
      filterChats:{
        read(){
          return keyword();
        }
      },
      isDrawerOpen:{
        read(){
          return isDrawerOpen();
        }
      },
      isModalOpen:{
        read(){
          return isModalOpen();
        }
      },
      searchKeyword:{
        read(){
          return searchKeyword();
        }
      }
      }
    }
   }
    }),
    connectToDevTools: true,
  });

function createClient(): ApolloClient<NormalizedCacheObject> {
  return client
}

export default withApollo(createClient);