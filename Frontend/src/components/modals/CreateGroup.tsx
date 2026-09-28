import { useEffect, useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { api, ident, json, type Group, type User } from "../../api";
import Avatar from "../ui/Avatar";
export default function CreateGroup({
  onDone,
}: {
  onDone: (g: Group) => void;
}) {
  const [name, setName] = useState(""),
    [description, setDescription] = useState(""),
    [q, setQ] = useState(""),
    [users, setUsers] = useState<User[]>([]),
    [members, setMembers] = useState<User[]>([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!q.trim()) {
      setUsers([]);
      return;
    }
    const t = setTimeout(
      () =>
        api<{ users: User[] }>(`/api/users/search?q=${encodeURIComponent(q)}`)
          .then((r) => setUsers(r.users))
          .catch((e) => setError(e.message)),
      300,
    );
    return () => clearTimeout(t);
  }, [q]);
  async function create(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await api<{ group: Group }>(
        "/api/groups",
        json("POST", { name, description, members: members.map(ident) }),
      );
      onDone(r.group);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="modal-content form-stack" onSubmit={create}>
      <label>
        Group name
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Weekend plans"
        />
      </label>
      <label>
        Description (optional)
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What’s this group about?"
        />
      </label>
      <label>
        Add people
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search usernames"
        />
      </label>
      {members.length > 0 && (
        <div className="chips">
          {members.map((u) => (
            <button
              type="button"
              key={ident(u)}
              onClick={() =>
                setMembers((prev) => prev.filter((m) => ident(m) !== ident(u)))
              }
            >
              {u.name} ×
            </button>
          ))}
        </div>
      )}
      <div className="member-results">
        {users
          .filter((u) => !members.some((m) => ident(m) === ident(u)))
          .map((u) => (
            <button
              type="button"
              className="list-item"
              key={ident(u)}
              onClick={() => {
                setMembers((prev) => [...prev, u]);
                setQ("");
              }}
            >
              <Avatar user={u} size={32} />
              <span className="list-copy">
                <strong>{u.name}</strong>
                <small>@{u.username}</small>
              </span>
              <Plus size={16} />
            </button>
          ))}
      </div>
      {error && <p className="error-text">{error}</p>}
      <button className="primary full" disabled={busy}>
        Create group <span>→</span>
      </button>
    </form>
  );
}
