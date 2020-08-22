import {ApolloClient,InMemoryCache,NormalizedCacheObject} from '@apollo/client';
import withApollo from 'next-with-apollo';

function createClient(): ApolloClient<NormalizedCacheObject>{
	return new ApolloClient({
		uri:'http://localhost:4000',
		cache: new InMemoryCache({}),
		connectToDevTools: true,
	})
}

 export default withApollo(createClient)