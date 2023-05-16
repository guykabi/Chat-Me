import React, { useState, useContext, useRef, useEffect } from "react";
import Head from "next/head";
import Modal from "../../components/Modal/modal";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Button from "../../components/UI/Button/button";
import styles from "./login.module.css";
import Input from "../../components/UI/Input/Input";
import { checkUser, emailToReset } from "../../utils/apiUtils";
import { useMutation } from "react-query";
import { Loader } from "../../components/UI/clipLoader/clipLoader";
import { push } from "next/router";
import {AiOutlineMail} from 'react-icons/ai'
import {RiLockPasswordLine} from 'react-icons/ri'

const Login = () => {
  //Check on return to login without logout!!!!
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const {t} = useTranslation('login')
  const [loginMessage, setLoginMessage] = useState(null);
  const [userName, setUserName] = useState(null);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [showStayConnect, setShowStayConnect] = useState(false);
  const [emailForReset, setEmailForReset] = useState(null);
  const [successEmailReset, setSuccessEmailReset] = useState(false);
  const [counter, setCounter] = useState(60);
  const resetRef = useRef();


  const {
    mutate: authUser,
    isLoading,
    isError,
  } = useMutation(checkUser, {
    onSuccess: (data) => {
      //If invalid details was inserted - present the error message
      if (typeof data === "string") {

        setLoginMessage(data);
        let timer = setTimeout(() => {
          setLoginMessage(null);
        }, 3000);

        return () => {
          clearTimeout(timer);
        };
      }

      if (data.message !== "User got authorized") return;
      setUserName(data.userData.name);
      setShowStayConnect(true);
    },
  }); 

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
          setCounter((prev) => prev - 1);
        }, 4000);
        return () => clearTimeout(timer);
      }
    }
  })



  useEffect(() => {
    if (counter == 60) return;
    if (counter == 1) return setCounter(60);
    if (counter > 0) {
      let timer = setTimeout(() => setCounter(counter - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [counter]);

  const handleResetPasswordSubmit = (e) => {
    e.preventDefault();
    handleEmail({email:emailForReset,url:'http://localhost:3000/reset'})
  };


  const sendCredentials = (e) => {
    e.preventDefault();
    let obj = { email, password };
    authUser(obj);
  };

  const handleStayConnect = () => {
    localStorage.setItem("connect", true);
    setShowStayConnect(false);
    push("/messenger");
  };

  const handleNotStayConnect = () => {
    localStorage.setItem("connect", false);
    setShowStayConnect(false);
    push("/messenger");
  };

  const closeResetPasswordModal = () => {
    setIsResetPassword(false);
  };

  return (
    <div className={styles.mainLoginWrapper}>
      <Head>
        <title>{t('title')}</title>
      </Head>
      <div className={styles.loginWrapper} aria-label="Login form">
        <header className={styles.header}>
          <h2>{t('h2')}</h2>
        </header>
        <main className={styles.formWrapper}>
          <form onSubmit={sendCredentials} className={styles.loginForm}>
            <section className={styles.loginInputField} aria-label="email">
            <AiOutlineMail
            size={25}/>
            <Input
              width={100}
              height={30}
              value={email}
              placeholder={t('placeholders.email')}
              type="email"
              textAlign='center'
              fontSize='medium'
              require
              onChange={(e) => setEmail(e.target.value)}
            />
            </section>
            <section className={styles.loginInputField} aria-label="password">
              <RiLockPasswordLine
              size={25}/>
              <Input
              width={100}
              height={30}
              value={password}
              placeholder={t('placeholders.password')}
              type="password"
              textAlign='center'
              fontSize='medium'
              require
              onChange={(e) => setPassword(e.target.value)}
            />
            </section>
            {isLoading && !isResetPassword ? (
              <section className={styles.loaderWrapper}>
                <Loader size={22} />
              </section>
            ) : null}
            {loginMessage ? <span>{loginMessage}</span> : null}
            {isError ? <span>{t('error.connection')}</span> : null}
            <section className={styles.btnsWrapper}>
              <Button
                type="submit"
                text={t('buttons.login')}
                className="primaryBtn"
                width={14}
                height={30}
                disabled={userName}
              />
              <Button
                text={t('buttons.home')}
                className="primaryBtn"
                width={14}
                height={30}
                onClick={() => push("/")}
                disabled={userName}
              />
            </section>
          </form>
          <div
            className={styles.forgotPassword}
            role="link"
            onClick={() => setIsResetPassword(true)}
          >
            {t('forgotPassword')}
          </div>
        </main>

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
                disabled={counter > 0 && counter < 60}
                type="submit"
              />
              {counter > 0 && counter < 60 ? (
                <p>{`${t('resend')} ${counter}`}</p>
              ) : null}
            </form>
          ) : (
            <section>
              <h2>{t('checkEmail')}</h2>
            </section>
          )}
        </Modal>

        <Modal show={showStayConnect}>
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
      </div>
    </div>
  );
};

export async function getServerSideProps({ req,locale }) {
 

  return {
    props: {  
      ...(await serverSideTranslations(locale, ['login'])) }
  };
}

export default Login;
