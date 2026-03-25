import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProviders from "@/provider/QueryProviders";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Skill Map",
  description: "Developer Portfolio with Peer Verification & Trust Graph",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProviders>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                fontSize: "14px",
                maxWidth: "400px",
              },
              success: {
                iconTheme: {
                  primary: "#4f46e5",
                  secondary: "#fff",
                },
              },
            }}
          />
        </QueryProviders>
      </body>
    </html>
  );
}
