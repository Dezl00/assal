"use client"
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { updateProfile } from '@/features/accounts/actions'
import { toast } from 'sonner'
import { Loader2, User as UserIcon, Shield } from 'lucide-react'

export function SecurityClient({ logs, currentUser }: { logs: any[], currentUser: any }) {
  const permissions = currentUser?.permissions || []
  const isAdmin = currentUser?.role === 'ADMIN'
  const hasPerm = (perm: string) => isAdmin || permissions.includes(perm)

  const allowedTabs = [
    ...(hasPerm('security.logs') ? ['logs'] : [])
  ]

  const [activeTab, setActiveTab] = useState(allowedTabs[0] || 'logs')
  const [isSubmitting, setIsSubmitting] = useState(false)


  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>الرئيسية</span>
          <span>/</span>
          <span className="text-foreground">الأمان والحساب</span>
        </nav>
      </div>

      <div className="flex border-b border-border/50">

        {hasPerm('security.logs') && (
          <button 
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'logs' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            <Shield className="w-4 h-4" /> سجل الأمان
          </button>
        )}
      </div>


      {activeTab === 'logs' && hasPerm('security.logs') && (
        <div className="border border-border/50 rounded-xl bg-card overflow-hidden shadow-sm">
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
                <tr key={log.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20">
                  <td className="p-4 text-xs font-mono" dir="ltr">{new Date(log.createdAt).toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
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
      )}
    </div>
  )
}
