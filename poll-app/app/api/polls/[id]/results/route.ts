import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id: pollId } = await params
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get poll and check ownership
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          include: {
            votes: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }

    // Only poll owner can see detailed results
    if (poll.userId !== session.user.id) {
      return NextResponse.json({ error: "You can only view detailed results for your own polls" }, { status: 403 })
    }

    // Format results
    const results = poll.options.flatMap(option => 
      option.votes.map(vote => ({
        voter: vote.user.name || vote.user.email,
        email: vote.user.email,
        option: option.text,
        votedAt: vote.createdAt
      }))
    )

    return NextResponse.json({
      pollTitle: poll.title,
      totalVotes: results.length,
      results
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 })
  }
}

// Export as CSV
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id: pollId } = await params
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get poll and check ownership
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          include: {
            votes: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  }
                }
              },
              orderBy: {
                createdAt: 'asc'
              }
            }
          }
        }
      }
    })

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }

    // Only poll owner can export
    if (poll.userId !== session.user.id) {
      return NextResponse.json({ error: "You can only export your own polls" }, { status: 403 })
    }

    // Generate CSV
    const csvRows = [
      ['Poll Title', poll.title],
      ['Total Votes', poll.options.reduce((sum, opt) => sum + opt.votes.length, 0).toString()],
      ['Exported At', new Date().toISOString()],
      [], // Empty row
      ['Voter Name', 'Email', 'Selected Option', 'Voted At']
    ]

    // Add vote data
    poll.options.forEach(option => {
      option.votes.forEach(vote => {
        csvRows.push([
          vote.user?.name || 'Anonymous',
          vote.user?.email || 'N/A',
          option.text,
          new Date(vote.createdAt).toLocaleString()
        ])
      })
    })

    // Convert to CSV string
    const csv = csvRows.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="poll-results-${pollId}.csv"`
      }
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to export CSV" }, { status: 500 })
  }
}
