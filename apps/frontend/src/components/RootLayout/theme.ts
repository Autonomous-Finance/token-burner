import { colors } from "@mui/material"
import {
  SimplePaletteColorOptions,
  experimental_extendTheme as extendTheme,
} from "@mui/material/styles"

import { MainFontFF } from "./fonts"

declare module "@mui/material" {
  interface Palette {
    accent: SimplePaletteColorOptions
  }

  interface PaletteOptions {
    accent: SimplePaletteColorOptions
    red: string
    blue: string
    green: string
    lime: string
    yellow: string
    purple: string
    indigo: string
    cyan: string
    pink: string
    orange: string
  }
}

export const theme = extendTheme({
  colorSchemes: {
    dark: {
      palette: {
        text: {
          primary: "rgb(180,180,180)",
        },
        primary: {
          main: "rgb(250,250,250)",
        },
        secondary: {
          main: "rgb(50,50,50)",
        },
        // @ts-ignore
        accent: {
          main: "rgba(255,90,0)",
        },
        TableCell: {
          border: "rgba(255, 255, 255, 0.12)", // same as divider
        },
        background: {
          paper: "rgb(33, 34, 34)",
          default: "#202020",
        },
        red: colors.red[500],
        blue: colors.blue[500],
        green: colors.green[500],
        lime: colors.lime[500],
        yellow: colors.yellow[500],
        purple: colors.purple[500],
        indigo: colors.indigo[500],
        cyan: colors.cyan[500],
        pink: colors.pink[500],
        orange: colors.orange[500],
      },
    },
    light: {
      palette: {
        primary: {
          main: "rgb(0,0,0)",
        },
        secondary: {
          main: "rgb(100,100,100)",
        },
        // @ts-ignore
        accent: {
          main: "rgba(76, 175, 81)",
        },
        background: {
          paper: "rgb(251, 251, 251)",
          default: "rgb(243, 243, 243)",
        },
        red: colors.red[500],
        blue: colors.blue[500],
        green: colors.green[500],
        lime: colors.lime[500],
        yellow: colors.yellow[500],
        purple: colors.purple[500],
        indigo: colors.indigo[500],
        cyan: colors.cyan[500],
        pink: colors.pink[500],
        orange: colors.orange[500],
      },
    },
  },
  typography: {
    fontFamily: MainFontFF,
    caption: {
      fontSize: "0.85rem",
      fontWeight: 300,
    },
    subtitle1: {
      fontSize: "1.25rem",
      fontWeight: 900,
      fontFamily: "system-ui, sans-serif",
    },
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          // textTransform: "none",
          boxShadow: "none !important",
          "&:active": {
            transform: "scale(0.98)",
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          "&:not(.Mui-selected)": {
            fontWeight: 400,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          marginLeft: 8,
          marginRight: 8,
        },
        indicator: {
          borderRadius: "5px",
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        variant: "outlined",
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          "tbody tr:last-of-type &": {
            borderBottom: "none",
          },
        },
      },
    },
  },
  shape: {
    borderRadius: 0,
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
})
