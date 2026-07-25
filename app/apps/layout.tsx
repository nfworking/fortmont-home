import  DashboardPage  from "@/components/apps/application-shell2";

import { DashboardBackground } from "@/components/dashboard_res/background";

export default async function AppsLayout({
     
    }) {
  
  return (
    <div className="relative min-h-screen w-full">

      <div className="fixed inset-0 -z-10">
    <DashboardBackground />
      </div>

    
      <DashboardPage/>
        

    </div>
  );
}