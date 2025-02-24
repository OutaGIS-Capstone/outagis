import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Amplify } from "aws-amplify";
import { Authenticator } from '@aws-amplify/ui-react'; 
import outputs from "../amplify_outputs.json";
import { AdminProvider } from "./AdminContext.tsx";

Amplify.configure(outputs);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AdminProvider>
      <Authenticator.Provider>
        <App />
      </Authenticator.Provider>
    </AdminProvider>
  </React.StrictMode>
);
