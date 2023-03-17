import React from 'react' 
import styles from './Input.module.css'

const Input = (props) => {

const {
  placeholder,
  onChange,
  type,
  value,
  name,
  require,
  defaultValue,
  width,
  height,
  textAlign,
  fontSize,
  fontWeight,
  disabled} = props

  return (
    <>
   
          <input
          style={{
            height:`${height}px`,
            width:`${width}%`,
            textAlign,
            fontSize,fontWeight}}

          autoComplete="off"
          className={styles.inputStyle}
          type={type}
          required={require}
          disabled={disabled}
          name={name}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          onChange={onChange}/>
          
    </>
  )
}

export default Input