import { getArticles } from "@/features/articles/actions"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ArticleActionsClient } from "./article-actions-client"

export default async function ArticlesAdminPage() {
  const { articles } = await getArticles()

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">المقالات</h1>
          <p className="text-muted-foreground mt-1">إدارة مقالات المدونة</p>
        </div>
        <Link href="/admin/articles/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            مقال جديد
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm text-right">
          <thead className="bg-slate-50 text-slate-600 font-medium border-b border-border">
            <tr>
              <th className="px-6 py-4">صورة الغلاف</th>
              <th className="px-6 py-4">العنوان</th>
              <th className="px-6 py-4">الرابط (Slug)</th>
              <th className="px-6 py-4">الحالة</th>
              <th className="px-6 py-4">تاريخ النشر</th>
              <th className="px-6 py-4 text-left">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!articles || articles.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                  لا توجد مقالات حتى الآن
                </td>
              </tr>
            ) : (
              articles.map((article: any) => (
                <tr key={article.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    {article.imageUrl ? (
                      <img src={article.imageUrl} alt={article.title} className="w-16 h-12 object-cover rounded-lg border border-border" />
                    ) : (
                      <div className="w-16 h-12 bg-slate-100 rounded-lg border border-border flex items-center justify-center text-xs text-muted-foreground">لا يوجد</div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold max-w-[250px] truncate">{article.title}</td>
                  <td className="px-6 py-4 font-mono text-muted-foreground">{article.slug}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${article.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                      {article.isActive ? 'نشط' : 'مخفي'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(article.createdAt).toLocaleDateString('en-GB')}
                  </td>
                  <td className="px-6 py-4 text-left">
                    <ArticleActionsClient article={article} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
