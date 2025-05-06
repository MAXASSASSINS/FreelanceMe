import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getOrderDetail } from "../actions/orderAction";
import { windowContext } from "../App";
import { AppDispatch, RootState } from "../store";
import { IUser } from "../types/user.types";
import OrderedGigCard from "../component/OrderedGigCard";
import { Activities } from "../component/OrderDetail/Activities";
import { Delivery } from "../component/OrderDetail/Delivery";
import { DeliveryTimer } from "../component/OrderDetail/DeliveryTimer";
import { Details } from "../component/OrderDetail/Details";
import { Requirements } from "../component/OrderDetail/Requirements";
import TabNavigation from "../component/OrderDetail/TabNavigation";
import {
  DELIVERED,
  IN_PROGRESS,
  IN_REVISION,
} from "../constants/globalConstants";

export const OrderDetail = () => {
  const { windowWidth } = useContext(windowContext);
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );

  const { orderDetail, orderError } = useSelector(
    (state: RootState) => state.orderDetail
  );

  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (isAuthenticated && params.id) {
      dispatch(getOrderDetail(params.id));
    }
  }, [isAuthenticated, user, params.id, dispatch]);

  if (orderError) {
    navigate("/404");
  }

  return (
    <div className="bg-separator  min-[1450px]:flex justify-center">
      <div className="p-6 sm:p-12 md:p-16 xl:p-20 min-[1450px]:max-w-[1400px]">
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* ORDER LATE WARNING  */}
        {orderDetail &&
          Date.now() > new Date(orderDetail.deliveryDate).getTime() && (
            <div className="p-8 my-8 bg-red-100 rounded">
              <p>
                <span className="text-red-600">
                  {user!._id === (orderDetail.seller as IUser)._id
                    ? "This order is marked as late but you can still deliver it."
                    : "This order is marked as late. You can still accept the deliveries."}
                </span>
              </p>
            </div>
          )}

        {orderDetail && (
          <main className="rounded flex flex-col-reverse min-[900px]:flex-row justify-between gap-8 lg:gap-16">
            <div className="flex-grow">
              {activeTab === 0 && <Activities orderDetail={orderDetail} />}
              {activeTab === 1 && <Details orderDetail={orderDetail} />}
              {activeTab === 2 && <Requirements orderDetail={orderDetail} />}
              {activeTab === 3 && <Delivery orderDetail={orderDetail} />}
            </div>

            <div className="flex flex-col gap-8">
              {(orderDetail.seller as IUser)._id === user!._id &&
                (orderDetail.status === IN_PROGRESS ||
                  orderDetail.status === IN_REVISION ||
                  orderDetail.status === DELIVERED) &&
                windowWidth > 900 && (
                  <DeliveryTimer orderDetail={orderDetail} />
                )}
              <div className="hidden min-[900px]:block max-w-[20rem] order-2 col-span-6 sm:col-start-2 sm:col-span-4  md:order-3 md:col-span-4 lg:col-span-3">
                <OrderedGigCard orderDetail={orderDetail} />
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
};
