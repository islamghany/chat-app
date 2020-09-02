import type { AppProps /*, AppContext */ } from 'next/app'
import withApollo from  '../libs/withApollo';
import {ApolloProvider} from '@apollo/client';
import '../style/index.less'
import User from '../components/User' ;
import CheckAuth from '../components/CheckAuth';
import '../components/chat/style.less'

function App({ Component, pageProps,apollo}:any) {
 return <ApolloProvider client={apollo}>
 <div className="app-wrapper">
    <User>
    {(data:any)=>{
        return <Component {...pageProps} data={data}/>
      }
    }
    </User>
 </div>
</ApolloProvider>
 
}

// <User>
// <CheckAuth data={data}>

//  {(data:any)=>{
//  	}
//      }
 //</CheckAuth>

//   </User>
 //return
export default withApollo(App)
