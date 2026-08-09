'use client'
import React from 'react'
import { ArrowUpRight, ArrowDownRight, Users, Eye, MapPin, Globe, FileText, ShoppingBag, DollarSign, Activity } from 'lucide-react'

export function AnalyticsClient({ 
  chartData, totalVisits, totalViews,
  todayVisits, yesterdayVisits, todayViews, yesterdayViews,
  topProducts, topCountries, topCities, topPages
}: any) {
  
  const maxVal = Math.max(...chartData.map((d: any) => Math.max(d.visits, d.views)), 1)

  const visitsDiff = todayVisits - yesterdayVisits
  const viewsDiff = todayViews - yesterdayViews

  const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num || 0)

  // SVG Path Generator for smooth curves
  const generateSmoothPath = (data: any[], key: string, max: number, width: number, height: number) => {
    if (data.length === 0) return '';
    const widthPerPoint = width / Math.max(data.length - 1, 1);
    
    const points = data.map((d, i) => {
      const x = i * widthPerPoint;
      const y = height - ((d[key] / max) * (height * 0.9)); // 90% height to leave padding at top
      return { x, y };
    });
    
    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cpX = curr.x + (next.x - curr.x) / 2;
      path += ` C ${cpX},${curr.y} ${cpX},${next.y} ${next.x},${next.y}`;
    }
    return path;
  };

  const chartWidth = Math.max(800, chartData.length * 60);
  const chartHeight = 240;

  return (
    <div className="space-y-6 animate-in fade-in">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <span>الرئيسية</span>
        <span>/</span>
        <span className="text-foreground">الإحصائيات والتحليلات</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Visits */}
        <div className="rounded-2xl border-0 p-4 sm:p-6 shadow-md transition-all hover:scale-[1.02] bg-indigo-50 text-indigo-950">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-200 text-indigo-700 shadow-sm">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-indigo-800/80">إجمالي الزيارات (30 يوم)</p>
              <h3 className="text-2xl font-bold tracking-tight mt-1">{formatNumber(totalVisits)}</h3>
            </div>
          </div>
        </div>

        {/* Total Views */}
        <div className="rounded-2xl border-0 p-4 sm:p-6 shadow-md transition-all hover:scale-[1.02] bg-emerald-50 text-emerald-950">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-200 text-emerald-700 shadow-sm">
              <Eye className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-800/80">إجمالي المشاهدات (30 يوم)</p>
              <h3 className="text-2xl font-bold tracking-tight mt-1">{formatNumber(totalViews)}</h3>
            </div>
          </div>
        </div>
        
        {/* Today Visits */}
        <div className="rounded-2xl border-0 p-4 sm:p-6 shadow-md transition-all hover:scale-[1.02] bg-amber-50 text-amber-950">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-200 text-amber-700 shadow-sm">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-amber-800/80">زيارات اليوم</p>
                <span className={`text-xs font-bold flex items-center ${visitsDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {visitsDiff >= 0 ? <ArrowUpRight className="w-3 h-3 ml-0.5" /> : <ArrowDownRight className="w-3 h-3 ml-0.5" />}
                  {formatNumber(Math.abs(visitsDiff))}
                </span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight mt-1">{formatNumber(todayVisits)}</h3>
            </div>
          </div>
        </div>

        {/* Today Views */}
        <div className="rounded-2xl border-0 p-4 sm:p-6 shadow-md transition-all hover:scale-[1.02] bg-rose-50 text-rose-950">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-200 text-rose-700 shadow-sm">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-rose-800/80">مشاهدات اليوم</p>
                <span className={`text-xs font-bold flex items-center ${viewsDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {viewsDiff >= 0 ? <ArrowUpRight className="w-3 h-3 ml-0.5" /> : <ArrowDownRight className="w-3 h-3 ml-0.5" />}
                  {formatNumber(Math.abs(viewsDiff))}
                </span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight mt-1">{formatNumber(todayViews)}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-4 sm:p-6 bg-card border border-border/40 rounded-xl shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold mb-6">النشاط اليومي (آخر 30 يوم)</h2>
          {chartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground">لا توجد بيانات متاحة</div>
          ) : (
            <div className="relative h-[300px] overflow-x-auto overflow-y-hidden custom-scrollbar pb-6" dir="ltr">
              <div style={{ width: `${chartWidth}px`, height: `${chartHeight}px` }} className="relative mt-4">
                
                {/* SVG Curves */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  {/* Visits Path Fill */}
                  <path 
                    d={`${generateSmoothPath(chartData, 'visits', maxVal, chartWidth, chartHeight)} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`}
                    fill="url(#colorVisits)"
                  />
                  {/* Views Path Fill */}
                  <path 
                    d={`${generateSmoothPath(chartData, 'views', maxVal, chartWidth, chartHeight)} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`}
                    fill="url(#colorViews)"
                  />
                  
                  {/* Visits Line */}
                  <path 
                    d={generateSmoothPath(chartData, 'visits', maxVal, chartWidth, chartHeight)}
                    fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round"
                    className="drop-shadow-sm"
                  />
                  {/* Views Line */}
                  <path 
                    d={generateSmoothPath(chartData, 'views', maxVal, chartWidth, chartHeight)}
                    fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"
                    className="drop-shadow-sm"
                  />
                </svg>

                {/* Interactive Points & Tooltips */}
                <div className="absolute inset-0 flex justify-between">
                  {chartData.map((day: any, i: number) => {
                    const widthPerPoint = chartWidth / Math.max(chartData.length - 1, 1);
                    const left = i * widthPerPoint;
                    
                    return (
                      <div key={i} className="group absolute h-full w-[40px] -ml-[20px] flex flex-col items-center justify-end z-10 cursor-pointer" style={{ left: `${left}px` }}>
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-[calc(100%+10px)] bg-black/90 text-white text-xs p-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-white/10">
                          <p dir="ltr" className="text-center font-bold mb-1">{day.date}</p>
                          <div className="flex items-center gap-2 text-indigo-300">
                            <div className="w-2 h-2 rounded-full bg-indigo-500" />
                            <span>زيارات المتجر: {formatNumber(day.visits)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-blue-300 mt-1">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span>مشاهدات المنتجات: {formatNumber(day.views)}</span>
                          </div>
                        </div>

                        {/* Hover vertical line */}
                        <div className="absolute top-0 bottom-0 w-px bg-border opacity-0 group-hover:opacity-100 transition-opacity" />

                        {/* X-axis label */}
                        <span className="absolute -bottom-6 text-[10px] text-muted-foreground font-medium whitespace-nowrap">
                          {day.date.split('-').slice(1).join('/')}
                        </span>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>
          )}
          <div className="flex justify-center gap-4 sm:gap-6 mt-6">
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
          <div className="p-4 sm:p-6 bg-card border border-border/50 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">المنتجات الأكثر مشاهدة</h2>
            <div className="space-y-3">
              {topProducts.length === 0 ? <p className="text-sm text-muted-foreground">لا توجد بيانات</p> : null}
              {topProducts.map((p: any, i: number) => (
                <div key={i} className="flex justify-between items-center text-sm border-b border-border/40 pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-9 h-9 rounded-md object-cover border border-border/50 shadow-sm" />
                    ) : (
                      <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center border border-border/50 shadow-sm">
                        <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                    <span className="truncate max-w-[150px] font-medium">{p.name}</span>
                  </div>
                  <span className="font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs shrink-0">{formatNumber(p.count)} مشاهدة</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="p-4 sm:p-6 bg-card border border-border/50 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">البلدان</h2>
          <div className="space-y-3">
            {topCountries.length === 0 ? <p className="text-sm text-muted-foreground">لا توجد بيانات</p> : null}
            {topCountries.map((c: any, i: number) => (
              <div key={i} className="flex justify-between items-center text-sm border-b border-border/40 pb-2 last:border-0 last:pb-0">
                <span className="font-medium">{c.name}</span>
                <span className="font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{formatNumber(c.count)} زيارة</span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 sm:p-6 bg-card border border-border/50 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">المدن</h2>
          <div className="space-y-3">
            {topCities.length === 0 ? <p className="text-sm text-muted-foreground">لا توجد بيانات</p> : null}
            {topCities.map((c: any, i: number) => (
              <div key={i} className="flex justify-between items-center text-sm border-b border-border/40 pb-2 last:border-0 last:pb-0">
                <span className="font-medium">{c.name}</span>
                <span className="font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{formatNumber(c.count)} زيارة</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
