import { ConnectButton } from "arweave-wallet-kit";
import "./App.css";
import Counter from "./components/burner";

function App() {
  return (
    <>
      <div className="card">
        <div>
          <ConnectButton profileModal={true} showBalance={true} />
        </div>
        <Counter />
      </div>
    </>
  );
}

export default App;
