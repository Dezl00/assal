import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { updateProfile } from '@/features/accounts/actions'
import { toast } from 'sonner'
import { Loader2, User as UserIcon, Shield } from 'lucide-react'

export function SecurityClient({ logs, currentUser }: { logs: any[], currentUser: any }) {
  const [activeTab, setActiveTab] = useState<'profile' | 'logs'>('profile')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleProfileUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const res = await updateProfile(formData)
    setIsSubmitting(false)
    if (res.success) {
      toast.success('تم تحديث البيانات بنجاح')
    } else {
      toast.error(res.error || 'فشل التحديث')
    }
  }
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>الرئيسية</span>
          <span>/</span>
          <span className="text-foreground">سجل الأمان والأنشطة</span>
        </nav>
      </div>

      <div className="flex border-b border-border/50 mb-6">
        <button 
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          <UserIcon className="w-4 h-4" /> إعدادات الحساب
        </button>
        {currentUser?.role === 'ADMIN' && (
          <button 
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'logs' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            <Shield className="w-4 h-4" /> سجل الأمان
          </button>
        )}
      </div>

      {activeTab === 'profile' && (
        <div className="max-w-xl">
          <div className="border border-border/50 rounded-xl bg-card overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border/50 bg-muted/5">
              <h2 className="text-lg font-semibold">تعديل بيانات الحساب</h2>
              <p className="text-sm text-muted-foreground mt-1">تحديث اسمك أو كلمة المرور الخاصة بك.</p>
            </div>
            <div className="p-6">
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">الاسم</label>
                  <input name="name" type="text" required defaultValue={currentUser?.name || ''} className="w-full h-10 px-3 border rounded-md" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">كلمة المرور الجديدة <span className="text-muted-foreground text-xs">(اختياري)</span></label>
                  <input name="password" type="password" className="w-full h-10 px-3 border rounded-md" />
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حفظ التعديلات'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && currentUser?.role === 'ADMIN' && (
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
      )}
    </div>
  )
}
