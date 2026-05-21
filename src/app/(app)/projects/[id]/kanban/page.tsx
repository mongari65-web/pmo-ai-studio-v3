"use client"
import { useParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Redirect() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  useEffect(() => { router.replace("/projects/"+id+"/sprint") }, [id])
  return null
}
