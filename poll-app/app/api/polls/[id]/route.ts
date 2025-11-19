import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// GET single poll
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pollId } = await params

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          select: {
            id: true,
            text: true,
            imageUrl: true,
            _count: {
              select: { votes: true }
            }
          }
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
    })

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }

    return NextResponse.json(poll)
  } catch (error) {
    console.error("Get poll error:", error)
    return NextResponse.json({ error: "Failed to fetch poll" }, { status: 500 })
  }
}

// DELETE poll
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: pollId } = await params

    console.log("Delete request - pollId:", pollId, "type:", typeof pollId)

    if (!pollId || typeof pollId !== 'string') {
      return NextResponse.json({ error: "Invalid poll ID" }, { status: 400 })
    }

    // Check if poll exists and user owns it
    const existingPoll = await prisma.poll.findUnique({
      where: { id: pollId },
    })

    if (!existingPoll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }

    // Check ownership
    if (existingPoll.userId !== session.user.id) {
      return NextResponse.json({ error: "You can only delete your own polls" }, { status: 403 })
    }

    // Get all options for this poll
    const options = await prisma.option.findMany({
      where: { pollId },
      select: { id: true },
    })

    const optionIds = options.map(opt => opt.id)

    // Delete all votes for these options
    if (optionIds.length > 0) {
      await prisma.vote.deleteMany({
        where: { optionId: { in: optionIds } },
      })
    }

    // Delete all options
    await prisma.option.deleteMany({
      where: { pollId },
    })

    // Delete the poll
    await prisma.poll.delete({
      where: { id: pollId },
    })

    return NextResponse.json({ message: "Poll deleted successfully" })
  } catch (error) {
    console.error("Delete poll error:", error)
    return NextResponse.json({ error: "Failed to delete poll" }, { status: 500 })
  }
}

// UPDATE poll
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: pollId } = await params
    const body = await request.json()
    const { title, description, expiresAt, options, deletedOptionIds } = body

    if (!pollId || typeof pollId !== 'string') {
      return NextResponse.json({ error: "Invalid poll ID" }, { status: 400 })
    }

    // Check if poll exists and user owns it
    const existingPoll = await prisma.poll.findUnique({
      where: { id: pollId },
    })

    if (!existingPoll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }

    // Check ownership
    if (existingPoll.userId !== session.user.id) {
      return NextResponse.json({ error: "You can only edit your own polls" }, { status: 403 })
    }

    // Handle option deletions
    if (deletedOptionIds && deletedOptionIds.length > 0) {
      // Delete votes for these options first
      await prisma.vote.deleteMany({
        where: { optionId: { in: deletedOptionIds } },
      })
      
      // Delete the options
      await prisma.option.deleteMany({
        where: { id: { in: deletedOptionIds } },
      })
    }

    // Handle option updates and additions
    if (options && options.length > 0) {
      for (const option of options) {
        if (option.isNew) {
          // Create new option
          await prisma.option.create({
            data: {
              text: option.text,
              pollId,
            },
          })
        } else if (option.id) {
          // Update existing option
          await prisma.option.update({
            where: { id: option.id },
            data: { text: option.text },
          })
        }
      }
    }

    // Update poll
    const updatedPoll = await prisma.poll.update({
      where: { id: pollId },
      data: {
        title,
        description,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      },
      include: {
        options: {
          select: {
            id: true,
            text: true,
            imageUrl: true,
            _count: {
              select: { votes: true }
            }
          }
        },
      },
    })

    return NextResponse.json(updatedPoll)
  } catch (error) {
    console.error("Update poll error:", error)
    return NextResponse.json({ error: "Failed to update poll" }, { status: 500 })
  }
}
