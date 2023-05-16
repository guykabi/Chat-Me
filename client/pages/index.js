import { useEffect, useState } from "react";
import styles from "../styles/IntroductionPage.module.css";
import { checkDevice, exctractCredentials } from "../utils/utils";
import { tokenValidation } from "../utils/apiUtils";
import { useMutation } from "react-query";
import { Loader } from "../components/UI/clipLoader/clipLoader";
import { push } from "next/router";
import Link from "next/link";
import { useErrorBoundary } from "react-error-boundary";
import Mobile from "../components/errors/mobile/mobile";

const Introduction = ({ isMobile,isLoggedIn }) => {
  const { showBoundary } = useErrorBoundary();
  const [isConnect, setIsConnect] = useState(null);

  const { mutate:authCheck, error, isLoading } = useMutation(tokenValidation, {
    onSuccess: () => { push("/messenger") } 
  });
   
  useEffect(() => {
    let connect = localStorage.getItem("connect");

    if (connect === "false" || isLoggedIn === false) {
      setIsConnect(true);
      return;
    }
    if (isLoggedIn && connect === "true") {
      authCheck();
    }
  }, [isLoggedIn]); 

  if(isMobile){
    return(
      <Mobile/>
    )
  }

  if (isLoading) {
    return (
      <div className="center">
        <h2>Loading...</h2>
        <Loader size={40} />
      </div>
    );
  }

  if (error) {
    showBoundary(error);
  }

  return (
    <>
      {isConnect && (
        <section className={styles.homePageWrapper}>
          <main className={styles.mainHomeDiv}>
            <h1>Chat-Me</h1>
            <div className={styles.titlesWrapper}>
              <div className={styles.signIn}>
                <Link href="/login">Sign in</Link>
              </div>
              <div>or</div>
              <div className={styles.signUp}>
                <Link href="/signUp">Sign up</Link>
              </div>
            </div>
          </main>
        </section>
      )}
    </>
  );
};

export async function getServerSideProps({ req }) {

  let isMobile = checkDevice(req.headers['user-agent'])

  if(isMobile) return {props : {isMobile : 'mobile'}} 
    
  const user = exctractCredentials(req);
  if (user === "No cookie") return {props: { isLoggedIn: false } }

  return {
    props:{ isLoggedIn:true }
  }

}

export default Introduction;
