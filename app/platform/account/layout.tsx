
import { auth } from "@/lib/auth";
import {SessionProvider} from "next-auth/react"
import {ThemeToggle} from "@/components/common/theme-toggle";
import { Toaster } from "@/components/ui/sonner";


export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const session = await auth();
    if (!session?.user?.id) {
      const { redirect } = await import("next/navigation");
      redirect("/login");
    }
  return (

      <div className="relative min-h-screen w-full">
       
            <SessionProvider session={session}>
      
       {children}

      
     
      </SessionProvider>
      
    </div>
    
  );
}