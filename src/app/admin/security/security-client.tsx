'use client'
import React from 'react'

export function SecurityClient({ logs }: { logs: any[] }) {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>الرئيسية</span>
          <span>/</span>
          <span className="text-foreground">سجل الأمان والأنشطة</span>
        </nav>
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
                    <span className={`px-2 py-1 rounded text-xs ${log.action === 'Delete' || log.action === 'حذف' ? 'bg-red-100 text-red-700' : log.action === 'Create' || log.action === 'إنشاء' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {log.action === 'Create' ? 'إنشاء' : log.action === 'Update' ? 'تعديل' : log.action === 'Delete' ? 'حذف' : log.action === 'Login' ? 'تسجيل دخول' : log.action}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-xs text-right" dir="rtl">
                    {
                      log.entityType === 'Product' ? 'منتج' :
                      log.entityType === 'Category' ? 'قسم' :
                      log.entityType === 'Brand' ? 'ماركة' :
                      log.entityType === 'Order' ? 'طلب' :
                      log.entityType === 'Widget' ? 'مكون واجهة' :
                      log.entityType === 'User' ? 'مستخدم' :
                      log.entityType === 'Backup' ? 'نسخة احتياطية' :
                      log.entityType === 'ThemeConfig' ? 'إعدادات المتجر' :
                      log.entityType
                    } <span className="text-muted-foreground mr-1">({log.entityId || '-'})</span>
                  </td>
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
