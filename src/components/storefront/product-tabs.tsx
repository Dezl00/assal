"use client"
import React, { useState } from "react"
import { cn } from "@/lib/utils"

export function ProductTabs({ description }: { description?: string | null }) {
  const [activeTab, setActiveTab] = useState<'desc' | 'shipping'>('desc')

  return (
    <div className="mt-12">
      <div className="flex items-center gap-6 border-b border-border/50">
        <button
          onClick={() => setActiveTab('desc')}
          className={cn(
            "pb-4 text-lg font-bold transition-all relative",
            activeTab === 'desc' ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          الوصف
          {activeTab === 'desc' && (
            <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('shipping')}
          className={cn(
            "pb-4 text-lg font-bold transition-all relative",
            activeTab === 'shipping' ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          الشحن والتوصيل
          {activeTab === 'shipping' && (
            <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full" />
          )}
        </button>
      </div>

      <div className="py-8">
        {activeTab === 'desc' && (
          <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-300">
            {description ? (
              <p className="whitespace-pre-wrap">{description}</p>
            ) : (
              <p>لا يوجد وصف متاح لهذا المنتج حالياً.</p>
            )}
          </div>
        )}
        
        {activeTab === 'shipping' && (
          <div className="space-y-4 text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h4 className="font-bold text-foreground mb-2">سياسة الشحن والتوصيل</h4>
            <ul className="list-disc list-inside space-y-2">
              <li>يتم تجهيز الطلبات وشحنها خلال 24 ساعة من تأكيد الطلب.</li>
              <li>مدة التوصيل المعتادة تتراوح بين 2 إلى 5 أيام عمل لجميع المدن والمحافظات.</li>
              <li>تكلفة الشحن مجانية للطلبات التي تتجاوز قيمتها 500 ج.م.</li>
              <li>نضمن لك تغليف المنتج بعناية فائقة لضمان وصوله بحالة ممتازة.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
