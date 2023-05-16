import React, { useState } from 'react'
import styles from './signUp.module.css'
import {push} from 'next/router'
import {useMutation} from 'react-query'
import { useErrorBoundary } from "react-error-boundary";
import { addUser, checkUser } from '../../utils/apiUtils'
import {useFormik} from 'formik'
import * as yup from 'yup'
import Input from '../../components/UI/Input/Input'
import Button from '../../components/UI/Button/button'
import {MdOutlinePersonOutline} from 'react-icons/md'
import {RiLockPasswordLine} from 'react-icons/ri'
import {AiOutlineMail} from 'react-icons/ai'


const SignUp = () => {
  const {showBoundary} = useErrorBoundary()
  const [isSuccessSignUp,setIsSuccessSignUp]=useState(false)
  const [isEmailTaken,setIsEmailTaken]=useState(false)
  const passwordRules = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,}$/;

    const {mutate:checkEmail}=useMutation(checkUser,{
        onSuccess:data=>{
          if(data === 'Email does not exist'){
            setIsEmailTaken(true)
          }
          if(data === 'Invalid password'){
            setIsEmailTaken(false)
          }
        }
    })

    const {mutate:add} = useMutation(addUser,{
      onSuccess:data=>{
        if(data !== 'User added')return
        setIsSuccessSignUp(true)
        setTimeout(()=>{
          push('/login')
        },3000)  
      },
      onError: (error) => showBoundary(error)
    })

    const {
        handleSubmit,
        handleBlur,
        handleChange,
        touched,
        errors,
        values
      } = useFormik({
        enableReinitialize: true,
        initialValues: {
          name: '',
          lastName: '',
          password:'',
          confirmpassword:'',
          email: '',
        },
        onSubmit:(values)=>{
            add(values)
        },
        validationSchema: yup.object({
            name: yup.string().max(15,'Must be 15 chars or less').required("Require"),
        
            lastName: yup.string().trim().required("Lastname is required"),
        
            password: yup.string().min(6,'Must be at least 6 chars')
            .matches(passwordRules, { message: "Please create a stronger password" })
            .max(20,"Must be 16 chars or less").required("Require"),
        
            confirmpassword: yup.string()
            .oneOf([yup.ref("password"), null], "Passwords must match")
            .required("Required"),
        
            email: yup.string().email('Invalid email').required('Required')
            .test('Unique email','Email is taken',(value)=>{
              checkEmail({email:value,password:'0'})
              return isEmailTaken
            })
        }),
    })

    

  return (
    <section className={styles.signUpWrapper}>
       {!isSuccessSignUp?<section className={styles.signUpInnerWrapper}>
        <header className={styles.signUpHeader}>
         <h2>Sign-up</h2>
        </header>
        <main className={styles.formWrapper}>
            <form 
            onSubmit={handleSubmit}
            className='form'>
                <section className='inputWrapper'>
                    <div className={styles.inputField}>
                    <MdOutlinePersonOutline size={20}/>
                    <Input
                    placeholder='Name'
                    name='name'
                    width='90'
                    height='45'
                    fontSize='large'
                    textAlign='center'
                    onChange={handleChange}
                    onBlur={handleBlur}/>
                    </div>
                    {touched.name && errors.name ? (
                    <span>{errors.name}</span>
                  ) : null}
                </section>
                <section className='inputWrapper'>
                    <div className={styles.inputField}>
                    <MdOutlinePersonOutline size={20}/>
                    <Input
                    placeholder='Lastname'
                    name='lastName'
                    width='90'
                    height='45'
                    fontSize='large'
                    textAlign='center'
                    onChange={handleChange}
                    onBlur={handleBlur}/>
                    </div>
                    {touched.lastName && errors.lastName ? (
                    <span>{errors.lastName}</span>
                  ) : null}
                </section>
                <section className='inputWrapper'>
                    <div className={styles.inputField}>
                    <RiLockPasswordLine size={20}/>
                    <Input
                    placeholder='Password'
                    name='password'
                    type='password'
                    width='90'
                    height='45'
                    fontSize='large'
                    textAlign='center'
                    onChange={handleChange}
                    onBlur={handleBlur}/>
                    </div>
                    {touched.password && errors.password ? (
                    <span>{errors.password}</span>
                  ) : null}
                </section>
                <section className='inputWrapper'>
                    <div className={styles.inputField}>
                    <RiLockPasswordLine size={20}/>
                    <Input
                    placeholder='Confirm password'
                    name='confirmpassword'
                    type='password'
                    width='90'
                    height='45'
                    textAlign='center'
                    fontSize='large'
                    onChange={handleChange}
                    onBlur={handleBlur}/>
                    </div>
                    {touched.confirmpassword && errors.confirmpassword ? (
                    <span>{errors.confirmpassword}</span>
                  ) : null}
                </section>
                <section className='inputWrapper'>
                    <div className={styles.inputField}>
                    <AiOutlineMail size={20}/>
                    <Input
                    placeholder='Email'
                    name='email'
                    width='90'
                    height='45'
                    fontSize='large'
                    textAlign='center'
                    onChange={handleChange}
                    onBlur={handleBlur}/>
                    </div>
                    {touched.email && errors.email ? (
                    <span>{errors.email}</span>
                  ) : null}
                </section>
                <section className='btnsWrapper'>
                    <Button
                    className='secondaryBtn'
                    text='Done'
                    type='submit'
                    width='15'
                    height='30'/>
                    <Button
                    className='secondaryBtn'
                    text='Return'
                    onClick={(e)=>{
                      e.preventDefault()
                      push('/')
                    }}
                    width='15'
                    height='30'/>
                </section>
            </form>
        </main>
       </section>:
       <section className='successfulAction'>
        <main>
          <h2>
            {values?.name}, your registration has done
          </h2>
        </main>
       </section>}
    </section>
  )
}

export default SignUp