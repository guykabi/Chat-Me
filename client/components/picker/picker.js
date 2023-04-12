import React,{useState,useCallback,useMemo, useEffect} from 'react'
import styles from './picker.module.css'
import { BiSend } from "react-icons/bi";
import GroupPerson from "../group-person/groupPerson";
import Group from "../group/group";
import PickedConversation from "../pickedConversation/pickedConversation";
import PickedUser from "../pickedUser/pickedUser";
import {handleFilterCons} from '../../utils/utils'
import Input from '../UI/Input/Input';

 //Used globally to pick users/chats 
 const Picker = ({items,type,onChange,onFinalPick}) => {
 

  const [listOfPicked,setListOfPicked]=useState([])
  const [query,setQuery]=useState('') 

 useEffect(()=>{
  if(!onChange)return
    let picked = listOfPicked.map(l=>l._id)
    onChange(picked)
 },[listOfPicked])

  const handlePick = useCallback(
        (e) => {
          if (!e._id || listOfPicked.some((p) => p._id === e._id) ||
              listOfPicked.length === 4 && type === 'cons') return;
      
           setListOfPicked((prev) => [...prev, e]);
        },
        [listOfPicked]
      ); 
      
    const removePicked = useCallback(
        (picked) => {
          setListOfPicked((prev) =>
            prev.filter((u) => u._id !== picked._id)
          );
        },
        [listOfPicked]
      ); 


    const onFinal = () =>{
       let picked = listOfPicked.map(l=>l._id)
       onFinalPick(picked)
       setListOfPicked([])
     }

      
    const memoItems = useMemo(()=> items,[items,query])
    let allToPick;

    if(type==='cons'){
         allToPick = handleFilterCons(memoItems,query).map((con) => (
          <Group key={con._id} group={con} onPick={handlePick} />
      ))
    }
    if(type !== 'cons'){
     allToPick = memoItems
        ?.filter((u) =>
          u.name.toLowerCase().includes(query.trim().toLowerCase())
        )
        .map((user) => (
          <GroupPerson key={user._id} user={user} onPick={handlePick} />
        ))
    }    


const pickedItems = listOfPicked.map((item) => {
 return type==='cons' ?
 <PickedConversation key={item._id} con={item} onRemove={removePicked} />:
 <PickedUser key={item._id} user={item} onRemove={removePicked}/>
 });


const itemsToPick = (
  <section>
        {listOfPicked.length ? (
          <section className={styles.pickedItemsWrapper}>
            <header className={styles.pickedItems}>
              <span>{`(${pickedItems.length})`}</span>
              {pickedItems}
            </header>
            {!onChange?<span
              className={styles.forwardToBtn}
              role="button"
              aria-label="Forward to"
              onClick={onFinal}
            >
              <BiSend />
            </span>:null}
          </section>
        ) : null}

        {items.length ? (
          <section className={styles.searchInputWrapper}>
            <Input
              width="50"
              height="30"
              placeholder={type==='cons'?"Search a chat":'Search a user'}
              onChange={(e) => setQuery(e.target.value)}
            />
          </section>
        ) : null}

        <section className={items.length?styles.ListToPick:styles.noItems}>
          {items.length ? allToPick : <h3>Nothing to pick...</h3>}
        </section>
  </section>
)


  return (
    <>
       {itemsToPick}
    </>
  )
}

export default Picker