import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"
import { Button, Stack, TextInput } from "@mantine/core"
import { DEFAULT_GAS_ADJUSTMENT } from "../../../scripts/shared/constants"
import type { Preferences } from "../../../scripts/types"
import { request, usePreferences } from "../../background"
import toast from "../../styles/toast"
import Page from "../../components/Page"
import FixedBottom from "../../components/FixedBottom"

const WEEK_IN_MINUTE = 60 * 24 * 7

const Advanced = () => {
  const navigate = useNavigate()
  const preferences = usePreferences()

  const { register, handleSubmit, formState } = useForm<Preferences>({ defaultValues: preferences })

  const queryClient = useQueryClient()
  const submit = handleSubmit(async (data) => {
    try {
      await request("setPreferences", data)
      await queryClient.invalidateQueries()
      toast.success("Preferences saved")
      navigate(-1)
    } catch (error) {
      toast.error("Failed to save preferences")
    }
  })

  return (
    <Page title="Advanced">
      <form onSubmit={submit}>
        <Stack spacing={20}>
          <TextInput
            {...register("timeoutMinutes", {
              valueAsNumber: true,
              min: { value: 0, message: "Must be greater than 0" },
              max: { value: WEEK_IN_MINUTE, message: `Must be less than ${WEEK_IN_MINUTE}` },
            })}
            label="Auto-lock timer (minutes)"
            placeholder="0"
            error={formState.errors.timeoutMinutes?.message}
            autoComplete="off"
          />

          <TextInput
            {...register("gasAdjustment", { valueAsNumber: true, min: 0 })}
            label="Gas adjustment"
            placeholder={String(DEFAULT_GAS_ADJUSTMENT)}
            error={formState.errors.gasAdjustment?.message}
            autoComplete="off"
          />
        </Stack>

        <FixedBottom>
          <Button type="submit">Save</Button>
        </FixedBottom>
      </form>
    </Page>
  )
}

export default Advanced
