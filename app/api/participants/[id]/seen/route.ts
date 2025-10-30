import { NextRequest, NextResponse } from 'next/server'
import { memoryStore } from '@/lib/memory-store'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Update participant's last seen timestamp
    memoryStore.updateParticipant(id, {
      lastSeenAt: new Date(),
      isOnline: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating last seen:', error)
    return NextResponse.json(
      { error: 'Failed to update last seen' },
      { status: 500 }
    )
  }
}
