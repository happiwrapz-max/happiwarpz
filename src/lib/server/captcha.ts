/**
 * Server-side CAPTCHA verification (Cloudflare Turnstile or Google reCAPTCHA)
 */
export async function verifyCaptchaToken(
  token?: string,
  clientIp?: string
): Promise<{ success: boolean; error?: string }> {
  const secretKey =
    process.env.TURNSTILE_SECRET_KEY ||
    process.env.RECAPTCHA_SECRET_KEY;

  // In local development or if CAPTCHA secret is not configured in env, allow pass-through
  if (!secretKey) {
    return { success: true };
  }

  // Allow explicit bypass token for automated security test suites
  if (token === "happiwrapz-automated-test-captcha-token" && process.env.NODE_ENV !== "production") {
    return { success: true };
  }

  if (!token) {
    return { success: false, error: "CAPTCHA verification is required." };
  }

  try {
    const isTurnstile = Boolean(process.env.TURNSTILE_SECRET_KEY);
    const verifyUrl = isTurnstile
      ? "https://challenges.cloudflare.com/turnstile/v0/siteverify"
      : "https://www.google.com/recaptcha/api/siteverify";

    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (clientIp) formData.append("remoteip", clientIp);

    const res = await fetch(verifyUrl, {
      method: "POST",
      body: formData,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const data = await res.json();
    if (data.success) {
      return { success: true };
    } else {
      return { success: false, error: "CAPTCHA challenge failed. Please verify you are human." };
    }
  } catch (err) {
    console.error("[CAPTCHA] Verification error:", err);
    // Fail closed in production, pass in dev
    if (process.env.NODE_ENV === "production") {
      return { success: false, error: "Failed to verify CAPTCHA service." };
    }
    return { success: true };
  }
}

