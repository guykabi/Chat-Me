import {ClipLoader} from 'react-spinners' 

export const Loader = ({size=25})=>{

   return( <ClipLoader
        color='gray'
        size={size}
        aria-label="Loading Spinner"
        data-testid="loader"
    />)
} 