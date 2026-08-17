import { getEmployeeOfTheMonth } from "@/features/employees-of-the-month/actions"
import { EmployeeEditorClient } from "../employee-editor-client"
import { notFound } from "next/navigation"

export const metadata = {
  title: "تعديل موظف الشهر",
}

export default async function EditEmployeePage({ params }: { params: { id: string } }) {
  const employee = await getEmployeeOfTheMonth(params.id)
  
  if (!employee) {
    notFound()
  }

  return <EmployeeEditorClient initialEmployee={employee} />
}
