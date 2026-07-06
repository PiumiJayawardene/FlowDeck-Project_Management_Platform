import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import type { Comment } from "@/types/task.types"
import { useAuth } from "@/context/AuthContext"
import { addComment, deleteComment } from "@/services/taskService"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { X } from "lucide-react"

interface CommentThreadProps {
  taskId: string
  comments: Comment[]
  onCommentsChange: () => void
}

export default function CommentThread({
  taskId,
  comments,
  onCommentsChange,
}: CommentThreadProps) {
  const { user } = useAuth()
  const [text, setText] = useState("")
  const [posting, setPosting] = useState(false)

  const handlePost = async () => {
    if (text.trim().length < 1) return
    setPosting(true)
    try {
      await addComment(taskId, text.trim())
      setText("")
      onCommentsChange()
    } finally {
      setPosting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    await deleteComment(taskId, commentId)
    onCommentsChange()
  }

  return (
    <div className="space-y-3 border-t border-border pt-3">
      <p className="text-xs font-medium text-muted-foreground">
        Comments ({comments.length})
      </p>

      {comments.map((comment) => (
        <div key={comment._id} className="flex items-start gap-2">
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {comment.authorId.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 rounded-xl bg-muted/50 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-foreground">
                {comment.authorId.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
                {comment.authorId._id === user?.id && (
                  <button
                    onClick={() => handleDelete(comment._id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
            <p className="mt-1 text-sm text-foreground">{comment.text}</p>
          </div>
        </div>
      ))}

      <div className="flex gap-2">
        <Textarea
          placeholder="Write a comment..."
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="min-h-16 resize-none"
        />
      </div>
      <div className="flex justify-end">
        <Button size="sm" onClick={handlePost} disabled={posting || text.trim().length < 1}>
          {posting ? "Posting..." : "Post comment"}
        </Button>
      </div>
    </div>
  )
}