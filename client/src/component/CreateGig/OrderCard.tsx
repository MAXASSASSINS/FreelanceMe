import React from "react";
import { IOrder } from "../../types/order.types";
import { Avatar } from "../Avatar/Avatar";
import { RootState } from "../../store";
import { useSelector } from "react-redux";
import { IGig } from "../../types/gig.types";
import { IUser } from "../../types/user.types";
import { useNavigate } from "react-router-dom";

type OrderCardProps = {
  order: IOrder;
};

const OrderCard = ({ order }: OrderCardProps) => {
  const { user } = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();

  const handleViewClick = (order: IOrder) => {
    if (order.status === "Pending") {
      navigate(`/gig/place/order/submit/requirements/${order._id}`);
    } else {
      navigate(`/orders/${order._id}`);
    }
  };

  order.gig = order.gig as IGig;
  order.buyer = order.buyer as IUser;
  order.seller = order.seller as IUser;

  return (
    <li
      key={order._id}
      className="flex flex-col gap-4 p-4 border border-dark_separator rounded-[4px] mb-6 bg-white shadow-sm md:flex-row md:items-center lg:gap-8"
    >
      <img
        src={order.gig.images?.[0].url}
        alt="gig"
        className="h-40 md:h-12 md:w-20"
      />
      <div className="relative flex gap-4 flex-col md:flex-row md:flex-grow md:justify-between md:items-center">
        <div className="grid grid-cols-[2rem_auto] gap-3 border-b-2 pb-1 border-b-dark_separator md:border-none md:w-60 lg:w-80">
          <Avatar
            avatarUrl={
              user?._id === order.seller._id
                ? order.buyer.avatar?.url
                : order.seller.avatar?.url
            }
            userName={
              user!._id === order.seller._id
                ? order.buyer.name
                : order.seller.name
            }
            width="2rem"
            fontSize="1rem"
          />
          <div className="pb-2 md:p-0">
            {user!._id === order.seller._id ? (
              <div>
                <p className="text-dark_grey mt-2">{order.buyer.name}</p>
              </div>
            ) : (
              <div>
                <p className="text-xs mb-0.5 text-light_heading">
                  {order.seller.name}
                </p>
                <p className="text-dark_grey leading-5 md:text-sm lg:text-base">
                  {order.gigTitle}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center text-light_heading text-sm md:flex-col md:items-start md:gap-2">
          <p className="flex-grow flex-shrink text-icons md:flex-grow-0 md:flex-shrink-0">
            Price
          </p>
          <p>₹{order.amount}</p>
        </div>

        <div className="flex items-center text-sm md:flex-col md:items-start md:gap-2">
          <p className="flex-grow flex-shrink text-icons md:flex-grow-0 md:flex-shrink-0">
            Status
          </p>
          <p className=" bg-icons text-white px-2 py-1 text-[10px] border rounded-full uppercase">
            {order.status}
          </p>
        </div>

        <div
          className="border border-primary p-2 text-center rounded text-primary hover:cursor-pointer md:border-none md:mr-4"
          onClick={() => handleViewClick(order)}
        >
          View
        </div>
      </div>
    </li>
  );
};

export default OrderCard;
