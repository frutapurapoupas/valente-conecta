import "./globals.css";
import PwaRegister from "../components/pwa-register";
import BottomNav from "../components/bottom-nav";
import PushPermissionCard from "../components/push-permission-card";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="pb-24">
        <PwaRegister />
        <PushPermissionCard />
        {children}
        <BottomNav />
      </body>
    </html>
  );
}