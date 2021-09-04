import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';


import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDBd7-tNIR13FRwEhIaJyZGDL-Xi-GNpdg",
  authDomain: "superchat-f425c.firebaseapp.com",
  projectId: "superchat-f425c",
  storageBucket: "superchat-f425c.appspot.com",
  messagingSenderId: "397611369892",
  appId: "1:397611369892:web:533b4fd2784181bc55ed31",
  measurementId: "G-QVVTQ0XZDY"
}

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

const auth = firebase.auth();
const firestore = firebase.firestore();



function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>Chat 💬</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Anmeldung bei Google</button>
      <p>Beleidige keine anderen User oder Du wirst gesperrt!</p>
    </>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Abmelden</button>
  )
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(1025);
  
  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });

  }

  return (<>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

        <span ref={dummy}></span>

      </main>

      <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Aa" />

        <button type="submit">✉️</button>

      </form>
    </>)
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://lh3.googleusercontent.com/ogw/ADea4I5nZ9Yyqwgqf7sLKltjNg5X-8AbtdwCJaKzU2P5IA=s32-c-mo'} alt={photoURL || 'https://lh3.googleusercontent.com/ogw/ADea4I5nZ9Yyqwgqf7sLKltjNg5X-8AbtdwCJaKzU2P5IA=s32-c-mo'} />
      <p>{text}</p>
    </div>
  </>)
}

export default App;
