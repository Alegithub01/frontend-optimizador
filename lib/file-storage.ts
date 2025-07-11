import { promises as fs } from "fs"
import path from "path"

const DATA_DIR = path.join(process.cwd(), "data")

// Asegurar que el directorio data existe
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

export async function readJsonFile<T>(filename: string, defaultData: T): Promise<T> {
  try {
    await ensureDataDir()
    const filePath = path.join(DATA_DIR, filename)
    const data = await fs.readFile(filePath, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.log(`File ${filename} not found, using default data`)
    return defaultData
  }
}

export async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  try {
    await ensureDataDir()
    const filePath = path.join(DATA_DIR, filename)
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8")
    console.log(`✅ Successfully saved ${filename}`)
  } catch (error) {
    console.error(`❌ Error saving ${filename}:`, error)
    throw error
  }
}
