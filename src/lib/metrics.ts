/**
 * Centralized Metrics Engine for Instituto Kamaleon Hub
 * Ensures consistent calculation of revenue and clinical stats across all dashboards.
 */

export interface DashboardMetrics {
  totalRevenue: number;
  totalServiceRevenue: number;
  totalProductRevenue: number;
  totalClients: number;
  totalAppointments: number;
  totalHours: number;
}

/**
 * Calculates total revenue from appointments (deduplicated by group_id) and product sales/orders.
 */
export function calculateRevenue(appointments: any[], productSalesOrOrders: any[] = []): { total: number, services: number, products: number } {
  // 1. Deduplicate appointments by group_id
  const seenGroups = new Set<string>();
  const uniqueBookings = appointments.filter(a => {
    if (!a.group_id) return true;
    if (seenGroups.has(a.group_id)) return false;
    seenGroups.add(a.group_id);
    return true;
  });

  const services = uniqueBookings.reduce((acc, curr) => acc + (Number(curr.service?.price) || 0), 0);
  
  // 2. Sum product sales (works for both 'product_sales' and 'orders' table structures)
  const products = productSalesOrOrders.reduce((acc, curr) => {
    // Se for da tabela antiga 'product_sales', usa total_price. Se for 'orders', usa total_amount.
    const orderVal = Number(curr.total_amount) || Number(curr.total_price) || 0;
    return acc + orderVal;
  }, 0);
  
  return {
    total: services + products,
    services,
    products
  };
}

/**
 * Calculates total attended hours based on confirmed or completed sessions.
 */
export function calculateTotalHours(appointments: any[]): number {
  const totalMins = appointments.reduce((acc, curr) => {
    const status = curr.status;
    if (status === "confirmed" || status === "completed") {
      return acc + (Number(curr.service?.duration_minutes) || 0);
    }
    return acc;
  }, 0);
  
  return totalMins / 60;
}

/**
 * Identifies patients in evasion (no sessions in the last X days).
 */
export function identifyEvasionPatients(patients: any[], daysInactive: number = 15): any[] {
  const limit = new Date();
  limit.setDate(limit.getDate() - daysInactive);
  const now = new Date();

  return patients
    .map(p => {
      const attendances = (p.appointments || [])
        .filter((a: any) => a.status === "completed" || a.status === "confirmed")
        .sort((a: any, b: any) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

      const upcoming = (p.appointments || []).some((a: any) => {
        return (a.status === "scheduled" || a.status === "confirmed") && new Date(a.start_time) >= now;
      });

      return { p, attendances, upcoming };
    })
    .filter(({ attendances, upcoming }) => {
      if (upcoming) return false;
      if (attendances.length > 0) {
        const lastSession = new Date(attendances[0].start_time);
        return lastSession < limit;
      }
      return false;
    })
    .map(({ p, attendances }) => {
      const lastSession = new Date(attendances[0].start_time);
      return {
        ...p,
        lastSessionDate: lastSession.toLocaleDateString('pt-BR'),
        daysInactive: Math.floor((now.getTime() - lastSession.getTime()) / (1000 * 60 * 60 * 24))
      };
    });
}
