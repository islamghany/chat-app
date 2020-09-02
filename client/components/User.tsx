import { gql, useQuery } from "@apollo/client";
import Loading from "./loading";
import Router,{useRouter} from "next/router";

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

const User = ({ children }:any) => {
    const router = useRouter();
   
  const { data, loading } = useQuery(CURRENT_USER);
  if(data?.me?.name && router.pathname !== '/') {
     Router.replace('/')
  } 
  if (loading || (data?.me?.name && router.pathname !== '/')) return <Loading loading={true} />;
  return <div>{children(data)}</div>;
};
export default User;
