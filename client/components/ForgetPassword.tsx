import { Button, Message, Input, Divider } from "rsuite";
import TextInput from "./form/TextInput";
import WrapperCenter from "./WrapperCenter";
import { useForm, SubmitHandler } from "react-hook-form";
import Link from "next/link";
import { checkErrors } from "../libs/checkErrors";
import Loading from "../components/loading";
import { useMutation, gql } from "@apollo/client";
import ErrorMessage from "./ErrorMessgae";
import Head from './Head'
type Values = {
  email: string;
};

const FORGET_PASSWORD = gql`
  mutation forgetPassword($email: String!) {
    forgetPassword(email: $email) {
      message
    }
  }
`;

const ForgetPasswordForm = () => {
  const [forgetPassword, { data, error, loading }] = useMutation(
    FORGET_PASSWORD
  );
  const { register, handleSubmit, errors } = useForm<Values>();
  const onSubmit: SubmitHandler<Values> = ({ email }) => {
    forgetPassword({ variables: { email } });
  };
  if (data?.forgetPassword?.message) {
    return (
      <Message
        type="success"
        description={`An Email has been sent successfuly to ${data.forgetPassword.message}.
          Please note that the information in this email will be invalid in 10
          minutes from now.`}
      />
    );
  }
  return (
    <div>
      <Loading loading={loading} />
      <ErrorMessage error={error} />
      <form className="fluid" onSubmit={handleSubmit(onSubmit)}>
        <TextInput
          name="email"
          type="text"
          register={register({
            required: true,
            pattern: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/,
          })}
          error={checkErrors("email", errors)}
        />
        <Button appearance="primary" block size="lg" type="submit">
          Submit
        </Button>
      </form>
    </div>
  );
};
const ForgetPassword = () => {
  return (
    <WrapperCenter>
        <Head title="Talklo | Forget Password" description="Talklo is a lightwight chat app, easy to send and recieve message with friends" />
      <div className="form__container">
        <h5>Forget Password</h5>
        <Divider />
        <ForgetPasswordForm />
        <div className="form__end">
          <span>Have an account?</span>
          <Link href="/login">
            <a className="rs-btn rs-btn-link">Login</a>
          </Link>
        </div>
      </div>
    </WrapperCenter>
  );
};

export default ForgetPassword;
