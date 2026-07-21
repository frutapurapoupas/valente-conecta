// app/admin-master/layout.tsx
export default function AdminMasterLayout({ children }: { children: React.ReactNode }) {
  // Apenas o children, pois o Sidebar jÃ¡ estÃ¡ no RootLayout
  return (
    <div className="flex-1 w-full bg-white">
      {children}
    </div>
  );
}

