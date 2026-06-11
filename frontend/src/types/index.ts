export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthPayload {
  user: User;
  token: string;
}

export interface ShortUrl {
  id: string;
  originalUrl: string;
  shortCode: string;
  customAlias?: string | null;
  userId: string;
  clicks: number;
  createdAt: string;
  expiresAt?: string | null;
}

export interface AnalyticsVisit {
  id: string;
  urlId: string;
  ipAddress: string | null;
  userAgent: string | null;
  referrer: string | null;
  clickedAt: string;
}

export interface Analytics {
  totalClicks: number;
  uniqueVisitors: number;
  clicksPerDay: { date: string; clicks: number }[];
  browserStats: Record<string, number>;
  topReferrers: { source: string; count: number }[];
  recentVisits: AnalyticsVisit[];
}

export interface PaginatedResponse<T> {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  urls: T[];
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    requestId?: string;
  };
}
