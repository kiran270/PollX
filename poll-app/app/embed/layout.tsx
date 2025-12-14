import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PollMitra - Embedded Poll',
  robots: 'noindex, nofollow',
}

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="robots" content="noindex, nofollow" />
        <style dangerouslySetInnerHTML={{
          __html: `
            body { margin: 0; padding: 0; }
            .embed-layout { width: 100%; height: 100vh; }
          `
        }} />
      </head>
      <body>
        <div className="embed-layout">
          {children}
        </div>
      </body>
    </html>
  )
}