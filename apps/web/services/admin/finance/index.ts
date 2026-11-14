import { apiClient } from "@/services/api-client";
import type {
  FinancePayout,
  FinanceRefund,
  FinanceRevenue,
  MentorCharge,
  MentorChargesPage,
  PayoutActionResult,
  PayoutsFilters,
  PayoutsPage,
  RefundsFilters,
  RefundsPage,
  RevenuePeriod,
  ServiceReportFilters,
  SessionCharge,
  SessionChargesPage,
} from "./types";

const FINANCE_PATH = "/admin/finance";

export const adminFinanceService = {
  getRevenue(period: RevenuePeriod) {
    return apiClient.get<FinanceRevenue>(`${FINANCE_PATH}/revenue`, { params: { period } });
  },
  getPayouts(filters: PayoutsFilters, page: number) {
    return apiClient.get<PayoutsPage>(`${FINANCE_PATH}/payouts`, { params: { ...filters, page } });
  },
  exportPayouts(filters: PayoutsFilters) {
    return apiClient.get<FinancePayout[]>(`${FINANCE_PATH}/payouts/export`, { params: filters });
  },
  getSessionCharges(filters: ServiceReportFilters, page: number) {
    return apiClient.get<SessionChargesPage>(`${FINANCE_PATH}/service/sessions`, { params: { ...filters, page } });
  },
  exportSessionCharges(filters: ServiceReportFilters) {
    return apiClient.get<SessionCharge[]>(`${FINANCE_PATH}/service/sessions/export`, { params: filters });
  },
  getMentorCharges(filters: ServiceReportFilters, page: number) {
    return apiClient.get<MentorChargesPage>(`${FINANCE_PATH}/service/mentors`, { params: { ...filters, page } });
  },
  exportMentorCharges(filters: ServiceReportFilters) {
    return apiClient.get<MentorCharge[]>(`${FINANCE_PATH}/service/mentors/export`, { params: filters });
  },
  approvePayout(payoutId: string) {
    return apiClient.post<PayoutActionResult>(`${FINANCE_PATH}/payouts/${encodeURIComponent(payoutId)}/approve`);
  },
  rejectPayout(payoutId: string, reason?: string) {
    return apiClient.post<PayoutActionResult>(`${FINANCE_PATH}/payouts/${encodeURIComponent(payoutId)}/reject`, {
      reason,
    });
  },
  syncPayout(payoutId: string) {
    return apiClient.post<PayoutActionResult>(`${FINANCE_PATH}/payouts/${encodeURIComponent(payoutId)}/sync`);
  },
  approveRefund(paymentId: string) {
    return apiClient.post<FinanceRefund>(`${FINANCE_PATH}/refunds/${encodeURIComponent(paymentId)}/approve`);
  },
  rejectRefund(paymentId: string, reason?: string) {
    return apiClient.post<FinanceRefund>(`${FINANCE_PATH}/refunds/${encodeURIComponent(paymentId)}/reject`, {
      reason,
    });
  },
  requestRefundInfo(paymentId: string) {
    return apiClient.post<FinanceRefund>(`${FINANCE_PATH}/refunds/${encodeURIComponent(paymentId)}/request-info`);
  },
  saveRefundNote(paymentId: string, note: string) {
    return apiClient.patch<FinanceRefund>(`${FINANCE_PATH}/refunds/${encodeURIComponent(paymentId)}/note`, { note });
  },
  getRefunds(filters: RefundsFilters, page: number) {
    return apiClient.get<RefundsPage>(`${FINANCE_PATH}/refunds`, { params: { ...filters, page } });
  },
  exportRefunds(filters: RefundsFilters) {
    return apiClient.get<FinanceRefund[]>(`${FINANCE_PATH}/refunds/export`, { params: filters });
  },
};

export type {
  CountStat,
  PayoutActionResult,
  FinancePayout,
  FinanceRefund,
  FinanceRevenue,
  MentorCharge,
  MentorChargesPage,
  MoneyStat,
  PayoutsFilters,
  PayoutsPage,
  PayoutStatus,
  RefundsFilters,
  RefundsPage,
  RefundStatus,
  RevenueBucket,
  RevenuePeriod,
  ServiceReportFilters,
  SessionCharge,
  SessionChargesPage,
} from "./types";
