import type { User } from "../../types/chat";
import { initials } from "../../lib/format";
import { mediaUrl } from "../../lib/mediaUrl";
export default function Avatar({
  user,
  name,
  size = 42,
}: {
  user?: User | null;
  name?: string;
  size?: number;
}) {
  const label = name || user?.name || "Unknown";
  const url = user?.avatarUrl || user?.avatar;
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, fontSize: size * 0.31 }}
    >
      {url ? <img src={mediaUrl(url)} alt={label} /> : initials(label)}
    </span>
  );
}
