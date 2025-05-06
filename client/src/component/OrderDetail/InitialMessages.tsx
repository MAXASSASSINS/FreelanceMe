import { IoDocumentOutline } from "react-icons/io5";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { RootState } from "../../store";
import { IUser } from "../../types/user.types";
import { DateTag } from "../DateTag";
import CommonOrderStartMessage from "./CommonOrderStartMessage";
import SpecialMessage from "./SpecialMessage";

const InitialMessages = () => {
  const { orderDetail } = useSelector((state: RootState) => state.orderDetail);
  const { user } = useSelector((state: RootState) => state.user);
  if (!orderDetail) return null;
  if (!user) return null;

  const buyer = orderDetail.buyer as IUser;
  return (
    <>
      <section className="relative pl-6 flex flex-col gap-4 pb-12">
        <DateTag
          left={"-1.5rem"}
          date={new Date(orderDetail.createdAt).toLocaleDateString()}
        />

        <SpecialMessage
          date={orderDetail.createdAt}
          icon={<IoDocumentOutline />}
          iconBgColor={"bg-purple-200"}
          iconColor={"text-purple-600"}
        >
          {buyer._id === user._id ? (
            "You placed the order"
          ) : (
            <>
              <Link
                to={`/user/${buyer._id}`}
                className="text-primary hover:underline"
              >
                {buyer.name}
              </Link>
              &nbsp; placed the order
            </>
          )}
        </SpecialMessage>

        {new Date(orderDetail.requirementsSubmittedAt).getDate().toString() ===
          new Date(orderDetail.createdAt).getDate().toString() && (
          <CommonOrderStartMessage />
        )}
      </section>

      {new Date(orderDetail.requirementsSubmittedAt).getDate().toString() !==
        new Date(orderDetail.createdAt).getDate().toString() && (
        <section className="relative pl-6 flex flex-col gap-4 pb-12">
          <DateTag
            left={"-1.5rem"}
            date={new Date(
              orderDetail.requirementsSubmittedAt
            ).toLocaleDateString()}
          />
          <CommonOrderStartMessage />
        </section>
      )}
    </>
  );
};

export default InitialMessages;
