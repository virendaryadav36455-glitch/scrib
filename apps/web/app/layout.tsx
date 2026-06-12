import MobileDesktopGate from "~/components/MobileDesktopGate";
import { GlobalProviders } from "~/providers/global";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Your standard meta, links, fonts */}
      </head>
      {/* Set a dark/neutral desktop matte background color here */}
      <body style={{ margin: 0, padding: 0, backgroundColor: "#1e1a15", minHeight: "100vh" }}>
        <GlobalProviders>
          <MobileDesktopGate>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", width: "100%" }}>
            {children}
          </div>
          </MobileDesktopGate>
        </GlobalProviders>
      </body>
    </html>
  );
}