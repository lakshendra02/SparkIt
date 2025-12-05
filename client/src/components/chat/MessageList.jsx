import React, { useEffect, useRef, useState } from "react";
import MessageItem from "./MessageItem";
import { fetchMessages } from "../../api/messageApi";

export default function MessageList({ channelId, user, socket }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const listRef = useRef(null);
  const earliestRef = useRef(null);
  const isFetchingRef = useRef(false);
  const prevScrollTopRef = useRef(Number.MAX_SAFE_INTEGER);
  useEffect(() => {
    if (!channelId) return;
    setMessages([]);
    earliestRef.current = null;
    loadRecent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId]);

  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => {
      if (msg.channel === channelId) {
        setMessages((m) => [...m, msg]);
        // Schedule scroll after DOM updates
        setTimeout(() => scrollToBottom(), 0);
      }
    };
    socket.on("message", handler);
    return () => socket.off("message", handler);
  }, [socket, channelId]);

  const prevLastMessageIdRef = useRef(null);
  useEffect(() => {
    const last = messages.length ? messages[messages.length - 1]._id : null;
    if (!prevLastMessageIdRef.current && last) {
      scrollToBottom();
      prevLastMessageIdRef.current = last;
      return;
    }
    if (last && prevLastMessageIdRef.current !== last) {
      scrollToBottom();
    }
    prevLastMessageIdRef.current = last;
  }, [messages]);

  useEffect(() => {
    if (!listRef.current) return;
    const listElement = listRef.current;
    const THRESHOLD = 80; // px from top to trigger load

    const handleScroll = async () => {
      const currentTop = listElement.scrollTop;

      // Only trigger when crossing the threshold from below to above (user scrolled up)
      const crossedUp =
        prevScrollTopRef.current > THRESHOLD && currentTop <= THRESHOLD;

      // update prevScrollTopRef for next event (will be overwritten after action)
      prevScrollTopRef.current = currentTop;

      if (!crossedUp) return;
      if (!hasMore || loading || isFetchingRef.current) return;
      if (!earliestRef.current) return;

      isFetchingRef.current = true;
      const prevScrollHeight = listElement.scrollHeight;
      const prevScrollTop = currentTop;

      setLoading(true);
      try {
        const res = await fetchMessages({
          channelId,
          before: earliestRef.current,
          limit: 10,
        });
        const older = (res.data.messages || []).reverse();
        if (!older.length) {
          setHasMore(false);
          return;
        }

        setMessages((prev) => [...older, ...prev]);
        earliestRef.current = older[0].createdAt;

        setTimeout(() => {
          const newScrollHeight = listElement.scrollHeight;
          const addedHeight = newScrollHeight - prevScrollHeight;
          listElement.scrollTop = prevScrollTop + addedHeight;
          prevScrollTopRef.current = listElement.scrollTop;
        }, 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    };

    let scrollTimeout;
    const debouncedScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 120);
    };

    listElement.addEventListener("scroll", debouncedScroll);
    prevScrollTopRef.current = listElement.scrollTop + THRESHOLD + 1;
    return () => {
      listElement.removeEventListener("scroll", debouncedScroll);
      clearTimeout(scrollTimeout);
    };
  }, [hasMore, loading, channelId]);

  const loadRecent = async () => {
    if (!channelId) return;
    setLoading(true);
    try {
      const res = await fetchMessages({ channelId, limit: 30 });
      console.debug(
        "MessageList: loadRecent fetched",
        (res.data.messages || []).length
      );
      const reversed = (res.data.messages || []).reverse();
      setMessages(reversed);
      if (reversed.length) earliestRef.current = reversed[0].createdAt;
      setHasMore((res.data.messages || []).length === 10);
      setTimeout(scrollToBottom, 80);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  const handleMessageUpdated = (updated) => {
    setMessages((prev) =>
      prev.map((m) => (m._id === updated._id ? updated : m))
    );
  };

  const handleMessageDeleted = (id) => {
    setMessages((prev) => prev.filter((m) => m._id !== id));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 flex items-center justify-between">
        {!hasMore && messages.length > 0 && (
          <div className="text-xs text-white/50">No older messages</div>
        )}
      </div>

      <div
        ref={listRef}
        className="flex-1 overflow-auto p-4 space-y-3 bg-linear-to-b from-white/5 to-transparent"
      >
        {loading && messages.length === 0 ? (
          <div className="text-sm text-white/60">Loading messages...</div>
        ) : (
          messages.map((m) => (
            <MessageItem
              key={m._1d || m._id}
              m={m}
              isOwn={String(m.sender?._id) === String(user?._id)}
              onMessageUpdated={handleMessageUpdated}
              onMessageDeleted={handleMessageDeleted}
            />
          ))
        )}
      </div>
    </div>
  );
}
