import React, { useState,useRef,useContext, useEffect } from 'react'
import {chatContext} from '../../../context/chatContext'
import Head from 'next/head'
import {push} from 'next/router'
import styles from './userPage.module.css'
import { useMutation } from 'react-query'
import {updateUserDetails} from '../../../utils/apiUtils'
import { exctractCredentials,onError } from '../../../utils/utils'
import { useGetUser } from '../../../hooks/useUser'
import {useErrorBoundary} from 'react-error-boundary'
import Input from '../../../components/UI/Input/Input'
import noAvatar from "../../../public/images/no-avatar.png";
import Image from 'next/image'
import { BsFillCameraFill } from "react-icons/bs";
import ReturnIcon from '../../../components/UI/returnIcon/returnIcon'
import { useFormik,ErrorMessage,Formik } from 'formik';
import * as yup from 'yup';
import {Loader} from '../../../components/UI/clipLoader/clipLoader'
import Button from '../../../components/UI/Button/button'
import Modal from '../../../components/Modal/modal'

const UserPage = ({user,hasError}) => {
  const {dispatch} = useContext(chatContext)
  const {showBoundary} = useErrorBoundary()
  const [file,setFile]=useState(null)
  const [preview,setPreview]=useState(null)
  const onError = (error)=>{showBoundary(error)}
  const {data,refetch,isLoading} = useGetUser(user._id ,false,null,onError)
  const [isChanged,setIsChanged]=useState(false)
  
  const fileRef = useRef()
  
  const {mutate:update,isLoading:load} = useMutation(updateUserDetails,{
    onSuccess:data=>{
      if(data.message != 'Updated successfully')return
      dispatch({type:'CURRENT_USER',payload:data.editUser})
      push('/messenger')
    },
    onError:error=>showBoundary(error)
  })

  useEffect(()=>{
     refetch()
  },[]) 

  

  const handleInputFileClick = () => {
    fileRef.current.click();
  }; 

  const handleFilePick = (e) =>{
    if(!e.target.files.length)return
    setFile(e.target.files[0])
    const objectUrl = URL.createObjectURL(e.target.files[0])
    setPreview(objectUrl)
    setIsChanged(true)
  }

  const {
         handleSubmit,
         handleBlur,
         handleChange,
         values,touched,errors,dirty} = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: data?.name,
      lastName:data?.lastName,
      email:data?.email
    },
    onSubmit: (values) => {
      if(file){
        const formData = new FormData()
          
        for (const [key, value] of Object.entries(values)) {
          if(key != 'image')
          formData.append([key], value);
        }

        if(data?.image?.url)formData.append('removeImage',data.image.cloudinary_id)
        formData.append('userImage',file)

        return update({userId:data._id,body:formData})
      }
      console.log('Hree');
       update({userId:data._id,body:values})
    },
    validationSchema: yup.object({
      name: yup.string().trim().required('Name is required'),
      lastName: yup.string().trim().required('Lastname is required')
    }),
  });

const onModalClose = () =>{
  setIsChanged(false)
  setFile(null)
  setPreview(null)
}

  if(hasError){
   return onError()
  } 

  

  return (
    <section className={styles.userPageWrapper}> 
    <Head><title>{`${data?.name}'s page`}</title></Head>
     <article> 
      {isLoading?
      <section className='center'>
        <h2>Loading</h2>
        <Loader/>
      </section>:
      <section className={styles.mainUserPage} role='region'>
        <ReturnIcon onClick={()=>push('/messenger')}/>
        <header className={styles.userPageHeader} role='heading'>
        <h2>{data?.name}'s details</h2>
        </header>
        <main className={styles.formWrapper} role='form'>
          
          <form onSubmit={handleSubmit} className={styles.userPageForm}>
             <section className={styles.userImageWrapper}>
              <Image
              fill
              priority
              src={data?.image?.url?data.image.url:noAvatar}
              alt='user-image'
              style={{objectFit:'cover',borderRadius:'50%'}}
              sizes="(max-width: 368px) 100vw,
              (max-width: 300px) 50vw,33vw"
              placeholder={data?.image?.base64?'blur':'empty'}
              blurDataURL={data?.image?.base64?data?.image?.base64:null}/>
              <section className={styles.chooseImageWrapper}>
              <span className={styles.chooseImagePopup}>Choose image</span>
              <BsFillCameraFill onClick={handleInputFileClick}/>
              <Input
              type='file'
              name='image'
              className="invisibleFileInput"
              width={0}
              height={0}
              ref={fileRef}
              onChange={handleFilePick}/>
              </section>
            </section>
            <article className={styles.inputField}>
             <Input 
             type="text"
             name='name'
             placeholder='Name'
             textAlign
             fontSize='large'
             width={40}
             height={30}
             value={values.name || ''}
             onChange={handleChange}
             onBlur={handleBlur}/> 
             {touched.name&&errors.name ? <span>{errors.name}</span> : null}
             </article>
             <article className={styles.inputField}>
             <Input 
             type="text"
             name='lastName'
             placeholder='Lastname'
             textAlign
             fontSize='large'
             width={40}
             height={30}
             value={values.lastName || ''}
             onChange={handleChange}
             onBlur={handleBlur} />
             {touched.lastName&&errors.lastName ? <span>{errors.lastName}</span> : null}
             </article>
             <article className={styles.inputField}>
             <Input 
             type="text"
             name='email'
             placeholder='Email'
             textAlign
             fontSize='large'
             width={40}
             height={30}
             value={values.email || ''}
             disabled={true} />
             {touched.email&&errors.email ? <span>{errors.email}</span> : null}
             </article>
             <Button
             text={load?'Loading...':'Save'}
             className='secondaryBtn'
             disabled={!file && !dirty}
             width={12}
             header={15}
             type='submit'/>
          </form>
        </main>
        <Modal show={isChanged} onClose={onModalClose}>
          <section className={styles.imagePreview}>
          <Image
          src={preview}
          width={200}
          height={160}
          style={{objectFit:'contain',borderRadius:'5%'}}
          alt='preview'/>
          <Button
          className='secondaryBtn'
          text='This is the one'
          width={8}
          height={15}
          onClick={()=>setIsChanged(false)}/>
          </section>
        </Modal>
      </section>}
     </article>
    </section>
  )
} 

export async function getServerSideProps({req}){

  if(!req.headers.cookie){
    return{props:{hasError:true}}
  }
    const user = exctractCredentials(req)
    return{
      props:{user}
     }
}

export default UserPage