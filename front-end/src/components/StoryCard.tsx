"use client"

import { useRouter } from "next/navigation"
import { slugify } from "@/utils"

interface StoryCardProps {
  id: number
  title: string
  episodes: string
  chapter: string[]
  image: string
  isHot?: boolean
  isNew?: boolean
}

export default function StoryCard({ id, title, episodes, chapter, image, isHot, isNew }: StoryCardProps) {
  const router = useRouter()
  const slug = slugify(title)

  return (
    <div
      onClick={() => router.push(`/series/${slug}/${id}`)}
      className="group cursor-pointer"
    >
      <div className="relative mb-2 overflow-hidden rounded-md shadow-md transition-transform duration-300 hover:scale-105">
        <img src={image || "/placeholder.svg"} alt={title} className="h-40 w-full object-cover sm:h-48" />
        <div className="absolute left-0 top-0 flex items-start justify-between w-full p-2">
          <span className="rounded-md bg-accent px-2 py-1 text-xs font-bold text-accent-foreground">{episodes}</span>
          
          {isNew && <span className="rounded-md bg-blue-500 px-2 py-1 text-xs font-bold text-white">New</span>}
        </div>
      </div>
      <h3 className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
        {title}
      </h3>
      {chapter.map((chapter, index  ) => (
        <p key={index} className="text-xs text-muted-foreground">Chap {chapter}</p>
      ))}
    </div>
  )
}