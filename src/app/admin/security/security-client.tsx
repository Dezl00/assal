'use client'
import React from 'react'

export function SecurityClient({ logs }: { logs: any[] }) {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">سجل الأمان والأنشطة</h1>
          <p className="text-muted-foreground mt-1">تتبع أنشطة المدراء في لوحة التحكم (آخر 100 نشاط)</p>
        </div>
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="p-4 font-medium">التاريخ</th>
                <th className="p-4 font-medium">المستخدم</th>
                <th className="p-4 font-medium">الإجراء</th>
                <th className="p-4 font-medium">العنصر</th>
                <th className="p-4 font-medium">التفاصيل</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="p-4 text-xs" dir="ltr">{new Date(log.createdAt).toLocaleString('ar-EG')}</td>
                  <td className="p-4 font-medium">{log.user?.name || log.userId || 'نظام'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${log.action === 'Delete' ? 'bg-red-100 text-red-700' : log.action === 'Create' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-xs">{log.entityType} ({log.entityId || 'N/A'})</td>
                  <td className="p-4 text-xs text-muted-foreground max-w-[200px] truncate">
                    {log.details ? JSON.stringify(log.details) : '-'}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">لا توجد أنشطة مسجلة حتى الآن</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
