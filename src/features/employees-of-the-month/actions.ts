"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const employeeSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  jobTitle: z.string().min(1, "المسمى الوظيفي مطلوب"),
  imageUrl: z.string().min(1, "الصورة مطلوبة"),
  month: z.number().min(1).max(12),
  year: z.number().min(2000).max(2100),
})

export async function getEmployeesOfTheMonth(search?: string, month?: number, year?: number) {
  try {
    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { jobTitle: { contains: search, mode: "insensitive" } },
      ]
    }
    if (month) where.month = month
    if (year) where.year = year

    const employees = await prisma.employeeOfTheMonth.findMany({
      where,
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
      ],
    })
    
    return employees
  } catch (error) {
    console.error("Error fetching employees of the month:", error)
    return []
  }
}

export async function getEmployeeOfTheMonth(id: string) {
  try {
    return await prisma.employeeOfTheMonth.findUnique({
      where: { id }
    })
  } catch (error) {
    console.error("Error fetching employee of the month:", error)
    return null
  }
}

export async function createEmployeeOfTheMonth(data: z.infer<typeof employeeSchema>) {
  try {
    const parsedData = employeeSchema.parse(data)
    
    // Check if one already exists for this month and year
    const existing = await prisma.employeeOfTheMonth.findUnique({
      where: {
        month_year: {
          month: parsedData.month,
          year: parsedData.year
        }
      }
    })
    
    if (existing) {
      return { success: false, error: "يوجد موظف مسجل في هذا الشهر والسنة بالفعل" }
    }

    const employee = await prisma.employeeOfTheMonth.create({
      data: parsedData
    })

    revalidatePath("/admin/employees-of-the-month")
    revalidatePath("/")
    revalidatePath("/employees-of-the-month")
    
    return { success: true, employee }
  } catch (error: any) {
    console.error("Error creating employee of the month:", error)
    return { success: false, error: error.message || "حدث خطأ أثناء إضافة الموظف" }
  }
}

export async function updateEmployeeOfTheMonth(id: string, data: z.infer<typeof employeeSchema>) {
  try {
    const parsedData = employeeSchema.parse(data)
    
    // Check if one already exists for this month and year, excluding current
    const existing = await prisma.employeeOfTheMonth.findUnique({
      where: {
        month_year: {
          month: parsedData.month,
          year: parsedData.year
        }
      }
    })
    
    if (existing && existing.id !== id) {
      return { success: false, error: "يوجد موظف مسجل في هذا الشهر والسنة بالفعل" }
    }

    const employee = await prisma.employeeOfTheMonth.update({
      where: { id },
      data: parsedData
    })

    revalidatePath("/admin/employees-of-the-month")
    revalidatePath("/")
    revalidatePath("/employees-of-the-month")
    
    return { success: true, employee }
  } catch (error: any) {
    console.error("Error updating employee of the month:", error)
    return { success: false, error: error.message || "حدث خطأ أثناء تحديث بيانات الموظف" }
  }
}

export async function deleteEmployeeOfTheMonth(id: string) {
  try {
    await prisma.employeeOfTheMonth.delete({
      where: { id }
    })

    revalidatePath("/admin/employees-of-the-month")
    revalidatePath("/")
    revalidatePath("/employees-of-the-month")
    
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting employee of the month:", error)
    return { success: false, error: "حدث خطأ أثناء حذف الموظف" }
  }
}
