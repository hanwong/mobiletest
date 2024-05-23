import { useParams } from "react-router-dom"
import Page from "../../../components/Page"
import useContacts from "./useContacts"
import ContactForm from "./ContactForm"

const EditContact = () => {
  const { id } = useParams()
  const { findItem } = useContacts()
  if (!id) return null
  const contact = findItem(id)
  if (!contact) return null

  return (
    <Page title="Edit contact">
      <ContactForm defaultValues={contact} />
    </Page>
  )
}

export default EditContact
