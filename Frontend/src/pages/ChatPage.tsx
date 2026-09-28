import {
  CircleHelp,
  LogOut,
  MessageCircle,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useChat } from "../context/ChatContext";
import Avatar from "../components/ui/Avatar";
import AuthPage from "./AuthPage";
import Sidebar from "../components/sidebar/Sidebar";
import ChatWindow from "../components/chat/ChatWindow";
import Modal from "../components/modals/Modal";
import FindPerson from "../components/modals/FindPerson";
import CreateGroup from "../components/modals/CreateGroup";
import Profile from "../components/modals/Profile";
import Details from "../components/modals/Details";
export default function ChatPage() {
  const m = useChat();
  const {
    user,
    loading,
    login,
    tab,
    setTab,
    requests,
    setModal,
    logout,
    active,
    error,
    setError,
    modal,
    openPerson,
    setGroups,
    setActive,
    refresh,
    setUser,
    selected,
  } = m;
  if (loading)
    return (
      <div className="splash">
        <span className="brand-mark">
          r<span>.</span>
        </span>
        <p>Getting your conversations…</p>
      </div>
    );
  if (!user) return <AuthPage onLogin={login} />;
  return (
    <div className="app-shell">
      <aside className="rail">
        <div className="brand-mark small">
          r<span>.</span>
        </div>
        <nav>
          <button
            className={tab === "chats" ? "on" : ""}
            onClick={() => setTab("chats")}
            title="Chats"
          >
            <MessageCircle />
          </button>
          <button
            className={tab === "groups" ? "on" : ""}
            onClick={() => setTab("groups")}
            title="Groups"
          >
            <Users />
          </button>
          <button
            className={tab === "requests" ? "on" : ""}
            onClick={() => setTab("requests")}
            title="Requests"
          >
            <span className="badge-wrap">
              <CircleHelp />
              {requests.length > 0 && <i />}
            </span>
          </button>
        </nav>
        <div className="rail-bottom">
          <button onClick={() => setModal("settings")} title="Settings">
            <Settings />
          </button>
          <button onClick={logout} title="Sign out">
            <LogOut />
          </button>
          <button onClick={() => setModal("settings")} title="My profile">
            <Avatar user={user} size={36} />
          </button>
        </div>
      </aside>
      <Sidebar model={m} />
      <ChatWindow model={m} />
      {error && (
        <div className="toast" role="alert">
          {error}
          <button onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}
      {modal && (
        <Modal
          onClose={() => setModal(null)}
          title={
            modal === "new"
              ? "Start a conversation"
              : modal === "group"
                ? "Create a group"
                : modal === "settings"
                  ? "Your profile"
                  : "Conversation details"
          }
        >
          {modal === "new" ? (
            <FindPerson onSelect={openPerson} />
          ) : modal === "group" ? (
            <CreateGroup
              onDone={(g) => {
                setGroups((prev) => [g, ...prev]);
                setActive({ kind: "group", id: g.id });
                setTab("groups");
                setModal(null);
              }}
            />
          ) : modal === "settings" ? (
            <Profile user={user} onUpdate={setUser} onLogout={logout} />
          ) : (
            <Details
              active={active}
              selected={selected}
              onDone={() => {
                setActive(null);
                setModal(null);
                refresh();
              }}
              onRefresh={refresh}
            />
          )}
        </Modal>
      )}
    </div>
  );
}
