import { IMessage } from "../../types/message.types";
import { IUser } from "../../types/user.types";
import {
  FETCH_ALL_CHATS_WITH_CLIENT,
  FETCH_ALL_CLIENTS_DETAILS,
  FETCH_ALL_CLIENTS_LAST_MESSAGE,
  FETCH_ALL_CLIENTS_LIST,
  FETCH_ONLINE_STATUS_OF_CLIENTS,
  UPDATE_ALL_CHATS_WITH_CLIENT,
  UPDATE_ALL_CLIENTS_LIST,
  UPDATE_CLIENT_DETAILS,
  UPDATE_CLIENT_LAST_MESSAGE,
  UPDATE_ONLINE_STATUS_OF_CLIENTS,
} from "./inboxConstant";

export type InboxMessageState = {
  listOfAllClients: string[];
  allClientsDetails: Map<string, IUser>;
  allClientUserLastMessage: Map<string, IMessage>;
  inboxMessages: IMessage[];
  onlineStatusOfClients: Map<string, boolean>;
  inboxMessagesLoading: boolean;
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
};

export const inboxReducer = (state: InboxMessageState, action: Action) => {
  switch (action.type) {
    case UPDATE_ALL_CLIENTS_LIST:
      return {
        ...state,
        listOfAllClients: action.payload,
      };
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

    default:
      return state;
  }
};
