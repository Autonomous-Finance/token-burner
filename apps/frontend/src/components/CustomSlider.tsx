import { Slider, sliderClasses, styled } from "@mui/material"

export const CustomSlider = styled(Slider)({
  height: 12,
  [`& .${sliderClasses.track}`]: {
    border: "none",
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    background: "var(--mui-palette-accent-main)",
  },
  [`& .${sliderClasses.rail}`]: {
    opacity: 1,
    background: "var(--mui-palette-secondary-main)",
  },
  [`& .${sliderClasses.thumb}`]: {
    height: 12,
    width: 12,
    backgroundColor: "#fff",
    border: "1.5px solid currentColor",
    "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
      boxShadow: "inherit",
    },
    "&::before": {
      display: "none",
    },
  },
})
