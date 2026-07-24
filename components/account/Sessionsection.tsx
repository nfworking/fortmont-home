import { SettingsSection } from "@/components/account/Settingssection";
import { ActiveSessionsCard } from "@/components/account/active-sessions-card";

interface SessionsSectionProps {
  currentSessionId?: string | null;
}

export function SessionsSection({ currentSessionId }: SessionsSectionProps) {
  return (
    <SettingsSection
      tag="Security"
      title="Active sessions"
      description="Devices and browsers currently signed in to your Fortmont account. Revoking a session signs that device out immediately."
    >
      {/* Delegate to the existing ActiveSessionsCard — it already handles the
          session list, current session highlight, and revoke actions. We just
          wrap it in the section layout so the styling stays consistent. */}
      <ActiveSessionsCard currentSessionId={currentSessionId} />
    </SettingsSection>
  );
}