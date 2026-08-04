"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Search, Edit, Trash2, Folder, PlusCircle, X, Loader2 } from "lucide-react"
import { createDepartment, deleteDepartment, updateDepartment } from "@/features/departments/actions"
import { toast } from "sonner"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { ImageUploader } from "@/components/ui/image-uploader"

export function DepartmentsClient({ departments }: { departments: any[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFormVisible, setIsFormVisible] = useState(false)
  
  const [editingDepartment, setEditingDepartment] = useState<any | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [departmentToDelete, setDepartmentToDelete] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState("")

  const [searchQuery, setSearchQuery] = useState("")

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
    } else {
      toast.error(res.error || "حدث خطأ أثناء الحذف")
    }
    setDeleteModalOpen(false)
    setDepartmentToDelete(null)
  }

  const filteredDepartments = departments.filter(d => d.name.includes(searchQuery) || d.slug.includes(searchQuery))

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">إدارة المجالات</h1>
          <p className="text-muted-foreground mt-1">أضف مجالات وتصنيفات المتجر الكبرى (مثل الملابس، العطور، الخ)</p>
        </div>
        <Button onClick={handleAddDepartmentClick} className="gap-2">
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
      </div>

      {isFormVisible && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">{editingDepartment ? "تعديل المجال" : "إضافة مجال جديد"}</h2>
            {editingDepartment && (
              <Button variant="ghost" size="sm" onClick={() => { resetForm(); setIsFormVisible(false) }}>
                <X className="w-4 h-4 ml-2" />
                إلغاء التعديل
              </Button>
            )}
          </div>
          
          <form id="add-department-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">اسم المجال <span className="text-destructive">*</span></label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  placeholder="مثال: الملابس والإكسسوارات"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">الرابط (Slug) <span className="text-destructive">*</span></label>
                <input 
                  type="text" 
                  name="slug" 
                  required 
                  placeholder="مثال: clothing"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ltr text-left"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">الوصف (اختياري)</label>
              <textarea 
                name="description" 
                rows={3}
                placeholder="وصف قصير للمجال..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">صورة المجال (اختياري)</label>
              <ImageUploader 
                value={imageUrl} 
                onChange={setImageUrl} 
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                {editingDepartment ? "حفظ التعديلات" : "إضافة المجال"}
              </Button>
            </div>
          </form>
        </div>
      )}

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
                <th className="px-6 py-4 font-medium text-muted-foreground text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredDepartments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Folder className="w-8 h-8 opacity-20" />
                      <p>لا يوجد مجالات {searchQuery ? "مطابقة للبحث" : "حتى الآن"}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDepartments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {dept.imageUrl ? (
                          <div className="w-10 h-10 rounded-md bg-muted overflow-hidden shrink-0 border border-border">
                            <img src={dept.imageUrl} alt={dept.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center shrink-0 border border-border">
                            <Folder className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-foreground">{dept.name}</div>
                          {dept.description && <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5 max-w-xs">{dept.description}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground" dir="ltr">
                      <span className="bg-muted/50 px-2 py-1 rounded text-xs">/{dept.slug}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center bg-primary/10 text-primary w-6 h-6 rounded-full text-xs font-bold">
                        {dept._count?.categories || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center bg-muted text-foreground w-6 h-6 rounded-full text-xs font-medium">
                        {dept._count?.products || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => { setEditingDepartment(dept); window.scrollTo({top: 0, behavior: 'smooth'}) }}>
                          <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { setDepartmentToDelete(dept.id); setDeleteModalOpen(true) }}>
                          <Trash2 className="w-4 h-4 text-destructive/70 hover:text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
