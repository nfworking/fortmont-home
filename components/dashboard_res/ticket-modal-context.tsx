"use client";

import * as React from "react";
import { useSession } from "next-auth/react";

import { CreateTicketDialog, CreateTicketFormState } from "@/components/ticketing/admin/create-ticket";
import type { User } from "@/components/ticketing/admin/ticket";
import { withBearerToken } from "@/lib/fetch-auth";

interface TicketModalContextType {
  openTicketModal: () => void;
  closeTicketModal: () => void;
}

const TicketModalContext = React.createContext<TicketModalContextType | undefined>(undefined);

export function TicketModalProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [users, setUsers] = React.useState<User[]>([]);

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(
          `${process.env.API_HOST ?? ""}/api/ticketing/get/users`,
          withBearerToken(undefined, session?.accessToken),
        );

        if (res.ok) {
          const data = await res.json();
          setUsers(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error loading Prisma appUsers into context:", error);
      }
    };

    void fetchUsers();
  }, [session?.accessToken]);

  const openTicketModal = () => setOpen(true);
  const closeTicketModal = () => setOpen(false);

  const handleGlobalSubmit = async (form: CreateTicketFormState) => {
    setIsSubmitting(true);

    try {
      const res = await fetch(`${process.env.API_HOST ?? ""}/api/ticketing/post/ticket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
        },
        body: JSON.stringify({
          type: form.type,
          department: form.department,
          subject: form.subject,
          description: form.description,
          priority: form.priority,
          status: form.status,
          createdById: form.createdById === "unassigned" ? null : form.createdById,
          assignedToId: form.assignedToId === "unassigned" ? null : form.assignedToId,
        }),
      });

      if (!res.ok) {
        throw new Error(`Create failed with ${res.status}`);
      }

      setOpen(false);
    } catch (error) {
      console.error("Global ticket creation failed:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TicketModalContext.Provider value={{ openTicketModal, closeTicketModal }}>
      {children}
      <CreateTicketDialog
        open={open}
        users={users}
        isSubmitting={isSubmitting}
        onOpenChange={setOpen}
        onSubmit={handleGlobalSubmit}
      />
    </TicketModalContext.Provider>
  );
}

export function useTicketModal() {
  const context = React.useContext(TicketModalContext);
  if (!context) throw new Error("useTicketModal must be used within a TicketModalProvider");
  return context;
}