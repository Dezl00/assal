'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PlusCircle, Edit, Trash2, X, Loader2, ShieldCheck, ShieldAlert } from 'lucide-react'
import { createAccount, updateAccount, deleteAccount } from '@/features/accounts/actions'
import { toast } from 'sonner'
import { ConfirmModal } from '@/components/ui/confirm-modal'

export function AccountsClient({ accounts }: { accounts: any[] }) {
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<any>(null)

  function resetForm() {
    setEditingItem(null)
    setIsFormVisible(false)
    const form: any = document.getElementById("add-account-form")
    if (form) form.reset()
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    
    let res
    if (editingItem) res = await updateAccount(editingItem.id, formData)
    else res = await createAccount(formData)
      
    setIsSubmitting(false)
    if (res.success) {
      toast.success('تم الحفظ بنجاح')
      resetForm()
    } else {
      toast.error(res.error || 'فشل الحفظ')
    }
  }

  async function handleDeleteConfirm() {
    if (!itemToDelete) return
    const res = await deleteAccount(itemToDelete.id)
    if (res.success) toast.success('تم الحذف بنجاح')
    else toast.error(res.error || 'فشل الحذف')
    setDeleteModalOpen(false)
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>الرئيسية</span>
          <span>/</span>
          <span className="text-foreground">الحسابات والأدوار</span>
        </nav>
        <Button onClick={() => { resetForm(); setIsFormVisible(!isFormVisible) }} className="lg:hidden gap-2">
          {isFormVisible ? <><X className="w-4 h-4" /> إلغاء</> : <><PlusCircle className="w-4 h-4" /> إضافة حساب</>}
        </Button>
      </div>

      {/* Permissions Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-red-50/50 border border-red-100 p-4 rounded-xl flex gap-3">
          <ShieldAlert className="text-red-500 w-6 h-6 shrink-0" />
          <div>
            <h3 className="font-bold text-red-900 text-sm mb-1">مدير كامل (Admin)</h3>
            <p className="text-xs text-red-800 leading-relaxed">
              له كامل الصلاحيات في المتجر، يمكنه إضافة/حذف حسابات، رؤية الإحصائيات، سجل الأمان، التحكم في الواجهات والإعدادات العامة.
            </p>
          </div>
        </div>
        <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex gap-3">
          <ShieldCheck className="text-blue-500 w-6 h-6 shrink-0" />
          <div>
            <h3 className="font-bold text-blue-900 text-sm mb-1">مشرف (Manager)</h3>
            <p className="text-xs text-blue-800 leading-relaxed">
              صلاحيات محدودة جداً: تقتصر على إدارة الأقسام والمنتجات، رؤية الطلبات والعملاء، ولا يمكنه التحكم في إعدادات النظام أو الواجهات.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 relative items-start">
        {/* Table Area */}
        <div className="flex-1 w-full order-last lg:order-first">
          <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="p-4 font-medium">الاسم</th>
                    <th className="p-4 font-medium">البريد الإلكتروني</th>
                    <th className="p-4 font-medium">الدور</th>
                    <th className="p-4 font-medium">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map(acc => (
                    <tr key={acc.id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="p-4 font-medium">{acc.name || 'بدون اسم'}</td>
                      <td className="p-4" dir="ltr">{acc.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs ${acc.role === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                          {acc.role === 'ADMIN' ? 'مدير كامل' : 'مشرف'}
                        </span>
                      </td>
                      <td className="p-4 flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => { setEditingItem(acc); setIsFormVisible(true) }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { setItemToDelete(acc); setDeleteModalOpen(true) }}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {accounts.length === 0 && (
                    <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">لا توجد حسابات مسجلة</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sticky Form Side */}
        <div className={`w-full lg:w-[400px] shrink-0 lg:sticky lg:top-4 order-first transition-all duration-300 ${!isFormVisible ? 'hidden lg:block' : 'block'}`}>
          <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
            <div className="border-b border-border/50 px-6 py-4 bg-muted/5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">{editingItem ? 'تعديل حساب' : 'إضافة حساب جديد'}</h2>
              </div>
              {editingItem && (
                <Button variant="ghost" size="icon" onClick={resetForm} className="h-8 w-8 shrink-0 text-muted-foreground">
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} id="add-account-form" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">الاسم</label>
                  <input name="name" type="text" required defaultValue={editingItem?.name || ''} className="w-full h-10 px-3 border rounded-md" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">البريد الإلكتروني</label>
                  <input name="email" type="email" required defaultValue={editingItem?.email || ''} className="w-full h-10 px-3 border rounded-md" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">الدور (الصلاحية)</label>
                  <select name="role" key={editingItem?.role || 'MANAGER'} defaultValue={editingItem?.role || 'MANAGER'} className="w-full h-10 px-3 border rounded-md">
                    <option value="MANAGER">مشرف (MANAGER)</option>
                    <option value="ADMIN">مدير كامل (ADMIN)</option>
                  </select>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingItem ? 'تحديث' : 'إضافة')}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="تأكيد الحذف"
        description="هل أنت متأكد من حذف هذا الحساب؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  )
}
