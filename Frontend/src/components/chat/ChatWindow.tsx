import {
  ArrowLeft,
  Check,
  CheckCheck,
  ChevronDown,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Plus,
  Send,
  Smile,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { ident, type Group } from "../../api";
import { stamp } from "../../lib/format";
import { mediaUrl } from "../../lib/mediaUrl";
import type { ChatModel } from "../../hooks/useChatController";
import Avatar from "../ui/Avatar";
export default function ChatWindow({ model: m }: { model: ChatModel }) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojis = [
    "😊",
    "😂",
    "😍",
    "😘",
    "😎",
    "🤔",
    "😢",
    "😡",
    "🥳",
    "🤗",
    "👍",
    "👏",
    "🙏",
    "❤️",
    "🔥",
    "🎉",
    "✨",
    "💯",
  ];
  const {
    active,
    setActive,
    selected,
    title,
    peer,
    typing,
    online,
    messages,
    user,
    hasMore,
    older,
    bottomRef,
    reply,
    setReply,
    deleteMessage,
    fileRef,
    upload,
    send,
    draft,
    setDraft,
    signalTyping,
    busy,
    setModal,
  } = m;
  return (
    <main className={`chat-panel ${!active ? "hide-mobile" : ""}`}>
      {active ? (
        <>
          <header className="chat-header">
            <button className="back" onClick={() => setActive(null)}>
              <ArrowLeft size={20} />
            </button>
            <Avatar user={peer} name={title} />
            <div className="chat-heading">
              <strong>{title || "Conversation"}</strong>
              <small>
                {typing
                  ? "typing…"
                  : active.kind === "group"
                    ? `${(selected as Group)?.memberCount || 0} members`
                    : (online[ident(peer)] || peer?.status) === "online"
                      ? "Online"
                      : peer?.username
                        ? `@${peer.username}`
                        : "Offline"}
              </small>
            </div>
            <button
              className="icon-btn"
              title="Conversation details"
              onClick={() => setModal("details")}
            >
              <MoreHorizontal />
            </button>
          </header>
          <div className="chat-body">
            <div className="chat-inner">
              {hasMore && (
                <button className="load-more" onClick={older}>
                  Load earlier messages <ChevronDown size={14} />
                </button>
              )}
              {messages.length === 0 && (
                <div className="conversation-start">
                  <div className="start-icon">
                    <MessageCircle size={26} />
                  </div>
                  <h3>Say hello to {title}</h3>
                  <p>
                    This is the start of your conversation. Send a message to
                    get things going.
                  </p>
                </div>
              )}
              {messages.map((m) => {
                const own = ident(m.sender) === user?.id;
                const isImage = m.type === "image" && Boolean(m.attachment);
                return (
                  <div
                    className={`message-row ${own ? "mine" : ""} ${isImage ? "image-row" : ""}`}
                    key={m._id}
                  >
                    {!own && active.kind === "group" && (
                      <Avatar
                        user={typeof m.sender === "string" ? null : m.sender}
                        size={30}
                      />
                    )}
                    <div className="message-stack">
                      {!own && active.kind === "group" && (
                        <span className="sender-name">
                          {typeof m.sender === "string"
                            ? "Member"
                            : m.sender.name}
                        </span>
                      )}
                      <div
                        className={`bubble ${m.type === "image" && m.attachment ? "image-bubble" : ""}`}
                      >
                        {m.replyTo && (
                          <div className="reply-preview">
                            ↳ {m.replyTo.text || "Attachment"}
                          </div>
                        )}
                        {m.isDeleted ? (
                          <i>Message deleted</i>
                        ) : m.type === "image" && m.attachment ? (
                          <button
                            type="button"
                            className="image-trigger"
                            onClick={() =>
                              setPreviewImage(mediaUrl(m.attachment))
                            }
                            aria-label="Open shared image"
                          >
                            <img
                              className="bubble-image"
                              src={mediaUrl(m.attachment)}
                              alt="Shared image"
                            />
                          </button>
                        ) : m.type === "voice" &&
                          (m.attachment || m.VoiceUrl) ? (
                          <audio
                            controls
                            src={mediaUrl(m.attachment || m.VoiceUrl)}
                          />
                        ) : m.type === "location" && m.location ? (
                          <a
                            href={`https://maps.google.com/?q=${m.location.lat},${m.location.lng}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            📍 View shared location
                          </a>
                        ) : (
                          <span>{m.text}</span>
                        )}
                        <div className="bubble-meta">
                          {stamp(m.createdAt)}{" "}
                          {own &&
                            (m.status === "read" ? (
                              <CheckCheck size={14} className="read-icon" />
                            ) : m.status === "delivered" ? (
                              <CheckCheck size={14} />
                            ) : (
                              <Check size={14} />
                            ))}
                        </div>
                      </div>
                      <div className="message-actions">
                        <button onClick={() => setReply(m)}>Reply</button>
                        <button
                          onClick={() =>
                            setDeleteTarget((current) =>
                              current === m._id ? null : m._id,
                            )
                          }
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                      {deleteTarget === m._id && (
                        <div className="delete-menu">
                          <button
                            onClick={() => {
                              deleteMessage(m, "me");
                              setDeleteTarget(null);
                            }}
                          >
                            Delete for me
                          </button>
                          {own && (
                            <button
                              onClick={() => {
                                deleteMessage(m, "everyone");
                                setDeleteTarget(null);
                              }}
                            >
                              Delete for everyone
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          </div>
          <div className="composer-area">
            {reply && (
              <div className="replying">
                <span>
                  Replying to{" "}
                  <b>
                    {typeof reply.sender === "string"
                      ? "message"
                      : reply.sender.name}
                  </b>
                  : {reply.text || "Attachment"}
                </span>
                <button onClick={() => setReply(null)}>
                  <X size={16} />
                </button>
              </div>
            )}
            <form className="composer" onSubmit={send}>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,audio/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) upload(file);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                className="icon-btn"
                title="Attach image or audio"
                onClick={() => fileRef.current?.click()}
              >
                <Paperclip size={19} />
              </button>
              <input
                className="message-input"
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  signalTyping();
                }}
                placeholder="Write a message..."
                aria-label="Write a message"
              />
              <div className="emoji-picker-wrap">
                {showEmojiPicker && (
                  <div className="emoji-picker" role="listbox" aria-label="Emoji picker">
                    {emojis.map((emoji) => (
                      <button
                        type="button"
                        key={emoji}
                        className="emoji-option"
                        onClick={() => {
                          setDraft((d) => d + emoji);
                          setShowEmojiPicker(false);
                        }}
                        aria-label={`Add ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  className="icon-btn emoji"
                  onClick={() => setShowEmojiPicker((open) => !open)}
                  title="Add emoji"
                  aria-label="Add emoji"
                >
                  <Smile size={19} />
                </button>
              </div>
              <button
                type="submit"
                className="send-btn"
                disabled={!draft.trim() || busy}
                title="Send message"
              >
                <Send size={18} />
              </button>
            </form>
            <p className="composer-hint">
              Press Enter to send · Images and audio up to 15 MB
            </p>
          </div>
        </>
      ) : (
        <div className="welcome">
          <div className="welcome-graphic">
            <div className="ring-shape ring-a" />
            <div className="ring-shape ring-b" />
            <div className="welcome-logo">
              r<span>.</span>
            </div>
            <span className="spark spark-a">✳</span>
            <span className="spark spark-b">✦</span>
          </div>
          <p className="eyebrow">YOUR CONVERSATIONS START HERE</p>
          <h1>
            A little closer,
            <br />
            <em>one message at a time.</em>
          </h1>
          <p>Select a conversation or find someone new to talk to.</p>
          <button className="primary" onClick={() => setModal("new")}>
            <Plus size={18} /> New conversation
          </button>
        </div>
      )}
      {previewImage && (
        <div
          className="image-viewer"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={() => setPreviewImage(null)}
        >
          <button
            type="button"
            className="image-viewer-close"
            onClick={() => setPreviewImage(null)}
            aria-label="Close image preview"
          >
            <X size={22} />
          </button>
          <img
            className="image-viewer-image"
            src={previewImage}
            alt="Shared image preview"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </main>
  );
}
