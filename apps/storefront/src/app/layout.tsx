import { getBaseURL } from "@lib/util/env"
import { ThemeProvider } from "@modules/common/components/theme-provider"
import { Metadata } from "next"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-ui-bg-base text-ui-fg-base antialiased">
        <ThemeProvider>
          <main className="relative min-h-screen">{props.children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
