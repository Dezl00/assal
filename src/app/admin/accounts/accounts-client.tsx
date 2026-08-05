'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PlusCircle, Edit, Trash2, X, Loader2 } from 'lucide-react'
import { createAccount, updateAccount, deleteAccount } from '@/features/accounts/actions'
import { toast } from 'sonner'
import { ConfirmModal } from '@/components/ui/confirm-modal'

export function AccountsClient({ accounts }: { accounts: any[] }) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<any>(null)

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
      setIsFormOpen(false)
      setEditingItem(null)
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">الحسابات والأدوار</h1>
          <p className="text-muted-foreground mt-1">إدارة حسابات المدراء والمشرفين للمتجر</p>
        </div>
        <Button onClick={() => { setEditingItem(null); setIsFormOpen(!isFormOpen) }} className="gap-2">
          {isFormOpen ? <><X className="w-4 h-4" /> إلغاء</> : <><PlusCircle className="w-4 h-4" /> إضافة حساب</>}
        </Button>
      </div>

      {isFormOpen && (
        <div className="p-6 bg-card border rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">{editingItem ? 'تعديل حساب' : 'إضافة حساب جديد'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
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
              <select name="role" defaultValue={editingItem?.role || 'MANAGER'} className="w-full h-10 px-3 border rounded-md">
                <option value="MANAGER">مشرف (MANAGER)</option>
                <option value="ADMIN">مدير كامل (ADMIN)</option>
              </select>
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حفظ'}
            </Button>
          </form>
        </div>
      )}

      <div className="border rounded-lg bg-card overflow-hidden">
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
                    <span className={\px-2 py-1 rounded text-xs \\}>
                      {acc.role === 'ADMIN' ? 'مدير كامل' : 'مشرف'}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingItem(acc); setIsFormOpen(true) }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => { setItemToDelete(acc); setDeleteModalOpen(true) }}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
              {accounts.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">لا توجد حسابات</td></tr>
              )}
            </tbody>
          </table>
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
