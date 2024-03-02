import logo from "/logo.png";
import "./App.css";
import { onChildAdded, push, ref, set } from "firebase/database";
import { database } from "./firebase";
import { useState, useEffect } from "react";

// Save the Firebase message folder name as a constant to avoid bugs due to misspelling
const DB_MESSAGES_KEY = "messages";

function App() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const messagesRef = ref(database, DB_MESSAGES_KEY);
    // onChildAdded will return data for every child at the reference and every subsequent new child
    onChildAdded(messagesRef, (data) => {
      // Add the subsequent child to local component state, initialising a new array to trigger re-render
      console.log(data);
      setMessages((prevState) =>
        // Store message key so we can use it as a key in our list items when rendering messages
        [...prevState, { key: data.key, val: data.val() }]
      );
    });
  }, []);

  const writeData = (e) => {
    e.preventDefault();
    const messageListRef = ref(database, DB_MESSAGES_KEY);
    const newMessageRef = push(messageListRef);
    const timestamp = new Date().toLocaleTimeString();
    set(newMessageRef, { content: message, timestamp });
    setMessage("");
  };

  // Convert messages in state to message JSX elements to render
  let messageListItems = messages.map((message) => (
    <div key={message.key}>
      <p>
        {message.val.content}{" "}
        <span>
          <i>{message.val.timestamp}</i>
        </span>
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
          <label htmlFor="messageInput">Enter message: </label>
          <input
            type="text"
            id="messageInput"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button type="submit" disabled={!message}>
            Send
          </button>
        </form>
        <ol>{messageListItems}</ol>
      </div>
    </>
  );
}

export default App;
