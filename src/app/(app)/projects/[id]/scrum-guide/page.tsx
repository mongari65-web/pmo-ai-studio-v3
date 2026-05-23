"use client"
import AppLayout from "@/components/layout/AppLayout"
import { useParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ProjectScrumGuide() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  useEffect(() => {
    router.replace("/scrum-guide?projectId="+id)
  }, [id])
  return null
}
