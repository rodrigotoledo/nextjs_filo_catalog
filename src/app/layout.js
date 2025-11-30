import { Inter } from "next/font/google";
import "./globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";


export const metadata = {
  title: "CATÁLOGO 666",
  description: "As fotos que o mundo não pode ver",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link href="https://rsms.me/inter/inter.css" rel="stylesheet" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className="bg-background text-foreground min-h-screen antialiased">
        <main className="relative z-10 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
