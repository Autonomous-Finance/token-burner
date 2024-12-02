import { TokenInfo } from "./api/token-api"
import ENV from "./env"

export const DEXI_UPDATE_TOKEN_FULL_PRICE = 49.95
export const DEXI_UPDATE_TOKEN_DISCOUNT_PRICE = 2
export const DEXI_SUBSCRIBE_FULL_PRICE = 5

// We consider this L1 token (Ar)
export const L1_AR = "0".repeat(43)
export const AO = "m3PaWzK4PTG9lAaqYQPaPdOcXdO8hYqi5Fe9NWqXd0w"

export const TOKEN_MIRRORS: Record<string, string> = {
  [AO]: "Pi-WmAQp2-mh-oWH9lWpz5EthlUDj_W0IusAv-RXhRk",
}

interface PaymentToken {
  value: string
  label: string
  denomination: number
  logo: string
  disabled?: boolean
}

export const PAYMENT_TOKENS: PaymentToken[] = [
  {
    value: "m3PaWzK4PTG9lAaqYQPaPdOcXdO8hYqi5Fe9NWqXd0w",
    label: "AO",
    denomination: 18,
    logo: "UkS-mdoiG8hcAClhKK8ch4ZhEzla0mCPDOix9hpdSFE",
    disabled: true,
  },
  {
    value: ENV.VITE_WRAPPED_AR_PROCESS,
    label: "wAR",
    denomination: 12,
    logo: "L99jaxRKQKJt9CqoJtPaieGPEhJD3wNhR4iGqc8amXs",
    disabled: false,
  },
  {
    value: ENV.VITE_QAR_PROCESS,
    label: "qAR",
    denomination: 12,
    logo: "26yDr08SuwvNQ4VnhAfV4IjJcOOlQ4tAQLc1ggrCPu0",
    disabled: false,
  },
]

export const NATIVE_TOKENS = [
  {
    TokenProcess: "m3PaWzK4PTG9lAaqYQPaPdOcXdO8hYqi5Fe9NWqXd0w",
    Ticker: "AO",
    Name: "AO",
    Denomination: 18,
    Logo: "UkS-mdoiG8hcAClhKK8ch4ZhEzla0mCPDOix9hpdSFE",
    InternalId: "m3PaWzK4PTG9lAaqYQPaPdOcXdO8hYqi5Fe9NWqXd0w",
    Deployer: "m3PaWzK4PTG9lAaqYQPaPdOcXdO8hYqi5Fe9NWqXd0w",
    Description: "",
    Balances: {},
    TotalSupply: 0,
    Status: "DEPLOYED",
    LPs: {},
    RenounceOwnership: false,
    SocialLinks: [],
    CoverImage: "",
  },
  {
    TokenProcess: "xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10",
    Ticker: "wAR",
    Name: "wAR",
    Denomination: 12,
    Logo: "L99jaxRKQKJt9CqoJtPaieGPEhJD3wNhR4iGqc8amXs",
    InternalId: "xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10",
    Deployer: "xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10",
    Description: "",
    Balances: {},
    TotalSupply: 0,
    Status: "DEPLOYED",
    LPs: {},
    RenounceOwnership: false,
    SocialLinks: [],
    CoverImage: "",
  },
  {
    TokenProcess: "NG-0lVX882MG5nhARrSzyprEK6ejonHpdUmaaMPsHE8",
    Ticker: "qAR",
    Name: "qAR",
    Denomination: 12,
    Logo: "26yDr08SuwvNQ4VnhAfV4IjJcOOlQ4tAQLc1ggrCPu0",
    InternalId: "NG-0lVX882MG5nhARrSzyprEK6ejonHpdUmaaMPsHE8",
    Deployer: "NG-0lVX882MG5nhARrSzyprEK6ejonHpdUmaaMPsHE8",
    Description: "",
    Balances: {},
    TotalSupply: 0,
    Status: "DEPLOYED",
    LPs: {},
    RenounceOwnership: false,
    SocialLinks: [],
    CoverImage: "",
  },
]
export const FORMAT_DECIMALS = 4
export const INPUT_DECIMALS = 6
export const PRICE_DECIMALS = 18

export const REFRESH_INTERVAL = 15_000

export const W_AR: TokenInfo = {
  id: "xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10",
  name: "Wrapped AR",
  ticker: "wAR", // patched
  denomination: 12,
  logo: "L99jaxRKQKJt9CqoJtPaieGPEhJD3wNhR4iGqc8amXs",
}
