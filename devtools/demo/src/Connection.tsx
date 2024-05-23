import { Button, Text } from "@mantine/core"
import { truncate } from "@initia/utils"
import { useAddress, useWallet } from "@initia/react-wallet-widget"

const Connection = () => {
  const address = useAddress()
  const { wallet, onboard, view } = useWallet()

  if (address) {
    return (
      <>
        {wallet && <Text>Connected to {wallet.name}</Text>}
        <Button onClick={view}>{truncate(address)}</Button>
      </>
    )
  }

  return <Button onClick={onboard}>Connect</Button>
}

export default Connection
