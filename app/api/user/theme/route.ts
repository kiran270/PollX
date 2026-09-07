import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { theme } = body

    if (!["light", "dark"].includes(theme)) {
      return NextResponse.json({ error: "Invalid theme" }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { theme },
    })

    return NextResponse.json({ theme })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update theme" }, { status: 500 })
  }
}
