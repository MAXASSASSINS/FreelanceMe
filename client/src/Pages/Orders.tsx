import { useEffect, useState } from "react";
import { BiShoppingBag } from "react-icons/bi";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import OrderCard from "../component/CreateGig/OrderCard";
import { useUpdateGlobalLoading } from "../context/globalLoadingContext";
import { RootState } from "../store";
import { IOrder } from "../types/order.types";
import { axiosInstance } from "../utility/axiosInstance";

export const Orders = () => {
  const updateGlobalLoading = useUpdateGlobalLoading();

  const [orders, setOrders] = useState<IOrder[]>([]);

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );

  useEffect(() => {
    const getOrderList = async () => {
      try {
        updateGlobalLoading(true);

        const { data } = await axiosInstance.post("/orders/me");
        setOrders(data.orders);
      } catch (err) {
        console.log(err);
      } finally {
        updateGlobalLoading(false);
      }
    };
    if (isAuthenticated) {
      getOrderList();
    }
  }, [isAuthenticated]);

  return (
    <div className="bg-separator">
      <div className="relative min-h-[calc(100vh-176px)] sm:min-h-[calc(100vh-81px)] p-6 py-8 sm:p-8 md:p-12 lg:p-20 max-w-[1350px] mx-auto">
        <h1 className="text-xl mb-1 font-semibold md:text-2xl lg:text-3xl">
          Welcome, {user!.name}
        </h1>
        <p className="text-sm mb-6 md:text-base">See all your orders here</p>

        {orders.length > 0 ? (
          <div className="">
            <ul className="gap-4 grid min-[524px]:grid-cols-2 md:grid-cols-1">
              {orders.map((order) => {
                return (
                  <li key={order._id}>
                    <OrderCard order={order} />
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className="flex items-center flex-col gap-2 py-[18vh] min-[600px]:py-[22vh] bg-white rounded">
            <p className="text-7xl">
              <BiShoppingBag />
            </p>
            <p className="capitalize">No orders yet</p>
          </div>
        )}
      </div>
    </div>
  );
};
