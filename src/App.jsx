/* eslint-disable no-unused-vars */
import logo from "/logo.png";
import "./App.css";
import { onChildAdded, push, ref as databaseRef, set } from "firebase/database";
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";
import { database, storage } from "./firebase";
import { useState, useEffect } from "react";

// Save the Firebase folder names as constants to avoid bugs due to misspelling
const IMAGES_FOLDER_NAME = "images";
const POSTS_FOLDER_NAME = "posts";

function App() {
  const [posts, setPosts] = useState([]);
  const [message, setMessage] = useState("");
  const [fileInputFile, setFileInputFile] = useState(null);
  const [fileInputValue, setFileInputValue] = useState("");

  useEffect(() => {
    // Get a reference to the 'posts' path in the Firebase DB
    const postsRef = databaseRef(database, POSTS_FOLDER_NAME);

    // On initial load, onChildAdded reads existing children of the 'posts' path in the Firebase DB and sets them into React state 'posts' iteratively to be rendered. Callback function to set state runs once for each child

    // Any subsequent children added to the 'posts' path in the Firebase DB will trigger the callback function to setState, adding the new child to the 'messages' array in React state
    onChildAdded(postsRef, (data) => {
      console.log(data);
      console.log(data.key, data.val());
      // For each child in the 'posts' path in the Firebase DB, add the child to the 'posts' array in React state as an object with {key, val}
      setPosts((prevState) =>
        // Store message key so we can use it as a key in our list items when rendering messages
        [...prevState, { key: data.key, val: data.val() }]
      );
    });
  }, []);

  const writeData = (e) => {
    e.preventDefault();

    // Store images in 'images' folder in Firebase Storage using file name as the path
    const fileRef = storageRef(
      storage,
      `${IMAGES_FOLDER_NAME}/${fileInputFile.name}`
    );

    const uploadFile = async () => {
      try {
        // Upload file, save file download URL in database with post text
        uploadBytes(fileRef, fileInputFile);
        const downloadURL = await getDownloadURL(fileRef);

        // Get a reference to the 'posts' path in the Firebase DB
        const postListRef = databaseRef(database, POSTS_FOLDER_NAME);

        // When used, generates a new child in the 'posts' path in the Firebase DB with a unique key
        const newPostRef = push(postListRef);

        // Write data (image URL, text input and timestamp) to the new child generated in the 'posts' path in the Firebase DB
        const timestamp = new Date().toLocaleTimeString();
        set(newPostRef, {
          imageLink: downloadURL,
          content: message,
          timestamp,
        });
      } catch (error) {
        console.log(error);
      }
    };

    uploadFile();
    // Reset input fields
    setMessage("");
    setFileInputValue("");
    setFileInputFile(null);
  };

  // Convert posts in state to message JSX elements to render
  let postsListItems = posts.map((post) => (
    <div key={post.key}>
      <img src={post.val.imageLink} width="500" height="300" />
      <p>{post.val.content} </p>
      <p>
        <i>{post.val.timestamp}</i>
      </p>
    </div>
  ));

  return (
    <>
      <div>
        <img src={logo} className="logo" alt="Rocket logo" />
      </div>
      <h1>Instagram Bootcamp</h1>
      <div className="card">
        <form onSubmit={writeData}>
          <label htmlFor="uploadFile">Upload File: </label>
          <input
            type="file"
            id="uploadFile"
            value={fileInputValue}
            onChange={(e) => {
              setFileInputFile(e.target.files[0]);
              setFileInputValue(e.target.value);
              console.log(e.target.files[0]);
              console.log(e.target.value);
            }}
          />
          <br />
          <br />
          <label htmlFor="messageInput">Enter message: </label>
          <input
            type="text"
            id="messageInput"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            type="submit"
            disabled={!message}
            style={{ marginLeft: "1rem" }}
          >
            Send
          </button>
        </form>
        <ol>{postsListItems}</ol>
      </div>
    </>
  );
}

export default App;
