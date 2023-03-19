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
    arialable} = props

  return (

    <button
    className={styles[className]}
    style={{
    width:`${width}rem`,
    height:`${height}px`}}
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