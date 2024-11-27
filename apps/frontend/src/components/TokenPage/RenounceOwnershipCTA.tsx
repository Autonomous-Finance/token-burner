import { Verified } from "@mui/icons-material"
import {
  Alert,
  Button,
  Paper,
  Snackbar,
  type SnackbarCloseReason,
  Stack,
  Typography,
} from "@mui/material"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import { createDataItemSigner, message, result } from "@permaweb/aoconnect"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useActiveAddress } from "arweave-wallet-kit"
import React from "react"

import type { TokenDetails } from "@/api/tokendrop-api"
import ENV from "@/env"
import useTokenBalance from "@/hooks/useTokenBalance"

export default function RenounceOwnershipCTA({ token }: { token: TokenDetails }) {
  const userAddress = useActiveAddress()
  const [openSnackbar, setOpenSnackbar] = React.useState(false)
  const [snackbarMessage, setSnackbarMessage] = React.useState("")
  const { data: balance, isLoading } = useTokenBalance(token.TokenProcess)
  const queryClient = useQueryClient()
  const [open, setOpen] = React.useState(false)

  const handleClickOpenDialog = () => {
    setOpen(true)
  }

  const handleCloseDialog = () => {
    setOpen(false)
  }

  const renounce = useMutation({
    mutationKey: ["renounce", token?.TokenProcess],
    mutationFn: async () => {
      const renounceId = await message({
        process: ENV.VITE_TOKEN_FACTORY_PROCESS,
        tags: [
          { name: "Action", value: "Renounce-Ownership" },
          {
            name: "Token-Process",
            value: token.TokenProcess,
          },
        ],
        data: "",
        signer: createDataItemSigner(window.arweaveWallet),
      })

      const renounceResult = await result({
        process: ENV.VITE_TOKEN_FACTORY_PROCESS,
        message: renounceId,
      })

      if (renounceResult.Messages.length > 1) {
        const message = renounceResult.Messages[1]

        const details = JSON.parse(message.Data) as TokenDetails

        if (details.RenounceOwnership === true) {
          return true
        }

        throw new Error("Ownership renounce failed")
      }

      throw new Error("Ownership renounce failed")
    },
    onSuccess: () => {
      setSnackbarMessage("Ownership renounced successfully.")
      setOpenSnackbar(true)
      queryClient.invalidateQueries()
    },
    onError: (error) => {
      setSnackbarMessage("Ownership renounce failed.")
      setOpenSnackbar(true)
      console.error(error)
    },
  })

  if (isLoading || !balance || token.RenounceOwnership) {
    return null
  }

  const isDeployer = userAddress === token.Deployer
  const hasMoreThan50PercentBalance = balance > BigInt(token.TotalSupply) / 2n

  const handleClose = (event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (reason === "clickaway") {
      return
    }

    setOpenSnackbar(false)
  }

  if (token.InternalId === "external") {
    return null
  }

  return (
    <Paper sx={{ padding: 2 }}>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={5000}
        onClose={handleClose}
        message={snackbarMessage}
      />
      <Stack alignItems="center" justifyContent="space-around">
        <Stack gap={2}>
          <Stack direction={"row"} gap={2} alignItems={"center"}>
            <Verified />
            <Typography variant="h6">Renounce Ownership</Typography>
          </Stack>
          <Typography variant="body2">
            By renouncing ownership, you make the core aspects of the token, like total supply and
            ownership, permanently fixed, which increases trust.
          </Typography>
          <Typography variant="caption">
            You can still update non-essential details, such as the token's website or description.
          </Typography>

          {isDeployer || !hasMoreThan50PercentBalance ? (
            <Button
              variant="contained"
              sx={{ width: "100%" }}
              onClick={handleClickOpenDialog}
              disabled={renounce.isPending}
            >
              Renounce Ownership
            </Button>
          ) : (
            <>
              <Button variant="contained" sx={{ width: "100%" }} disabled={true}>
                Renounce Ownership
              </Button>
              <Alert severity="error" icon={false}>
                You can only renounce ownership if you are the deployer or hold more than 50% of the
                token's supply.
              </Alert>
            </>
          )}
        </Stack>
      </Stack>

      <Dialog
        open={open}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Are you absolutely sure?</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This action cannot be undone. This will permanently remove the ownership of this token
            and make it immutable.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={() => renounce.mutateAsync()} disabled={renounce.isPending} autoFocus>
            Renounce Ownership
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}
