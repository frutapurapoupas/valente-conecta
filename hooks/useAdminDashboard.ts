import { useEffect, useState } from "react";
import { getAdminData } from "../services/adminService";

export function useAdminDashboard() {
  const [summary, setSummary] = useState<any[]>([]);
  const [charts, setCharts] = useState<any>({});
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const data = await getAdminData();

      setSummary(data.summary);
      setCharts(data.charts);
      setReports(data.reports);
    }

    load();
  }, []);

  return {
    summary,
    charts,
    reports,
  };
}