"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AccountSettingsFormProps {
  user: {
    id: string;
    displayName?: string | null;
    email?: string | null;
    phone?: string | null;
    avatarUrl?: string | null;
  };
  hasMailbox: boolean;
}

export function AccountSettingsForm({ user, hasMailbox }: AccountSettingsFormProps) {
  const [displayName, setDisplayName] = useState(user.displayName ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Display name</label>
          <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Phone</label>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        <span>Mailbox provisioning status</span>
        <span className="font-medium text-foreground">{hasMailbox ? "Enabled" : "Pending"}</span>
      </div>

      <Button type="button" variant="default">
        Save changes
      </Button>
    </div>
  );
}
