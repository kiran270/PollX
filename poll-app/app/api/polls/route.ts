import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const polls = await prisma.poll.findMany({
      include: {
        options: {
          include: {
            votes: true,
          },
        },
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            votes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(polls)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch polls" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Please sign in to create polls" }, { status: 401 })
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Only admins can create polls" }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, options, expiresAt } = body

    const poll = await prisma.poll.create({
      data: {
        title,
        description,
        expiresAt: new Date(expiresAt),
        userId: session.user.id,
        options: {
          create: options.map((text: string) => ({ text })),
        },
      },
      include: {
        options: true,
      },
    })

    return NextResponse.json(poll)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create poll" }, { status: 500 })
  }
}
