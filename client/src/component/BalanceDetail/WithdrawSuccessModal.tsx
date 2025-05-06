import React from "react";
import AnimatedCheck from "../AnimatedCheck/AnimatedCheck";
import { IoClose } from "react-icons/io5";

type WithdrawSuccessModalProps = {
  setOpenWithdrawSuccessModal: (open: boolean) => void;
};

const WithdrawSuccessModal = ({setOpenWithdrawSuccessModal}: WithdrawSuccessModalProps) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white min-w-[80%] sm:min-w-[28rem] sm:max-w-[32rem] p-6 rounded-lg relative">
        <IoClose
          className="absolute top-4 right-4 text-lg hover:cursor-pointer"
          onClick={() => setOpenWithdrawSuccessModal(false)}
        />
        <p className="text-xl text-light_heading">Withdrawl successful</p>
        <p className="text-light_heading leading-5 mt-1 mb-4">
          We recieved you request and amount will be transferred to your account
          withing 15 working days.
        </p>
        <div>
          <AnimatedCheck />
        </div>
        <button
          onClick={() => setOpenWithdrawSuccessModal(false)}
          className="px-6 mt-4 flex justify-end ml-auto py-3 bg-primary hover:bg-primary_hover hover:cursor-pointer text-white rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default WithdrawSuccessModal;
