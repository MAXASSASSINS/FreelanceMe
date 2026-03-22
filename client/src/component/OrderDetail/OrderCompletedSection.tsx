import { IoDocumentOutline } from "react-icons/io5";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { RootState } from "../../store";
import { IUser } from "../../types/user.types";
import { DateTag } from "../DateTag";
import { SellerFeedback } from "../Feedback/SellerFeedback";
import { DateWiseMessage } from "./Activities";
import BuyerReview from "./BuyerReview";
import SellerReview from "./SellerReview";
import SpecialMessage from "./SpecialMessage";

type OrderCompletedSectionProps = {
  orderMessages: DateWiseMessage[];
};

const OrderCompletedSection = ({
  orderMessages,
}: OrderCompletedSectionProps) => {
  const { orderDetail } = useSelector((state: RootState) => state.orderDetail);
  const { user } = useSelector((state: RootState) => state.user);

  if (!orderDetail) return null;

  const buyer = orderDetail.buyer as IUser;
  const seller = orderDetail.seller as IUser;

  return (
    <>
      <section
        className="relative pl-6 flex flex-col gap-4 pb-12"
        style={{
          marginTop: orderMessages.some((message) => {
            return (
              message.date ===
              new Date(orderDetail.completedAt!).toLocaleDateString()
            );
          })
            ? "-3rem"
            : "0rem",
        }}
      >
        {!orderMessages.some((message) => {
          return (
            message.date ===
            new Date(orderDetail.completedAt!).toLocaleDateString()
          );
        }) && (
          <DateTag
            left={"-1.5rem"}
            date={new Date(orderDetail.completedAt!).toLocaleDateString()}
          />
        )}

        <SpecialMessage
          iconColor="text-purple-600"
          iconBgColor="bg-purple-200"
          icon={<IoDocumentOutline />}
          date={orderDetail.completedAt!}
        >
          The order was completed
        </SpecialMessage>
      </section>

      {buyer._id === user!._id && !orderDetail.buyerFeedbackSubmitted && (
        <Link to={`/orders/${orderDetail._id}/feedback`}>
          <div className="flex justify-end mx-6">
            <button className="p-3 px-4 relative bg-primary hover:cursor-pointer hover:bg-primary_hover text-white rounded-sm">
              Share Feedback
            </button>
          </div>
        </Link>
      )}

      {orderDetail.buyerFeedbackSubmitted &&
        (user!._id === buyer._id ||
          (user!._id === (orderDetail.seller as IUser)._id &&
            orderDetail.sellerFeedbackSubmitted)) && <BuyerReview />}

      {orderDetail.sellerFeedbackSubmitted && <SellerReview />}

      {seller._id === user!._id &&
        orderDetail.buyerFeedbackSubmitted &&
        !orderDetail.sellerFeedbackSubmitted && (
          <section className="relative px-6 flex flex-col gap-4 pb-12">
            <SellerFeedback />
          </section>
        )}
    </>
  );
};

export default OrderCompletedSection;
