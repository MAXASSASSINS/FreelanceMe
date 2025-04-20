import { IoClose } from "react-icons/io5";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { RootState } from "../../store";

type WithdrawModalProps = {
  setOpenWithdrawModal: (open: boolean) => void;
  setOpenConfirmWithdrawModal: (open: boolean) => void;
  withdrawAmount: number;
  setWithdrawAmount: (amount: number) => void;
};

const WithdrawModal = ({
  setOpenWithdrawModal,
  setOpenConfirmWithdrawModal,
  setWithdrawAmount,
  withdrawAmount,
}: WithdrawModalProps) => {
  const { user } = useSelector((state: RootState) => state.user);

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white min-w-[80%] sm:min-w-[28rem] p-8 rounded-lg relative">
        <IoClose
          className="absolute top-4 right-4 text-2xl hover:cursor-pointer"
          onClick={() => setOpenWithdrawModal(false)}
        />
        <h2 className="text-xl mb-4 font-semibold">Withdraw Funds</h2>
        <input
          type="number"
          step={5}
          placeholder="Enter amount"
          className="w-full border p-3 rounded mb-4"
          max={user!.balance}
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(Number(e.target.value))}
        />

        <button
          onClick={() => {
            if (withdrawAmount > user!.balance) {
              toast.error("Insufficient balance");
              return;
            }
            if (withdrawAmount < 100) {
              toast.error("Minimum withdrawl amount is ₹100");
              return;
            }
            setOpenWithdrawModal(false);
            setOpenConfirmWithdrawModal(true);
          }}
          className="px-6 mt-4 flex justify-end ml-auto py-3 bg-dark_grey hover:bg-light_grey hover:cursor-pointer text-white rounded"
        >
          Withdraw
        </button>
      </div>
    </div>
  );
};

export default WithdrawModal;
