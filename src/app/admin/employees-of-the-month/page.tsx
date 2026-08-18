import { getEmployeesOfTheMonth } from "@/features/employees-of-the-month/actions"
import { EmployeesClient } from "./employees-client"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "موظفو الشهر",
}

export default async function EmployeesOfTheMonthPage({
  searchParams
}: {
  searchParams: { q?: string, month?: string, year?: string }
}) {
  const query = searchParams.q || ""
  const month = searchParams.month ? parseInt(searchParams.month) : undefined
  const year = searchParams.year ? parseInt(searchParams.year) : undefined
  
  const employees = await getEmployeesOfTheMonth(query, month, year)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">موظفو الشهر</h1>
          <p className="text-muted-foreground">
            إدارة موظفي الشهر المتميزين لعرضهم في المتجر
          </p>
        </div>
        <Link prefetch={false} href="/admin/employees-of-the-month/create">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            إضافة موظف
          </Button>
        </Link>
      </div>

      <EmployeesClient employees={employees} />
    </div>
  )
}
