import React, { useState, useContext, useEffect } from "react";
import styles from "./createGroup.module.css";
import { useMutation, useQuery } from "react-query";
import { createGroup } from "../../utils/apiUtils";
import { chatContext } from "../../context/chatContext";
import Input from "../UI/Input/Input";
import Button from "../UI/Button/button";
import { useGetCacheQuery } from "../../hooks/useGetQuery";
import {useErrorBoundary} from 'react-error-boundary'
import Picker from "../picker/picker";

const CreateGroup = ({ onSwitch,title,placeholder,button }) => {
  const { currentUser, Socket } = useContext(chatContext);
  const {showBoundary} = useErrorBoundary()
  const [allUsers, setAllUsers] = useState([]);
  const [groupName, setGroupName] = useState(null);
  const [pickedUsers, setPickedUsers] = useState([]);
  const users = useGetCacheQuery("users");

  const { mutate: addGroup } = useMutation(createGroup, {
    onSuccess: (data) => {
      if (data.message !== "New conversation made") return;
      setGroupName(null);
      setPickedUsers([]);
      Socket.emit("new-conversation", data.conversation);
      onSwitch();
    },
    onError:error=>showBoundary(error)
  });

  useEffect(() => {
    let filteredUsers = users.filter((u) => u._id !== currentUser._id);
    setAllUsers(filteredUsers);
  }, []);

  const addPickedUsers = (e) => {
    setPickedUsers(e);
  };

  const handleGroupSubmit = (e) => {
    e.preventDefault();

    if (!pickedUsers.length) return;
    let group = {};
    group.chatName = groupName;
    group.participants = pickedUsers;
    group.participants.unshift(currentUser._id);
    group.manager = currentUser._id;

    addGroup(group);
  };

  return (
    <section className={styles.createGroupMainSection}>
      <h2 aria-label="Create a group">{title}</h2>
      <section>
        <form className={styles.newGroupForm} onSubmit={handleGroupSubmit}>
          <div className={styles.groupNameInputWrapper}>
            <Input
              placeholder={placeholder}
              aria-label='Insert a group name'
              width={100}
              height={15}
              required
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
          <br />
          <section className={styles.pickerWrapper}>
            <Picker items={allUsers} type="users" onChange={addPickedUsers} />
          </section>
          <br />
          <br />

          <Button
            className={"primaryBtn"}
            width={15}
            height={25}
            text={button}
            arialable="Create group button"
            type="submit"
          />
        </form>
      </section>
    </section>
  );
};

export default CreateGroup;
