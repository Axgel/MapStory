import { createContext, useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import jsTPS from "../common/jsTPS";
import api from "./store-request-api";
// import AuthContext from "../auth";

export const GlobalStoreContext = createContext({});
console.log("create GlobalStoreContext");

export const GlobalStoreActionType = {
  DEMO: "DEMO",
};

// const tps = new jsTPS();

function GlobalStoreContextProvider(props) {
  // const { auth } = useContext(AuthContext);
  const [store, setStore] = useState({
    demo: [],
  });

  useEffect(() => {
    store.loadDemo();
  }, []);
  // const history = useNavigate();

  const storeReducer = (action) => {
    const { type, payload } = action;
    switch (type) {
      case GlobalStoreActionType.DEMO: {
        return setStore({
          demo: payload,
        });
      }
      default:
        return 0;
    }
  };

  store.loadDemo = function () {
    async function asyncLoadDemo() {
      const response = await api.getDemo();
      if (response) {
        let newDemo = [];
        if(response.data.data){
          newDemo = response.data.data
        }

        storeReducer({
          type: GlobalStoreActionType.DEMO,
          payload: newDemo,
        });
      }
    }
    asyncLoadDemo();
  };

  store.writeDemo = function (name) {
    async function asyncWriteDemo() {
      const response = await api.writeDemo(name);
      console.log(response);
      if (response) {
        store.loadDemo();
      }
    }
    asyncWriteDemo();
  };

  return (
    <GlobalStoreContext.Provider value={{ store }}>
      {props.children}
    </GlobalStoreContext.Provider>
  );
}

export default GlobalStoreContext;
export { GlobalStoreContextProvider };
