const {i18n} = require('./next-i18next.config')


/** @type {import('next').NextConfig} */


const nextConfig = {
  reactStrictMode: true,
  i18n,
  images:{
    domains:['res.cloudinary.com']
  },
  compiler: {
   // Enables the styled-components SWC transform
   styledComponents: true
  },
  output:'standalone'
}

module.exports = nextConfig
