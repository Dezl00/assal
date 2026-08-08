import { getArticleBySlug, getActiveArticles } from "@/features/articles/actions"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Share2, Calendar } from "lucide-react"
import { ShareArticleButton } from "./share-button"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { article } = await getArticleBySlug(slug)
  
  if (!article) return { title: "مقال غير موجود" }
  
  return {
    title: article.seoTitle || article.title,
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
    getActiveArticles(6) // Fetch 6, we'll exclude current to get 5
  ])

  if (!article || !article.isActive) {
    notFound()
  }

  // Get related articles (exclude current one, take up to 5)
  const relatedArticles = allArticles?.filter((a: any) => a.id !== article.id).slice(0, 5) || []

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Page Header */}
      <div className="mb-12 relative overflow-hidden bg-primary p-10 sm:p-16 text-center shadow-lg shadow-primary/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground max-w-4xl leading-tight mb-4">
            {article.title}
          </h1>
          
          {/* Breadcrumbs */}
          <nav className="flex items-center flex-nowrap whitespace-nowrap overflow-x-auto max-w-full no-scrollbar gap-2 text-xs sm:text-sm text-primary-foreground/80 bg-black/10 backdrop-blur-sm px-4 py-2 rounded-full mt-2">
            <Link href="/" className="hover:text-white transition-colors">الرئيسية</Link>
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 rtl-flip opacity-50" />
            <Link href="/blog" className="hover:text-white transition-colors">الأدلة والنصائح</Link>
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 rtl-flip opacity-50" />
            <span className="text-white font-medium max-w-[200px] truncate">{article.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 mt-8 lg:mt-12">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-8 lg:gap-12">
          
          {/* Main Content (Right Side in RTL) */}
          <div className="min-w-0 bg-white px-4 sm:px-6 md:px-8 lg:px-12 py-6 md:py-10">
            <div 
              className="prose prose-slate prose-lg md:prose-xl max-w-none w-full text-right rtl prose-p:leading-[2.2] prose-headings:leading-normal prose-img:rounded-xl prose-img:max-w-full"
              dangerouslySetInnerHTML={{ 
                __html: article.content.replace(
                  /<a[^>]*href="(https?:\/\/(?:www\.)?youtube\.com\/embed\/[^"]+)"[^>]*>.*?<\/a>/gi,
                  '<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="$1"></iframe>'
                ) 
              }}
            />
            
            <div className="mt-12 pt-8 border-t border-border flex justify-between items-center">
              <span className="text-muted-foreground font-medium">مشاركة المقال</span>
              <div className="flex items-center gap-2">
                <ShareArticleButton title={article.title} />
              </div>
            </div>
          </div>

          {/* Related Articles Sidebar (Left Side in RTL) */}
          {relatedArticles.length > 0 && (
            <div className="sticky top-24 self-start">
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
          )}

        </div>
      </div>
    </div>
  )
}
