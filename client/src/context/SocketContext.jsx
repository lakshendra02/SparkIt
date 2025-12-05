import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { getToken } from "../utils/storage";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
    const token = getToken();

    const newSocket = io(apiUrl, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      autoConnect: true,
      withCredentials: true,
      auth: {
        token: token || "",
      },
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      setSocket(newSocket);
    });

    newSocket.on("connect_error", (error) => {
      console.warn("Socket connection error:", error);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
