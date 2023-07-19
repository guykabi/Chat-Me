# Chat-Me

Chat platform for private and groups chatting

## Description

Chat-Me is a chat web-app designed for desktop operating, enabling corresponding
with unlimited users and groups in fast and seamlessly way.

## Preview

<img width="959" alt="צילום מסך 2023-06-29 151751" src="https://github.com/guykabi/Chat-Me/assets/99081637/7cb26e2b-8a0d-4bd5-96aa-d7d6a322d03a">

## Stack

### Frontend - React using Nextjs

Nextjs is a powerfull react framework which enhance React's capabilities:

- Server-Side-Rendering(SSR) to get as quick as possible the data to the user and sagnifitly improving the user experience
- Built in Image element to a smarter and more efficient loading and usages of files, images and videos. (Viewport)
- Sending files, images and videos within a seconds is made possible thanks to **Cloudinary**'s capabilities both in front and back

### Backend - Node.js, Express and MongoDB-Atlas

Node.js combined with Express.js offers fast and simplified http responses and easy scalability when needed.
MongoDB on Atlas cloud as a NoSQL database supply easy and flexible storage source

### Socket server - Socket.IO (Node.js)

Dividing the Chat-Me app to two separtes Http and Socket server helpes to achieve faster and stronger backend, that can support many requests

### Docker and AWS EC2

- Packaging any app with Docker makes the process of building and deploying much easier no matter from where and when, especially when handling with several services like on Chat-Me
- EC2 service of Amazon cloud was an easy choice for hosting the app as a reliable,secure,affordable service that integrates perfectly with dockerized apps using services like AWS ECR to contain docker images
