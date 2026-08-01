"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, GripVertical, Settings2, Trash2, Eye, EyeOff, LayoutTemplate, Image as ImageIcon, ShoppingBag, AlignLeft, X } from "lucide-react"
import { toast } from "sonner"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { createWidget, deleteWidget, updateWidgetOrder, updateWidget, createWidgetContentItem, deleteWidgetContentItem } from "@/features/widget-builder/actions"

const WIDGET_TYPES = [
  { id: "HeroSlider", name: "سلايدر الصور", icon: ImageIcon, desc: "سلايدر متحرك للصور أعلى الصفحة" },
  { id: "FeaturedProducts", name: "المنتجات المميزة", icon: ShoppingBag, desc: "عرض مجموعة من المنتجات المختارة" },
  { id: "BannerGrid", name: "شبكة البنرات", icon: LayoutTemplate, desc: "بنرات إعلانية لعروض المتجر" },
  { id: "TextBlock", name: "نص مخصص", icon: AlignLeft, desc: "مساحة لكتابة نص ترحيبي أو معلومات" },
]

export function WidgetsClient({ initialWidgets, categories }: { initialWidgets: any[], categories: any[] }) {
  const [widgets, setWidgets] = useState(initialWidgets)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  
  const [widgetToDelete, setWidgetToDelete] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Settings Modal State
  const [editingWidget, setEditingWidget] = useState<any | null>(null)

  // Drag and Drop handlers
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null)

  function handleDragStart(e: React.DragEvent, id: string) {
    setDraggedWidgetId(id)
    e.dataTransfer.effectAllowed = "move"
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault()
    if (draggedWidgetId === id || !draggedWidgetId) return

    const draggedIndex = widgets.findIndex(w => w.id === draggedWidgetId)
    const hoverIndex = widgets.findIndex(w => w.id === id)

    const newWidgets = [...widgets]
    const [draggedWidget] = newWidgets.splice(draggedIndex, 1)
    newWidgets.splice(hoverIndex, 0, draggedWidget)

    setWidgets(newWidgets)
  }

  async function handleDrop() {
    setDraggedWidgetId(null)
    // Save new order to DB
    const updates = widgets.map((w, index) => ({ id: w.id, sortOrder: index }))
    const res = await updateWidgetOrder(updates)
    if (!res.success) {
      toast.error("فشل في حفظ ترتيب الواجهات")
    } else {
      toast.success("تم تحديث ترتيب الواجهات")
    }
  }

  // Actions
  async function handleAddWidget(type: string) {
    setIsSubmitting(true)
    const res = await createWidget({ type, sortOrder: widgets.length, status: true, showDesktop: true, showMobile: true, title: WIDGET_TYPES.find(w => w.id === type)?.name })
    setIsSubmitting(false)
    
    if (res.success) {
      setWidgets([...widgets, { ...res.widget, items: [] }])
      toast.success("تمت إضافة الواجهة بنجاح")
      setIsAddModalOpen(false)
    } else {
      toast.error("حدث خطأ أثناء الإضافة")
    }
  }

  async function confirmDelete() {
    if (!widgetToDelete) return
    const res = await deleteWidget(widgetToDelete)
    if (res.success) {
      setWidgets(widgets.filter(w => w.id !== widgetToDelete))
      toast.success("تم الحذف بنجاح")
    }
    setWidgetToDelete(null)
  }

  async function saveWidgetSettings(formData: FormData) {
    if (!editingWidget) return
    setIsSubmitting(true)
    
    const data = {
      title: formData.get("title") as string,
      status: formData.get("status") === "on",
      showDesktop: formData.get("showDesktop") === "on",
      showMobile: formData.get("showMobile") === "on",
    }
    
    const res = await updateWidget(editingWidget.id, data)
    setIsSubmitting(false)
    
    if (res.success) {
      setWidgets(widgets.map(w => w.id === editingWidget.id ? { ...w, ...data } : w))
      toast.success("تم حفظ الإعدادات")
      setEditingWidget(null)
    }
  }

  async function handleAddContentItem(formData: FormData) {
    if (!editingWidget) return
    setIsSubmitting(true)
    const res = await createWidgetContentItem(editingWidget.id, formData)
    setIsSubmitting(false)
    if (res.success) {
      const updatedWidget = { ...editingWidget, items: [...(editingWidget.items || []), res.item] }
      setEditingWidget(updatedWidget)
      setWidgets(widgets.map(w => w.id === editingWidget.id ? updatedWidget : w))
      toast.success("تم إضافة العنصر")
      const form: any = document.getElementById("add-item-form")
      if (form) form.reset()
    }
  }

  async function handleDeleteItem(itemId: string) {
    const res = await deleteWidgetContentItem(itemId)
    if (res.success && editingWidget) {
      const updatedWidget = { ...editingWidget, items: editingWidget.items.filter((i: any) => i.id !== itemId) }
      setEditingWidget(updatedWidget)
      setWidgets(widgets.map(w => w.id === editingWidget.id ? updatedWidget : w))
      toast.success("تم الحذف")
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">منشئ الواجهات</h1>
          <p className="text-muted-foreground mt-1">تخصيص وترتيب أقسام الصفحة الرئيسية للمتجر بحرية تامة.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> إضافة واجهة جديدة
        </Button>
      </div>

      <div className="rounded-xl border border-border/50 bg-card shadow-sm">
        {widgets.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
              <LayoutTemplate className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">لا توجد واجهات مضافة</h3>
            <p className="text-muted-foreground text-sm max-w-md">ابدأ بإضافة سلايدر للصور أو قسم للمنتجات المميزة لتكوين الصفحة الرئيسية الخاصة بمتجرك.</p>
            <Button onClick={() => setIsAddModalOpen(true)} className="mt-6 gap-2" variant="outline">
              <Plus className="h-4 w-4" /> إضافة واجهة جديدة
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {widgets.map((widget) => (
              <div 
                key={widget.id} 
                draggable 
                onDragStart={(e) => handleDragStart(e, widget.id)}
                onDragOver={(e) => handleDragOver(e, widget.id)}
                onDrop={handleDrop}
                onDragEnd={() => setDraggedWidgetId(null)}
                className={`flex flex-col md:flex-row md:items-center justify-between p-4 transition-all ${draggedWidgetId === widget.id ? 'opacity-50 bg-muted/50' : 'hover:bg-muted/30 bg-card'}`}
              >
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                  <div className="cursor-grab p-2 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground active:cursor-grabbing transition-colors">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 text-foreground">
                      {widget.title || widget.type}
                      {!widget.status && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">معطل</span>}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">النوع: {WIDGET_TYPES.find(t => t.id === widget.type)?.name || widget.type}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 self-end md:self-auto">
                  <div className="hidden sm:flex items-center gap-1.5 me-4 bg-muted/30 px-3 py-1.5 rounded-md border border-border/50">
                    {widget.showDesktop ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                    <span className="text-xs me-2">حاسوب</span>
                    {widget.showMobile ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                    <span className="text-xs">جوال</span>
                  </div>

                  <Button variant="outline" size="sm" onClick={() => setEditingWidget(widget)} className="gap-2 text-xs h-9">
                    <Settings2 className="h-3.5 w-3.5" /> إعدادات
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => setWidgetToDelete(widget.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Widget Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200">
          <div className="bg-card border border-border shadow-lg rounded-xl max-w-2xl w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold tracking-tight">إضافة واجهة جديدة</h3>
                <p className="text-sm text-muted-foreground mt-1">اختر نوع الواجهة التي تريد إضافتها للصفحة الرئيسية.</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsAddModalOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {WIDGET_TYPES.map(type => (
                <button 
                  key={type.id}
                  onClick={() => handleAddWidget(type.id)}
                  disabled={isSubmitting}
                  className="flex items-start gap-4 p-4 rounded-xl border border-border/50 bg-background hover:border-primary/50 hover:bg-primary/5 transition-all text-right disabled:opacity-50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <type.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{type.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{type.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel Modal */}
      {editingWidget && (
        <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/60 animate-in fade-in duration-200">
          <div className="bg-card border-l border-border shadow-2xl w-full max-w-md animate-in slide-in-from-right duration-300 flex flex-col h-full">
            <div className="flex items-center justify-between p-6 border-b border-border/50 shrink-0 bg-muted/10">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">إعدادات الواجهة</h3>
                <p className="text-xs text-muted-foreground mt-1">{WIDGET_TYPES.find(t => t.id === editingWidget.type)?.name}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setEditingWidget(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-8">
              <form action={saveWidgetSettings} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">العنوان (اختياري)</label>
                  <input 
                    name="title"
                    defaultValue={editingWidget.title || ""}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                
                <div className="space-y-3 pt-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="status" defaultChecked={editingWidget.status} className="rounded border-input text-primary" />
                    مفعل (يظهر للزوار)
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="showDesktop" defaultChecked={editingWidget.showDesktop} className="rounded border-input text-primary" />
                    عرض على الحاسوب
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="showMobile" defaultChecked={editingWidget.showMobile} className="rounded border-input text-primary" />
                    عرض على الجوال
                  </label>
                </div>
                
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات"}
                </Button>
              </form>

              {/* Specific Content Manager based on type */}
              {(editingWidget.type === "HeroSlider" || editingWidget.type === "BannerGrid") && (
                <div className="pt-6 border-t border-border/50 space-y-4">
                  <h4 className="font-semibold text-sm">محتوى الواجهة (الصور والروابط)</h4>
                  
                  <div className="space-y-3">
                    {editingWidget.items?.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background text-sm">
                        <div className="flex items-center gap-3">
                          {item.desktopImage ? (
                            <img src={item.desktopImage} className="w-8 h-8 object-cover rounded bg-muted" />
                          ) : (
                            <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                              <ImageIcon className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{item.title || "بدون عنوان"}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[150px]" dir="ltr">{item.desktopImage}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteItem(item.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <form action={handleAddContentItem} id="add-item-form" className="p-4 rounded-xl border border-dashed border-border/60 bg-muted/5 space-y-3">
                    <h5 className="text-xs font-semibold text-muted-foreground">إضافة عنصر جديد</h5>
                    <input name="desktopImage" placeholder="رابط الصورة (URL)" required dir="ltr" className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs text-left" />
                    <input name="title" placeholder="العنوان النصي (اختياري)" className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs" />
                    <input name="buttonUrl" placeholder="رابط الزر (URL)" dir="ltr" className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs text-left" />
                    <Button type="submit" variant="secondary" size="sm" className="w-full text-xs" disabled={isSubmitting}>
                      إضافة العنصر
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={deleteModalOpen}
        title="حذف الواجهة"
        description="هل أنت متأكد من حذف هذه الواجهة نهائياً من الصفحة الرئيسية؟"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  )
}
