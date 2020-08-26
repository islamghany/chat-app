import { CURRENT_USER } from "./User";
import Router, { useRouter } from "next/router";
import LoadingPage from "./loading";

const CheckAuth = ({ data, children }) => {
  const router = useRouter();
  const isData = data?.me?.name;
  console.log(isData);
  if (isData && router.pathname !== "/") {
    Router.push(`/`);
  }
  if (!isData && router.pathname === "/") {
    Router.push(`/login`);
  }

  if (
    (isData && router.pathname !== "/") ||
    (!isData && router.pathname === "/")
  )
    return <LoadingPage loaing={true} />;
  return <div>{children}</div>;
};
export default CheckAuth;
