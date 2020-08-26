
import { useMutation, useQuery, gql } from "@apollo/client";
import ErrorMessage from "../../components/ErrorMessgae";
import LoadingPage from "../../components/loading";
import Router from "next/router";
import { CURRENT_USER } from "../../components/User.js";
import {  Message, Divider } from "rsuite";
import WrapperCenter from '../../components/WrapperCenter'
import Link from "next/link";
import { useRouter } from 'next/router'

const ACTIVATE_EMAIL = gql`
  query activateAccount($token: String!) {
    activateAccount(token: $token) {
      message
    }
  }
`;

const ActivateEmail = ({ token }) => {
  const { data, error, loading } = useQuery(ACTIVATE_EMAIL, {
    variables: { token },
  });
  if (loading) return <LoadingPage loading={loading} />;
  if (error) return <ErrorMessage error={error} />;
  if (data && data.activateAccount && data.activateAccount.message)
    return (
      <Message type="success" 
      description={
        <p>
conguratilation {data.activateAccount.message}, your accuout has been
        successfully activated. now go to          <br />
         <Link href="/login">
            <a className="rs-btn rs-btn-link">Login</a>
        </Link>
        </p>
      }
      />
    );
  else return null;
};
const Accivate=  () => {
   const router = useRouter()
  const { token } = router.query
  return (
    <WrapperCenter>
      <div className="form__container">
        <h5>Accivate Account</h5>
        <Divider />
        {!token ? <Message type="error" description="Invalid token" /> : <ActivateEmail token={token} />}
        <Divider />
        <div className="form__end">
          <Link href="/signup">
            <a className="rs-btn rs-btn-link">Signup instead</a>
          </Link>
        </div>
      </div>
    </WrapperCenter>
  );
};
export default Accivate;