import React from "react";
import { IoClose } from "react-icons/io5";

type ConfirmWithdrawModalProps = {
  setOpenConfirmWithdrawModal: (open: boolean) => void;
  withdrawAmount: number;
  setOpenWithdrawModal: (open: boolean) => void;
  handleWithdrawl: () => void;
};

const ConfirmWithdrawModal = ({
  setOpenConfirmWithdrawModal,
  withdrawAmount,
  setOpenWithdrawModal,
  handleWithdrawl,
}: ConfirmWithdrawModalProps) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white min-w-[80%] sm:min-w-[28rem] p-6 rounded-lg relative">
        <IoClose
          className="absolute top-4 right-4 text-lg hover:cursor-pointer"
          onClick={() => setOpenConfirmWithdrawModal(false)}
        />
        <p className="text-lg text-light_heading mb-4">
          Are you sure you want to withdraw{" "}
          <span className="">₹{withdrawAmount}?</span>
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setOpenConfirmWithdrawModal(false);
              setOpenWithdrawModal(true);
            }}
            className="px-6 mt-4 flex justify-end ml-auto py-3 text-dark_grey hover:underline  hover:cursor-pointer  rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleWithdrawl}
            className="px-6 mt-4 flex justify-end py-3 bg-primary hover:bg-primary_hover hover:cursor-pointer text-white rounded"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmWithdrawModal;
