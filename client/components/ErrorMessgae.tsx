import { Message } from "rsuite";

const ErrorMessage = ({ error }:any) => {
  if (!error || !error.message) return null;
  if (
    error.networkError &&
    error.networkError.result &&
    error.networkError.result.errors.length
  ) {
    return error.networkError.result.errors.map((error:any, i:number) => (
      <Message
        key={i}
        type="error"
        description={error.message.replace("GraphQL error: ", "")}
      />
    ));
  }
  return (
    <Message
      type="error"
      description={error.message.replace("GraphQL error: ", "")}
    />
  );
};

export default ErrorMessage;
