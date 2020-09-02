import { Button, Message, Divider } from "rsuite";
import TextInput from "./form/TextInput";
import WrapperCenter from "./WrapperCenter";
import { useForm, SubmitHandler } from "react-hook-form";
//import Checkbox from "./form/Checkbox";
import Link from "next/link";
import { checkErrors } from "../libs/checkErrors";
import Loading from "../components/loading";
import { useMutation, useLazyQuery, gql } from "@apollo/client";
import ErrorMessage from "./ErrorMessgae";
import { CURRENT_USER } from "./User";
import { setCookie, getCookie, removeCookie } from "../libs/auth";
import { client } from "../libs/withApollo";
import Head from './Head';
type Values = {
  email: string;
  password: string;
};

const LOGIN = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      user {
        id
        name
        username
        email
      }
      token
    }
  }
`;

const LoginForm = () => {
  // const [currentUser] = useLazyQuery(CURRENT_USER,{ignoreResults:true})
  const [login, { data, error, loading }] = useMutation(LOGIN, {
    onCompleted: (data) => {
      //console.log(data);
     
        setCookie(`${process.env.APP_SECRET}`, data.login.token,()=>{
         window.location.reload();

        // client.writeQuery({
        // query: CURRENT_USER,
        // data:{
        //   me:{...data.login.user}
        // }});

      });
      
     
        
      
    },
  });
  //console.log(removeCookie(`${process.env.APP_SECRET}`));
  const { register, handleSubmit, errors } = useForm<Values>();
  const onSubmit: SubmitHandler<Values> = (data:Values) =>
    login({ variables: { ...data } });

  return (
    <div className="form__container">
      <h5>Login</h5>
      <Divider />
      <ErrorMessage error={error} />
      <Loading loading={loading} />
      <form className="fluid" onSubmit={handleSubmit(onSubmit)}>
        <TextInput
          name="email"
          label={"email or username"}
          type="text"
          register={register({
            required: true,
            validate: (value) =>
              /^(?:[A-Z\d][A-Z\d_-]{5,10}|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4})$/i.test(
                value
              ),
          })}
          error={checkErrors("email", errors)}
        />
        <TextInput
          name="password"
          register={register({ required: true, minLength: 6, maxLength: 32 })}
          type="password"
          error={checkErrors("password", errors)}
        />
        <Button
          loading={loading}
          appearance="primary"
          block
          size="lg"
          type="submit"
        >
          Login
        </Button>
        <div className="form__end">
          <Link href="/forget-password">
            <a className="rs-btn rs-btn-link">Forget your password?</a>
          </Link>
        </div>
      </form>
      <Divider />
      <div className="form__end">
        <span>Don't have an account?</span>
        <Link href="/signup">
          <a className="rs-btn rs-btn-link">Signup</a>
        </Link>
      </div>
    </div>
  );
};
const Login = ({ data }) => {
  return (
    <WrapperCenter>
      <Head title="Talklo | login" description="Talklo is a lightwight chat app, easy to send and recieve message with friends" />
      <div className="wrapper__info">
        <h1 className="heading">Talklo</h1>
        <h4>Talklo connect you to your friend</h4>
      </div>
      <LoginForm />
    </WrapperCenter>
  );
};
export default Login;
