"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ChevronLeft, ChevronRight, Home, Eye } from "lucide-react"
import { getChapterByTitle } from "@/fetching/chapters"
import { trackChapterView, getChapterTotalViews } from "@/fetching/views"
import { slugify } from "@/utils"

interface Series {
  series_id: number
  name: string
  status: string
  cover_url: string
  synopsis: string
  created_at: string
  updated_at: string
}

interface Chapter {
  chapter_id: number
  series_id: number
  number: string
  title: string
  pages_url: string[]
  released_at: string | null
  created_at: string
  updated_at: string
  series: Series
  previousChapter?: {
    chapter_id: number
    number: string
    title: string
  } | null
  nextChapter?: {
    chapter_id: number
    number: string
    title: string
  } | null
}

export default function ChapterReaderPage() {
  const params = useParams()
  const router = useRouter()
  const seriesId = params.id as string
  const seriesName = params.name as string
  const chapterTitle = params.number as string // number trong URL thực ra là title (290, 289...)

  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [loading, setLoading] = useState(true)
  const [totalViews, setTotalViews] = useState<number>(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getChapterByTitle(parseInt(seriesId), chapterTitle)
        const chapterData = response.data || response
        setChapter(chapterData)

        // Lấy số views hiện tại
        if (chapterData?.chapter_id) {
          try {
            const viewsData = await getChapterTotalViews(chapterData.chapter_id)
            setTotalViews(viewsData.total_views || 0)
          } catch (error) {
            console.error("Error fetching views:", error)
          }
        }
      } catch (error) {
        console.error("Error fetching chapter:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [seriesId, chapterTitle])

  // Track view sau 3 giây (để chắc user thực sự đọc)
  useEffect(() => {
    if (chapter?.chapter_id) {
      const timer = setTimeout(async () => {
        try {
          const result = await trackChapterView(chapter.chapter_id)
          // Cập nhật số views sau khi track
          if (result.success) {
            setTotalViews(result.count)
          }
        } catch (error) {
          console.error("Error tracking view:", error)
        }
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [chapter?.chapter_id])

  const handlePrevChapter = () => {
    if (chapter?.previousChapter) {
      router.push(`/series/${seriesName}/${seriesId}/chapter/${chapter.previousChapter.title}`)
    }
  }

  const handleNextChapter = () => {
    if (chapter?.nextChapter) {
      router.push(`/series/${seriesName}/${seriesId}/chapter/${chapter.nextChapter.title}`)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải chương...</p>
        </div>
      </main>
    )
  }

  if (!chapter) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Không tìm thấy chương</p>
          <button
            onClick={() => router.push(`/series/${seriesName}/${seriesId}`)}
            className="px-4 py-2 rounded-md bg-accent text-accent-foreground"
          >
            Quay lại trang truyện
          </button>
        </div>
      </main>
    )
  }

  const pages = Array.isArray(chapter.pages_url) ? chapter.pages_url : []

  return (
    <main className="min-h-screen bg-black">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push(`/series/${slugify(chapter.series?.name || "")}/${seriesId}`)}
              className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm">{chapter.series?.name || "Truyện tranh"}</span>
            </button>
            
            <div className="flex flex-col items-center">
              <h1 className="text-white text-sm font-medium">
                Chương {chapter.title || chapter.number}
              </h1>
              {totalViews > 0 && (
                <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
                  <Eye className="h-3 w-3" />
                  <span>{totalViews.toLocaleString()} lượt xem</span>
                </div>
              )}
            </div>
            
            <button
              onClick={() => router.push("/")}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <Home className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Chapter Images */}
      <div className="pt-16 pb-20">
        <div className="mx-auto max-w-4xl">
          {pages.length > 0 ? (
            pages.map((pageUrl, index) => (
              <div key={index} className="w-full">
                <img
                  src={pageUrl}
                  alt={`Page ${index + 1}`}
                  className="w-full h-auto"
                  loading={index < 3 ? "eager" : "lazy"}
                />
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-400">Chương này chưa có nội dung</p>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-t border-gray-800">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevChapter}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!chapter?.previousChapter}
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Chương trước</span>
            </button>
            
            <button
              onClick={() => router.push(`/series/${seriesName}/${seriesId}`)}
              className="px-4 py-2 rounded-md bg-accent text-accent-foreground hover:bg-accent/80 transition-colors"
            >
              Danh sách chương
            </button>
            
            <button
              onClick={handleNextChapter}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!chapter?.nextChapter}
            >
              <span>Chương sau</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

