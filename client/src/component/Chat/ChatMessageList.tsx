import { IMessage } from "../../types/message.types";
import ChatMessage from "./ChatMessage";

type ChatMessageListProps = {
  chatMessages: IMessage[];
};

const ChatMessageList = ({ chatMessages }: ChatMessageListProps) => {
  return (
    <ul className="scroll-smooth overflow-hidden overflow-y-auto">
      {chatMessages &&
        chatMessages.map((message) => (
          <li className="mb-8 last:mb-4">
            <ChatMessage message={message} />
          </li>
        ))}
    </ul>
  );
};

export default ChatMessageList;
