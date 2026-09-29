import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "../lib/wallet-context";

export const metadata: Metadata = {
  title: "Trestly — Escrow for x402 Payments on Stellar",
  description:
    "Trestly adds a dispute-aware escrow layer to x402 payments on Stellar. Agents pay. Services deliver. Funds settle only when the window closes.",
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon', type: 'image/png', sizes: '32x32' },
    ],
    apple: [
      { url: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: "Trestly — Escrow for x402 Payments on Stellar",
    description:
      "Dispute-aware escrow for x402 payments. Built on Stellar and powered by Soroban.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
