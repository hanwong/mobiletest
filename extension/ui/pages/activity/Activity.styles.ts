import { createStyles } from "@mantine/core"

const useStyles = createStyles(({ fn }) => ({
  root: {
    color: "unset",
    display: "block",
    paddingLeft: 20,
    paddingRight: 20,
    position: "relative",
    whiteSpace: "nowrap",
    width: "100%",

    "&:hover": {
      background: fn.themeColor("mono.7"),
      textDecoration: "none",
    },

    "&:first-of-type": {
      marginTop: 16,
    },
  },

  inner: {
    borderTop: `1px dashed ${fn.themeColor("mono.6")}`,
    paddingTop: 16,
    paddingBottom: 32,
    width: "100%",
  },

  timestamp: {
    borderRadius: 20 / 2,
    border: `1px solid ${fn.themeColor("mono.8")}`,
    background: fn.themeColor("mono.6"),
    color: fn.themeColor("mono.2"),
    fontSize: 10,
    fontWeight: 700,
    height: 20,
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 12,
    paddingRight: 12,
    position: "absolute",
    top: -10,
  },

  messages: { flex: 1, width: "calc(60% - 8px)" },
  changes: { flex: "none", width: "40%", textAlign: "right" },
  message: { fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis" },
  change: { fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis" },
}))

export default useStyles
