import { getActiveArticles } from "@/features/articles/actions"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "المدونة - متجر عسل",
  description: "أحدث المقالات والأخبار عن العسل ومنتجاتنا",
}

export default async function BlogPage() {
  const { articles } = await getActiveArticles()

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 min-h-screen">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">المدونة</h1>
        <p className="text-xl text-muted-foreground">
          اكتشف أحدث المقالات والنصائح حول العسل الطبيعي وفوائده
        </p>
      </div>

      {!articles || articles.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-border">
          <p className="text-muted-foreground text-lg">لا توجد مقالات منشورة حالياً.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article: any) => (
            <Link href={`/blog/${article.slug}`} key={article.id} className="group block h-full">
              <div className="bg-white rounded-2xl border border-border overflow-hidden transition-all hover:shadow-xl hover:border-primary/30 h-full flex flex-col">
                <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden shrink-0">
                  {article.imageUrl ? (
                    <img 
                      src={article.imageUrl} 
                      alt={article.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-slate-100">
                      لا توجد صورة
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="text-sm text-muted-foreground mb-3">
                    {new Date(article.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h2>
                  <div 
                    className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1"
                    dangerouslySetInnerHTML={{ __html: article.content.replace(/<[^>]*>?/gm, '') }} 
                  />
                  <div className="inline-flex items-center gap-2 text-primary font-medium mt-auto">
                    قراءة المزيد
                    <ArrowLeft className="w-4 h-4 rtl-flip transition-transform group-hover:-translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
