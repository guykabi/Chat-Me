import { useEffect, useState } from "react";
import styles from "../styles/IntroductionPage.module.css";
import { checkDevice, exctractCredentials } from "../utils/utils";
import { tokenValidation, logOut } from "../utils/apiUtils";
import { useQuery, useMutation } from "react-query";
import { Loader } from "../components/UI/clipLoader/clipLoader";
import { push } from "next/router";
import Link from "next/link";
import { useErrorBoundary } from "react-error-boundary";
import Mobile from "../components/errors/mobile/mobile";
import Head from "next/head";

const Introduction = ({ isMobile,isLoggedIn }) => {
  const { showBoundary } = useErrorBoundary();
   
  const { mutate:authCheck, error, isLoading } = useMutation(tokenValidation, {
    onSuccess: () => { push("/messenger") },
    onError: (error) => showBoundary(error) 
  }); 
   
  const { refetch:clear } = useQuery(["clear"], logOut, {
    onError: (error) => showBoundary(error),
    enabled: false,
  });
   
  useEffect(() => {
    let connect = localStorage.getItem("connect");

    if (connect === "false" || !isLoggedIn) {
      if(isLoggedIn) clear()
      return;
    }
    
    authCheck();

  }, []); 

  if(isMobile){
    return(
      <Mobile/>
    )
  }

  if (isLoading) {
    
    return (
      <div className="center">
        <h2>Loading...</h2>
        <Loader size={50} />
      </div>
    );
  }

  if (error) {
    showBoundary(error);
  }

  return (
    <>
    <Head>
      <title>Chat - Me</title>
      <meta property="og:title" content="Chat Me title" key="title" />
    </Head>
      {!isLoggedIn&& (
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
    
  const result = exctractCredentials(req);
  if (result === "No cookie" || result === "No token") 
        return {props: { isLoggedIn: false } }

  return {
    props:{ isLoggedIn:true }
  }

}

export default Introduction;
