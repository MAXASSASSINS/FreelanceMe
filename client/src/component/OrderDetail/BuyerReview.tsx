import { Rating } from "@mui/material";
import { FaRegStar, FaStar } from "react-icons/fa";
import Moment from "react-moment";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { RootState } from "../../store";
import { IUser } from "../../types/user.types";
import { Avatar } from "../Avatar/Avatar";
import { DateTag } from "../DateTag";

const BuyerReview = () => {
  const { orderDetail } = useSelector((state: RootState) => state.orderDetail);
  const { user } = useSelector((state: RootState) => state.user);
  if (!orderDetail) return null;

  const buyer = orderDetail.buyer as IUser;
  const seller = orderDetail.seller as IUser;

  const buyerFeedback = [
    {
      title: "Communication with Seller",
      description: "How responsive was the seller during the process?",
      value: orderDetail?.buyerFeedback?.communication,
    },
    {
      title: "Service as Described",
      description: "Did the result match the gig's description?",
      value: orderDetail?.buyerFeedback?.service,
    },
    {
      title: "Buy Again or Recommend",
      description: "Would you recommend buying this Gig?",
      value: orderDetail?.buyerFeedback?.recommend,
    },
  ];

  return (
    <section
      className="relative pl-6 flex flex-col gap-4 pb-16"
      style={{
        marginTop:
          new Date(orderDetail.completedAt!).toLocaleDateString() ===
          new Date(orderDetail.buyerFeedback!.createdAt).toLocaleDateString()
            ? "-2rem"
            : "0rem",
      }}
    >
      {new Date(orderDetail.completedAt!).toLocaleDateString() !==
        new Date(orderDetail.buyerFeedback!.createdAt).toLocaleDateString() && (
        <DateTag
          left={"-1.5rem"}
          date={new Date(
            orderDetail.buyerFeedback!.createdAt
          ).toLocaleDateString()}
        />
      )}
      <div className="border-b pb-6">
        <div className="flex items-center gap-4 font-semibold text-light_heading">
          <div className="p-2 aspect-square bg-orange-100 text-gold rounded-full">
            <FaStar />
          </div>
          <div className="[&>*]:leading-5 flex-grow pr-6 py-2">
            <span className="mr-2">
              {buyer._id === user!._id ? (
                "You left a review"
              ) : (
                <>
                  <Link
                    to={`/user/${buyer._id}`}
                    className="text-primary hover:underline"
                  >
                    {buyer.name}
                  </Link>
                  &nbsp; gave you a review
                </>
              )}
            </span>
            <span className="text-icons font-normal text-xs">
              <Moment format="MMM DD, H:mm A">
                {orderDetail.buyerFeedback!.createdAt}
              </Moment>
            </span>
          </div>
        </div>
        <div className="border mr-6 rounded mt-4">
          <div className="uppercase py-3 px-4 bg-separator text-light_heading font-semibold">
            {buyer._id === user!._id ? (
              "Your review"
            ) : (
              <>
                <Link
                  to={`/user/${buyer._id}`}
                  className="text-primary hover:underline"
                >
                  {buyer.name}
                </Link>
                's review
              </>
            )}
          </div>
          <div className="p-4">
            <div className="flex items-center gap-4 font-semibold text-light_heading">
              <div className="aspect-square rounded-full">
                <Avatar
                  avatarUrl={seller.avatar?.url}
                  userName={seller.name}
                  width="2rem"
                  fontSize="1rem"
                  alt={seller.name}
                />
              </div>
              <div className="[&>*]:leading-5 flex-grow pr-6 py-2">
                <span className="mr-2">
                  {buyer._id === user!._id ? (
                    "Me"
                  ) : (
                    <>
                      <Link
                        to={`/user/${buyer._id}`}
                        className="text-primary hover:underline"
                      >
                        {buyer.name}
                      </Link>
                      's message
                    </>
                  )}
                </span>
              </div>
            </div>
            <div className="ml-12 pb-4">
              <p className="leading-5 whitespace-pre-wrap pr-6 text-dark_grey max-w-2xl">
                {orderDetail.buyerFeedback!.comment}
              </p>
              <div className="pt-6 max-w-max">
                {buyerFeedback.map((feedback, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row gap-1 mb-4 sm:mb-0 sm:gap-8 sm:justify-between"
                  >
                    <h3 className=" text-light_grey font-semibold sm:mb-4">
                      {feedback.title}
                    </h3>
                    <Rating
                      size="small"
                      value={feedback.value}
                      icon={<FaStar className="text-gold" />}
                      emptyIcon={<FaRegStar className="text-gold" />}
                      readOnly
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BuyerReview;
