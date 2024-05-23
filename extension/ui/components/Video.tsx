import type { VideoHTMLAttributes } from "react"
import { ASSETS_URL } from "../../scripts/shared/constants"

interface Props extends VideoHTMLAttributes<HTMLVideoElement> {
  name: string
}

const Video = ({ name, width = 80, height = 80, ...attrs }: Props) => {
  const poster = `${ASSETS_URL}/videos/${name}.png`
  const video = `${ASSETS_URL}/videos/${name}.webm`

  return (
    <video width={width} height={height} autoPlay loop muted poster={poster} key={name} {...attrs}>
      <source src={video} type="video/webm" />
    </video>
  )
}

export default Video
