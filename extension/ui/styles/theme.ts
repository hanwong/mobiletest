import type { MantineThemeOverride, Tuple } from "@mantine/core"
import DoneSharpIcon from "@mui/icons-material/DoneSharp"
import { EXTENSION_WIDTH } from "../../scripts/shared/constants"
import Blank from "./Blank"
import styles from "./styles"

const createColors = (color: string) => Array(10).fill(color) as Tuple<string, 10>

export const overlayProps = { blur: 1 }
export const transitionProps = { duration: 100 }

const theme: MantineThemeOverride = {
  colorScheme: "dark",
  cursorType: "pointer",
  defaultRadius: 0,
  colors: {
    mono: [
      /* 0 */ "hsl(0, 0%, 93%)",
      /* 1 */ "hsl(0, 0%, 73%)",
      /* 2 */ "hsl(0, 0%, 64%)",
      /* 3 */ "hsl(0, 0%, 54%)",
      /* 4 */ "hsl(0, 0%, 38%)",
      /* 5 */ "hsl(0, 0%, 26%)",
      /* 6 */ "hsl(0, 0%, 17%)",
      /* 7 */ "hsl(0, 0%, 12%)",
      /* 8 */ "hsl(0, 0%, 9%)",
      /* 9 */ "hsl(0, 0%, 6%)",
    ],
    success: createColors("#B0EE5F"),
    danger: createColors("#FF005C"),
    warning: createColors("#FFBE5E"),
  },
  fontFamily: "Visby CF",
  lineHeight: 1.3,
  headings: {
    sizes: {
      h1: { lineHeight: 1.2 },
      h2: { lineHeight: 1.2 },
      h3: { lineHeight: 1.2 },
      h4: { lineHeight: 1.2 },
      h5: { lineHeight: 1.2 },
      h6: { lineHeight: 1.2 },
    },
  },
  components: {
    /* Layout */
    Container: { defaultProps: { size: "xs", p: 0 } },

    /* Buttons */
    Button: {
      defaultProps: { variant: "submit", fullWidth: true },
      variants: {
        submit: styles.DefaultButton,
        secondary: styles.SecondaryButton,
        item: styles.ItemButton,
        small: styles.SmallButton,
      },
    },
    UnstyledButton: { defaultProps: { sx: styles.UnstyledButton } },

    /* Inputs */
    Checkbox: { defaultProps: { transitionDuration: 0, size: "xs", icon: DoneSharpIcon, styles: styles.Checkbox } },
    Radio: { defaultProps: { styles: styles.Radio } },
    Input: { defaultProps: { variant: "unstyled" } },
    TextInput: { defaultProps: { variant: "unstyled", styles: styles.TextInput } },
    Textarea: { defaultProps: { variant: "unstyled", styles: styles.TextInput } },
    PasswordInput: { defaultProps: { variant: "unstyled", styles: styles.TextInput } },
    Select: { defaultProps: { variant: "filled", styles: styles.Select } },

    /* Navigation */
    Tabs: { defaultProps: { variant: "unstyled", keepMounted: false, styles: styles.Tabs } },

    /* Data display */
    Accordion: {
      defaultProps: { variant: "seperated", multiple: true, transitionDuration: 100, styles: styles.Accordion },
    },
    Image: {
      defaultProps: { withPlaceholder: true, placeholder: Blank },
    },

    /* Overlays */
    Drawer: {
      defaultProps: {
        size: "80vh",
        position: "bottom",
        overlayProps,
        transitionProps,
        zIndex: 1050,
        styles: styles.Drawer,
      },
    },
    Modal: { defaultProps: { centered: true, overlayProps, transitionProps, withCloseButton: false, zIndex: 1050 } },
    Popover: { defaultProps: { transitionProps: { duration: 0 }, zIndex: 1070, styles: styles.Popover } },
    Tooltip: { defaultProps: { styles: styles.Tooltip } },

    /* Feedback */
    Loader: { defaultProps: { color: "brand" } },
    Notification: { defaultProps: { styles: styles.Notification } },

    /* Miscellaneous */
    Divider: { defaultProps: { color: "mono.6", labelPosition: "center", styles: styles.Divider } },
    ScrollArea: { defaultProps: { type: "never" } },
  },
  globalStyles: ({ fn }) => ({
    body: {
      backgroundColor: fn.themeColor("mono.9"),
      color: fn.themeColor("mono.0"),
      fontSize: 14,
      fontWeight: 700,
      minWidth: EXTENSION_WIDTH,
      minHeight: 600,
      overflowX: "hidden",
    },
    a: {
      color: "unset",
      textDecoration: "none",
    },
    svg: {
      fill: "currentcolor",
    },
    "::-webkit-scrollbar": {
      display: "none",
    },
  }),
  other: {
    success: "#B0EE5F",
    danger: "#FF005C",
    warning: "#FFBE5E",
  },
}

export default theme
