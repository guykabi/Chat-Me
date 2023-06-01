import React,{useState,useContext,useMemo,useCallback} from 'react'
import styles from './mainContent.module.css'
import { chatContext } from '../../../context/chatContext';
import {useTranslation} from 'next-i18next'
import {useMutation} from 'react-query'
import Button from '../../UI/Button/button';
import Modal from '../../Modal/modal';
import Picker from '../../picker/picker';
import Group from '../../group/group';
import GroupPerson from '../../group-person/groupPerson';
import { useGetCacheQuery } from "../../../hooks/useGetQuery";
import { useErrorBoundary } from "react-error-boundary";
import { handleToast } from "../../../utils/utils";
import {deleteConversation,addGroupMember,
    removeGroupMember,addManager,removeManager} from "../../../utils/apiUtils";


const MainContent = ({isGroup}) => {

    const { currentChat, currentUser, Socket, dispatch } = useContext(chatContext);
    const { showBoundary } = useErrorBoundary();
    const {t} = useTranslation('common')
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const users = useGetCacheQuery("users");


    const { mutate: addMember } = useMutation(addGroupMember, {
        onSuccess: ({ message, conversation }) => {
          if (message !== "Member added") return;

          let editCon = {...currentChat}
          editCon.participants = conversation.participants

          Socket.emit("new-conversation", editCon);
          setShowAddMemberModal(false)
          dispatch({ type: "CHAT_FIELD", payload: conversation });
        },
        onError: () => {
            handleToast('error','Unabled to add')
          },
      });

      const { mutate: removeMember } = useMutation(removeGroupMember, {
        onSuccess: ({ message, conversation }) => {
          if (message !== "Member removed") return;
          Socket.emit("new-conversation", conversation);
          dispatch({ type: "CURRENT_CHAT", payload: conversation });
        },
        onError: (error) => showBoundary(error),
      });
    
      const { mutate: setManager } = useMutation(addManager, {
        onSuccess: ({ message, conversation }) => {
          if (message !== "Manager added") return;

          let editCon = {...currentChat}
          editCon.manager = conversation.manager

          Socket.emit("new-conversation", editCon);
          dispatch({ type: "CHAT_FIELD", payload: conversation });
        },
        onError: (error) => showBoundary(error),
      });
    
      const { mutate: managerRemoval } = useMutation(removeManager, {
        onSuccess: ({ message, conversation }) => {
          if (message !== "Manager removed") return;

          let editCon = {...currentChat}
          editCon.manager = conversation.manager

          Socket.emit("new-conversation", editCon);
          dispatch({ type: "CHAT_FIELD", payload: conversation });
        },
        onError: (error) => showBoundary(error),
      }); 
    
      const { mutate: removeConversation } = useMutation(deleteConversation, {
        onSuccess: (data) => {
          if (data.message !== "Conversation deleted!") return;
          const { conId, message } = data;
          Socket.emit("new-conversation", { message, conId });
          dispatch({type:'CURRENT_CHAT',payload:null})
        },
        onError: (error) => showBoundary(error),
      });
    

    const handleOpenAddMembers = () => {
        if (allUsers.length) return setShowAddMemberModal(true);
    
        let chatMembersIds = currentChat.participants.map((p) => p._id);
        let filteredData = users.filter((u) => !chatMembersIds.includes(u._id));
        setAllUsers(filteredData);
        setShowAddMemberModal(true);
      };

    const handleAddMembersModalClose = () => {
        setShowAddMemberModal(false);
      }; 

    const handleMemberAdding = useCallback(
        (e) => {
          let obj = { participant: e[0] };
          addMember({ conId: currentChat._id, obj });
      },[currentChat]); 

    const handleMemberRemoval = useCallback(
        (e) => {
          let obj;
    
          if (typeof e !== "string" && currentChat.participants.length > 1) {
            //When the only manager wants to leave the group -
            //Sets a random member of the group as manager
            if (
              currentChat.manager.length === 1 &&
              currentChat.manager[0]._id === currentUser._id
            ) {
              let setAsManager = currentChat.participants.find(
                (p) => p._id !== currentUser._id
              );
              let obj = { manager: setAsManager._id };
              setManager({ conId: currentChat._id, obj });
            }
    
            let obj = { participant: currentUser._id };
            removeMember({ conId: currentChat._id, obj });
            return;
          } 
          
          //When last member wants to leave - delete chat
          if(currentChat.participants.length === 1){
             removeConversation(currentChat._id)
             return
           }
    
          obj = { participant: e };
          removeMember({ conId: currentChat._id, obj });
        },
        [currentChat]
      );

      const handleManagerAdding = useCallback(
        (e) => {
          let obj = { manager: e };
          setManager({ conId: currentChat._id, obj });
        },
        [currentChat]);
    
      const handleManagerRemoval = useCallback(
        (e) => {
          let obj = { manager: e };
          managerRemoval({ conId: currentChat._id, obj });
        },
        [currentChat]);
    
    

    const memoItems = useMemo(() => {
        if (currentChat?.chatName) {
          return currentChat.participants;
        }
      }, [currentChat]);

      let groupMembers;
      if (currentChat?.chatName) {
        groupMembers = memoItems?.map((user) => (
          <GroupPerson
            key={user._id}
            user={user}
            onRemove={handleMemberRemoval}
            onAddManager={handleManagerAdding}
            onRemoveManager={handleManagerRemoval}
            manager={currentChat?.manager.some((m) => m._id === user._id)}
          />
        ));
      }
    
      let jointGroups;
      if (currentChat?.friend) {
        jointGroups = currentChat?.jointGroups
        ?.map((con) => <Group key={con._id} group={con} />);
      }

  return (
    <>
       {isGroup ? (
            <>
              <section className={styles.groupMembers}>{groupMembers}</section>
              <section className={styles.buttonsWrapper}>
                <Button
                  width="8"
                  height="25"
                  text={t("chatDetails.buttons.leaveGroup")}
                  className="secondaryBtn"
                  onClick={handleMemberRemoval}
                />
                <Button
                  width="8"
                  height="25"
                  text={t("chatDetails.buttons.addMember")}
                  //Only manager can add
                  disabled={
                    !currentChat?.manager.some((m) => m._id === currentUser._id)
                  }
                  className="secondaryBtn"
                  onClick={handleOpenAddMembers}
                />
              </section>
            </>
          ) : (
            <>
              <h3>
                {`Joint groups with ${currentChat?.friend?.name} - (${jointGroups?.length||0})`}
              </h3>
              <section className={styles.jointGroupsWrapper}>
                {jointGroups?.length ? (
                  jointGroups
                ) : (
                  <h3>No common groups yet...</h3>
                )}
              </section>
            </>
          )}
          
          <Modal
          show={showAddMemberModal}
          onClose={handleAddMembersModalClose}
          >
            <Picker
            items={allUsers}
            type="users"
            onFinalPick={handleMemberAdding}
            />
         </Modal>
    </>
  )
}

export default MainContent