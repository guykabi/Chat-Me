import {createContext,useEffect,useReducer} from 'react'
import {io} from 'socket.io-client'

const sockerPath = process.env.NODE_ENV === 'production' ?
    process.env.NEXT_PUBLIC_SOCKET_URL_PROD:
    process.env.NEXT_PUBLIC_SOCKET_URL


export const chatContext = createContext() 

export const chatReducer = (state,action)=>{
    switch (action.type){

        case 'CURRENT_USER':
            return {...state,currentUser:action.payload}  

        case 'USER_FIELD':
            let user = {...state.currentUser}    
            for (const [key, value] of Object.entries(action.payload)) {
                user[key] = value
             } 
            return {...state,currentUser:user}

        case 'CURRENT_CHAT':
            return {...state,currentChat:action.payload} 

        case 'CHAT_FIELD':
            let chat = {...state.currentChat}    
            for (const [key, value] of Object.entries(action.payload)) {
                    chat[key] = value
             } 
            return {...state,currentChat:chat}

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
    const socket = io(sockerPath,{
        path:'/socket'
    }) 
    socket.on('connection')
    dispatch({type:'SOCKET',payload:socket})
    return ()=> socket.close()
},[])

   return(
    <chatContext.Provider value={{...state,dispatch}}>
       {children}
    </chatContext.Provider>
   )
}

