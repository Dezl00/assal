import { getArticleBySlug, getActiveArticles } from "@/features/articles/actions"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Share2, Calendar } from "lucide-react"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { article } = await getArticleBySlug(slug)
  
  if (!article) return { title: "مقال غير موجود" }
  
  return {
    title: `${article.seoTitle || article.title} | متجر عسل`,
    description: article.seoDesc || article.title,
    openGraph: {
      images: article.imageUrl ? [article.imageUrl] : [],
    }
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [{ article }, { articles: allArticles }] = await Promise.all([
    getArticleBySlug(slug),
    getActiveArticles(4) // Fetch 4, we'll exclude current
  ])

  if (!article || !article.isActive) {
    notFound()
  }

  // Get related articles (exclude current one, take up to 3)
  const relatedArticles = allArticles?.filter((a: any) => a.id !== article.id).slice(0, 3) || []

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Header / Cover */}
      <div className="relative w-full h-[40vh] md:h-[60vh] bg-slate-900">
        {article.imageUrl && (
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="w-full h-full object-cover opacity-60"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent flex items-end">
          <div className="container mx-auto px-4 pb-12">
            <Link href="/blog" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 text-sm">
              <ArrowRight className="w-4 h-4 rtl-flip" />
              العودة للمدونة
            </Link>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white max-w-4xl leading-tight">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-6 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(article.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Main Content */}
          <div className="flex-1 w-full max-w-4xl mx-auto bg-white rounded-3xl p-6 md:p-12 shadow-sm border border-border">
            <div 
              className="prose prose-slate prose-lg md:prose-xl max-w-none text-right rtl"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
            
            <div className="mt-12 pt-8 border-t border-border flex justify-between items-center">
              <span className="text-muted-foreground font-medium">مشاركة المقال</span>
              <div className="flex items-center gap-2">
                <button 
                  className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-colors"

                  title="مشاركة"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <div className="container mx-auto px-4 mt-24">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl font-bold text-foreground">مقالات قد تعجبك</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedArticles.map((rel: any) => (
              <Link href={`/blog/${rel.slug}`} key={rel.id} className="group block h-full">
                <div className="bg-white rounded-2xl border border-border overflow-hidden transition-all hover:shadow-xl hover:border-primary/30 h-full flex flex-col">
                  <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden shrink-0">
                    {rel.imageUrl ? (
                      <img 
                        src={rel.imageUrl} 
                        alt={rel.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-slate-100">
                        لا توجد صورة
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {rel.title}
                    </h3>
                    <div className="inline-flex items-center gap-2 text-primary font-medium mt-auto">
                      قراءة المزيد
                      <ArrowLeft className="w-4 h-4 rtl-flip transition-transform group-hover:-translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
