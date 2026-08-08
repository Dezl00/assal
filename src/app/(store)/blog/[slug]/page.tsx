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
    <div className="bg-white min-h-screen pb-20">
      {/* Header / Cover */}
      <div className="relative w-full h-[40vh] md:h-[50vh] bg-slate-900">
        {article.imageUrl && (
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="w-full h-full object-cover opacity-60"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent flex items-end">
          <div className="container mx-auto px-4 pb-12">
            <Link href="/blog" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 text-sm">
              <ArrowRight className="w-4 h-4 rtl-flip" />
              العودة للمدونة
            </Link>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white max-w-4xl leading-tight">
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

      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 mt-8 lg:mt-12">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          
          {/* Main Content (Right Side in RTL) */}
          <div className="flex-1 w-full bg-white lg:w-2/3 px-4 sm:px-6 md:px-8 lg:px-12 py-6 md:py-10">
            <div 
              className="prose prose-slate prose-lg md:prose-xl max-w-4xl text-right rtl prose-p:leading-[2.2] prose-headings:leading-normal"
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

          {/* Related Articles Sidebar (Left Side in RTL) */}
          {relatedArticles.length > 0 && (
            <div className="w-full lg:w-1/3 shrink-0">
              <div className="sticky top-24">
                <h2 className="text-2xl font-bold text-foreground mb-6 pb-2 border-b border-border/50">مقالات قد تعجبك</h2>
                <div className="flex flex-col gap-6">
                  {relatedArticles.map((rel: any) => (
                    <Link href={`/blog/${rel.slug}`} key={rel.id} className="group flex gap-4 items-start">
                      <div className="w-24 h-24 shrink-0 rounded-xl bg-slate-100 overflow-hidden relative">
                        {rel.imageUrl ? (
                          <img 
                            src={rel.imageUrl} 
                            alt={rel.title} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground/50 text-xs text-center">
                            لا صورة
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col flex-1">
                        <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                          {rel.title}
                        </h3>
                        <span className="text-xs text-muted-foreground mt-2">
                          {new Date(rel.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
