import {ClipLoader} from 'react-spinners' 

export const Loader = ({size=25,color='gray'})=>{

   return( <ClipLoader
        color={color}
        size={size}
        aria-label="Loading Spinner"
        data-testid="loader"
    />)
} 