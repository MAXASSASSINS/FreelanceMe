import Moment from "react-moment";
import { Link } from "react-router-dom";
import { IOrder } from "../../types/order.types";
import { IUser } from "../../types/user.types";

type DetailsProps = {
  orderDetail: IOrder;
};

export const Details = ({ orderDetail }: DetailsProps) => {
  const { packageDetails, gigTitle, orderId, createdAt, duration } =
    orderDetail;

  const {
    packageTitle,
    packageDescription,
    revisions,
    sourceFile,
    commercialUse,
    packagePrice,
  } = packageDetails;

  orderDetail.buyer = orderDetail.buyer as IUser;
  

  return (
    <div className="bg-white p-8 text-dark_grey rounded shadow-md">
      <div className="flex justify-between mb-2">
        <div>
          <h1 className="text-xl font-semibold mb-3">{gigTitle}</h1>
          <div className="flex flex-col min-[1100px]:flex-row gap-2 text-light_heading mb-2">
            <h2>
              Ordered by &nbsp;
              <Link
                className="text-primary underline"
                to={`/user/${orderDetail.buyer._id}`}
              >
                {orderDetail.buyer.name}
              </Link>
            </h2>
            <p className="text-no_focus hidden min-[1100px]:block">|</p>
            <p>
              Date ordered &nbsp;
              <Moment className="font-semibold" format="MMM DD, h:mm A">
                {createdAt}
              </Moment>
            </p>
          </div>
        </div>
        <div className="font-semibold text-right hidden sm:block">
          <p className="text-sm mb-1">Total price</p>
          <p className="text-xl">₹{packagePrice}</p>
        </div>
      </div>
      <div className="py-4 border-y text-light_heading">
        <p>
          Order number <span className="font-semibold">#{orderId}</span>
        </p>
      </div>
      <div className="mt-4">
        <div className="border border-dark_separator rounded">
          <ul className="p-4 rounded-t border-b gap-6  sm:px-6 font-semibold border-dark_separator bg-separator flex justify-between sm:grid grid-cols-5">
            <li className="col-span-4 sm:col-span-3">Item</li>
            <li className="hidden sm:block">Duration</li>
            <li className="text-right">Price</li>
          </ul>
          <ul className="text-light_heading gap-6 p-4 sm:px-6 flex justify-between sm:grid grid-cols-5">
            <li className="col-span-4 sm:col-span-3 flex flex-col gap-2">
              <p className="font-semibold">{packageTitle}</p>
              <p className="leading-5 max-w-[40ch]">{packageDescription}</p>
              <li className="list-inside list-disc">
                {revisions < 1e6 ? revisions : "Unlimited"}
                {' '}
                {revisions === 1 ? "revison" : "revisions"}
              </li>
              {sourceFile && (
                <li className="list-inside list-disc">Include source file</li>
              )}
              {commercialUse && (
                <li className="list-inside list-disc">Commercial use</li>
              )}
            </li>
            <li className="hidden sm:block" >{duration === 1 ? "1 day" : duration + " days"}</li>
            <li className="text-right">₹{packagePrice}</li>
          </ul>
          <div className="sm:hidden font-semibold flex p-4 sm:px-6 gap-6 border-t border-t-dark_separator items-center justify-between bg-separator rounded-b">
            <p>Duration</p>
            <p>{duration === 1 ? "1 day" : duration + " days" }</p>
          </div>
          <div className="font-semibold flex p-4 sm:px-6 gap-6 border-t border-t-dark_separator items-center justify-between bg-separator rounded-b">
            <p>Total</p>
            <p>₹{packagePrice}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
