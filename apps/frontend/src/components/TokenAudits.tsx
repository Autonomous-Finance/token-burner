import { CheckCircle, CheckCircleOutline, InfoRounded } from "@mui/icons-material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { Accordion, AccordionDetails, AccordionSummary, Stack, Tooltip } from "@mui/material"

import { SectionInfo } from "./SectionInfo"

import useCommunityApproved from "@/hooks/useCommunityApproved"
import useLockedShare from "@/hooks/useLockedLiquidity"
import useTokenDetails from "@/hooks/useTokenDetails"

function validateSocials(socials: Record<string, string> | { key: string; value: string }[]) {
  if (Array.isArray(socials) && socials.length > 0 && socials.some((s) => s.value.length > 0)) {
    return true
  }

  if (socials && Object.keys(socials).length > 0) {
    return Object.values(socials).some((v) => v.length > 0)
  }

  return false
}

export default function TokenAudits({ poolId, tokenId }: { poolId?: string; tokenId: string }) {
  const { data: token } = useTokenDetails(tokenId)
  const { data: lockedShare } = useLockedShare(poolId)
  const { data: communitApproved } = useCommunityApproved(tokenId)
  const hasSocials = validateSocials(token?.SocialLinks ?? [])

  const audits = [
    {
      title: "Community Verified",
      description: "Community Approved manually by the team.",
      value: communitApproved,
    },
    {
      title: "Ownership Renounced",
      description: "Ownership renounced by the creator.",
      value: token?.RenounceOwnership ?? false,
    },
    {
      title: "Social Media",
      description: "Social media links are provided.",
      value: hasSocials,
    },
  ]

  if (poolId && lockedShare) {
    audits.push({
      title: "Liquidity Locked",
      description: "More than 50% of the liquidity is Burned or Locked for 1+ years.",
      value: lockedShare ? lockedShare["One-Year-Locked-Share"] > 0.5 : false,
    })
  }

  return (
    <Accordion
      sx={{
        borderRadius: 1,
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
      >
        <Stack
          direction="row"
          gap={1}
          alignItems="center"
          justifyContent="space-between"
          sx={{ width: "100%" }}
        >
          <span style={{ flexGrow: 1 }}>Token Audit</span>
          <Stack direction="row" gap={1} alignItems="center">
            {audits.filter((a) => a.value === true).length}/{audits.length}
          </Stack>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack gap={1}>
          {audits.map((audit) => (
            <SectionInfo
              key={audit.title}
              title={audit.title}
              renderTitle={() => (
                <Stack direction="row" gap={1}>
                  <Tooltip title={audit.description}>
                    <Stack direction="row" gap={1} alignItems="center">
                      <InfoRounded />
                      <span>{audit.title}</span>
                    </Stack>
                  </Tooltip>
                </Stack>
              )}
              value={
                audit.value ? (
                  <Stack direction="row" gap={1} alignItems="center">
                    <CheckCircle color="success" /> Yes
                  </Stack>
                ) : (
                  <Stack direction="row" gap={1} alignItems="center">
                    <CheckCircleOutline color="disabled" /> No&nbsp;
                  </Stack>
                )
              }
            />
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}
