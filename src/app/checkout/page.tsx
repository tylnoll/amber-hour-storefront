import { CheckoutClient } from "@/components/checkout-client";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;

  return <CheckoutClient status={params.status ?? null} />;
}
