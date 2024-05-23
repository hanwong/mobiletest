import Thin from "./VisbyCF-Thin.woff2"
import Light from "./VisbyCF-Light.woff2"
import Regular from "./VisbyCF-Regular.woff2"
import Medium from "./VisbyCF-Medium.woff2"
import DemiBold from "./VisbyCF-DemiBold.woff2"
import Bold from "./VisbyCF-Bold.woff2"
import ExtraBold from "./VisbyCF-ExtraBold.woff2"
import Heavy from "./VisbyCF-Heavy.woff2"

const fonts: [number, string][] = [
  [100, Thin],
  [300, Light],
  [400, Regular],
  [500, Medium],
  [600, DemiBold],
  [700, Bold],
  [800, ExtraBold],
  [900, Heavy],
]

export default fonts.map(([weight, src]) => ({
  "@font-face": {
    fontFamily: "Visby CF",
    src: `url('${src}')`,
    fontWeight: weight,
  },
}))
