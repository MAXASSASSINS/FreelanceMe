import {
  AnyAction,
  applyMiddleware,
  combineReducers,
  legacy_createStore as createStore,
} from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import thunk, { ThunkDispatch } from "redux-thunk";
import {
  dimBackgroundInitialState,
  dimBackgroundReducer,
  DimBackgroundReducerState,
} from "./reducers/dimBackgroundReducer";
import {
  gigDetailInitialState,
  gigDetailReducer,
  GigDetailReducerState,
} from "./reducers/gig/gigDetailReducer";
import {
  gigsInitialState,
  gigsReducer,
  GigsReducerState,
} from "./reducers/gig/gigsReducer";
import {
  userGigsDetailsReducer,
  userGigsInitialState,
  UserGigsReducerState,
} from "./reducers/gig/userGigsReducer";
import {
  orderDetailInitialState,
  orderDetailReducer,
  OrderDetailReducerState,
} from "./reducers/order/orderDetailReducer";
import {
  allOrdersInitialState,
  allOrdersReducer,
  AllOrdersReducerState,
} from "./reducers/order/orderReducer";
import {
  userOrdersDetailsInitialState,
  userOrdersDetailsReducer,
  UserOrdersDetailsReducerState,
} from "./reducers/order/userOrdersDetailsReducer";
import {
  gigUserInitialState,
  gigUserReducer,
  GigUserReducerState,
} from "./reducers/user/gigUserReducer";
import {
  userInitialState,
  userReducer,
  UserReducerState,
} from "./reducers/user/userReducer";

export type AppDispatch = ThunkDispatch<RootState, void, AnyAction>;

export type RootState = {
  gigs: GigsReducerState;
  dimBackground: DimBackgroundReducerState;
  user: UserReducerState;
  userGigs: UserGigsReducerState;
  gigUser: GigUserReducerState;
  gigDetail: GigDetailReducerState;
  orderDetail: OrderDetailReducerState;
  orders: AllOrdersReducerState;
  userOrders: UserOrdersDetailsReducerState;
};

const reducer = combineReducers({
  gigs: gigsReducer,
  dimBackground: dimBackgroundReducer,
  user: userReducer,
  userGigs: userGigsDetailsReducer,
  gigUser: gigUserReducer,
  gigDetail: gigDetailReducer,
  orderDetail: orderDetailReducer,
  orders: allOrdersReducer,
  userOrders: userOrdersDetailsReducer,
});

const initialState: RootState = {
  gigs: gigsInitialState,
  dimBackground: dimBackgroundInitialState,
  user: userInitialState,
  userGigs: userGigsInitialState,
  gigUser: gigUserInitialState,
  gigDetail: gigDetailInitialState,
  orderDetail: orderDetailInitialState,
  orders: allOrdersInitialState,
  userOrders: userOrdersDetailsInitialState,
};



const middleware = [thunk];

// @ts-ignore
const store = createStore(
  reducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;
