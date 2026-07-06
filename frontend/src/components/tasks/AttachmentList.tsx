import { useRef, useState } from "react"
import type { Attachment } from "@/types/task.types"
import { useAuth } from "@/context/AuthContext"
import { uploadAttachment, deleteAttachment } from "@/services/taskService"
import { Button } from "@/components/ui/button"
import { Paperclip, FileText, Image, X } from "lucide-react"

interface AttachmentListProps {
  taskId: string
  attachments: Attachment[]
  onAttachmentsChange: () => void
}

export default function AttachmentList({
  taskId,
  attachments,
  onAttachmentsChange,
}: AttachmentListProps) {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File must be under 10MB")
      return
    }

    setUploading(true)
    setUploadError(null)
    try {
      await uploadAttachment(taskId, file)
      onAttachmentsChange()
    } catch (error: any) {
      setUploadError(error?.response?.data?.message || "Upload failed")
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDelete = async (attachmentId: string) => {
    await deleteAttachment(taskId, attachmentId)
    onAttachmentsChange()
  }

  return (
    <div className="space-y-3 border-t border-border pt-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          Attachments ({attachments.length})
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Paperclip className="mr-2 h-3 w-3" />
          {uploading ? "Uploading..." : "Attach file"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.txt"
        />
      </div>

      {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}

      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => {
            const isImage = attachment.fileType.startsWith("image/")
            return (
              <div
  key={attachment._id}
  className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2"
>
  <a
    href={attachment.url}
    target="_blank"
    rel="noopener noreferrer"
    className="flex flex-1 items-center gap-2 text-sm text-foreground hover:text-primary"
  >
    {isImage ? (
      <Image className="h-4 w-4 shrink-0" />
    ) : (
      <FileText className="h-4 w-4 shrink-0" />
    )}

    <span className="truncate">{attachment.fileName}</span>
  </a>

  {attachment.uploadedBy._id === user?.id && (
    <button
      onClick={() => handleDelete(attachment._id)}
      className="text-muted-foreground hover:text-destructive"
    >
      <X className="h-3 w-3" />
    </button>
  )}
</div>
            )
          })}
        </div>
      )}
    </div>
  )
}