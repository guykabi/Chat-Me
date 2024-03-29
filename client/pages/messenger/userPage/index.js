import React, { useState, useRef, useContext, useEffect } from "react";
import { chatContext } from "../../../context/chatContext";
import Head from "next/head";
import { useRouter } from "next/router";
import {useTranslation} from 'next-i18next'
import styles from "./userPage.module.css";
import { useMutation } from "react-query";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { updateUserDetails } from "../../../utils/apiUtils";
import { exctractCredentials, checkDevice } from "../../../utils/utils";
import { useGetUser } from "../../../hooks/useUser";
import { useErrorBoundary } from "react-error-boundary";
import Input from "../../../components/UI/Input/Input";
import noAvatar from "../../../public/images/no-avatar.png";
import Image from "next/image";
import { BsFillCameraFill } from "react-icons/bs";
import ReturnIcon from "../../../components/UI/returnIcon/returnIcon";
import Mobile from "../../../components/errors/mobile/mobile";
import { useFormik } from "formik";
import * as yup from "yup";
import { Loader } from "../../../components/UI/clipLoader/clipLoader";
import Button from "../../../components/UI/Button/button";
import Modal from "../../../components/Modal/modal";

const UserPage = ({ user, hasError, isMobile }) => {
  const { dispatch } = useContext(chatContext);
  const { showBoundary } = useErrorBoundary();
  const {push,locale} = useRouter()
  const dir = locale === 'he'?'rtl' : 'ltr'
  const {t} = useTranslation('userDetails')
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  
  const onError = (error) => {showBoundary(error)};

  const { data, refetch:fetchUser, isLoading } = 
     useGetUser(user?._id,false,null,onError);

  const [isChanged, setIsChanged] = useState(false);
  const fileRef = useRef();

  const { mutate: update, isLoading: load } = useMutation(updateUserDetails, {
    onSuccess: (data) => {
      if (data.message != "Updated successfully") return;
      dispatch({ type: "USER_FIELD", payload: data.editUser });
      push("/messenger");
    },
    onError: (error) => showBoundary(error),
  });

  useEffect(() => {
    if(hasError) return showBoundary(hasError)
    fetchUser()
  }, []);

  const handleInputFileClick = () => {
    fileRef.current.click();
  };

  const handleFilePick = (e) => {
    if (!e.target.files.length) return;
    setFile(e.target.files[0]);
    const objectUrl = URL.createObjectURL(e.target.files[0]);
    setPreview(objectUrl);
    setIsChanged(true);
  };

  const {
    handleSubmit,
    handleBlur,
    handleChange,
    values,
    touched,
    errors,
    dirty,
  } = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: data?.name,
      lastName: data?.lastName,
      email: data?.email,
    },
    onSubmit: (values) => {
      if (file) {
        const formData = new FormData();

        for (const [key, value] of Object.entries(values)) {
          if (key != "image") formData.append([key], value);
        }

        if (data?.image?.url)
          formData.append("removeImage", data.image.cloudinary_id);
          formData.append("userImage", file);

          return update({ userId: data._id, body: formData });
      }
      update({ userId: data._id, body: values });
    },
    validationSchema: yup.object({
      name: yup.string().trim().required("Name is required"),
      lastName: yup.string().trim().required("Lastname is required"),
    }),
  });

  const onModalClose = () => {
    setIsChanged(false);
    setFile(null);
    setPreview(null);
  };

  if(isMobile){
    return(
      <Mobile/>
    )
  }


  return (
    <>
    {!hasError&&data && 
    <section className={styles.userPageWrapper}>
      <Head>
        {hasError?
        <title>undefined</title>:
        <title>{t('header', {data})}</title>}
        <link
          rel="icon"
          href="/favicon.ico"
          type="image/<generated>"
          sizes="<generated>"
        />
      </Head>
      <article>
        {isLoading ? (
          <section className="center">
            <h2>{t('loading')}</h2>
            <Loader size={40}/>
          </section>
        ) : (
          <section className={styles.mainUserPage} role="region">
            <ReturnIcon onClick={() => push("/messenger")} />
            <header className={styles.userPageHeader} role="heading">
              <h2>{t('header', {data})}</h2>
            </header>
            <main className={styles.formWrapper} role="form">
              <form onSubmit={handleSubmit} className={styles.userPageForm}>
                <section className={styles.userImageWrapper}>
                  <Image
                    fill
                    priority
                    src={data?.image?.url ? data.image.url : noAvatar}
                    alt="user-image"
                    style={{ objectFit: "cover", borderRadius: "50%" }}
                    sizes="(max-width: 368px) 100vw"
                    placeholder={data?.image?.base64 ? "blur" : "empty"}
                    blurDataURL={data?.image?.base64}
                  />
                  <section className={styles.chooseImageWrapper}>
                    <span className={styles.chooseImagePopup}>
                      {t('chooseImage')}
                    </span>
                    <BsFillCameraFill onClick={handleInputFileClick} />
                    <Input
                      type="file"
                      name="image"
                      className="invisibleFileInput"
                      width={0}
                      height={0}
                      ref={fileRef}
                      onChange={handleFilePick}
                    />
                  </section>
                </section>
                <article className={styles.inputField}>
                  <Input
                    type="text"
                    name="name"
                    placeholder={t('placeholders.name')}
                    textAlign='center'
                    fontSize="large"
                    width={40}
                    height={30}
                    dir={dir}
                    value={values.name || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.name && errors.name ? (
                    <span>{errors.name}</span>
                  ) : null}
                </article>
                <article className={styles.inputField}>
                  <Input
                    type="text"
                    name="lastName"
                    placeholder={t('placeholders.Lastname')}
                    textAlign='center'
                    fontSize="large"
                    width={40}
                    height={30}
                    dir={dir}
                    value={values.lastName || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.lastName && errors.lastName ? (
                    <span>{errors.lastName}</span>
                  ) : null}
                </article>
                <article className={styles.inputField}>
                  <Input
                    type="text"
                    name="email"
                    placeholder="Email"
                    textAlign='center'
                    fontSize="large"
                    width={40}
                    height={30}
                    dir={dir}
                    value={values.email || ""}
                    disabled={true}
                  />
                  {touched.email && errors.email ? (
                    <span>{errors.email}</span>
                  ) : null}
                </article>
                <Button
                  text={load ? t("loading") : t("saveButton")}
                  className="secondaryBtn"
                  disabled={!file && !dirty}
                  width={12}
                  header={15}
                  type="submit"
                />
              </form>
            </main>
            <Modal show={isChanged} onClose={onModalClose}>
              <section className={styles.imagePreview}>
                <Image
                  src={preview}
                  width={200}
                  height={160}
                  style={{ objectFit: "contain", borderRadius: "5%" }}
                  alt="preview"
                  priority={true}
                />
                <Button
                  className="secondaryBtn"
                  text={t('modalBtn')}
                  width={8}
                  height={15}
                  onClick={() => setIsChanged(false)}
                />
              </section>
            </Modal>
          </section>
        )}
      </article>
    </section>}
    </>
  );
};

export async function getServerSideProps({ req, locale }) {

  let isMobile = checkDevice(req.headers['user-agent'])

  if(isMobile) return {props : {isMobile : 'mobile'}}

  const user = exctractCredentials(req);
  if (user === "No cookie" || user === "No token") 
        return { props: { hasError: user } }

  return {
    props: { user,
      ...(await serverSideTranslations( locale , ['userDetails']))  }
  };
}

export default UserPage;
