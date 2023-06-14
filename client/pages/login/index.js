import React, { useState, useRef, useEffect,useContext } from "react";
import Head from "next/head";
import SignInForm from "../../components/signInForm/signInForm";
import Modal from "../../components/Modal/modal";
import {chatContext} from '../../context/chatContext'
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Button from "../../components/UI/Button/button";
import styles from "./login.module.css";
import Input from "../../components/UI/Input/Input";
import { emailToReset } from "../../utils/authUtils";
import { useMutation } from "react-query";
import { Loader } from "../../components/UI/clipLoader/clipLoader";
import { push } from "next/router";



const Login = () => {
  const {dispatch,currentChat} = useContext(chatContext)
  const {t} = useTranslation('login')
  const [userName, setUserName] = useState(null);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [stayConnect, setStayConnect] = useState(false);
  const [emailForReset, setEmailForReset] = useState(null);
  const [successEmailReset, setSuccessEmailReset] = useState(false);
  const [resendEmailCounter, setResendEmailCounter] = useState(60);
  const resetRef = useRef();


  const {mutate:handleEmail,isLoading:loadEmail} = useMutation(emailToReset,{
    onSuccess:data=>{
      if (data === "Email does not exist") {
        resetRef.current.value = t('emailNot');
        let timer = setTimeout(() => {
          resetRef.current.value = null;
        }, 3000);
        return () => clearTimeout(timer);
      } else {
        setSuccessEmailReset(true);
        let timer = setTimeout(() => {
          setSuccessEmailReset(false);
          setResendEmailCounter((prev) => prev - 1);
        }, 4000);
        return () => clearTimeout(timer);
      }
    }
  })


  useEffect(()=>{
    if(currentChat)
     dispatch({type:'CURRENT_CHAT',payload:null})
  },[])

  useEffect(() => {
    if (resendEmailCounter == 60) return;
    if (resendEmailCounter == 1) return setResendEmailCounter(60);
    if (resendEmailCounter > 0) {
      let timer = setTimeout(() => setResendEmailCounter(resendEmailCounter - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendEmailCounter]);
  
  const handleResetPasswordSubmit = (e) => {
    e.preventDefault();
    handleEmail({email:emailForReset,url:process.env.NEXT_PUBLIC_RESER_URL})
  };
  
  const openStayConnectModal = (e) =>{
      setStayConnect(e.open)
      setUserName(e.userName)
  }
 
  const handleStayConnect = () => {
    localStorage.setItem("connect", true);
    setStayConnect(false);
    push("/messenger");
  };

  const handleNotStayConnect = () => {
    localStorage.setItem("connect", false);
    setStayConnect(false);
    push("/messenger");
  };

  const closeResetPasswordModal = () => {
    setIsResetPassword(false);
  };

  return (
    <section className={styles.mainLoginWrapper}>
      <Head>
        <title>{t('title')}</title>
        <link
           rel="icon"
           href="/favicon.ico"
           type="image/<generated>"
           sizes="<generated>"
        />
      </Head>
      <section className={styles.signInWrapper}>

       <SignInForm
       onStayConnect={openStayConnectModal}
       onResetPassword={(e)=>setIsResetPassword(e)}
       />

      </section>
       <Modal show={stayConnect}>
        <section className={styles.stayConnect}>
          <h3>{`${userName}, ${t('stayConnect')}`}</h3>
          <section className={styles.modalBtns}>
            <Button
             width={6}
             text={t('buttons.yes')}
             className="primaryBtn"
             onClick={handleStayConnect}
            />
            <Button
             width={6}
             text={t('buttons.no')}
             className="primaryBtn"
             onClick={handleNotStayConnect}
            />
            </section>
          </section>
        </Modal>

        <Modal show={isResetPassword} onClose={closeResetPasswordModal}>
          {!successEmailReset ? (
            <form
              className={styles.resetPasswordWrapper}
              onSubmit={handleResetPasswordSubmit}
            >
              <h3>{t('h3')}</h3>
              <Input
                placeholder={t('placeholders.email')}
                width="50"
                height="15"
                type="email"
                textAlign='center'
                ref={resetRef}
                require
                onChange={(e) => setEmailForReset(e.target.value)}
              />
              <Button
                className="primaryBtn"
                text={loadEmail?<Loader size={10}/>:t('buttons.send')}
                width="8"
                height="15"
                disabled={resendEmailCounter > 0 && resendEmailCounter < 60}
                type="submit"
              />
              {resendEmailCounter > 0 && resendEmailCounter < 60 ? (
                <p>{`${t('resend')} ${resendEmailCounter}`}</p>
              ) : null}
            </form>
          ) : (
            <section>
              <h2>{t('checkEmail')}</h2>
            </section>
          )}
        </Modal>
    </section>
  );
};

export async function getServerSideProps({  locale }) {
 
  return {
    props: {  
      ...(await serverSideTranslations(locale, ['login'])) }
  };
}

export default Login;
