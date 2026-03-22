import React from "react";
import { FiCheck } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import Moment from "react-moment";
import { Link } from "react-router-dom";
import { LazyImage } from "./LazyImage/LazyImage";
import { IOrder } from "../types/order.types";

type OrderedGigCardProps = {
  orderDetail: IOrder;
};

const OrderedGigCard = ({ orderDetail }:  OrderedGigCardProps) => {

  const statusColor = () => {
    switch (orderDetail.status) {
      case "Pending":
        return "bg-yellow-500";
      case "IN_PROGRESS":
        return "bg-blue-500";
      case "Completed":
        return "bg-primary";
      case "Cancelled":
        return "bg-red-500";
      case "Delivered":
        return "bg-fuchsia-500";
      case "In Revision":
        return "bg-warning";
      default:
        return "bg-yellow-500";
    }
  };

  return (
    <div className="text-dark_grey bg-white min-w-[14rem] border-1 border-dark_separator">
      <LazyImage aspectRatio="16/10" file={orderDetail.image} lazyLoad={false} />
      <div className="p-3">
        <div className="border-b-1 border-b-dark_separator">
          <Link to={`/gig/details/${orderDetail.gig}`} className='hover:underline text-light_grey'>
            <h5 className="font-semibold">{orderDetail.gigTitle}</h5>
          </Link>
          <div className="mt-3">
            <ul className="flex flex-col gap-1 mb-3">
              <li className="grid grid-cols-[30px_auto] items-center">
                <FiCheck className="text-primary font-bold text-xl" />
                <span>
                  {orderDetail.packageDetails.revisions < 1e6
                    ? orderDetail.packageDetails.revisions
                    : "Unlimited"}
                  {" "}
                  {orderDetail.packageDetails.revisions === 1
                    ? "revision"
                    : "revisions"}
                </span>
              </li>
              <li className="grid grid-cols-[30px_auto] items-center">
                {orderDetail.packageDetails.commercialUse ? (
                  <FiCheck className="text-primary font-bold text-xl" />
                ) : (
                  <IoClose className="text-error font-bold text-xl" />
                )}
                <span className="">Commercial Use</span>
              </li>
              <li className="grid grid-cols-[30px_auto] items-center">
                {orderDetail.packageDetails.sourceFile ? (
                  <FiCheck className="text-primary font-bold text-xl" />
                ) : (
                  <IoClose className="text-error text-xl" />
                )}
                <span>Source File</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-3 py-4 [&>*]:flex [&>*]:justify-between">
          <div>
            <span className="text-light_heading text-sm">Status</span>
            <span className={`py-1 px-2 text-white uppercase text-[10px] rounded-[3px] ${statusColor()}`}>
              {orderDetail.status}
            </span>
          </div>
          <div>
            <span className="text-light_heading text-sm">Order</span>
            <span className="text-sm font-semibold">#{orderDetail.orderId}</span>
          </div>
          <div>
            <span className="text-light_heading text-sm">Order Date</span>
            <span className="text-sm font-semibold">
              <Moment format="ll">{orderDetail.createdAt}</Moment>
            </span>
          </div>
          <div>
            <span className="text-light_heading text-sm">Price</span>
            <span className="text-sm font-semibold">₹{Number(orderDetail.amount).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderedGigCard;
