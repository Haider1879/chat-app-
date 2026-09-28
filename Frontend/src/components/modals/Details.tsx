import { useState } from "react";
import {
  api,
  ident,
  json,
  type Chat,
  type Conversation,
  type Group,
} from "../../api";
import Avatar from "../ui/Avatar";
export default function Details({
  active,
  selected,
  onDone,
  onRefresh,
}: {
  active: Chat | null;
  selected?: Conversation | Group;
  onDone: () => void;
  onRefresh: () => void;
}) {
  const [error, setError] = useState("");
  if (!active || !selected)
    return <p className="modal-content">Conversation unavailable.</p>;
  const chat = active;
  const group = chat.kind === "group" ? (selected as Group) : null;
  async function leave() {
    if (!confirm(group ? "Leave this group?" : "Hide this conversation?"))
      return;
    try {
      await api(
        group
          ? `/api/groups/${chat.id}/leave`
          : `/api/conversations/${chat.id}`,
        { method: group ? "POST" : "DELETE" },
      );
      onDone();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function add() {
    const id = prompt("Enter the user ID to add to the group");
    if (!id) return;
    try {
      await api(
        `/api/groups/${active!.id}/members`,
        json("POST", { userId: id }),
      );
      onRefresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <div className="modal-content form-stack">
      <div className="detail-head">
        <Avatar
          user={group ? null : (selected as Conversation).user}
          name={group?.name}
          size={64}
        />
        <h3>{group?.name || (selected as Conversation).user?.name}</h3>
        <p>
          {group?.description ||
            `@${(selected as Conversation).user?.username || ""}`}
        </p>
      </div>
      {group && (
        <>
          <p className="list-label">MEMBERS ({group.members?.length || 0})</p>
          {group.members?.map((m) => (
            <div className="list-item" key={ident(m)}>
              <Avatar user={m} size={34} />
              <span className="list-copy">
                <strong>{m.name}</strong>
                <small>@{m.username}</small>
              </span>
            </div>
          ))}
          {group.isAdmin && (
            <button className="secondary" onClick={add}>
              Add member by user ID
            </button>
          )}
        </>
      )}
      {error && <p className="error-text">{error}</p>}
      <button className="danger" onClick={leave}>
        {group ? "Leave group" : "Hide conversation"}
      </button>
    </div>
  );
}
