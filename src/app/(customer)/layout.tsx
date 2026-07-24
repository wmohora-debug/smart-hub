import * as React from "react";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
      {/* Centered responsive viewport container with mobile safe-area insets */}
      <div className="mx-auto min-h-screen w-full max-w-4xl border-x bg-background shadow-subtle flex flex-col pb-24">
        {children}
      </div>
    </div>
  );
}
