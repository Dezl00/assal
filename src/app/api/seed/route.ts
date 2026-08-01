import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const admin = await db.user.upsert({
      where: { email: 'admin@assal.com' },
      update: {},
      create: {
        email: 'admin@assal.com',
        name: 'Admin',
        passwordHash: 'admin123', // Raw password since we mocked bcrypt for now
        role: 'ADMIN',
      },
    })
    return NextResponse.json({ success: true, message: "Admin user seeded successfully", email: admin.email, password: "admin123" })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
