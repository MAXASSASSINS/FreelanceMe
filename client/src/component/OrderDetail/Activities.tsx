import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { updateOrderDetail } from "../../actions/orderAction";
import { IN_PROGRESS, IN_REVISION } from "../../constants/globalConstants";
import { useUpdateGlobalLoading } from "../../context/globalLoadingContext";
import { useSocket } from "../../context/socketContext";
import { AppDispatch, RootState } from "../../store";
import { IMessage } from "../../types/message.types";
import { IOrder } from "../../types/order.types";
import { IUser } from "../../types/user.types";
import { axiosInstance } from "../../utility/axiosInstance";
import { DateTag } from "../DateTag";
import ActiviyChat from "./ActiviyChat";
import DeliveryApproval from "./DeliveryApproval";
import DeliveryRevisionMessage from "./DeliveryRevisionMessage";
import { DeliveryTimer } from "./DeliveryTimer";
import InitialMessages from "./InitialMessages";
import OrderCompletedSection from "./OrderCompletedSection";
import SimpleMessage from "./SimpleMessage";

type ActivitiesProps = {
  orderDetail: IOrder;
};

export type GroupedMessage = IMessage & {
  forDelivery: boolean;
  forRevision: boolean;
  deliveryNumber?: number;
};

export type DateWiseMessage = {
  date: string;
  dateWiseMessages: GroupedMessage[];
};

export const Activities = ({ orderDetail }: ActivitiesProps) => {
  const seller = orderDetail.seller as IUser;
  const buyer = orderDetail.buyer as IUser;
  const dispatch = useDispatch<AppDispatch>();
  const params = useParams();

  const { user } = useSelector((state: RootState) => state.user);

  const updateGlobalLoading = useUpdateGlobalLoading();

  const [online, setOnline] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);

  const socket = useSocket();

  const [orderMessages, setOrderMessages] = useState<DateWiseMessage[]>([]);

  useEffect(() => {
    getOrderMessages();
  }, []);

  // online status of seller or buyer
  useEffect(() => {
    const userToCheck =
      user!._id.toString() === buyer._id.toString() ? seller._id : buyer._id;
    socket.emit("is_online", userToCheck);
  }, [orderDetail, socket, buyer, seller, user]);

  useEffect(() => {
    socket.on("is_online_from_server", (data) => {
      const onlineClientId = data.id.toString();
      const userToCheck =
        user!._id.toString() === buyer._id.toString() ? seller._id : buyer._id;
      if (onlineClientId === userToCheck) {
        setOnline(data.online);
      }
    });

    socket.on("online_from_server", (data) => {
      const onlineClientId = data.toString();
      const userToCheck =
        user!._id.toString() === buyer._id.toString() ? seller._id : buyer._id;
      if (onlineClientId === userToCheck) {
        setOnline(true);
      }
    });

    socket.on("offline_from_server", (data) => {
      const onlineClientId = data?.toString();

      const userToCheck =
        user!._id.toString() === buyer._id.toString() ? seller._id : buyer._id;
      if (onlineClientId.toString() === userToCheck?.toString()) {
        setOnline(false);
      }
    });

    return () => {
      socket.off("is_online_from_server");
      socket.off("online_from_server");
      socket.off("offline_from_server");
    };
  }, [orderDetail._id, socket, buyer, seller, user]);

  // CHECKING FOR RECEIVING MESSAGES
  useEffect(() => {
    socket.on("receive_message", async (data) => {
      if (data.orderId !== params.id) {
        return;
      }

      if (data.forDelivery) {
        data = { ...data, deliveryNumber: orderDetail.deliveries.length + 1 };
      }

      setOrderMessages((prev) => {
        const date = new Date(data.createdAt)
          .toLocaleDateString()
          .substring(0, 10);
        let found = false;
        prev.forEach((message) => {
          if (message.date === date) {
            found = true;
            message.dateWiseMessages.push(data);
          }
        });
        if (!found) {
          prev.push({
            date,
            dateWiseMessages: [data],
          });
        }
        return [...prev];
      });
    });

    return () => {
      socket.off("receive_message");
    };
  }, [fileLoading, socket, orderDetail, params.id]);

  // CHECKING FOR RECEIVING MESSAGES SELF
  useEffect(() => {
    socket.on("receive_message_self", async (data) => {
      if (data.orderId !== params.id) {
        return;
      }

      if (data.forDelivery) {
        data = { ...data, deliveryNumber: orderDetail.deliveries.length };
      }

      setOrderMessages((prev) => {
        const date = new Date(data.createdAt)
          .toLocaleDateString()
          .substring(0, 10);
        let found = false;
        prev.forEach((message) => {
          if (message.date === date) {
            found = true;
            message.dateWiseMessages.push(data);
          }
        });
        if (!found) {
          prev.push({
            date,
            dateWiseMessages: [data],
          });
        }
        return [...prev];
      });
    });

    return () => {
      socket.off("receive_message_self");
    };
  }, [fileLoading, socket, orderDetail, params.id]);

  // CHECKING FOR UPDATES ON ORDER DETAIL
  useEffect(() => {
    socket.on("update_order_detail_server", (data) => {
      dispatch(updateOrderDetail(data));
    });
  }, [fileLoading, socket, dispatch]);

  // set global loading to true if file loading is true
  useEffect(() => {
    if (fileLoading) {
      updateGlobalLoading(true, "sending message");
    } else {
      updateGlobalLoading(false);
    }
  }, [fileLoading]);

  const getOrderMessages = async () => {
    try {
      const { data } = await axiosInstance.get(`/message/order/${params.id}`);

      const messages = buildDateWiseMessages(
        data.messages,
        orderDetail.deliveries,
        orderDetail.revisions
      );

      setOrderMessages(messages);
    } catch (error) {
      console.log(error);
    }
  };

  const pushMessage = (
    map: Map<string, GroupedMessage[]>,
    message: GroupedMessage
  ) => {
    const date = new Date(message.createdAt).getDate().toString();
    if (map.has(date)) {
      map.get(date)!.push(message);
    } else {
      map.set(date, [message]);
    }
  };

  const buildDateWiseMessages = (
    messages: IMessage[],
    deliveries: IOrder["deliveries"],
    revisions: IOrder["revisions"]
  ) => {
    let map = new Map<string, GroupedMessage[]>();

    for (let message of messages) {
      const newMessage: GroupedMessage = {
        ...message,
        forDelivery: false,
        forRevision: false,
      };
      pushMessage(map, newMessage);
    }

    if (deliveries) {
      deliveries.forEach((delivery, index) => {
        const message = {
          _id: delivery._id,
          sender: seller,
          receiver: buyer,
          files: delivery.files,
          message: {
            text: delivery.message,
          },
          createdAt: delivery.deliveredAt,
          orderId: orderDetail._id,
          forDelivery: true,
          forRevision: false,
          deliveryNumber: index + 1,
        };
        pushMessage(map, message);
      });
    }

    if (revisions) {
      for (const revision of revisions) {
        const message = {
          _id: revision._id,
          sender: buyer,
          receiver: seller,
          files: revision.files,
          message: {
            text: revision.message,
          },
          createdAt: revision.requestedAt,
          orderId: orderDetail._id,
          forDelivery: false,
          forRevision: true,
        };
        pushMessage(map, message);
      }
    }

    map = new Map([...map.entries()].sort());

    map = new Map(
      [...map.entries()].map(([key, value]) => {
        const newEntry = value.sort((a: GroupedMessage, b: GroupedMessage) => {
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
        return [key, newEntry];
      })
    );

    const arr: DateWiseMessage[] = Array.from(
      map,
      ([date, dateWiseMessages]) => ({
        date,
        dateWiseMessages,
      })
    );

    return arr;
  };

  return (
    <>
      {seller._id === user!._id &&
        (orderDetail.status === IN_PROGRESS ||
          orderDetail.status === IN_REVISION) && (
          <div className="mb-8 min-[900px]:hidden">
            <DeliveryTimer orderDetail={orderDetail} />
          </div>
        )}

      {orderDetail && (
        <div className="bg-white rounded relative py-8 text-sm sm:text-base">
          <InitialMessages />

          {orderMessages.length > 0 &&
            orderMessages.map((obj, index) => (
              <section
                key={index}
                className="relative pl-6 flex flex-col gap-4 pb-16"
                style={{
                  marginTop:
                    obj.date ===
                    new Date(
                      orderDetail.requirementsSubmittedAt
                    ).toLocaleDateString()
                      ? "-2rem"
                      : 0,
                }}
              >
                {obj.date !==
                  new Date(
                    orderDetail.requirementsSubmittedAt
                  ).toLocaleDateString() && (
                  <DateTag left={"-1.5rem"} date={obj.date} />
                )}

                {obj.dateWiseMessages.length > 0 &&
                  obj.dateWiseMessages.map((message) => {
                    return message.forDelivery || message.forRevision ? (
                      <DeliveryRevisionMessage message={message} />
                    ) : (
                      <SimpleMessage message={message} />
                    );
                  })}
              </section>
            ))}

          {buyer._id === user!._id && orderDetail.status === "Delivered" && (
            <DeliveryApproval setFileLoading={setFileLoading} />
          )}

          {orderDetail.status !== "Completed" &&
            orderDetail.status !== "Cancelled" && (
              <ActiviyChat online={online} setFileLoading={setFileLoading} />
            )}

          {orderDetail.status === "Completed" && (
            <OrderCompletedSection orderMessages={orderMessages} />
          )}
        </div>
      )}
    </>
  );
};
