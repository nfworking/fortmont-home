"use client"

import * as React from "react"
import { Loader2, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export interface ComposeEmailDraft {
  to: string
  subject: string
  body: string
}

interface ComposeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  draft: ComposeEmailDraft
  onDraftChange: (draft: ComposeEmailDraft) => void
  onSend: (draft: ComposeEmailDraft) => Promise<void>
  sending: boolean
  sendError: string | null
  sendSuccess: boolean
}

export function ComposeDialog({
  open,
  onOpenChange,
  draft,
  onDraftChange,
  onSend,
  sending,
  sendError,
  sendSuccess,
}: ComposeDialogProps) {
  const canSend = draft.to.trim().length > 0 && draft.body.trim().length > 0

  function updateDraft<K extends keyof ComposeEmailDraft>(key: K, value: ComposeEmailDraft[K]) {
    onDraftChange({ ...draft, [key]: value })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!canSend || sending) return
    await onSend(draft)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden p-0" showCloseButton={false}>
        <div className="border-b border-border/60 bg-gradient-to-r from-sky-500/10 via-transparent to-emerald-500/10 px-6 py-4">
          <DialogHeader>
            <DialogTitle className="text-lg">New Message</DialogTitle>
            <DialogDescription>
              Compose and send from your Fortmont mailbox.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div className="space-y-1.5">
            <Label htmlFor="compose-to" className="text-xs uppercase tracking-wide text-muted-foreground">
              To
            </Label>
            <Input
              id="compose-to"
              value={draft.to}
              onChange={(e) => updateDraft("to", e.target.value)}
              placeholder="recipient@domain.com"
              autoFocus
              disabled={sending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="compose-subject" className="text-xs uppercase tracking-wide text-muted-foreground">
              Subject
            </Label>
            <Input
              id="compose-subject"
              value={draft.subject}
              onChange={(e) => updateDraft("subject", e.target.value)}
              placeholder="Subject"
              disabled={sending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="compose-message" className="text-xs uppercase tracking-wide text-muted-foreground">
              Message
            </Label>
            <Textarea
              id="compose-message"
              value={draft.body}
              onChange={(e) => updateDraft("body", e.target.value)}
              placeholder="Write your message..."
              rows={12}
              disabled={sending}
              className="min-h-56 resize-y"
            />
          </div>

          {sendError && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {sendError}
            </p>
          )}

          {sendSuccess && (
            <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400">
              Message sent successfully.
            </p>
          )}

          <DialogFooter className="-mx-6 -mb-5 mt-2 rounded-none border-t border-border/60 bg-muted/20 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSend || sending} className="min-w-28">
              {sending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Sending
                </>
              ) : (
                <>
                  <Send className="mr-2 size-4" />
                  Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
