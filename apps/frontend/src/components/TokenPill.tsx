import { Stack, StackProps } from "@mui/material"
import { styled } from "@mui/material/styles"

interface TokenPillProps extends StackProps {
  variant?: "text" | "outlined"
}

export const TokenPill = styled(Stack, {
  shouldForwardProp: (prop) => prop !== "variant",
})<TokenPillProps>(({ theme, variant }) => ({
  gap: theme.spacing(1),
  width: "fit-content",
  borderRadius: "500px",
  justifyContent: "space-between",
  alignItems: "center",
  flexDirection: "row",
  padding:
    variant === "outlined" ? "calc(var(--spacing) / 2 - 1px) calc(var(--spacing) * 1.25)" : "none",
  border: variant === "outlined" ? "1px solid var(--mui-palette-borderPrimary)" : "none",
  maxWidth: "100%",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
}))

export default TokenPill
