import type { AppProps /*, AppContext */ } from 'next/app'
import withApollo from  '../libs/withApollo';
import {ApolloProvider} from '@apollo/client';

function App({ Component, pageProps,apollo}) {
  return <ApolloProvider client={apollo}>
  <Component {...pageProps} />
  </ApolloProvider>
}

export default withApollo(App)