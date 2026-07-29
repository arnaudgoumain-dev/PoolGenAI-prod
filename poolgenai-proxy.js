var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// poolgenai-proxy.js
var ANTHROPIC_API = "https://api.anthropic.com";
var FIREBASE_PROJECT_ID = "poolgenai-prod";
var GOOGLE_JWK_URL = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";
var FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;
var IDENTITY_TOOLKIT_URL = "https://identitytoolkit.googleapis.com/v1/accounts:update";
var RESEND_API_URL = "https://api.resend.com/emails";
var VERIFICATION_LINK_BASE = "https://app.poolgenai.com/";
var VERIFICATION_TOKEN_TTL_HOURS = 24;
var INVITATION_TOKEN_TTL_HOURS = 24;
var MAX_SECONDARY_USERS_PER_POOL = 2;
var MAX_INVITED_POOLS_FREE = 2;
var REVOCATION_TOKEN_TTL_HOURS = 24 * 7;
var STRIP_UNRECOGNIZED_SIGNAL_THRESHOLD = 5;
var PSEUDO_REGEX = /^[\p{L}\p{N} '-]{2,24}$/u;
function normalizePseudoKey(pseudo) {
  return pseudo.trim().toLowerCase();
}
__name(normalizePseudoKey, "normalizePseudoKey");
var RESEND_FROM = "PoolGenAI <noreply@poolgenai.com>";
var SUPPORT_EMAIL = "support.poolgenai@gmail.com";
var CRON_CLEANUP_TOKENS = "1 0 1 * *";
var CRON_AGGREGATE_CALIBRATION = "0 3 * * *";
var MIN_SHARPNESS = 5;
var MIN_POINTS = 8;
var MIN_VALUE_SPREAD = {
  pH: 1,
  fCl: 2,
  tCl: 2,
  ccl: 0.5,
  tac: 40,
  cya: 20,
  hard: 100,
  phos: 50,
  copper: 0.1,
  iron: 0.05,
  temp: 4,
  brome: 2,
  o2: 5,
  sel: 1e3
};
var ALLOWED_ORIGINS = [
  "https://app.poolgenai.com"
];
var DAILY_LIMIT_PER_UID = 300;
var STRIPE_API = "https://api.stripe.com/v1";
var STRIPE_WEBHOOK_TOLERANCE_SECONDS = 300;
var ANDROID_PUBLISHER_API = "https://androidpublisher.googleapis.com/androidpublisher/v3";
var ANDROID_PACKAGE_NAME = "com.poolgenai.app.twa";
var PLAY_PRODUCT_MONTHLY = "premium_monthly";
var PLAY_PRODUCT_YEARLY = "premium_annual";
function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin) ? origin || "*" : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, anthropic-version, Authorization, x-uid",
    "Access-Control-Max-Age": "86400"
  };
}
__name(corsHeaders, "corsHeaders");
function jsonResponse(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json" }
  });
}
__name(jsonResponse, "jsonResponse");
function jsonError(message, status, origin, code) {
  return jsonResponse(code ? { error: message, code } : { error: message }, status, origin);
}
__name(jsonError, "jsonError");
function base64UrlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
__name(base64UrlDecode, "base64UrlDecode");
function base64UrlEncode(bytes) {
  let binary = "";
  const arr = new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) binary += String.fromCharCode(arr[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
__name(base64UrlEncode, "base64UrlEncode");
async function getGooglePublicKeys() {
  const cache = caches.default;
  let response = await cache.match(GOOGLE_JWK_URL);
  if (!response) {
    response = await fetch(GOOGLE_JWK_URL);
    if (!response.ok) throw new Error("Impossible de r\xE9cup\xE9rer les cl\xE9s publiques Google");
    await cache.put(GOOGLE_JWK_URL, response.clone());
  }
  const data = await response.json();
  return data.keys;
}
__name(getGooglePublicKeys, "getGooglePublicKeys");
async function verifyFirebaseIdToken(idToken) {
  const parts = idToken.split(".");
  if (parts.length !== 3) throw new Error("Token malform\xE9");
  const [headerB64, payloadB64, sigB64] = parts;
  const header = JSON.parse(new TextDecoder().decode(base64UrlDecode(headerB64)));
  const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(payloadB64)));
  if (header.alg !== "RS256") throw new Error("Algorithme non support\xE9");
  const now = Math.floor(Date.now() / 1e3);
  if (!payload.exp || payload.exp < now) throw new Error("Token expir\xE9");
  if (!payload.iat || payload.iat > now + 60) throw new Error("Token invalide (iat)");
  if (payload.aud !== FIREBASE_PROJECT_ID) throw new Error("Audience invalide");
  if (payload.iss !== `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`) {
    throw new Error("\xC9metteur invalide");
  }
  if (!payload.sub) throw new Error("UID manquant dans le token");
  const keys = await getGooglePublicKeys();
  const jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) throw new Error("Cl\xE9 publique introuvable pour ce token");
  const cryptoKey = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const signedData = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const signature = base64UrlDecode(sigB64);
  const valid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    signature,
    signedData
  );
  if (!valid) throw new Error("Signature invalide");
  return payload;
}
__name(verifyFirebaseIdToken, "verifyFirebaseIdToken");
var cachedGoogleToken = null;
function pemToArrayBuffer(pem) {
  const b64 = pem.replace(/-----BEGIN PRIVATE KEY-----/, "").replace(/-----END PRIVATE KEY-----/, "").replace(/\s/g, "");
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}
__name(pemToArrayBuffer, "pemToArrayBuffer");
async function getGoogleAccessToken(env) {
  const now = Math.floor(Date.now() / 1e3);
  if (cachedGoogleToken && cachedGoogleToken.expiresAt > now + 60) {
    return cachedGoogleToken.token;
  }
  const serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT);
  const scopes = [
    "https://www.googleapis.com/auth/datastore",
    "https://www.googleapis.com/auth/identitytoolkit"
  ].join(" ");
  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: serviceAccount.client_email,
    scope: scopes,
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  };
  const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const claimsB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(claims)));
  const signInput = `${headerB64}.${claimsB64}`;
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(serviceAccount.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(signInput)
  );
  const jwt = `${signInput}.${base64UrlEncode(signature)}`;
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt
    })
  });
  if (!tokenResponse.ok) {
    const errText = await tokenResponse.text();
    throw new Error(`\xC9chec d'obtention du token Google : ${errText}`);
  }
  const tokenData = await tokenResponse.json();
  cachedGoogleToken = {
    token: tokenData.access_token,
    expiresAt: now + tokenData.expires_in
  };
  return cachedGoogleToken.token;
}
__name(getGoogleAccessToken, "getGoogleAccessToken");
var cachedPlayBillingToken = null;
async function getPlayBillingAccessToken(env) {
  const now = Math.floor(Date.now() / 1e3);
  if (cachedPlayBillingToken && cachedPlayBillingToken.expiresAt > now + 60) {
    return cachedPlayBillingToken.token;
  }
  const serviceAccount = JSON.parse(env.PLAY_BILLING_SERVICE_ACCOUNT);
  const scopes = "https://www.googleapis.com/auth/androidpublisher";
  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: serviceAccount.client_email,
    scope: scopes,
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  };
  const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const claimsB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(claims)));
  const signInput = `${headerB64}.${claimsB64}`;
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(serviceAccount.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(signInput)
  );
  const jwt = `${signInput}.${base64UrlEncode(signature)}`;
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt
    })
  });
  if (!tokenResponse.ok) {
    const errText = await tokenResponse.text();
    throw new Error(`\xC9chec d'obtention du token Play Billing : ${errText}`);
  }
  const tokenData = await tokenResponse.json();
  cachedPlayBillingToken = {
    token: tokenData.access_token,
    expiresAt: now + tokenData.expires_in
  };
  return cachedPlayBillingToken.token;
}
__name(getPlayBillingAccessToken, "getPlayBillingAccessToken");
function toFirestoreValue(value) {
  if (value === null || value === void 0) return { nullValue: null };
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toFirestoreValue) } };
  if (typeof value === "object") return { mapValue: { fields: toFirestoreFields(value) } };
  throw new Error(`Type non support\xE9 pour Firestore: ${typeof value}`);
}
__name(toFirestoreValue, "toFirestoreValue");
function toFirestoreFields(obj) {
  const fields = {};
  for (const [key, value] of Object.entries(obj)) {
    fields[key] = toFirestoreValue(value);
  }
  return fields;
}
__name(toFirestoreFields, "toFirestoreFields");
function fromFirestoreValue(value) {
  if (value == null) return null;
  if ("stringValue" in value) return value.stringValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("integerValue" in value) return parseInt(value.integerValue, 10);
  if ("doubleValue" in value) return value.doubleValue;
  if ("timestampValue" in value) return new Date(value.timestampValue);
  if ("nullValue" in value) return null;
  if ("mapValue" in value) return fromFirestoreFields(value.mapValue.fields);
  if ("arrayValue" in value) return (value.arrayValue.values || []).map(fromFirestoreValue);
  return null;
}
__name(fromFirestoreValue, "fromFirestoreValue");
function fromFirestoreFields(fields) {
  const obj = {};
  for (const [key, value] of Object.entries(fields || {})) {
    obj[key] = fromFirestoreValue(value);
  }
  return obj;
}
__name(fromFirestoreFields, "fromFirestoreFields");
async function firestoreCreateDoc(env, collection, documentId, data) {
  const accessToken = await getGoogleAccessToken(env);
  const url = `${FIRESTORE_BASE}/${collection}?documentId=${documentId}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ fields: toFirestoreFields(data) })
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`\xC9chec de cr\xE9ation Firestore : ${errText}`);
  }
  return response.json();
}
__name(firestoreCreateDoc, "firestoreCreateDoc");
async function firestoreSetDoc(env, collection, documentId, data) {
  const accessToken = await getGoogleAccessToken(env);
  const url = `${FIRESTORE_BASE}/${collection}/${documentId}`;
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ fields: toFirestoreFields(data) })
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`\xC9chec d'\xE9criture Firestore : ${errText}`);
  }
  return response.json();
}
__name(firestoreSetDoc, "firestoreSetDoc");
async function firestoreGetDoc(env, collection, documentId) {
  const accessToken = await getGoogleAccessToken(env);
  const url = `${FIRESTORE_BASE}/${collection}/${documentId}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`\xC9chec de lecture Firestore : ${errText}`);
  }
  const data = await response.json();
  return fromFirestoreFields(data.fields);
}
__name(firestoreGetDoc, "firestoreGetDoc");
async function firestoreListAllDocs(env, collection) {
  const accessToken = await getGoogleAccessToken(env);
  const docs = [];
  let pageToken;
  do {
    const url = new URL(`${FIRESTORE_BASE}/${collection}`);
    url.searchParams.set("pageSize", "300");
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`\xC9chec de listage Firestore : ${errText}`);
    }
    const data = await response.json();
    for (const doc of data.documents || []) {
      docs.push({ id: doc.name.split("/").pop(), ...fromFirestoreFields(doc.fields) });
    }
    pageToken = data.nextPageToken;
  } while (pageToken);
  return docs;
}
__name(firestoreListAllDocs, "firestoreListAllDocs");
async function firestorePatchDoc(env, collection, documentId, data) {
  const accessToken = await getGoogleAccessToken(env);
  const fieldNames = Object.keys(data).map((k) => `updateMask.fieldPaths=${k}`).join("&");
  const url = `${FIRESTORE_BASE}/${collection}/${documentId}?${fieldNames}`;
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ fields: toFirestoreFields(data) })
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`\xC9chec de mise \xE0 jour Firestore : ${errText}`);
  }
  return response.json();
}
__name(firestorePatchDoc, "firestorePatchDoc");
async function firestoreIncrementField(env, collection, documentId, fieldPath, incrementBy) {
  const accessToken = await getGoogleAccessToken(env);
  const documentPath = `projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${collection}/${documentId}`;
  const response = await fetch(`${FIRESTORE_BASE.replace(/\/documents$/, "")}:commit`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      writes: [
        {
          transform: {
            document: documentPath,
            fieldTransforms: [
              {
                fieldPath,
                increment: { integerValue: String(incrementBy) }
              }
            ]
          }
        }
      ]
    })
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`\xC9chec d'incr\xE9ment Firestore : ${errText}`);
  }
  const data = await response.json();
  const transformed = data.writeResults?.[0]?.transformResults?.[0];
  return transformed ? fromFirestoreValue(transformed) : null;
}
__name(firestoreIncrementField, "firestoreIncrementField");
function todayDateKey() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
__name(todayDateKey, "todayDateKey");
async function checkAndIncrementRateLimit(env, uid) {
  const docId = `${uid}_${todayDateKey()}`;
  const existing = await firestoreGetDoc(env, "rateLimits", docId);
  const currentCount = existing?.count || 0;
  if (currentCount >= DAILY_LIMIT_PER_UID) {
    return { allowed: false, count: currentCount };
  }
  const newCount = currentCount + 1;
  await firestoreSetDoc(env, "rateLimits", docId, {
    uid,
    date: todayDateKey(),
    count: newCount,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  return { allowed: true, count: newCount };
}
__name(checkAndIncrementRateLimit, "checkAndIncrementRateLimit");
async function firestoreDeleteDoc(env, collection, documentId) {
  const accessToken = await getGoogleAccessToken(env);
  const url = `${FIRESTORE_BASE}/${collection}/${documentId}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!response.ok && response.status !== 404) {
    const errText = await response.text();
    throw new Error(`\xC9chec de suppression Firestore : ${errText}`);
  }
}
__name(firestoreDeleteDoc, "firestoreDeleteDoc");
function flattenStripeParams(obj, prefix, out) {
  for (const [key, value] of Object.entries(obj)) {
    const paramKey = prefix ? `${prefix}[${key}]` : key;
    if (value === void 0 || value === null) continue;
    if (Array.isArray(value)) {
      value.forEach((item, i) => flattenStripeParams({ [i]: item }, prefix ? `${prefix}[${key}]` : key, out));
    } else if (typeof value === "object") {
      flattenStripeParams(value, paramKey, out);
    } else {
      out.set(paramKey, String(value));
    }
  }
  return out;
}
__name(flattenStripeParams, "flattenStripeParams");
async function stripeApiRequest(env, path, params) {
  const body = flattenStripeParams(params, "", new URLSearchParams());
  const response = await fetch(`${STRIPE_API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: body.toString()
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Erreur Stripe (${path}) : ${data.error?.message || response.status}`);
  }
  return data;
}
__name(stripeApiRequest, "stripeApiRequest");
async function verifyStripeSignature(rawBody, sigHeader, secret) {
  if (!sigHeader) throw new Error("Header stripe-signature manquant");
  const parts = Object.fromEntries(
    sigHeader.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k, v];
    })
  );
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) throw new Error("Signature malform\xE9e");
  const now = Math.floor(Date.now() / 1e3);
  if (Math.abs(now - parseInt(timestamp, 10)) > STRIPE_WEBHOOK_TOLERANCE_SECONDS) {
    throw new Error("Signature expir\xE9e (rejeu possible)");
  }
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signedPayload = `${timestamp}.${rawBody}`;
  const sigBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedPayload));
  const expectedHex = Array.from(new Uint8Array(sigBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
  if (expectedHex !== signature) throw new Error("Signature invalide");
}
__name(verifyStripeSignature, "verifyStripeSignature");
function planFromPriceId(env, priceId) {
  if (priceId === env.STRIPE_PRICE_MONTHLY) return "monthly";
  if (priceId === env.STRIPE_PRICE_YEARLY) return "yearly";
  return null;
}
__name(planFromPriceId, "planFromPriceId");
function planFromPlayProductId(productId) {
  if (productId === PLAY_PRODUCT_MONTHLY) return "monthly";
  if (productId === PLAY_PRODUCT_YEARLY) return "yearly";
  return null;
}
__name(planFromPlayProductId, "planFromPlayProductId");
async function fetchPlaySubscriptionPurchase(env, purchaseToken) {
  const accessToken = await getPlayBillingAccessToken(env);
  const url = `${ANDROID_PUBLISHER_API}/applications/${ANDROID_PACKAGE_NAME}/purchases/subscriptionsv2/tokens/${purchaseToken}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`\xC9chec de lecture de l'achat Play Billing : ${errText}`);
  }
  return response.json();
}
__name(fetchPlaySubscriptionPurchase, "fetchPlaySubscriptionPurchase");
async function acknowledgePlaySubscriptionPurchase(env, productId, purchaseToken) {
  const accessToken = await getPlayBillingAccessToken(env);
  const url = `${ANDROID_PUBLISHER_API}/applications/${ANDROID_PACKAGE_NAME}/purchases/subscriptions/${productId}/tokens/${purchaseToken}:acknowledge`;
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({})
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`\xC9chec d'acknowledge Play Billing : ${errText}`);
  }
}
__name(acknowledgePlaySubscriptionPurchase, "acknowledgePlaySubscriptionPurchase");
async function firestoreQueryExpiredTokenIds(env, nowIso, limit) {
  const accessToken = await getGoogleAccessToken(env);
  const url = `${FIRESTORE_BASE}:runQuery`;
  const body = {
    structuredQuery: {
      from: [{ collectionId: "verificationTokens" }],
      where: {
        fieldFilter: {
          field: { fieldPath: "expiresAt" },
          op: "LESS_THAN",
          value: { timestampValue: nowIso }
        }
      },
      limit
    }
  };
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`\xC9chec de la requ\xEAte Firestore : ${errText}`);
  }
  const rows = await response.json();
  return rows.filter((r) => r.document).map((r) => r.document.name.split("/").pop());
}
__name(firestoreQueryExpiredTokenIds, "firestoreQueryExpiredTokenIds");
async function firestoreQueryDocsByEquality(env, collectionId, equalityFilters, limit) {
  const accessToken = await getGoogleAccessToken(env);
  const url = `${FIRESTORE_BASE}:runQuery`;
  const filters = Object.entries(equalityFilters).map(([fieldPath, value]) => ({
    fieldFilter: {
      field: { fieldPath },
      op: "EQUAL",
      value: { stringValue: value }
    }
  }));
  const where = filters.length === 1 ? filters[0] : { compositeFilter: { op: "AND", filters } };
  const body = {
    structuredQuery: {
      from: [{ collectionId }],
      where,
      limit: limit || 300
    }
  };
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`\xC9chec de la requ\xEAte Firestore : ${errText}`);
  }
  const rows = await response.json();
  return rows.filter((r) => r.document).map((r) => ({ id: r.document.name.split("/").pop(), ...fromFirestoreFields(r.document.fields) }));
}
__name(firestoreQueryDocsByEquality, "firestoreQueryDocsByEquality");
async function markFirebaseAccountVerified(env, uid) {
  const accessToken = await getGoogleAccessToken(env);
  const response = await fetch(IDENTITY_TOOLKIT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ localId: uid, emailVerified: true })
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`\xC9chec de mise \xE0 jour du compte Firebase : ${errText}`);
  }
  return response.json();
}
__name(markFirebaseAccountVerified, "markFirebaseAccountVerified");
async function sendVerificationEmail(env, toEmail, token) {
  const link = `${VERIFICATION_LINK_BASE}?token=${token}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <p style="color:#555;font-size:13px;margin-bottom:4px;">Ce n'est pas un spam</p>
      <h2>V\xE9rifie ton adresse email</h2>
      <p>Clique sur le lien ci-dessous pour activer ton compte PoolGenAI :</p>
      <p><a href="${link}" style="background:#0ea5e9;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;">V\xE9rifier mon email</a></p>
      <p>Ce lien expire dans ${VERIFICATION_TOKEN_TTL_HOURS} heures.</p>
      <p style="color:#888;font-size:12px;">Si tu n'es pas \xE0 l'origine de cette inscription, ignore cet email.</p>
    </div>
  `;
  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: toEmail,
      subject: "V\xE9rifie ton adresse email \u2014 PoolGenAI",
      html
    })
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`\xC9chec d'envoi Resend : ${errText}`);
  }
  return response.json();
}
__name(sendVerificationEmail, "sendVerificationEmail");
function generateVerificationToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return base64UrlEncode(bytes);
}
__name(generateVerificationToken, "generateVerificationToken");
async function cleanupExpiredVerificationTokens(env) {
  const nowIso = (/* @__PURE__ */ new Date()).toISOString();
  let totalDeleted = 0;
  for (let i = 0; i < 20; i++) {
    const ids = await firestoreQueryExpiredTokenIds(env, nowIso, 500);
    if (ids.length === 0) break;
    for (const id of ids) {
      try {
        await firestoreDeleteDoc(env, "verificationTokens", id);
        totalDeleted++;
      } catch (e) {
        console.error(`\xC9chec suppression token ${id} : ${e.message}`);
      }
    }
    if (ids.length < 500) break;
  }
  console.log(`Nettoyage verificationTokens : ${totalDeleted} document(s) supprim\xE9(s)`);
  return totalDeleted;
}
__name(cleanupExpiredVerificationTokens, "cleanupExpiredVerificationTokens");
function solveLinearSystem(A, b) {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(M[row][col]) > Math.abs(M[pivot][col])) pivot = row;
    }
    [M[col], M[pivot]] = [M[pivot], M[col]];
    if (Math.abs(M[col][col]) < 1e-8) return null;
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = M[row][col] / M[col][col];
      for (let k = col; k <= n; k++) M[row][k] -= factor * M[col][k];
    }
  }
  return M.map((row, i) => row[n] / row[i]);
}
__name(solveLinearSystem, "solveLinearSystem");
function fitLinearRegression(points) {
  const n = points.length;
  const X = points.map((p) => [p.r, p.g, p.b, 1]);
  const y = points.map((p) => p.trueValue);
  const XtX = Array.from({ length: 4 }, () => new Array(4).fill(0));
  const Xty = new Array(4).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < 4; j++) {
      Xty[j] += X[i][j] * y[i];
      for (let k = 0; k < 4; k++) {
        XtX[j][k] += X[i][j] * X[i][k];
      }
    }
  }
  const beta = solveLinearSystem(XtX, Xty);
  if (!beta) return null;
  return { a: beta[0], b: beta[1], c: beta[2], d: beta[3] };
}
__name(fitLinearRegression, "fitLinearRegression");
async function aggregateCalibrationModels(env) {
  const points = await firestoreListAllDocs(env, "calibrationPoints");
  const groups = {};
  for (const p of points) {
    if (!p.stripModel || !p.param || !p.sampledColor || typeof p.trueValue !== "number") continue;
    if (p.exposureClipped === true) continue;
    if (typeof p.sharpness === "number" && p.sharpness < MIN_SHARPNESS) continue;
    const key = `${p.stripModel}_${p.param}`;
    (groups[key] = groups[key] || []).push(p);
  }
  let updated = 0;
  let skipped = 0;
  for (const [key, group] of Object.entries(groups)) {
    const values = group.map((p) => p.trueValue);
    const spread = Math.max(...values) - Math.min(...values);
    const minSpread = MIN_VALUE_SPREAD[group[0].param] ?? 0;
    if (group.length < MIN_POINTS || spread < minSpread) {
      skipped++;
      continue;
    }
    const regressionPoints = group.map((p) => ({
      r: p.sampledColor.r,
      g: p.sampledColor.g,
      b: p.sampledColor.b,
      trueValue: p.trueValue
    }));
    const model = fitLinearRegression(regressionPoints);
    if (!model) {
      skipped++;
      continue;
    }
    await firestoreSetDoc(env, "calibrationModels", key, {
      stripModel: group[0].stripModel,
      param: group[0].param,
      coefficients: model,
      sampleCount: group.length,
      valueMin: Math.min(...values),
      valueMax: Math.max(...values),
      updatedAt: /* @__PURE__ */ new Date()
    });
    updated++;
  }
  console.log(`Agr\xE9gation calibrationModels : ${updated} mod\xE8le(s) mis \xE0 jour, ${skipped} groupe(s) sous le seuil, ${points.length} point(s) source`);
  return { updated, skipped, totalPoints: points.length };
}
__name(aggregateCalibrationModels, "aggregateCalibrationModels");
function normalizeProductString(str) {
  return (str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}
__name(normalizeProductString, "normalizeProductString");
function tokenOverlapScore(query, target) {
  const queryTokens = query.split(" ").filter(Boolean);
  if (queryTokens.length === 0) return 0;
  const targetTokens = new Set(target.split(" ").filter(Boolean));
  const matched = queryTokens.filter((t) => targetTokens.has(t)).length;
  return matched / queryTokens.length;
}
__name(tokenOverlapScore, "tokenOverlapScore");
var FUZZY_MATCH_THRESHOLD = 0.6;
var MERGE_TOKEN_TTL_DAYS = 7;
function generateProductId() {
  return `gen_${crypto.randomUUID().replace(/-/g, "")}`;
}
__name(generateProductId, "generateProductId");
async function handleProductLookup(request, env, origin) {
  const authHeader = request.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return jsonError("Authentification requise", 401, origin);
  try {
    await verifyFirebaseIdToken(idToken);
  } catch (e) {
    return jsonError(`Token invalide : ${e.message}`, 401, origin);
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Corps de requ\xEAte invalide", 400, origin);
  }
  const barcode = body.barcode ? String(body.barcode).trim() : null;
  const normalizedName = normalizeProductString(body.name);
  const normalizedSubstance = normalizeProductString(body.activeSubstance);
  if (barcode) {
    try {
      const alias = await firestoreGetDoc(env, "commonProducts", `bc_${barcode}`);
      if (alias?.aliasOf) {
        const product = await firestoreGetDoc(env, "commonProducts", alias.aliasOf);
        if (product) {
          return jsonResponse({ matchType: "alias", productId: alias.aliasOf, product }, 200, origin);
        }
      }
    } catch (e) {
      return jsonError(`Erreur de lookup : ${e.message}`, 500, origin);
    }
  }
  let candidates = [];
  try {
    const allProducts = await firestoreListAllDocs(env, "commonProducts");
    candidates = allProducts.filter((p) => p.id?.startsWith("gen_")).map((p) => {
      const nameScore = tokenOverlapScore(normalizedName, p.normalizedName || "");
      const substanceScore = tokenOverlapScore(normalizedSubstance, p.activeSubstance ? normalizeProductString(p.activeSubstance) : "");
      return { product: p, score: (nameScore + substanceScore) / 2 };
    }).filter((c) => c.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
  } catch (e) {
    return jsonError(`Erreur de recherche : ${e.message}`, 500, origin);
  }
  if (candidates.length === 0) {
    return jsonResponse({ matchType: "none" }, 200, origin);
  }
  const best = candidates[0];
  if (barcode && best.score >= FUZZY_MATCH_THRESHOLD && !best.product.barcode) {
    try {
      await requestProductMerge(env, best.product.id, barcode);
    } catch (e) {
      console.error(`\xC9chec de la demande de fusion automatique : ${e.message}`);
    }
    return jsonResponse(
      { matchType: "fuzzy_pending_merge", productId: best.product.id, product: best.product },
      200,
      origin
    );
  }
  return jsonResponse(
    { matchType: "fuzzy_candidates", candidates: candidates.map((c) => ({ productId: c.product.id, product: c.product, score: c.score })) },
    200,
    origin
  );
}
__name(handleProductLookup, "handleProductLookup");
async function handleProductCreate(request, env, origin) {
  const authHeader = request.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return jsonError("Authentification requise", 401, origin);
  try {
    await verifyFirebaseIdToken(idToken);
  } catch (e) {
    return jsonError(`Token invalide : ${e.message}`, 401, origin);
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Corps de requ\xEAte invalide", 400, origin);
  }
  const required = ["normalizedName", "action", "quantity", "effect", "forXm3"];
  const missing = required.filter((k) => body[k] === void 0 || body[k] === null || body[k] === "");
  if (missing.length > 0) {
    return jsonError(`Champs manquants : ${missing.join(", ")}`, 400, origin);
  }
  const productId = generateProductId();
  const now = /* @__PURE__ */ new Date();
  const productData = {
    barcode: body.barcode || null,
    normalizedName: normalizeProductString(body.normalizedName),
    displayName: body.displayName || body.normalizedName,
    activeSubstance: body.activeSubstance || null,
    action: body.action,
    quantity: body.quantity,
    effect: body.effect,
    forXm3: body.forXm3,
    delay: body.delay ?? null,
    container: body.container ?? null,
    photoUrl: body.photoUrl || null,
    source: body.source === "web" ? "web" : "etiquette",
    // v1.99.0 — Infos galets (conditionnement), absentes du schéma avant
    // cette version. Renseignées dès la création si connues (voir
    // handleSave côté client), sinon complétées plus tard via
    // /product-enrich-packaging ou /product-recheck.
    packagingType: body.packagingType || null,
    unitWeight: body.unitWeight ?? null,
    maintenanceUnits: body.maintenanceUnits ?? null,
    maintenanceVolumePer: body.maintenanceVolumePer ?? null,
    maintenanceDays: body.maintenanceDays ?? null,
    callCount: 0,
    createdAt: now,
    lastVerifiedAt: now
  };
  try {
    await firestoreCreateDoc(env, "commonProducts", productId, productData);
    if (body.barcode) {
      await firestoreCreateDoc(env, "commonProducts", `bc_${body.barcode}`, {
        aliasOf: productId,
        createdAt: now
      });
    }
    await sendNewProductNotificationEmail(env, productId, productData);
  } catch (e) {
    return jsonError(`\xC9chec de cr\xE9ation : ${e.message}`, 500, origin);
  }
  return jsonResponse({ success: true, productId }, 200, origin);
}
__name(handleProductCreate, "handleProductCreate");
async function handleProductPhotoUpload(request, env, origin) {
  const authHeader = request.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return jsonError("Authentification requise", 401, origin);
  try {
    await verifyFirebaseIdToken(idToken);
  } catch (e) {
    return jsonError(`Token invalide : ${e.message}`, 401, origin);
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Corps de requ\xEAte invalide", 400, origin);
  }
  const productId = body.productId ? String(body.productId) : null;
  const photoBase64 = body.photoBase64 ? String(body.photoBase64) : null;
  if (!productId || !photoBase64) {
    return jsonError("productId et photoBase64 requis", 400, origin);
  }
  if (!productId.startsWith("gen_")) {
    return jsonError("productId invalide", 400, origin);
  }
  let existing;
  try {
    existing = await firestoreGetDoc(env, "commonProducts", productId);
  } catch (e) {
    return jsonError(`Erreur de lecture : ${e.message}`, 500, origin);
  }
  if (!existing) {
    return jsonError("Produit introuvable", 404, origin);
  }
  if (existing.photoUrl) {
    return jsonResponse({ success: true, skipped: true, photoUrl: existing.photoUrl }, 200, origin);
  }
  const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
  let bytes;
  try {
    const binary = atob(photoBase64);
    bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  } catch (e) {
    return jsonError("photoBase64 invalide", 400, origin);
  }
  if (bytes.length > MAX_PHOTO_BYTES) {
    return jsonError("Photo trop volumineuse", 413, origin);
  }
  try {
    await env.PRODUCT_PHOTOS.put(productId, bytes, {
      httpMetadata: { contentType: "image/jpeg" }
    });
  } catch (e) {
    return jsonError(`\xC9chec d'upload R2 : ${e.message}`, 500, origin);
  }
  const reqUrl = new URL(request.url);
  const photoUrl = `${reqUrl.origin}/product-photo?id=${productId}`;
  try {
    await firestorePatchDoc(env, "commonProducts", productId, { photoUrl });
  } catch (e) {
    return jsonError(`\xC9chec de mise \xE0 jour Firestore : ${e.message}`, 500, origin);
  }
  return jsonResponse({ success: true, photoUrl }, 200, origin);
}
__name(handleProductPhotoUpload, "handleProductPhotoUpload");
async function handleProductPhotoServe(request, env, origin) {
  const url = new URL(request.url);
  const productId = url.searchParams.get("id");
  if (!productId) return new Response("Missing id", { status: 400 });
  let object;
  try {
    object = await env.PRODUCT_PHOTOS.get(productId);
  } catch (e) {
    return new Response("R2 error", { status: 500 });
  }
  if (!object) return new Response("Not found", { status: 404 });
  return new Response(object.body, {
    headers: {
      "Content-Type": object.httpMetadata?.contentType || "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
__name(handleProductPhotoServe, "handleProductPhotoServe");
async function handleProductUse(request, env, origin) {
  const authHeader = request.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return jsonError("Authentification requise", 401, origin);
  try {
    await verifyFirebaseIdToken(idToken);
  } catch (e) {
    return jsonError(`Token invalide : ${e.message}`, 401, origin);
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Corps de requ\xEAte invalide", 400, origin);
  }
  const productId = body.productId;
  if (!productId) return jsonError("productId manquant", 400, origin);
  let newCount;
  try {
    newCount = await firestoreIncrementField(env, "commonProducts", productId, "callCount", 1);
  } catch (e) {
    return jsonError(`\xC9chec d'incr\xE9ment : ${e.message}`, 500, origin);
  }
  return jsonResponse({ success: true, callCount: newCount }, 200, origin);
}
__name(handleProductUse, "handleProductUse");
async function handleProductEnrichPackaging(request, env, origin) {
  const authHeader = request.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return jsonError("Authentification requise", 401, origin);
  try {
    await verifyFirebaseIdToken(idToken);
  } catch (e) {
    return jsonError(`Token invalide : ${e.message}`, 401, origin);
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Corps de requ\xEAte invalide", 400, origin);
  }
  const productId = body.productId;
  if (!productId) return jsonError("productId manquant", 400, origin);
  try {
    await firestorePatchDoc(env, "commonProducts", productId, {
      packagingType: body.packagingType || null,
      unitWeight: body.unitWeight ?? null,
      maintenanceUnits: body.maintenanceUnits ?? null,
      maintenanceVolumePer: body.maintenanceVolumePer ?? null,
      maintenanceDays: body.maintenanceDays ?? null
    });
  } catch (e) {
    return jsonError(`\xC9chec d'enrichissement : ${e.message}`, 500, origin);
  }
  return jsonResponse({ success: true }, 200, origin);
}
__name(handleProductEnrichPackaging, "handleProductEnrichPackaging");
async function handleProductRecheck(request, env, origin) {
  const authHeader = request.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return jsonError("Authentification requise", 401, origin);
  try {
    await verifyFirebaseIdToken(idToken);
  } catch (e) {
    return jsonError(`Token invalide : ${e.message}`, 401, origin);
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Corps de requ\xEAte invalide", 400, origin);
  }
  const productId = body.productId;
  if (!productId) return jsonError("productId manquant", 400, origin);
  const oldData = await firestoreGetDoc(env, "commonProducts", productId);
  if (!oldData) return jsonError("Fiche introuvable", 404, origin);
  const newData = {
    quantity: body.quantity ?? oldData.quantity,
    effect: body.effect ?? oldData.effect,
    forXm3: body.forXm3 ?? oldData.forXm3,
    delay: body.delay ?? oldData.delay ?? null,
    container: body.container ?? oldData.container ?? null,
    packagingType: body.packagingType || oldData.packagingType || null,
    unitWeight: body.unitWeight ?? oldData.unitWeight ?? null,
    maintenanceUnits: body.maintenanceUnits ?? oldData.maintenanceUnits ?? null,
    maintenanceVolumePer: body.maintenanceVolumePer ?? oldData.maintenanceVolumePer ?? null,
    maintenanceDays: body.maintenanceDays ?? oldData.maintenanceDays ?? null,
    lastVerifiedAt: /* @__PURE__ */ new Date()
  };
  try {
    await firestorePatchDoc(env, "commonProducts", productId, newData);
    await sendProductRevalidationEmail(env, productId, oldData, newData);
  } catch (e) {
    return jsonError(`\xC9chec du recontr\xF4le : ${e.message}`, 500, origin);
  }
  return jsonResponse({ success: true }, 200, origin);
}
__name(handleProductRecheck, "handleProductRecheck");
async function requestProductMerge(env, existingProductId, barcode) {
  const mergeId = crypto.randomUUID();
  const token = generateVerificationToken();
  const now = /* @__PURE__ */ new Date();
  const expiresAt = new Date(now.getTime() + MERGE_TOKEN_TTL_DAYS * 24 * 3600 * 1e3);
  await firestoreCreateDoc(env, "pendingMerges", mergeId, {
    existingProductId,
    barcode,
    token,
    createdAt: now,
    expiresAt,
    used: false
  });
  const confirmUrl = `${VERIFICATION_LINK_BASE}?confirmMerge=${mergeId}&token=${token}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Fusion de produit en attente de confirmation</h2>
      <p>Un code-barre (${barcode}) a \xE9t\xE9 d\xE9tect\xE9 pour une fiche existante sans code-barre (${existingProductId}).</p>
      <p><a href="${confirmUrl}">Confirmer la fusion</a> (lien valable ${MERGE_TOKEN_TTL_DAYS} jours)</p>
    </div>
  `;
  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: SUPPORT_EMAIL,
      subject: "PoolGenAI \u2014 Fusion de produit \xE0 confirmer",
      html
    })
  });
  if (!response.ok) throw new Error(`\xC9chec d'envoi Resend : ${await response.text()}`);
}
__name(requestProductMerge, "requestProductMerge");
async function handleConfirmMerge(request, env, origin) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Corps de requ\xEAte invalide", 400, origin);
  }
  const { mergeId, token } = body;
  if (!mergeId || !token) return jsonError("mergeId ou token manquant", 400, origin);
  let pending;
  try {
    pending = await firestoreGetDoc(env, "pendingMerges", mergeId);
  } catch (e) {
    return jsonError(`Erreur serveur : ${e.message}`, 500, origin);
  }
  if (!pending) return jsonResponse({ status: "invalid" }, 404, origin);
  if (pending.used) return jsonResponse({ status: "already_merged" }, 200, origin);
  if (pending.token !== token) return jsonError("Token invalide", 403, origin);
  if (pending.expiresAt && pending.expiresAt.getTime() < Date.now()) {
    return jsonResponse({ status: "expired" }, 410, origin);
  }
  try {
    const now = /* @__PURE__ */ new Date();
    await firestorePatchDoc(env, "commonProducts", pending.existingProductId, {
      barcode: pending.barcode
    });
    await firestoreCreateDoc(env, "commonProducts", `bc_${pending.barcode}`, {
      aliasOf: pending.existingProductId,
      createdAt: now
    });
    await firestorePatchDoc(env, "pendingMerges", mergeId, { used: true });
  } catch (e) {
    return jsonError(`\xC9chec de la fusion : ${e.message}`, 500, origin);
  }
  return jsonResponse({ status: "merged", productId: pending.existingProductId }, 200, origin);
}
__name(handleConfirmMerge, "handleConfirmMerge");
async function sendNewProductNotificationEmail(env, productId, productData) {
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Nouvelle fiche produit cr\xE9\xE9e</h2>
      <p><strong>${productData.displayName}</strong> (${productId})</p>
      <p>Code-barre : ${productData.barcode || "aucun"} \u2014 Source : ${productData.source}</p>
    </div>
  `;
  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: RESEND_FROM, to: SUPPORT_EMAIL, subject: "PoolGenAI \u2014 Nouvelle fiche produit", html })
  });
  if (!response.ok) throw new Error(`\xC9chec d'envoi Resend : ${await response.text()}`);
}
__name(sendNewProductNotificationEmail, "sendNewProductNotificationEmail");
async function sendProductRevalidationEmail(env, productId, oldData, newData) {
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Fiche produit re-v\xE9rifi\xE9e (recontr\xF4le photo, tous les 20 usages)</h2>
      <p><strong>${oldData.displayName}</strong> (${productId})</p>
      <table style="border-collapse: collapse; font-size: 14px;">
        <tr><td style="padding:4px 12px 4px 0;color:#888;">Quantit\xE9</td><td>${oldData.quantity} \u2192 ${newData.quantity}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#888;">Effet</td><td>${oldData.effect} \u2192 ${newData.effect}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#888;">Pour X m\xB3</td><td>${oldData.forXm3} \u2192 ${newData.forXm3}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#888;">Conditionnement</td><td>${oldData.packagingType || "\u2014"} \u2192 ${newData.packagingType || "\u2014"}</td></tr>
      </table>
    </div>
  `;
  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: RESEND_FROM, to: SUPPORT_EMAIL, subject: "PoolGenAI \u2014 Fiche produit re-v\xE9rifi\xE9e", html })
  });
  if (!response.ok) throw new Error(`\xC9chec d'envoi Resend : ${await response.text()}`);
}
__name(sendProductRevalidationEmail, "sendProductRevalidationEmail");
async function sendStripModelUnrecognizedEmail(env, count, sampleNotes) {
  const notesHtml = (sampleNotes || []).slice(0, 5).map((n) => `<li>${n}</li>`).join("");
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Bandelette non reconnue — signal r\xE9p\xE9t\xE9</h2>
      <p>${count} soumissions r\xE9centes n'ont pas pu \xEAtre rattach\xE9es \xE0 un mod\xE8le connu.</p>
      ${notesHtml ? `<p>Notes de l'IA sur les derni\xE8res soumissions :</p><ul>${notesHtml}</ul>` : ""}
      <p>V\xE9rifie si une nouvelle fiche mod\xE8le m\xE9rite d'\xEAtre cr\xE9\xE9e (voir stripModels dans Firestore).</p>
    </div>
  `;
  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: SUPPORT_EMAIL,
      subject: "PoolGenAI — Bandelette non reconnue (signal r\xE9p\xE9t\xE9)",
      html
    })
  });
  if (!response.ok) throw new Error(`\xC9chec d'envoi Resend : ${await response.text()}`);
}
__name(sendStripModelUnrecognizedEmail, "sendStripModelUnrecognizedEmail");
async function handleStripModelSignal(request, env, origin) {
  const authHeader = request.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return jsonError("Authentification requise", 401, origin);
  try {
    await verifyFirebaseIdToken(idToken);
  } catch (e) {
    return jsonError(`Token invalide : ${e.message}`, 401, origin);
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Corps de requ\xEAte invalide", 400, origin);
  }
  const note = typeof body.note === "string" ? body.note.slice(0, 300) : "";
  try {
    const existing = await firestoreGetDoc(env, "stripModelSignals", "pending");
    const notes = [...existing?.notes || [], note].filter(Boolean).slice(-10);
    const count = (existing?.count || 0) + 1;
    if (count >= STRIP_UNRECOGNIZED_SIGNAL_THRESHOLD) {
      await sendStripModelUnrecognizedEmail(env, count, notes);
      await firestoreSetDoc(env, "stripModelSignals", "pending", { count: 0, notes: [] });
    } else {
      await firestoreSetDoc(env, "stripModelSignals", "pending", { count, notes });
    }
  } catch (e) {
    console.error(`\xC9chec du signal bandelette non reconnue : ${e.message}`);
  }
  return jsonResponse({ success: true }, 200, origin);
}
__name(handleStripModelSignal, "handleStripModelSignal");
// v1.100.0 — stripModels/calibrationModels/config (seuils de confiance) ne
// sont plus lus directement en Firestore côté client (firestore.rules les
// rendait lisibles à tout compte authentifié, y compris gratuit — savoir
// métier bandelettes extractible par quiconque). Servis désormais
// uniquement via ces deux routes, toujours authentifiées mais pas
// premium-only.
async function handleStripReferenceData(request, env, origin) {
  const authHeader = request.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return jsonError("Authentification requise", 401, origin);
  try {
    await verifyFirebaseIdToken(idToken);
  } catch (e) {
    return jsonError(`Token invalide : ${e.message}`, 401, origin);
  }
  try {
    const [stripModelDocs, confidenceThresholds, testerThresholds] = await Promise.all([
      firestoreListAllDocs(env, "stripModels"),
      firestoreGetDoc(env, "config", "stripConfidenceThresholds"),
      firestoreGetDoc(env, "config", "stripConfidenceThresholdsTesters")
    ]);
    const stripModels = stripModelDocs.map(({ id, ...rest }) => ({ modele_id: id, ...rest }));
    return jsonResponse(
      { stripModels, confidenceThresholds: confidenceThresholds || {}, testerThresholds: testerThresholds || {} },
      200,
      origin
    );
  } catch (e) {
    return jsonError(`Erreur serveur : ${e.message}`, 500, origin);
  }
}
__name(handleStripReferenceData, "handleStripReferenceData");
async function handleStripCalibrationModel(request, env, origin) {
  const authHeader = request.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return jsonError("Authentification requise", 401, origin);
  try {
    await verifyFirebaseIdToken(idToken);
  } catch (e) {
    return jsonError(`Token invalide : ${e.message}`, 401, origin);
  }
  const url = new URL(request.url);
  const stripModel = url.searchParams.get("stripModel");
  const param = url.searchParams.get("param");
  if (!stripModel || !param) return jsonError("stripModel et param requis", 400, origin);
  try {
    const model = await firestoreGetDoc(env, "calibrationModels", `${stripModel}_${param}`);
    return jsonResponse({ model: model || null }, 200, origin);
  } catch (e) {
    return jsonError(`Erreur serveur : ${e.message}`, 500, origin);
  }
}
__name(handleStripCalibrationModel, "handleStripCalibrationModel");
async function handleSendVerificationEmail(request, env, origin) {
  const authHeader = request.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return jsonError("Authentification requise", 401, origin);
  let payload;
  try {
    payload = await verifyFirebaseIdToken(idToken);
  } catch (e) {
    return jsonError(`Token invalide : ${e.message}`, 401, origin);
  }
  const uid = payload.sub;
  const email = payload.email;
  if (!email) return jsonError("Aucun email associ\xE9 \xE0 ce compte", 400, origin);
  const token = generateVerificationToken();
  const now = /* @__PURE__ */ new Date();
  const expiresAt = new Date(now.getTime() + VERIFICATION_TOKEN_TTL_HOURS * 3600 * 1e3);
  try {
    await firestoreCreateDoc(env, "verificationTokens", token, {
      uid,
      email,
      createdAt: now,
      expiresAt,
      used: false
    });
    await sendVerificationEmail(env, email, token);
  } catch (e) {
    return jsonError(`\xC9chec de l'envoi : ${e.message}`, 500, origin);
  }
  return jsonResponse({ success: true }, 200, origin);
}
__name(handleSendVerificationEmail, "handleSendVerificationEmail");
async function handleVerifyEmail(request, env, origin) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Corps de requ\xEAte invalide", 400, origin);
  }
  const token = body.token;
  if (!token) return jsonError("Token manquant", 400, origin);
  let tokenDoc;
  try {
    tokenDoc = await firestoreGetDoc(env, "verificationTokens", token);
  } catch (e) {
    return jsonError(`Erreur serveur : ${e.message}`, 500, origin);
  }
  if (!tokenDoc) {
    return jsonResponse({ status: "invalid" }, 404, origin);
  }
  if (tokenDoc.used) {
    return jsonResponse({ status: "already_verified" }, 200, origin);
  }
  if (tokenDoc.expiresAt && tokenDoc.expiresAt.getTime() < Date.now()) {
    return jsonResponse({ status: "expired" }, 410, origin);
  }
  try {
    await markFirebaseAccountVerified(env, tokenDoc.uid);
    await firestorePatchDoc(env, "verificationTokens", token, { used: true });
  } catch (e) {
    return jsonError(`Erreur serveur : ${e.message}`, 500, origin);
  }
  return jsonResponse({ status: "verified" }, 200, origin);
}
__name(handleVerifyEmail, "handleVerifyEmail");
async function sendAccountDataRequestEmail(env, action, uid, email) {
  const actionLabels = {
    erase: "Effacer toutes les donn\xE9es",
    recover: "R\xE9cup\xE9rer toutes les donn\xE9es, ne pas les effacer",
    recover_and_erase: "R\xE9cup\xE9rer puis effacer toutes les donn\xE9es"
  };
  const label = actionLabels[action] || action;
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Demande li\xE9e \xE0 un compte supprim\xE9</h2>
      <table style="border-collapse: collapse; font-size: 14px;">
        <tr><td style="padding:4px 12px 4px 0;color:#888;">Action demand\xE9e</td><td><strong>${label}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#888;">Email du compte</td><td>${email || "inconnu"}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#888;">UID Firebase</td><td>${uid}</td></tr>
      </table>
    </div>
  `;
  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: SUPPORT_EMAIL,
      subject: `PoolGenAI \u2014 Demande donn\xE9es compte supprim\xE9 (${label})`,
      html
    })
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`\xC9chec d'envoi Resend : ${errText}`);
  }
  return response.json();
}
__name(sendAccountDataRequestEmail, "sendAccountDataRequestEmail");
async function handleAccountDataRequest(request, env, origin) {
  const authHeader = request.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return jsonError("Authentification requise", 401, origin);
  let payload;
  try {
    payload = await verifyFirebaseIdToken(idToken);
  } catch (e) {
    return jsonError(`Token invalide : ${e.message}`, 401, origin);
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Corps de requ\xEAte invalide", 400, origin);
  }
  const allowedActions = ["erase", "recover", "recover_and_erase"];
  if (!allowedActions.includes(body.action)) {
    return jsonError("Action invalide", 400, origin);
  }
  try {
    await sendAccountDataRequestEmail(env, body.action, payload.sub, payload.email);
  } catch (e) {
    return jsonError(`\xC9chec de l'envoi : ${e.message}`, 500, origin);
  }
  return jsonResponse({ success: true }, 200, origin);
}
__name(handleAccountDataRequest, "handleAccountDataRequest");
async function sendSecondaryInvitationEmail(env, toEmail, primaryEmail, poolName, token) {
  const link = `${VERIFICATION_LINK_BASE}?respondInvitation=${token}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Invitation PoolGenAI</h2>
      <p><strong>${primaryEmail}</strong> t'invite \xE0 acc\xE9der au bassin <strong>${poolName}</strong> sur PoolGenAI.</p>
      <p>Si tu n'as pas encore de compte, cr\xE9e-le d'abord avec cette adresse email, puis reviens sur ce lien.</p>
      <p><a href="${link}" style="background:#0ea5e9;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;">Voir l'invitation</a></p>
      <p>Ce lien expire dans ${INVITATION_TOKEN_TTL_HOURS} heures.</p>
      <p style="color:#888;font-size:12px;">Si tu n'es pas concern\xE9 par cette invitation, ignore cet email.</p>
    </div>
  `;
  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: RESEND_FROM, to: toEmail, subject: "Invitation PoolGenAI", html })
  });
  if (!response.ok) throw new Error(`\xC9chec d'envoi Resend : ${await response.text()}`);
}
__name(sendSecondaryInvitationEmail, "sendSecondaryInvitationEmail");
async function sendSecondaryRevokedEmail(env, toEmail, primaryEmail, poolName) {
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Acc\xE8s r\xE9voqu\xE9</h2>
      <p><strong>${primaryEmail}</strong> a mis fin \xE0 ton acc\xE8s au bassin <strong>${poolName}</strong> sur PoolGenAI.</p>
    </div>
  `;
  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: RESEND_FROM, to: toEmail, subject: "PoolGenAI \u2014 Acc\xE8s r\xE9voqu\xE9", html })
  });
  if (!response.ok) throw new Error(`\xC9chec d'envoi Resend : ${await response.text()}`);
}
__name(sendSecondaryRevokedEmail, "sendSecondaryRevokedEmail");
async function sendRevocationRequestEmail(env, toEmail, secondaryDisplayName, poolName, token) {
  const link = `${VERIFICATION_LINK_BASE}?respondRevocation=${token}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Demande de r\xE9vocation \u2014 PoolGenAI</h2>
      <p><strong>${secondaryDisplayName}</strong> a demand\xE9 la r\xE9vocation de son acc\xE8s au bassin <strong>${poolName}</strong> sur PoolGenAI.</p>
      <p><a href="${link}" style="background:#0ea5e9;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;">Voir la demande</a></p>
      <p>Ce lien expire dans ${Math.round(REVOCATION_TOKEN_TTL_HOURS / 24)} jours.</p>
      <p style="color:#888;font-size:12px;">Si tu n'es pas concern\xE9 par cette demande, ignore cet email.</p>
    </div>
  `;
  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: RESEND_FROM, to: toEmail, subject: "PoolGenAI \u2014 Demande de r\xE9vocation", html })
  });
  if (!response.ok) throw new Error(`\xC9chec d'envoi Resend : ${await response.text()}`);
}
__name(sendRevocationRequestEmail, "sendRevocationRequestEmail");
async function handleInviteSecondaryUser(request, env, origin) {
  const authHeader = request.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return jsonError("Authentification requise", 401, origin);
  let payload;
  try {
    payload = await verifyFirebaseIdToken(idToken);
  } catch (e) {
    return jsonError(`Token invalide : ${e.message}`, 401, origin);
  }
  const primaryUid = payload.sub;
  const primaryEmail = payload.email;
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Corps de requ\xEAte invalide", 400, origin);
  }
  const { poolId, invitedEmail } = body;
  if (!poolId || !invitedEmail) return jsonError("poolId ou invitedEmail manquant", 400, origin);
  if (invitedEmail.toLowerCase() === (primaryEmail || "").toLowerCase()) {
    return jsonError("Tu ne peux pas t'inviter toi-m\xEAme", 400, origin);
  }
  let config, existingSecondaries;
  try {
    config = await firestoreGetDoc(env, `users/${primaryUid}/config`, "main");
    existingSecondaries = await firestoreListAllDocs(env, `users/${primaryUid}/secondaryUsers`);
  } catch (e) {
    return jsonError(`Erreur serveur : ${e.message}`, 500, origin);
  }
  const pool = (config?.pools || []).find((p) => p.id === poolId);
  if (!pool) return jsonError("Bassin introuvable", 404, origin);
  if (!config?.isPremium) {
    return jsonError("Les invitations sont r\xE9serv\xE9es \xE0 la version Premium", 403, origin, "invite_requires_premium");
  }
  const activeSecondariesForPool = existingSecondaries.filter((s) => s.status === "active" && s.poolId === poolId);
  if (activeSecondariesForPool.length >= MAX_SECONDARY_USERS_PER_POOL) {
    return jsonError(`Nombre maximum d'invit\xE9s atteint pour ce bassin (${MAX_SECONDARY_USERS_PER_POOL})`, 409, origin);
  }
  const activeSecondaries = existingSecondaries.filter((s) => s.status === "active");
  if (activeSecondaries.some((s) => (s.email || "").toLowerCase() === invitedEmail.toLowerCase())) {
    return jsonError("Cette personne a d\xE9j\xE0 acc\xE8s \xE0 un bassin", 409, origin);
  }
  const token = generateVerificationToken();
  const now = /* @__PURE__ */ new Date();
  const expiresAt = new Date(now.getTime() + INVITATION_TOKEN_TTL_HOURS * 3600 * 1e3);
  try {
    await firestoreCreateDoc(env, "invitations", token, {
      primaryUid,
      primaryEmail: primaryEmail || "",
      invitedEmail,
      poolId,
      poolName: pool.name || "",
      createdAt: now,
      expiresAt,
      status: "pending"
    });
    await sendSecondaryInvitationEmail(env, invitedEmail, primaryEmail || "", pool.name || "", token);
  } catch (e) {
    return jsonError(`\xC9chec de l'invitation : ${e.message}`, 500, origin);
  }
  return jsonResponse({ success: true }, 200, origin);
}
__name(handleInviteSecondaryUser, "handleInviteSecondaryUser");
async function handleRespondInvitation(request, env, origin) {
  const authHeader = request.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return jsonError("Authentification requise", 401, origin);
  let payload;
  try {
    payload = await verifyFirebaseIdToken(idToken);
  } catch (e) {
    return jsonError(`Token invalide : ${e.message}`, 401, origin);
  }
  const secondaryUid = payload.sub;
  const secondaryEmail = payload.email || "";
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Corps de requ\xEAte invalide", 400, origin);
  }
  const { token, action } = body;
  if (!token || !["accept", "decline"].includes(action)) {
    return jsonError("token ou action invalide", 400, origin);
  }
  let invitation;
  try {
    invitation = await firestoreGetDoc(env, "invitations", token);
  } catch (e) {
    return jsonError(`Erreur serveur : ${e.message}`, 500, origin);
  }
  if (!invitation) return jsonResponse({ status: "invalid" }, 404, origin);
  if (invitation.status !== "pending") {
    return jsonResponse({ status: invitation.status }, 200, origin);
  }
  if (invitation.expiresAt && invitation.expiresAt.getTime() < Date.now()) {
    return jsonResponse({ status: "expired" }, 410, origin);
  }
  if (invitation.invitedEmail.toLowerCase() !== secondaryEmail.toLowerCase()) {
    return jsonError("Cette invitation ne correspond pas \xE0 ton compte", 403, origin);
  }
  if (invitation.primaryUid === secondaryUid) {
    return jsonError("Tu ne peux pas accepter ta propre invitation", 400, origin);
  }
  if (action === "decline") {
    try {
      await firestorePatchDoc(env, "invitations", token, { status: "declined" });
    } catch (e) {
      return jsonError(`Erreur serveur : ${e.message}`, 500, origin);
    }
    return jsonResponse({ status: "declined" }, 200, origin);
  }
  try {
    const primaryConfig = await firestoreGetDoc(env, `users/${invitation.primaryUid}/config`, "main");
    if (!primaryConfig?.isPremium) {
      return jsonError("Ce compte n'est plus en version Premium, l'invitation ne peut pas \xEAtre accept\xE9e", 403, origin, "invite_requires_premium");
    }
    const existingSecondaries = await firestoreListAllDocs(env, `users/${invitation.primaryUid}/secondaryUsers`);
    const activeSecondariesForPool = existingSecondaries.filter(
      (s) => s.status === "active" && s.id !== secondaryUid && s.poolId === invitation.poolId
    );
    if (activeSecondariesForPool.length >= MAX_SECONDARY_USERS_PER_POOL) {
      return jsonError(`Nombre maximum d'invit\xE9s atteint pour ce bassin (${MAX_SECONDARY_USERS_PER_POOL})`, 409, origin);
    }
    const secondaryConfig = await firestoreGetDoc(env, `users/${secondaryUid}/config`, "main");
    const secondaryIsPremium = !!secondaryConfig?.isPremium;
    if (!secondaryIsPremium) {
      const existingLinks = await firestoreListAllDocs(env, `users/${secondaryUid}/linkedAccounts`);
      const activeLinks = existingLinks.filter((l) => l.status === "active" && l.id !== invitation.primaryUid);
      if (activeLinks.length >= MAX_INVITED_POOLS_FREE) {
        return jsonError(`Limite de ${MAX_INVITED_POOLS_FREE} bassins invit\xE9s atteinte en version gratuite`, 409, origin, "invited_limit_reached");
      }
    }
    const now = /* @__PURE__ */ new Date();
    await firestoreSetDoc(env, `users/${invitation.primaryUid}/secondaryUsers`, secondaryUid, {
      email: secondaryEmail,
      poolId: invitation.poolId,
      status: "active",
      addedAt: now
    });
    await firestoreSetDoc(env, `users/${secondaryUid}/linkedAccounts`, invitation.primaryUid, {
      primaryEmail: invitation.primaryEmail,
      poolId: invitation.poolId,
      status: "active",
      addedAt: now
    });
    await firestorePatchDoc(env, "invitations", token, { status: "accepted" });
  } catch (e) {
    return jsonError(`\xC9chec de l'acceptation : ${e.message}`, 500, origin);
  }
  return jsonResponse(
    { status: "accepted", poolId: invitation.poolId, primaryEmail: invitation.primaryEmail },
    200,
    origin
  );
}
__name(handleRespondInvitation, "handleRespondInvitation");
async function handleRevokeSecondaryAccess(request, env, origin) {
  const authHeader = request.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return jsonError("Authentification requise", 401, origin);
  let payload;
  try {
    payload = await verifyFirebaseIdToken(idToken);
  } catch (e) {
    return jsonError(`Token invalide : ${e.message}`, 401, origin);
  }
  const primaryUid = payload.sub;
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Corps de requ\xEAte invalide", 400, origin);
  }
  const { secondaryUid } = body;
  if (!secondaryUid) return jsonError("secondaryUid manquant", 400, origin);
  let secondary, config;
  try {
    secondary = await firestoreGetDoc(env, `users/${primaryUid}/secondaryUsers`, secondaryUid);
    config = await firestoreGetDoc(env, `users/${primaryUid}/config`, "main");
  } catch (e) {
    return jsonError(`Erreur serveur : ${e.message}`, 500, origin);
  }
  if (!secondary) return jsonError("Acc\xE8s secondaire introuvable", 404, origin);
  const pool = (config?.pools || []).find((p) => p.id === secondary.poolId);
  try {
    await firestorePatchDoc(env, `users/${primaryUid}/secondaryUsers`, secondaryUid, {
      status: "revoked",
      revokedAt: /* @__PURE__ */ new Date()
    });
    await firestorePatchDoc(env, `users/${secondaryUid}/linkedAccounts`, primaryUid, {
      status: "revoked",
      revokedAt: /* @__PURE__ */ new Date()
    });
  } catch (e) {
    return jsonError(`\xC9chec de la r\xE9vocation : ${e.message}`, 500, origin);
  }
  try {
    if (secondary.email) {
      await sendSecondaryRevokedEmail(env, secondary.email, payload.email || "", pool?.name || "");
    }
  } catch (e) {
    console.error(`\xC9chec d'envoi email de r\xE9vocation : ${e.message}`);
  }
  return jsonResponse({ status: "revoked" }, 200, origin);
}
__name(handleRevokeSecondaryAccess, "handleRevokeSecondaryAccess");
async function handleRequestRevokeOwnAccess(request, env, origin) {
  const authHeader = request.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return jsonError("Authentification requise", 401, origin);
  let payload;
  try {
    payload = await verifyFirebaseIdToken(idToken);
  } catch (e) {
    return jsonError(`Token invalide : ${e.message}`, 401, origin);
  }
  const secondaryUid = payload.sub;
  const secondaryEmail = payload.email || "";
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Corps de requ\xEAte invalide", 400, origin);
  }
  const { primaryUid } = body;
  if (!primaryUid) return jsonError("primaryUid manquant", 400, origin);
  let link, secondaryConfig, primaryConfig;
  try {
    link = await firestoreGetDoc(env, `users/${secondaryUid}/linkedAccounts`, primaryUid);
    secondaryConfig = await firestoreGetDoc(env, `users/${secondaryUid}/config`, "main");
    primaryConfig = await firestoreGetDoc(env, `users/${primaryUid}/config`, "main");
  } catch (e) {
    return jsonError(`Erreur serveur : ${e.message}`, 500, origin);
  }
  if (!link || link.status !== "active") {
    return jsonError("Acc\xE8s introuvable ou d\xE9j\xE0 r\xE9voqu\xE9", 404, origin);
  }
  const pool = (primaryConfig?.pools || []).find((p) => p.id === link.poolId);
  const poolName = pool?.name || "";
  const secondaryDisplayName = secondaryConfig?.pseudo || secondaryEmail;
  const token = generateVerificationToken();
  const now = /* @__PURE__ */ new Date();
  const expiresAt = new Date(now.getTime() + REVOCATION_TOKEN_TTL_HOURS * 3600 * 1e3);
  try {
    await firestoreCreateDoc(env, "revocationRequests", token, {
      primaryUid,
      primaryEmail: link.primaryEmail || "",
      secondaryUid,
      secondaryEmail,
      secondaryPseudo: secondaryDisplayName,
      poolId: link.poolId || "",
      poolName,
      createdAt: now,
      expiresAt,
      status: "pending"
    });
    await sendRevocationRequestEmail(env, link.primaryEmail, secondaryDisplayName, poolName, token);
  } catch (e) {
    return jsonError(`\xC9chec de la demande : ${e.message}`, 500, origin);
  }
  return jsonResponse({ success: true }, 200, origin);
}
__name(handleRequestRevokeOwnAccess, "handleRequestRevokeOwnAccess");
async function handleRevocationRequestInfo(request, env, origin) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) return jsonError("token manquant", 400, origin);
  let reqDoc;
  try {
    reqDoc = await firestoreGetDoc(env, "revocationRequests", token);
  } catch (e) {
    return jsonError(`Erreur serveur : ${e.message}`, 500, origin);
  }
  if (!reqDoc) return jsonResponse({ status: "invalid" }, 404, origin);
  if (reqDoc.status !== "pending") {
    return jsonResponse({ status: reqDoc.status }, 200, origin);
  }
  if (reqDoc.expiresAt && reqDoc.expiresAt.getTime() < Date.now()) {
    return jsonResponse({ status: "expired" }, 410, origin);
  }
  return jsonResponse(
    {
      status: "pending",
      secondaryPseudo: reqDoc.secondaryPseudo || reqDoc.secondaryEmail,
      poolName: reqDoc.poolName || ""
    },
    200,
    origin
  );
}
__name(handleRevocationRequestInfo, "handleRevocationRequestInfo");
async function handleRespondRevocation(request, env, origin) {
  const authHeader = request.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return jsonError("Authentification requise", 401, origin);
  let payload;
  try {
    payload = await verifyFirebaseIdToken(idToken);
  } catch (e) {
    return jsonError(`Token invalide : ${e.message}`, 401, origin);
  }
  const callerUid = payload.sub;
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Corps de requ\xEAte invalide", 400, origin);
  }
  const { token } = body;
  if (!token) return jsonError("token manquant", 400, origin);
  let reqDoc;
  try {
    reqDoc = await firestoreGetDoc(env, "revocationRequests", token);
  } catch (e) {
    return jsonError(`Erreur serveur : ${e.message}`, 500, origin);
  }
  if (!reqDoc) return jsonResponse({ status: "invalid" }, 404, origin);
  if (reqDoc.status !== "pending") {
    return jsonResponse({ status: reqDoc.status }, 200, origin);
  }
  if (reqDoc.expiresAt && reqDoc.expiresAt.getTime() < Date.now()) {
    return jsonResponse({ status: "expired" }, 410, origin);
  }
  if (reqDoc.primaryUid !== callerUid) {
    return jsonError("Cette demande ne concerne pas ton compte", 403, origin);
  }
  try {
    await firestorePatchDoc(env, `users/${reqDoc.primaryUid}/secondaryUsers`, reqDoc.secondaryUid, {
      status: "revoked",
      revokedAt: /* @__PURE__ */ new Date()
    });
    await firestorePatchDoc(env, `users/${reqDoc.secondaryUid}/linkedAccounts`, reqDoc.primaryUid, {
      status: "revoked",
      revokedAt: /* @__PURE__ */ new Date()
    });
    await firestorePatchDoc(env, "revocationRequests", token, { status: "done" });
  } catch (e) {
    return jsonError(`\xC9chec de la r\xE9vocation : ${e.message}`, 500, origin);
  }
  try {
    if (reqDoc.secondaryEmail) {
      await sendSecondaryRevokedEmail(env, reqDoc.secondaryEmail, payload.email || "", reqDoc.poolName || "");
    }
  } catch (e) {
    console.error(`\xC9chec d'envoi email de r\xE9vocation : ${e.message}`);
  }
  return jsonResponse({ status: "done", poolName: reqDoc.poolName || "" }, 200, origin);
}
__name(handleRespondRevocation, "handleRespondRevocation");
async function handleSetPseudo(request, env, origin) {
  const authHeader = request.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return jsonError("Authentification requise", 401, origin);
  let payload;
  try {
    payload = await verifyFirebaseIdToken(idToken);
  } catch (e) {
    return jsonError(`Token invalide : ${e.message}`, 401, origin);
  }
  const uid = payload.sub;
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Corps de requ\xEAte invalide", 400, origin);
  }
  const pseudo = (body.pseudo || "").trim();
  if (!PSEUDO_REGEX.test(pseudo)) {
    return jsonError("Pseudo invalide (2 \xE0 24 caract\xE8res, lettres/chiffres/espaces/tirets)", 400, origin);
  }
  const key = normalizePseudoKey(pseudo);
  let config, existing;
  try {
    config = await firestoreGetDoc(env, `users/${uid}/config`, "main");
    existing = await firestoreGetDoc(env, "pseudos", key);
  } catch (e) {
    return jsonError(`Erreur serveur : ${e.message}`, 500, origin);
  }
  if (existing && existing.uid !== uid) {
    let suggestion = null;
    for (let i = 2; i <= 50; i++) {
      const candidate = `${pseudo}${i}`;
      const candidateKey = normalizePseudoKey(candidate);
      let candidateDoc;
      try {
        candidateDoc = await firestoreGetDoc(env, "pseudos", candidateKey);
      } catch (e) {
        return jsonError(`Erreur serveur : ${e.message}`, 500, origin);
      }
      if (!candidateDoc) {
        suggestion = candidate;
        break;
      }
    }
    return jsonResponse({ available: false, suggestion }, 409, origin);
  }
  const oldPseudo = config?.pseudo || null;
  const oldKey = oldPseudo ? normalizePseudoKey(oldPseudo) : null;
  try {
    if (oldKey && oldKey !== key) {
      await firestoreDeleteDoc(env, "pseudos", oldKey);
    }
    await firestoreSetDoc(env, "pseudos", key, { uid, pseudo, createdAt: /* @__PURE__ */ new Date() });
    await firestorePatchDoc(env, `users/${uid}/config`, "main", { pseudo });
  } catch (e) {
    return jsonError(`\xC9chec de l'enregistrement : ${e.message}`, 500, origin);
  }
  return jsonResponse({ available: true, pseudo }, 200, origin);
}
__name(handleSetPseudo, "handleSetPseudo");
async function handleListPendingInvitations(request, env, origin) {
  const authHeader = request.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return jsonError("Authentification requise", 401, origin);
  let payload;
  try {
    payload = await verifyFirebaseIdToken(idToken);
  } catch (e) {
    return jsonError(`Token invalide : ${e.message}`, 401, origin);
  }
  const primaryUid = payload.sub;
  let mineRaw;
  try {
    mineRaw = await firestoreQueryDocsByEquality(env, "invitations", {
      primaryUid,
      status: "pending"
    });
  } catch (e) {
    return jsonError(`Erreur serveur : ${e.message}`, 500, origin);
  }
  const now = Date.now();
  const mine = mineRaw.map((inv) => ({
    token: inv.id,
    invitedEmail: inv.invitedEmail,
    poolId: inv.poolId,
    poolName: inv.poolName || "",
    createdAt: inv.createdAt,
    expiresAt: inv.expiresAt,
    expired: inv.expiresAt ? inv.expiresAt.getTime() < now : false
  }));
  return jsonResponse({ invitations: mine }, 200, origin);
}
__name(handleListPendingInvitations, "handleListPendingInvitations");
async function handleCancelInvitation(request, env, origin) {
  const authHeader = request.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return jsonError("Authentification requise", 401, origin);
  let payload;
  try {
    payload = await verifyFirebaseIdToken(idToken);
  } catch (e) {
    return jsonError(`Token invalide : ${e.message}`, 401, origin);
  }
  const primaryUid = payload.sub;
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Corps de requ\xEAte invalide", 400, origin);
  }
  const { token } = body;
  if (!token) return jsonError("token manquant", 400, origin);
  let invitation;
  try {
    invitation = await firestoreGetDoc(env, "invitations", token);
  } catch (e) {
    return jsonError(`Erreur serveur : ${e.message}`, 500, origin);
  }
  if (!invitation) return jsonError("Invitation introuvable", 404, origin);
  if (invitation.primaryUid !== primaryUid) {
    return jsonError("Cette invitation ne t'appartient pas", 403, origin);
  }
  if (invitation.status !== "pending") {
    return jsonError("Cette invitation n'est plus en attente", 409, origin);
  }
  try {
    await firestoreDeleteDoc(env, "invitations", token);
  } catch (e) {
    return jsonError(`\xC9chec de l'annulation : ${e.message}`, 500, origin);
  }
  return jsonResponse({ status: "cancelled" }, 200, origin);
}
__name(handleCancelInvitation, "handleCancelInvitation");
async function handleInvitationInfo(request, env, origin) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) return jsonError("token manquant", 400, origin);
  let invitation;
  try {
    invitation = await firestoreGetDoc(env, "invitations", token);
  } catch (e) {
    return jsonError(`Erreur serveur : ${e.message}`, 500, origin);
  }
  if (!invitation) return jsonResponse({ status: "invalid" }, 404, origin);
  if (invitation.status !== "pending") {
    return jsonResponse({ status: invitation.status }, 200, origin);
  }
  if (invitation.expiresAt && invitation.expiresAt.getTime() < Date.now()) {
    return jsonResponse({ status: "expired" }, 410, origin);
  }
  let primaryConfig = null;
  try {
    primaryConfig = await firestoreGetDoc(env, `users/${invitation.primaryUid}/config`, "main");
  } catch (e) {
  }
  return jsonResponse(
    {
      status: "pending",
      primaryEmail: invitation.primaryEmail,
      primaryPseudo: primaryConfig?.pseudo || invitation.primaryEmail,
      poolName: invitation.poolName || ""
    },
    200,
    origin
  );
}
__name(handleInvitationInfo, "handleInvitationInfo");
async function handleAnthropicProxy(request, env, origin) {
  const authHeader = request.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) {
    return jsonError("Authentification requise", 401, origin);
  }
  let uid;
  try {
    const payload = await verifyFirebaseIdToken(idToken);
    uid = payload.sub;
  } catch (e) {
    return jsonError(`Token invalide : ${e.message}`, 401, origin);
  }
  let userConfig;
  try {
    userConfig = await firestoreGetDoc(env, `users/${uid}/config`, "main");
  } catch (e) {
    return jsonError(`Erreur serveur : ${e.message}`, 500, origin);
  }
  if (!userConfig?.isPremium) {
    return jsonError("Analyse IA r\xE9serv\xE9e aux comptes premium", 403, origin);
  }
  try {
    const rateCheck = await checkAndIncrementRateLimit(env, uid);
    if (!rateCheck.allowed) {
      return jsonError(
        `Limite quotidienne d'analyses atteinte (${DAILY_LIMIT_PER_UID}/jour). R\xE9essaie demain.`,
        429,
        origin
      );
    }
  } catch (e) {
    console.error(`Rate-limit check \xE9chou\xE9 pour ${uid} : ${e.message}`);
  }
  let body;
  try {
    body = await request.text();
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  const upstream = await fetch(`${ANTHROPIC_API}/v1/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": request.headers.get("anthropic-version") || "2023-06-01"
    },
    body
  });
  const responseHeaders = {
    ...corsHeaders(origin),
    "Content-Type": "application/json",
    "x-verified-uid": uid
  };
  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders
  });
}
__name(handleAnthropicProxy, "handleAnthropicProxy");
async function handleStripeCreateCheckoutSession(request, env, origin) {
  const authHeader = request.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return jsonError("Authentification requise", 401, origin);
  let uid;
  try {
    const payload = await verifyFirebaseIdToken(idToken);
    uid = payload.sub;
  } catch (e) {
    return jsonError(`Token invalide : ${e.message}`, 401, origin);
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Corps de requ\xEAte invalide", 400, origin);
  }
  const priceId = body.plan === "yearly" ? env.STRIPE_PRICE_YEARLY : env.STRIPE_PRICE_MONTHLY;
  if (!priceId) return jsonError("Plan invalide", 400, origin);
  let existingCustomerId = null;
  try {
    const config = await firestoreGetDoc(env, `users/${uid}/config`, "main");
    existingCustomerId = config?.subscription?.stripeCustomerId || null;
  } catch (e) {
    console.error(`Lecture config \xE9chou\xE9e pour ${uid} : ${e.message}`);
  }
  const params = {
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: uid,
    success_url: `${origin}/?stripe=success`,
    cancel_url: `${origin}/?stripe=cancel`,
    // v1.89.0 — metadata portée par l'abonnement lui-même (pas seulement la
    // session) : les events customer.subscription.* n'ont pas client_reference_id,
    // mais héritent de subscription_data.metadata. C'est notre lien uid <-> abonnement.
    subscription_data: { metadata: { uid } }
  };
  if (existingCustomerId) {
    params.customer = existingCustomerId;
  }
  try {
    const session = await stripeApiRequest(env, "/checkout/sessions", params);
    return jsonResponse({ url: session.url }, 200, origin);
  } catch (e) {
    console.error(`Cr\xE9ation session Checkout \xE9chou\xE9e pour ${uid} : ${e.message}`);
    return jsonError("Impossible de cr\xE9er la session de paiement", 500, origin);
  }
}
__name(handleStripeCreateCheckoutSession, "handleStripeCreateCheckoutSession");
async function handleStripeCreatePortalSession(request, env, origin) {
  const authHeader = request.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return jsonError("Authentification requise", 401, origin);
  let uid;
  try {
    const payload = await verifyFirebaseIdToken(idToken);
    uid = payload.sub;
  } catch (e) {
    return jsonError(`Token invalide : ${e.message}`, 401, origin);
  }
  let customerId;
  try {
    const config = await firestoreGetDoc(env, `users/${uid}/config`, "main");
    customerId = config?.subscription?.stripeCustomerId;
  } catch (e) {
    return jsonError("Impossible de lire l'abonnement", 500, origin);
  }
  if (!customerId) return jsonError("Aucun abonnement actif", 400, origin);
  try {
    const portalSession = await stripeApiRequest(env, "/billing_portal/sessions", {
      customer: customerId,
      return_url: `${origin}/`
    });
    return jsonResponse({ url: portalSession.url }, 200, origin);
  } catch (e) {
    console.error(`Cr\xE9ation session Portal \xE9chou\xE9e pour ${uid} : ${e.message}`);
    return jsonError("Impossible d'ouvrir la gestion d'abonnement", 500, origin);
  }
}
__name(handleStripeCreatePortalSession, "handleStripeCreatePortalSession");
async function handleStripeWebhook(request, env, origin) {
  const rawBody = await request.text();
  const sigHeader = request.headers.get("stripe-signature");
  try {
    await verifyStripeSignature(rawBody, sigHeader, env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    console.error(`Signature webhook Stripe invalide : ${e.message}`);
    return new Response("Signature invalide", { status: 400 });
  }
  const event = JSON.parse(rawBody);
  try {
    await firestoreCreateDoc(env, "stripeEvents", event.id, {
      type: event.type,
      processedAt: /* @__PURE__ */ new Date()
    });
  } catch (e) {
    return jsonResponse({ received: true, alreadyProcessed: true }, 200, "");
  }
  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const uid = session.client_reference_id;
      if (uid && session.customer) {
        await firestorePatchDoc(env, `users/${uid}/config`, "main", {
          subscription: { stripeCustomerId: session.customer }
        });
        await firestoreSetDoc(env, "stripeCustomers", session.customer, { uid });
      }
    }
    if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const sub = event.data.object;
      let uid = sub.metadata?.uid;
      if (!uid) {
        const mapping = await firestoreGetDoc(env, "stripeCustomers", sub.customer);
        uid = mapping?.uid;
      }
      if (uid) {
        const isPremium = sub.status === "active";
        await firestorePatchDoc(env, `users/${uid}/config`, "main", { isPremium });
        try {
          const priceId = sub.items?.data?.[0]?.price?.id;
          const plan = planFromPriceId(env, priceId);
          const rawPeriodEnd = sub.items?.data?.[0]?.current_period_end ?? sub.current_period_end;
          const currentPeriodEnd = typeof rawPeriodEnd === "number" ? new Date(rawPeriodEnd * 1e3) : null;
          await firestorePatchDoc(env, `users/${uid}/config`, "main", {
            subscription: {
              status: sub.status,
              plan: plan || null,
              stripeCustomerId: sub.customer,
              currentPeriodEnd
            }
          });
        } catch (e) {
          console.error(`\xC9criture d\xE9tail subscription \xE9chou\xE9e pour ${uid} (isPremium=${isPremium} d\xE9j\xE0 \xE9crit) : ${e.message}`);
        }
      } else {
        console.error(`Abonnement Stripe ${sub.id} sans uid retrouvable (customer ${sub.customer})`);
      }
    }
  } catch (e) {
    console.error(`Traitement event Stripe ${event.type} \xE9chou\xE9 : ${e.message}`);
  }
  return jsonResponse({ received: true }, 200, "");
}
__name(handleStripeWebhook, "handleStripeWebhook");
async function handlePlayBillingVerifyPurchase(request, env, origin) {
  const authHeader = request.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return jsonError("Authentification requise", 401, origin);
  let uid;
  try {
    const payload = await verifyFirebaseIdToken(idToken);
    uid = payload.sub;
  } catch (e) {
    return jsonError(`Token invalide : ${e.message}`, 401, origin);
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Corps de requ\xEAte invalide", 400, origin);
  }
  const { purchaseToken } = body;
  if (!purchaseToken) return jsonError("purchaseToken manquant", 400, origin);
  let purchase;
  try {
    purchase = await fetchPlaySubscriptionPurchase(env, purchaseToken);
  } catch (e) {
    console.error(`V\xE9rification achat Play Billing \xE9chou\xE9e pour ${uid} : ${e.message}`);
    return jsonError("Impossible de v\xE9rifier l'achat", 500, origin);
  }
  const productId = purchase.lineItems?.[0]?.productId;
  const plan = planFromPlayProductId(productId);
  if (!plan) {
    console.error(`Achat Play Billing avec productId inattendu (${productId}) pour ${uid}`);
    return jsonError("Produit inconnu", 400, origin);
  }
  const isPremium = purchase.subscriptionState === "SUBSCRIPTION_STATE_ACTIVE";
  if (isPremium && purchase.acknowledgementState !== "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED") {
    try {
      await acknowledgePlaySubscriptionPurchase(env, productId, purchaseToken);
    } catch (e) {
      console.error(`Acknowledge Play Billing \xE9chou\xE9 pour ${uid} (productId=${productId}) : ${e.message}`);
    }
  }
  try {
    await firestorePatchDoc(env, `users/${uid}/config`, "main", {
      isPremium,
      subscription: {
        status: purchase.subscriptionState,
        plan,
        provider: "play"
      }
    });
    await firestoreSetDoc(env, "playPurchaseTokens", purchaseToken, { uid });
  } catch (e) {
    console.error(`\xC9criture Firestore \xE9chou\xE9e apr\xE8s achat Play Billing pour ${uid} : ${e.message}`);
    return jsonError("Achat v\xE9rifi\xE9 mais activation \xE9chou\xE9e, r\xE9essaie", 500, origin);
  }
  return jsonResponse({ success: true, isPremium }, 200, origin);
}
__name(handlePlayBillingVerifyPurchase, "handlePlayBillingVerifyPurchase");
async function handlePlayBillingRTDN(request, env, origin) {
  const url = new URL(request.url);
  if (url.searchParams.get("key") !== env.PLAY_BILLING_RTDN_SECRET) {
    return new Response("Non autoris\xE9", { status: 401 });
  }
  let envelope;
  try {
    envelope = await request.json();
  } catch {
    return new Response("Corps de requ\xEAte invalide", { status: 400 });
  }
  const message = envelope.message;
  if (!message?.data) return new Response("Message vide, ignor\xE9", { status: 200 });
  try {
    await firestoreCreateDoc(env, "playBillingRtdnEvents", message.messageId, {
      processedAt: /* @__PURE__ */ new Date()
    });
  } catch (e) {
    return new Response("D\xE9j\xE0 trait\xE9", { status: 200 });
  }
  let notification;
  try {
    const decoded = atob(message.data);
    notification = JSON.parse(decoded);
  } catch (e) {
    console.error(`RTDN Play Billing : payload illisible (${e.message})`);
    return new Response("Payload illisible", { status: 200 });
  }
  if (notification.testNotification) {
    return new Response("Notification de test re\xE7ue", { status: 200 });
  }
  const sub = notification.subscriptionNotification;
  if (!sub?.purchaseToken) {
    return new Response("Notification sans purchaseToken, ignor\xE9e", { status: 200 });
  }
  let uid;
  try {
    const mapping = await firestoreGetDoc(env, "playPurchaseTokens", sub.purchaseToken);
    uid = mapping?.uid;
  } catch (e) {
    console.error(`Lecture playPurchaseTokens \xE9chou\xE9e (token ${sub.purchaseToken}) : ${e.message}`);
  }
  if (!uid) {
    console.error(`RTDN Play Billing : aucun uid retrouv\xE9 pour le token ${sub.purchaseToken}`);
    return new Response("uid introuvable, ignor\xE9", { status: 200 });
  }
  try {
    const purchase = await fetchPlaySubscriptionPurchase(env, sub.purchaseToken);
    const productId = purchase.lineItems?.[0]?.productId;
    const plan = planFromPlayProductId(productId);
    const isPremium = purchase.subscriptionState === "SUBSCRIPTION_STATE_ACTIVE";
    await firestorePatchDoc(env, `users/${uid}/config`, "main", {
      isPremium,
      subscription: {
        status: purchase.subscriptionState,
        plan: plan || null,
        provider: "play"
      }
    });
  } catch (e) {
    console.error(`Traitement RTDN Play Billing \xE9chou\xE9 pour ${uid} : ${e.message}`);
  }
  return new Response("OK", { status: 200 });
}
__name(handlePlayBillingRTDN, "handlePlayBillingRTDN");
var poolgenai_proxy_default = {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    const url = new URL(request.url);
    if (request.method === "GET") {
      if (url.pathname === "/product-photo") {
        return handleProductPhotoServe(request, env, origin);
      }
      if (url.pathname === "/list-pending-invitations") {
        return handleListPendingInvitations(request, env, origin);
      }
      if (url.pathname === "/invitation-info") {
        return handleInvitationInfo(request, env, origin);
      }
      if (url.pathname === "/revocation-info") {
        return handleRevocationRequestInfo(request, env, origin);
      }
      if (url.pathname === "/strip-reference-data") {
        return handleStripReferenceData(request, env, origin);
      }
      if (url.pathname === "/strip-calibration-model") {
        return handleStripCalibrationModel(request, env, origin);
      }
      return new Response("Not found", { status: 404 });
    }
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }
    if (url.pathname === "/v1/messages") {
      return handleAnthropicProxy(request, env, origin);
    }
    if (url.pathname === "/send-verification-email") {
      return handleSendVerificationEmail(request, env, origin);
    }
    if (url.pathname === "/verify-email") {
      return handleVerifyEmail(request, env, origin);
    }
    if (url.pathname === "/account-data-request") {
      return handleAccountDataRequest(request, env, origin);
    }
    if (url.pathname === "/product-lookup") {
      return handleProductLookup(request, env, origin);
    }
    if (url.pathname === "/product-create") {
      return handleProductCreate(request, env, origin);
    }
    if (url.pathname === "/product-use") {
      return handleProductUse(request, env, origin);
    }
    if (url.pathname === "/product-enrich-packaging") {
      return handleProductEnrichPackaging(request, env, origin);
    }
    if (url.pathname === "/product-recheck") {
      return handleProductRecheck(request, env, origin);
    }
    if (url.pathname === "/confirm-merge") {
      return handleConfirmMerge(request, env, origin);
    }
    if (url.pathname === "/product-photo-upload") {
      return handleProductPhotoUpload(request, env, origin);
    }
    if (url.pathname === "/invite-secondary-user") {
      return handleInviteSecondaryUser(request, env, origin);
    }
    if (url.pathname === "/respond-invitation") {
      return handleRespondInvitation(request, env, origin);
    }
    if (url.pathname === "/revoke-secondary-access") {
      return handleRevokeSecondaryAccess(request, env, origin);
    }
    if (url.pathname === "/request-revoke-own-access") {
      return handleRequestRevokeOwnAccess(request, env, origin);
    }
    if (url.pathname === "/respond-revocation") {
      return handleRespondRevocation(request, env, origin);
    }
    if (url.pathname === "/set-pseudo") {
      return handleSetPseudo(request, env, origin);
    }
    if (url.pathname === "/cancel-invitation") {
      return handleCancelInvitation(request, env, origin);
    }
    if (url.pathname === "/strip-model-signal") {
      return handleStripModelSignal(request, env, origin);
    }
    if (url.pathname === "/stripe/create-checkout-session") {
      return handleStripeCreateCheckoutSession(request, env, origin);
    }
    if (url.pathname === "/stripe/create-portal-session") {
      return handleStripeCreatePortalSession(request, env, origin);
    }
    if (url.pathname === "/stripe/webhook") {
      return handleStripeWebhook(request, env, origin);
    }
    if (url.pathname === "/playbilling/verify-purchase") {
      return handlePlayBillingVerifyPurchase(request, env, origin);
    }
    if (url.pathname === "/playbilling/rtdn") {
      return handlePlayBillingRTDN(request, env, origin);
    }
    return new Response("Not found", { status: 404 });
  },
  // Deux Cron Triggers à configurer dans le dashboard Cloudflare (Workers &
  // Pages → ce Worker → Settings → Triggers → Cron Triggers → Add) :
  //   - CRON_CLEANUP_TOKENS ("1 0 1 * *")     : nettoyage mensuel, existant
  //   - CRON_AGGREGATE_CALIBRATION ("0 3 * * *") : agrégation quotidienne, nouveau
  // event.cron permet de distinguer laquelle a déclenché l'appel.
  async scheduled(event, env, ctx) {
    if (event.cron === CRON_CLEANUP_TOKENS) {
      ctx.waitUntil(
        cleanupExpiredVerificationTokens(env).catch(
          (e) => console.error(`\xC9chec du nettoyage planifi\xE9 : ${e.message}`)
        )
      );
    }
    if (event.cron === CRON_AGGREGATE_CALIBRATION) {
      ctx.waitUntil(
        aggregateCalibrationModels(env).catch(
          (e) => console.error(`\xC9chec de l'agr\xE9gation calibrationModels : ${e.message}`)
        )
      );
    }
  }
};
export {
  poolgenai_proxy_default as default
};
//# sourceMappingURL=poolgenai-proxy.js.map
