import React, {
  useState,useContext,
  memo,useMemo,
  useEffect,useCallback,
} from "react";
import styles from "./navbar.module.css";
import Image from "next/image";
import noAvatar from "../../public/images/no-avatar.png";
import { GrLanguage } from "react-icons/gr";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useRouter } from "next/router";
import { logOut, searchUser } from "../../utils/apiUtils";
import useClickOutSide from "../../hooks/useClickOutside";
import { useErrorBoundary } from "react-error-boundary";
import { useQuery, useMutation } from "react-query";
import { chatContext } from "../../context/chatContext";
import Person from "../person/person";
import { Loader } from "../UI/clipLoader/clipLoader";
import Notification from "../notification/notification";
import NotificationIcon from "../UI/notificationIcon/notificationIcon";
import { useGetUser } from "../../hooks/useUser";


const Navbar = ({ placeholder, dir,personal,logout }) => {
  const { currentUser, Socket, dispatch } = useContext(chatContext);
  const { locales, push } = useRouter();
  const { showBoundary } = useErrorBoundary();
  const { visibleRef, isVisible, setIsVisible } = useClickOutSide(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchedUser, setSearchedUser] = useState();
  const [allUsers, setAllUsers] = useState(null);
  const [noUserFound, setNoUserFound] = useState(false);
  const [notifications, setNotifications] = useState();
  const [numOfNotifications, setNumOfNotifications] = useState(0);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  

  const { mutate: search, isLoading } = useMutation(searchUser, {
    onSuccess: (data) => {
      if (!data.length) {
        setAllUsers(null);
        setNoUserFound(true);
        return;
      }
      setAllUsers(data);
    },
    onError: (error) => showBoundary(error),
  });

  const onSuccess = () => {
    if (!currentUser) return;
    dispatch({ type: "CURRENT_USER", payload: data });
  };

  const { data, refetch: getUserData } = useGetUser(
    currentUser?._id,
    false,
    onSuccess
  );

  const { refetch:disconnect } = useQuery(["logout"], logOut, {
    onSuccess: (data) => {
      if (data.message === "User logged out successfully") {
        Socket.close();
        dispatch({ type: "CURRENT_USER", payload: null }), push("/login");
      }
    },
    onError: (error) => showBoundary(error),
    enabled: false,
  });

  useEffect(() => {
    setNotifications(currentUser.notifications);
    setNumOfNotifications(currentUser.notifications.length);
  }, []);

  useEffect(() => {
    if (noUserFound) setNoUserFound(false);

    if (!searchedUser) {
      setAllUsers(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true); //To show all the search results
    let obj = { userName: searchedUser, userId: currentUser._id };
    const timer = setTimeout(() => {
      search(obj);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchedUser]);

  useEffect(() => {
    const eventHandler = (data) => {
      getUserData();
      //Removing the friendship request notification
      if (data.message === "Request has been removed!") {
        let filteredNotifications = notifications.filter(
          (noti) => noti.sender === data.sender
        );

        setNotifications(filteredNotifications);

        if (numOfNotifications < 1) return;
        setNumOfNotifications((prev) => (prev -= 1));

        return;
      }

      if (data.message === "The Friend approval has been done") {
        data.message = "approved your friend request";
        setNotifications((prev) => [...prev, data]);
        setNumOfNotifications((prev) => (prev += 1));
      }

      if (data.message !== "Friend request") return;
      setNotifications((prev) => [...prev, data]);
      setNumOfNotifications((prev) => (prev += 1));
    };

    Socket?.on("incoming-notification", eventHandler);
    return () => Socket?.off("incoming-notification", eventHandler);
  }, [Socket, notifications, currentUser]);

  const serachInputOnFocus = () => {
    getUserData();

    if (!searchedUser) return;
    setIsSearching(true);
    let obj = { userName: searchedUser, userId: currentUser._id };
    search(obj);
  };

  const serachInputOnBlur = () => {
    setIsSearching(false);
    getUserData();
  };

  const handleLanguageMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseLanguageMenu = () => {
    setAnchorEl(null);
  }; 

  const handleLocaleChoose = (l) =>{
    document.cookie = `NEXT_LOCALE=${l}; max-age=3153876000;`
    push("/", undefined, { locale: l })
  }

  const handleNotification = () => {
    setOpenNotifications(!openNotifications);
    if (numOfNotifications > 0) setNumOfNotifications(0);

    if (openNotifications) {
      //If there 'approved request' notification (unsaved/temporary)
      let unSavedNotifications = notifications.filter(
        (n) => n.message !== "approved your friend request"
      );

      setNotifications(unSavedNotifications);
    }
  };

  const decreaseNotify = useCallback(() => {
    let filteredNotifications = notifications.filter(
      (noti) => noti.sender === data.sender
    );
    setNotifications(filteredNotifications);

    if (numOfNotifications < 1) return;
    setNumOfNotifications((prev) => (prev -= 1));
  }, [notifications, numOfNotifications]);

  const handleSideMenu = () => {
    setIsVisible(prev => !prev);
    if (!openNotifications) return;

    let unSavedNotifications = notifications.filter(
      (n) => n.message !== "approved your friend request"
    );
    setNotifications(unSavedNotifications);

    setNumOfNotifications(0);
    setOpenNotifications(false);
  };

  const handlePrivate = () =>{
    setIsVisible(prev => !prev)
     push("messenger/userPage")
  } 

  const memoUsers = useMemo(
    () =>
      allUsers
        ?.filter((user) => user._id !== currentUser._id)
        ?.map((user) => (
          <Person key={user._id} user={user} decreaseNotify={decreaseNotify} />
        )),
    [allUsers, currentUser]
  );

  const notis = notifications?.map((notif, index) => (
    <Notification
      key={index}
      notification={notif}
      decreaseNotify={decreaseNotify}
    />
  ));

  return (
    <nav className={styles.mainNav}>
      <div className={styles.logo} role="banner">
        Chat-Me
      </div>

      <div className={styles.searchInput}>
        <input
          type="text"
          dir={dir}
          placeholder={placeholder}
          aria-label="Search a new friend to chat with"
          onFocus={serachInputOnFocus}
          onChange={(e) => setSearchedUser(e.target.value)}
          onBlur={serachInputOnBlur}
        />

        {isSearching && (
          <div className={styles.foundPersons}>
            {noUserFound ? (
              <div className={styles.userSearchErrorMsg}>User not found...</div>
            ) : isLoading ? (
              <div className={styles.userSearchErrorMsg}>
                Searching... <br />
                <Loader size={15} />
              </div>
            ) : (
              memoUsers
            )}
          </div>
        )}
      </div>

      <div 
      className={styles.translateMenu}
      aria-label="translate">
        <Button
          id="basic-button"
          style={{ backgroundColor: "transparent" }}
          onClick={handleLanguageMenu}
        >
          <GrLanguage size={22} />
        </Button>
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleCloseLanguageMenu}
        >
          {locales.map((l) => (
            <MenuItem
              key={l}
              onClick={()=>handleLocaleChoose(l)}
            >
              {l}
            </MenuItem>
          ))}
        </Menu>
      </div>

      <div
        className={styles.notificationIcon}
        onClick={handleNotification}
        onMouseDown={(e) => e.preventDefault()}
        aria-label="notifications"
      >
        <NotificationIcon count={numOfNotifications} />
        {openNotifications && (
          <div className={styles.notificationDropper}>{notis}</div>
        )}
      </div>

      <div className={styles.userImage} role="button" onClick={handleSideMenu}>
        <Image
          src={currentUser?.image?.url ? currentUser.image.url : noAvatar}
          alt={currentUser.name || "User-image"}
          placeholder={currentUser?.image?.url ? "blur" : "empty"}
          blurDataURL={currentUser?.image?.base64}
          width={40}
          height={40}
        />
      </div>

      {isVisible && (
        <div className={styles.isMenuDiv} ref={visibleRef}>
          <div role="link" onClick={handlePrivate}>
            {personal}
          </div>
          <div role="link" onClick={disconnect}>
            {logout}
          </div>
        </div>
      )}
    </nav>
  );
};

export default memo(Navbar);
