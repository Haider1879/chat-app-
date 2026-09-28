import { useState, type FormEvent } from "react";
import { ImagePlus } from "lucide-react";
import { api, json, type User } from "../../api";
import Avatar from "../ui/Avatar";
export default function Profile({
  user,
  onUpdate,
  onLogout,
}: {
  user: User;
  onUpdate: (u: User) => void;
  onLogout: () => void;
}) {
  const [name, setName] = useState(user.name),
    [username, setUsername] = useState(user.username),
    [bio, setBio] = useState(user.bio || ""),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  async function save(e: FormEvent) {
    e.preventDefault();
    try {
      const r = await api<{ user: User }>(
        "/api/users/me",
        json("PATCH", { name, username, bio }),
      );
      onUpdate(r.user);
      setNotice("Profile updated");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function avatar(file: File) {
    const fd = new FormData();
    fd.append("avatar", file);
    try {
      const r = await api<{ avatar: string }>("/api/users/me/avatar", {
        method: "POST",
        body: fd,
      });
      onUpdate({ ...user, avatar: r.avatar });
      setNotice("Photo updated");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <form className="modal-content form-stack" onSubmit={save}>
      <div className="profile-top">
        <Avatar user={user} size={70} />
        <label className="upload-label">
          <ImagePlus size={16} /> Change photo
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              if (e.target.files?.[0]) avatar(e.target.files[0]);
            }}
          />
        </label>
      </div>
      <label>
        Name
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>
      <label>
        Username
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </label>
      <label>
        Bio
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          placeholder="A little about you"
        />
      </label>
      <p className="subtle">{user.email}</p>
      {error && <p className="error-text">{error}</p>}
      {notice && <p className="success-text">{notice}</p>}
      <button className="primary full">Save changes</button>
      <button className="secondary full" type="button" onClick={onLogout}>
        Sign out
      </button>
    </form>
  );
}
