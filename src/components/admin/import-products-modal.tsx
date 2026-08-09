"use client"

import React, { useState, useRef, useMemo, useEffect } from "react"
import { X, Upload, Download, Check, AlertTriangle, AlertCircle, FileSpreadsheet, Play, Settings2, Search } from "lucide-react"
import * as XLSX from "xlsx"
import { toast } from "sonner"
import { bulkImportProducts } from "@/features/products/actions"
import { bulkCreateCategories } from "@/features/categories/actions"

// ----------------------------------------------------------------------
// 1. Types
// ----------------------------------------------------------------------
export type ImportRowStatus = 'valid' | 'warning' | 'error'

export interface ImportRow {
  _id: number;
  rawName: string;
  name: string; // Validated name
  sku: string;
  price: number;
  stock: number;
  categoryName: string; // The "القسم"
  subCategoryName: string; // The "التصنيف"
  brandName: string;
  description: string;
  
  status: ImportRowStatus;
  errors: string[];
  warnings: string[];
  exclude: boolean;
}

interface ImportProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: any[];
  brands: any[];
}

export function ImportProductsModal({ isOpen, onClose, onSuccess, categories, brands }: ImportProductsModalProps) {
  // ----------------------------------------------------------------------
  // 2. State
  // ----------------------------------------------------------------------
  const [step, setStep] = useState(0); // 0: Upload, 1: Mapping, 2: Review, 3: Importing, 4: Result
  
  // Upload State
  const [fileInfo, setFileInfo] = useState<{ name: string, size: string, rows: number } | null>(null);
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  
  // Mapping State (System Field Key -> Excel Column Header)
  const [mapping, setMapping] = useState<{ [key: string]: string }>({});
  
  // Review State
  const [parsedItems, setParsedItems] = useState<ImportRow[]>([]);
  const [filter, setFilter] = useState<'all' | 'valid' | 'warning' | 'error'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [duplicateHandling, setDuplicateHandling] = useState<'skip' | 'update'>('skip');
  const [autoCreateCategories, setAutoCreateCategories] = useState(true);

  // Import Progress State
  const [progress, setProgress] = useState(0);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  
  // Result State
  const [importResult, setImportResult] = useState<{ imported: number, updated: number, skipped: number, failed: number, rejected: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_ROWS = 10000;
  const BATCH_SIZE = 100;

  const systemFields = [
    { key: 'name', label: 'اسم المنتج *', required: true, autoMap: ['اسم المنتج', 'الاسم', 'product name', 'name'] },
    { key: 'sku', label: 'الرمز (SKU) *', required: true, autoMap: ['sku', 'الرمز', 'كود'] },
    { key: 'price', label: 'السعر *', required: true, autoMap: ['السعر', 'price'] },
    { key: 'stock', label: 'المخزون', required: false, autoMap: ['المخزون', 'stock', 'الكمية', 'qty'] },
    { key: 'category', label: 'القسم *', required: true, autoMap: ['القسم', 'category', 'المجال'] },
    { key: 'subCategory', label: 'التصنيف', required: false, autoMap: ['التصنيف', 'subcategory', 'القسم الفرعي'] },
    { key: 'brand', label: 'الماركة', required: false, autoMap: ['الماركة', 'brand', 'العلامة التجارية'] },
    { key: 'description', label: 'الوصف', required: false, autoMap: ['الوصف', 'description', 'تفاصيل'] },
  ];

  // Reset when closed
  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      setFileInfo(null);
      setRawHeaders([]);
      setRawData([]);
      setMapping({});
      setParsedItems([]);
      setFilter('all');
      setSearchQuery('');
      setProgress(0);
      setImportResult(null);
    }
  }, [isOpen]);


  // ----------------------------------------------------------------------
  // 3. Step 1: Upload & Parse
  // ----------------------------------------------------------------------
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size and type
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    if (file.size > 10 * 1024 * 1024) {
      toast.error("حجم الملف كبير جداً. الحد الأقصى 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        
        if (data.length < 2) {
          toast.error("الملف فارغ أو لا يحتوي على بيانات.");
          return;
        }

        const headers = data[0] as string[];
        const rows = XLSX.utils.sheet_to_json(ws);
        
        if (rows.length > MAX_ROWS) {
          toast.error(`الملف يحتوي على ${rows.length} صف. الحد الأقصى هو ${MAX_ROWS} منتج.`);
          return;
        }

        setFileInfo({ name: file.name, size: sizeMB + ' MB', rows: rows.length });
        setRawHeaders(headers);
        setRawData(rows);
        
        // Auto-mapping
        const initialMap: any = {};
        systemFields.forEach(sf => {
          const match = headers.find(h => sf.autoMap.some(am => h.toLowerCase().includes(am)));
          if (match) initialMap[sf.key] = match;
        });
        setMapping(initialMap);
        setStep(1);
      } catch (error) {
        toast.error("حدث خطأ أثناء قراءة الملف. تأكد أنه ملف Excel أو CSV صالح.");
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { "اسم المنتج": "مثقاب بوش", "الرمز (SKU)": "DR-1002", "السعر": 1200, "المخزون": 50, "القسم": "العدد", "التصنيف": "مثاقب", "الماركة": "Bosch", "الوصف": "مثقاب كهربائي احترافي" }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "المنتجات");
    XLSX.writeFile(wb, "Assal_Products_Template.xlsx");
  };

  // ----------------------------------------------------------------------
  // 4. Step 2: Column Mapping -> Validation
  // ----------------------------------------------------------------------
  const normalizeString = (str: any) => {
    if (!str) return '';
    return str.toString().trim();
  }

  const handleMappingComplete = () => {
    // Validate required fields mapping
    const missing = systemFields.filter(sf => sf.required && !mapping[sf.key]);
    if (missing.length > 0) {
      toast.error(`يرجى تعيين الأعمدة المطلوبة: ${missing.map(m => m.label).join('، ')}`);
      return;
    }

    validateAndSetItems(rawData, mapping);
    setStep(2);
  };

  const validateAndSetItems = (data: any[], currentMapping: { [key: string]: string }) => {
    const mainCategories = categories.filter(c => !c.parentId);
    
    // For duplicate check in file
    const skusInFile = new Set<string>();

    const processed: ImportRow[] = data.map((row, idx) => {
      const name = normalizeString(row[currentMapping['name']]);
      const sku = normalizeString(row[currentMapping['sku']]);
      const priceRaw = row[currentMapping['price']];
      const stockRaw = row[currentMapping['stock']];
      const categoryName = normalizeString(row[currentMapping['category']]);
      const subCategoryName = normalizeString(row[currentMapping['subCategory']]);
      const brandName = normalizeString(row[currentMapping['brand']]);
      const desc = normalizeString(row[currentMapping['description']]);

      const price = parseFloat(priceRaw);
      const stock = parseInt(stockRaw);

      let status: ImportRowStatus = 'valid';
      const errors: string[] = [];
      const warnings: string[] = [];

      // Validations
      if (!name) errors.push("اسم المنتج مفقود");
      if (!sku) errors.push("SKU مفقود");
      
      if (priceRaw !== undefined && priceRaw !== '' && isNaN(price)) {
        errors.push("السعر غير رقمي");
      } else if (!priceRaw || priceRaw === '') {
        errors.push("السعر مفقود"); // Required in system
      }

      if (!categoryName) {
        errors.push("القسم مفقود");
      } else {
        // Validate Hierarchy
        const mainCat = mainCategories.find(c => c.name.toLowerCase().trim() === categoryName.toLowerCase());
        if (mainCat) {
          if (subCategoryName) {
            const subCat = categories.find(c => c.parentId === mainCat.id && c.name.toLowerCase().trim() === subCategoryName.toLowerCase());
            if (!subCat && !autoCreateCategories) {
              errors.push(`التصنيف "${subCategoryName}" غير موجود تحت قسم "${categoryName}"`);
            }
          }
        } else if (!autoCreateCategories) {
          errors.push(`القسم "${categoryName}" غير موجود`);
        }
      }

      // Duplicate SKU in file
      if (sku) {
        if (skusInFile.has(sku.toLowerCase())) {
          errors.push("SKU مكرر داخل الملف");
        } else {
          skusInFile.add(sku.toLowerCase());
        }
      }

      if (errors.length > 0) {
        status = 'error';
      } else {
        if (!desc) warnings.push("بدون وصف");
        if (isNaN(stock) || stockRaw === '') warnings.push("المخزون غير محدد (سيعتبر 0)");
        if (warnings.length > 0) status = 'warning';
      }

      return {
        _id: idx,
        rawName: name,
        name,
        sku,
        price: isNaN(price) ? 0 : price,
        stock: isNaN(stock) ? 0 : stock,
        categoryName,
        subCategoryName,
        brandName,
        description: desc,
        status,
        errors,
        warnings,
        exclude: false
      };
    });

    setParsedItems(processed);
  };

  // Run validation again if autoCreateCategories changes, because it affects category missing errors
  useEffect(() => {
    if (step === 2) {
      validateAndSetItems(rawData, mapping);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoCreateCategories]);

  // ----------------------------------------------------------------------
  // 5. Step 3: Review & Inline Edit
  // ----------------------------------------------------------------------
  const handleInlineEdit = (id: number, field: keyof ImportRow, value: any) => {
    const newItems = [...parsedItems];
    const item = newItems.find(i => i._id === id);
    if (!item) return;
    
    (item as any)[field] = value;
    
    // Re-validate just this row for simplicity, or re-validate all to check SKU conflicts
    validateAndSetItems(newItems, mapping); 
  };

  const toggleExclude = (id: number) => {
    const newItems = [...parsedItems];
    const item = newItems.find(i => i._id === id);
    if (item) item.exclude = !item.exclude;
    setParsedItems(newItems);
  };

  // ----------------------------------------------------------------------
  // 6. Step 4: Import Batches
  // ----------------------------------------------------------------------
  const startImport = async () => {
    const validItems = parsedItems.filter(i => !i.exclude && (i.status === 'valid' || i.status === 'warning'));
    if (validItems.length === 0) return;

    if (validItems.length > 3000) {
      if (!confirm(`أنت على وشك استيراد ${validItems.length.toLocaleString()} منتج. هل ترغب في المتابعة؟`)) {
        return;
      }
    }

    setStep(3);
    setProgress(5);

    try {
      // 1. Bulk create categories if needed
      if (autoCreateCategories) {
        const uniqueCatPairs = new Map<string, string>(); // sub -> main
        validItems.forEach(item => {
          if (item.categoryName) {
            uniqueCatPairs.set(item.categoryName, ""); // Main cat
            if (item.subCategoryName) {
              // Store combination to create later
              uniqueCatPairs.set(`${item.categoryName}|||${item.subCategoryName}`, item.categoryName);
            }
          }
        });

        const missingCategoriesToCreate: { main: string, sub?: string }[] = [];
        
        uniqueCatPairs.forEach((mainRef, key) => {
          if (mainRef === "") {
            // It's a main category
            const exists = categories.find(c => !c.parentId && c.name.toLowerCase().trim() === key.toLowerCase().trim());
            if (!exists) missingCategoriesToCreate.push({ main: key });
          } else {
            // It's a sub category
            const subName = key.split("|||")[1];
            missingCategoriesToCreate.push({ main: mainRef, sub: subName });
          }
        });

        if (missingCategoriesToCreate.length > 0) {
          const res = await bulkCreateCategories(missingCategoriesToCreate);
          if (!res.success) {
            toast.error(res.error || "فشل إنشاء الأقسام الجديدة");
            setStep(2);
            return;
          }
        }
      }
      setProgress(15);

      // 2. Batch Import
      const totalBatchCount = Math.ceil(validItems.length / BATCH_SIZE);
      setTotalBatches(totalBatchCount);
      
      let totalCreated = 0;
      let totalUpdated = 0;
      let totalSkipped = 0; 
      let totalFailed = 0;
      
      for (let i = 0; i < totalBatchCount; i++) {
        setCurrentBatch(i + 1);
        const chunk = validItems.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
        
        // Prepare payload
        const payload = chunk.map(item => ({
          name: item.name,
          sku: item.sku,
          price: item.price,
          stock: item.stock,
          categoryName: item.categoryName,
          subCategoryName: item.subCategoryName,
          brandName: item.brandName,
          description: item.description,
          isActive: true
        }));

        // Pass duplicateHandling: 'skip' | 'update' | 'create', here we use skip or update
        const res = await bulkImportProducts(payload, duplicateHandling as any);
        
        if (res.success) {
          totalCreated += res.createdCount || 0;
          totalUpdated += res.updatedCount || 0;
          totalSkipped += (chunk.length - (res.createdCount || 0) - (res.updatedCount || 0));
        } else {
          totalFailed += chunk.length;
          toast.error(`فشلت الدفعة ${i+1}: ${res.error}`);
        }
        
        const currentProgress = 15 + Math.floor(((i + 1) / totalBatchCount) * 85);
        setProgress(currentProgress > 100 ? 100 : currentProgress);
      }

      setImportResult({
        imported: totalCreated,
        updated: totalUpdated,
        skipped: totalSkipped,
        failed: totalFailed,
        rejected: parsedItems.filter(i => i.status === 'error' && !i.exclude).length
      });
      
      setStep(4);
      onSuccess();
    } catch (err) {
      toast.error("حدث خطأ في الاتصال بالخادم أثناء الاستيراد.");
      setStep(2);
    }
  };


  // ----------------------------------------------------------------------
  // Stats & Filters
  // ----------------------------------------------------------------------
  const validCount = parsedItems.filter(i => i.status === 'valid' && !i.exclude).length;
  const warningCount = parsedItems.filter(i => i.status === 'warning' && !i.exclude).length;
  const errorCount = parsedItems.filter(i => i.status === 'error' && !i.exclude).length;
  const excludedCount = parsedItems.filter(i => i.exclude).length;
  const toImportCount = validCount + warningCount;

  const displayedItems = parsedItems.filter(i => {
    if (filter !== 'all' && i.status !== filter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q) || i.categoryName.toLowerCase().includes(q);
    }
    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 admin-theme rtl" dir="rtl">
      <div className="bg-white w-full max-w-6xl rounded-xl flex flex-col border border-gray-200 overflow-hidden shadow-none" style={{ maxHeight: '95vh', height: '95vh' }}>
        
        {/* Header (Stepper) */}
        <div className="border-b border-gray-200 px-6 py-4 bg-white shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">استيراد المنتجات</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-md text-gray-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <span className={`font-medium ${step >= 0 ? 'text-[#2453E3]' : 'text-gray-400'}`}>رفع الملف</span>
            <span className="text-gray-300">─────</span>
            <span className={`font-medium ${step >= 1 ? 'text-[#2453E3]' : 'text-gray-400'}`}>مطابقة الأعمدة</span>
            <span className="text-gray-300">─────</span>
            <span className={`font-medium ${step >= 2 ? 'text-[#2453E3]' : 'text-gray-400'}`}>المراجعة</span>
            <span className="text-gray-300">─────</span>
            <span className={`font-medium ${step >= 3 ? 'text-[#2453E3]' : 'text-gray-400'}`}>الاستيراد</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-white p-6 relative">
          
          {/* STEP 0: UPLOAD */}
          {step === 0 && (
            <div className="max-w-xl mx-auto py-12 text-center space-y-8">
              <div className="w-20 h-20 bg-[#2453E3]/10 text-[#2453E3] rounded-2xl mx-auto flex items-center justify-center mb-6">
                <FileSpreadsheet className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">أضف منتجاتك دفعة واحدة</h3>
                <p className="text-gray-500 mt-2">قم برفع ملف Excel أو CSV الخاص بك ليتم استيراد المنتجات فوراً.</p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button onClick={downloadTemplate} className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> تحميل قالب Excel
                </button>
                <div className="relative w-full sm:w-auto">
                  <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} ref={fileInputRef} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <button className="w-full sm:w-auto px-6 py-3 bg-[#2453E3] text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" /> اختيار ملف
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400">الحد الأقصى {MAX_ROWS.toLocaleString()} منتج</p>
            </div>
          )}

          {/* STEP 1: MAPPING */}
          {step === 1 && (
            <div className="max-w-3xl mx-auto">
              <div className="mb-6 flex items-center gap-3 text-[#2453E3]">
                <Settings2 className="w-6 h-6" />
                <h3 className="text-lg font-bold">مطابقة أعمدة الملف مع النظام</h3>
              </div>
              
              {fileInfo && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-500">الملف:</span>
                    <span className="ml-2 font-medium text-gray-900">{fileInfo.name}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">الصفوف:</span>
                    <span className="ml-2 font-medium text-gray-900">{fileInfo.rows}</span>
                  </div>
                </div>
              )}

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-right">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
                    <tr>
                      <th className="px-4 py-3 font-semibold">حقل النظام</th>
                      <th className="px-4 py-3 font-semibold">العمود في ملفك</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {systemFields.map(sf => (
                      <tr key={sf.key} className="bg-white">
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-900">{sf.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <select 
                            value={mapping[sf.key] || ''}
                            onChange={(e) => setMapping({...mapping, [sf.key]: e.target.value})}
                            className="w-full border border-gray-300 rounded-md h-9 px-3 text-sm focus:border-[#2453E3] focus:ring-1 focus:ring-[#2453E3] outline-none bg-white"
                          >
                            <option value="">-- تجاهل هذا الحقل --</option>
                            {rawHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 2: REVIEW */}
          {step === 2 && (
            <div className="flex flex-col h-full absolute inset-0 p-6">
              {/* Summary */}
              <div className="grid grid-cols-5 gap-4 mb-6 shrink-0">
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-center">
                  <span className="text-2xl font-bold text-gray-900">{parsedItems.length}</span>
                  <p className="text-sm text-gray-500 mt-1">إجمالي</p>
                </div>
                <div className="bg-green-50 border border-green-200 p-4 rounded-xl text-center cursor-pointer hover:bg-green-100 transition-colors" onClick={() => setFilter('valid')}>
                  <span className="text-2xl font-bold text-green-700">{validCount}</span>
                  <p className="text-sm text-green-600 mt-1 flex items-center justify-center gap-1"><Check className="w-3 h-3"/> صالح</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-center cursor-pointer hover:bg-yellow-100 transition-colors" onClick={() => setFilter('warning')}>
                  <span className="text-2xl font-bold text-yellow-700">{warningCount}</span>
                  <p className="text-sm text-yellow-600 mt-1 flex items-center justify-center gap-1"><AlertTriangle className="w-3 h-3"/> تحذيرات</p>
                </div>
                <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-center cursor-pointer hover:bg-red-100 transition-colors" onClick={() => setFilter('error')}>
                  <span className="text-2xl font-bold text-red-700">{errorCount}</span>
                  <p className="text-sm text-red-600 mt-1 flex items-center justify-center gap-1"><AlertCircle className="w-3 h-3"/> أخطاء</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-center cursor-pointer hover:bg-gray-100" onClick={() => setFilter('all')}>
                  <span className="text-2xl font-bold text-gray-500">{excludedCount}</span>
                  <p className="text-sm text-gray-500 mt-1">مستبعد</p>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex gap-4 mb-4 shrink-0 items-center justify-between">
                <div className="flex gap-2">
                  <button onClick={() => setFilter('all')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'all' ? 'bg-[#2453E3] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'}`}>الكل</button>
                  <button onClick={() => setFilter('valid')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'valid' ? 'bg-green-600 text-white' : 'bg-white text-green-700 hover:bg-green-50 border border-green-200'}`}>صالح</button>
                  <button onClick={() => setFilter('warning')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'warning' ? 'bg-yellow-500 text-white' : 'bg-white text-yellow-700 hover:bg-yellow-50 border border-yellow-200'}`}>تحذيرات</button>
                  <button onClick={() => setFilter('error')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'error' ? 'bg-red-600 text-white' : 'bg-white text-red-700 hover:bg-red-50 border border-red-200'}`}>أخطاء</button>
                </div>
                <div className="relative w-64">
                  <Search className="w-4 h-4 absolute right-3 top-2.5 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="ابحث عن منتج، رمز، قسم..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-3 pr-9 py-1.5 text-sm border border-gray-300 rounded-md focus:border-[#2453E3] outline-none"
                  />
                </div>
              </div>

              {/* Advanced Table */}
              <div className="flex-1 overflow-hidden border border-gray-200 rounded-lg flex flex-col">
                <div className="overflow-auto flex-1 relative">
                  <table className="w-full text-sm text-right whitespace-nowrap">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 font-semibold w-12 text-center">الحالة</th>
                        <th className="px-4 py-3 font-semibold min-w-[200px]">المنتج</th>
                        <th className="px-4 py-3 font-semibold w-32">SKU</th>
                        <th className="px-4 py-3 font-semibold w-24">السعر</th>
                        <th className="px-4 py-3 font-semibold w-32">القسم</th>
                        <th className="px-4 py-3 font-semibold w-32">التصنيف</th>
                        <th className="px-4 py-3 font-semibold w-12 text-center">استبعاد</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {displayedItems.map((item) => (
                        <tr key={item._id} className={`${item.exclude ? 'opacity-40 bg-gray-50' : 'hover:bg-gray-50'} transition-colors`}>
                          <td className="px-4 py-2 text-center align-top pt-3">
                            {item.status === 'valid' && <span title="صالح"><Check className="w-5 h-5 text-green-500 mx-auto" /></span>}
                            {item.status === 'warning' && <span title={item.warnings.join('\n')}><AlertTriangle className="w-5 h-5 text-yellow-500 mx-auto" /></span>}
                            {item.status === 'error' && <span title={item.errors.join('\n')}><AlertCircle className="w-5 h-5 text-red-500 mx-auto" /></span>}
                          </td>
                          <td className="px-4 py-2 align-top">
                            <input 
                              value={item.name}
                              onChange={(e) => handleInlineEdit(item._id, 'name', e.target.value)}
                              className={`w-full bg-transparent border border-transparent hover:border-gray-300 focus:border-[#2453E3] focus:bg-white rounded px-2 py-1 outline-none transition-colors ${item.errors.some(e=>e.includes('اسم')) ? 'border-red-300 bg-red-50' : ''}`}
                              disabled={item.exclude}
                            />
                            {item.errors.map(err => err.includes('اسم') && <div key={err} className="text-[10px] text-red-500 px-2">{err}</div>)}
                          </td>
                          <td className="px-4 py-2 align-top">
                            <input 
                              value={item.sku}
                              onChange={(e) => handleInlineEdit(item._id, 'sku', e.target.value)}
                              className={`w-full font-mono text-xs bg-transparent border border-transparent hover:border-gray-300 focus:border-[#2453E3] focus:bg-white rounded px-2 py-1 outline-none transition-colors ${item.errors.some(e=>e.toLowerCase().includes('sku')) ? 'border-red-300 bg-red-50' : ''}`}
                              disabled={item.exclude}
                            />
                            {item.errors.map(err => err.toLowerCase().includes('sku') && <div key={err} className="text-[10px] text-red-500 px-2">{err}</div>)}
                          </td>
                          <td className="px-4 py-2 align-top">
                            <input 
                              value={item.price}
                              type="number"
                              onChange={(e) => handleInlineEdit(item._id, 'price', e.target.value)}
                              className={`w-full bg-transparent border border-transparent hover:border-gray-300 focus:border-[#2453E3] focus:bg-white rounded px-2 py-1 outline-none transition-colors text-left ${item.errors.some(e=>e.includes('سعر')) ? 'border-red-300 bg-red-50' : ''}`}
                              dir="ltr"
                              disabled={item.exclude}
                            />
                            {item.errors.map(err => err.includes('سعر') && <div key={err} className="text-[10px] text-red-500 px-2 text-right">{err}</div>)}
                          </td>
                          <td className="px-4 py-2 align-top">
                            <input 
                              value={item.categoryName}
                              onChange={(e) => handleInlineEdit(item._id, 'categoryName', e.target.value)}
                              className={`w-full bg-transparent border border-transparent hover:border-gray-300 focus:border-[#2453E3] focus:bg-white rounded px-2 py-1 outline-none transition-colors ${item.errors.some(e=>e.includes('قسم')) ? 'border-red-300 bg-red-50' : ''}`}
                              disabled={item.exclude}
                            />
                            {item.errors.map(err => err.includes('قسم') && <div key={err} className="text-[10px] text-red-500 px-2">{err}</div>)}
                          </td>
                          <td className="px-4 py-2 align-top">
                            <input 
                              value={item.subCategoryName}
                              onChange={(e) => handleInlineEdit(item._id, 'subCategoryName', e.target.value)}
                              className={`w-full bg-transparent border border-transparent hover:border-gray-300 focus:border-[#2453E3] focus:bg-white rounded px-2 py-1 outline-none transition-colors ${item.errors.some(e=>e.includes('تصنيف')) ? 'border-red-300 bg-red-50' : ''}`}
                              disabled={item.exclude}
                            />
                            {item.errors.map(err => err.includes('تصنيف') && <div key={err} className="text-[10px] text-red-500 px-2">{err}</div>)}
                          </td>
                          <td className="px-4 py-2 text-center align-top pt-3">
                            <button 
                              onClick={() => toggleExclude(item._id)}
                              className={`p-1 rounded-md transition-colors ${item.exclude ? 'text-gray-500 bg-gray-200 hover:bg-gray-300' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                              title={item.exclude ? "تضمين" : "استبعاد"}
                            >
                              <X className="w-4 h-4 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {displayedItems.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center py-12 text-gray-500">لا توجد بيانات مطابقة للبحث.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PROGRESS */}
          {step === 3 && (
            <div className="max-w-md mx-auto py-20 text-center space-y-6">
              <div className="w-16 h-16 bg-[#2453E3]/10 text-[#2453E3] rounded-full mx-auto flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2453E3]"></div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">جاري استيراد المنتجات</h3>
                <p className="text-gray-500 mt-2">يرجى الانتظار، لا تقم بإغلاق النافذة</p>
              </div>
              
              <div className="w-full bg-gray-100 rounded-full h-2 mb-4 overflow-hidden relative">
                <div className="bg-[#2453E3] h-2 rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
              </div>
              
              <div className="flex justify-between text-sm font-medium text-gray-600">
                <span>{progress}%</span>
                {totalBatches > 0 && <span>الدفعة {currentBatch} من {totalBatches}</span>}
              </div>
            </div>
          )}

          {/* STEP 4: RESULT */}
          {step === 4 && importResult && (
            <div className="max-w-lg mx-auto py-8 text-center space-y-8">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full mx-auto flex items-center justify-center">
                <Check className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">اكتمل الاستيراد بنجاح</h3>
                <p className="text-gray-500 mt-2">تمت معالجة البيانات وفقاً للشروط المحددة.</p>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 grid grid-cols-2 gap-y-6 gap-x-8 text-right">
                <div>
                  <p className="text-sm text-gray-500">تم إنشاء (منتج جديد)</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{importResult.imported}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">تم تحديث (موجود)</p>
                  <p className="text-2xl font-bold text-[#2453E3] mt-1">{importResult.updated}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">تم تخطي (مكرر)</p>
                  <p className="text-2xl font-bold text-gray-600 mt-1">{importResult.skipped}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">فشل الخادم / الأخطاء</p>
                  <p className="text-2xl font-bold text-red-500 mt-1">{importResult.failed + importResult.rejected}</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer (Actions) */}
        {step === 1 && (
          <div className="border-t border-gray-200 px-6 py-4 bg-white shrink-0 flex justify-end gap-3">
            <button onClick={() => setStep(0)} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">تراجع</button>
            <button onClick={handleMappingComplete} className="px-6 py-2 bg-[#2453E3] text-white rounded-lg hover:bg-[#1d42b8] font-medium">متابعة المراجعة</button>
          </div>
        )}

        {step === 2 && (
          <div className="border-t border-gray-200 px-6 py-4 bg-white shrink-0 flex items-center justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">المنتجات المكررة (SKU):</span>
                <select 
                  value={duplicateHandling} 
                  onChange={(e) => setDuplicateHandling(e.target.value as any)}
                  className="border border-gray-300 rounded-md h-9 px-3 text-sm focus:border-[#2453E3] outline-none"
                >
                  <option value="skip">تخطي (لا تفعل شيء)</option>
                  <option value="update">تحديث الموجود</option>
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={autoCreateCategories} 
                  onChange={(e) => setAutoCreateCategories(e.target.checked)}
                  className="rounded border-gray-300 text-[#2453E3] focus:ring-[#2453E3] w-4 h-4 cursor-pointer" 
                />
                <span className="text-sm font-medium text-gray-700">إنشاء الأقسام الجديدة</span>
              </label>
            </div>
            
            <div className="flex items-center gap-3">
              <button onClick={() => setStep(1)} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">رجوع</button>
              <button 
                onClick={startImport} 
                disabled={toImportCount === 0}
                className="px-6 py-2 bg-[#2453E3] text-white rounded-lg hover:bg-[#1d42b8] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                استيراد {toImportCount} منتج
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="border-t border-gray-200 px-6 py-4 bg-white shrink-0 flex justify-end">
            <button onClick={onClose} className="px-8 py-2 bg-[#2453E3] text-white rounded-lg hover:bg-[#1d42b8] font-medium">
              إنهاء وإغلاق
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
