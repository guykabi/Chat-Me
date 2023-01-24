import React from 'react'
import '../styles/globals.css'
import { ChatContextProvider } from '../context/chatContext'
import {QueryClient,QueryClientProvider} from 'react-query'

export default function App({ Component, pageProps }) { 


  const [queryClient] = React.useState(() => new QueryClient());
  return <ChatContextProvider>
           <QueryClientProvider client={queryClient}>
             <Component {...pageProps} />
           </QueryClientProvider>
         </ChatContextProvider>     
}
