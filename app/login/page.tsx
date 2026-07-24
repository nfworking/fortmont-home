import { signIn } from "@/lib/auth";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9),_rgba(229,231,235,0.45)_40%,_rgba(15,23,42,0.08)_100%)] px-6">
      <div className="w-full max-w-md rounded-3xl border border-border/60 bg-background/80 p-8 shadow-2xl backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Fortmont
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Use your Fortmont account to access the dashboard and administrative tools.
        </p>

        <form
          action={async () => {
            "use server";
            await signIn("fortmont", { redirectTo: "/dashboard" });
          }}
        >
          <button
            type="submit"
            className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Continue with Fortmont
          </button>
        </form>
      </div>
    </main>
  );
}