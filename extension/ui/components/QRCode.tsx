import { useMantineTheme } from "@mantine/core"
import { QRCodeSVG } from "qrcode.react"

const QRCode = (props: { value: string; size: number }) => {
  const { fn } = useMantineTheme()
  return <QRCodeSVG {...props} bgColor="transparent" fgColor={fn.themeColor("mono.0")} />
}

export default QRCode
