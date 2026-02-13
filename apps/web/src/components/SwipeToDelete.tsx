'use client'

import { useRef, useState, useCallback, type ReactNode } from 'react'

interface SwipeToDeleteProps {
  children: ReactNode
  onDelete: () => void
}

const THRESHOLD = 80

export function SwipeToDelete({ children, onDelete }: SwipeToDeleteProps) {
  const [offsetX, setOffsetX] = useState(0)
  const [open, setOpen] = useState(false)
  const startX = useRef(0)
  const dragging = useRef(false)

  const handleStart = useCallback((x: number) => {
    startX.current = x
    dragging.current = true
  }, [])

  const handleMove = useCallback(
    (x: number) => {
      if (!dragging.current) return
      const diff = x - startX.current
      if (open) {
        // 開いた状態から右に戻す
        const next = Math.min(0, -THRESHOLD + diff)
        setOffsetX(next)
      } else {
        // 左スワイプのみ
        const next = Math.min(0, diff)
        setOffsetX(next)
      }
    },
    [open]
  )

  const handleEnd = useCallback(() => {
    dragging.current = false
    if (Math.abs(offsetX) >= THRESHOLD) {
      setOffsetX(-THRESHOLD)
      setOpen(true)
    } else {
      setOffsetX(0)
      setOpen(false)
    }
  }, [offsetX])

  return (
    <div className="swipe-container">
      <div className="swipe-action" onClick={onDelete}>
        削除
      </div>
      <div
        className="swipe-content"
        style={{ transform: `translateX(${offsetX}px)` }}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
        onMouseDown={(e) => handleStart(e.clientX)}
        onMouseMove={(e) => handleMove(e.clientX)}
        onMouseUp={handleEnd}
        onMouseLeave={() => {
          if (dragging.current) handleEnd()
        }}
      >
        {children}
      </div>
    </div>
  )
}
