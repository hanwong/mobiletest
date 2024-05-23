import { useNavigate } from "react-router-dom"
import { Button } from "@mantine/core"

const OnboardBackButton = () => {
  const navigate = useNavigate()
  return (
    <Button variant="secondary" onClick={() => navigate(-1)}>
      Back
    </Button>
  )
}

export default OnboardBackButton
