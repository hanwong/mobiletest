import { useCallback, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { Box, Container, Drawer, Text, Title } from "@mantine/core"
import { useLocalStorage } from "@mantine/hooks"
import { ASSETS_URL } from "../../scripts/shared/constants"

interface NewsItem {
  datetime: string
  title: string
  content: string
}

const News = () => {
  const [seen, setSeen] = useLocalStorage<string[]>({ key: "News", defaultValue: [], getInitialValueInEffect: false })

  const baseURL = ASSETS_URL
  const path = "/news/wallet.json"
  const { data = [] } = useQuery<NewsItem[]>({
    queryKey: [baseURL, path],
    queryFn: async () => {
      const { data } = await axios.get(path, { baseURL })
      return data
    },
    staleTime: Infinity,
  })

  const unseen = useMemo(() => data.filter(({ datetime }) => !seen.includes(datetime)), [data, seen])
  const close = useCallback(() => setSeen(data.map(({ datetime }) => datetime)), [data, setSeen])

  if (!unseen.length) return null

  return (
    <Drawer title="News" opened onClose={close}>
      <Container>
        {unseen.reverse().map(({ datetime, title, content }) => (
          <Box px={20} mb={20} key={datetime}>
            <Text c="mono.2" fz={12}>
              {new Date(datetime).toLocaleDateString()}
            </Text>

            <Title c="mono.0" fz={20} fw={600} mb={10}>
              {title}
            </Title>

            <Text>{content}</Text>
          </Box>
        ))}
      </Container>
    </Drawer>
  )
}

export default News
