import { Suspense } from "react";
import { CheckoutClient } from "@/components/checkout-client";

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutClient />
    </Suspense>
  );
}
