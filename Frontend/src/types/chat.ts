export type User = {
  id: string;
  name: string;
  username: string;
  email?: string;
  bio?: string;
  avatar?: string;
  avatarUrl?: string;
  status?: string;
  lastSeen?: string;
};
export type Message = {
  _id: string;
  conversation?: string | null;
  group?: string | null;
  sender: User | string;
  text: string;
  type: string;
  attachment?: string | null;
  VoiceUrl?: string | null;
  status: string;
  createdAt: string;
  isDeleted?: boolean;
  replyTo?: Message | null;
  location?: { lat: number; lng: number; label?: string };
};
export type Conversation = {
  id: string;
  user: User | null;
  lastMessage?: Message | null;
  unreadCount: number;
  updatedAt: string;
};
export type Group = {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  members: User[];
  memberCount: number;
  isAdmin: boolean;
  isCreator: boolean;
  lastMessage?: { text: string; type: string; createdAt: string } | null;
  updatedAt: string;
};
export type Request = { _id: string; sender: User; createdAt: string };
export type Chat = { kind: "dm" | "group"; id: string };
