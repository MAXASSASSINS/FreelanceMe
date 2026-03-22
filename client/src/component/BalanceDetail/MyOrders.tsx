import React from "react";
import { IOrder } from "../../types/order.types";
import { IUser } from "../../types/user.types";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { Link } from "react-router-dom";
import { numberToCurrency } from "../../utility/util";

type MyOrdersProps = {
  myOrders: IOrder[];
};

const MyOrders = ({ myOrders }: MyOrdersProps) => {
  const { user } = useSelector((state: RootState) => state.user);
  return (
    <div>
      <div className="border border-b-0 text-sm rounded mt-8">
        <header>
          <ul className="border-b bg-separator p-4 grid gap-4 grid-cols-2 min-[480px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 font-semibold">
            <div className="md:col-span-2 md:grid md:grid-cols-2 md:gap-4">
              <li>Date</li>
              <li className="hidden md:inline">Activity</li>
            </div>
            <li className="hidden sm:inline">From / To</li>
            <li className="hidden min-[480px]:inline">Order</li>
            <li className="text-right">Amount</li>
          </ul>
        </header>
        <main>
          {myOrders?.length > 0 ? (
            <ul>
              {myOrders.map((order, index) => {
                order.seller = order.seller as IUser;
                order.buyer = order.buyer as IUser;
                return (
                  order.status === "Completed" && (
                    <div
                      key={index}
                      className="border-b p-4 py-8 grid grid-cols-2 min-[480px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4"
                    >
                      <div className="flex flex-col-reverse gap-1 md:col-span-2 md:grid md:grid-cols-2 md:gap-4">
                        <li className="text-xs font-light md:font-normal md:text-sm">
                          {new Date(order.completedAt!).toLocaleDateString()}
                        </li>
                        <li className="capitalize">
                          {(order.seller as IUser)._id === user!._id
                            ? "Earning"
                            : "Buying"}
                        </li>
                      </div>
                      <li className="hidden sm:inline">
                        {order.seller._id === user!._id
                          ? order.buyer.name
                          : order.seller.name}
                      </li>
                      <li className="hidden min-[480px]:inline uppercase underline hover:cursor-pointer">
                        <Link to={`/orders/${order._id}`}>{order.orderId}</Link>
                      </li>
                      <li
                        className={`text-right font-semibold ${
                          order.seller._id === user!._id
                            ? "text-primary"
                            : "text-warning"
                        }`}
                      >
                        ₹{numberToCurrency(order.amount)}
                      </li>
                    </div>
                  )
                );
              })}
            </ul>
          ) : (
            <div className="flex justify-center border-b items-center h-56">
              <p className="text-base text-no_focus">No transactions yet</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MyOrders;
