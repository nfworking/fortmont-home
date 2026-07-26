


import { DataTable } from "@/components/dashboard/data-table";
import { DashboardHero, DashboardPage, DashboardSection } from "@/components/dashboard/page-shell";
import { SectionCards } from "@/components/common/section-cards";
import { SystemStatusPanel } from "@/components/dashboard_res/status";
import TicketOverviewCard from "@/components/dashboard_res/ticket_overview";

export default function Page() {
  return (
    <DashboardPage>
      <DashboardHero
        eyebrow="Fortmont Home"
        title="Dashboard"
        description="Dashboard for your Fortmont registered services"
      />
      <div className=" gap-10 sm:flex flex-row  ">
     
      <SystemStatusPanel />
       <SectionCards />
       <TicketOverviewCard />
      </div>

      <DashboardSection
        title="Infrastructure Overview"
        description="View the status of your Fortmont registered infrastructure."
      >
        <DataTable />
      </DashboardSection>
    </DashboardPage>
  );
}
