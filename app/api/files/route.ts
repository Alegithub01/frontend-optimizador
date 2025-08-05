import { NextResponse } from "next/server"
import { writeFile, unlink, access, mkdir } from "fs/promises"
import path from "path"
// No longer importing uuid, using native crypto.randomUUID()
import { webcrypto } from "crypto" // Import webcrypto for randomUUID

const UPLOAD_DIR = path.join(process.cwd(), "public", "optikids", "descargable")

// Helper to ensure directory exists
async function ensureDirExists(dirPath: string) {
  try {
    await access(dirPath)
  } catch (error: any) {
    if (error.code === "ENOENT") {
      await mkdir(dirPath, { recursive: true })
    } else {
      throw error
    }
  }
}

export async function POST(request: Request) {
  try {
    await ensureDirExists(UPLOAD_DIR)

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const oldFilePath = formData.get("oldFilePath") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 })
    }

    const fileExtension = path.extname(file.name)
    const uniqueFileName = `${webcrypto.randomUUID()}${fileExtension}` // Using native crypto.randomUUID()
    const filePath = path.join(UPLOAD_DIR, uniqueFileName)
    const publicPath = `/optikids/descargable/${uniqueFileName}`

    // Delete old file if provided
    if (oldFilePath) {
      const absoluteOldPath = path.join(process.cwd(), "public", oldFilePath)
      try {
        await unlink(absoluteOldPath)
        console.log(`Old file deleted: ${absoluteOldPath}`)
      } catch (deleteError: any) {
        if (deleteError.code === "ENOENT") {
          console.warn(`Old file not found, skipping deletion: ${absoluteOldPath}`)
        } else {
          console.error(`Error deleting old file ${absoluteOldPath}:`, deleteError)
          // Don't block upload if old file deletion fails
        }
      }
    }

    // Save new file
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)
    console.log(`File uploaded to: ${filePath}`)

    return NextResponse.json({ filePath: publicPath }, { status: 200 })
  } catch (error: any) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file.", details: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { filePath } = await request.json()

    if (!filePath) {
      return NextResponse.json({ error: "File path is required." }, { status: 400 })
    }

    const absolutePath = path.join(process.cwd(), "public", filePath)

    try {
      await unlink(absolutePath)
      console.log(`File deleted: ${absolutePath}`)
      return NextResponse.json({ message: "File deleted successfully." }, { status: 200 })
    } catch (error: any) {
      if (error.code === "ENOENT") {
        return NextResponse.json({ error: "File not found." }, { status: 404 })
      }
      console.error(`Error deleting file ${absolutePath}:`, error)
      return NextResponse.json({ error: "Failed to delete file.", details: error.message }, { status: 500 })
    }
  } catch (error: any) {
    console.error("Error parsing request for file deletion:", error)
    return NextResponse.json({ error: "Invalid request body.", details: error.message }, { status: 400 })
  }
}
