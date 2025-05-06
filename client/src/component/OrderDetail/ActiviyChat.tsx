import React from "react";
import { RootState } from "../../store";
import { useSelector } from "react-redux";
import { Avatar } from "../Avatar/Avatar";
import { Link } from "react-router-dom";
import { IUser } from "../../types/user.types";
import { ChatBox } from "./ChatBox";

type ActiviyChatProps = {
  online: boolean;
  setFileLoading: (val: boolean) => void;
};

const ActiviyChat = ({ online, setFileLoading }: ActiviyChatProps) => {
  const { user } = useSelector((state: RootState) => state.user);
  const { orderDetail } = useSelector((state: RootState) => state.orderDetail);

  if (!orderDetail) return null;
  if (!user) return null;

  const seller = orderDetail.seller as IUser;
  const buyer = orderDetail.buyer as IUser;

  return (
    <>
      <section className="relative pl-6 flex flex-col gap-4 pb-4">
        <div className="flex items-center gap-4 text-light_heading">
          <div className="aspect-square rounded-full">
            <Avatar
              avatarUrl={user!.avatar?.url}
              userName={user!.name}
              width="2rem"
              fontSize="1rem"
              alt={user!.name}
            />
          </div>
          <div className="[&>*]:leading-5 py-2 pr-6 flex-grow  flex justify-between items-center">
            <span className="mr-2 font-semibold text-primary">
              Have something to share with &nbsp;
              <Link
                to={`/user/${user._id === seller._id ? buyer._id : seller._id}`}
                className="text-primary hover:underline"
              >
                {user._id === seller._id ? buyer.name : seller.name}
              </Link>
              ?
            </span>
            <span className="flex items-center gap-2">
              <div
                className={`w-2 h-2 text-light_heading rounded-full ${
                  online ? "bg-primary" : "bg-no_focus"
                }`}
              ></div>
              <div>
                {user._id === seller._id ? "Buyer" : "Seller"} is{" "}
                {online ? "Online" : "Offline"}
              </div>
            </span>
          </div>
        </div>
      </section>

      <div className="px-6">
        <ChatBox setFileLoading={(val) => setFileLoading(val)} />
      </div>
    </>
  );
};

export default ActiviyChat;
