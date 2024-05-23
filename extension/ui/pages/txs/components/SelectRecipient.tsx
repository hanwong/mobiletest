import type { PropsWithChildren } from "react"
import { useCallback, useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import { mergeDeepRight } from "ramda"
import { Box, Container, Drawer, Group, Stack, Text, TextInput, UnstyledButton } from "@mantine/core"
import { useDebouncedValue, useDisclosure } from "@mantine/hooks"
import { fromBech32 } from "@cosmjs/encoding"
import { AddressUtils } from "@initia/utils"
import { isUsernameValid } from "@initia/utils"
import { useAddressFromUsername } from "../../../data/name"
import { useAccount, useAccounts, useAddress } from "../../../background"
import styles from "../../../styles/styles"
import { transitionProps } from "../../../styles/theme"
import Icon from "../../../styles/Icon"
import type { Contact } from "../../settings/Contacts/useContacts"
import useContacts from "../../settings/Contacts/useContacts"
import ContactItem from "../../settings/Contacts/ContactItem"
import type { SendValues } from "../SendForm"

interface Props {
  memoFixed?: boolean
  onMemoFixed?: (value: boolean) => void
}

const SelectRecipient = ({ memoFixed, onMemoFixed }: PropsWithChildren<Props>) => {
  const [opened, { open, close }] = useDisclosure()

  /* form */
  const [recipient, setRecipient] = useState("")
  const { setValue, watch } = useFormContext<SendValues>()
  const validateAddress = useCallback((address: string) => AddressUtils.isValid(address, "init"), [])

  /* self */
  const address = useAddress()
  const account = useAccount()
  const accounts = useAccounts()

  /* contacts */
  const { contacts } = useContacts()

  /* usernames */
  const [debouncedRecipient] = useDebouncedValue(recipient, 300)
  const { recipientUsername, recipientAddress, memo } = watch()

  const { data: addressFromUsername, ...addressFromUsernameResult } = useAddressFromUsername(debouncedRecipient)

  const setValues = useCallback(
    ({ name, address, memo }: Partial<Contact>) => {
      close()

      setTimeout(() => {
        setValue("recipientUsername", name ?? "")
        setValue("recipientAddress", address ?? "")
        setValue("memo", memo ?? "")
        onMemoFixed?.(!!memo)
      }, transitionProps.duration)
    },
    [close, onMemoFixed, setValue],
  )

  const reset = () => {
    setRecipient("")
    setValue("recipientUsername", "")
    setValue("recipientAddress", "")
    setValue("memo", "")
    onMemoFixed?.(false)
  }

  useEffect(() => {
    if (addressFromUsername) {
      setValues({ address: addressFromUsername })
      return
    }

    if (validateAddress(recipient)) {
      setValues({ address: recipient })
      return
    }
  }, [addressFromUsername, recipient, setValue, setValues, validateAddress])

  /* render */
  const renderUsername = () => {
    if (addressFromUsernameResult.isFetching) {
      return (
        <Text c="warning" fz="xs">
          Checking username...
        </Text>
      )
    }

    if (addressFromUsernameResult.isFetched && !addressFromUsername) {
      return (
        <Text c="danger" fz="xs">
          Username not found
        </Text>
      )
    }

    return (
      <Text c="success" fz="xs">
        {addressFromUsername}
      </Text>
    )
  }

  const renderSelf = () => {
    if (!accounts.length) return null

    return (
      <Stack spacing={8}>
        <Text fz={12} fw={700} tt="uppercase">
          My accounts ({accounts.length})
        </Text>

        {accounts.map((account) => {
          const address = account.initiaAddress
          return (
            <ContactItem
              name={account.name}
              address={address}
              onClick={() => setValues({ name: account.name, address })}
              key={address}
            />
          )
        })}
      </Stack>
    )
  }

  const renderContacts = () => {
    const list = contacts.filter(({ address }) => {
      if (AddressUtils.isValid(address, "init") && "init" !== fromBech32(address).prefix) {
        return false
      }

      return true
    })

    if (!list.length) return null

    return (
      <Stack spacing={8}>
        <Text fz={12} fw={700} tt="uppercase">
          Contacts ({list.length})
        </Text>

        {list.map(({ id, ...contact }) => (
          <ContactItem {...contact} onClick={() => setValues(contact)} key={id} />
        ))}
      </Stack>
    )
  }

  const render = () => {
    if (recipientUsername && recipientAddress) {
      return (
        <ContactItem
          component={Box}
          name={recipientUsername}
          address={recipientAddress}
          memo={memoFixed ? memo : undefined}
          rightSection={
            <UnstyledButton display="flex" c="mono.3" onClick={reset}>
              <Icon.Close />
            </UnstyledButton>
          }
        />
      )
    }

    return (
      <Stack spacing={4}>
        <TextInput
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="Enter username or address"
          sx={(theme) =>
            mergeDeepRight(styles.TextInput(theme), {
              input: { marginTop: 0 },
            })
          }
          autoFocus
        />

        {isUsernameValid(recipient) && renderUsername()}
      </Stack>
    )
  }

  return (
    <>
      <Stack spacing={0}>
        <Group position="apart" mb={8}>
          <Text c="mono.2" fz={14} fw={600}>
            Recipient
          </Text>

          <Group spacing={6}>
            <UnstyledButton
              bg="mono.8"
              fz={11}
              fw={600}
              h={24}
              px={12}
              sx={({ fn }) => ({
                border: `1px solid ${fn.themeColor("mono.7")}`,
                borderRadius: 24 / 2,
                ...fn.hover({ color: fn.themeColor("mono.0") }),
              })}
              onClick={() => {
                setValues({ name: account?.name, address })
              }}
            >
              To Myself
            </UnstyledButton>

            <UnstyledButton
              bg="mono.8"
              fz={11}
              fw={600}
              h={24}
              px={12}
              sx={({ fn }) => ({
                border: `1px solid ${fn.themeColor("mono.7")}`,
                borderRadius: 24 / 2,
                ...fn.hover({ color: fn.themeColor("mono.0") }),
              })}
              onClick={open}
            >
              Contacts
            </UnstyledButton>
          </Group>
        </Group>

        {render()}
      </Stack>

      <Drawer opened={opened} onClose={close}>
        <Container>
          <Stack spacing={24} px={20}>
            {renderSelf()}
            {renderContacts()}
          </Stack>
        </Container>
      </Drawer>
    </>
  )
}

export default SelectRecipient
