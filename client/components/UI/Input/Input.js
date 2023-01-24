import React from 'react' 
import styles from './Input.module.css'

const Input = ({placeholder,onChange,type,value,name,require}) => {
  return (
    <div className={styles.inputWrapper}>
          <input
          autoComplete="off"
          className={styles.inputStyle}
          type={type}
          required={require}
          name={name}
          value={value}
          placeholder={placeholder}
          onChange={onChange}/>
    </div>
  )
}

export default Input