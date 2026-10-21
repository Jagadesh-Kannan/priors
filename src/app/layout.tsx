import type { Metadata, Viewport } from "next";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Priors", template: "%s · Priors" },
  description: "Track household essentials and real prices at Costco and Lowe's.",
  appleWebApp: { capable: true, title: "Priors", statusBarStyle: "default" },
  icons: { icon: "/favicon.png", apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#1f6f50",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
