"use client";

import { ReactNode } from "react";
import BottomBar from "./BottomBar";

type AppShellProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  hideBottomBar?: boolean;
};

export default function AppShell({
  children,
  title,
  subtitle,
  hideBottomBar = false,
}: AppShellProps) {
  return (
    <div className="app-shell">
      <div className="app-container">
        {(title || subtitle) && (
          <div className="mb-5 card">
            {title ? (
              <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
            ) : null}
            {subtitle ? (
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            ) : null}
          </div>
        )}

        {children}
      </div>

      {!hideBottomBar ? <BottomBar /> : null}
    </div>
  );
}