/** @type {import('next').NextConfig} */



const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ["he","en"],
    defaultLocale: "en",
},
images:{
    domains:['res.cloudinary.com']
 },
 compiler: {
  // Enables the styled-components SWC transform
  styledComponents: true
}
}

module.exports = nextConfig
