import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Button, Group, Stack, TextInput } from "@mantine/core"
import FixedBottom from "../../../components/FixedBottom"
import type { Contact } from "./useContacts"
import useContacts from "./useContacts"

const ContactForm = ({ defaultValues }: { defaultValues?: Contact }) => {
  const navigate = useNavigate()
  const { addItem, editItem, deleteItem } = useContacts()
  const { register, handleSubmit, formState } = useForm<Contact>({ defaultValues })

  const deleteContact = () => {
    if (!defaultValues) return
    if (!window.confirm("Delete this contact?")) return
    deleteItem(defaultValues.id)
    navigate(-1)
  }

  const submit = handleSubmit((data) => {
    if (defaultValues) editItem(data)
    else addItem(data)
    navigate(-1)
  })

  return (
    <form onSubmit={submit}>
      <Stack spacing={20}>
        <TextInput {...register("name")} label="Name" error={formState.errors.name?.message} />
        <TextInput {...register("address")} label="Address" error={formState.errors.address?.message} />
        <TextInput {...register("memo")} label="Memo (optional)" error={formState.errors.memo?.message} />
      </Stack>

      <FixedBottom>
        <Group grow>
          {!!defaultValues && (
            <Button variant="secondary" onClick={deleteContact}>
              Delete
            </Button>
          )}

          <Button type="submit">Submit</Button>
        </Group>
      </FixedBottom>
    </form>
  )
}

export default ContactForm
