import React,{forwardRef, useEffect, useState} from 'react' 
import styles from './Input.module.css'

const Input = forwardRef((props,ref) => {
const [acceptedFormats,setAcceptedFormats]=useState(null)
const {
  placeholder,
  onChange,
  onBlur,
  type,
  value,
  dir,
  name,
  require,
  defaultValue,
  width,
  height,
  textAlign,
  fontSize,
  fontWeight,
  disabled,
  newMessageInput} = props 
  
useEffect(()=>{
if(type === 'file'){
  if(newMessageInput){
    return setAcceptedFormats('image/*, video/*')
  }
  setAcceptedFormats('image/*')
}
},[])

  return (
    <>
   
          <input
          style={{
            height:`${height}px`,
            width:`${width}%`,
            textAlign,
            fontSize,fontWeight}}

          autoComplete="new-password"
          className={styles.inputStyle}
          type={type}
          required={require}
          dir={dir}
          disabled={disabled}
          name={name}
          ref={ref}
          accept={acceptedFormats}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          onChange={onChange}
          onBlur={onBlur}/>
          
    </>
  )
})

Input.displayName = "Input"
export default Input