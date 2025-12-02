import { Inter } from "next/font/google";
import "./globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Header from "@/components/Header";

export const metadata = {
  title: "FiloCommander",
  description: "Sistema completo de gerenciamento de catálogo de fotos com IA e cadastro de clientes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link href="https://rsms.me/inter/inter.css" rel="stylesheet" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className="bg-background text-foreground min-h-screen antialiased">
        <Header />
        <main className="relative z-10 min-h-screen pt-16 sm:pt-20">
          {children}
        </main>
      </body>
    </html>
  );
}
