import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import jsTPS from "../common/jsTPS";
import api from "./store-request-api";
import AuthContext from "../auth";

export const GlobalStoreContext = createContext({});
console.log("create GlobalStoreContext");

export const GlobalStoreActionType = {
  DEMO: "DEMO",
};

const tps = new jsTPS();

function GlobalStoreContextProvider(props) {
  const { auth } = useContext(AuthContext);
  const [store, setStore] = useState({
    demo : "demo"
  });
  const history = useNavigate();

  const storeReducer = (action) => {
    const { type, payload } = action;
    switch (type) {
      case GlobalStoreActionType.DEMO: {
        return setStore({
          demo: "demo"
        });
      }
    }
  };

  return (
    <GlobalStoreContext.Provider value={{store}}>
      {props.children}
    </GlobalStoreContext.Provider>
  );
}

export default GlobalStoreContext;
export { GlobalStoreContextProvider };
