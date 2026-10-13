import { apiClient as api } from "./apiClient";

/**
 * Safely serialize anything (handles circular refs + Error objects).
 */
function safeStringify(value) {
  try {
    return JSON.stringify(
      value,
      (key, val) => {
        if (val instanceof Error) {
          return { name: val.name, message: val.message, stack: val.stack };
        }
        return val;
      },
      2
    );
  } catch {
    try {
      return String(value);
    } catch {
      return "[unserializable]";
    }
  }
}

/**
 * Exhaustive Axios error inspector.
 * Never logs `{}` — always surfaces status / network / message.
 */
export function logAxiosError(context, err) {
  const status = err?.response?.status ?? "NO_STATUS";
  const statusText = err?.response?.statusText ?? "";
  const url = err?.config?.url ?? err?.request?.responseURL ?? "UNKNOWN_URL";
  const method = (err?.config?.method ?? "GET").toUpperCase();
  const code = err?.code ?? "NO_CODE";
  const hasResponse = !!err?.response;
  const hasRequest = !!err?.request;

  const responseData = hasResponse
    ? (err.response.data === undefined || err.response.data === null || err.response.data === ""
        ? "[empty body]"
        : safeStringify(err.response.data))
    : "[no response — request never completed]";

  const requestInfo = !hasResponse && hasRequest
    ? `request made but no response (network/CORS/timeout). readyState=${err?.request?.readyState ?? "?"}`
    : "n/a";

  // Single structured line + full detail object. Both survive Turbopack console serialization.
  console.error(
    `[${context}] ${method} ${url} → status=${status} ${statusText} code=${code} | message=${err?.message || "unknown"}`
  );
  console.error(
    `[${context}] detail:`,
    safeStringify({
      status,
      statusText,
      method,
      url,
      code,
      message: err?.message,
      hasResponse,
      hasRequest,
      requestInfo,
      responseData,
    })
  );

  return { status, code, url, method };
}

function normalizeAndThrow(context, err) {
  logAxiosError(context, err);
  const status = err?.response?.status;
  const normalized = new Error(
    err?.response?.data?.message ||
      (typeof err?.response?.data === "string" ? err.response.data : null) ||
      err?.message ||
      `${context} failed`
  );
  normalized.status = status ?? null;
  normalized.code = err?.code ?? null;
  normalized.cause = err;
  throw normalized;
}

export async function getDashboardMetrics() {
  try {
    const { data } = await api.get("/api/v1/dashboard/metrics");
    // Expected: { totalBookings, approved, pending, reviews }
    return data;
  } catch (err) {
    normalizeAndThrow("getDashboardMetrics", err);
  }
}

export async function getRecentBookings() {
  try {
    const { data } = await api.get("/api/v1/bookings/recent");
    // Expected: [ { id, title, date, status } ]
    return Array.isArray(data) ? data : data.data || [];
  } catch (err) {
    normalizeAndThrow("getRecentBookings", err);
  }
}

export async function getReviewStatusCount() {
  try {
    const { data } = await api.get("/api/v1/reviews/status-count");
    // Expected: { approved, pending, rejected }
    return data;
  } catch (err) {
    normalizeAndThrow("getReviewStatusCount", err);
  }
}

export async function getUserProfile() {
  try {
    const { data } = await api.get("/api/v1/user/profile");
    // Expected: { name, email, avatar }
    return data.data || data;
  } catch (err) {
    normalizeAndThrow("getUserProfile", err);
  }
}

export async function logoutUser() {
  try {
    const { data } = await api.post("/api/v1/auth/logout");
    // Expected: { success: true, message: "Logged out" }
    return data;
  } catch (err) {
    // Logout must never crash UI — log exhaustively, return failure shape.
    logAxiosError("logoutUser", err);
    return { success: false, message: err?.message || "Logout failed" };
  }
}

// ---- Full booking records (user-scoped, populated rooms) ----
export async function getMyBookings() {
  try {
    const { data } = await api.get("/api/v1/bookings");
    // { success, count, data: [...] }
    return Array.isArray(data) ? data : data.data || [];
  } catch (err) {
    normalizeAndThrow("getMyBookings", err);
  }
}

export async function getBookingDetail(id) {
  try {
    const { data } = await api.get(`/api/v1/bookings/${id}`);
    return data.data || data;
  } catch (err) {
    normalizeAndThrow("getBookingDetail", err);
  }
}

export async function cancelBooking(id) {
  try {
    const { data } = await api.post(`/api/v1/bookings/${id}/cancel`);
    return data.data || data;
  } catch (err) {
    normalizeAndThrow("cancelBooking", err);
  }
}

export async function getInvoiceBooking(id) {
  try {
    const { data } = await api.get(`/api/v1/bookings/${id}/invoice`);
    return data.data || data;
  } catch (err) {
    normalizeAndThrow("getInvoiceBooking", err);
  }
}

// ---- Payments + notifications (derived from real bookings/reviews) ----
export async function getPaymentsHistory() {
  try {
    const { data } = await api.get("/api/v1/payments/history");
    return data;
  } catch (err) {
    normalizeAndThrow("getPaymentsHistory", err);
  }
}

export async function getNotifications() {
  try {
    const { data } = await api.get("/api/v1/notifications");
    return data;
  } catch (err) {
    normalizeAndThrow("getNotifications", err);
  }
}

// ---- Reviews (existing /api/reviews routes + new PUT /:id) ----
export async function getMyReviews() {
  try {
    const { data } = await api.get("/api/reviews/my-reviews");
    return Array.isArray(data) ? data : data.data || [];
  } catch (err) {
    normalizeAndThrow("getMyReviews", err);
  }
}

export async function createReview({ bookingId, rating, comment }) {
  try {
    const { data } = await api.post("/api/reviews", { bookingId, rating, comment });
    return data.data || data;
  } catch (err) {
    normalizeAndThrow("createReview", err);
  }
}

export async function updateReview(id, { rating, comment }) {
  try {
    const { data } = await api.put(`/api/reviews/${id}`, { rating, comment });
    return data.data || data;
  } catch (err) {
    normalizeAndThrow("updateReview", err);
  }
}

export async function deleteReview(id) {
  try {
    const { data } = await api.delete(`/api/reviews/${id}`);
    return data;
  } catch (err) {
    normalizeAndThrow("deleteReview", err);
  }
}

// ---- Profile + password (existing /api/auth routes) ----
export async function updateProfile(payload) {
  try {
    const { data } = await api.put("/api/auth/profile", payload);
    return data.user || data;
  } catch (err) {
    normalizeAndThrow("updateProfile", err);
  }
}

export async function updatePassword({ currentPassword, newPassword }) {
  try {
    const { data } = await api.put("/api/auth/password", { currentPassword, newPassword });
    return data;
  } catch (err) {
    normalizeAndThrow("updatePassword", err);
  }
}

// ---- Wishlist & favorites (/api/favorites) ----
export async function getFavorites(params = {}) {
  try {
    const { data } = await api.get("/api/favorites", { params });
    return data;
  } catch (err) {
    normalizeAndThrow("getFavorites", err);
  }
}

export async function addFavorite(roomId) {
  try {
    const { data } = await api.post("/api/favorites", { roomId });
    return data.data || data;
  } catch (err) {
    normalizeAndThrow("addFavorite", err);
  }
}

export async function removeFavorite(roomId) {
  try {
    const { data } = await api.delete(`/api/favorites/${roomId}`);
    return data;
  } catch (err) {
    normalizeAndThrow("removeFavorite", err);
  }
}

// ---- Reservation modification ----
export async function modifyBooking(id, payload) {
  try {
    const { data } = await api.put(`/api/v1/bookings/${id}/modify`, payload);
    return data.data || data;
  } catch (err) {
    normalizeAndThrow("modifyBooking", err);
  }
}

// ---- Booking calendar ----
export async function getBookingCalendar(month) {
  try {
    const { data } = await api.get("/api/v1/bookings/calendar", { params: month ? { month } : {} });
    return data.data || data;
  } catch (err) {
    normalizeAndThrow("getBookingCalendar", err);
  }
}

// ---- AI travel assistant ----
export async function aiChat(message, history = []) {
  try {
    const { data } = await api.post("/api/v1/ai/chat", { message, history });
    return data.data || data;
  } catch (err) {
    normalizeAndThrow("aiChat", err);
  }
}

// ---- Recommendations ----
export async function getRecommendations(limit = 6) {
  try {
    const { data } = await api.get("/api/v1/recommendations", { params: { limit } });
    return Array.isArray(data) ? data : data.data || [];
  } catch (err) {
    normalizeAndThrow("getRecommendations", err);
  }
}

// ---- Loyalty & coupons (/api/rewards) ----
export async function getLoyalty(params = {}) {
  try {
    const { data } = await api.get("/api/rewards/loyalty", { params });
    return data.data || data;
  } catch (err) {
    normalizeAndThrow("getLoyalty", err);
  }
}

export async function redeemLoyalty(points, idempotencyKey) {
  try {
    const { data } = await api.post("/api/rewards/loyalty/redeem", { points, idempotencyKey });
    return data.data || data;
  } catch (err) {
    normalizeAndThrow("redeemLoyalty", err);
  }
}

export async function listCoupons(params = {}) {
  try {
    const { data } = await api.get("/api/rewards/coupons", { params });
    return data;
  } catch (err) {
    normalizeAndThrow("listCoupons", err);
  }
}

export async function validateCoupon(code, subtotal) {
  try {
    const { data } = await api.post("/api/rewards/coupons/validate", { code, subtotal });
    return data.data || data;
  } catch (err) {
    normalizeAndThrow("validateCoupon", err);
  }
}

// ---- Support tickets & live chat (/api/support) ----
export async function listTickets(params = {}) {
  try {
    const { data } = await api.get("/api/support/tickets", { params });
    return data;
  } catch (err) {
    normalizeAndThrow("listTickets", err);
  }
}

export async function createTicket(payload) {
  try {
    const { data } = await api.post("/api/support/tickets", payload);
    return data.data || data;
  } catch (err) {
    normalizeAndThrow("createTicket", err);
  }
}

export async function updateTicketStatus(id, status) {
  try {
    const { data } = await api.patch(`/api/support/tickets/${id}`, { status });
    return data.data || data;
  } catch (err) {
    normalizeAndThrow("updateTicketStatus", err);
  }
}

export async function listMessages(ticketId, params = {}) {
  try {
    const { data } = await api.get(`/api/support/tickets/${ticketId}/messages`, { params });
    return data;
  } catch (err) {
    normalizeAndThrow("listMessages", err);
  }
}

export async function postMessage(ticketId, text) {
  try {
    const { data } = await api.post(`/api/support/tickets/${ticketId}/messages`, { text });
    return data.data || data;
  } catch (err) {
    normalizeAndThrow("postMessage", err);
  }
}

// ---- Preferences ----
export async function getPreferences() {
  try {
    const { data } = await api.get("/api/v1/preferences");
    return data.data || data;
  } catch (err) {
    normalizeAndThrow("getPreferences", err);
  }
}

export async function updatePreferences(payload) {
  try {
    const { data } = await api.put("/api/v1/preferences", payload);
    return data.data || data;
  } catch (err) {
    normalizeAndThrow("updatePreferences", err);
  }
}

// ---- Notifications: mark read ----
export async function markNotificationRead(id) {
  try {
    const { data } = await api.patch(`/api/v1/notifications/${id}/read`);
    return data;
  } catch (err) {
    normalizeAndThrow("markNotificationRead", err);
  }
}

export async function markAllNotificationsRead() {
  try {
    const { data } = await api.post("/api/v1/notifications/read-all");
    return data;
  } catch (err) {
    normalizeAndThrow("markAllNotificationsRead", err);
  }
}

// ---- PDF invoice download (verified blob) ----
export async function downloadInvoicePdf(bookingId) {
  try {
    const res = await api.get(`/api/v1/bookings/${bookingId}/invoice.pdf`, { responseType: "blob" });
    const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `hotelflow-invoice-${bookingId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return true;
  } catch (err) {
    normalizeAndThrow("downloadInvoicePdf", err);
  }
}

// Re-export helper for page-level use
export { safeStringify };
