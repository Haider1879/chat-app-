import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { api, ident, type User } from "../../api";
import Avatar from "../ui/Avatar";
export default function FindPerson({
  onSelect,
}: {
  onSelect: (u: User) => void;
}) {
  const [q, setQ] = useState(""),
    [users, setUsers] = useState<User[]>([]),
    [error, setError] = useState("");
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
  return (
    <div className="modal-content">
      <div className="searchbox">
        <Search size={18} />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by username"
        />
      </div>
      {error && <p className="error-text">{error}</p>}
      <div className="modal-results">
        {users.map((u) => (
          <button
            className="list-item"
            key={ident(u)}
            onClick={() => onSelect(u)}
          >
            <Avatar user={u} />
            <span className="list-copy">
              <strong>{u.name}</strong>
              <small>@{u.username}</small>
            </span>
            <span>→</span>
          </button>
        ))}
      </div>
      <p className="subtle">
        {q && !users.length
          ? "No matching users yet."
          : "Search for someone to begin chatting."}
      </p>
    </div>
  );
}
