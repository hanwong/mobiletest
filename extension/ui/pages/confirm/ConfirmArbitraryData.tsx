import { Box } from "@mantine/core"

const ConfirmArbitraryData = ({ data }: { data: string | Uint8Array }) => {
  const decoded = typeof data === "string" ? data : new TextDecoder().decode(data)

  return (
    <Box sx={({ fn }) => ({ border: `1px solid ${fn.themeColor("mono.6")}`, borderRadius: 20, padding: 20 })}>
      {decoded}
    </Box>
  )
}

export default ConfirmArbitraryData
