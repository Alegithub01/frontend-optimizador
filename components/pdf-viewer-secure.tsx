"use client"

interface PDFViewerSecureProps {
  src: string
  title?: string
  className?: string
}

export default function PDFViewerSecure({ src, title, className }: PDFViewerSecureProps) {
  // Función para convertir URL de Drive a formato preview
  const convertDriveUrl = (url: string) => {
    try {
      if (url.includes("drive.google.com")) {
        // Extraer el ID del archivo
        let fileId = ""

        if (url.includes("/file/d/")) {
          fileId = url.split("/file/d/")[1].split("/")[0]
        } else if (url.includes("id=")) {
          fileId = url.split("id=")[1].split("&")[0]
        }

        if (fileId) {
          // Convertir a formato preview
          return `https://drive.google.com/file/d/${fileId}/preview`
        }
      }
      return url
    } catch (error) {
      console.error("Error converting Drive URL:", error)
      return url
    }
  }

  const previewUrl = convertDriveUrl(src)

  return (
    <div className={`relative ${className}`}>
      <iframe
        src={previewUrl}
        className="w-full h-full border-0"
        title={title}
        sandbox="allow-same-origin allow-scripts"
        style={{
          pointerEvents: "auto",
          userSelect: "none",
        }}
        onContextMenu={(e) => e.preventDefault()}
        onError={(e) => {
          console.error("Error loading PDF:", e)
        }}
      />

      {/* Overlay para prevenir clic derecho */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
        onContextMenu={(e) => e.preventDefault()}
      />

      <style jsx global>{`
        /* Optimización para visualización de PDF */
        iframe {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        /* Deshabilitar menú contextual */
        * {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        input, textarea, button {
          -webkit-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
          user-select: text;
        }
      `}</style>
    </div>
  )
}
