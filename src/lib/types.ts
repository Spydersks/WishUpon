
export type Wish = {
  id: string;
  recipientName: string;
  recipientContact: string;
  message: string;
  birthday: Date;
};

export type Person = {
    id: string;
    name: string;
    birthday: string; // Storing as ISO string
    avatar?: string;
    contact?: string; // WhatsApp number
}

export type AdminMessage = {
  id: string;
  recipientContact: string;
  message: string;
  timestamp: string; // ISO string
  read: boolean;
}

export type BirthdayWish = {
  id: string;
  senderName: string;
  senderAvatar?: string;
  recipientContact: string;
  textMessage: string;
  audioDataUri?: string;
  timestamp: string; // ISO string
  played?: boolean;
  fromAdmin?: boolean;
}
