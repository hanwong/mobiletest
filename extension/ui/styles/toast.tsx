import { mergeDeepRight } from "ramda"
import { notifications } from "@mantine/notifications"
import styles from "./styles"
import Icon from "./Icon"

const toast = {
  success: (message: string) => {
    notifications.show({
      message,
      icon: <Icon.CheckCircle />,
      styles: (theme) => {
        const bottom = getPaddingBottomBody()
        const style = mergeDeepRight(styles.Notification(theme), { root: { bottom } })
        return { ...style, icon: { ...style.icon, color: theme.other.success } }
      },
    })
  },
  error: (message: string) => {
    notifications.show({
      message,
      icon: <Icon.Warning />,
      styles: (theme) => {
        const bottom = getPaddingBottomBody()
        const style = mergeDeepRight(styles.Notification(theme), { root: { bottom } })
        return { ...style, icon: { ...style.icon, color: theme.other.danger } }
      },
    })
  },
}

export default toast

function getPaddingBottomBody() {
  const style = window.getComputedStyle(document.body)
  return style.getPropertyValue("padding-bottom")
}
