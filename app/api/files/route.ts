import { NextResponse } from "next/server"
import { writeFile, unlink, access, mkdir } from "fs/promises"
import { constants as fsConstants } from "fs"
import path from "path"
import { exec } from "child_process"

const UPLOAD_DIR = path.join(process.cwd(), "public", "optikids", "descargable")

// Ensure directory exists
async function ensureDirExists(dirPath: string) {
  try {
    await access(dirPath, fsConstants.F_OK)
  } catch (error: any) {
    if (error?.code === "ENOENT") {
      await mkdir(dirPath, { recursive: true })
    } else {
      throw error
    }
  }
}

// Sanitize a filename to prevent path traversal and remove unsafe chars
function sanitizeFilename(name: string) {
  const base = path.basename(name) // strips any directories
  // Allow letters, numbers, dot, underscore, dash. Replace others with underscore.
  const safe = base.replace(/[^a-zA-Z0-9._-]/g, "_")
  // Prevent hidden files creation like ".env" unless intended
  if (safe === "" || safe === "." || safe === "..") {
    return `file_${Date.now()}`
  }
  return safe
}

export async function POST(request: Request) {
  try {
    await ensureDirExists(UPLOAD_DIR)

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const oldFilePath = (formData.get("oldFilePath") as string | null) || null

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 })
    }

    // Keep original filename (sanitized)
    const safeName = sanitizeFilename(file.name)
    const savePath = path.join(UPLOAD_DIR, safeName)
    const publicPath = `/optikids/descargable/${safeName}`

    // If an old file path was provided, try to delete it
    if (oldFilePath) {
      const absoluteOldPath = path.join(process.cwd(), "public", oldFilePath)
      try {
        await unlink(absoluteOldPath)
        console.log(`Old file deleted: ${absoluteOldPath}`)
      } catch (deleteError: any) {
        if (deleteError?.code === "ENOENT") {
          console.warn(`Old file not found, skipping deletion: ${absoluteOldPath}`)
        } else {
          console.error(`Error deleting old file ${absoluteOldPath}:`, deleteError)
          // Continue with upload even if deletion fails
        }
      }
    }

    // Save new file (overwrite if it already exists to strictly keep the same name)
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(savePath, buffer)
    console.log(`File uploaded to: ${savePath}`)

    exec("pm2 restart frontend-optimizador", (error, stdout, stderr) => {
      if (error) {
        console.error(`Error restarting PM2: ${error.message}`)
        return
      }
      if (stderr) console.error(`PM2 stderr: ${stderr}`)
      console.log(`PM2 stdout: ${stdout}`)
    })

    // Return the public path to access the file
    return NextResponse.json({ filePath: publicPath }, { status: 200 }) // Uses NextResponse.json to produce a JSON response. [^1]
  } catch (error: any) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: "Failed to upload file.", details: error?.message ?? String(error) },
      { status: 500 },
    )
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
      if (error?.code === "ENOENT") {
        return NextResponse.json({ error: "File not found." }, { status: 404 })
      }
      console.error(`Error deleting file ${absolutePath}:`, error)
      return NextResponse.json(
        { error: "Failed to delete file.", details: error?.message ?? String(error) },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Error parsing request for file deletion:", error)
    return NextResponse.json(
      { error: "Invalid request body.", details: error?.message ?? String(error) },
      { status: 400 },
    )
  }
}
