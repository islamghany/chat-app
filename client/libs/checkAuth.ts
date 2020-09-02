import { gql } from "@apollo/client";
import {client} from '../libs/withApollo'
import { getCookie } from "./auth";


export const CURRENT_USER = gql`
  query currentUser {
    me {
      name
      username
      email
      id
    }
  }
`;

const checkAuth = async () =>{
	
	let data;
	try{
       data = await client.query({
       	query:CURRENT_USER,
       	headers:{
       		Authorization: `Bearer ${getCookie(process.env.APP_SECRET)}`
       	}
        
       });
       console.log('data',data);
       return {me:data.me}
	}catch(err){
		//console.log(err)
		return {me : null}
	}
}



export default checkAuth;