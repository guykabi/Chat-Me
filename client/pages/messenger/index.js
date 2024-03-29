import React, { useEffect, useContext, useState } from "react";
import Head from 'next/head'
import {useRouter} from 'next/router'
import {useTranslation} from 'next-i18next'
import Mobile from "../../components/errors/mobile/mobile";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { Loader } from "../../components/UI/clipLoader/clipLoader";
import useClickOutside from '../../hooks/useClickOutside'
import { chatContext } from "../../context/chatContext";
import {FaRunning} from 'react-icons/fa'
import {BsChatDots} from 'react-icons/bs'
import styles from "./messenger.module.css";
import Chat from "../../components/chat/chat";
import Conversations from "../../components/conversations/conversations";
import Navbar from "../../components/navbar/navbar";
import OnlineList from "../../components/onlineList/online";
import { exctractCredentials, checkDevice} from "../../utils/utils";
import {getAllUsers} from '../../utils/apiUtils'
import { useGetUser } from "../../hooks/useUser";
import CreateGroup from "../../components/createGroup/createGroup";
import ReturnIcon from "../../components/UI/returnIcon/returnIcon";
import { useQuery } from "react-query"; 
import {useErrorBoundary} from 'react-error-boundary'


const Messenger = ({ hasError, user, isMobile }) => {
  const {locale} = useRouter()
  const dir = locale === 'he'?'rtl' : 'ltr'
  const {t} = useTranslation('common')
  const { currentUser, currentChat, Socket, dispatch } = useContext(chatContext);
  const {showBoundary} = useErrorBoundary()
  const { visibleRef, isVisible, setIsVisible } = useClickOutside(false)
  const [openCreateGroup, setOpenCreateGroup] = useState(false);
  const [isSorted,setIsSorted]=useState(true) 
 
  const onError = (error) => {showBoundary(error)};
  
  const { data, refetch } = useGetUser(user?._id,false,null,onError);
  
  const {refetch:fetchUsers} = useQuery(['users'],getAllUsers,{
    //For later use - example => identify user that left a group
    onError,
    enabled:false,
    refetchOnWindowFocus:false
  }) 

  useEffect(()=>{
     if(hasError) showBoundary(hasError)
     if(data?._id !== user?._id) refetch()
     if(currentUser || data?._id !== user?._id )return
     dispatch({ type: "CURRENT_USER", payload: data });
  },[data])

  useEffect(() => {
    if(hasError)return
    
    if (!currentUser) return;
    Socket?.emit("addUser", user._id);
    fetchUsers()

  }, [currentUser]); 

  
  useEffect(()=>{
    //Handling socket connection error
    if(!Socket)return
    Socket.on('connect_error',err=>{
     showBoundary(err)
    })
 },[Socket])
  
  const handleOpenCreateGroup = () => {
    setOpenCreateGroup(true);
    setIsVisible(false);
  };

  const handleCloseCreateGroup = () => {
    setOpenCreateGroup(false);
    setIsVisible(false);
  }; 

  if(isMobile){
    return(
      <Mobile/>
    )
  }


  return (
    <>
      {!hasError && currentUser ? (
        <section className={styles.messangerWrapper}>
          <Head>
            <title>Chat-Me</title>
            <link
             rel="icon"
             href="/favicon.ico"
             type="image/<generated>"
             sizes="<generated>"
            />
            </Head>
          <header className={styles.navbarWrapper}>
          <Navbar 
          placeholder={t('placeholders.navbarSearch')} 
          personal={t('sideMenu.private')}
          logout={t('sideMenu.logout')}
          dir={dir}/>
          </header>
          <main className={styles.innerWrapper}>
            <div
              className={
                openCreateGroup
                  ? styles.createGroupsWrapper
                  : styles.conversationsWrapper
              }
            >
              {openCreateGroup?
              <ReturnIcon onClick={handleCloseCreateGroup}/>
              :<span
                className="threeDots"
                role="button"
                title="Menu"
                onClick={() => setIsVisible(!isVisible)}
              ></span>}

              {isVisible && (
                <div className={styles.popupMenuConversations} ref={visibleRef}>
                  <div onClick={handleOpenCreateGroup} role="button">
                    {t('conversationsOptions.createGroup')}
                  </div>
                  <div onClick={()=>setIsSorted(!isSorted)} role="button">
                    {isSorted?
                    t('conversationsOptions.sortUnseen'):
                    t('conversationsOptions.sortLatest') }
                  </div>
                </div>
              )}

              {openCreateGroup ? (
                <article>
                  <CreateGroup 
                  onSwitch={handleCloseCreateGroup}
                  title={t("createGroup.title")}
                  placeholder={t("createGroup.placeholder")}
                  button={t('createGroup.button')} />
                </article>
              ) : (
                <article>
                  <h2>{t('conversations')}</h2>
                  <br />
                  <Conversations 
                  sortBy={isSorted} 
                  placeholder={t('search-chat')} 
                  dir={dir} />
                </article>
              )}
            </div>

            <div className={styles.chatWrapper}>
              {currentChat ? (
                <Chat />
              ) : (
                <div className={styles.noChatDiv}>
                  {t('placeholders.noChat')}
                </div>
              )}
            </div>

            <div className={styles.onlineWrapper}>
              <h2>{t('online')}</h2>
              <br />
              <OnlineList/>
            </div>
          </main>
        </section>
      ) : (
        <section className={styles.mainMessengerLoading}>
          <div className={styles.innerLoadingWrapper}>
           <h2>Loading your chats...</h2>
           <Loader size={50}/><br/>
           <div className={styles.iconsWrapper}>
           <FaRunning/>
           ...
           <BsChatDots/>
           </div>
          </div>
        </section>
      )}
    </>
  );
};

export async function getServerSideProps({ req,locale }) {

  let isMobile = checkDevice(req.headers['user-agent'])

  if(isMobile) return {props : {isMobile : 'mobile'}} 
 
 
  const user = exctractCredentials(req);
  if (user === "No cookie" || user === "No token")  
       return { props: { hasError: user } }

  return {
    props: { user, 
      ...(await serverSideTranslations(locale, ['common'])) }
  };
}

export default  Messenger;
