import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import ClientLayout from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "PollApp - Create and Vote on Polls",
  description: "Create polls, vote, and discuss with the community",
  openGraph: {
    title: "PollApp - Create and Vote on Polls",
    description: "Create polls, vote, and discuss with the community",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </SessionProvider>
      </body>
    </html>
  );
}
