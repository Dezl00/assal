'use client'
import React from 'react'
import { ArrowUpRight, ArrowDownRight, Users, Eye, MapPin, Globe } from 'lucide-react'

export function AnalyticsClient({ 
  chartData, totalVisits, totalViews,
  todayVisits, yesterdayVisits, todayViews, yesterdayViews,
  topProducts, topCountries, topCities
}: any) {
  
  const maxVal = Math.max(...chartData.map((d: any) => Math.max(d.visits, d.views)), 1)

  const visitsDiff = todayVisits - yesterdayVisits
  const viewsDiff = todayViews - yesterdayViews

  return (
    <div className="space-y-6 animate-in fade-in">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <span>الرئيسية</span>
        <span>/</span>
        <span className="text-foreground">الإحصائيات والتحليلات</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Visits */}
        <div className="p-6 bg-primary/5 border border-primary/10 rounded-xl shadow-sm flex flex-col justify-between hover:bg-primary/10 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <span className="text-muted-foreground text-sm font-medium">إجمالي الزيارات (30 يوم)</span>
            <Users className="text-primary w-5 h-5 opacity-50" />
          </div>
          <span className="text-4xl font-bold text-foreground">{totalVisits}</span>
        </div>
        {/* Total Views */}
        <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-xl shadow-sm flex flex-col justify-between hover:bg-blue-500/10 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <span className="text-muted-foreground text-sm font-medium">مشاهدات المنتجات (30 يوم)</span>
            <Eye className="text-blue-500 w-5 h-5 opacity-50" />
          </div>
          <span className="text-4xl font-bold text-foreground">{totalViews}</span>
        </div>
        
        {/* Today Visits */}
        <div className="p-6 bg-green-500/5 border border-green-500/10 rounded-xl shadow-sm flex flex-col justify-between hover:bg-green-500/10 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <span className="text-muted-foreground text-sm font-medium">زيارات اليوم</span>
            <span className={`text-xs font-bold flex items-center ${visitsDiff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {visitsDiff >= 0 ? <ArrowUpRight className="w-3 h-3 ml-1" /> : <ArrowDownRight className="w-3 h-3 ml-1" />}
              {Math.abs(visitsDiff)} عن الأمس
            </span>
          </div>
          <span className="text-4xl font-bold text-primary">{todayVisits}</span>
        </div>

        {/* Today Views */}
        <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-xl shadow-sm flex flex-col justify-between hover:bg-amber-500/10 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <span className="text-muted-foreground text-sm font-medium">مشاهدات اليوم</span>
            <span className={`text-xs font-bold flex items-center ${viewsDiff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {viewsDiff >= 0 ? <ArrowUpRight className="w-3 h-3 ml-1" /> : <ArrowDownRight className="w-3 h-3 ml-1" />}
              {Math.abs(viewsDiff)} عن الأمس
            </span>
          </div>
          <span className="text-4xl font-bold text-blue-600">{todayViews}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-card border border-border/40 rounded-xl shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold mb-6">النشاط اليومي (آخر 30 يوم)</h2>
          {chartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground">لا توجد بيانات متاحة</div>
          ) : (
            <div className="h-64 flex items-end gap-2 overflow-x-auto pb-4 custom-scrollbar">
              {chartData.map((day: any, i: number) => (
                <div key={i} className="flex flex-col items-center gap-1 min-w-[40px] group relative">
                  <div className="absolute -top-16 bg-black text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none">
                    <p>{day.date}</p>
                    <p>الزيارات: {day.visits}</p>
                    <p>المشاهدات: {day.views}</p>
                  </div>
                  <div className="w-full flex justify-center gap-1 items-end h-48">
                    <div 
                      className="w-3 bg-primary rounded-t-sm transition-all duration-500 hover:brightness-110" 
                      style={{ height: `${(day.visits / maxVal) * 100}%` }}
                    />
                    <div 
                      className="w-3 bg-blue-500 rounded-t-sm transition-all duration-500 hover:brightness-110" 
                      style={{ height: `${(day.views / maxVal) * 100}%` }}
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

        <div className="space-y-6">
          <div className="p-6 bg-orange-500/5 border border-orange-500/10 rounded-xl shadow-sm hover:bg-orange-500/10 transition-colors">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Eye className="w-5 h-5 text-amber-500"/> المنتجات الأكثر مشاهدة</h2>
            <div className="space-y-3">
              {topProducts.length === 0 ? <p className="text-sm text-muted-foreground">لا توجد بيانات</p> : null}
              {topProducts.map((p: any, i: number) => (
                <div key={i} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                  <span className="truncate max-w-[200px]">{p.name}</span>
                  <span className="font-bold bg-muted px-2 py-1 rounded text-xs">{p.count} مشاهدة</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-xl shadow-sm hover:bg-blue-500/10 transition-colors">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Globe className="w-5 h-5 text-blue-500"/> البلدان</h2>
          <div className="space-y-3">
            {topCountries.length === 0 ? <p className="text-sm text-muted-foreground">لا توجد بيانات</p> : null}
            {topCountries.map((c: any, i: number) => (
              <div key={i} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                <span>{c.name}</span>
                <span className="font-bold bg-muted px-2 py-1 rounded text-xs">{c.count} زيارة</span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-xl shadow-sm hover:bg-red-500/10 transition-colors">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-red-500"/> المدن</h2>
          <div className="space-y-3">
            {topCities.length === 0 ? <p className="text-sm text-muted-foreground">لا توجد بيانات</p> : null}
            {topCities.map((c: any, i: number) => (
              <div key={i} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                <span>{c.name}</span>
                <span className="font-bold bg-muted px-2 py-1 rounded text-xs">{c.count} زيارة</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
