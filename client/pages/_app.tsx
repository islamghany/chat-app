import type { AppProps /*, AppContext */ } from 'next/app'
import withApollo from  '../libs/withApollo';
import {ApolloProvider} from '@apollo/client';
import '../style/index.less'
import User from '../components/User' ;
import CheckAuth from '../components/CheckAuth';
function App({ Component, pageProps,apollo}) {
  return <ApolloProvider client={apollo}>
  <User>
  {(data)=>{
 return <CheckAuth data={data}>
     <Component {...pageProps} />
 </CheckAuth>
 }
     }
  </User>
  </ApolloProvider>
}

export default withApollo(App)