import React, { useState } from 'react'
import styles from './button.module.css'


const Button = (props) => {

  const {
    className,
    text,
    width,
    height,
    type,
    onClick,
    disabled,
    fontWeight,
    arialable} = props

  return (

    <button
    className={disabled?styles.disabledStyle:styles[className]}
    style={{
    width:`${width}rem`,
    height:`${height}px`,
    fontWeight:`${fontWeight}`}}
    onClick={onClick}
    aria-label={arialable}
    type={type}
    disabled={disabled}
    >
    {text}
   </button>

  )
}

export default Button