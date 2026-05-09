const TOKEN_KEY = "token";
const EMAIL_KEY = "email";

const isBrowser = typeof window !== "undefined";

export const localStorageService = {
  getToken: () => (isBrowser ? localStorage.getItem(TOKEN_KEY) : null),
  setToken: (token: string) => isBrowser && localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => isBrowser && localStorage.removeItem(TOKEN_KEY),

  getEmail: () => (isBrowser ? localStorage.getItem(EMAIL_KEY) : null),
  setEmail: (email: string) => isBrowser && localStorage.setItem(EMAIL_KEY, email),
  removeEmail: () => isBrowser && localStorage.removeItem(EMAIL_KEY),

  clear: () => {
    if (!isBrowser) return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
  },

  getCustomerToken: (slug: string) =>
    isBrowser ? localStorage.getItem(`customer_token_${slug}`) : null,
  setCustomerToken: (slug: string, token: string) =>
    isBrowser && localStorage.setItem(`customer_token_${slug}`, token),
  removeCustomerToken: (slug: string) =>
    isBrowser && localStorage.removeItem(`customer_token_${slug}`),

  getCustomerEmail: (slug: string) =>
    isBrowser ? localStorage.getItem(`customer_email_${slug}`) : null,
  setCustomerEmail: (slug: string, email: string) =>
    isBrowser && localStorage.setItem(`customer_email_${slug}`, email),
  removeCustomerEmail: (slug: string) =>
    isBrowser && localStorage.removeItem(`customer_email_${slug}`),

  // Admin
  getAdminToken: () => (isBrowser ? localStorage.getItem("admin_token") : null),
  setAdminToken: (token: string) => isBrowser && localStorage.setItem("admin_token", token),
  removeAdminToken: () => isBrowser && localStorage.removeItem("admin_token"),
  isAdmin: () => {
    const token = localStorageService.getAdminToken();
    if (!token) return false;
    try {
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload));
      return Number(decoded.user_type) === 3;
    } catch { return false; }
  },
};
