import {createContext,useEffect,useReducer} from 'react'
import {io} from 'socket.io-client'


export const chatContext = createContext() 

export const chatReducer = (state,action)=>{
    switch (action.type){
        case 'CURRENT_USER':
            return {...state,currentUser:action.payload}  

        case 'CURRENT_CHAT':
            return {...state,currentChat:action.payload} 

        case 'SOCKET':
            return {...state,Socket:action.payload} 
        default :
          return state
      } 
    
}  


export const ChatContextProvider = ({children})=>{
    const [state,dispatch]=useReducer(chatReducer,{
    currentUser:null,
    currentChat:null,
    Socket:null
   }) 

useEffect(()=>{
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL) 
    socket.on('connection')
    dispatch({type:'SOCKET',payload:socket})
    return ()=> socket.close()
},[])


   console.log("Chat state:",state)
   return(
    <chatContext.Provider value={{...state,dispatch}}>
       {children}
    </chatContext.Provider>
   )
}

