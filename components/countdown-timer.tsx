"use client"

import { useState, useEffect } from "react"

interface CountdownTimerProps {
  targetDate: string // Formato: "2024-05-10T10:00:00"
  className?: string
}

export default function CountdownTimer({ targetDate, className = "" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(targetDate).getTime()
      const now = new Date().getTime()
      const difference = target - now

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeLeft({ days, hours, minutes, seconds })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    // Calcular inmediatamente
    calculateTimeLeft()

    // Actualizar cada segundo
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  return (
    <div className={`flex justify-center ${className}`}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-gray-900 text-white p-2 sm:p-3 rounded-xl text-center min-w-[60px] sm:min-w-[70px]">
          <div className="text-xl sm:text-2xl font-bold">{timeLeft.days}</div>
          <div className="text-xs uppercase tracking-wide">Días</div>
        </div>
        <div className="bg-gray-900 text-white p-2 sm:p-3 rounded-xl text-center min-w-[60px] sm:min-w-[70px]">
          <div className="text-xl sm:text-2xl font-bold">{timeLeft.hours}</div>
          <div className="text-xs uppercase tracking-wide">Horas</div>
        </div>
        <div className="bg-gray-900 text-white p-2 sm:p-3 rounded-xl text-center min-w-[60px] sm:min-w-[70px]">
          <div className="text-xl sm:text-2xl font-bold">{timeLeft.minutes}</div>
          <div className="text-xs uppercase tracking-wide">Minutos</div>
        </div>
        <div className="bg-gray-900 text-white p-2 sm:p-3 rounded-xl text-center min-w-[60px] sm:min-w-[70px]">
          <div className="text-xl sm:text-2xl font-bold">{timeLeft.seconds}</div>
          <div className="text-xs uppercase tracking-wide">Segundos</div>
        </div>
      </div>
    </div>
  )
}
