import { Button, Message, Input, Divider } from "rsuite";
import TextInput from "./form/TextInput";
import WrapperCenter from "./WrapperCenter";
import { useForm, SubmitHandler } from "react-hook-form";
import Checkbox from "./form/Checkbox";
import Link from "next/link";
import { checkErrors } from "../libs/checkErrors";
import Loading from "../components/loading";
import { useMutation, gql } from "@apollo/client";
import ErrorMessage from "./ErrorMessgae";

type Values = {
  email: string;
  username: string;
  name: string;
  password: string;
  confirmPassword: string;
};

const CREATE_USER = gql`
  mutation signup(
    $name: String!
    $username: String!
    $email: String!
    $password: String!
  ) {
    signup(
      name: $name
      username: $username
      email: $email
      password: $password
    ) {
      message
    }
  }
`;
const SignupForm = () => {
  const [createUser, { data, error, loading }] = useMutation(CREATE_USER);
  const { register, handleSubmit, errors, watch } = useForm<Values>();
  const onSubmit: SubmitHandler<Values> = (data) => {
    delete data.confirmPassword;
    createUser({ variables: { ...data } });
  };
  const cp = watch("password");

  if (data && data.signup && data.signup.message) {
    return (
      <Message
        type="success"
        description={`An Email has been sent successfuly to ${data.signup.message}, Follow
          instruction to you can login. Please note that the information in this
          email will be invalid in 10 minutes from now.`}
      />
    );
  }
  return (
    <div>
      <form className="fluid" onSubmit={handleSubmit(onSubmit)}>
        <h5>Signup</h5>
        <Divider />
        <ErrorMessage error={error} />
        <Loading loading={loading} />
        <TextInput
          name="name"
          type="text"
          register={register({
            required: true,
            minLength: 6,
            maxLength: 32,
          })}
          error={checkErrors("name", errors)}
        />
        <TextInput
          name="username"
          type="text"
          register={register({
            required: true,
            minLength: 8,
            maxLength: 32,
          })}
          error={checkErrors("username", errors)}
        />
        <TextInput
          name="email"
          type="text"
          register={register({
            required: true,
            pattern: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/,
          })}
          error={checkErrors("email", errors)}
        />
        <TextInput
          name="password"
          register={register({ required: true, minLength: 6, maxLength: 32 })}
          type="password"
          error={checkErrors("password", errors)}
        />
        <TextInput
          name={"confirmPassword"}
          register={register({
            required: true,
            minLength: 6,
            maxLength: 32,
            validate: (value) => value === cp,
          })}
          label="confirm password"
          type="password"
          error={checkErrors("confirmPassword", errors)}
        />
        <Button
          appearance="primary"
          block
          loading={loading}
          size="lg"
          type="submit"
        >
          Login
        </Button>
      </form>
      <Divider />
      <div className="form__end">
        <span>Already have an account?</span>
        <Link href="/login">
          <a className="rs-btn rs-btn-link">Login</a>
        </Link>
      </div>
    </div>
  );
};
const Signup = () => {
  return (
    <WrapperCenter>
      <div className="wrapper__info">
        <h1 className="heading">Title</h1>
        <h4>Title connect you to your friend</h4>
      </div>
      <div className="form__container">
        <SignupForm />
      </div>
    </WrapperCenter>
  );
};

export default Signup;
