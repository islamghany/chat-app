import { useMutation, useQuery, gql } from "@apollo/client";
import ErrorMessage from "./ErrorMessgae";
import LoadingPage from "./loading";
import Router from "next/router";
import { CURRENT_USER } from "./User.js";
import { Button, Message, Divider } from "rsuite";
import WrapperCenter from "./WrapperCenter";
import Link from "next/link";
import { useRouter } from "next/router";
import { useForm, SubmitHandler } from "react-hook-form";
import { checkErrors } from "../libs/checkErrors";
import TextInput from "./form/TextInput";
import Head from './Head'

const RESET_PASSWORD = gql`
  mutation resetPassword($newPassword: String!, $resetPasswordLink: String!) {
    resetPassword(
      newPassword: $newPassword
      resetPasswordLink: $resetPasswordLink
    ) {
      message
    }
  }
`;

const IS_TOKEN_TRUE = gql`
  query isTokenTrue($token: String!) {
    isTokenTrue(token: $token) {
      message
    }
  }
`;

type Values = {
  password: string;
  confirmPassword: string;
};

const ResetPasswordForm = ({ token }) => {
  const {
    data: queryData,
    error: queryError,
    loading: queryLoading,
  } = useQuery(IS_TOKEN_TRUE, { variables: { token } });
  const [
    resetPassword,
    { data: mutationData, error: mutationError, loading: mutationLoading },
  ] = useMutation(RESET_PASSWORD);
  const { register, handleSubmit, errors, watch } = useForm<Values>();
  const cp = watch("password");
  const onSubmit: SubmitHandler<Values> = ({ password }) => {
    resetPassword({
      variables: { newPassword: password, resetPasswordLink: token },
    });
  };

  if (queryLoading) return <LoadingPage loading={queryLoading} />;
  if (queryError) return <ErrorMessage error={queryError} />;
  if (queryData?.isTokenTrue?.message && mutationData?.resetPassword) {
    return (
      <Message
        type="success"
        description={
          <p>
            conguratilation {queryData?.isTokenTrue?.message}, your password has
            been successfully updated, now go to logn with new the new password
            password
            <br />
            <Link href="/login">
              <a className="rs-btn rs-btn-link">Login</a>
            </Link>
          </p>
        }
      />
    );
  } else
    return (
      <div>
        <ErrorMessage error={mutationError} />
        <form className="fluid" onSubmit={handleSubmit(onSubmit)}>
          <LoadingPage loading={mutationLoading} />
          <TextInput
            name="password"
            register={register({ required: true, minLength: 6, maxLength: 32 })}
            type="password"
            label="new password"
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
            type="password"
            error={checkErrors("confirmPassword", errors)}
          />
          <Button appearance="primary" block size="lg" type="submit">
            Submit
          </Button>
        </form>
      </div>
    );
};
const ResetPassword = () => {
  const router = useRouter();
  const { token } = router.query;
  return (
    <WrapperCenter>
    <Head title="Talklo | Reset Password" description="Talklo is a lightwight chat app, easy to send and recieve message with friends" />
      <div className="form__container">
        <h5>Reset Password</h5>
        <Divider />
        {!token ? (
          <Message type="error" description="Invalid token" />
        ) : (
          <ResetPasswordForm token={token} />
        )}
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
export default ResetPassword;
