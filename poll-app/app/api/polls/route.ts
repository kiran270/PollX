import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const category = searchParams.get("category")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = 10
    const skip = (page - 1) * limit
    const session = await auth()

    const where: any = {}

    // Filter by visibility
    if (!session?.user || session.user.role !== "admin") {
      where.isPublic = true
    }

    // Search filter - SQLite uses LIKE for contains
    // We'll filter in memory for case-insensitive search
    const searchLower = search?.toLowerCase()

    // Category filter
    if (category && category !== "all") {
      where.category = category
    }

    const [polls, total] = await Promise.all([
      prisma.poll.findMany({
        where,
        take: limit,
        skip,
      include: {
        options: {
          select: {
            id: true,
            text: true,
            // Don't include imageUrl to reduce size
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
      }),
      prisma.poll.count({ where })
    ])

    // Filter by search in memory (case-insensitive)
    if (searchLower) {
      polls = polls.filter(poll => 
        poll.title.toLowerCase().includes(searchLower) ||
        poll.description?.toLowerCase().includes(searchLower)
      )
    }

    return NextResponse.json({
      polls,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
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

    if (!session.user.id) {
      return NextResponse.json({ error: "Invalid session. Please sign out and sign in again." }, { status: 401 })
    }

    // All authenticated users can create polls

    const body = await request.json()
    const { title, description, imageUrl, options, expiresAt, category, isPublic, allowVoteChange } = body

    const poll = await prisma.poll.create({
      data: {
        title,
        description: description || null,
        imageUrl: imageUrl || null,
        category: category || null,
        isPublic: isPublic !== undefined ? isPublic : true,
        allowVoteChange: allowVoteChange !== undefined ? allowVoteChange : false,
        expiresAt: new Date(expiresAt),
        userId: session.user.id,
        options: {
          create: options.map((opt: any) => ({
            text: typeof opt === 'string' ? opt : opt.text,
            imageUrl: (typeof opt === 'object' && opt.imageUrl) ? opt.imageUrl : null
          })),
        },
      },
      include: {
        options: true,
      },
    })

    return NextResponse.json(poll)
  } catch (error) {
    return NextResponse.json({ 
      error: "Failed to create poll", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}
