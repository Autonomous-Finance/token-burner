import { InfoOutlined } from "@mui/icons-material"
import CloseIcon from "@mui/icons-material/Close"
import { Stack } from "@mui/material"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import IconButton from "@mui/material/IconButton"

import { styled } from "@mui/material/styles"

import * as React from "react"

import { PAYMENT_TOKENS } from "@/settings"

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}))

export default function BridgeTokensCTA({ token }: { token: string }) {
  const [open, setOpen] = React.useState(false)

  const tokenDetails = PAYMENT_TOKENS.find((t) => t.value === token)

  if (!tokenDetails) {
    return null
  }

  const handleClickOpen = () => {
    setOpen(true)
  }
  const handleClose = () => {
    setOpen(false)
  }

  return (
    <React.Fragment>
      <Button variant="text" onClick={handleClickOpen} sx={{ marginTop: 1 }}>
        <Stack direction="row" gap={1}>
          <InfoOutlined />
          Learn how you can get ${tokenDetails.label}
        </Stack>
      </Button>
      <BootstrapDialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Learn how you can get ${tokenDetails.label}
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={(theme) => ({
            position: "absolute",
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <p>You have several options for bridging assets into the AO Ecosystem:</p>
          <p>
            - Bridge wAR (WrappedAR) via the AOX Bridge by the Everpay team:
            <br />
            <a
              href="https://aox.arweave.net/#/"
              target="_blank"
              rel="noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              https://aox.arweave.net
            </a>
          </p>
          <p>
            - Use qAR (WrappedAR by Astro) through the Astro Bridge:
            <br />
            <a
              href="https://bridge.astrousd.com/"
              target="_blank"
              rel="noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              https://bridge.astrousd.com
            </a>
          </p>
          <p>
            - Bridge USDC to wAR using the Wardepot Bridge:
            <br />
            <a
              href="https://wardepot.arweave.net/"
              target="_blank"
              rel="noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              https://wardepot.arweave.net
            </a>
          </p>
          <p className="text-sm text-muted-foreground">
            AutonomousFinance does not endorse or receive incentives from any of the mentioned
            platforms. These options are shared for informational purposes only, as they represent
            widely used solutions in the industry.
            <br />
            <br />
            We encourage you to research and choose the option that best suits your needs.
          </p>
        </DialogContent>
      </BootstrapDialog>
    </React.Fragment>
  )
}
