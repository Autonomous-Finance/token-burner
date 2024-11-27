import { AccountBox } from "@mui/icons-material"
import SearchIcon from "@mui/icons-material/Search"
import { Autocomplete, MenuItem, Stack, Typography } from "@mui/material"
import InputBase from "@mui/material/InputBase"
import { styled } from "@mui/material/styles"
import { useStore } from "@nanostores/react"
import * as React from "react"

import { useNavigate } from "react-router-dom"

import { SearchOption } from "./SearchOption"
import { getAllPools } from "../../api/pools-api"
import { TokenInfo } from "../../api/token-api"
import { $allPools } from "../../stores/pools-store"
import { $tokenInfoCache } from "../../stores/token-info-store"
import { truncateId } from "@/utils/data-utils"
import { isAddress } from "@/utils/format"

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  background: "var(--mui-palette-background-paper)",
  border: "1px solid var(--mui-palette-divider)",
  // TODO
  // backgroundColor: "rgba(60, 60, 60, 0.25)",
  // "&:hover": {
  //   backgroundColor: "rgba(60, 60, 60, 0.5)",
  // },
  // "&:focus-within": {
  //   backgroundColor: "rgba(60, 60, 60, 0.5)",
  // },
  marginLeft: 0,
  width: "100%",
  minWidth: 300,
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(1),
    width: "auto",
  },
  color: "var(--mui-palette-text-primary)",
}))

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--mui-palette-text-secondary)",
}))

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: "9px 8px",
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    [theme.breakpoints.up("sm")]: {
      width: "16ch",
      "&:focus": {
        // width: "24ch",
      },
    },
  },
  "& .MuiAutocomplete-endAdornment": {
    right: 8,
  },
}))

export function SearchBar() {
  const [open, setOpen] = React.useState(false)

  const allPools = useStore($allPools)
  const loading = allPools.length === 0

  React.useEffect(() => {
    getAllPools().then($allPools.set)
  }, [])

  const [currentValue, setCurrentValue] = React.useState("")

  function handleClose() {
    setOpen(false)
    setCurrentValue("")
  }

  console.log("allPools", allPools)

  const options = React.useMemo(() => {
    if (!currentValue) return allPools.map((x) => x.id)
    const tokenInfoCache = $tokenInfoCache.get()

    const pools = allPools.filter((pool) => {
      try {
        const baseToken: TokenInfo = JSON.parse(tokenInfoCache[pool.baseToken] as string)
        const quoteToken: TokenInfo = JSON.parse(tokenInfoCache[pool.quoteToken] as string)

        return (
          baseToken.name.toLowerCase().includes(currentValue.toLowerCase()) || // search by base token name
          baseToken.ticker.toLowerCase().includes(currentValue.toLowerCase()) || // search by base token ticker
          quoteToken.name.toLowerCase().includes(currentValue.toLowerCase()) || // search by quote token name
          quoteToken.ticker.toLowerCase().includes(currentValue.toLowerCase()) || // search by quote token
          baseToken.id === currentValue || // Search by base token id directly
          quoteToken.id === currentValue || // Search by quote token id directly
          currentValue === pool.id // Search by pool id directly
        )
      } catch (error) {
        return false
      }
    })

    if (pools.length === 0 && isAddress(currentValue)) {
      return [currentValue]
    }

    return pools.map((x) => x.id)
  }, [allPools, currentValue])

  const navigate = useNavigate()

  return (
    <Autocomplete
      // sx={{ width: 300 }}
      open={open}
      onOpen={() => {
        setOpen(true)
      }}
      onClose={handleClose}
      renderOption={(props, option) => {
        const pool = allPools.find((x) => x.id === option)

        if (!pool)
          return (
            <MenuItem
              onClick={() => {
                handleClose()
                navigate(`/entity/${option}`)
              }}
            >
              <Stack direction="row" spacing={0.5} alignItems="center">
                <AccountBox
                  sx={{
                    width: 16,
                    height: 16,
                  }}
                />
                <Typography component="span" variant="inherit" fontWeight={500}>
                  {truncateId(option)}
                </Typography>
              </Stack>
            </MenuItem>
          )

        return <SearchOption key={option} pool={pool} handleClose={handleClose} />
      }}
      filterOptions={(x) => x}
      options={options}
      loading={loading}
      renderInput={({ InputProps, InputLabelProps, ...rest }) => (
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search pool or entity..."
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            // inputProps={{ "aria-label": "search" }}
            {...InputProps}
            {...rest}
          />
        </Search>
      )}
    />
  )
}
