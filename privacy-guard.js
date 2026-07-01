(() => {
  const allowedEmails = new Set([
    "ben_ashurst@me.com",
    "angelika_kleczka@hotmail.com",
  ]);
  const privateStorageKeys = [
    "blood-results-tracker:v3",
    "blood-results-tracker:v1",
    "blood-results-tracker:v2",
    "health-dashboard-profiles:v1",
    "health-dashboard-reference-ranges:v1",
    "health-dashboard-last-local-update:v1",
    "health-dashboard-cloud-cache:v1",
  ];

  function setPrivateVisibility(isVisible) {
    document.querySelectorAll("[data-private]").forEach((section) => {
      section.classList.toggle("hidden", !isVisible);
      section.setAttribute("aria-hidden", isVisible ? "false" : "true");
    });
    document.body.classList.toggle("signed-in", isVisible);
  }

  function clearPrivateLocalData() {
    privateStorageKeys.forEach((key) => localStorage.removeItem(key));
  }

  function getSupabaseClient() {
    const config = window.HEALTH_TRACKER_SUPABASE ?? {};
    const url = String(config.url ?? "").trim();
    const anonKey = String(config.anonKey ?? "").trim();
    if (!url || !anonKey || !window.supabase?.createClient) return null;
    return window.supabase.createClient(url, anonKey);
  }

  function isApprovedSession(session) {
    const email = String(session?.user?.email ?? "").toLowerCase();
    return allowedEmails.has(email);
  }

  function handleSession(session) {
    const isApproved = isApprovedSession(session);
    setPrivateVisibility(isApproved);
    if (!isApproved) clearPrivateLocalData();

    if (session?.user && !isApproved) {
      const authStatus = document.querySelector("#authStatus");
      if (authStatus) {
        authStatus.textContent = "This signed-in account is not authorised for this private health dashboard.";
      }
    }
  }

  async function initPrivacyGuard() {
    setPrivateVisibility(false);
    const client = getSupabaseClient();
    if (!client) {
      clearPrivateLocalData();
      return;
    }

    const { data } = await client.auth.getSession();
    handleSession(data?.session ?? null);
    client.auth.onAuthStateChange((_event, session) => handleSession(session));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPrivacyGuard, { once: true });
  } else {
    initPrivacyGuard();
  }
})();
