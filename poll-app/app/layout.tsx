import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import ClientLayout from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "PollMitra - Your Voice Matters",
  description: "Create polls, vote, and engage with the community. Real-time results, beautiful themes, and mobile-friendly.",
  icons: {
    icon: '/WhatsApp Image 2025-11-21 at 19.35.41.jpeg',
    apple: '/WhatsApp Image 2025-11-21 at 19.35.41.jpeg',
  },
  openGraph: {
    title: "PollMitra - Your Voice Matters",
    description: "Create polls, vote, and engage with the community. Real-time results, beautiful themes, and mobile-friendly.",
    type: "website",
    images: [
      {
        url: '/WhatsApp Image 2025-11-21 at 19.35.41.jpeg',
        width: 1200,
        height: 630,
        alt: 'PollMitra Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "PollMitra - Your Voice Matters",
    description: "Create polls, vote, and engage with the community",
    images: ['/WhatsApp Image 2025-11-21 at 19.35.41.jpeg'],
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
