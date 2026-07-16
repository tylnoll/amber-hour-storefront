import { getUser } from "@netlify/identity";

export async function requireAccountSession() {
  const user = await getUser();
  return user?.id ?? null;
}
