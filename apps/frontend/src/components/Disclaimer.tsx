import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material"
import React from "react"

function Disclaimer(props: { children: React.ReactNode; defaultOpen?: boolean }) {
  const KEY = "disclaimer"
  const [hasAcknowledged, setHasAcknowledged] = React.useState(localStorage.getItem(KEY) === "true")

  const setTrue = () => {
    setHasAcknowledged(true)
    localStorage.setItem(KEY, "true")
  }

  return (
    <>
      {!hasAcknowledged && (
        <Dialog fullWidth maxWidth="sm" open={!!props.defaultOpen}>
          <DialogTitle sx={{ textAlign: "center" }}>
            <Typography variant="subtitle1" fontWeight={700} color="primary">
              Important Notice
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography variant="caption">
              The CoinBurn tool enables the permanent and irreversible destruction of tokens. Once
              tokens are burned, they cannot be recovered under any circumstances.
              <br />
              <br />
              By using the CoinBurn platform, you acknowledge that you are proceeding entirely at
              your own risk. CoinBurn is not responsible for any tokens burned as a result of its
              use, whether intentional, accidental, or due to errors in input or understanding.
              <br />
              <br />
              You are solely responsible for ensuring you understand how the tool works and for
              carefully reviewing your actions before confirming a burn. By proceeding, you accept
              full accountability for any and all outcomes, including unintended or undesired burns.
              <br />
              <br />
              CoinBurn disclaims liability for mistakes, incorrect token selections, technical
              issues, or any other events that may lead to an undesired token burn. Users are
              strongly advised to use the tool cautiously and deliberately.
              <br />
              <br />
              By using this platform, you agree to these terms.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center" }}>
            <Button
              variant="outlined"
              color="accent"
              sx={{ textTransform: "none" }}
              onClick={setTrue}
            >
              I understand and accept the risks
            </Button>
          </DialogActions>
        </Dialog>
      )}
      <>{props.children}</>
    </>
  )
}

export default Disclaimer
