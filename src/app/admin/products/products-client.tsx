"use client"

import React, { useState, useEffect, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Search, Edit, Trash2, PlusCircle, X, Loader2, Download, Upload, CheckSquare, Square, Filter, Eye, EyeOff, Check } from "lucide-react"
import { createProduct, deleteProduct, updateProduct, toggleProductStatus, bulkDeleteProducts, bulkToggleProductsStatus, bulkUpdateProducts } from "@/features/products/actions"
import { toast } from "sonner"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { MultiImageUploader } from "@/components/ui/multi-image-uploader"
import { Switch } from "@/components/ui/switch"
import * as XLSX from "xlsx"

export function ProductsClient({ products, categories, brands = [], departments = [] }: { products: any[], categories: any[], brands?: any[], departments?: any[] }) {
  const [localProducts, setLocalProducts] = useState<any[]>(products)
  useEffect(() => { setLocalProducts(products) }, [products])

  // Form States
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  
  // Single Action States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)

  // Brand Dropdown State
  const [brandSearch, setBrandSearch] = useState("")
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false)
  const [selectedBrandId, setSelectedBrandId] = useState("")
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Department -> Category dynamic selection for the form
  const [formDepartmentId, setFormDepartmentId] = useState("")

  // Filter States
  const [searchQuery, setSearchQuery] = useState("")
  const [filterDept, setFilterDept] = useState("")
  const [filterCat, setFilterCat] = useState("")
  const [filterBrand, setFilterBrand] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showFilters, setShowFilters] = useState(false)

  // Bulk Selection States
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  
  // Bulk Edit Modal
  const [bulkEditOpen, setBulkEditOpen] = useState(false)
  const [bulkEditData, setBulkEditData] = useState<any[]>([])
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Memoized Filtered Products
  const filteredProducts = useMemo(() => {
    return localProducts.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchDept = filterDept ? p.departmentId === filterDept : true
      const matchCat = filterCat ? p.categoryId === filterCat : true
      const matchBrand = filterBrand ? p.brandId === filterBrand : true
      const matchStatus = filterStatus === "all" ? true : filterStatus === "active" ? p.isActive : !p.isActive
      return matchSearch && matchDept && matchCat && matchBrand && matchStatus
    })
  }, [localProducts, searchQuery, filterDept, filterCat, filterBrand, filterStatus])

  // Form Effects
  useEffect(() => {
    if (editingProduct) {
      const form: any = document.getElementById("add-product-form")
      if (form) {
        form.name.value = editingProduct.name || ""
        form.slug.value = editingProduct.slug || ""
        form.sku.value = editingProduct.sku || ""
        form.price.value = editingProduct.price || ""
        form.discountPrice.value = editingProduct.discountPrice || ""
        form.stock.value = editingProduct.stock || 0
        form.description.value = editingProduct.description || ""
      }
      setFormDepartmentId(editingProduct.departmentId || "")
      setTimeout(() => {
        if (form && form.categoryId) {
          form.categoryId.value = editingProduct.categoryId || ""
        }
      }, 50)
      
      setSelectedBrandId(editingProduct.brandId || "")
      setBrandSearch(brands.find((b: any) => b.id === editingProduct.brandId)?.name || "")
      setImageUrls(editingProduct.images?.length > 0 ? editingProduct.images.map((img: any) => img.url) : [])
      setIsFormVisible(true)
    }
  }, [editingProduct, brands])

  function resetForm() {
    setEditingProduct(null)
    setImageUrls([])
    setSelectedBrandId("")
    setBrandSearch("")
    setFormDepartmentId("")
    const form: any = document.getElementById("add-product-form")
    if (form) form.reset()
  }

  // Single Handlers
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    formData.set("brandId", selectedBrandId)
    formData.set("departmentId", formDepartmentId)
    
    let res;
    if (editingProduct) {
      res = await updateProduct(editingProduct.id, formData)
    } else {
      res = await createProduct(formData)
    }
    setIsSubmitting(false)
    if (res.success) {
      toast.success(editingProduct ? "تم تعديل المنتج بنجاح" : "تمت إضافة المنتج بنجاح")
      resetForm()
    } else {
      toast.error(res.error || "حدث خطأ ما")
    }
  }

  async function confirmDelete() {
    if (!productToDelete) return
    const res = await deleteProduct(productToDelete)
    if (res.success) {
      toast.success("تم الحذف بنجاح")
      setLocalProducts(prev => prev.filter(p => p.id !== productToDelete))
    } else {
      toast.error(res.error || "حدث خطأ أثناء الحذف")
    }
    setDeleteModalOpen(false)
    setProductToDelete(null)
  }

  async function toggleStatus(id: string, currentStatus: boolean) {
    const res = await toggleProductStatus(id, !currentStatus)
    if (res.success) {
      setLocalProducts(prev => prev.map(p => p.id === id ? { ...p, isActive: !currentStatus } : p))
      toast.success(currentStatus ? "تم إخفاء المنتج" : "تم تفعيل المنتج")
    } else {
      toast.error("حدث خطأ أثناء التحديث")
    }
  }

  // Bulk Handlers
  function handleSelectAll() {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredProducts.map(p => p.id))
    }
  }

  function handleSelect(id: string) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  async function handleBulkDelete() {
    if (!confirm(`هل أنت متأكد من حذف ${selectedIds.length} منتج؟`)) return
    const res = await bulkDeleteProducts(selectedIds)
    if (res.success) {
      toast.success(`تم حذف ${selectedIds.length} منتج بنجاح`)
      setLocalProducts(prev => prev.filter(p => !selectedIds.includes(p.id)))
      setSelectedIds([])
    } else {
      toast.error("فشل في الحذف الجماعي")
    }
  }

  async function handleBulkToggleStatus(isActive: boolean) {
    const res = await bulkToggleProductsStatus(selectedIds, isActive)
    if (res.success) {
      toast.success(`تم ${isActive ? 'تفعيل' : 'إخفاء'} المنتجات المحددة`)
      setLocalProducts(prev => prev.map(p => selectedIds.includes(p.id) ? { ...p, isActive } : p))
      setSelectedIds([])
    } else {
      toast.error("فشل التحديث الجماعي")
    }
  }

  function openBulkEdit() {
    const toEdit = localProducts.filter(p => selectedIds.includes(p.id)).map(p => ({ ...p }))
    setBulkEditData(toEdit)
    setBulkEditOpen(true)
  }

  async function saveBulkEdit() {
    setIsBulkSubmitting(true)
    const res = await bulkUpdateProducts(bulkEditData)
    if (res.success) {
      toast.success("تم الحفظ الجماعي بنجاح")
      setLocalProducts(prev => prev.map(p => {
        const updated = bulkEditData.find(b => b.id === p.id)
        return updated ? { ...p, ...updated } : p
      }))
      setBulkEditOpen(false)
      setSelectedIds([])
    } else {
      toast.error("حدث خطأ أثناء الحفظ")
    }
    setIsBulkSubmitting(false)
  }

  // Excel Handlers
  function handleExportExcel() {
    const dataToExport = filteredProducts.map(p => ({
      "الاسم": p.name,
      "الرابط (Slug)": p.slug,
      "الرمز (SKU)": p.sku,
      "السعر": p.price,
      "سعر التخفيض": p.discountPrice || "",
      "المخزون": p.stock,
      "القسم (ID)": p.categoryId,
      "المجال (ID)": p.departmentId || "",
      "الماركة (ID)": p.brandId || "",
      "الوصف": p.description || "",
      "مفعل؟": p.isActive ? "نعم" : "لا"
    }))

    const ws = XLSX.utils.json_to_sheet(dataToExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "المنتجات")
    XLSX.writeFile(wb, "Assal_Products.xlsx")
  }

  const [importConflicts, setImportConflicts] = useState<{parsed: any[], duplicates: any[], ready: any[]} | null>(null)

  function handleImportExcel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: "binary" })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data = XLSX.utils.sheet_to_json(ws)
        
        if (data.length > 0) {
          const parsedData = data.map((row: any) => ({
            name: row["اسم المنتج"] || "",
            price: row["السعر"] ? parseFloat(row["السعر"]) : 0,
            costPrice: row["سعر التكلفة"] ? parseFloat(row["سعر التكلفة"]) : undefined,
            stock: row["المخزون"] ? parseInt(row["المخزون"]) : 0,
            categoryId: categories.find(c => c.name === row["التصنيف"])?.id || null, // Map category name to ID if found
            description: row["الوصف"] || "",
            isActive: row["مفعل؟"] === "نعم"
          })).filter(p => p.name.trim() !== "");

          const duplicates: any[] = [];
          const ready: any[] = [];

          parsedData.forEach(item => {
            const existing = localProducts.find(p => p.name.toLowerCase() === item.name.toLowerCase());
            if (existing) {
              duplicates.push({ ...item, existingId: existing.id });
            } else {
              ready.push(item);
            }
          });

          if (duplicates.length > 0) {
            setImportConflicts({ parsed: parsedData, duplicates, ready });
          } else if (ready.length > 0) {
            await submitImport(ready, []);
          } else {
            toast.info("لا توجد منتجات جديدة لاستيرادها.");
          }
        }
      } catch (err) {
        toast.error("ملف Excel غير صالح")
      }
    }
    reader.readAsBinaryString(file)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function submitImport(newItems: any[], updateItems: any[]) {
    const toastId = toast.loading("جاري استيراد المنتجات...");
    try {
      // Create new
      let createdCount = 0;
      let updatedCount = 0;
      
      for (const item of newItems) {
        const formData = new FormData();
        formData.append("name", item.name);
        formData.append("price", item.price.toString());
        if (item.costPrice) formData.append("costPrice", item.costPrice.toString());
        formData.append("stock", item.stock.toString());
        if (item.categoryId) formData.append("categoryId", item.categoryId);
        formData.append("description", item.description);
        formData.append("isActive", item.isActive.toString());
        const res = await createProduct(formData);
        if (res.success) createdCount++;
      }

      // Update existing (bulk update)
      if (updateItems.length > 0) {
        const res = await bulkUpdateProducts(updateItems.map(item => ({
          id: item.existingId,
          name: item.name,
          price: item.price,
          stock: item.stock,
          isActive: item.isActive
        })));
        if (res.success) updatedCount = updateItems.length;
      }

      toast.success(`تم بنجاح! إضافة ${createdCount} وتحديث ${updatedCount} منتج.`, { id: toastId });
      setTimeout(() => window.location.reload(), 1500);
      setImportConflicts(null);
    } catch (error) {
      toast.error("حدث خطأ أثناء الاستيراد", { id: toastId });
    }
  }

  const filteredBrands = brands.filter(b => b.name.toLowerCase().includes(brandSearch.toLowerCase()))

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">المنتجات</h1>
          <p className="text-muted-foreground mt-1">إدارة منتجات المتجر والمخزون</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button onClick={() => {
            setBulkEditData(filteredProducts.map(p => ({ ...p })))
            setBulkEditOpen(true)
          }} variant="outline" className="flex-1 sm:flex-none gap-2">
            <Edit className="w-4 h-4" /> تعديل سريع
          </Button>
          <Button onClick={() => setIsFormVisible(!isFormVisible)} className="flex-1 sm:flex-none gap-2">
            {isFormVisible ? <><X className="w-4 h-4" /> إلغاء</> : <><PlusCircle className="w-4 h-4" /> إضافة منتج</>}
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 mb-4">
        <div className="flex items-center gap-3">
           <Button variant="outline" className="gap-2" onClick={handleExportExcel}>
             <Download className="h-4 w-4" /> <span className="hidden sm:inline">تصدير</span>
           </Button>
           <Button variant="outline" className="gap-2" onClick={() => fileInputRef.current?.click()}>
             <Upload className="h-4 w-4" /> <span className="hidden sm:inline">استيراد</span>
           </Button>
           <input type="file" accept=".xlsx, .xls, .csv" className="hidden" ref={fileInputRef} onChange={handleImportExcel} />
           
           <Button onClick={() => setIsFormVisible(!isFormVisible)} className="gap-2 lg:hidden">
             <PlusCircle className="h-4 w-4" />
             {isFormVisible ? "إخفاء النموذج" : "إضافة منتج"}
           </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-card border border-border/50 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="ابحث عن منتج بالاسم أو الرمز..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-transparent pr-10 pl-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
            <Filter className="h-4 w-4" /> الفلاتر {showFilters ? '▲' : '▼'}
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border/50 animate-in slide-in-from-top-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">المجال</label>
              <select value={filterDept} onChange={e => { setFilterDept(e.target.value); setFilterCat(""); }} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="">الكل</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">القسم</label>
              <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="">الكل</option>
                {categories.filter(c => filterDept ? c.departmentId === filterDept : true).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">الماركة</label>
              <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="">الكل</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">الحالة</label>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="all">الكل</option>
                <option value="active">مفعل</option>
                <option value="inactive">مخفي</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex flex-wrap items-center justify-between gap-4 animate-in fade-in">
          <div className="text-sm font-medium text-primary">تم تحديد {selectedIds.length} منتج</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={openBulkEdit} className="h-8 gap-1.5 bg-background">
              <Edit className="h-3.5 w-3.5" /> تعديل جماعي
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleBulkToggleStatus(true)} className="h-8 gap-1.5 bg-background">
              <Eye className="h-3.5 w-3.5 text-green-600" /> تفعيل
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleBulkToggleStatus(false)} className="h-8 gap-1.5 bg-background">
              <EyeOff className="h-3.5 w-3.5 text-yellow-600" /> إخفاء
            </Button>
            <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="h-8 gap-1.5">
              <Trash2 className="h-3.5 w-3.5" /> حذف
            </Button>
          </div>
        </div>
      )}

      {/* Split Screen Layout */}
      <div className="flex flex-col lg:flex-row items-start gap-8 relative">
        
        {/* Main Table Column */}
        <div className="flex-1 w-full min-w-0">
          <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-muted/30 border-b border-border/50 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 w-10 text-center">
                      <button onClick={handleSelectAll} className="p-1 hover:text-foreground">
                        {selectedIds.length === filteredProducts.length && filteredProducts.length > 0 ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                      </button>
                    </th>
                    <th className="px-4 py-3 font-medium">المنتج</th>
                    <th className="px-4 py-3 font-medium">القسم</th>
                    <th className="px-4 py-3 font-medium">السعر</th>
                    <th className="px-4 py-3 font-medium text-center">الحالة</th>
                    <th className="px-4 py-3 font-medium text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                        لا توجد منتجات مسجلة مطابقة للبحث.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className={`transition-colors hover:bg-muted/10 ${selectedIds.includes(product.id) ? 'bg-primary/5' : ''}`}>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => handleSelect(product.id)} className="p-1 text-muted-foreground hover:text-foreground">
                            {selectedIds.includes(product.id) ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />}
                          </button>
                        </td>
                        <td className="px-4 py-3 w-64 max-w-xs">
                          <div className="flex items-center gap-3">
                            {product.images && product.images.length > 0 ? (
                               <img src={product.images[0].url} alt={product.name} className="w-10 h-10 object-cover rounded-md border border-border/50 shrink-0" />
                            ) : (
                               <div className="w-10 h-10 rounded-md bg-muted/20 flex items-center justify-center border border-border/50 shrink-0">
                                 <span className="text-muted-foreground text-[10px]">لا صورة</span>
                               </div>
                            )}
                            <div>
                              <div className="font-medium text-foreground line-clamp-1">{product.name}</div>
                              <div className="text-xs text-muted-foreground mt-0.5" dir="ltr">{product.sku}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-full bg-secondary/50 px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                            {categories.find(c => c.id === product.categoryId)?.name || "بدون قسم"}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {product.discountPrice ? (
                            <div className="flex flex-col">
                              <span className="text-red-500">{product.discountPrice} ج.م</span>
                              <span className="text-[10px] text-muted-foreground line-through">{product.price} ج.م</span>
                            </div>
                          ) : (
                            <span>{product.price} ج.م</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                           <Switch 
                             checked={product.isActive} 
                             onCheckedChange={() => toggleStatus(product.id, product.isActive)}
                             title="تفعيل / إخفاء المنتج"
                           />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => setEditingProduct(product)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => { setProductToDelete(product.id); setDeleteModalOpen(true); }}>
                              <Trash2 className="h-4 w-4" />
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
        </div>

        {/* Sticky Form Column (Right in RTL) */}
        <div className={`w-full lg:w-[420px] shrink-0 lg:sticky lg:top-4 order-first transition-all duration-300 ${!isFormVisible ? 'hidden lg:block' : 'block'}`}>
          <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-2rem)]">
            <div className="border-b border-border/50 px-6 py-4 bg-muted/5 shrink-0 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">{editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}</h2>
                <p className="text-xs text-muted-foreground mt-1">{editingProduct ? "تعديل بيانات المنتج المحدد" : "إضافة منتج سريعاً للمتجر."}</p>
              </div>
              {editingProduct && (
                <Button variant="ghost" size="icon" onClick={resetForm} className="h-8 w-8 shrink-0 text-muted-foreground">
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-6" id="add-product-form">
                <div className="space-y-4">
                  
                  {/* Image Upload Area */}
                  <div className="space-y-2">
                    <MultiImageUploader value={imageUrls} onChange={setImageUrls} />
                    <input type="hidden" name="images" value={JSON.stringify(imageUrls)} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">اسم المنتج <span className="text-red-500">*</span></label>
                    <input name="name" type="text" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">المجال <span className="text-muted-foreground text-xs font-normal">(اختياري)</span></label>
                    <select 
                      value={formDepartmentId}
                      onChange={(e) => setFormDepartmentId(e.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring appearance-none"
                    >
                      <option value="">بدون مجال (يتبع القسم مباشرة)</option>
                      {departments?.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">القسم <span className="text-red-500">*</span></label>
                    <select name="categoryId" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring appearance-none">
                      <option value="">اختيار القسم الفرعي...</option>
                      {categories.filter(c => !c.parentId && (!formDepartmentId || c.departmentId === formDepartmentId)).map(mainCat => (
                        <optgroup key={mainCat.id} label={mainCat.name}>
                          {categories.filter(c => c.parentId === mainCat.id).map(subCat => (
                            <option key={subCat.id} value={subCat.id}>{subCat.name}</option>
                          ))}
                        </optgroup>
                      ))}
                      {/* For categories without parents */}
                      {categories.filter(c => !c.parentId && (!formDepartmentId || c.departmentId === formDepartmentId)).map(c => (
                         <option key={c.id + "_alone"} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 relative">
                    <label className="text-sm font-medium">الماركة <span className="text-muted-foreground text-xs font-normal">(اختياري)</span></label>
                    <div className="relative">
                      <input
                        type="text"
                        value={brandSearch}
                        onChange={(e) => {
                          setBrandSearch(e.target.value)
                          setIsBrandDropdownOpen(true)
                          if (e.target.value === "") setSelectedBrandId("")
                        }}
                        onFocus={() => setIsBrandDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setIsBrandDropdownOpen(false), 200)}
                        placeholder="ابحث عن ماركة..."
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                      {isBrandDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-card border border-border/50 rounded-md shadow-lg z-50">
                          <div className="px-3 py-2 text-sm cursor-pointer hover:bg-muted/50" onClick={() => { setSelectedBrandId(""); setBrandSearch(""); setIsBrandDropdownOpen(false); }}>
                            بدون ماركة
                          </div>
                          {filteredBrands.map((brand: any) => (
                            <div key={brand.id} className="px-3 py-2 text-sm cursor-pointer hover:bg-muted/50" onClick={() => { setSelectedBrandId(brand.id); setBrandSearch(brand.name); setIsBrandDropdownOpen(false); }}>
                              {brand.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">السعر (ج.م) <span className="text-red-500">*</span></label>
                      <input name="price" type="number" step="0.01" required dir="ltr" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-left" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">التخفيض</label>
                      <input name="discountPrice" type="number" step="0.01" dir="ltr" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-left" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">المخزون</label>
                    <input name="stock" type="number" defaultValue={0} dir="ltr" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-left" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">الوصف</label>
                    <textarea name="description" rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
                  </div>

                  {/* Advanced Settings */}
                  <div className="pt-2 border-t border-border/50">
                    <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <span className="font-medium">إعدادات إضافية</span>
                      <svg className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    <div className={`grid grid-cols-2 gap-3 mt-4 animate-in fade-in slide-in-from-top-2 ${!showAdvanced ? 'hidden' : ''}`}>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">الرابط (Slug)</label>
                        <input name="slug" type="text" dir="ltr" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-left" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">الرمز (SKU)</label>
                        <input name="sku" type="text" dir="ltr" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-left" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <Button type="submit" disabled={isSubmitting} className="w-full h-11 text-base shadow-sm flex items-center justify-center gap-2">
                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (editingProduct ? "تحديث المنتج" : "حفظ المنتج")}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal 
        isOpen={deleteModalOpen}
        title="حذف المنتج"
        description="هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />

      {/* Import Conflicts Modal */}
      {importConflicts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-background rounded-xl border border-border/50 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border/50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-red-600">تنبيه: منتجات مكررة!</h2>
              <Button variant="ghost" size="icon" onClick={() => setImportConflicts(null)}><X className="w-5 h-5" /></Button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <p className="mb-4 text-muted-foreground">
                تم العثور على <strong className="text-foreground">{importConflicts.duplicates.length}</strong> منتجات مكررة بالاسم. يمكنك تحديث بياناتها أو تخطيها.
              </p>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2 border rounded-md p-2">
                {importConflicts.duplicates.map((dup, i) => (
                  <div key={i} className="flex justify-between items-center text-sm p-2 bg-muted/30 rounded">
                    <span className="font-medium truncate max-w-[200px]">{dup.name}</span>
                    <span className="text-muted-foreground text-xs">موجود مسبقاً</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 border-t border-border/50 flex items-center gap-3 bg-muted/10">
              <Button 
                onClick={() => submitImport(importConflicts.ready, importConflicts.duplicates)} 
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
              >
                تحديث المكرر وإضافة الجديد ({importConflicts.ready.length + importConflicts.duplicates.length})
              </Button>
              <Button 
                onClick={() => submitImport(importConflicts.ready, [])} 
                variant="outline" 
                className="flex-1"
              >
                تخطي المكرر ({importConflicts.ready.length} فقط)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Edit Modal */}
      {bulkEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-5xl rounded-xl shadow-lg border border-border/50 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <h2 className="text-lg font-semibold">تعديل جماعي سريع ({bulkEditData.length} منتجات)</h2>
              <Button variant="ghost" size="icon" onClick={() => setBulkEditOpen(false)}><X className="h-5 w-5" /></Button>
            </div>
            
            <div className="p-4 overflow-auto flex-1 bg-muted/10">
              <div className="min-w-[800px]">
                <table className="w-full text-sm text-right">
                  <thead className="bg-muted/50 border-b border-border/50 text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 font-medium w-[25%]">اسم المنتج</th>
                      <th className="px-3 py-2 font-medium w-[15%]">السعر (ج.م)</th>
                      <th className="px-3 py-2 font-medium w-[15%]">المخزون</th>
                      <th className="px-3 py-2 font-medium w-[20%]">القسم</th>
                      <th className="px-3 py-2 font-medium w-[15%]">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {bulkEditData.map((item, index) => (
                      <tr key={item.id} className="bg-background">
                        <td className="px-3 py-2">
                          <input 
                            value={item.name} 
                            onChange={e => {
                              const newData = [...bulkEditData]
                              newData[index].name = e.target.value
                              setBulkEditData(newData)
                            }}
                            className="w-full h-8 px-2 border border-input rounded text-sm focus:ring-1 focus:ring-primary"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input 
                            type="number" step="0.01" dir="ltr"
                            value={item.price} 
                            onChange={e => {
                              const newData = [...bulkEditData]
                              newData[index].price = parseFloat(e.target.value) || 0
                              setBulkEditData(newData)
                            }}
                            className="w-full h-8 px-2 border border-input rounded text-sm focus:ring-1 focus:ring-primary text-left"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input 
                            type="number" dir="ltr"
                            value={item.stock} 
                            onChange={e => {
                              const newData = [...bulkEditData]
                              newData[index].stock = parseInt(e.target.value) || 0
                              setBulkEditData(newData)
                            }}
                            className="w-full h-8 px-2 border border-input rounded text-sm focus:ring-1 focus:ring-primary text-left"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <select 
                            value={item.categoryId}
                            onChange={e => {
                              const newData = [...bulkEditData]
                              newData[index].categoryId = e.target.value
                              setBulkEditData(newData)
                            }}
                            className="w-full h-8 px-2 border border-input rounded text-sm focus:ring-1 focus:ring-primary"
                          >
                            <option value="">اختر القسم...</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <Switch 
                            checked={item.isActive} 
                            onCheckedChange={val => {
                              const newData = [...bulkEditData]
                              newData[index].isActive = val
                              setBulkEditData(newData)
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="p-4 border-t border-border/50 flex justify-end gap-3 bg-background">
              <Button variant="outline" onClick={() => setBulkEditOpen(false)}>إلغاء</Button>
              <Button onClick={saveBulkEdit} disabled={isBulkSubmitting} className="min-w-[120px] gap-2">
                {isBulkSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4" /> حفظ التعديلات</>}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
