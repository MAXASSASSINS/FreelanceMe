import { useEffect, useMemo, useState } from "react";
import { AiFillQuestionCircle } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { updateUser } from "../actions/userAction";
import ConfirmWithdrawModal from "../component/BalanceDetail/ConfirmWithdrawModal";
import MyOrders from "../component/BalanceDetail/MyOrders";
import WithdrawModal from "../component/BalanceDetail/WithdrawModal";
import WithdrawSuccessModal from "../component/BalanceDetail/WithdrawSuccessModal";
import { useUpdateGlobalLoading } from "../context/globalLoadingContext";
import { AppDispatch, RootState } from "../store";
import { IOrder } from "../types/order.types";
import { IUser } from "../types/user.types";
import { axiosInstance } from "../utility/axiosInstance";
import { numberToCurrency } from "../utility/util";

export const BalanceDetail = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const updateGlobalLoading = useUpdateGlobalLoading();
  const [openWithdrawModal, setOpenWithdrawModal] = useState<boolean>(false);
  const [openConfirmWithdrawModal, setOpenConfirmWithdrawModal] =
    useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [openWithdrawSuccessModal, setOpenWithdrawSuccessModal] =
    useState<boolean>(false);

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );

  const [orderList, setOrderList] = useState<IOrder[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      getOrderList();
    }
  }, [isAuthenticated]);

  const getOrderList = async () => {
    try {
      updateGlobalLoading(true);
      const { data } = await axiosInstance.post("/orders/me", {
        status: "Completed",
      });
      setOrderList(data.orders);
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
    } finally {
      updateGlobalLoading(false);
    }
  };

  const earnings = useMemo(() => {
    return orderList.reduce((acc, order) => {
      order.seller = order.seller as IUser;
      if (order.status === "Completed" && order.seller._id === user!._id) {
        return acc + order.amount;
      }
      return acc;
    }, 0);
  }, [orderList, user]);

  const expenses = useMemo(() => {
    return orderList.reduce((acc, order) => {
      order.buyer = order.buyer as IUser;
      if (order.status === "Completed" && order.buyer._id === user!._id) {
        return acc + order.amount;
      }
      return acc;
    }, 0);
  }, [orderList, user]);

  const handleWithdrawl = async () => {
    setOpenConfirmWithdrawModal(false);
    setOpenWithdrawModal(false);
    updateGlobalLoading(true);
    try {
      const { data } = await axiosInstance.post("/withdrawl", {
        amount: withdrawAmount,
      });
      console.log(data);
      setOpenWithdrawSuccessModal(true);
      dispatch(updateUser(data.user));
    } catch (err: any) {
      console.log(err.response.data.message);
      toast.error(err.response.data.message);
    } finally {
      updateGlobalLoading(false);
    }
  };

  return (
    isAuthenticated && (
      <>
        <div className="flex justify-center">
          <div className="w-full max-w-[1400px] p-8">
            <h1 className="text-3xl font-semibold mb-4">Balance</h1>
            <div className="flex flex-col md:flex-row gap-6">
              <section className="flex-grow">
                <h2 className="text-lg font-semibold mb-1">Available Funds</h2>
                <div className="border p-6 h-64">
                  <div className="flex gap-2 text-sm items-center mb-4">
                    <p className="text-light_heading font-semibold">
                      Balance available for withdrawal
                    </p>
                    <p
                      data-tooltip-content="Minimum balance for withdrawl is ₹2000"
                      data-tooltip-id="my-tooltip"
                      data-tooltip-place="top"
                    >
                      <AiFillQuestionCircle className="text-no_focus" />
                    </p>
                  </div>
                  <h3 className="text-4xl font-bold mb-24">
                    ₹{numberToCurrency(user!.balance)}
                  </h3>
                  {user?.phone?.number &&
                    (user!.razorPayAccountDetails.status === "new" ? (
                      <button
                        onClick={() => navigate("/bank_account")}
                        className="px-4 py-3 bg-dark_grey hover:bg-light_grey hover:cursor-pointer text-white rounded"
                      >
                        Add bank account
                      </button>
                    ) : user!.razorPayAccountDetails.status === "activated" ? (
                      <button
                        onClick={() => {
                          if (!user!.withdrawEligibility) {
                            toast.error(
                              "Minimum balance for withdrawl is ₹2000"
                            );
                            return;
                          }
                          setOpenWithdrawModal(true);
                        }}
                        className="px-4 py-3 bg-dark_grey hover:bg-light_grey hover:cursor-pointer text-white rounded"
                      >
                        Withdraw balance
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate("/bank_account")}
                        className="px-4 py-3 bg-dark_grey hover:bg-light_grey hover:cursor-pointer text-white rounded"
                      >
                        Update bank details
                      </button>
                    ))}
                </div>
              </section>
              <section className="flex-grow">
                <h2 className="text-lg font-semibold mb-1">
                  Earnings & expenses
                </h2>
                <div className="border p-6 h-64">
                  <div className="border-b-2 pb-4">
                    <div className="flex gap-2 text-sm mb-4">
                      <p className="text-light_heading font-semibold">
                        Earnings to date
                      </p>
                      <p
                        data-tooltip-content="Minimum balance to withdraw is ₹2000"
                        data-tooltip-id="my-tooltip"
                        data-tooltip-place="top"
                      >
                        {/* <AiFillQuestionCircle className="text-no_focus" /> */}
                      </p>
                    </div>
                    <h3 className="text-2xl font-bold">
                      ₹{numberToCurrency(earnings)}
                    </h3>
                    <p className="text-sm mt-1 text-light_heading">
                      Your earnings since joining
                    </p>
                  </div>
                  <div className="pt-4">
                    <div className="flex gap-2 text-sm mb-4">
                      <p className="text-light_heading font-semibold">
                        Expenses to date
                      </p>
                      <p
                        data-tooltip-content="Minimum balance to withdraw is ₹2000"
                        data-tooltip-id="my-tooltip"
                        data-tooltip-place="top"
                      >
                        {/* <AiFillQuestionCircle className="text-no_focus" /> */}
                      </p>
                    </div>
                    <h3 className="text-2xl font-bold">
                      ₹{numberToCurrency(expenses)}
                    </h3>
                    <p className="text-sm mt-1 text-light_heading">
                      Your expenses since joining
                    </p>
                  </div>
                </div>
              </section>
            </div>
            <MyOrders myOrders={orderList} />
          </div>
        </div>
        {openWithdrawModal && (
          <WithdrawModal
            withdrawAmount={withdrawAmount}
            setWithdrawAmount={setWithdrawAmount}
            setOpenConfirmWithdrawModal={setOpenConfirmWithdrawModal}
            setOpenWithdrawModal={setOpenWithdrawModal}
          />
        )}
        {openConfirmWithdrawModal && (
          <ConfirmWithdrawModal
            withdrawAmount={withdrawAmount}
            handleWithdrawl={handleWithdrawl}
            setOpenConfirmWithdrawModal={setOpenConfirmWithdrawModal}
            setOpenWithdrawModal={setOpenWithdrawModal}
          />
        )}
        {openWithdrawSuccessModal && (
          <WithdrawSuccessModal
            setOpenWithdrawSuccessModal={setOpenWithdrawSuccessModal}
          />
        )}
      </>
    )
  );
};
