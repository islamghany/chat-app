import { gql, useQuery } from "@apollo/client";
import Loading from "./loading";
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

const User = ({ children }) => {
  const { data, loading } = useQuery(CURRENT_USER);
  if (data) console.log(data);

  if (loading) return <Loading loading={true} />;
  return <div>{children(data)}</div>;
};
export default User;
