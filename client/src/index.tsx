import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { GlobalLoadingProvider } from "./context/globalLoadingContext";
import "./index.css";
import store from "./store";
import SocketContextProvider from "./context/socketContext";
const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <BrowserRouter>
    <Provider store={store}>
      <GlobalLoadingProvider>
        <SocketContextProvider>
          <App />
        </SocketContextProvider>
      </GlobalLoadingProvider>
    </Provider>
  </BrowserRouter>
);
