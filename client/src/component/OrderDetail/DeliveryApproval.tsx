import { useState } from "react";
import { BiChevronLeft } from "react-icons/bi";
import { FaRobot } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { updateOrderDetail } from "../../actions/orderAction";
import { AppDispatch, RootState } from "../../store";
import { IUser } from "../../types/user.types";
import { axiosInstance } from "../../utility/axiosInstance";
import { ChatBox } from "./ChatBox";

type DeliveryApprovalProps = {
  setFileLoading: (val: boolean) => void;
};

const DeliveryApproval = ({ setFileLoading }: DeliveryApprovalProps) => {
  const params = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const [showRevision, setShowRevision] = useState(false);
  const [showFinalDeliveryConfirmation, setShowFinalDeliveryConfirmation] =
    useState(false);

  const { orderDetail } = useSelector((state: RootState) => state.orderDetail);
  if (!orderDetail) return null;

  const handleCompletedRevisionRequest = (val: boolean) => {
    setShowRevision(false);
    setFileLoading(val);
  };

  const handleOrderCompletion = async () => {
    const { data } = await axiosInstance.post(`/order/completed/${params.id}`);

    dispatch(updateOrderDetail(data.order));
    setShowFinalDeliveryConfirmation(false);
  };

  const handleShowRevisionBox = () => {
    if (orderDetail.packageDetails.revisions >= orderDetail.revisions.length) {
      toast.error("You have exceeded you maximum revision requests");
      return;
    }
    setShowRevision(true);
  };

  orderDetail.seller = orderDetail.seller as IUser;

  return (
    <section className="flex ml-6  pb-4 mb-12 border-b gap-4 items-start">
      <div className="w-7 h-7 flex items-center justify-center bg-light_heading rounded-full text-white">
        <FaRobot />
      </div>

      {!showRevision ? (
        <div className="flex-grow mr-6">
          <div className="text-light_heading font-semibold">
            <p className="mb-2">
              You received your delivery from {orderDetail.seller.name}.
            </p>
            <p className="mb-1">
              Are you pleased with the delivery and ready to approve it?
            </p>
          </div>
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={() => setShowFinalDeliveryConfirmation(true)}
              className="bg-primary text-white px-4 py-2 rounded-sm hover:bg-primary_hover hover:cursor-pointer"
            >
              Yes, I approve the delivery
            </button>
            <button
              onClick={handleShowRevisionBox}
              className="bg-primary text-white px-4 py-2 rounded-sm hover:bg-primary_hover hover:cursor-pointer"
            >
              I'm not ready yet
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-grow mr-6">
          <div className="text-light_heading font-semibold">
            <p className="mb-1">
              What revisions would you like {orderDetail.seller.name} to make?
            </p>
          </div>
          <div className="mt-4">
            <ChatBox
              setFileLoading={handleCompletedRevisionRequest}
              isRevisionMessage={true}
            />
          </div>

          <div
            onClick={() => setShowRevision(false)}
            className="flex items-center justify-end text-light_heading font-semibold mt-4 hover:underline hover:cursor-pointer"
          >
            <BiChevronLeft />
            <span>Back</span>
          </div>
        </div>
      )}

      {showFinalDeliveryConfirmation && (
        <div className="fixed inset-0 w-full h-full z-50 bg-[rgba(0,0,0,0.4)] flex items-center justify-center">
          <div className="bg-white w-5/6 sm:w-[60ch] rounded-sm">
            <div className="flex justify-between rounded-sm text-lg text-light_grey bg-dark_separator px-4 py-3">
              <h4>Approve Final Delivery</h4>
              <IoClose
                onClick={() => setShowFinalDeliveryConfirmation(false)}
                className="hover:cursor-pointer"
              />
            </div>
            <p className="p-4 leading-5 text-light_heading border-b border-b-dark_separator">
              Got everything you need? Great! Once you approve this delivery,
              your order will be marked as complete.
            </p>
            <div className="flex items-center justify-end p-4 gap-4 text-sm">
              <button
                onClick={() => setShowFinalDeliveryConfirmation(false)}
                className="capitalize border border-light_heading text-light_heading font-semibold py-1.5 px-3 rounded hover:text-dark_grey hover:cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleOrderCompletion}
                className="capitalize bg-primary py-1.5 px-3 hover:bg-primary_hover text-white rounded hover:cursor-pointer"
              >
                Approve Final Delivery
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default DeliveryApproval;
