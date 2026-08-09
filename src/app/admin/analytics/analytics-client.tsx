'use client'
import React from 'react'
import { ArrowUpRight, ArrowDownRight, Users, Eye, MapPin, Globe, FileText, ShoppingBag, DollarSign, Activity } from 'lucide-react'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border/50 p-3 rounded-lg flex flex-col gap-1.5 min-w-[150px]">
        <p dir="ltr" className="text-center font-bold mb-1 text-xs text-foreground">{label}</p>
        <div className="flex items-center gap-2 text-primary">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-xs font-semibold">زيارات المتجر: {new Intl.NumberFormat('en-US').format(payload[0].value)}</span>
        </div>
        <div className="flex items-center gap-2 text-blue-500">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-xs font-semibold">مشاهدات المنتجات: {new Intl.NumberFormat('en-US').format(payload[1].value)}</span>
        </div>
      </div>
    );
  }
  return null;
};

export function AnalyticsClient({ 
  chartData, totalVisits, totalViews,
  todayVisits, yesterdayVisits, todayViews, yesterdayViews,
  topProducts, topCountries, topCities, topPages
}: any) {
  
  const visitsDiff = todayVisits - yesterdayVisits
  const viewsDiff = todayViews - yesterdayViews

  const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num || 0)

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
        <div className="p-4 sm:p-6 bg-card border border-border/50 rounded-xl lg:col-span-2">
          <h2 className="text-lg font-semibold mb-6">النشاط اليومي (آخر 30 يوم)</h2>
          {chartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground">لا توجد بيانات متاحة</div>
          ) : (
            <div className="h-[300px] w-full mt-4" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(val) => val.split('-').slice(1).join('/')}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }}
                    dy={10}
                    minTickGap={20}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area 
                    type="monotone" 
                    dataKey="visits" 
                    stroke="#4f46e5" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorVisits)" 
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorViews)" 
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="flex justify-center gap-4 sm:gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-xs font-semibold text-muted-foreground">زيارات المتجر</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-xs font-semibold text-muted-foreground">مشاهدات المنتجات</span>
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
