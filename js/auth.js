/* ==========================================================================
   Bihar ICDS AWW - Authentication Controller
   js/auth.js  --  Supabase Email+Password Login with beautiful UI
   ========================================================================== */

/** Called from app.js before initApp(). Returns true if authenticated. */
async function initAuth() {
  // If Supabase not configured, skip auth entirely
  if (!window.SUPABASE_CONFIG || typeof window.supabase === "undefined") {
    return true;
  }

  // Re-use auth client from SupabaseDataStore if available, else create one
  const sb = window._sbAuthClient || window.supabase.createClient(
    window.SUPABASE_CONFIG.url,
    window.SUPABASE_CONFIG.key
  );
  window._sbAuthClient = sb;

  // Check for existing session (persisted in localStorage by Supabase)
  const { data: { session } } = await sb.auth.getSession();

  if (session) {
    _hideLoginOverlay();
    return true;
  }

  // No session → show login screen and return false (app init deferred)
  _showLoginOverlay(sb);
  return false;
}

function _showLoginOverlay(sb) {
  const overlay = document.getElementById("loginOverlay");
  if (overlay) {
    overlay.style.display = "flex";
    requestAnimationFrame(() => { overlay.style.opacity = "1"; });
  }

  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email    = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const btn      = document.getElementById("loginBtn");
    const btnText  = document.getElementById("loginBtnText");
    const errorEl  = document.getElementById("loginErrorMsg");

    btn.disabled = true;
    btnText.innerHTML = '<span class="login-spinner"></span> लॉगिन हो रहा है...';
    errorEl.style.display = "none";

    const { error } = await sb.auth.signInWithPassword({ email, password });

    if (error) {
      console.error("Supabase Auth Error:", error);
      let msg = "❌ गलत Email या Password। कृपया पुनः प्रयास करें।";
      if (error.message && (error.message.includes("Invalid login") || error.message.includes("invalid_credentials"))) {
        msg = "❌ गलत Email या Password।";
      } else if (error.message && error.message.includes("Email not confirmed")) {
        msg = "⚠️ Email confirm नहीं हुई। Supabase में 'Confirm email' बंद करें।";
      } else if (error.message && (error.message.includes("fetch") || error.message.includes("Network"))) {
        msg = "⚠️ इंटरनेट कनेक्शन या Supabase सर्वर से संपर्क नहीं हो सका।";
      }
      errorEl.textContent = msg;
      errorEl.style.display = "block";
      btn.disabled = false;
      btnText.textContent = "🔐 लॉगिन करें";
    } else {
      // Login success
      _hideLoginOverlay();
      // Initialize or re-fetch Supabase data with authenticated session
      if (window.db && typeof window.db.initialize === "function") {
        try {
          await window.db.initialize();
        } catch (err) {
          console.warn("DB init after login:", err);
        }
      } else if (window.dbReady) {
        await window.dbReady;
      }
      if (window.initApp) window.initApp();
    }
  });
}

function _hideLoginOverlay() {
  const overlay = document.getElementById("loginOverlay");
  if (!overlay) return;
  overlay.style.transition = "opacity 0.4s ease";
  overlay.style.opacity = "0";
  setTimeout(() => { overlay.style.display = "none"; }, 420);
}

/** Called when user clicks Logout in Settings */
async function logoutUser() {
  const sb = window._sbAuthClient;
  if (sb) {
    try {
      await sb.auth.signOut();
    } catch (e) {
      console.warn("Sign out error:", e);
    }
  }
  // Clear localStorage cache
  localStorage.removeItem("AWW_BIHAR_INVENTORY_MPR_V1");
  if (window.STORAGE_KEY) localStorage.removeItem(window.STORAGE_KEY);
  // Reload page to flush in-memory state and present clean login screen
  window.location.reload();
}

window.initAuth = initAuth;
window.logoutUser = logoutUser;
