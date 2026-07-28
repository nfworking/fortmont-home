"use client"

import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { Email, FolderType, MailboxResponse, UserSession } from "@/components/mail/mail"
import { getEmailContact, extractEmail, extractName, formatFullDate } from "@/components/mail/formatters"
import { Sidebar } from "@/components/mail/Sidebar"
import { EmailList } from "@/components/mail/EmailList"
import { ReadingPane } from "@/components/mail/ReadingPane"
import { ComposeDialog, ComposeEmailDraft } from "@/components/mail/ComposeDialog"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { withBearerToken } from "@/lib/fetch-auth"

interface SendEmailPayload {
  to: string
  subject: string
  text: string
}

export default function MailClient() {
  const { data: authSession } = useSession()
  const [session,       setSession]       = useState<UserSession | null>(null)
  const [mailbox,       setMailbox]       = useState<MailboxResponse | null>(null)
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [activeFolder,  setActiveFolder]  = useState<FolderType>("inbox")
  const [loading,       setLoading]       = useState(true)
  const [emailsLoading, setEmailsLoading] = useState(false)
  const [searchQuery,   setSearchQuery]   = useState("")
  const [activeTab,     setActiveTab]     = useState<"all" | "unread">("all")
  const [muteThread,    setMuteThread]    = useState(false)

  const [replyTo,      setReplyTo]      = useState("")
  const [replySubject, setReplySubject] = useState("")
  const [replyBody,    setReplyBody]    = useState("")
  const [sending,      setSending]      = useState(false)
  const [sendError,    setSendError]    = useState<string | null>(null)
  const [sendSuccess,  setSendSuccess]  = useState(false)
  const [composeOpen,  setComposeOpen]  = useState(false)
  const [composeDraft, setComposeDraft] = useState<ComposeEmailDraft>({ to: "", subject: "", body: "" })
  const [composeSending, setComposeSending] = useState(false)
  const [composeError, setComposeError] = useState<string | null>(null)
  const [composeSuccess, setComposeSuccess] = useState(false)

  const replyRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    async function fetchSession() {
      try {
        if (!authSession?.user) {
          setLoading(false)
          return
        }

        setSession(authSession as UserSession)
        fetchEmails("inbox")
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchSession()
  }, [authSession])

  useEffect(() => {
    if (!selectedEmail) return

    const timerId = window.setTimeout(() => {
      const contact = getEmailContact(selectedEmail, activeFolder)
      setReplyTo(extractEmail(contact))
      setReplySubject(`Re: ${selectedEmail.subject}`)
      setReplyBody("")
      setSendError(null)
      setSendSuccess(false)
      setMuteThread(false)
    }, 0)

    return () => window.clearTimeout(timerId)
  }, [selectedEmail, activeFolder])

  async function fetchEmails(folder: FolderType) {
    setEmailsLoading(true)
    setSelectedEmail(null)
    try {
      const endpointMap: Record<FolderType, string> = {
        inbox:   `${process.env.NEXT_PUBLIC_API_HOST}/api/mailbox/inbox`,
        sent:    `${process.env.NEXT_PUBLIC_API_HOST}/api/mailbox/send/get`,
        drafts:  `${process.env.NEXT_PUBLIC_API_HOST}/api/mailbox/drafts`,
        starred: `${process.env.NEXT_PUBLIC_API_HOST}/api/mailbox/starred`,
        archive: `${process.env.NEXT_PUBLIC_API_HOST}/api/mailbox/archive`,
        trash:   `${process.env.NEXT_PUBLIC_API_HOST}/api/mailbox/trash`,
      }
      const res = await fetch(endpointMap[folder], withBearerToken(undefined, authSession?.accessToken))
      if (res.ok) setMailbox(await res.json())
      else setMailbox({ mailbox: "", count: 0, emails: [] })
    } catch (e) {
      console.error(e)
      setMailbox({ mailbox: "", count: 0, emails: [] })
    } finally {
      setEmailsLoading(false)
    }
  }

  function handleFolderChange(folder: FolderType) {
    if (folder !== activeFolder) {
      setActiveFolder(folder)
      fetchEmails(folder)
    }
  }

  async function sendEmail(payload: SendEmailPayload): Promise<void> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/mailbox/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      ...withBearerToken(undefined, authSession?.accessToken),
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({})) as { error?: string }
      throw new Error(data.error || "Failed to send")
    }
  }

  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault()
    if (!replyTo.trim()) { setSendError("No recipient address"); return }
    if (!replyBody.trim()) { setSendError("Message body is empty"); return }
    setSending(true)
    setSendError(null)
    setSendSuccess(false)
    try {
      await sendEmail({
        to: replyTo.trim(),
        subject: replySubject.trim(),
        text: replyBody,
      })
      setSendSuccess(true)
      setReplyBody("")
      if (activeFolder === "sent") fetchEmails("sent")
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Failed to send")
    } finally {
      setSending(false)
    }
  }

  async function handleSendCompose(draft: ComposeEmailDraft): Promise<void> {
    if (!draft.to.trim()) {
      setComposeError("Recipient is required")
      return
    }
    if (!draft.body.trim()) {
      setComposeError("Message body is empty")
      return
    }

    setComposeSending(true)
    setComposeError(null)
    setComposeSuccess(false)

    try {
      await sendEmail({
        to: draft.to.trim(),
        subject: draft.subject.trim(),
        text: draft.body,
      })

      setComposeSuccess(true)
      setComposeDraft({ to: "", subject: "", body: "" })
      if (activeFolder === "sent") fetchEmails("sent")

      window.setTimeout(() => {
        setComposeOpen(false)
        setComposeSuccess(false)
      }, 700)
    } catch (err) {
      setComposeError(err instanceof Error ? err.message : "Failed to send")
    } finally {
      setComposeSending(false)
    }
  }

  function handleComposeOpenChange(open: boolean) {
    setComposeOpen(open)
    if (open) {
      setComposeError(null)
      setComposeSuccess(false)
      return
    }

    if (!composeSending) {
      setComposeError(null)
      setComposeSuccess(false)
    }
  }

  function openForwardCompose(email: Email) {
    const contact = getEmailContact(email, activeFolder)
    setReplyTo("")
    setReplySubject(`Fwd: ${email.subject}`)
    setReplyBody(`\n\n— Forwarded from ${extractName(contact)} on ${formatFullDate(email.date)} —\n${email.body.text}`)
    replyRef.current?.focus()
  }

  const emails = mailbox?.emails ?? []

  const filteredEmails = emails.filter((email) => {
    const contact = getEmailContact(email, activeFolder)
    const matchesSearch =
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.body.text.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === "all" || !email.flags?.seen
    return matchesSearch && matchesTab
  })

  const unreadCount = emails.filter((e) => !e.flags?.seen).length

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-transparent flex-col gap-3">
        <Mail className="size-6 text-muted-foreground animate-pulse" />
        <p className="text-[10px] tracking-widest text-muted-foreground uppercase font-mono">Loading</p>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-transparent flex-col gap-6 px-4">
        <div className="flex size-14 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
          <Mail className="size-6 text-foreground" />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-semibold text-foreground">Webmail</h1>
          <p className="text-sm text-muted-foreground mt-2">Sign in to access your mailbox</p>
        </div>
        <Button
          onClick={() => (window.location.href = "/login?callbackUrl=/mail")}
          className="h-9 px-6"
        >
          Sign in
        </Button>
      </div>
    )
  }

  const userName = session.user.name || extractName(session.user.email || "")
  const selectedContact = selectedEmail ? getEmailContact(selectedEmail, activeFolder) : ""
  const selectedName = selectedEmail ? extractName(selectedContact) : ""

  return (
    <div className="flex h-screen bg-transparent text-foreground font-sans overflow-hidden">
      <Sidebar
        userName={userName}
        activeFolder={activeFolder}
        unreadCount={unreadCount}
        onFolderChange={handleFolderChange}
        onCompose={() => setComposeOpen(true)}
      />

      <EmailList
        activeFolder={activeFolder}
        emailsLoading={emailsLoading}
        filteredEmails={filteredEmails}
        selectedEmail={selectedEmail}
        searchQuery={searchQuery}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setSearchQuery={setSearchQuery}
        setSelectedEmail={setSelectedEmail}
        onRefresh={() => fetchEmails(activeFolder)}
      />

      <ReadingPane
        selectedEmail={selectedEmail}
        selectedName={selectedName}
        selectedContact={selectedContact}
        replyBody={replyBody}
        sending={sending}
        sendError={sendError}
        sendSuccess={sendSuccess}
        muteThread={muteThread}
        replyRef={replyRef}
        setReplyBody={setReplyBody}
        setMuteThread={setMuteThread}
        handleSendReply={handleSendReply}
        openForwardCompose={openForwardCompose}
      />

      <ComposeDialog
        open={composeOpen}
        onOpenChange={handleComposeOpenChange}
        draft={composeDraft}
        onDraftChange={setComposeDraft}
        onSend={handleSendCompose}
        sending={composeSending}
        sendError={composeError}
        sendSuccess={composeSuccess}
      />
    </div>
  )
}