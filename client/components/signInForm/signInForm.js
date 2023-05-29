import React, { useState } from "react";
import { useTranslation } from "next-i18next";
import Button from "../../components/UI/Button/button";
import styles from "./signInForm.module.css";
import Input from "../../components/UI/Input/Input";
import { checkUser } from "../../utils/authUtils";
import {decodeGoogleCredentials} from '../../utils/authUtils'
import { useMutation } from "react-query";
import {GoogleLogin} from '@react-oauth/google'
import { Loader } from "../../components/UI/clipLoader/clipLoader";
import { useRouter } from "next/router";
import {AiOutlineMail} from 'react-icons/ai'
import {RiLockPasswordLine} from 'react-icons/ri'
import { toast } from 'react-toastify';


const SignIn = ({onStayConnect, onResetPassword}) => {
  
  const {push} = useRouter()
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const {t} = useTranslation('login')
  const [userName, setUserName] = useState(null);
  

  const {
    mutate: authUser,
    isLoading
  } = useMutation(checkUser, {
    onSuccess: (data) => {
      //If invalid details was inserted - present the error message
      if (typeof data === "string") {
        toast.error(data,{
          position:'top-center',
          theme:'colored'
        })
      }

      if (data.message !== "User got authorized") return;
      setUserName(data.userData.name);
      onStayConnect({open:true,userName:data.userData.name})
    },
    onError:error=>{
      toast.error(error.message,{
        position:'top-center',
        theme:'colored'
      })
    }
  }); 


  const sendCredentials = (e) => {
    e.preventDefault();
    let credentials = {email,password}
    authUser(credentials);
  }; 

  const handleGoogleSignIn = (response) =>{
    const {email,given_name,family_name,picture,sub} = 
        decodeGoogleCredentials(response.credential)

   const credentials = {
     email,
     name:given_name,
     lastName:family_name,
     image:picture,
     sub
    }
    authUser(credentials)
  }

  const handleResetPassword = () =>{
    onResetPassword(true)
  }


  return (
    <>
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
      

            <section className={styles.btnsWrapper}>
              <Button
                type="submit"
                text={isLoading?<Loader size={15} color="black" />:t('buttons.login')}
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
            onClick={handleResetPassword}
          >
            {t('forgotPassword')}
          </div> 
          <div className={styles.googleSignIn}>
            <GoogleLogin 
            onSuccess={handleGoogleSignIn}/> 
          </div>
        </main>

      </div>
    </>
  );
};



export default SignIn;
