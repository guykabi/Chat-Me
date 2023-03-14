import React, { useEffect, useContext, useState } from "react";
import Head from 'next/head'
import { chatContext } from "../../context/chatContext";
import styles from "./messenger.module.css";
import Chat from "../../components/chat/chat";
import Conversations from "../../components/conversations/conversations";
import Navbar from "../../components/navbar/navbar";
import OnlineList from "../../components/onlineList/online";
import { exctractCredentials, onError } from "../../utils/utils";
import { useGetUser } from "../../hooks/useUser";
import CreateGroup from "../../components/createGroup/createGroup";
import ReturnIcon from "../../components/UI/returnIcon/returnIcon";

const Messenger = ({ hasError, user }) => {
  const { currentUser, currentChat, Socket, dispatch } =
    useContext(chatContext);
  const { data, error , isLoading } = useGetUser(user._id);

  const [openMenu, setOpenMenu] = useState(false);
  const [openCreateGroup, setOpenCreateGroup] = useState(false);

  useEffect(() => {
    if (!currentUser && data) {
      dispatch({ type: "CURRENT_USER", payload: data });
    }

    if (!currentUser) return;
    Socket?.emit("addUser", user._id);
  }, [data, currentUser]);

  const handleOpenCreateGroup = () => {
    setOpenCreateGroup(true);
    setOpenMenu(false);
  };

  const handleCloseCreateGroup = () => {
    setOpenCreateGroup(false);
    setOpenMenu(false);
  }; 

  if(isLoading){
    return(
      <div className='center'>
        <h2>Loading...</h2>
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
                onClick={() => setOpenMenu(!openMenu)}
              ></span>}

              {openMenu && (
                <div className={styles.popupMenuConversations}>
                  <div onClick={handleOpenCreateGroup} role="button">
                    Create group
                  </div>
                  <div role="button">
                    Sort by:
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
                  <Conversations />
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
