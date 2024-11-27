import { Box, useTheme } from "@mui/material"

export default function TokenCover({ imageSource }: { imageSource: string | undefined }) {
  const theme = useTheme()

  return (
    <Box
      sx={{
        width: "100%",
        height: "112px",
      }}
    >
      {imageSource ? (
        <img
          src={`https://arweave.net/${imageSource}`}
          alt="Token cover"
          style={{
            width: "100%",
            height: "112px",
            objectFit: "cover",
            borderTopRightRadius: 7,
            borderTopLeftRadius: 7,
          }}
        />
      ) : (
        <Box
          sx={{
            width: "100%",
            height: "112px",
            backgroundColor: theme.palette.grey[800],
            borderTopRightRadius: 7,
            borderTopLeftRadius: 7,
          }}
        />
      )}
    </Box>
  )
}
