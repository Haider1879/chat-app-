import { MessageCircle } from "lucide-react";
export default function EmptyList({
  text,
  sub,
  action,
  onClick,
}: {
  text: string;
  sub: string;
  action?: string;
  onClick?: () => void;
}) {
  return (
    <div className="empty-list">
      <div className="empty-symbol">
        <MessageCircle size={22} />
      </div>
      <strong>{text}</strong>
      <p>{sub}</p>
      {action && <button onClick={onClick}>{action} →</button>}
    </div>
  );
}
