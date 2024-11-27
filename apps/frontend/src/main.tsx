import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ArweaveWalletKit } from "arweave-wallet-kit"
import * as ReactDOM from "react-dom/client"

import { HashRouter, Route, Routes } from "react-router-dom"

import RootLayoutUI from "./components/RootLayout/RootLayoutUI"
import TokenBurner from "./components/burner"
// Create a client
const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ArweaveWalletKit
      config={{
        permissions: ["SIGN_TRANSACTION", "ACCESS_ADDRESS"],
        ensurePermissions: true,
      }}
      theme={{
        displayTheme: "light",
      }}
    >
      <HashRouter>
        <RootLayoutUI>
          <Routes>
            <Route path="/" element={<TokenBurner />} />
          </Routes>
        </RootLayoutUI>
      </HashRouter>
    </ArweaveWalletKit>
  </QueryClientProvider>,
)
