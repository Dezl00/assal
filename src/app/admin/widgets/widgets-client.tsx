"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, GripVertical, Settings2, Trash2, Eye, EyeOff, LayoutTemplate, Image as ImageIcon, ShoppingBag, AlignLeft, ChevronRight, X, ImagePlus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { createWidget, deleteWidget, updateWidgetOrder, updateWidget, createWidgetContentItem, deleteWidgetContentItem, updateWidgetContentItem, updateWidgetContentItemOrder } from "@/features/widget-builder/actions"
import { ImageUploader } from "@/components/ui/image-uploader"
import { Switch } from "@/components/ui/switch"

const WIDGET_TYPES = [
  { id: "HeroSlider", name: "سلايدر الصور", icon: ImageIcon, desc: "سلايدر متحرك للصور أعلى الصفحة" },
  { id: "FeaturedProducts", name: "المنتجات المميزة", icon: ShoppingBag, desc: "عرض مجموعة من المنتجات المختارة" },
  { id: "BannerGrid", name: "شبكة البنرات", icon: LayoutTemplate, desc: "بنرات إعلانية لعروض المتجر" },
  { id: "BrandSlider", name: "سلايدر الماركات", icon: ImagePlus, desc: "شريط متحرك لانهائي لشعارات الماركات" },
  { id: "CategoryGrid", name: "شبكة الأقسام", icon: LayoutTemplate, desc: "عرض الأقسام الرئيسية كشبكة صور" },
  { id: "TextBlock", name: "نص مخصص", icon: AlignLeft, desc: "مساحة لكتابة نص ترحيبي أو معلومات" },
]

export function WidgetsClient({ initialWidgets, categories }: { initialWidgets: any[], categories: any[] }) {
  const [widgets, setWidgets] = useState(initialWidgets)
  
  const [activeTab, setActiveTab] = useState<"add" | "edit">("add")
  const [editingWidget, setEditingWidget] = useState<any | null>(null)
  const [widgetToDelete, setWidgetToDelete] = useState<string | null>(null)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null)
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [newItemImage, setNewItemImage] = useState("")

  // Drag and Drop handlers
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
    const res = await createWidget({ type, sortOrder: widgets.length, status: true, showDesktop: true, showTablet: true, showMobile: true, title: WIDGET_TYPES.find(w => w.id === type)?.name })
    setIsSubmitting(false)
    
    if (res.success) {
      const newWidget = { ...res.widget, items: [] }
      setWidgets([...widgets, newWidget])
      toast.success("تمت إضافة الواجهة بنجاح")
      setEditingWidget(newWidget)
      setActiveTab("edit")
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
      if (editingWidget?.id === widgetToDelete) {
        setEditingWidget(null)
        setActiveTab("add")
      }
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
    }
  }

  // Item Drag and Drop handlers
  function handleItemDragStart(e: React.DragEvent, id: string) {
    setDraggedItemId(id)
    e.dataTransfer.effectAllowed = "move"
  }

  function handleItemDragOver(e: React.DragEvent, id: string) {
    e.preventDefault()
    if (draggedItemId === id || !draggedItemId || !editingWidget) return

    const items = [...(editingWidget.items || [])]
    const draggedIndex = items.findIndex(i => i.id === draggedItemId)
    const hoverIndex = items.findIndex(i => i.id === id)

    const [draggedItem] = items.splice(draggedIndex, 1)
    items.splice(hoverIndex, 0, draggedItem)

    setEditingWidget({ ...editingWidget, items })
  }

  async function handleItemDrop() {
    setDraggedItemId(null)
    if (!editingWidget || !editingWidget.items) return

    const updates = editingWidget.items.map((i: any, index: number) => ({ id: i.id, sortOrder: index }))
    const res = await updateWidgetContentItemOrder(updates)
    if (!res.success) {
      toast.error("فشل في حفظ ترتيب العناصر")
    } else {
      toast.success("تم تحديث الترتيب")
      setWidgets(widgets.map(w => w.id === editingWidget.id ? editingWidget : w))
    }
  }

  async function handleAddContentItem(formData: FormData) {
    if (!editingWidget) return
    setIsSubmitting(true)
    formData.set("desktopImage", newItemImage)
    
    if (editingItemId) {
      // Update existing item
      const res = await updateWidgetContentItem(editingItemId, formData)
      setIsSubmitting(false)
      if (res.success) {
        const updatedItems = editingWidget.items.map((i: any) => i.id === editingItemId ? { ...i, ...res.item } : i)
        const updatedWidget = { ...editingWidget, items: updatedItems }
        setEditingWidget(updatedWidget)
        setWidgets(widgets.map(w => w.id === editingWidget.id ? updatedWidget : w))
        toast.success("تم حفظ التعديلات")
        cancelEditItem()
      } else {
        toast.error("فشل الحفظ")
      }
    } else {
      // Create new item
      const res = await createWidgetContentItem(editingWidget.id, formData)
      setIsSubmitting(false)
      if (res.success) {
        const updatedWidget = { ...editingWidget, items: [...(editingWidget.items || []), res.item] }
        setEditingWidget(updatedWidget)
        setWidgets(widgets.map(w => w.id === editingWidget.id ? updatedWidget : w))
        toast.success("تم إضافة العنصر")
        cancelEditItem()
      } else {
        toast.error("فشل الإضافة")
      }
    }
  }

  function startEditItem(item: any) {
    setEditingItemId(item.id)
    setNewItemImage(item.desktopImage || "")
    const form: any = document.getElementById("add-item-form")
    if (form) {
      if (form.elements["title"]) form.elements["title"].value = item.title || ""
      if (form.elements["buttonUrl"]) form.elements["buttonUrl"].value = item.buttonUrl || ""
    }
  }

  function cancelEditItem() {
    setEditingItemId(null)
    setNewItemImage("")
    const form: any = document.getElementById("add-item-form")
    if (form) form.reset()
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
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6 animate-in fade-in duration-500">
      
      {/* Sidebar (Right) */}
      <div className="w-full md:w-80 lg:w-96 shrink-0 flex flex-col border border-border/50 bg-card rounded-xl h-full overflow-hidden">
        {/* Sidebar Header Tabs */}
        <div className="flex items-center border-b border-border/50 bg-muted/20 shrink-0">
          <button 
            onClick={() => setActiveTab("add")}
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === "add" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:bg-muted/50"}`}
          >
            إضافة واجهة
          </button>
          <button 
            onClick={() => setActiveTab("edit")}
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === "edit" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:bg-muted/50"}`}
          >
            تعديل الواجهة
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
          
          {/* ADD TAB */}
          {activeTab === "add" && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground mb-4">انقر على أي واجهة لإضافتها لصفحتك الرئيسية فوراً.</p>
              {WIDGET_TYPES.map(type => (
                <button 
                  key={type.id}
                  onClick={() => handleAddWidget(type.id)}
                  disabled={isSubmitting}
                  className="w-full flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-background hover:border-primary/50 hover:bg-primary/5 transition-all text-right disabled:opacity-50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <type.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-foreground">{type.name}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{type.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* EDIT TAB */}
          {activeTab === "edit" && (
            <div>
              {!editingWidget ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 text-muted-foreground">
                  <Settings2 className="w-12 h-12 opacity-20 mb-4" />
                  <p className="text-sm">يرجى تحديد واجهة من منطقة العرض لتعديل إعداداتها.</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => setActiveTab("add")}>
                    الذهاب لإضافة واجهة
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-border/50">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      {(() => {
                        const Icon = WIDGET_TYPES.find(t => t.id === editingWidget.type)?.icon || LayoutTemplate
                        return <Icon className="h-5 w-5" />
                      })()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{editingWidget.title || editingWidget.type}</h3>
                      <p className="text-[10px] text-muted-foreground">{WIDGET_TYPES.find(t => t.id === editingWidget.type)?.name}</p>
                    </div>
                  </div>

                  <form action={saveWidgetSettings} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold">العنوان (يظهر فوق الواجهة)</label>
                      <input 
                        name="title"
                        defaultValue={editingWidget.title || ""}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    
                    <div className="space-y-3 pt-2 bg-muted/20 p-4 rounded-xl border border-border/50">
                      <h4 className="text-xs font-semibold mb-2">إعدادات العرض:</h4>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium cursor-pointer">مفعل (يظهر للزوار)</label>
                        <Switch name="status" defaultChecked={editingWidget.status} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium cursor-pointer">عرض على أجهزة الحاسوب</label>
                        <Switch name="showDesktop" defaultChecked={editingWidget.showDesktop} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium cursor-pointer">عرض على أجهزة الجوال</label>
                        <Switch name="showMobile" defaultChecked={editingWidget.showMobile} />
                      </div>
                    </div>
                    
                    <Button type="submit" disabled={isSubmitting} size="sm" className="w-full flex items-center justify-center gap-2">
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "حفظ إعدادات الواجهة"}
                    </Button>
                  </form>

                  {(editingWidget.type === "HeroSlider" || editingWidget.type === "BannerGrid" || editingWidget.type === "BrandSlider") && (
                    <div className="pt-6 border-t border-border/50 space-y-4">
                      <h4 className="font-semibold text-sm">محتوى الواجهة</h4>
                      
                      <div className="space-y-2">
                        {editingWidget.items?.map((item: any) => (
                          <div 
                            key={item.id} 
                            draggable
                            onDragStart={(e) => handleItemDragStart(e, item.id)}
                            onDragOver={(e) => handleItemDragOver(e, item.id)}
                            onDrop={handleItemDrop}
                            onDragEnd={() => setDraggedItemId(null)}
                            onClick={() => startEditItem(item)}
                            className={`flex items-center justify-between p-2 rounded-md border transition-all cursor-pointer ${
                              draggedItemId === item.id 
                                ? 'opacity-50 border-dashed border-border'
                                : editingItemId === item.id
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border/50 bg-background hover:border-primary/30'
                            } text-xs`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <div className="cursor-grab text-muted-foreground hover:text-foreground">
                                <GripVertical className="h-4 w-4" />
                              </div>
                              {item.desktopImage ? (
                                <img src={item.desktopImage} className="w-8 h-8 object-cover rounded bg-muted shrink-0" />
                              ) : (
                                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0">
                                  <ImageIcon className="w-3 h-3 text-muted-foreground" />
                                </div>
                              )}
                              <span className="truncate max-w-[120px] font-medium">{item.title || "بدون عنوان"}</span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <form action={handleAddContentItem} id="add-item-form" className={`p-4 rounded-xl border ${editingItemId ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'border-dashed border-border bg-muted/10'} space-y-4 transition-colors`}>
                        <div className="flex items-center justify-between">
                          <h5 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                            {editingItemId ? "تعديل العنصر" : "إضافة عنصر جديد"}
                          </h5>
                          {editingItemId && (
                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={cancelEditItem}>
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                        
                        <ImageUploader 
                          label="صورة العنصر" 
                          value={newItemImage} 
                          onChange={setNewItemImage} 
                        />
                        
                        <div className="space-y-2">
                          <input name="title" placeholder="العنوان النصي (اختياري)" className="h-9 w-full rounded border border-input bg-background px-2 text-xs" />
                          <input name="buttonUrl" placeholder="رابط التوجيه عند الضغط" dir="ltr" className="h-9 w-full rounded border border-input bg-background px-2 text-xs text-left" />
                        </div>
                        
                        <Button type="submit" variant={editingItemId ? "default" : "secondary"} size="sm" className="w-full text-xs h-9 flex items-center justify-center gap-2" disabled={isSubmitting || !newItemImage}>
                          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingItemId ? "تحديث الشريحة" : "إضافة الشريحة")}
                        </Button>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Preview Area (Left) */}
      <div className="flex-1 flex flex-col border border-border/50 bg-card rounded-xl h-full overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/10 shrink-0">
          <h2 className="font-semibold">ترتيب واجهات الصفحة الرئيسية</h2>
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium">العدد: {widgets.length}</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/5 scrollbar-thin">
          {widgets.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
                <LayoutTemplate className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">منطقة العرض فارغة</h3>
              <p className="text-muted-foreground text-sm mb-6">استخدم القائمة الجانبية لإضافة واجهات جديدة مثل سلايدر الصور أو شبكة المنتجات.</p>
              <Button onClick={() => setActiveTab("add")}>
                إضافة واجهة جديدة
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {widgets.map((widget) => (
                <div 
                  key={widget.id} 
                  draggable 
                  onDragStart={(e) => handleDragStart(e, widget.id)}
                  onDragOver={(e) => handleDragOver(e, widget.id)}
                  onDrop={handleDrop}
                  onDragEnd={() => setDraggedWidgetId(null)}
                  onClick={() => {
                    setEditingWidget(widget)
                    setActiveTab("edit")
                  }}
                  className={`group flex items-center justify-between p-3 md:p-4 rounded-xl border transition-all cursor-pointer ${
                    draggedWidgetId === widget.id 
                      ? 'opacity-50 bg-muted/50 border-dashed border-border' 
                      : editingWidget?.id === widget.id
                        ? 'border-primary ring-1 ring-primary/20 bg-primary/5'
                        : 'border-border/50 bg-card hover:border-primary/30 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="cursor-grab p-1.5 rounded hover:bg-muted text-muted-foreground active:cursor-grabbing transition-colors" onClick={(e) => e.stopPropagation()}>
                      <GripVertical className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                      {(() => {
                        const Icon = WIDGET_TYPES.find(t => t.id === widget.type)?.icon || LayoutTemplate
                        return <Icon className="h-5 w-5" />
                      })()}
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-sm md:text-base flex items-center gap-2">
                        {widget.title || widget.type}
                        {!widget.status && <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-medium">معطل</span>}
                      </h3>
                      <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">
                        {WIDGET_TYPES.find(t => t.id === widget.type)?.name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-2 me-4 text-muted-foreground">
                      {widget.showDesktop ? <Eye className="h-3.5 w-3.5 text-primary" /> : <EyeOff className="h-3.5 w-3.5 opacity-50" />}
                      {widget.showMobile ? <Eye className="h-3.5 w-3.5 text-primary" /> : <EyeOff className="h-3.5 w-3.5 opacity-50" />}
                    </div>

                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
                      onClick={(e) => {
                        e.stopPropagation()
                        setWidgetToDelete(widget.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <ChevronRight className="h-5 w-5 text-muted-foreground opacity-30 rtl-flip group-hover:opacity-100 group-hover:text-primary transition-all group-hover:translate-x-1" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal 
        isOpen={!!widgetToDelete}
        title="حذف الواجهة"
        description="هل أنت متأكد من حذف هذه الواجهة نهائياً من الصفحة الرئيسية؟"
        onConfirm={confirmDelete}
        onCancel={() => setWidgetToDelete(null)}
      />
    </div>
  )
}
