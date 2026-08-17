import { db as prisma } from "@/lib/db"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export const metadata = {
  title: "موظفو الشهر",
  description: "تكريم المتميزين في فريق عملنا تقديراً لجهودهم وتفانيهم في العمل",
}

const MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
]

export default async function EmployeesOfTheMonthPage() {
  const employees = await prisma.employeeOfTheMonth.findMany({
    orderBy: [
      { year: 'desc' },
      { month: 'desc' },
    ]
  })

  // Group by year
  const groupedByYear: Record<number, typeof employees> = {}
  employees.forEach(emp => {
    if (!groupedByYear[emp.year]) groupedByYear[emp.year] = []
    groupedByYear[emp.year].push(emp)
  })

  const years = Object.keys(groupedByYear).map(Number).sort((a, b) => b - a)

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-12 min-h-screen">
      {/* Page Header */}
      <div className="mb-8 sm:mb-12 relative overflow-hidden rounded-3xl bg-primary p-8 sm:p-16 text-center shadow-lg shadow-primary/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-primary-foreground mb-4">
            موظفو الشهر المتميزون
          </h1>
          <p className="text-base sm:text-lg text-primary-foreground/90 max-w-2xl mx-auto mb-6">
            تكريم المتميزين في فريق عملنا تقديراً لجهودهم وتفانيهم
          </p>
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-primary-foreground/80 bg-black/10 backdrop-blur-sm px-4 py-2 rounded-full">
            <Link href="/" className="hover:text-white transition-colors">الرئيسية</Link>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 rtl-flip opacity-50" />
            <span className="text-white font-medium">موظفو الشهر</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12">
        {years.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-border">
            <h2 className="text-2xl font-bold text-muted-foreground mb-2">لا يوجد سجلات حالياً</h2>
            <p className="text-muted-foreground">لم يتم إضافة موظفين بعد في لوحة الشرف.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {years.map(year => (
              <div key={year} className="space-y-8">
                <div className="flex items-center gap-4">
                  <h2 className="text-3xl font-bold text-foreground">{year}</h2>
                  <div className="h-px bg-border flex-1"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                  {groupedByYear[year].map(employee => (
                    <div key={employee.id} className="flex flex-col items-center group">
                      <div className="relative w-64 h-72 flex items-center justify-center mb-3 transition-transform duration-300 group-hover:-translate-y-2">
                        {/* The Frame Image */}
                        <img 
                          src="/images/employee-frame.png" 
                          alt="إطار موظف الشهر" 
                          className="absolute inset-0 w-full h-full object-contain z-20 pointer-events-none"
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
                        <div className="absolute -top-3 z-30 bg-primary shadow-md border border-primary/20 text-primary-foreground font-bold px-5 py-1 rounded-full text-sm">
                          {MONTHS[employee.month - 1]}
                        </div>
                      </div>

                      <div className="text-center space-y-2 relative z-10">
                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{employee.name}</h3>
                        <div className="inline-block bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm font-medium shadow-sm">
                          {employee.jobTitle}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
