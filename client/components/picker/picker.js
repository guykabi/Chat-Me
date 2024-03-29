import React,{useState,useCallback,useMemo, useEffect} from 'react'
import styles from './picker.module.css'
import {useTranslation} from 'next-i18next'
import {useRouter} from 'next/router'
import { BiSend } from "react-icons/bi";
import {BiMailSend} from 'react-icons/bi'
import {BiSearchAlt} from 'react-icons/bi'
import GroupPerson from "../group-person/groupPerson";
import Group from "../group/group";
import PickedConversation from "../pickedConversation/pickedConversation";
import PickedUser from "../pickedUser/pickedUser";
import {handleFilterCons} from '../../utils/utils'
import Input from '../UI/Input/Input';
import {Loader} from '../UI/clipLoader/clipLoader'

 //Used globally to pick users/chats 
 const Picker = ({items,type,onChange,onFinalPick,isLoad}) => {
  const {locale} = useRouter()
  const dir = locale === 'he'?'rtl' : 'ltr'
  const {t} = useTranslation('common')
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

      
    const memoItems = useMemo(()=> items,[items])
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
              dir={dir}
              placeholder={type==='cons'?t("search-chat"):t('search-user')}
              onChange={(e) => setQuery(e.target.value)}
            />
            <p className={styles.searchIcon}>
               <BiSearchAlt/>
            </p>
          </section>
        ) : null}

        {!isLoad?
        <section className={items.length?styles.ListToPick:styles.noItems}>
          {items.length ? allToPick : <h3>Nothing to pick...</h3>}
        </section>:
        <section className={styles.pickerLoading}>
          <h3><BiMailSend size={60}/></h3>
          <Loader size={40}/>
        </section>}
  </section>
)


  return (
    <>
       {itemsToPick}
    </>
  )
}

export default Picker