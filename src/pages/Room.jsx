import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Peer from "peerjs";
import { v4 } from "uuid";
import Chat from "../components/chat/Chat";
import Video from "../components/video/Video";
import { checkPermission, PrepareMeeting } from "./Home";

const Room = () => {
  const { roomId } = useParams();
  const { state } = useLocation();
  const { defaultUser, mic, video, host } = state || {};

  const peer = useRef(null);
  const socket = useRef(null);
  const [members, setMembers] = useState([]);
  const [joint, setJoint] = useState(false);
  const [chat, showChat] = useState(false);
  const [newMsg, setNewMsg] = useState(false);
  const [user, setUser] = useState(
    host ? defaultUser : { name: localStorage.getItem("name") }
  );
  const userRef = useRef(user);
  const [micOn, setMicOn] = useState(false);
  const [videoOn, setVideoOn] = useState(false);

  // Function to join the room after everything is ready
  const joinRoom = () => {
    if (!peer.current?.id) {
      console.warn("Peer ID is not ready yet.");
      return;
    }
    console.log("Joining room with Peer ID:", peer.current.id);
    socket.current.emit("join-room", {
      roomId,
      peerId: peer.current.id,
      user: userRef.current,
    });
  };

  useEffect(() => {
    console.log("VITE_SOCKETIO_SERVER:", import.meta.env.VITE_SOCKETIO_SERVER);
    console.log("VITE_PEERJS_SERVER:", import.meta.env.VITE_PEERJS_SERVER);

    socket.current = io(import.meta.env.VITE_SOCKETIO_SERVER, {
      transports: ["websocket"],
    });

    peer.current = new Peer(host ? roomId : v4(), {
      host: "your-peerjs-server.vercel.app",
      path: "/peerjs",
      secure: true,
    });

    peer.current.on("open", (id) => {
      console.log("Peer connected with ID:", id);

      socket.current.on("all-users", (users) => {
        console.log("All users in room:", users);
        setMembers(users);
        setJoint(true);
      });

      // Ensure permissions are checked before joining
      Promise.all([
        checkPermission("camera", setVideoOn),
        checkPermission("microphone", setMicOn),
      ]).then(() => {
        if (host) joinRoom();
      });
    });

    return () => {
      console.log("Cleaning up connections...");
      peer.current.destroy();
      socket.current.disconnect();
    };
  }, []);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  return (
    <div className="room">
      {(host || joint) && members.length ? (
        <>
          <div className="videos">
            <Video
              roomId={roomId}
              socket={socket}
              user={host ? defaultUser : userRef.current}
              peer={peer}
              members={members}
              setMembers={setMembers}
              showChat={showChat}
              newMsg={!chat && newMsg}
              mic={host ? mic : micOn}
              video={host ? video : videoOn}
              style={{ width: `calc(100% - ${chat ? "20rem" : "0"})` }}
            />
          </div>
          <div className="chat" style={{ display: chat ? "flex" : "none" }}>
            <Chat
              user={host ? defaultUser : userRef.current}
              roomId={roomId}
              peerId={peer.current?.id}
              socket={socket}
              setNewMsg={setNewMsg}
            />
          </div>
        </>
      ) : host ? (
        <h2>Creating conference...</h2>
      ) : (
        <PrepareMeeting
          user={user}
          setUser={setUser}
          micOn={micOn}
          setMicOn={setMicOn}
          videoOn={videoOn}
          setVideoOn={setVideoOn}
          onAction={joinRoom}
          actionText={"Join conference"}
        />
      )}
    </div>
  );
};

export default Room;
