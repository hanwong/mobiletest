import { useLocalStorage } from "@mantine/hooks"
import getId from "../../../../scripts/utils/getId"

export interface Contact {
  id: string
  name: string
  address: string
  memo?: string
}

export default function useContacts() {
  const [contacts, setContacts] = useLocalStorage<Contact[]>({
    key: "Contacts",
    defaultValue: [],
    getInitialValueInEffect: false,
  })

  const findItem = (id: string) => {
    return contacts.find((contact) => contact.id === id)
  }

  const addItem = (contact: Contact) => {
    setContacts([...contacts, { ...contact, id: getId() }])
  }

  const editItem = (updates: Contact) => {
    setContacts(contacts.map((contact) => (contact.id === updates.id ? updates : contact)))
  }

  const deleteItem = (id: string) => {
    setContacts(contacts.filter((contact) => contact.id !== id))
  }

  return { contacts, findItem, addItem, editItem, deleteItem }
}
