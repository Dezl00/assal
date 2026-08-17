"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Edit, Trash2, Loader2, Image as ImageIcon } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { arSA } from "date-fns/locale"
import { deleteEmployeeOfTheMonth } from "@/features/employees-of-the-month/actions"
import { toast } from "sonner"
import { ConfirmModal } from "@/components/ui/confirm-modal"

const MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
]

export function EmployeesClient({ employees }: { employees: any[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [search, setSearch] = useState(searchParams.get("q") || "")
  const [isDeleting, setIsDeleting] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (search) params.set("q", search)
    else params.delete("q")
    
    router.push(`/admin/employees-of-the-month?${params.toString()}`)
  }

  async function confirmDelete() {
    if (!employeeToDelete) return
    setIsDeleting(true)
    const res = await deleteEmployeeOfTheMonth(employeeToDelete)
    setIsDeleting(false)
    setEmployeeToDelete(null)
    
    if (res.success) {
      toast.success("تم حذف الموظف بنجاح")
    } else {
      toast.error(res.error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg border">
        <form onSubmit={handleSearch} className="flex-1 w-full sm:max-w-md relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="ابحث بالاسم أو المسمى الوظيفي..." 
            className="pr-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </form>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">الصورة</TableHead>
              <TableHead>الاسم</TableHead>
              <TableHead>المسمى الوظيفي</TableHead>
              <TableHead>الشهر والسنة</TableHead>
              <TableHead>تاريخ الإضافة</TableHead>
              <TableHead className="w-[100px] text-left">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  لا يوجد موظفين مسجلين
                </TableCell>
              </TableRow>
            ) : (
              employees.map(emp => (
                <TableRow key={emp.id}>
                  <TableCell>
                    {emp.imageUrl ? (
                      <img src={emp.imageUrl} alt={emp.name} className="w-10 h-10 rounded-full object-cover border" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{emp.name}</TableCell>
                  <TableCell>{emp.jobTitle}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {MONTHS[emp.month - 1]} {emp.year}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(emp.createdAt), 'dd MMMM yyyy', { locale: arSA })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/employees-of-the-month/${emp.id}`}>
                        <Button variant="ghost" size="icon" className="hover:text-primary">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setEmployeeToDelete(emp.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmModal
        isOpen={!!employeeToDelete}
        title="تأكيد الحذف"
        description="هل أنت متأكد من حذف هذا الموظف؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={confirmDelete}
        onCancel={() => setEmployeeToDelete(null)}
        isLoading={isDeleting}
      />
    </div>
  )
}
