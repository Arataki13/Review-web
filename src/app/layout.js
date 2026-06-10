import { Inter } from "next/font/google";
import "./globals.css";
import { ModalProvider } from "@/context/ModalContext";
import SidebarWrapper from "@/components/SidebarWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "My Tracker - Personal Media Logger",
  description: "Track your finished, currently watching/playing, wishlist, and dropped movies, TV shows, and games.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full bg-zinc-950 text-zinc-100">
      <body className={`${inter.className} h-full bg-zinc-950 text-zinc-100 flex flex-col md:flex-row min-h-screen`}>
        <ModalProvider>
          <SidebarWrapper />
          <main className="flex-1 p-6 md:p-10 overflow-y-auto w-full">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>
        </ModalProvider>
      </body>
    </html>
  );
}
