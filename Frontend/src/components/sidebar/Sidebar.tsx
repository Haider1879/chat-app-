import { Plus, Search, X } from "lucide-react";
import { ident } from "../../api";
import { stamp } from "../../lib/format";
import type { ChatModel } from "../../hooks/useChatController";
import Avatar from "../ui/Avatar";
import EmptyList from "./EmptyList";
export default function Sidebar({ model: m }: { model: ChatModel }) {
  const {
    active,
    setActive,
    tab,
    conversations,
    groups,
    requests,
    query,
    setQuery,
    results,
    setModal,
    online,
    openPerson,
    decide,
  } = m;
  return (
    <aside className={`sidebar ${active ? "hide-mobile" : ""}`}>
      <div className="side-top">
        <div>
          <span className="eyebrow">YOUR SPACE</span>
          <h2>
            {tab === "chats"
              ? "Messages"
              : tab === "groups"
                ? "Groups"
                : "Requests"}
          </h2>
        </div>
        <button
          className="round-add"
          title={tab === "groups" ? "Create group" : "New conversation"}
          onClick={() => setModal(tab === "groups" ? "group" : "new")}
        >
          <Plus size={20} />
        </button>
      </div>
      <div className="searchbox">
        <Search size={18} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people..."
          aria-label="Search people"
        />
        {query && (
          <button onClick={() => setQuery("")}>
            <X size={16} />
          </button>
        )}
      </div>
      {query ? (
        <div className="list">
          <p className="list-label">PEOPLE</p>
          {results.length ? (
            results.map((u) => (
              <button
                className="list-item"
                key={ident(u)}
                onClick={() => openPerson(u)}
              >
                <Avatar user={u} />
                <span className="list-copy">
                  <strong>{u.name}</strong>
                  <small>@{u.username}</small>
                </span>
                <Plus size={17} />
              </button>
            ))
          ) : (
            <div className="empty-list">No people found for “{query}”</div>
          )}
        </div>
      ) : (
        <div className="list">
          {tab === "chats" ? (
            <>
              <p className="list-label">
                RECENT CONVERSATIONS <span>{conversations.length}</span>
              </p>
              {conversations.length ? (
                conversations.map((c) => (
                  <button
                    className={`list-item ${active?.kind === "dm" && active.id === c.id ? "selected" : ""}`}
                    key={c.id}
                    onClick={() => setActive({ kind: "dm", id: c.id })}
                  >
                    <span className="avatar-wrap">
                      <Avatar user={c.user} />
                      {(online[ident(c.user)] || c.user?.status) ===
                        "online" && <i className="online-dot" />}
                    </span>
                    <span className="list-copy">
                      <strong>{c.user?.name || "Unknown user"}</strong>
                      <small>
                        {c.lastMessage?.text || "Start the conversation"}
                      </small>
                    </span>
                    <span className="list-meta">
                      <small>
                        {stamp(c.lastMessage?.createdAt || c.updatedAt)}
                      </small>
                      {c.unreadCount > 0 && <b>{c.unreadCount}</b>}
                    </span>
                  </button>
                ))
              ) : (
                <EmptyList
                  text="No conversations yet"
                  sub="Find someone to start talking."
                  action="Find people"
                  onClick={() => setModal("new")}
                />
              )}
            </>
          ) : tab === "groups" ? (
            <>
              <p className="list-label">
                YOUR GROUPS <span>{groups.length}</span>
              </p>
              {groups.length ? (
                groups.map((g) => (
                  <button
                    className={`list-item ${active?.kind === "group" && active.id === g.id ? "selected" : ""}`}
                    key={g.id}
                    onClick={() => setActive({ kind: "group", id: g.id })}
                  >
                    <Avatar name={g.name} />
                    <span className="list-copy">
                      <strong>{g.name}</strong>
                      <small>
                        {g.lastMessage?.text || `${g.memberCount} members`}
                      </small>
                    </span>
                    <span className="list-meta">
                      <small>
                        {stamp(g.lastMessage?.createdAt || g.updatedAt)}
                      </small>
                    </span>
                  </button>
                ))
              ) : (
                <EmptyList
                  text="No groups yet"
                  sub="Bring your people together."
                  action="Create group"
                  onClick={() => setModal("group")}
                />
              )}
            </>
          ) : (
            <>
              <p className="list-label">
                PENDING <span>{requests.length}</span>
              </p>
              {requests.length ? (
                requests.map((r) => (
                  <div className="request-item" key={r._id}>
                    <div className="request-person">
                      <Avatar user={r.sender} />
                      <span>
                        <strong>{r.sender.name}</strong>
                        <small>@{r.sender.username}</small>
                      </span>
                    </div>
                    <div className="request-actions">
                      <button
                        className="primary"
                        onClick={() => decide(r, "accept")}
                      >
                        Accept
                      </button>
                      <button
                        className="secondary"
                        onClick={() => decide(r, "reject")}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyList
                  text="All caught up"
                  sub="No new message requests."
                />
              )}
            </>
          )}
        </div>
      )}
    </aside>
  );
}
