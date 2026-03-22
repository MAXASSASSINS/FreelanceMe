import { Rating } from "@mui/material";
import { FaRegStar, FaStar } from "react-icons/fa";
import Moment from "react-moment";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { RootState } from "../../store";
import { IUser } from "../../types/user.types";
import { Avatar } from "../Avatar/Avatar";
import { DateTag } from "../DateTag";

const SellerReview = () => {
  const { orderDetail } = useSelector((state: RootState) => state.orderDetail);
  const { user } = useSelector((state: RootState) => state.user);
  if (!orderDetail) return null;

  const seller = orderDetail.seller as IUser;
  return (
    <section
      className="relative pl-6 flex flex-col gap-4 pb-12"
      style={{
        marginTop:
          new Date(
            orderDetail.sellerFeedback!.createdAt!
          ).toLocaleDateString() ===
          new Date(orderDetail.buyerFeedback!.createdAt!).toLocaleDateString()
            ? "-2rem"
            : "0rem",
      }}
    >
      {new Date(orderDetail.sellerFeedback!.createdAt).toLocaleDateString() !==
        new Date(orderDetail.buyerFeedback!.createdAt).toLocaleDateString() && (
        <DateTag
          left={"-1.5rem"}
          date={new Date(
            orderDetail.buyerFeedback!.createdAt
          ).toLocaleDateString()}
        />
      )}
      <div className="pb-6">
        <div className="flex items-center gap-4 font-semibold text-light_heading">
          <div className="p-2 aspect-square bg-orange-100 text-gold rounded-full">
            <FaStar />
          </div>
          <div className="[&>*]:leading-5 flex-grow pr-6 py-2">
            <span className="mr-2">
              {seller._id === user!._id ? (
                "You left a review"
              ) : (
                <>
                  <Link
                    to={`/user/${seller._id}`}
                    className="text-primary hover:underline"
                  >
                    {seller.name}
                  </Link>
                  &nbsp; gave you a review
                </>
              )}
            </span>
            <span className="text-icons font-normal text-xs">
              <Moment format="MMM DD, H:mm A">
                {orderDetail.sellerFeedback!.createdAt}
              </Moment>
            </span>
          </div>
        </div>
        <div className="border mr-6 rounded mt-4">
          <div className="uppercase py-3 px-4 bg-separator text-light_heading font-semibold">
            {seller._id === user!._id ? (
              "Your review"
            ) : (
              <>
                <Link
                  to={`/user/${seller._id}`}
                  className="text-primary hover:underline"
                >
                  {seller.name}
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
              <div className="[&>*]:leading-5 flex items-center flex-grow pr-6 py-2">
                <span className="mr-2">
                  {seller._id === user!._id ? (
                    "Me"
                  ) : (
                    <>
                      <Link
                        to={`/user/${seller._id}`}
                        className="text-primary hover:underline"
                      >
                        {seller.name}
                      </Link>
                      's message
                    </>
                  )}
                </span>
                <Rating
                  size="small"
                  value={orderDetail.sellerFeedback!.rating}
                  icon={<FaStar className="text-gold" />}
                  emptyIcon={<FaRegStar className="text-gold" />}
                  readOnly
                />
              </div>
            </div>
            <div className="ml-12 pb-4">
              <p className="leading-5 pr-6 whitespace-pre-wrap text-dark_grey max-w-2xl">
                {orderDetail.sellerFeedback!.comment}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SellerReview;
