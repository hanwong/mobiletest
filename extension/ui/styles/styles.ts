import type { MantineTheme } from "@mantine/core"

const styles = {
  DefaultButton: ({ fn }: MantineTheme) => {
    const background = fn.themeColor("mono.0")
    const hoverBackground = fn.themeColor("mono.2")
    const diabledBackground = fn.themeColor("mono.6")

    const color = fn.themeColor("mono.8")
    const hoverColor = color

    return {
      root: {
        border: 0,

        background,
        color,

        fontSize: 16,
        fontWeight: 800,
        height: 46,
        borderRadius: 46 / 2,

        "&:not([data-disabled]):hover": {
          background: hoverBackground,
          color: hoverColor,
        },

        "&:disabled, &[data-disabled]": {
          background: diabledBackground,
          color,
        },
      },
    }
  },

  SecondaryButton: ({ fn }: MantineTheme) => {
    const background = fn.themeColor("mono.9")
    const hoverBackground = background
    const diabledBackground = background

    const borderColor = fn.themeColor("mono.2")
    const hoverBorderColor = fn.themeColor("mono.2")
    const disabledBorderColor = fn.themeColor("mono.6")

    const color = fn.themeColor("mono.0")
    const hoverColor = fn.themeColor("mono.2")
    const disabledColor = fn.themeColor("mono.6")

    return {
      root: {
        border: `1px solid ${borderColor}`,

        background,
        color,

        fontSize: 16,
        fontWeight: 800,
        height: 46,
        borderRadius: 46 / 2,

        "&:not([data-disabled]):hover": {
          borderColor: hoverBorderColor,
          background: hoverBackground,
          color: hoverColor,
        },

        "&:disabled, &[data-disabled]": {
          borderColor: disabledBorderColor,
          background: diabledBackground,
          color: disabledColor,
        },
      },
    }
  },

  ItemButton: ({ fn }: MantineTheme) => {
    const background = fn.themeColor("mono.7")

    const borderColor = background
    const hoverBorderColor = fn.themeColor("mono.5")
    const activeBorderColor = fn.themeColor("mono.0")

    const color = fn.themeColor("mono.1")
    const hoverColor = color
    const activeColor = fn.themeColor("mono.0")

    return {
      root: {
        border: `1px solid ${borderColor}`,

        background,
        color,

        fontSize: 14,
        fontWeight: 700,
        height: 68,
        borderRadius: 20,

        ...fn.hover({ textDecoration: "none" }),

        "&:not([data-disabled]):not([data-active]):hover": {
          borderColor: hoverBorderColor,
          color: hoverColor,
        },

        "&[data-active]": {
          borderColor: activeBorderColor,
          color: activeColor,
        },
      },

      inner: {
        justifyContent: "space-between",
      },

      label: {
        flex: 1,
      },
    }
  },

  SmallButton: ({ fn }: MantineTheme) => {
    const background = fn.themeColor("mono.6")
    const hoverBackground = fn.themeColor("mono.5")

    const borderColor = background
    const hoverBorderColor = borderColor
    const activeBorderColor = borderColor

    const color = fn.themeColor("mono.1")
    const hoverColor = color
    const activeColor = color

    return {
      root: {
        border: `1px solid ${borderColor}`,

        background,
        color,

        fontSize: 12,
        fontWeight: 700,
        height: 24,
        borderRadius: 24 / 2,

        ...fn.hover({ background: hoverBackground, textDecoration: "none" }),

        "&:not([data-disabled]):not([data-active]):hover": {
          borderColor: hoverBorderColor,
          color: hoverColor,
        },

        "&[data-active]": {
          borderColor: activeBorderColor,
          color: activeColor,
        },

        "&:disabled": {
          opacity: 0.5,
        },
      },
    }
  },

  UnstyledButton: () => {
    return {}
  },

  Checkbox: ({ fn }: MantineTheme) => {
    return {
      input: {
        background: fn.themeColor("mono.5"),
        borderColor: fn.themeColor("mono.5"),
        borderRadius: 2,

        "&:hover": {
          borderColor: fn.themeColor("mono.0"),
        },

        "&:checked": {
          background: fn.themeColor("mono.0"),
          borderColor: fn.themeColor("mono.0"),
        },

        "&:checked + .mantine-Checkbox-icon": {
          color: fn.themeColor("mono.9"),
          fontSize: 16,
        },
      },
      label: { color: fn.themeColor("mono.2"), fontSize: 12, fontWeight: 600, padddingLeft: 8 },
    }
  },

  Radio: ({ fn }: MantineTheme) => {
    return {
      radio: {
        background: "transparent",
        borderColor: fn.themeColor("mono.4"),
        width: 16,
        height: 16,

        "&:checked": {
          background: "unset",
          borderColor: fn.themeColor("mono.0"),
        },
      },
      icon: {
        width: 8,
        height: 8,
        color: fn.themeColor("mono.0"),
      },
    }
  },

  TextInput: ({ fn, other }: MantineTheme) => {
    const background = fn.themeColor("mono.7")
    const color = fn.themeColor("mono.0")

    return {
      label: {
        color: fn.themeColor("mono.1"),
        fontSize: 14,
        fontWeight: 600,
      },
      input: {
        background,
        border: `1px solid ${background}`,
        borderRadius: 20,
        color,
        fontSize: 18,
        fontWeight: 600,
        height: 72,
        marginTop: 8,
        paddingLeft: 20,
        paddingRight: 20,

        "&:hover": { borderColor: fn.themeColor("mono.5") },
        "&:focus-within": { borderColor: fn.themeColor("mono.1") },
        "&[data-invalid]": { color, borderColor: other.danger },
        "&::placeholder": { color: fn.themeColor("mono.5") },
      },
      error: {
        color: other.danger,
        marginTop: 4,
      },
    }
  },

  Select: ({ fn }: MantineTheme) => {
    const background = fn.themeColor("mono.6")

    return {
      input: {
        background,
        borderRadius: 8,
        color: fn.themeColor("mono.0"),
        fontSize: 12,

        "&:focus, &:focus-within": {
          borderColor: background,
        },
      },
      item: {
        "&[data-selected]": {
          "&, &:hover": {
            background: fn.themeColor("mono.0"),
            color: fn.themeColor("mono.8"),
          },
        },
      },
    }
  },

  Tabs: ({ fn }: MantineTheme) => {
    return {
      tabsList: {
        backgroundColor: fn.themeColor("mono.8"),
      },
      tab: {
        borderTop: `1px solid ${fn.themeColor("mono.5")}`,
        color: fn.themeColor("mono.3"),
        fontSize: 12,
        fontWeight: 600,
        height: 48,

        "&:hover": {
          color: fn.themeColor("mono.0"),
        },

        "&[data-active]": {
          borderColor: fn.themeColor("mono.0"),
          color: fn.themeColor("mono.0"),
        },
      },
    }
  },

  Accordion: ({ fn }: MantineTheme) => ({
    item: {
      backgroundColor: fn.themeColor("mono.7"),
      border: `1px solid ${fn.themeColor("mono.7")}`,
      borderRadius: 20,
      marginBottom: 8,
      overflow: "hidden",
      "&:hover": { borderColor: fn.themeColor("mono.6") },
      "&[data-active]": { borderColor: fn.themeColor("mono.6") },
    },
    control: { fontSize: 13, fontWeight: 600 },
    label: { paddingTop: 20, paddingBottom: 20 },
    panel: { borderTop: `1px solid ${fn.themeColor("mono.6")}`, fontSize: 12 },
    content: { padding: 0 },
  }),

  Drawer: ({ fn }: MantineTheme) => ({
    header: {
      backgroundColor: fn.themeColor("mono.8"),
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
    },
    title: {
      color: fn.themeColor("mono.0"),
      flex: 1,
      fontSize: 14,
      fontWeight: 700,
      marginLeft: 16,
      textAlign: "center",
    },
    close: { color: fn.themeColor("mono.4") },
    content: { backgroundColor: fn.themeColor("mono.8") },
    body: { padding: 0 },
  }),

  Popover: () => ({
    dropdown: { padding: 0 },
  }),

  Tooltip: ({ fn }: MantineTheme) => ({
    tooltip: {
      background: fn.themeColor("mono.6"),
      color: fn.themeColor("mono.1"),
      fontSize: 9,
      fontWeight: 700,
      lineHeight: "14px",
      height: 14,
      borderRadius: 14 / 2,
      padding: 0,
      paddingLeft: 4,
      paddingRight: 4,
    },
  }),

  Notification: ({ fn }: MantineTheme) => ({
    root: { borderRadius: 8 },
    description: { color: fn.themeColor("mono.0"), fontSize: 12 },
    icon: { background: "transparent", margin: 0 },
  }),

  Divider: ({ fn }: MantineTheme) => ({
    labelDefaultStyles: { color: fn.themeColor("mono.3") },
  }),
}

export default styles
