"use server"

import { db } from "@/lib/db"
import { headers } from "next/headers"

export async function logPageVisit(path: string) {
  try {
    const reqHeaders = await headers()
    const ip = reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip") || "unknown"
    const userAgent = reqHeaders.get("user-agent") || "unknown"

    await db.pageVisit.create({
      data: {
        path,
        ipAddress: ip,
        userAgent: userAgent
      }
    })
  } catch (error) {
    console.error("Failed to log page visit", error)
  }
}
