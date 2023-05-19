import React from 'react'
import '../styles/globals.css'
import { ChatContextProvider } from '../context/chatContext'
import {QueryClient,QueryClientProvider} from 'react-query'
import {ErrorBoundary} from 'react-error-boundary'
import ErrorFallBack from '../components/errors/error/error'
import { appWithTranslation } from 'next-i18next'
import { GoogleOAuthProvider } from '@react-oauth/google';



const App = ({ Component, pageProps })=> { 

  const [queryClient] = React.useState(() => new QueryClient());
  return <ChatContextProvider>
         <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_ID}>
          <ErrorBoundary FallbackComponent={ErrorFallBack}>
            <QueryClientProvider client={queryClient}>
              <Component {...pageProps} />
            </QueryClientProvider>
           </ErrorBoundary>
          </GoogleOAuthProvider>
         </ChatContextProvider>     
}

export default appWithTranslation(App)
