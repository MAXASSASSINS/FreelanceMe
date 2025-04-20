import { useState } from "react";
import { IoClose } from "react-icons/io5";
import { DataSendingLoading } from "../DataSendingLoading";
import { ChatBox } from "./ChatBox";

type DeliveryModalProps = {
  closeDeliveryModal: () => void;
};

export const DeliveryModal = ({ closeDeliveryModal }: DeliveryModalProps) => {
  const [fileLoading, setFileLoading] = useState(false);

  const handleFileLoading = (val: boolean) => {
    setFileLoading(val);
    if (!val) {
      closeDeliveryModal();
    }
  };

  return (
    <div className="bg-[rgba(0,0,0,0.5)] w-full h-full inset-0 z-[1000] fixed flex justify-center items-center">
      <DataSendingLoading show={fileLoading} />
      <div className="relative bg-white p-8 w-1/2 rounded min-w-[20rem] max-w-md aspect-video">
        <div
          onClick={closeDeliveryModal}
          className="absolute right-4 top-4 text-xl hover:cursor-pointer"
        >
          <IoClose />
        </div>
        <div className="font-semibold mb-4 text-xl text-light_grey">
          Deliver your work
        </div>
        <ChatBox
          setFileLoading={(val) => handleFileLoading(val)}
          isDeliveryMessage={true}
        />
      </div>
    </div>
  );
};
