"use client"

import { useState, ChangeEvent } from "react"

const ImageUploader = () => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="border p-2 rounded"
      />

      {previewUrl && (
        <img
          src={previewUrl}
          alt="Vista previa"
          className="max-w-xs rounded-lg shadow-lg"
        />
      )}
    </div>
  )
}

export default ImageUploader
