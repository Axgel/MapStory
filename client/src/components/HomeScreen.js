import React, { useContext, useEffect } from "react";
import { GlobalStoreContext } from "../store";

export default function HomeScreen() {
  const { store } = useContext(GlobalStoreContext);
  useEffect(() => {
    store.loadDemo();
  }, [store]);

  const handleClick = () => {
    const name = document.getElementById("name").value;
    if (name.trim().length < 2) return;
    // console.log(document.getElementById('name').value)
    store.writeDemo(name);
  };

  return (
    <div>
      <h1>HOME SCREEN HERE</h1>

      {store.demo.map((item, key) => (
        <p key={key}>{item.name}</p>
      ))}

      <input id="name" type="text" />
      <button type="button" onClick={handleClick}>
        Add Name!
      </button><br></br>
      <a href='/'>BACK TO MAIN</a>
    </div>
  );
}
