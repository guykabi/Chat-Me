/** @type {import('next').NextConfig} */



const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ["he","en"],
    defaultLocale: "he",
},
images:{
    domains:['res.cloudinary.com']
}
}

module.exports = nextConfig
