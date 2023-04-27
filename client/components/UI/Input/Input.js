import React,{forwardRef} from 'react' 
import styles from './Input.module.css'

const Input = forwardRef((props,ref) => {

const {
  placeholder,
  onChange,
  onBlur,
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

          autoComplete="new-password"
          className={styles.inputStyle}
          type={type}
          required={require}
          disabled={disabled}
          name={name}
          ref={ref}
          accept={type==='file'?"image/*":null}
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