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
      <ActiveSessionsCard currentSessionId={currentSessionId} />
    </SettingsSection>
  );
}