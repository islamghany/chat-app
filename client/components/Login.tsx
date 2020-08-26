import { Button, Message, Divider } from "rsuite";
import TextInput from "./form/TextInput";
import WrapperCenter from "./WrapperCenter";
import { useForm, SubmitHandler } from "react-hook-form";
import Checkbox from "./form/Checkbox";
import Link from "next/link";
import { checkErrors } from "../libs/checkErrors";
import Loading from "../components/loading";
import { useMutation, useLazyQuery, gql } from "@apollo/client";
import ErrorMessage from "./ErrorMessgae";
import { CURRENT_USER } from "./User";
import { setCookie, getCookie, removeCookie } from "../libs/auth";

type Values = {
  email: string;
  password: string;
};

const LOGIN = gql`
  mutation login($email: String!, $password: String!, $remember: Boolean) {
    login(email: $email, password: $password, remember: $remember) {
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
  console.log(1);
  const [login, { data, error, loading, client }] = useMutation(LOGIN, {
    onCompleted: (data) => {
      setCookie(`${process.env.APP_SECRET}`, data.login.token);
      client.query({
        query: CURRENT_USER,
      });
    },
    // awaitRefetchQueries:true,
    // refetchQueries:[{query:CURRENT_USER}],
  });
  //console.log(removeCookie(`${process.env.APP_SECRET}`));
  const { register, handleSubmit, errors } = useForm<Values>();
  const onSubmit: SubmitHandler<Values> = (data) =>
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
        <Checkbox register={register} name="remember" text="Remember me?" />
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
      <div className="wrapper__info">
        <h1 className="heading">Title</h1>
        <h4>Title connect you to your friend</h4>
      </div>
      <LoginForm />
    </WrapperCenter>
  );
};
export default Login;
