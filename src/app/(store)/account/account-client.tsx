"use client"

import React, { useState } from "react"
import { Package, User, MapPin, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"

export function AccountClient({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<"orders" | "settings">("orders")

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <div className="w-full md:w-64 shrink-0">
        <div className="bg-card border border-border/50 rounded-2xl p-4 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-start transition-colors ${
              activeTab === "orders" 
                ? "bg-primary/10 text-primary font-bold" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Package className="w-5 h-5" />
            طلباتي
          </button>
          
          <button 
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-start transition-colors ${
              activeTab === "settings" 
                ? "bg-primary/10 text-primary font-bold" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <User className="w-5 h-5" />
            إعدادات الحساب
          </button>

          <div className="my-2 border-t border-border/50"></div>
          
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-start text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8">
          
          {activeTab === "orders" && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">طلباتي السابقة</h2>
              {user.orders && user.orders.length > 0 ? (
                <div className="space-y-4">
                  {user.orders.map((order: any) => (
                    <div key={order.id} className="border border-border/50 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <p className="font-bold">طلب #{order.id.slice(-6).toUpperCase()}</p>
                        <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</p>
                      </div>
                      <div className="text-start sm:text-end">
                        <p className="font-bold text-primary">{order.totalAmount} ج.م</p>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${
                          order.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' :
                          order.status === 'DELIVERED' ? 'bg-green-500/10 text-green-500' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {order.status === 'PENDING' ? 'قيد المراجعة' : 
                           order.status === 'DELIVERED' ? 'تم التوصيل' : order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-muted/30 rounded-xl">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground">ليس لديك أي طلبات سابقة حتى الآن.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">بيانات الحساب</h2>
              <form className="space-y-6 max-w-xl">
                <div className="space-y-2">
                  <label className="text-sm font-medium">الاسم الكامل</label>
                  <input type="text" defaultValue={user.name || ''} className="w-full h-12 px-4 bg-muted border border-border/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">البريد الإلكتروني</label>
                  <input type="email" defaultValue={user.email} disabled className="w-full h-12 px-4 bg-muted border border-border/50 rounded-lg opacity-70 cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">رقم الهاتف</label>
                  <input type="tel" className="w-full h-12 px-4 bg-muted border border-border/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <button type="button" className="h-12 px-8 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors">
                  حفظ التعديلات
                </button>
              </form>
            </div>
          )}
          
        </div>
      </div>
    </div>
  )
}
