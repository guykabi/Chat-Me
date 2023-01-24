import {createContext,useReducer} from 'react'

export const chatContext = createContext() 

export const chatReducer = (state,action)=>{
    switch (action.type){
        case 'CURRENT_USER':
            return {...state,currentUser:action.payload}  
        case 'CURRENT_CHAT':
            return {...state,currentChat:action.payload}  
        default :
          return state
      } 
    
}  


export const ChatContextProvider = ({children})=>{
    const [state,dispatch]=useReducer(chatReducer,{
    currentUser:null,
    currentChat:null
   })
   console.log("Chat state:",state)
   return(
    <chatContext.Provider value={{...state,dispatch}}>
       {children}
    </chatContext.Provider>
   )
}

