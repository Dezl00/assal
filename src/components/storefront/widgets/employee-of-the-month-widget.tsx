import { prisma } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Award, ChevronLeft } from "lucide-react"

const MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
]

export async function EmployeeOfTheMonthWidget({ widget }: { widget: any }) {
  if (!widget.status) return null

  // Fetch the latest employee of the month
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  // Try to find current month, if not find the latest one
  let employee = await prisma.employeeOfTheMonth.findFirst({
    where: { month: currentMonth, year: currentYear }
  })

  if (!employee) {
    employee = await prisma.employeeOfTheMonth.findFirst({
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
      ]
    })
  }

  if (!employee) return null

  return (
    <section className="py-16 bg-muted/30 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="inline-flex items-center justify-center space-x-2 space-x-reverse mb-3">
            <span className="text-yellow-500 text-xl">⭐</span>
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              موظف الشهر
            </h2>
            <span className="text-yellow-500 text-xl">⭐</span>
          </div>
          <p className="text-muted-foreground max-w-2xl text-sm">
            نفتخر بتكريم المتميزين في فريق عملنا تقديراً لجهودهم وتفانيهم في العمل
          </p>
        </div>

        <div className="flex flex-col items-center justify-center">
          {/* Employee Card/Frame */}
          <div className="relative w-72 h-80 sm:w-80 sm:h-96 flex items-center justify-center mb-6">
            {/* The Frame Image */}
            <img 
              src="/images/employee-frame.png" 
              alt="إطار موظف الشهر" 
              className="absolute inset-0 w-full h-full object-contain z-20 pointer-events-none drop-shadow-xl"
            />
            
            {/* The Employee Image */}
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <div className="w-[60%] h-[60%] rounded-full overflow-hidden bg-white mb-[5%]">
                <img 
                  src={employee.imageUrl} 
                  alt={employee.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Month Name Top Badge */}
            <div className="absolute -top-4 z-30 bg-white shadow-lg border border-primary/20 text-primary font-bold px-6 py-1.5 rounded-full">
              {MONTHS[employee.month - 1]} {employee.year}
            </div>
          </div>

          <div className="text-center space-y-2 mt-2 z-10 relative">
            <h3 className="text-2xl font-bold text-foreground">{employee.name}</h3>
            <div className="inline-block bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm font-medium shadow-sm">
              {employee.jobTitle}
            </div>
          </div>

          <div className="mt-10">
            <Link href="/employees-of-the-month">
              <Button variant="outline" className="gap-2 rounded-full border-primary/30 hover:bg-primary/5 group">
                عرض كل الموظفين
                <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
