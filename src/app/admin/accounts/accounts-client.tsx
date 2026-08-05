'use client'
import React, { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { PlusCircle, Edit, Trash2, X, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { createAccount, updateAccount, deleteAccount } from '@/features/accounts/actions'
import { toast } from 'sonner'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { Checkbox } from '@/components/ui/checkbox'

const PERMISSIONS_SCHEMA = [
  { 
    id: 'products', 
    label: 'المنتجات',
    subPermissions: [
      { id: 'view', label: 'الوصول لقائمة المنتجات' },
      { id: 'add', label: 'إضافة منتج جديد' },
      { id: 'edit', label: 'تعديل بيانات المنتجات' },
      { id: 'delete', label: 'حذف المنتجات' }
    ]
  },
  { 
    id: 'orders', 
    label: 'الطلبات',
    subPermissions: [
      { id: 'view', label: 'الوصول لقائمة الطلبات' },
      { id: 'edit', label: 'تعديل حالة الطلب' },
      { id: 'delete', label: 'حذف الطلبات' }
    ]
  },
  { 
    id: 'customers', 
    label: 'العملاء',
    subPermissions: [
      { id: 'view', label: 'الوصول لقائمة العملاء' },
      { id: 'edit', label: 'تعديل بيانات العملاء' },
      { id: 'delete', label: 'حذف العملاء' }
    ]
  },
  { 
    id: 'categories', 
    label: 'الأقسام والمجالات',
    subPermissions: [
      { id: 'view', label: 'الوصول للأقسام والمجالات' },
      { id: 'add', label: 'إضافة' },
      { id: 'edit', label: 'تعديل' },
      { id: 'delete', label: 'حذف' }
    ]
  },
  { 
    id: 'settings', 
    label: 'الإعدادات',
    subPermissions: [
      { id: 'general', label: 'الإعدادات العامة' },
      { id: 'appearance', label: 'المظهر والهوية' },
      { id: 'social', label: 'التواصل الاجتماعي' },
      { id: 'branches', label: 'الفروع والمواقع' },
      { id: 'backups', label: 'النسخ الاحتياطي' }
    ]
  },
  { 
    id: 'widgets', 
    label: 'واجهة المتجر والتصميم',
    subPermissions: [
      { id: 'view', label: 'الوصول للواجهات' },
      { id: 'edit', label: 'تعديل وتخصيص الواجهات' }
    ]
  },
  { 
    id: 'shipping-payment', 
    label: 'الدفع والشحن',
    subPermissions: [
      { id: 'shipping', label: 'إعدادات الشحن' },
      { id: 'payment', label: 'طرق الدفع' }
    ]
  },
  { 
    id: 'accounts', 
    label: 'الحسابات والصلاحيات',
    subPermissions: [
      { id: 'view', label: 'الوصول للحسابات' },
      { id: 'add', label: 'إضافة حسابات' },
      { id: 'edit', label: 'تعديل الحسابات والصلاحيات' },
      { id: 'delete', label: 'حذف الحسابات' }
    ]
  },
  { 
    id: 'analytics', 
    label: 'الإحصائيات والتقارير',
    subPermissions: [
      { id: 'view', label: 'الوصول للإحصائيات' }
    ]
  },
  { 
    id: 'security', 
    label: 'سجل الأمان والأنشطة',
    subPermissions: [
      { id: 'profile', label: 'الملف الشخصي' },
      { id: 'logs', label: 'الوصول لسجل الأمان' }
    ]
  }
]

export function AccountsClient({ accounts }: { accounts: any[] }) {
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  
  // State for permissions (stores full keys like "products.view")
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  
  // Accordion open state per section
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<any>(null)

  // Compute all available permission keys
  const allPermissionKeys = useMemo(() => {
    let keys: string[] = []
    PERMISSIONS_SCHEMA.forEach(section => {
      section.subPermissions.forEach(sub => {
        keys.push(`${section.id}.${sub.id}`)
      })
    })
    return keys
  }, [])

  function resetForm() {
    setEditingItem(null)
    setSelectedPermissions([])
    setIsFormVisible(false)
    setOpenSections({})
    const form: any = document.getElementById("add-account-form")
    if (form) form.reset()
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    
    // We send empty string for role since we aren't using it anymore in UI, backend will default to MANAGER
    formData.set('role', 'MANAGER')
    formData.set('permissions', JSON.stringify(selectedPermissions))
    
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPermissions(allPermissionKeys)
    } else {
      setSelectedPermissions([])
    }
  }

  const handleSectionSelect = (sectionId: string, checked: boolean) => {
    const sectionKeys = PERMISSIONS_SCHEMA.find(s => s.id === sectionId)?.subPermissions.map(sub => `${sectionId}.${sub.id}`) || []
    
    if (checked) {
      // Add all section keys that are not already selected
      setSelectedPermissions(prev => Array.from(new Set([...prev, ...sectionKeys])))
    } else {
      // Remove all section keys
      setSelectedPermissions(prev => prev.filter(p => !sectionKeys.includes(p)))
    }
  }

  const handleSubPermissionSelect = (permissionKey: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions(prev => [...prev, permissionKey])
    } else {
      setSelectedPermissions(prev => prev.filter(p => p !== permissionKey))
    }
  }

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>الرئيسية</span>
          <span>/</span>
          <span className="text-foreground">الحسابات والصلاحيات</span>
        </nav>
        <Button onClick={() => { resetForm(); setIsFormVisible(!isFormVisible) }} className="lg:hidden gap-2">
          {isFormVisible ? <><X className="w-4 h-4" /> إلغاء</> : <><PlusCircle className="w-4 h-4" /> إضافة حساب</>}
        </Button>
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
                    <th className="p-4 font-medium">رقم الهاتف</th>
                    <th className="p-4 font-medium">الصلاحيات</th>
                    <th className="p-4 font-medium">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map(acc => {
                    const permCount = acc.permissions?.length || 0;
                    return (
                      <tr key={acc.id} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="p-4 font-medium">{acc.name || 'بدون اسم'}</td>
                        <td className="p-4" dir="ltr">{acc.phone}</td>
                        <td className="p-4">
                          {permCount === allPermissionKeys.length ? (
                            <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-700 font-medium">مدير بنظام كامل</span>
                          ) : permCount > 0 ? (
                            <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700 font-medium">{permCount} صلاحية</span>
                          ) : (
                            <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700 font-medium">بدون صلاحيات</span>
                          )}
                        </td>
                        <td className="p-4 flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => { 
                            setEditingItem(acc); 
                            setSelectedPermissions(acc.permissions || []);
                            setIsFormVisible(true) 
                          }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => { setItemToDelete(acc); setDeleteModalOpen(true) }}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                  {accounts.length === 0 && (
                    <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">لا توجد حسابات مسجلة</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sticky Form Side */}
        <div className={`w-full lg:w-[450px] shrink-0 lg:sticky lg:top-4 order-first transition-all duration-300 ${!isFormVisible ? 'hidden lg:block' : 'block'}`}>
          <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden flex flex-col max-h-[85vh]">
            <div className="border-b border-border/50 px-6 py-4 bg-muted/5 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">{editingItem ? 'تعديل صلاحيات الحساب' : 'إضافة حساب جديد'}</h2>
              </div>
              {editingItem && (
                <Button variant="ghost" size="icon" onClick={resetForm} className="h-8 w-8 shrink-0 text-muted-foreground">
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form onSubmit={handleSubmit} id="add-account-form" className="space-y-6">
                <div className="space-y-4 bg-muted/10 p-4 rounded-lg border border-border/50">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">الاسم</label>
                    <input name="name" type="text" required defaultValue={editingItem?.name || ''} className="w-full h-10 px-3 border rounded-md" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">رقم الهاتف</label>
                    <input name="phone" type="tel" required defaultValue={editingItem?.phone || ''} className="w-full h-10 px-3 border rounded-md" dir="ltr" placeholder="010..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">كلمة المرور {editingItem && <span className="text-muted-foreground text-xs">(اتركه فارغاً لعدم التغيير)</span>}</label>
                    <input name="password" type="password" required={!editingItem} className="w-full h-10 px-3 border rounded-md" dir="ltr" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-border/50">
                    <label className="text-base font-semibold">الصلاحيات المخصصة</label>
                    <div className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-md border border-primary/10">
                      <Checkbox 
                        id="select-all" 
                        checked={selectedPermissions.length === allPermissionKeys.length && allPermissionKeys.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                      <label htmlFor="select-all" className="text-sm font-medium text-primary cursor-pointer select-none">تحديد الكل</label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {PERMISSIONS_SCHEMA.map(section => {
                      const sectionKeys = section.subPermissions.map(sub => `${section.id}.${sub.id}`)
                      const selectedInSection = sectionKeys.filter(k => selectedPermissions.includes(k)).length
                      const isAllSelected = selectedInSection === sectionKeys.length
                      const isPartiallySelected = selectedInSection > 0 && !isAllSelected
                      const isOpen = openSections[section.id]

                      return (
                        <div key={section.id} className="border border-border/50 rounded-lg overflow-hidden bg-card transition-all">
                          {/* Section Header */}
                          <div className={`flex items-center justify-between p-3 cursor-pointer select-none transition-colors ${isOpen ? 'bg-muted/30' : 'hover:bg-muted/10'}`} onClick={() => toggleSection(section.id)}>
                            <div className="flex items-center gap-3">
                              <div onClick={(e) => e.stopPropagation()}>
                                <Checkbox 
                                  id={`section-${section.id}`} 
                                  checked={isAllSelected}
                                  // Workaround for indeterminate state in radix Checkbox if needed, or simply use style
                                  className={isPartiallySelected ? 'bg-primary/50 border-primary' : ''}
                                  onCheckedChange={(checked) => handleSectionSelect(section.id, checked as boolean)}
                                />
                              </div>
                              <label htmlFor={`section-${section.id}`} className="text-sm font-medium cursor-pointer" onClick={(e) => e.stopPropagation()}>{section.label}</label>
                            </div>
                            <div className="flex items-center gap-3">
                              {selectedInSection > 0 && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                                  {selectedInSection}/{sectionKeys.length}
                                </span>
                              )}
                              <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground pointer-events-none">
                                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </Button>
                            </div>
                          </div>

                          {/* Sub Permissions */}
                          {isOpen && (
                            <div className="p-3 bg-muted/5 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {section.subPermissions.map(sub => {
                                const permKey = `${section.id}.${sub.id}`
                                return (
                                  <div key={sub.id} className="flex items-center gap-2 pl-2">
                                    <Checkbox 
                                      id={`perm-${permKey}`} 
                                      checked={selectedPermissions.includes(permKey)}
                                      onCheckedChange={(checked) => handleSubPermissionSelect(permKey, checked as boolean)}
                                    />
                                    <label htmlFor={`perm-${permKey}`} className="text-sm text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors">{sub.label}</label>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t border-border/50 bg-card shrink-0">
               <Button type="submit" form="add-account-form" className="w-full h-12 text-lg" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingItem ? 'تحديث الصلاحيات والحساب' : 'إضافة الحساب')}
                </Button>
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
