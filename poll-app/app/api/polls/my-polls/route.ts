import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const polls = await prisma.poll.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        options: {
          select: {
            id: true,
            text: true,
            _count: {
              select: { votes: true }
            }
          }
        },
        createdBy: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            votes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(polls)
  } catch (error) {
    console.error("Failed to fetch user polls:", error)
    return NextResponse.json({ error: "Failed to fetch polls" }, { status: 500 })
  }
}
