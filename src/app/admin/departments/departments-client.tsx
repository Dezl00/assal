"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Search, Edit, Trash2, Folder, PlusCircle, X, Loader2 } from "lucide-react"
import { createDepartment, deleteDepartment, updateDepartment } from "@/features/departments/actions"
import { toast } from "sonner"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { ImageUploader } from "@/components/ui/image-uploader"
import { usePermissions } from "@/hooks/use-permissions"

export function DepartmentsClient({ departments }: { departments: any[] }) {
  const { hasPermission } = usePermissions()
  const canAdd = hasPermission("categories.add")
  const canEdit = hasPermission("categories.edit")
  const canDelete = hasPermission("categories.delete")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFormVisible, setIsFormVisible] = useState(false)
  
  const [editingDepartment, setEditingDepartment] = useState<any | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [departmentToDelete, setDepartmentToDelete] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState("")

  const [searchQuery, setSearchQuery] = useState("")
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  // Local state for optimistic updates
  const [localDepartments, setLocalDepartments] = useState(departments)

  useEffect(() => {
    if (editingDepartment) {
      const form: any = document.getElementById("add-department-form")
      if (form) {
        form.name.value = editingDepartment.name || ""
        form.slug.value = editingDepartment.slug || ""
        form.description.value = editingDepartment.description || ""
        setImageUrl(editingDepartment.imageUrl || "")
      }
      setIsFormVisible(true)
    }
  }, [editingDepartment])

  function resetForm() {
    setEditingDepartment(null)
    setImageUrl("")
    setShowAdvanced(false)
    const form: any = document.getElementById("add-department-form")
    if (form) {
      form.reset()
    }
  }

  function handleAddDepartmentClick() {
    if (isFormVisible && !editingDepartment) {
      setIsFormVisible(false)
    } else {
      resetForm()
      setIsFormVisible(true)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    formData.set("imageUrl", imageUrl)
    let res;
    if (editingDepartment) {
      res = await updateDepartment(editingDepartment.id, formData)
    } else {
      res = await createDepartment(formData)
    }
    setIsSubmitting(false)
    
    if (res.success) {
      toast.success(editingDepartment ? "تم تعديل المجال بنجاح" : "تم إنشاء المجال بنجاح")
      resetForm()
      setIsFormVisible(false)
    } else {
      toast.error(res.error || "حدث خطأ ما")
    }
  }

  async function confirmDelete() {
    if (!departmentToDelete) return
    const res = await deleteDepartment(departmentToDelete)
    if (res.success) {
      toast.success("تم الحذف بنجاح")
      setLocalDepartments(prev => prev.filter(d => d.id !== departmentToDelete))
    } else {
      toast.error(res.error || "حدث خطأ أثناء الحذف")
    }
    setDeleteModalOpen(false)
    setDepartmentToDelete(null)
  }

  async function toggleStatus(dept: any) {
    if (!canEdit) return
    const newStatus = !dept.isActive
    // Optimistic update
    setLocalDepartments(prev => prev.map(d => d.id === dept.id ? { ...d, isActive: newStatus } : d))
    
    const formData = new FormData()
    formData.append("isActive", newStatus.toString())
    const res = await updateDepartment(dept.id, formData)
    
    if (!res.success) {
      toast.error("حدث خطأ أثناء التحديث")
      // Revert
      setLocalDepartments(prev => prev.map(d => d.id === dept.id ? { ...d, isActive: !newStatus } : d))
    }
  }

  const filteredDepartments = localDepartments.filter(d => d.name.includes(searchQuery) || d.slug.includes(searchQuery))

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>الرئيسية</span>
          <span>/</span>
          <span className="text-foreground">إدارة المجالات</span>
        </nav>
        {/* On mobile we show the Add button, on desktop the form is always visible on the side */}
        {canAdd && (
          <Button onClick={handleAddDepartmentClick} className="gap-2 lg:hidden">
            {isFormVisible && !editingDepartment ? (
              <>
                <X className="w-4 h-4" />
                إلغاء
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                مجال جديد
              </>
            )}
          </Button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row items-start gap-8 relative">
        
        {/* RIGHT/MAIN PANE: Search and List */}
        <div className="flex-1 w-full min-w-0 flex flex-col gap-6">
          {/* SEARCH AND FILTER */}
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="relative max-w-md">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="البحث في المجالات..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background pr-10 pl-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          {/* DEPARTMENTS LIST */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-medium text-muted-foreground">المجال</th>
                    <th className="px-6 py-4 font-medium text-muted-foreground">الرابط</th>
                    <th className="px-6 py-4 font-medium text-muted-foreground text-center">الأقسام الرئيسية</th>
                    <th className="px-6 py-4 font-medium text-muted-foreground text-center">المنتجات</th>
                    <th className="px-6 py-4 font-medium text-muted-foreground text-center">الحالة</th>
                    <th className="px-6 py-4 font-medium text-muted-foreground text-left">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredDepartments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Folder className="w-8 h-8 opacity-20" />
                          <p>لا توجد مجالات مضافة بعد</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredDepartments.map((dept) => (
                      <tr key={dept.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 shrink-0 rounded-md border border-border bg-muted overflow-hidden flex items-center justify-center">
                              {dept.imageUrl ? (
                                <img src={dept.imageUrl} alt={dept.name} className="h-full w-full object-cover" />
                              ) : (
                                <Folder className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-foreground">{dept.name}</div>
                              {dept.description && (
                                <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{dept.description}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          <span className="bg-muted px-2 py-1 rounded text-xs" dir="ltr">{dept.slug}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-medium">{dept._count?.categories || 0}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-medium">{dept._count?.products || 0}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => toggleStatus(dept)}
                            disabled={!canEdit}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${dept.isActive ? 'bg-primary' : 'bg-muted'}`}
                          >
                            <span aria-hidden="true" className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${dept.isActive ? '-translate-x-4' : 'translate-x-0'}`} />
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            {canEdit && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                onClick={() => {
                                  setEditingDepartment(dept)
                                  if (window.innerWidth < 1024) {
                                    document.getElementById('add-department-form-container')?.scrollIntoView({ behavior: 'smooth' })
                                  }
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                            {canDelete && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => {
                                  setDepartmentToDelete(dept.id)
                                  setDeleteModalOpen(true)
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* LEFT PANE: Add/Edit Form */}
        {(canAdd || editingDepartment) && (
          <div id="add-department-form-container" className={`w-full lg:w-[400px] shrink-0 lg:sticky lg:top-4 order-first transition-all duration-300 ${!isFormVisible && !editingDepartment ? 'hidden lg:block' : 'block'}`}>
            <div className="rounded-xl border border-border/50 bg-background shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                  {editingDepartment ? <Edit className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                </div>
                <h2 className="font-semibold">{editingDepartment ? "تعديل المجال" : "إضافة مجال جديد"}</h2>
              </div>
              {editingDepartment && (
                <Button variant="ghost" size="icon" onClick={resetForm} className="h-8 w-8 shrink-0 text-muted-foreground">
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            <div className="p-6">
              <form id="add-department-form" onSubmit={handleSubmit} className="space-y-6">
                
                <div className="flex justify-center mb-4">
                  <div className="w-32">
                    <ImageUploader 
                      label="صورة المجال" 
                      value={imageUrl} 
                      onChange={setImageUrl} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">اسم المجال <span className="text-destructive">*</span></label>
                  <input 
                    type="text" 
                    name="name" 
                    required 
                    placeholder="مثال: الملابس والإكسسوارات"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowAdvanced(!showAdvanced)}>
                    <span className="text-sm font-medium text-muted-foreground">إعدادات متقدمة</span>
                    <svg className={`w-4 h-4 text-muted-foreground transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  
                  <div className={showAdvanced ? "pt-2" : "hidden"}>
                    <label className="text-sm font-medium">الرابط (Slug)</label>
                    <input 
                      type="text" 
                      name="slug" 
                      placeholder="يترك فارغاً للتوليد التلقائي"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                      dir="ltr"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full h-10 flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingDepartment ? "تحديث المجال" : "حفظ المجال")}
                </Button>
              </form>
            </div>
          </div>
        </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={deleteModalOpen}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="حذف المجال"
        description="هل أنت متأكد من حذف هذا المجال؟ لا يمكن التراجع عن هذا الإجراء."
        isDestructive={true}
      />
    </div>
  )
}
