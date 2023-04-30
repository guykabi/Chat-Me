import React,{useEffect, useState} from 'react'
import styles from './reset.module.css'
import {useFormik} from 'formik'
import * as yup from 'yup'
import {useRouter} from 'next/router'
import {push} from 'next/router'
import {useMutation} from 'react-query'
import { useErrorBoundary } from "react-error-boundary";
import {checkResetLink, resetPassword} from '../../utils/apiUtils'
import Input from '../../components/UI/Input/Input'
import Button from '../../components/UI/Button/button'
import {RiLockPasswordLine} from 'react-icons/ri'


const Reset = () => {
 const {query} = useRouter()
 const { showBoundary } = useErrorBoundary();
 const [isAuthenticated,setIsAuthenticated]=useState(false)
 const [isSuccessReset,setIsSuccessReset]=useState(false)
 const passwordRules = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,}$/;
 
const {mutate:checkLink} = useMutation(checkResetLink,{
  onSuccess:data =>{
      if(data !== 'Valid reset password token')return push('/login')
      setIsAuthenticated(true)
   },
   onError: (error) => showBoundary(error)
}) 

const {mutate:reset} = useMutation(resetPassword,{
  onSuccess:data=>{
    if(data !== 'Password updated')return
    setIsSuccessReset(true)
    setTimeout(()=>{
       push('/login')
    },4000)
  },
  onError: (error) => showBoundary(error)
})

useEffect(()=>{
  if(!query?.slug?.[0]) return
  checkLink({id:query.slug[0],token:query.slug[1]})
},[query])

 const {
    handleSubmit,
    handleBlur,
    handleChange,
    touched,
    errors
  } = useFormik({
    enableReinitialize: true,
    initialValues: {
      password:'',
      confirmpassword:''
    },
    onSubmit:(values)=>{
        reset({id:query.slug[0],body:values})
    },
    validationSchema: yup.object({
        
        password: yup.string().min(6,'Must be at least 6 chars')
        .matches(passwordRules, { message: "Please create a stronger password" })
        .max(20,"Must be 16 chars or less").required("Require"),
    
        confirmpassword: yup.string()
        .oneOf([yup.ref("password"), null], "Passwords must match")
        .required("Required"),
    })
})

  return (
    <>
    {isAuthenticated&&<section className='mainWrapper'>
         {!isSuccessReset?<section className='innerWrapper'>
            <header className='header'>
                <h2>Reset password</h2>
            </header>
            <main className='formWrapper'> 
                <form onSubmit={handleSubmit} className='form'>
                    <section className='inputWrapper'>
                        <div className={styles.inputField}>
                        <RiLockPasswordLine size={25}/>
                        <Input
                        placeholder='Password'
                        name='password'
                        type='password'
                        width='90'
                        height='45'
                        fontSize='large'
                        onChange={handleChange}
                        onBlur={handleBlur}/>
                        </div>
                        {touched.password && errors.password ? (
                         <span>{errors.password}</span>
                         ) : null}
                    </section>
                    <section className='inputWrapper'>
                    <div className={styles.inputField}>
                        <RiLockPasswordLine size={25}/>
                        <Input
                         placeholder='Confirm password'
                         name='confirmpassword'
                         type='password'
                         width='90'
                         height='45'
                         fontSize='large'
                         onChange={handleChange}
                         onBlur={handleBlur}/>
                         </div>
                         {touched.confirmpassword && errors.confirmpassword ? (
                         <span>{errors.confirmpassword}</span>
                         ) : null}
                    </section>
                    <section className='btnsWrapper'>
                    <Button
                    className='secondaryBtn'
                    text='Reset'
                    type='submit'
                    width='10'
                    height='30'
                    fontWeight={600}/>
                    <Button
                    className='secondaryBtn'
                    text='Return'
                    onClick={()=>push('/login')}
                    width='10'
                    height='30'
                    fontWeight={600}/>
                    </section>
                </form>
            </main>
         </section>
         :<section className='successfulAction'>
         <main>
          <h2>
            Your password has updated!
          </h2>
        </main>
       </section>}
    </section>}
    </>
  )
}

export default Reset