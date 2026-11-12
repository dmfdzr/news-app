import { redirect } from "next/navigation"

import { getCurrentUser } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function MyProfileRedirectPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/masuk?next=/profil")
  redirect(`/@${user.username}`)
}
