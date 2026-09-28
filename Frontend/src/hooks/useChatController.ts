import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { io, type Socket } from "socket.io-client";
import {
  api,
  base,
  ident,
  json,
  type Chat,
  type Conversation,
  type Group,
  type Message,
  type Request,
  type User,
} from "../api";
export function useChatController() {
  const [user, setUser] = useState<User | null>(null),
    [loading, setLoading] = useState(true),
    [conversations, setConversations] = useState<Conversation[]>([]),
    [groups, setGroups] = useState<Group[]>([]),
    [requests, setRequests] = useState<Request[]>([]);
  const [active, setActive] = useState<Chat | null>(null),
    [messages, setMessages] = useState<Message[]>([]),
    [hasMore, setHasMore] = useState(false),
    [query, setQuery] = useState(""),
    [results, setResults] = useState<User[]>([]),
    [tab, setTab] = useState<"chats" | "groups" | "requests">("chats");
  const [draft, setDraft] = useState(""),
    [reply, setReply] = useState<Message | null>(null),
    [typing, setTyping] = useState(false),
    [error, setError] = useState(""),
    [modal, setModal] = useState<
      "new" | "group" | "settings" | "details" | null
    >(null),
    [busy, setBusy] = useState(false),
    [online, setOnline] = useState<Record<string, string>>({});
  const socketRef = useRef<Socket | null>(null),
    activeRef = useRef<Chat | null>(null),
    bottomRef = useRef<HTMLDivElement>(null),
    fileRef = useRef<HTMLInputElement>(null),
    typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);
  const notify = (e: unknown) => {
    setError((e as Error).message || "Something went wrong");
    setTimeout(() => setError(""), 5000);
  };
  const refresh = useCallback(async () => {
    try {
      const [cs, gs, rs] = await Promise.all([
        api<{ conversations: Conversation[] }>("/api/conversations"),
        api<{ groups: Group[] }>("/api/groups"),
        api<{ requests: Request[] }>("/api/message-requests"),
      ]);
      setConversations(cs.conversations);
      setGroups(gs.groups);
      setRequests(rs.requests);
    } catch (e) {
      notify(e);
    }
  }, []);
  useEffect(() => {
    const token = localStorage.getItem("ring_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api<{ user: User }>("/api/auth/me")
      .then((r) => setUser(r.user))
      .catch(() => localStorage.removeItem("ring_token"))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (!user) return;
    refresh();
    const socket = io(base, {
      auth: { token: localStorage.getItem("ring_token") },
      autoConnect: true,
    });
    socketRef.current = socket;
    socket.on("connect", () => {
      groups.forEach((g) => socket.emit("join_group", g.id));
      refresh();
    });
    socket.on("receive_message", (m: Message) => {
      const a = activeRef.current;
      if (
        a &&
        ((a.kind === "dm" && String(m.conversation) === a.id) ||
          (a.kind === "group" && String(m.group) === a.id))
      )
        setMessages((prev) =>
          prev.some((x) => x._id === m._id) ? prev : [...prev, m],
        );
      refresh();
    });
    socket.on("presence", (p: { userId: string; status: string }) =>
      setOnline((prev) => ({ ...prev, [p.userId]: p.status })),
    );
    socket.on("typing", (p: { conversationId?: string; groupId?: string }) => {
      const a = activeRef.current;
      if (a && (p.conversationId === a.id || p.groupId === a.id))
        setTyping(true);
    });
    socket.on(
      "stop_typing",
      (p: { conversationId?: string; groupId?: string }) => {
        const a = activeRef.current;
        if (a && (p.conversationId === a.id || p.groupId === a.id))
          setTyping(false);
      },
    );
    socket.on("message_read", ({ messageId }: { messageId: string }) =>
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, status: "read" } : m)),
      ),
    );
    socket.on("message_deleted", ({ messageId }: { messageId: string }) =>
      setMessages((prev) => prev.filter((m) => m._id !== messageId)),
    );
    socket.on("group_deleted", refresh);
    socket.on("removed_from_group", refresh);
    socket.on("member_left_group", refresh);
    socket.on("connect_error", (e) => notify(e));
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // The group list is loaded after connect; the next effect joins its rooms.
  }, [user?.id]);
  useEffect(() => {
    if (socketRef.current?.connected)
      groups.forEach((g) => socketRef.current?.emit("join_group", g.id));
  }, [groups]);
  useEffect(() => {
    if (!user || !active) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    setMessages([]);
    setHasMore(false);
    setTyping(false);
    const path =
      active.kind === "dm"
        ? `/api/messages/${active.id}`
        : `/api/groups/${active.id}/messages`;
    api<{ messages: Message[]; hasMore: boolean }>(path)
      .then((r) => {
        if (!cancelled) {
          setMessages(r.messages);
          setHasMore(r.hasMore);
        }
      })
      .catch(notify);
    return () => {
      cancelled = true;
    };
  }, [active?.id, active?.kind, user?.id]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, active?.id]);
  useEffect(() => {
    if (!user || !active || !socketRef.current?.connected) return;
    messages
      .filter((m) => ident(m.sender) !== user.id && m.status !== "read")
      .forEach((m) =>
        socketRef.current?.emit("message_read", { messageId: m._id }),
      );
  }, [messages, active?.id, user?.id]);
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(
      () =>
        api<{ users: User[] }>(
          `/api/users/search?q=${encodeURIComponent(query.trim())}`,
        )
          .then((r) => setResults(r.users))
          .catch(notify),
      350,
    );
    return () => clearTimeout(timer);
  }, [query]);
  const login = (token: string, u: User) => {
    localStorage.setItem("ring_token", token);
    setUser(u);
  };
  const logout = () => {
    api("/api/auth/logout", { method: "POST" }).catch(() => {});
    socketRef.current?.disconnect();
    localStorage.removeItem("ring_token");
    setUser(null);
    setActive(null);
    setMessages([]);
  };
  const selected =
    active?.kind === "dm"
      ? conversations.find((c) => c.id === active.id)
      : groups.find((g) => g.id === active?.id);
  const title =
    active?.kind === "dm"
      ? (selected as Conversation | undefined)?.user?.name
      : (selected as Group | undefined)?.name;
  const peer =
    active?.kind === "dm" ? (selected as Conversation | undefined)?.user : null;
  async function openPerson(u: User) {
    try {
      const r = await api<{ conversation: Conversation }>(
        "/api/conversations",
        json("POST", { userId: ident(u) }),
      );
      setConversations((prev) => [
        r.conversation,
        ...prev.filter((c) => c.id !== r.conversation.id),
      ]);
      setActive({ kind: "dm", id: r.conversation.id });
      setTab("chats");
      setModal(null);
      setQuery("");
    } catch (e) {
      notify(e);
    }
  }
  async function send(e: FormEvent) {
    e.preventDefault();
    if (!active || !draft.trim() || busy) return;
    setBusy(true);
    try {
      const path =
        active.kind === "dm"
          ? `/api/messages/${active.id}`
          : `/api/groups/${active.id}/messages`;
      const r = await api<{ message: Message }>(
        path,
        json("POST", { text: draft.trim(), type: "text", replyTo: reply?._id }),
      );
      setMessages((prev) =>
        prev.some((m) => m._id === r.message._id) ? prev : [...prev, r.message],
      );
      setDraft("");
      setReply(null);
      refresh();
    } catch (e) {
      notify(e);
    } finally {
      setBusy(false);
    }
  }
  async function upload(file: File) {
    if (!active) return;
    if (file.size > 15 * 1024 * 1024) {
      notify(new Error("Maximum file size is 15 MB"));
      return;
    }
    const type = file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("audio/")
        ? "voice"
        : null;
    if (!type) {
      notify(new Error("Choose an image or audio file"));
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append(active.kind === "dm" ? "file" : "media", file);
      fd.append("type", type);
      if (reply) fd.append("replyTo", reply._id);
      const path =
        active.kind === "dm"
          ? `/api/messages/${active.id}`
          : `/api/groups/${active.id}/messages`;
      const r = await api<{ message: Message }>(path, {
        method: "POST",
        body: fd,
      });
      setMessages((prev) => [...prev, r.message]);
      setReply(null);
      refresh();
    } catch (e) {
      notify(e);
    } finally {
      setBusy(false);
    }
  }
  function signalTyping() {
    if (!active) return;
    const payload =
      active.kind === "dm"
        ? { conversationId: active.id, receiverId: ident(peer) }
        : { groupId: active.id };
    socketRef.current?.emit("typing", payload);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(
      () => socketRef.current?.emit("stop_typing", payload),
      1200,
    );
  }
  async function older() {
    if (!active || !messages.length) return;
    try {
      const path =
        active.kind === "dm"
          ? `/api/messages/${active.id}`
          : `/api/groups/${active.id}/messages`;
      const r = await api<{ messages: Message[]; hasMore: boolean }>(
        `${path}?before=${encodeURIComponent(messages[0].createdAt)}`,
      );
      setMessages((prev) => [
        ...r.messages.filter((m) => !prev.some((p) => p._id === m._id)),
        ...prev,
      ]);
      setHasMore(r.hasMore);
    } catch (e) {
      notify(e);
    }
  }
  async function deleteMessage(m: Message, mode: "me" | "everyone") {
    const chat = active;
    if (!chat) return;
    const own = ident(m.sender) === user?.id;
    if (mode === "everyone" && !own) return;
    try {
      await api(
        chat.kind === "dm"
          ? `/api/messages/single/${m._id}?mode=${mode}`
          : `/api/groups/${chat.id}/messages/${m._id}?mode=${mode}`,
        { method: "DELETE" },
      );
      setMessages((prev) => prev.filter((x) => x._id !== m._id));
      refresh();
    } catch (e) {
      notify(e);
    }
  }
  async function decide(req: Request, action: "accept" | "reject") {
    try {
      await api(`/api/message-requests/${req._id}/${action}`, {
        method: "POST",
      });
      refresh();
      if (action === "accept") openPerson(req.sender);
    } catch (e) {
      notify(e);
    }
  }
  return {
    user,
    setUser,
    loading,
    conversations,
    setConversations,
    groups,
    setGroups,
    requests,
    active,
    setActive,
    messages,
    hasMore,
    query,
    setQuery,
    results,
    tab,
    setTab,
    draft,
    setDraft,
    reply,
    setReply,
    typing,
    error,
    setError,
    modal,
    setModal,
    busy,
    online,
    bottomRef,
    fileRef,
    refresh,
    login,
    logout,
    selected,
    title,
    peer,
    openPerson,
    send,
    upload,
    signalTyping,
    older,
    deleteMessage,
    decide,
  };
}
export type ChatModel = ReturnType<typeof useChatController>;
