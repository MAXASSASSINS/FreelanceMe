import { BsCheckCircle } from "react-icons/bs";

type DataSendingLoadingProps = {
  finishedLoading?: boolean;
  show: boolean;
  loadingText?: string;
  pos?: "static" | "relative" | "absolute" | "sticky" | "fixed";
};

export const DataSendingLoading = ({
  finishedLoading,
  show,
  loadingText = "",
  pos = "fixed",
}: DataSendingLoadingProps) => {
  return (
    <div
      className={`data-sending-loading-overlay inset-0 ${pos} w-full h-full bg-[rgba(255,255,255,0.9)] flex justify-center items-center rounded z-[100] ${
        show ? "flex" : "hidden"
      }`}
      // style={{ position: pos }}
    >
      {!finishedLoading ? (
        <div className="flex flex-col gap-4 justify-center items-center">
          <p className="saving-your-gig text-icons font-bold">{loadingText}</p>
          <span className="data-sending-loader w-12 h-12 text-[2.5rem] border-[5px] border-separator border-b-light_heading rounded-full inline-block box-border animate-spin"></span>
        </div>
      ) : (
        <div className="finished-loading-wrapper flex flex-col gap-4 justify-center items-center">
          <p className="aving-your-gig text-icons font-bold">Changes saved!</p>
          <span className="w-12 h-12 text-[2.5rem] text-primary">
            <BsCheckCircle />
          </span>
        </div>
      )}
    </div>
  );
};
