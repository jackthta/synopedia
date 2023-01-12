import React from "react";
import ReactDOM from "react-dom/client";

import { Provider } from "react-redux";
import store from "./redux/store";

import router from "./router";
import { RouterProvider } from "react-router-dom";

import "./styles/index.scss";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);
