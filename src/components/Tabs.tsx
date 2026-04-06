import { useState } from "react";
import Form from "./Form";
import List from "./List";

export default function Tabs() {
  const [tab, setTab] = useState("form");

  return (
    <div>
      <div className="tabs">
        <button onClick={() => setTab("form")}>Novo</button>
        <button onClick={() => setTab("list")}>Lista</button>
      </div>

      {tab === "form" && <Form />}
      {tab === "list" && <List />}
    </div>
  );
}