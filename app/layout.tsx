import "./globals.css";
import { ReactNode } from "react";
import { FirebaseAnalytics } from "@/components/FirebaseAnalytics";

export const metadata = {
  title: "Peel - Remove Anything from Images",
  description: "Manual inpainting tool for stickers and object removal."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <FirebaseAnalytics />
        {children}
      </body>
    </html>
  );
}
