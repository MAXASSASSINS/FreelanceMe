import { BiTimeFive } from "react-icons/bi";
import { GoPencil } from "react-icons/go";
import { RiRocket2Line } from "react-icons/ri";
import Moment from "react-moment";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { RootState } from "../../store";
import { IUser } from "../../types/user.types";
import SpecialMessage from "./SpecialMessage";

const CommonOrderStartMessage = () => {
  const { orderDetail } = useSelector((state: RootState) => state.orderDetail);
  const { user } = useSelector((state: RootState) => state.user);
  if (!orderDetail) return null;
  if (!user) return null;

  const buyer = orderDetail.buyer as IUser;

  return (
    <>
      <SpecialMessage
        date={orderDetail.createdAt}
        icon={<GoPencil />}
        iconBgColor={"bg-blue-200"}
        iconColor={"text-blue-600"}
      >
        {buyer._id === user._id ? (
          "You"
        ) : (
          <Link to={`/user/${buyer._id}`}>{buyer.name}</Link>
        )}
        &nbsp; sent the requirements
      </SpecialMessage>

      <SpecialMessage
        icon={<RiRocket2Line />}
        iconBgColor="bg-green-200"
        iconColor="text-green-600"
        date={orderDetail.createdAt}
      >
        The order started
      </SpecialMessage>

      <SpecialMessage
        icon={<BiTimeFive />}
        iconBgColor="bg-green-200"
        iconColor="text-green-600"
        date={orderDetail.createdAt}
      >
        The delivery date was updated to &nbsp;
        <Moment format="MMM DD">{orderDetail.deliveryDate}</Moment>
      </SpecialMessage>
    </>
  );
};

export default CommonOrderStartMessage;
