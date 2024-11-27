import { ConnectButton } from "arweave-wallet-kit"

import "./App.css"
import TokenBurner from "./components/burner"

function App() {
  return (
    <>
      <div className="card">
        <div>
          <ConnectButton profileModal={true} showBalance={true} />
        </div>
        <TokenBurner />
      </div>
    </>
  )
}

export default App
