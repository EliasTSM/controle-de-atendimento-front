import Tabs from "./components/Tabs";
import "./index.css";
import "react-datepicker/dist/react-datepicker.css";

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>Sistema de Atendimentos</h1>
        <p>Controle financeiro dos procedimentos</p>
      </header>

      <Tabs />
    </div>
  );
}