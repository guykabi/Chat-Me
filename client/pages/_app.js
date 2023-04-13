import React from 'react'
import '../styles/globals.css'
import { ChatContextProvider } from '../context/chatContext'
import {QueryClient,QueryClientProvider} from 'react-query'
import {ErrorBoundary} from 'react-error-boundary'
import ErrorFallBack from '../components/error/error'

export default function App({ Component, pageProps }) { 


  const [queryClient] = React.useState(() => new QueryClient());
  return <ChatContextProvider>
          <ErrorBoundary FallbackComponent={ErrorFallBack}>
            <QueryClientProvider client={queryClient}>
              <Component {...pageProps} />
            </QueryClientProvider>
           </ErrorBoundary>
         </ChatContextProvider>     
}
