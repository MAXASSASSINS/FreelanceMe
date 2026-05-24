import { useEffect, useState } from "react";
import { IOrder } from "../../types/order.types";
import { DeliveryModal } from "./DeliveryModal";

type DeliveryTimerProps = {
  orderDetail: IOrder;
};

export const DeliveryTimer = ({ orderDetail }: DeliveryTimerProps) => {
  const [deliveryTimeLeft, setDeliveryTimeLeft] = useState(
    new Date(orderDetail.deliveryDate).getTime() - Date.now() < 0
      ? 0
      : new Date(orderDetail.deliveryDate).getTime() - Date.now()
  );

  const [showDeliveryModal, setShowDeliveryModal] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (new Date(orderDetail.deliveryDate).getTime() - Date.now() < 0)
        setDeliveryTimeLeft(0);
      else
        setDeliveryTimeLeft(
          new Date(orderDetail.deliveryDate).getTime() - Date.now()
        );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClickOnDelivery = () => {
    setShowDeliveryModal(true);
  };

  const closeDeliveryModal = () => {
    setShowDeliveryModal(false);
  };

  return (
    <>
      {showDeliveryModal && (
        <DeliveryModal
          closeDeliveryModal={closeDeliveryModal}
        />
      )}
      <div className="bg-white p-4 flex flex-col gap-4 rounded">
        <div className="font-semibold text-light_heading">
          Time left to deliver
        </div>
        <div
          className={`flex ${
            new Date(orderDetail.deliveryDate).getTime() - Date.now() <
              24 * 60 * 60 * 1000 && "text-warning"
          } items-center justify-center gap-3 text-center`}
        >
          <div>
            <div className="pb-1 font-bold">
              {parseInt((deliveryTimeLeft / (1000 * 60 * 60 * 24)).toString())}
            </div>
            <div>Days</div>
          </div>
          <div>|</div>
          <div>
            <div className="pb-1 font-bold">
              {new Date(deliveryTimeLeft).getUTCHours()}
            </div>
            <div>Hours</div>
          </div>
          <div>|</div>
          <div>
            <div className="pb-1 font-bold">
              {new Date(deliveryTimeLeft).getUTCMinutes()}
            </div>
            <div>Minutes</div>
          </div>
          <div>|</div>
          <div>
            <div className="pb-1 font-bold">
              {new Date(deliveryTimeLeft).getUTCSeconds()}
            </div>
            <div>Seconds</div>
          </div>
        </div>
        <div
          onClick={handleClickOnDelivery}
          className="px-4 py-3 rounded bg-primary text-white font-semibold text-center hover:bg-primary_hover"
        >
          <button className="capitalize">deliver now</button>
        </div>
      </div>
    </>
  );
};
