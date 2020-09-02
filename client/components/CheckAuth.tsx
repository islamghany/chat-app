import { useRouter } from "next/router";
import LoadingPage from "./loading";

const CheckAuth = ({ data, children }:any) => {
  const router = useRouter();
  const isData = data?.me?.name;
  if (isData && router.pathname !== "/") {
    router.push(`/`);
  }
  else if (!isData && router.pathname === "/") {
    router.push(`/login`);
  }

  if (
    (isData && router.pathname !== "/") ||
    (!isData && router.pathname === "/")
  )
   return <LoadingPage loading={true} />;
  return <div>{children}</div>;
};
export default CheckAuth;
