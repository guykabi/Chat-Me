import React, { useEffect, useContext, useState } from "react";
import Head from 'next/head'
import { Loader } from "../../components/UI/clipLoader/clipLoader";
import useClickOutside from '../../hooks/useClickOutside'
import { chatContext } from "../../context/chatContext";
import styles from "./messenger.module.css";
import Chat from "../../components/chat/chat";
import Conversations from "../../components/conversations/conversations";
import Navbar from "../../components/navbar/navbar";
import OnlineList from "../../components/onlineList/online";
import { exctractCredentials, onError } from "../../utils/utils";
import {getAllusers} from '../../utils/apiUtils'
import { useGetUser } from "../../hooks/useUser";
import CreateGroup from "../../components/createGroup/createGroup";
import ReturnIcon from "../../components/UI/returnIcon/returnIcon";
import { useQuery } from "react-query";

const Messenger = ({ hasError, user }) => {
  const { currentUser, currentChat, Socket, dispatch } =
    useContext(chatContext);
  const { data,error,isLoading } = useGetUser(user._id);
  const { visibleRef, isVisible, setIsVisible } = useClickOutside(false)
  const [openCreateGroup, setOpenCreateGroup] = useState(false);
  const [isSorted,setIsSorted]=useState(true) 
 
  const {refetch} = useQuery(['users'],getAllusers,{
    //For later use - example => identify user that left group
    //Only fetching once 
    staleTime:Infinity
  })

  useEffect(() => {
    if (!currentUser && data) {
      dispatch({ type: "CURRENT_USER", payload: data });
    }

    if (!currentUser) return;
    Socket?.emit("addUser", user._id);
    refetch()
  }, [data, currentUser]); 

 
  
  const handleOpenCreateGroup = () => {
    setOpenCreateGroup(true);
    setIsVisible(false);
  };

  const handleCloseCreateGroup = () => {
    setOpenCreateGroup(false);
    setIsVisible(false);
  }; 

  if(isLoading){
    return(
      <div className='center'>
        <h2>Loading...</h2>
        <Loader/>
      </div>
    )
  }

  if (hasError || error) {
    if (error) return onError("Connection problem...");

    //When no token provided
    return onError();
  }

  return (
    <>
      {currentUser ? (
        <section className={styles.messangerWrapper}>
          <Head><title>Chat Me</title></Head>
          <Navbar />
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
                    Create group
                  </div>
                  <div onClick={()=>setIsSorted(!isSorted)} role="button">
                    {isSorted?'Sort by unseen':'Sort by latest' }
                  </div>
                </div>
              )}

              {openCreateGroup ? (
                <article>
                  <CreateGroup onSwitch={handleCloseCreateGroup} />
                </article>
              ) : (
                <article>
                  <h2>Conversations</h2>
                  <br />
                  <Conversations sortBy={isSorted} />
                </article>
              )}
            </div>

            <div className={styles.chatWrapper}>
              {currentChat ? (
                <Chat />
              ) : (
                <div className={styles.noChatDiv}>
                  Open chat to start talk...
                </div>
              )}
            </div>

            <div className={styles.onlineWrapper}>
              <h2>Online</h2>
              <br />
              <OnlineList />
            </div>
          </main>
        </section>
      ) : (
        <section className="center">
          <h2>Loading...</h2>
        </section>
      )}
    </>
  );
};

export async function getServerSideProps({ req }) {
  if (!req.headers.cookie) {
    return { props: { hasError: true } };
  }
  const user = exctractCredentials(req);

  return {
    props: { user },
  };
}

export default Messenger;
