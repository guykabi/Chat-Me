import {ClipLoader} from 'react-spinners' 

export const Loader = ()=>{

   return( <ClipLoader
        color='gray'
        size={25}
        aria-label="Loading Spinner"
        data-testid="loader"
    />)
} 