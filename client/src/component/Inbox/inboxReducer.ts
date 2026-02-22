import { IMessage } from "../../types/message.types";
import { IUser } from "../../types/user.types";
import { CurrentlySelectedClientChat } from "../CurrentlySelectedClientChat/CurrentlySelectedClientChat";
import {
  FETCH_ALL_CHATS_WITH_CLIENT,
  FETCH_ALL_CLIENTS_DETAILS,
  FETCH_ALL_CLIENTS_LAST_MESSAGE,
  FETCH_ALL_CLIENTS_LIST,
  FETCH_ONLINE_STATUS_OF_CLIENTS,
  SOCKET_MESSAGE_RECEIVED,
  UPDATE_ALL_CHATS_WITH_CLIENT,
  UPDATE_ALL_CLIENTS_LIST,
  UPDATE_CLIENT_DETAILS,
  UPDATE_CLIENT_LAST_MESSAGE,
  UPDATE_CURRENTLY_SELECTED_CLIENT,
  UPDATE_CURRENTLY_SELECTED_CLIENT_ONLINE,
  UPDATE_ONLINE_STATUS_OF_CLIENTS,
  USER_OFFLINE,
  USER_ONLINE,
} from "./inboxConstant";

export type InboxMessageState = {
  listOfAllClients: string[];
  allClientsDetails: Map<string, IUser>;
  allClientUserLastMessage: Map<string, IMessage>;
  inboxMessages: IMessage[];
  onlineStatusOfClients: Map<string, boolean>;
  inboxMessagesLoading: boolean;
  currentSelectedClient: IUser | null;
  currentSelectedClientOnline: boolean
};

type Action = {
  type: string;
  payload: any;
};

export const INBOX_DETAILS_INITIAL_STATE: InboxMessageState = {
  listOfAllClients: [],
  allClientsDetails: new Map(),
  allClientUserLastMessage: new Map(),
  inboxMessages: [],
  onlineStatusOfClients: new Map(),
  inboxMessagesLoading: false,
  currentSelectedClient: null,
  currentSelectedClientOnline: false
};

export const inboxReducer = (state: InboxMessageState, action: Action): InboxMessageState => {
  switch (action.type) {
    case UPDATE_ALL_CLIENTS_LIST: {
      return {
        ...state,
        listOfAllClients: action.payload,
      };
    }
    case UPDATE_CLIENT_DETAILS: {
      return {
        ...state,
        allClientsDetails: action.payload,
      };
    }
    case UPDATE_CLIENT_LAST_MESSAGE: {
      return {
        ...state,
        allClientUserLastMessage: action.payload,
      };
    }
    case FETCH_ALL_CLIENTS_LIST: {
      const onlineStatuses = new Map();
      action.payload.map((id: string) => {
        onlineStatuses.set(id, false);
      });
      return {
        ...state,
        listOfAllClients: action.payload,
        onlineStatusOfClients: onlineStatuses,
      };
    }
    case FETCH_ALL_CLIENTS_LAST_MESSAGE: {
      const map = new Map<string, IMessage>();
      action.payload.map((item: any[]) => {
        map.set(item[0], item[1]);
      });

      return {
        ...state,
        allClientUserLastMessage: map,
      };
    }
    case FETCH_ALL_CLIENTS_DETAILS: {
      const map = new Map<string, IUser>();
      action.payload.map((item: any[]) => {
        map.set(item[0], item[1]);
      });
      return {
        ...state,
        allClientsDetails: map,
      };
    }
    case FETCH_ALL_CHATS_WITH_CLIENT: {
      //
      return {
        ...state,
        inboxMessagesLoading: true,
        inboxMessages: action.payload,
      };
    }
    case UPDATE_ALL_CHATS_WITH_CLIENT: {
      return {
        ...state,
        inboxMessagesLoading: true,
        inboxMessages: action.payload,
      };
    }
    case FETCH_ONLINE_STATUS_OF_CLIENTS: {
      return {
        ...state,
        onlineStatusOfClients: action.payload,
      };
    }
    case UPDATE_ONLINE_STATUS_OF_CLIENTS: {
      return {
        ...state,
        onlineStatusOfClients: action.payload,
      };
    }
    case UPDATE_CURRENTLY_SELECTED_CLIENT: {
      return {
        ...state,
        currentSelectedClient: action.payload,
      };
    }
    case UPDATE_CURRENTLY_SELECTED_CLIENT_ONLINE: {
      return {
        ...state,
        currentSelectedClientOnline: action.payload
      };
    }
    case SOCKET_MESSAGE_RECEIVED: {
      const { messageData, user } = action.payload;
      const {
        allClientsDetails,
        allClientUserLastMessage,
        currentSelectedClient,
        inboxMessages,
      } = state;

      let newState: InboxMessageState = state;

      if (messageData.orderId) return state;
      const isSelfReceivedMessage: boolean = user?._id === messageData.sender;

      const senderId = messageData.sender as string;
      const receiverId = messageData.receiver as string;

      const normalizedMessage: IMessage = {
        ...messageData,
        sender: isSelfReceivedMessage
          ? (user as IUser)
          : (allClientsDetails.get(senderId) as IUser),
        receiver: isSelfReceivedMessage
          ? (allClientsDetails.get(receiverId) as IUser)
          : (user as IUser),
      };

      const map = new Map(allClientUserLastMessage);
      map.set(isSelfReceivedMessage ? receiverId : senderId, normalizedMessage);

      newState = {
        ...state,
        allClientUserLastMessage: map,
      };

      if (
        currentSelectedClient?._id === senderId ||
        currentSelectedClient?._id === receiverId
      ) {
        const newInboxMessages = [...inboxMessages, normalizedMessage];
        newState = {
          ...newState,
          inboxMessages: newInboxMessages,
        };
      }
      return newState;
    }
    case USER_ONLINE: {
      const userId = action.payload;
      const {currentSelectedClient, onlineStatusOfClients} = state;
      let newState: InboxMessageState = state;
      
      if(currentSelectedClient && currentSelectedClient._id.toString() === userId){
        newState.currentSelectedClientOnline = true;
      }

      const map = new Map(onlineStatusOfClients);
      if (map.has(userId)) {
        map.set(userId, true);
      }
      newState.onlineStatusOfClients = map;

      return newState;
    }
    case USER_OFFLINE: {
      const userId = action.payload;
      const {currentSelectedClient, onlineStatusOfClients} = state;
      let newState: InboxMessageState = state;
      
      if(currentSelectedClient && currentSelectedClient._id.toString() === userId){
        newState.currentSelectedClientOnline = false;
      }

      const map = new Map(onlineStatusOfClients);
      if (map.has(userId)) {
        map.set(userId, false);
      }
      newState.onlineStatusOfClients = map;

      return newState;
    }
    default:
      return state;
  }
};
