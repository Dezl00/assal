import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { CouponForm } from "../coupon-form"

export default async function EditCouponPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const coupon = await db.coupon.findUnique({
    where: { id: params.id }
  })
  
  if (!coupon) return notFound()

  return <CouponForm initialData={coupon} />
}
