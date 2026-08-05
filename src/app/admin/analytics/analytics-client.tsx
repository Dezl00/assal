'use client'
import React from 'react'

export function AnalyticsClient({ chartData, totalVisits, totalViews }: { chartData: any[], totalVisits: number, totalViews: number }) {
  // Simple CSS based bar chart or just numbers if recharts is not installed
  // We'll use simple flex bars to keep it lightweight and zero dependencies
  const maxVal = Math.max(...chartData.map(d => Math.max(d.visits, d.views)), 1)

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">الإحصائيات والتحليلات</h1>
        <p className="text-muted-foreground mt-1">متابعة زيارات المتجر ومشاهدات المنتجات (آخر 30 يوم)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-card border rounded-xl shadow-sm flex flex-col justify-center items-center">
          <span className="text-muted-foreground text-sm font-medium">إجمالي زيارات المتجر</span>
          <span className="text-4xl font-bold text-primary mt-2">{totalVisits}</span>
        </div>
        <div className="p-6 bg-card border rounded-xl shadow-sm flex flex-col justify-center items-center">
          <span className="text-muted-foreground text-sm font-medium">إجمالي مشاهدات المنتجات</span>
          <span className="text-4xl font-bold text-blue-600 mt-2">{totalViews}</span>
        </div>
      </div>

      <div className="p-6 bg-card border rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-6">النشاط اليومي (آخر 30 يوم)</h2>
        
        {chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-muted-foreground">لا توجد بيانات متاحة</div>
        ) : (
          <div className="h-64 flex items-end gap-2 overflow-x-auto pb-4">
            {chartData.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-1 min-w-[40px] group relative">
                {/* Tooltip */}
                <div className="absolute -top-16 bg-black text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none">
                  <p>{day.date}</p>
                  <p>الزيارات: {day.visits}</p>
                  <p>المشاهدات: {day.views}</p>
                </div>
                
                <div className="w-full flex justify-center gap-1 items-end h-48">
                  <div 
                    className="w-3 bg-primary rounded-t-sm transition-all duration-500" 
                    style={{ height: \\%\ }}
                  />
                  <div 
                    className="w-3 bg-blue-500 rounded-t-sm transition-all duration-500" 
                    style={{ height: \\%\ }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground rotate-45 origin-left mt-2">
                  {day.date.split('-').slice(1).join('/')}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-center gap-6 mt-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span className="text-xs text-muted-foreground">زيارات المتجر</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-muted-foreground">مشاهدات المنتجات</span>
          </div>
        </div>
      </div>
    </div>
  )
}
