import Image from "next/image"

interface CategoryCardProps {
  title: string
  icon: string
  color: string
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right"
}

export default function CategoryCard({ title, icon, color, position }: CategoryCardProps) {
  const cornerPositions = {
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0",
    "bottom-left": "bottom-0 left-0",
    "bottom-right": "bottom-0 right-0",
  }

  return (
    <div className="relative flex flex-col items-center justify-center p-6 md:p-8 rounded-lg bg-black bg-opacity-50 h-48 md:h-60">
      <div className={`absolute w-8 h-8 md:w-12 md:h-12 ${cornerPositions[position]}`}>
        <div
          className={`absolute w-0 h-0 ${
            position === "top-left" || position === "bottom-left"
              ? "border-l-[32px] md:border-l-[48px]"
              : "border-r-[32px] md:border-r-[48px]"
          } ${
            position === "top-left" || position === "top-right"
              ? "border-t-[32px] md:border-t-[48px]"
              : "border-b-[32px] md:border-b-[48px]"
          } border-transparent ${
            position === "top-left"
              ? "border-l-gradient-br"
              : position === "top-right"
                ? "border-r-gradient-bl"
                : position === "bottom-left"
                  ? "border-l-gradient-tr"
                  : "border-r-gradient-tl"
          } bg-gradient-to-br ${color}`}
        ></div>
      </div>

      <div className="relative w-12 h-12 md:w-16 md:h-16 mb-3 md:mb-4">
        <Image src={icon || "/placeholder.svg"} alt={title} fill className="object-contain" />
      </div>

      <h3 className="text-lg md:text-xl font-semibold text-white text-center">{title}</h3>
    </div>
  )
}
