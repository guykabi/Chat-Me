import React from 'react'
import '../styles/globals.css'
import { ChatContextProvider } from '../context/chatContext'
import {QueryClient,QueryClientProvider} from 'react-query'
import {ErrorBoundary} from 'react-error-boundary'
import ErrorFallBack from '../components/error/error'
import { appWithTranslation } from 'next-i18next'


const App = ({ Component, pageProps })=> { 


  const [queryClient] = React.useState(() => new QueryClient());
  return <ChatContextProvider>
          <ErrorBoundary FallbackComponent={ErrorFallBack}>
            <QueryClientProvider client={queryClient}>
              <Component {...pageProps} />
            </QueryClientProvider>
           </ErrorBoundary>
         </ChatContextProvider>     
}

export default appWithTranslation(App)
