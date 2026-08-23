import { SignInForm } from "@/components/sign-in-form";

// Every CMS route depends on client-side auth state — never statically prerender.
export const dynamic = "force-dynamic";

export default function SignInPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-narrative-light px-6 py-16">
      <SignInForm />
    </main>
  );
}
