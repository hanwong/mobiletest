import { useNavigate } from "react-router-dom"
import { UnstyledButton } from "@mantine/core"
import Icon from "../styles/Icon"

const NavigateBack = () => {
  const navigate = useNavigate()
  const goBack = () => navigate(-1)

  return (
    <UnstyledButton display="flex" c="mono.3" p={20} mx={-20} onClick={goBack} sx={{ "&:hover": { color: "inherit" } }}>
      <Icon.Back width={12} height={12} />
    </UnstyledButton>
  )
}

export default NavigateBack
