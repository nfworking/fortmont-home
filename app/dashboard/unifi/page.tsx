import { DashboardHero, DashboardPage, DashboardSection } from "@/components/dashboard/page-shell";
import { UnifiDashboard } from "@/components/unifi/dashboard";

export default function ServerSettingsPage() {
    return (
        <DashboardPage>
            <DashboardHero className="bg-black text-center flex items-center justify-center flex-col gap-2"
                eyebrow="Unifi"
                title=""
                description="Configuration and registry tools for the Fortmont Unifi integration."
            />
            
                <UnifiDashboard />
   
        </DashboardPage>
    );
}