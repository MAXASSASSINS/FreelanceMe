import React, { createContext, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";

const GlobalLoadingContext = createContext(false);
const GlobalLoadingTextContext = createContext("");
const UpdateGlobalLoadingContext = createContext(
  (val: boolean, text?: string) => {}
);

export const useGlobalLoading = () => {
  return useContext(GlobalLoadingContext);
};

export const useGlobalLoadingText = () => {
  return useContext(GlobalLoadingTextContext);
};

export const useUpdateGlobalLoading = () => {
  return useContext(UpdateGlobalLoadingContext);
};

type GlobalLoadingProviderProps = {
  children: React.ReactNode;
};

export const GlobalLoadingProvider = ({
  children,
}: GlobalLoadingProviderProps) => {
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalLoadingText, setGlobalLoadingText] = useState("");

  const { gigLoading } = useSelector((state: RootState) => state.gigs || {});
  const { gigLoading: gigDetailLoading } = useSelector(
    (state: RootState) => state.gigDetail || {}
  );
  const { gigLoading: userGigslLoading } = useSelector(
    (state: RootState) => state.userGigs || {}
  );

  const { userLoading } = useSelector((state: RootState) => state.user || {});
  const { userLoading: gigUserLoading } = useSelector(
    (state: RootState) => state.gigUser || {}
  );

  const { orderLoading } = useSelector(
    (state: RootState) => state.orders || {}
  );
  const { orderLoading: orderDetailLoading } = useSelector(
    (state: RootState) => state.orderDetail || {}
  );

  useEffect(() => {
    if (
      gigLoading ||
      userLoading ||
      orderLoading ||
      gigDetailLoading ||
      userGigslLoading ||
      gigUserLoading ||
      orderDetailLoading
    ) {
      updateGlobalLoading(true);
    } else {
      updateGlobalLoading(false);
    }
  }, [
    gigLoading,
    userLoading,
    orderLoading,
    gigDetailLoading,
    userGigslLoading,
    gigUserLoading,
    orderDetailLoading,
  ]);

  const updateGlobalLoading = (val: boolean, text: string = "") => {
    setGlobalLoading(val);
    setGlobalLoadingText(text);
  };

  return (
    <GlobalLoadingContext.Provider value={globalLoading}>
      <GlobalLoadingTextContext.Provider value={globalLoadingText}>
        <UpdateGlobalLoadingContext.Provider value={updateGlobalLoading}>
          {children}
        </UpdateGlobalLoadingContext.Provider>
      </GlobalLoadingTextContext.Provider>
    </GlobalLoadingContext.Provider>
  );
};
