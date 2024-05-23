import z from "zod"

export default z
  .object({
    password: z.string().min(8),
    confirm: z.string(),
  })
  .refine(({ password, confirm }) => password === confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  })
