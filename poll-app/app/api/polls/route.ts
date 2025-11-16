import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const category = searchParams.get("category")
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

    let polls = await prisma.poll.findMany({
      where,
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
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Filter by search in memory (case-insensitive)
    if (searchLower) {
      polls = polls.filter(poll => 
        poll.title.toLowerCase().includes(searchLower) ||
        poll.description?.toLowerCase().includes(searchLower)
      )
    }

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

    // All authenticated users can create polls

    const body = await request.json()
    const { title, description, imageUrl, options, expiresAt, category, isPublic, allowVoteChange } = body

    console.log("Creating poll with data:", { title, optionsCount: options?.length, category })

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
          create: options.map((opt: any) => {
            const optionData = {
              text: typeof opt === 'string' ? opt : opt.text,
              imageUrl: (typeof opt === 'object' && opt.imageUrl) ? opt.imageUrl : null
            }
            console.log("Creating option:", optionData.text, "hasImage:", !!optionData.imageUrl)
            return optionData
          }),
        },
      },
      include: {
        options: true,
      },
    })

    return NextResponse.json(poll)
  } catch (error) {
    console.error("Failed to create poll:", error)
    return NextResponse.json({ 
      error: "Failed to create poll", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}
