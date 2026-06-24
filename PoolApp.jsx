const { useState, useEffect, useMemo, useRef } = React;
const {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, Legend
} = Recharts;
const {
  Plus, Trash2, Droplets, X, ChevronRight, ChevronDown, Settings2, AlertTriangle, CheckCircle2,
  History, Beaker, Camera, Lock, Crown, ImageOff, Sparkles, Loader2, Clock, FileText, Download
} = LucideReact;

// ---------- Constantes / cibles ----------
const APP_VERSION = "0.72";

const TRANSLATIONS = {
  fr: {
    // Navigation
    tab_pool: "Bassin",
    tab_history: "Historique",
    tab_products: "Produits",
    tab_settings: "Réglages",
    // Header
    premium_badge: "Premium",
    // Dashboard
    last_measure: "DERNIÈRE MESURE",
    modify: "Modifier",
    new_measure: "Nouvelle mesure",
    treatment_plan: "PLAN DE TRAITEMENT",
    all_in_range: "Tous les paramètres mesurés sont dans la cible.",
    no_measure: "Aucune mesure enregistrée",
    no_measure_sub: "Ajoute ta première série de mesures pour voir l'état de ton bassin et les traitements recommandés.",
    add_measure: "Ajouter une mesure",
    daily_limit: "Limite quotidienne atteinte — passer en illimité",
    apply_advice: "Appliquer ces conseils",
    apply_advice_sub: "Sélectionne les conseils à appliquer puis saisis les quantités réelles.",
    advice_applied: "Conseils appliqués",
    advice_partial: "partiellement appliqués",
    adjust: "Ajuster",
    ai_analysis: "ANALYSE IA",
    ai_analyze_btn: "Analyser avec Claude",
    ai_locked: "Fonctionnalité réservée à la version illimitée",
    ai_analyzing: "Analyse en cours…",
    ai_api_missing: "Renseigne ta clé API dans les Réglages pour activer l'analyse IA.",
    follow_order: "Suis les étapes dans l'ordre : chaque traitement modifie l'équilibre de l'eau et peut fausser le suivant s'il n'a pas eu le temps d'agir.",
    // Status
    in_range: "Dans la cible",
    too_high: "Trop haut",
    too_low: "Trop bas",
    target: "cible",
    // History
    evolution: "Évolution",
    show_values: "Afficher les valeurs sur le graphique",
    journal: "Journal",
    no_history: "Pas encore d'historique",
    no_history_sub: "Tes mesures apparaîtront ici au fil du temps.",
    report: "Rapport",
    generate_report: "Générer le rapport de ce bassin",
    report_locked: "Rapport PDF réservé à la version illimitée",
    report_desc: "Le rapport reprend l'historique des mesures, les conseils donnés et les quantités réellement appliquées pour ce bassin.",
    // Measure modal
    new_measure_title: "Nouvelle mesure",
    edit_measure_title: "Modifier la mesure",
    date_time: "Date et heure",
    photo_hint: "Prends en photo l'écran de ton photomètre avec les valeurs lisibles, ou place ta bandelette imbibée à côté de la légende du tube et photographie les deux ensemble.",
    photos_label: "Photos de la mesure",
    camera_btn: "Appareil photo",
    gallery_btn: "Bibliothèque",
    other_photo: "Autre photo",
    other_gallery: "Autre depuis biblio",
    photos_done: "Tu as terminé d'ajouter des photos ?",
    yes_analyze: "Oui, analyser",
    add_more: "Ajouter d'autres",
    analyze_btn: "Analyser",
    analyzing: "Analyse en cours...",
    analyze_locked: "Photo + analyse IA réservées à la version illimitée",
    note_optional: "Note (optionnel)",
    note_placeholder: "Eau trouble, fort ensoleillement, baignade prévue...",
    save_measure: "Enregistrer la mesure",
    save_changes: "Enregistrer les modifications",
    // Products
    my_products: "MES PRODUITS",
    products_formula: "Le dosage est calculé selon : {quantité produit} pour faire varier le paramètre de {effet} sur {volume de référence} m³. Ces produits sont propres à ce bassin.",
    products_locked: "Fonctionnalité réservée à la version illimitée",
    stock_not_managed: "La gestion du stock n'est pas activée pour ce bassin. Active-la dans Réglages pour gérer les quantités et voir les consommations.",
    activate_in_settings: "Activer dans Réglages →",
    delete_all_products: "Supprimer tous les produits de ce bassin",
    stock_label: "Stock :",
    stock_remaining: "restant",
    // Product modal
    edit_product: "Modifier le produit",
    new_product: "Nouveau produit",
    product_photo: "Photo du produit (étiquette)",
    product_name: "Nom du produit",
    effect: "Effet",
    quantity: "Quantité",
    effect_variation: "Effet (variation)",
    for_x_m3: "Pour X m³",
    wait_hours: "Délai d'attente avant le traitement suivant (heures)",
    container_size: "Taille du contenant",
    current_stock: "Stock actuel",
    new_product_btn: "Produit neuf (100 %)",
    manual_entry: "Saisir manuellement",
    note_precaution: "Note / précaution",
    save_product: "Enregistrer le produit",
    stock_not_managed_modal: "La gestion du stock n'est pas activée pour ce bassin.",
    stock_locked: "Gestion du stock réservée à la version illimitée",
    last_consumptions: "10 dernières consommations",
    // Apply modal
    apply_title: "Appliquer ces conseils",
    apply_subtitle: "Sélectionne les conseils que tu as appliqués pour la mesure du",
    confirm_btn: "Confirmer",
    confirm_count: "conseil",
    confirm_count_plural: "conseils",
    quantities_title: "Quantités appliquées",
    quantities_subtitle: "Ajuste les quantités si besoin — ces informations serviront pour ton rapport.",
    quantity_applied: "Quantité appliquée",
    unit: "Unité",
    back_btn: "← Retour",
    validate_btn: "Valider",
    stock_empty: "Stock épuisé pour ce produit.",
    add_arrow: "Ajouter →",
    // Settings
    settings_title: "Réglages",
    my_pools: "Mes bassins",
    pool_name: "Nom du bassin",
    location: "Localisation",
    volume: "Volume (m³)",
    treatment_type: "Type de traitement",
    filtration_type: "Type de filtration",
    manage_stock_label: "Gestion du stock",
    manage_stock_desc: "Suit la consommation des produits et l\'affiche dans le rapport.",
    manage_stock_locked: "Disponible en version illimitée",
    api_key_label: "Clé API Anthropic ou URL du proxy Cloudflare Worker",
    provider_label: "Provider",
    api_key_placeholder: "sk-ant-... ou https://mon-proxy.workers.dev",
    api_key_desc: "Ta clé est stockée localement. Pour Anthropic, saisis une clé sk-ant-... ou l'URL de ton proxy Cloudflare Worker (recommandé).",
    premium_section: "VERSION",
    premium_label: "Version illimitée",
    premium_test: "Interrupteur de test — pas de vrai paiement ici",
    premium_desc: "En version gratuite : 1 mesure par jour (tous bassins confondus), plusieurs bassins avec photo d'identification. En illimité : mesures sans limite, photos sur mesures et produits.",
    delete_measures: "Supprimer toutes les mesures de ce bassin",
    sensitive_zone: "ZONE SENSIBLE",
    add_pool: "Ajouter un bassin",
    delete_pool: "Supprimer ce bassin",
    language_label: "Langue",
    // Report
    report_title: "Rapport de suivi",
    generated_on: "généré le",
    params_evolution: "ÉVOLUTION DES PARAMÈTRES",
    detailed_history: "HISTORIQUE DES MESURES ET CONSOMMATIONS",
    no_measures_report: "Aucune mesure enregistrée pour ce bassin.",
    date_col: "DATE",
    ph_col: "PH",
    cl_libre_col: "CL LIBRE",
    cl_total_col: "CL TOTAL",
    tac_col: "TAC",
    cya_col: "CYA",
    temp_col: "TEMP.",
    product_col: "Produit appliqué",
    quantity_col: "Quantité",
    stock_col: "Stock",
    download_pdf: "Télécharger PDF",
    close: "Fermer",
    delete: "Supprimer",
    // Reco
    wait_before_next: "Attendre {h}h avant le traitement suivant",
    start_after: "À débuter au moins {h}h après l'étape précédente",
    measure_after: "Attendre {h}h avant de mesurer à nouveau",
    missing_product: "non disponible dans tes produits",
    missing_product_tip: "Aucun produit {action} dans ta liste — ajoutes-en un dans l'onglet Produits.",
    see_dosage: "Voir dosage",
    // Paywall
    paywall_title: "Passer à la version illimitée",
    paywall_desc: "Mesures sans limite · Analyse IA des bandelettes · Rapport PDF · Gestion du stock",
    paywall_btn: "Activer la version illimitée",
    paywall_close: "Plus tard",
    // Pool
    add_pool_title: "Nouveau bassin",
    edit_pool_title: "Modifier le bassin",
    pool_name_placeholder: "Ma piscine",
    pool_location_placeholder: "Jardin, terrasse...",
    pool_volume_placeholder: "72",
    save_pool: "Enregistrer",
    // Misc
    loading: "Chargement...",
    error_analyze: "Analyse impossible",
    verify_connection: "Vérifie ta connexion et les photos.",
    free_version: "Gratuit",
    param_ph: "pH",
    param_fcl: "Chlore libre (mg/L)",
    axis_legend_u: "ᴜ échelle unités (pH, chlore) — gauche",
    action_ph_minus: "Baisse le pH",
        photos_section: "Photos des mesures",
    pool_photos_label: "Photos du bassin (optionnel)",
    pool_photo_locked: "Photos du bassin réservées à la version illimitée",
    sign_in: "Connexion",
    account_section: "Mon compte",
    confirm_password: "Confirmer le mot de passe",
    pwd_min6: "6 caractères minimum",
    error_pwd_mismatch: "Les mots de passe ne correspondent pas.",
    error_email_required: "Email invalide.",
    account_created: "Compte créé !",
    verify_email_notice: "Un email de confirmation a été envoyé à ton adresse. Clique sur le lien pour activer ton compte.",
    account_created_sub: "Bienvenue sur PoolApp. Tu peux maintenant utiliser l'app.",
    start_app: "Démarrer l'app",
    sign_out: "Se déconnecter",
    delete_account: "Supprimer mon compte",
    delete_account_confirm: "Supprimer définitivement ton compte et toutes tes données ? Cette action est irréversible.",
    reauth_required: "Reconnecte-toi d'abord pour pouvoir supprimer ton compte.",
    not_signed_in: "Non connecté — mode hors-ligne",
    create_account: "Créer un compte",
    reset_password: "Mot de passe oublié",
    continue_google: "Continuer avec Google",
    or: "ou",
    password: "Mot de passe",
    no_account: "Pas encore de compte ? S'inscrire",
    already_account: "Déjà un compte ? Se connecter",
    forgot_password: "Mot de passe oublié ?",
    back_to_login: "← Retour à la connexion",
    send_reset: "Envoyer le lien",
    reset_sent: "Email de réinitialisation envoyé.",
    skip_login: "Continuer sans compte",
    wrong_password: "Mot de passe incorrect.",
    user_not_found: "Aucun compte avec cet email.",
    email_in_use: "Cet email est déjà utilisé.",
    weak_password: "Mot de passe trop court (6 caractères min).",
    firebase_not_configured: "⚠️ Firebase non configuré — fonctionnement hors-ligne uniquement.",
    note_ph_minus: "Vérifier le pH avant chaque ajout. Max 1 kg/100 m³/jour, ou espacer de 2h.",
    note_ph_plus: "Répartir sur tout le bassin, filtration en marche.",
    note_chlore_choc: "À verser le soir, soleil couché. Ne stabilise pas (n'augmente pas le CYA).",
    note_galets: "Augmente le CYA à chaque utilisation. À éviter si CYA déjà > 50 mg/L.",
    action_ph_plus: "Monte le pH",
    action_chlore: "Chlore non stabilisé (choc)",
    action_chlore_stabilise: "Chlore stabilisé (CYA +)",
    action_tac_plus: "Monte le TAC",
    action_brome: "Brome",
    action_o2: "Oxygène actif",
    action_sel: "Sel (salinité)",
    axis_legend_d: "ᴅ échelle dizaines (TAC, CYA, température) — droite",
    reco_tac_low: "TAC trop bas ({val} mg/L)",
    reco_ph_high: "pH trop haut ({val})",
    reco_ph_low: "pH trop bas ({val})",
    reco_cl_combined: "Chlore combiné élevé ({val} mg/L)",
    reco_cl_low: "Chlore libre trop bas ({val} mg/L)",
    reco_cl_high: "Chlore libre trop haut ({val} mg/L)",
    reco_brome_low: "Brome trop bas ({val} mg/L)",
    reco_o2_low: "Oxygène actif trop bas ({val} mg/L)",
    reco_sel_low: "Salinité trop basse ({val} mg/L)",
    reco_cya_high: "Stabilisant trop élevé ({val} mg/L)",
    reco_target: "pour viser",
    reco_dose_prefix: "≈",
    reco_no_product: "Aucun produit nécessaire",
    reco_water_renewal: "Renouvellement d'eau partiel",
    reco_water_renewal_text: "Renouveler ≈ {pct} % du volume pour revenir vers 40 mg/L",
    reco_cl_excess_text: "Laisser le chlore se dégrader naturellement au soleil, ne pas se baigner en attendant.",
    reco_cl_shock_text: "ce soir (choc renforcé)",
    reco_note_tac: "Un TAC bas rend le pH instable.",
    reco_note_combined: "Chlore combiné = chloramines, signe d'une désinfection insuffisante. Verser le soir, filtration en continu.",
    reco_note_sel: "Utiliser du sel spécial piscine (NaCl pur ≥ 99%). Dissoudre avant l'ajout ou verser directement près du skimmer, filtration en marche 24h.",
    reco_note_o2: "Ne pas mélanger avec le chlore. Filtration en marche pendant 4h.",
    reco_note_brome: "Verser loin des arrivées d'eau, filtration en marche.",
    reco_note_cya: "Aucun produit ne fait baisser le CYA chimiquement, seule la dilution fonctionne. Éviter le chlore stabilisé tant que le CYA est haut.",
    reco_fallback_tac: "Produit TAC+ (bicarbonate de sodium)",
    reco_fallback_ph_minus: "pH moins",
    reco_fallback_ph_plus: "pH plus",
    reco_fallback_chlore: "Chlore choc non stabilisé",
    reco_fallback_brome: "Brome (pastilles ou granulés)",
    reco_fallback_o2: "Oxygène actif (peroxyde d'hydrogène stabilisé)",
    reco_fallback_sel: "Sel de piscine (NaCl pur)",
    stock_empty_badge: "stock épuisé",
    paywall_perk1: "Mesures illimitées (au lieu d'1 par jour)",
    paywall_perk2: "Photos photomètre/bandelette avec analyse IA",
    paywall_perk3: "Photos du bassin attachées à chaque mesure",
    paywall_perk4: "Photo de chaque produit (étiquette, dosage)",

    paywall_perk5: "Historique illimité + rapport PDF",
    paywall_perk6: "Gestion du stock de produits",
    paywall_perk7: "Multi-bassins",
    paywall_test_note: "Ceci est une version de test. Aucun paiement réel n'est effectué.",
    report_print_btn: "Imprimer / Enregistrer en PDF",
    pool_photo: "Photo du bassin",
    remove: "Retirer",
    create_pool: "Créer le bassin",
    param_tcl: "Chlore total (mg/L)",
    param_tac: "TAC (mg/L)",
    param_cya: "Stabilisant CYA (mg/L)",
    param_temp: "Température de l'eau (°C)",
    param_sel: "Salinité / sel (mg/L)",
    param_brome: "Brome (mg/L)",
    param_o2: "Oxygène actif (mg/L)",
    unlimited_version: "Illimité",
    active_pool: "Bassin actif",
    pool_volume: "Volume du bassin (m³)",
    treatment_params: "Paramètres :",
    treatment_desc: "Le traitement détermine quels paramètres sont mesurés et les cibles recommandées. Le volume est utilisé pour calculer les doses de produits.",
    subscription: "Abonnement",
    unlimited_active: "Mode illimité actif",
    free_mode: "Version gratuite",
    api_section: "Clé API (analyse IA)",
    ai_locked_settings: "Analyse IA réservée à la version illimitée",
    api_key_openai: "Clé API OpenAI",
    hide: "Masquer",
    show: "Afficher",
    treatment_chlore: "Chlore",
    treatment_chlore_desc: "Chlore stabilisé ou non, usage courant",
    treatment_sel: "Sel (électrolyseur)",
    treatment_sel_desc: "Électrolyseur au sel, le chlore est produit en continu",
    treatment_brome: "Brome",
    treatment_brome_desc: "Traitement au brome, courant pour spas et piscines intérieures",
    treatment_o2: "Oxygène actif / PHMB",
    treatment_o2_desc: "Sans chlore ni brome, adapté aux peaux sensibles",
    treatment_autre: "Autre (UV, ozone…)",
    treatment_autre_desc: "Système alternatif ou combiné, paramètres de base",
    filtration_sable: "Sable",
    filtration_cartouche: "Cartouche",
    filtration_diatomees: "Diatomées",
    filtration_aucune: "Sans filtration (naturelle)",
  },
  en: {
    tab_pool: "Pool",
    tab_history: "History",
    tab_products: "Products",
    tab_settings: "Settings",
    premium_badge: "Premium",
    last_measure: "LAST READING",
    modify: "Edit",
    new_measure: "New reading",
    treatment_plan: "TREATMENT PLAN",
    all_in_range: "All measured parameters are within target.",
    no_measure: "No readings recorded",
    no_measure_sub: "Add your first set of readings to see your pool status and treatment recommendations.",
    add_measure: "Add a reading",
    daily_limit: "Daily limit reached — go unlimited",
    apply_advice: "Apply these recommendations",
    apply_advice_sub: "Select the advice to apply then enter the actual quantities.",
    advice_applied: "Recommendations applied",
    advice_partial: "partially applied",
    adjust: "Adjust",
    ai_analysis: "AI ANALYSIS",
    ai_analyze_btn: "Analyze with Claude",
    ai_locked: "Feature reserved for the unlimited version",
    ai_analyzing: "Analyzing…",
    ai_api_missing: "Enter your API key in Settings to enable AI analysis.",
    follow_order: "Follow the steps in order: each treatment changes water balance and may skew the next if not given time to work.",
    in_range: "On target",
    too_high: "Too high",
    too_low: "Too low",
    target: "target",
    evolution: "Evolution",
    show_values: "Show values on chart",
    journal: "Log",
    no_history: "No history yet",
    no_history_sub: "Your readings will appear here over time.",
    report: "Report",
    generate_report: "Generate pool report",
    report_locked: "PDF report reserved for unlimited version",
    report_desc: "The report includes the reading history, advice given and quantities actually applied for this pool.",
    new_measure_title: "New reading",
    edit_measure_title: "Edit reading",
    date_time: "Date and time",
    photo_hint: "Take a photo of your photometer screen with readable values, or place your soaked test strip next to the tube legend and photograph both together.",
    photos_label: "Reading photos",
    camera_btn: "Camera",
    gallery_btn: "Library",
    other_photo: "Another photo",
    other_gallery: "Another from library",
    photos_done: "Done adding photos?",
    yes_analyze: "Yes, analyze",
    add_more: "Add more",
    analyze_btn: "Analyze",
    analyzing: "Analyzing...",
    analyze_locked: "Photo + AI analysis reserved for unlimited version",
    note_optional: "Note (optional)",
    note_placeholder: "Cloudy water, strong sun, swimming planned...",
    save_measure: "Save reading",
    save_changes: "Save changes",
    my_products: "MY PRODUCTS",
    products_formula: "Dosage calculated as: {quantity} to change parameter by {effect} per {volume} m³. These products are specific to this pool.",
    products_locked: "Feature reserved for the unlimited version",
    stock_not_managed: "Stock management is not enabled for this pool. Enable it in Settings to track quantities and view consumption.",
    activate_in_settings: "Enable in Settings →",
    delete_all_products: "Delete all products for this pool",
    stock_label: "Stock:",
    stock_remaining: "remaining",
    edit_product: "Edit product",
    new_product: "New product",
    product_photo: "Product photo (label)",
    product_name: "Product name",
    effect: "Effect",
    quantity: "Quantity",
    effect_variation: "Effect (change)",
    for_x_m3: "Per X m³",
    wait_hours: "Wait time before next treatment (hours)",
    container_size: "Container size",
    current_stock: "Current stock",
    new_product_btn: "New product (100%)",
    manual_entry: "Enter manually",
    note_precaution: "Note / precaution",
    save_product: "Save product",
    stock_not_managed_modal: "Stock management is not enabled for this pool.",
    stock_locked: "Stock management reserved for unlimited version",
    last_consumptions: "Last 10 consumptions",
    apply_title: "Apply recommendations",
    apply_subtitle: "Select the advice you applied for the reading of",
    confirm_btn: "Confirm",
    confirm_count: "recommendation",
    confirm_count_plural: "recommendations",
    quantities_title: "Quantities applied",
    quantities_subtitle: "Adjust quantities if needed — this information will be used in your report.",
    quantity_applied: "Quantity applied",
    unit: "Unit",
    back_btn: "← Back",
    validate_btn: "Submit",
    stock_empty: "This product is out of stock.",
    add_arrow: "Add →",
    settings_title: "Settings",
    my_pools: "My pools",
    pool_name: "Pool name",
    location: "Location",
    volume: "Volume (m³)",
    treatment_type: "Treatment type",
    filtration_type: "Filtration type",
    manage_stock_label: "Stock management",
    manage_stock_desc: "Tracks product consumption and displays it in the report.",
    manage_stock_locked: "Available in unlimited version",
    api_key_label: "Anthropic API key or Cloudflare Worker proxy URL",
    provider_label: "Provider",
    api_key_placeholder: "sk-ant-... or https://my-proxy.workers.dev",
    api_key_desc: "Your key is stored locally. For Anthropic, enter a sk-ant-... key or your Cloudflare Worker proxy URL (recommended).",
    premium_section: "VERSION",
    premium_label: "Unlimited version",
    premium_test: "Test toggle — no real payment here",
    premium_desc: "Free: 1 reading per day (all pools combined), multiple pools with photo. Unlimited: unlimited readings, photos on readings and products.",
    delete_measures: "Delete all readings for this pool",
    sensitive_zone: "SENSITIVE ZONE",
    add_pool: "Add a pool",
    delete_pool: "Delete this pool",
    language_label: "Language",
    report_title: "Monitoring report",
    generated_on: "generated on",
    params_evolution: "PARAMETER EVOLUTION",
    detailed_history: "READING AND CONSUMPTION HISTORY",
    no_measures_report: "No readings recorded for this pool.",
    date_col: "DATE",
    ph_col: "PH",
    cl_libre_col: "FREE CL",
    cl_total_col: "TOTAL CL",
    tac_col: "ALK",
    cya_col: "CYA",
    temp_col: "TEMP.",
    product_col: "Product applied",
    quantity_col: "Quantity",
    stock_col: "Stock",
    download_pdf: "Download PDF",
    close: "Close",
    delete: "Delete",
    wait_before_next: "Wait {h}h before next treatment",
    start_after: "Start at least {h}h after previous step",
    measure_after: "Wait {h}h before testing again",
    missing_product: "not available in your products",
    missing_product_tip: "No {action} product in your list — add one in the Products tab.",
    see_dosage: "See dosage",
    paywall_title: "Go unlimited",
    paywall_desc: "Unlimited readings · AI strip analysis · PDF report · Stock management",
    paywall_btn: "Activate unlimited version",
    paywall_close: "Later",
    add_pool_title: "New pool",
    edit_pool_title: "Edit pool",
    pool_name_placeholder: "My pool",
    pool_location_placeholder: "Garden, terrace...",
    pool_volume_placeholder: "72",
    save_pool: "Save",
    loading: "Loading...",
    error_analyze: "Analysis failed",
    verify_connection: "Check your connection and photos.",
    free_version: "Free",
    param_ph: "pH",
    param_fcl: "Free chlorine (mg/L)",
    axis_legend_u: "ᴜ unit scale (pH, chlorine) — left",
    action_ph_minus: "Lowers pH",
        photos_section: "Reading photos",
    pool_photos_label: "Pool photos (optional)",
    pool_photo_locked: "Pool photos reserved for unlimited version",
    sign_in: "Sign in",
    account_section: "My account",
    confirm_password: "Confirm password",
    pwd_min6: "6 characters minimum",
    error_pwd_mismatch: "Passwords do not match.",
    error_email_required: "Invalid email.",
    account_created: "Account created!",
    verify_email_notice: "A confirmation email has been sent to your address. Click the link to activate your account.",
    account_created_sub: "Welcome to PoolApp. You can now use the app.",
    start_app: "Start the app",
    sign_out: "Sign out",
    delete_account: "Delete my account",
    delete_account_confirm: "Permanently delete your account and all your data? This action cannot be undone.",
    reauth_required: "Please sign in again before deleting your account.",
    not_signed_in: "Not signed in — offline mode",
    create_account: "Create account",
    reset_password: "Forgot password",
    continue_google: "Continue with Google",
    or: "or",
    password: "Password",
    no_account: "No account? Sign up",
    already_account: "Already have an account? Sign in",
    forgot_password: "Forgot password?",
    back_to_login: "← Back to sign in",
    send_reset: "Send reset link",
    reset_sent: "Password reset email sent.",
    skip_login: "Continue without account",
    wrong_password: "Wrong password.",
    user_not_found: "No account with this email.",
    email_in_use: "This email is already in use.",
    weak_password: "Password too short (min 6 characters).",
    firebase_not_configured: "⚠️ Firebase not configured — offline mode only.",
    note_ph_minus: "Check pH before each addition. Max 1 kg/100 m³/day, or space 2h apart.",
    note_ph_plus: "Spread across the pool with filtration running.",
    note_chlore_choc: "Pour in the evening after sunset. Does not stabilise (does not raise CYA).",
    note_galets: "Raises CYA with each use. Avoid if CYA is already above 50 mg/L.",
    action_ph_plus: "Raises pH",
    action_chlore: "Unstabilised chlorine (shock)",
    action_chlore_stabilise: "Stabilised chlorine (CYA +)",
    action_tac_plus: "Raises alkalinity",
    action_brome: "Bromine",
    action_o2: "Active oxygen",
    action_sel: "Salt (salinity)",
    axis_legend_d: "ᴅ tens scale (TAC, CYA, temperature) — right",
    reco_tac_low: "TAC too low ({val} mg/L)",
    reco_ph_high: "pH too high ({val})",
    reco_ph_low: "pH too low ({val})",
    reco_cl_combined: "High combined chlorine ({val} mg/L)",
    reco_cl_low: "Free chlorine too low ({val} mg/L)",
    reco_cl_high: "Free chlorine too high ({val} mg/L)",
    reco_brome_low: "Bromine too low ({val} mg/L)",
    reco_o2_low: "Active oxygen too low ({val} mg/L)",
    reco_sel_low: "Salinity too low ({val} mg/L)",
    reco_cya_high: "Stabiliser too high ({val} mg/L)",
    reco_target: "to reach",
    reco_dose_prefix: "≈",
    reco_no_product: "No product needed",
    reco_water_renewal: "Partial water renewal",
    reco_water_renewal_text: "Renew ≈ {pct} % of volume to return to 40 mg/L",
    reco_cl_excess_text: "Let chlorine degrade naturally in sunlight, avoid swimming in the meantime.",
    reco_cl_shock_text: "tonight (shock treatment)",
    reco_note_tac: "Low TAC makes pH unstable.",
    reco_note_combined: "Combined chlorine = chloramines, sign of insufficient disinfection. Add in the evening, keep filtration running.",
    reco_note_sel: "Use pool-grade salt (pure NaCl ≥ 99%). Dissolve before adding or pour directly near the skimmer, run filtration for 24h.",
    reco_note_o2: "Do not mix with chlorine. Run filtration for 4h.",
    reco_note_brome: "Pour away from water inlets, run filtration.",
    reco_note_cya: "No product lowers CYA chemically, only dilution works. Avoid stabilised chlorine while CYA is high.",
    reco_fallback_tac: "TAC+ product (sodium bicarbonate)",
    reco_fallback_ph_minus: "pH minus",
    reco_fallback_ph_plus: "pH plus",
    reco_fallback_chlore: "Unstabilised shock chlorine",
    reco_fallback_brome: "Bromine (tablets or granules)",
    reco_fallback_o2: "Active oxygen (stabilised hydrogen peroxide)",
    reco_fallback_sel: "Pool salt (pure NaCl)",
    stock_empty_badge: "out of stock",
    paywall_perk1: "Unlimited readings (instead of 1 per day)",
    paywall_perk2: "Photometer/strip photos with AI analysis",
    paywall_perk3: "Pool photos attached to each reading",
    paywall_perk4: "Photo of each product (label, dosage)",

    paywall_perk5: "Unlimited history + PDF report",
    paywall_perk6: "Product stock management",
    paywall_perk7: "Multi-pool",
    paywall_test_note: "This is a test version. No real payment is made.",
    report_print_btn: "Print / Save as PDF",
    pool_photo: "Pool photo",
    remove: "Remove",
    create_pool: "Create pool",
    param_tcl: "Total chlorine (mg/L)",
    param_tac: "Alkalinity (mg/L)",
    param_cya: "CYA stabiliser (mg/L)",
    param_temp: "Water temperature (°C)",
    param_sel: "Salinity / salt (mg/L)",
    param_brome: "Bromine (mg/L)",
    param_o2: "Active oxygen (mg/L)",
    unlimited_version: "Unlimited",
    active_pool: "Active pool",
    pool_volume: "Pool volume (m³)",
    treatment_params: "Parameters:",
    treatment_desc: "The treatment determines which parameters are measured and the recommended targets. Volume is used to calculate product doses.",
    subscription: "Subscription",
    unlimited_active: "Unlimited mode active",
    free_mode: "Free version",
    api_section: "API Key (AI analysis)",
    ai_locked_settings: "AI analysis reserved for unlimited version",
    api_key_openai: "OpenAI API Key",
    hide: "Hide",
    show: "Show",
    treatment_chlore: "Chlorine",
    treatment_chlore_desc: "Stabilised or unstabilised chlorine, common use",
    treatment_sel: "Salt (electrolyser)",
    treatment_sel_desc: "Salt electrolyser, chlorine produced continuously",
    treatment_brome: "Bromine",
    treatment_brome_desc: "Bromine treatment, common for spas and indoor pools",
    treatment_o2: "Active oxygen / PHMB",
    treatment_o2_desc: "Chlorine and bromine free, suitable for sensitive skin",
    treatment_autre: "Other (UV, ozone…)",
    treatment_autre_desc: "Alternative or combined system, basic parameters",
    filtration_sable: "Sand",
    filtration_cartouche: "Cartridge",
    filtration_diatomees: "Diatomaceous earth",
    filtration_aucune: "No filtration (natural)",
  },
  de: {
    tab_pool: "Becken",
    tab_history: "Verlauf",
    tab_products: "Produkte",
    tab_settings: "Einstellungen",
    premium_badge: "Premium",
    last_measure: "LETZTE MESSUNG",
    modify: "Bearbeiten",
    new_measure: "Neue Messung",
    treatment_plan: "BEHANDLUNGSPLAN",
    all_in_range: "Alle gemessenen Parameter sind im Zielbereich.",
    no_measure: "Keine Messungen erfasst",
    no_measure_sub: "Füge deine erste Messreihe hinzu, um den Zustand deines Beckens und Behandlungsempfehlungen zu sehen.",
    add_measure: "Messung hinzufügen",
    daily_limit: "Tageslimit erreicht — unbegrenzt nutzen",
    apply_advice: "Empfehlungen anwenden",
    apply_advice_sub: "Wähle die angewendeten Empfehlungen und gib die tatsächlichen Mengen ein.",
    advice_applied: "Empfehlungen angewendet",
    advice_partial: "teilweise angewendet",
    adjust: "Anpassen",
    ai_analysis: "KI-ANALYSE",
    ai_analyze_btn: "Mit Claude analysieren",
    ai_locked: "Funktion für unbegrenzte Version reserviert",
    ai_analyzing: "Analyse läuft…",
    ai_api_missing: "API-Schlüssel in Einstellungen eingeben, um KI-Analyse zu aktivieren.",
    follow_order: "Schritte der Reihe nach befolgen: jede Behandlung verändert das Wassergleichgewicht.",
    in_range: "Im Zielbereich",
    too_high: "Zu hoch",
    too_low: "Zu niedrig",
    target: "Ziel",
    evolution: "Verlauf",
    show_values: "Werte im Diagramm anzeigen",
    journal: "Protokoll",
    no_history: "Noch kein Verlauf",
    no_history_sub: "Deine Messungen werden hier im Laufe der Zeit angezeigt.",
    report: "Bericht",
    generate_report: "Beckenbericht erstellen",
    report_locked: "PDF-Bericht nur in der unbegrenzten Version",
    report_desc: "Der Bericht enthält den Messverlauf, gegebene Ratschläge und tatsächlich angewendete Mengen.",
    new_measure_title: "Neue Messung",
    edit_measure_title: "Messung bearbeiten",
    date_time: "Datum und Uhrzeit",
    photo_hint: "Fotografiere den Photometerbildschirm mit lesbaren Werten oder lege deinen getränkten Teststreifen neben die Tubuslegende und fotografiere beide zusammen.",
    photos_label: "Messfotos",
    camera_btn: "Kamera",
    gallery_btn: "Bibliothek",
    other_photo: "Weiteres Foto",
    other_gallery: "Weiteres aus Bibliothek",
    photos_done: "Alle Fotos hinzugefügt?",
    yes_analyze: "Ja, analysieren",
    add_more: "Weitere hinzufügen",
    analyze_btn: "Analysieren",
    analyzing: "Analysiere...",
    analyze_locked: "Foto + KI-Analyse nur in unbegrenzter Version",
    note_optional: "Notiz (optional)",
    note_placeholder: "Trübes Wasser, starke Sonne, Schwimmen geplant...",
    save_measure: "Messung speichern",
    save_changes: "Änderungen speichern",
    my_products: "MEINE PRODUKTE",
    products_formula: "Dosierung berechnet als: {Menge} um Parameter um {Effekt} pro {Volumen} m³ zu ändern.",
    products_locked: "Funktion für unbegrenzte Version reserviert",
    stock_not_managed: "Lagerverwaltung für dieses Becken nicht aktiviert. In Einstellungen aktivieren.",
    activate_in_settings: "In Einstellungen aktivieren →",
    delete_all_products: "Alle Produkte für dieses Becken löschen",
    stock_label: "Lager:",
    stock_remaining: "verbleibend",
    edit_product: "Produkt bearbeiten",
    new_product: "Neues Produkt",
    product_photo: "Produktfoto (Etikett)",
    product_name: "Produktname",
    effect: "Wirkung",
    quantity: "Menge",
    effect_variation: "Wirkung (Änderung)",
    for_x_m3: "Pro X m³",
    wait_hours: "Wartezeit vor nächster Behandlung (Stunden)",
    container_size: "Behältergröße",
    current_stock: "Aktueller Lagerbestand",
    new_product_btn: "Neues Produkt (100%)",
    manual_entry: "Manuell eingeben",
    note_precaution: "Notiz / Vorsichtsmaßnahme",
    save_product: "Produkt speichern",
    stock_not_managed_modal: "Lagerverwaltung für dieses Becken nicht aktiviert.",
    stock_locked: "Lagerverwaltung nur in unbegrenzter Version",
    last_consumptions: "Letzte 10 Verbrauchsmengen",
    apply_title: "Empfehlungen anwenden",
    apply_subtitle: "Wähle die angewendeten Ratschläge für die Messung vom",
    confirm_btn: "Bestätigen",
    confirm_count: "Empfehlung",
    confirm_count_plural: "Empfehlungen",
    quantities_title: "Angewendete Mengen",
    quantities_subtitle: "Mengen anpassen wenn nötig — diese Informationen werden für deinen Bericht verwendet.",
    quantity_applied: "Angewendete Menge",
    unit: "Einheit",
    back_btn: "← Zurück",
    validate_btn: "Bestätigen",
    stock_empty: "Dieses Produkt ist nicht mehr auf Lager.",
    add_arrow: "Hinzufügen →",
    settings_title: "Einstellungen",
    my_pools: "Meine Becken",
    pool_name: "Beckenname",
    location: "Standort",
    volume: "Volumen (m³)",
    treatment_type: "Behandlungsart",
    filtration_type: "Filtrationsart",
    manage_stock_label: "Lagerverwaltung",
    manage_stock_desc: "Verfolgt den Produktverbrauch und zeigt ihn im Bericht an.",
    manage_stock_locked: "In unbegrenzter Version verfügbar",
    api_key_label: "Anthropic API-Schlüssel oder Cloudflare Worker Proxy-URL",
    provider_label: "Anbieter",
    api_key_placeholder: "sk-ant-... oder https://mein-proxy.workers.dev",
    api_key_desc: "Dein Schlüssel wird lokal gespeichert.",
    premium_section: "VERSION",
    premium_label: "Unbegrenzte Version",
    premium_test: "Testschalter — keine echte Zahlung",
    premium_desc: "Kostenlos: 1 Messung pro Tag, mehrere Becken. Unbegrenzt: unbegrenzte Messungen, Fotos, Produkte.",
    delete_measures: "Alle Messungen für dieses Becken löschen",
    sensitive_zone: "KRITISCHER BEREICH",
    add_pool: "Becken hinzufügen",
    delete_pool: "Dieses Becken löschen",
    language_label: "Sprache",
    report_title: "Überwachungsbericht",
    generated_on: "erstellt am",
    params_evolution: "PARAMETERENTWICKLUNG",
    detailed_history: "MESS- UND VERBRAUCHSHISTORIE",
    no_measures_report: "Keine Messungen für dieses Becken.",
    date_col: "DATUM",
    ph_col: "PH",
    cl_libre_col: "FREIES CL",
    cl_total_col: "GESAMT CL",
    tac_col: "KH",
    cya_col: "CYA",
    temp_col: "TEMP.",
    product_col: "Angewendetes Produkt",
    quantity_col: "Menge",
    stock_col: "Lager",
    download_pdf: "PDF herunterladen",
    close: "Schließen",
    delete: "Löschen",
    wait_before_next: "{h}h vor nächster Behandlung warten",
    start_after: "Mindestens {h}h nach dem vorherigen Schritt beginnen",
    measure_after: "{h}h warten vor erneuter Messung",
    missing_product: "nicht in deinen Produkten verfügbar",
    missing_product_tip: "Kein {action}-Produkt in deiner Liste — füge eines im Produkte-Tab hinzu.",
    see_dosage: "Dosierung anzeigen",
    paywall_title: "Auf unbegrenzt wechseln",
    paywall_desc: "Unbegrenzte Messungen · KI-Streifenanalyse · PDF-Bericht · Lagerverwaltung",
    paywall_btn: "Unbegrenzte Version aktivieren",
    paywall_close: "Später",
    add_pool_title: "Neues Becken",
    edit_pool_title: "Becken bearbeiten",
    pool_name_placeholder: "Mein Pool",
    pool_location_placeholder: "Garten, Terrasse...",
    pool_volume_placeholder: "72",
    save_pool: "Speichern",
    loading: "Laden...",
    error_analyze: "Analyse fehlgeschlagen",
    verify_connection: "Verbindung und Fotos prüfen.",
    free_version: "Kostenlos",
    param_ph: "pH",
    param_fcl: "Freies Chlor (mg/L)",
    axis_legend_u: "ᴜ Einheitsskala (pH, Chlor) — links",
    action_ph_minus: "pH senken",
        photos_section: "Messfotos",
    pool_photos_label: "Beckenfotos (optional)",
    pool_photo_locked: "Beckenfotos nur in unbegrenzter Version",
    sign_in: "Anmelden",
    account_section: "Mein Konto",
    confirm_password: "Passwort bestätigen",
    pwd_min6: "Mindestens 6 Zeichen",
    error_pwd_mismatch: "Passwörter stimmen nicht überein.",
    error_email_required: "Ungültige E-Mail.",
    account_created: "Konto erstellt!",
    verify_email_notice: "Eine Bestätigungs-E-Mail wurde an deine Adresse gesendet. Klicke auf den Link, um dein Konto zu aktivieren.",
    account_created_sub: "Willkommen bei PoolApp. Du kannst die App jetzt nutzen.",
    start_app: "App starten",
    sign_out: "Abmelden",
    delete_account: "Konto löschen",
    delete_account_confirm: "Konto und alle Daten dauerhaft löschen? Diese Aktion kann nicht rückgängig gemacht werden.",
    reauth_required: "Bitte melde dich erneut an, bevor du dein Konto löschst.",
    not_signed_in: "Nicht angemeldet — Offline-Modus",
    create_account: "Konto erstellen",
    reset_password: "Passwort vergessen",
    continue_google: "Mit Google fortfahren",
    or: "oder",
    password: "Passwort",
    no_account: "Kein Konto? Registrieren",
    already_account: "Bereits ein Konto? Anmelden",
    forgot_password: "Passwort vergessen?",
    back_to_login: "← Zurück zur Anmeldung",
    send_reset: "Link senden",
    reset_sent: "Zurücksetz-E-Mail gesendet.",
    skip_login: "Ohne Konto fortfahren",
    wrong_password: "Falsches Passwort.",
    user_not_found: "Kein Konto mit dieser E-Mail.",
    email_in_use: "Diese E-Mail wird bereits verwendet.",
    weak_password: "Passwort zu kurz (mind. 6 Zeichen).",
    firebase_not_configured: "⚠️ Firebase nicht konfiguriert — nur Offline-Modus.",
    note_ph_minus: "pH vor jeder Zugabe prüfen. Max 1 kg/100 m³/Tag oder 2h Abstand.",
    note_ph_plus: "Im gesamten Becken verteilen, Filtration in Betrieb.",
    note_chlore_choc: "Abends nach Sonnenuntergang zugeben. Stabilisiert nicht (erhöht CYA nicht).",
    note_galets: "Erhöht CYA bei jeder Nutzung. Vermeiden wenn CYA bereits über 50 mg/L.",
    action_ph_plus: "pH erhöhen",
    action_chlore: "Nicht stabilisiertes Chlor (Schock)",
    action_chlore_stabilise: "Stabilisiertes Chlor (CYA +)",
    action_tac_plus: "KH erhöhen",
    action_brome: "Brom",
    action_o2: "Aktivsauerstoff",
    action_sel: "Salz (Salzgehalt)",
    axis_legend_d: "ᴅ Zehnerskala (TAC, CYA, Temperatur) — rechts",
    reco_tac_low: "KH zu niedrig ({val} mg/L)",
    reco_ph_high: "pH zu hoch ({val})",
    reco_ph_low: "pH zu niedrig ({val})",
    reco_cl_combined: "Hoher gebundener Chlorgehalt ({val} mg/L)",
    reco_cl_low: "Freies Chlor zu niedrig ({val} mg/L)",
    reco_cl_high: "Freies Chlor zu hoch ({val} mg/L)",
    reco_brome_low: "Brom zu niedrig ({val} mg/L)",
    reco_o2_low: "Aktivsauerstoff zu niedrig ({val} mg/L)",
    reco_sel_low: "Salzgehalt zu niedrig ({val} mg/L)",
    reco_cya_high: "Stabilisator zu hoch ({val} mg/L)",
    reco_target: "zum Erreichen von",
    reco_dose_prefix: "≈",
    reco_no_product: "Kein Produkt erforderlich",
    reco_water_renewal: "Teilweiser Wasserwechsel",
    reco_water_renewal_text: "≈ {pct} % des Volumens erneuern, um auf 40 mg/L zu kommen",
    reco_cl_excess_text: "Chlor natürlich in der Sonne abbauen lassen, zwischenzeitlich nicht schwimmen.",
    reco_cl_shock_text: "heute Abend (Schockbehandlung)",
    reco_note_tac: "Niedriger KH macht den pH instabil.",
    reco_note_combined: "Gebundenes Chlor = Chloramine, Zeichen unzureichender Desinfektion. Abends zugeben, Filtration durchlaufen lassen.",
    reco_note_sel: "Poolsalz (reines NaCl ≥ 99%) verwenden. Vor dem Zugeben auflösen oder direkt beim Skimmer zugeben, 24h filtrieren.",
    reco_note_o2: "Nicht mit Chlor mischen. 4h filtrieren.",
    reco_note_brome: "Weit von Wasserzuläufen entfernt zugeben, Filtration laufen lassen.",
    reco_note_cya: "Kein Produkt senkt CYA chemisch, nur Verdünnung wirkt. Stabilisiertes Chlor vermeiden solange CYA hoch ist.",
    reco_fallback_tac: "KH+-Produkt (Natriumbicarbonat)",
    reco_fallback_ph_minus: "pH-Senker",
    reco_fallback_ph_plus: "pH-Heber",
    reco_fallback_chlore: "Nicht stabilisiertes Schockchlor",
    reco_fallback_brome: "Brom (Tabletten oder Granulat)",
    reco_fallback_o2: "Aktivsauerstoff (stabilisiertes Wasserstoffperoxid)",
    reco_fallback_sel: "Poolsalz (reines NaCl)",
    stock_empty_badge: "nicht vorrätig",
    paywall_perk1: "Unbegrenzte Messungen (statt 1 pro Tag)",
    paywall_perk2: "Fotometer-/Teststreifen-Fotos mit KI-Analyse",
    paywall_perk3: "Beckenfotos zu jeder Messung",
    paywall_perk4: "Foto jedes Produkts (Etikett, Dosierung)",

    paywall_perk5: "Unbegrenzte Historie + PDF-Bericht",
    paywall_perk6: "Produktlagerverwaltung",
    paywall_perk7: "Mehrere Becken",
    paywall_test_note: "Dies ist eine Testversion. Es wird keine echte Zahlung vorgenommen.",
    report_print_btn: "Drucken / Als PDF speichern",
    pool_photo: "Beckenfoto",
    remove: "Entfernen",
    create_pool: "Becken erstellen",
    param_tcl: "Gesamtchlor (mg/L)",
    param_tac: "Karbonathärte (mg/L)",
    param_cya: "Stabilisator CYA (mg/L)",
    param_temp: "Wassertemperatur (°C)",
    param_sel: "Salzgehalt (mg/L)",
    param_brome: "Brom (mg/L)",
    param_o2: "Aktivsauerstoff (mg/L)",
    unlimited_version: "Unbegrenzt",
    active_pool: "Aktives Becken",
    pool_volume: "Beckenvolumen (m³)",
    treatment_params: "Parameter:",
    treatment_desc: "Die Behandlung bestimmt, welche Parameter gemessen werden und die empfohlenen Ziele. Das Volumen wird zur Berechnung der Produktdosen verwendet.",
    subscription: "Abonnement",
    unlimited_active: "Unbegrenzter Modus aktiv",
    free_mode: "Kostenlose Version",
    api_section: "API-Schlüssel (KI-Analyse)",
    ai_locked_settings: "KI-Analyse nur in unbegrenzter Version",
    api_key_openai: "OpenAI API-Schlüssel",
    hide: "Verbergen",
    show: "Anzeigen",
    treatment_chlore: "Chlor",
    treatment_chlore_desc: "Stabilisiertes oder nicht stabilisiertes Chlor, allgemeine Verwendung",
    treatment_sel: "Salz (Elektrolyseur)",
    treatment_sel_desc: "Salzelektrolyseur, Chlor wird kontinuierlich produziert",
    treatment_brome: "Brom",
    treatment_brome_desc: "Brombehandlung, üblich für Spas und Hallenbäder",
    treatment_o2: "Aktivsauerstoff / PHMB",
    treatment_o2_desc: "Ohne Chlor und Brom, geeignet für empfindliche Haut",
    treatment_autre: "Sonstiges (UV, Ozon…)",
    treatment_autre_desc: "Alternatives oder kombiniertes System, Grundparameter",
    filtration_sable: "Sand",
    filtration_cartouche: "Kartusche",
    filtration_diatomees: "Diatomeenerde",
    filtration_aucune: "Ohne Filtration (natürlich)",
  },
  it: {
    tab_pool: "Vasca",
    tab_history: "Storico",
    tab_products: "Prodotti",
    tab_settings: "Impostazioni",
    premium_badge: "Premium",
    last_measure: "ULTIMA MISURAZIONE",
    modify: "Modifica",
    new_measure: "Nuova misurazione",
    treatment_plan: "PIANO DI TRATTAMENTO",
    all_in_range: "Tutti i parametri misurati sono nell'intervallo target.",
    no_measure: "Nessuna misurazione registrata",
    no_measure_sub: "Aggiungi la tua prima serie di misurazioni per vedere lo stato della tua vasca.",
    add_measure: "Aggiungi misurazione",
    daily_limit: "Limite giornaliero raggiunto — passa all'illimitato",
    apply_advice: "Applica questi consigli",
    apply_advice_sub: "Seleziona i consigli applicati e inserisci le quantità reali.",
    advice_applied: "Consigli applicati",
    advice_partial: "parzialmente applicati",
    adjust: "Regola",
    ai_analysis: "ANALISI IA",
    ai_analyze_btn: "Analizza con Claude",
    ai_locked: "Funzione riservata alla versione illimitata",
    ai_analyzing: "Analisi in corso…",
    ai_api_missing: "Inserisci la tua chiave API nelle Impostazioni per abilitare l'analisi IA.",
    follow_order: "Segui i passaggi nell'ordine: ogni trattamento modifica l'equilibrio dell'acqua.",
    in_range: "Nell'intervallo",
    too_high: "Troppo alto",
    too_low: "Troppo basso",
    target: "obiettivo",
    evolution: "Evoluzione",
    show_values: "Mostra valori sul grafico",
    journal: "Registro",
    no_history: "Ancora nessuno storico",
    no_history_sub: "Le tue misurazioni appariranno qui nel tempo.",
    report: "Rapporto",
    generate_report: "Genera rapporto della vasca",
    report_locked: "Rapporto PDF riservato alla versione illimitata",
    report_desc: "Il rapporto include lo storico delle misurazioni, i consigli dati e le quantità effettivamente applicate.",
    new_measure_title: "Nuova misurazione",
    edit_measure_title: "Modifica misurazione",
    date_time: "Data e ora",
    photo_hint: "Fotografa lo schermo del tuo fotometro con valori leggibili, o posiziona il tuo striscio bagnato accanto alla legenda del tubo e fotografali insieme.",
    photos_label: "Foto della misurazione",
    camera_btn: "Fotocamera",
    gallery_btn: "Libreria",
    other_photo: "Altra foto",
    other_gallery: "Altra dalla libreria",
    photos_done: "Hai finito di aggiungere foto?",
    yes_analyze: "Sì, analizza",
    add_more: "Aggiungi altre",
    analyze_btn: "Analizza",
    analyzing: "Analisi in corso...",
    analyze_locked: "Foto + analisi IA riservate alla versione illimitata",
    note_optional: "Nota (opzionale)",
    note_placeholder: "Acqua torbida, sole forte, nuoto previsto...",
    save_measure: "Salva misurazione",
    save_changes: "Salva modifiche",
    my_products: "I MIEI PRODOTTI",
    products_formula: "Il dosaggio è calcolato come: {quantità} per variare il parametro di {effetto} per {volume} m³.",
    products_locked: "Funzione riservata alla versione illimitata",
    stock_not_managed: "La gestione dello stock non è attivata per questa vasca. Attivala nelle Impostazioni.",
    activate_in_settings: "Attiva nelle Impostazioni →",
    delete_all_products: "Elimina tutti i prodotti per questa vasca",
    stock_label: "Stock:",
    stock_remaining: "rimanente",
    edit_product: "Modifica prodotto",
    new_product: "Nuovo prodotto",
    product_photo: "Foto prodotto (etichetta)",
    product_name: "Nome prodotto",
    effect: "Effetto",
    quantity: "Quantità",
    effect_variation: "Effetto (variazione)",
    for_x_m3: "Per X m³",
    wait_hours: "Tempo di attesa prima del trattamento successivo (ore)",
    container_size: "Dimensione contenitore",
    current_stock: "Stock attuale",
    new_product_btn: "Prodotto nuovo (100%)",
    manual_entry: "Inserisci manualmente",
    note_precaution: "Nota / precauzione",
    save_product: "Salva prodotto",
    stock_not_managed_modal: "La gestione dello stock non è attivata per questa vasca.",
    stock_locked: "Gestione stock riservata alla versione illimitata",
    last_consumptions: "Ultime 10 consumazioni",
    apply_title: "Applica questi consigli",
    apply_subtitle: "Seleziona i consigli applicati per la misurazione del",
    confirm_btn: "Conferma",
    confirm_count: "consiglio",
    confirm_count_plural: "consigli",
    quantities_title: "Quantità applicate",
    quantities_subtitle: "Regola le quantità se necessario — queste informazioni serviranno per il tuo rapporto.",
    quantity_applied: "Quantità applicata",
    unit: "Unità",
    back_btn: "← Indietro",
    validate_btn: "Valida",
    stock_empty: "Stock esaurito per questo prodotto.",
    add_arrow: "Aggiungi →",
    settings_title: "Impostazioni",
    my_pools: "Le mie vasche",
    pool_name: "Nome vasca",
    location: "Posizione",
    volume: "Volume (m³)",
    treatment_type: "Tipo di trattamento",
    filtration_type: "Tipo di filtrazione",
    manage_stock_label: "Gestione stock",
    manage_stock_desc: "Tiene traccia del consumo dei prodotti e lo mostra nel rapporto.",
    manage_stock_locked: "Disponibile nella versione illimitata",
    api_key_label: "Chiave API Anthropic o URL proxy Cloudflare Worker",
    provider_label: "Provider",
    api_key_placeholder: "sk-ant-... o https://mio-proxy.workers.dev",
    api_key_desc: "La tua chiave è memorizzata localmente.",
    premium_section: "VERSIONE",
    premium_label: "Versione illimitata",
    premium_test: "Interruttore di test — nessun pagamento reale",
    premium_desc: "Gratuito: 1 misurazione al giorno, più vasche. Illimitato: misurazioni illimitate, foto, prodotti.",
    delete_measures: "Elimina tutte le misurazioni per questa vasca",
    sensitive_zone: "ZONA SENSIBILE",
    add_pool: "Aggiungi vasca",
    delete_pool: "Elimina questa vasca",
    language_label: "Lingua",
    report_title: "Rapporto di monitoraggio",
    generated_on: "generato il",
    params_evolution: "EVOLUZIONE DEI PARAMETRI",
    detailed_history: "STORICO MISURAZIONI E CONSUMI",
    no_measures_report: "Nessuna misurazione registrata per questa vasca.",
    date_col: "DATA",
    ph_col: "PH",
    cl_libre_col: "CL LIBERO",
    cl_total_col: "CL TOTALE",
    tac_col: "TAC",
    cya_col: "CYA",
    temp_col: "TEMP.",
    product_col: "Prodotto applicato",
    quantity_col: "Quantità",
    stock_col: "Stock",
    download_pdf: "Scarica PDF",
    close: "Chiudi",
    delete: "Elimina",
    wait_before_next: "Attendere {h}h prima del trattamento successivo",
    start_after: "Iniziare almeno {h}h dopo il passaggio precedente",
    measure_after: "Attendere {h}h prima di misurare di nuovo",
    missing_product: "non disponibile nei tuoi prodotti",
    missing_product_tip: "Nessun prodotto {action} nella tua lista — aggiungine uno nella scheda Prodotti.",
    see_dosage: "Vedi dosaggio",
    paywall_title: "Passa all'illimitato",
    paywall_desc: "Misurazioni illimitate · Analisi IA strisce · Rapporto PDF · Gestione stock",
    paywall_btn: "Attiva versione illimitata",
    paywall_close: "Più tardi",
    add_pool_title: "Nuova vasca",
    edit_pool_title: "Modifica vasca",
    pool_name_placeholder: "La mia piscina",
    pool_location_placeholder: "Giardino, terrazza...",
    pool_volume_placeholder: "72",
    save_pool: "Salva",
    loading: "Caricamento...",
    error_analyze: "Analisi impossibile",
    verify_connection: "Controlla la connessione e le foto.",
    free_version: "Gratuito",
    param_ph: "pH",
    param_fcl: "Cloro libero (mg/L)",
    axis_legend_u: "ᴜ scala unità (pH, cloro) — sinistra",
    action_ph_minus: "Abbassa il pH",
        photos_section: "Foto misurazioni",
    pool_photos_label: "Foto vasca (opzionale)",
    pool_photo_locked: "Foto vasca riservate alla versione illimitata",
    sign_in: "Accedi",
    account_section: "Il mio account",
    confirm_password: "Conferma password",
    pwd_min6: "Minimo 6 caratteri",
    error_pwd_mismatch: "Le password non corrispondono.",
    error_email_required: "Email non valida.",
    account_created: "Account creato!",
    verify_email_notice: "Un'email di conferma è stata inviata al tuo indirizzo. Clicca sul link per attivare il tuo account.",
    account_created_sub: "Benvenuto su PoolApp. Puoi usare l'app ora.",
    start_app: "Avvia l'app",
    sign_out: "Disconnetti",
    delete_account: "Elimina account",
    delete_account_confirm: "Eliminare definitivamente l'account e tutti i dati? Questa azione è irreversibile.",
    reauth_required: "Accedi di nuovo prima di eliminare il tuo account.",
    not_signed_in: "Non connesso — modalità offline",
    create_account: "Crea account",
    reset_password: "Password dimenticata",
    continue_google: "Continua con Google",
    or: "o",
    password: "Password",
    no_account: "Nessun account? Registrati",
    already_account: "Hai già un account? Accedi",
    forgot_password: "Password dimenticata?",
    back_to_login: "← Torna al login",
    send_reset: "Invia link",
    reset_sent: "Email di reset inviata.",
    skip_login: "Continua senza account",
    wrong_password: "Password errata.",
    user_not_found: "Nessun account con questa email.",
    email_in_use: "Questa email è già in uso.",
    weak_password: "Password troppo corta (min 6 caratteri).",
    firebase_not_configured: "⚠️ Firebase non configurato — solo modalità offline.",
    note_ph_minus: "Controllare il pH prima di ogni aggiunta. Max 1 kg/100 m³/giorno o distanziare di 2h.",
    note_ph_plus: "Distribuire in tutta la vasca con filtrazione in funzione.",
    note_chlore_choc: "Versare la sera dopo il tramonto. Non stabilizza (non aumenta il CYA).",
    note_galets: "Aumenta il CYA ad ogni utilizzo. Evitare se il CYA è già sopra 50 mg/L.",
    action_ph_plus: "Alza il pH",
    action_chlore: "Cloro non stabilizzato (shock)",
    action_chlore_stabilise: "Cloro stabilizzato (CYA +)",
    action_tac_plus: "Alza il TAC",
    action_brome: "Bromo",
    action_o2: "Ossigeno attivo",
    action_sel: "Sale (salinità)",
    axis_legend_d: "ᴅ scala decine (TAC, CYA, temperatura) — destra",
    reco_tac_low: "TAC troppo basso ({val} mg/L)",
    reco_ph_high: "pH troppo alto ({val})",
    reco_ph_low: "pH troppo basso ({val})",
    reco_cl_combined: "Cloro combinato elevato ({val} mg/L)",
    reco_cl_low: "Cloro libero troppo basso ({val} mg/L)",
    reco_cl_high: "Cloro libero troppo alto ({val} mg/L)",
    reco_brome_low: "Bromo troppo basso ({val} mg/L)",
    reco_o2_low: "Ossigeno attivo troppo basso ({val} mg/L)",
    reco_sel_low: "Salinità troppo bassa ({val} mg/L)",
    reco_cya_high: "Stabilizzante troppo alto ({val} mg/L)",
    reco_target: "per raggiungere",
    reco_dose_prefix: "≈",
    reco_no_product: "Nessun prodotto necessario",
    reco_water_renewal: "Rinnovo parziale dell'acqua",
    reco_water_renewal_text: "Rinnovare ≈ {pct} % del volume per tornare a 40 mg/L",
    reco_cl_excess_text: "Lasciare che il cloro si degradi naturalmente al sole, evitare di nuotare nel frattempo.",
    reco_cl_shock_text: "stasera (trattamento shock)",
    reco_note_tac: "Un TAC basso rende il pH instabile.",
    reco_note_combined: "Cloro combinato = cloramine, segno di disinfezione insufficiente. Aggiungere la sera, filtrazione in continuo.",
    reco_note_sel: "Usare sale da piscina (NaCl puro ≥ 99%). Sciogliere prima dell'aggiunta o versare vicino allo skimmer, filtrazione 24h.",
    reco_note_o2: "Non mescolare con il cloro. Filtrazione per 4h.",
    reco_note_brome: "Versare lontano dagli ingressi d'acqua, filtrazione in marcia.",
    reco_note_cya: "Nessun prodotto abbassa il CYA chimicamente, solo la diluizione funziona. Evitare cloro stabilizzato finché il CYA è alto.",
    reco_fallback_tac: "Prodotto TAC+ (bicarbonato di sodio)",
    reco_fallback_ph_minus: "pH meno",
    reco_fallback_ph_plus: "pH più",
    reco_fallback_chlore: "Cloro shock non stabilizzato",
    reco_fallback_brome: "Bromo (pastiglie o granuli)",
    reco_fallback_o2: "Ossigeno attivo (perossido di idrogeno stabilizzato)",
    reco_fallback_sel: "Sale da piscina (NaCl puro)",
    stock_empty_badge: "esaurito",
    paywall_perk1: "Misurazioni illimitate (invece di 1 al giorno)",
    paywall_perk2: "Foto fotometro/strisce con analisi IA",
    paywall_perk3: "Foto vasca allegate a ogni misurazione",
    paywall_perk4: "Foto di ogni prodotto (etichetta, dosaggio)",

    paywall_perk5: "Storico illimitato + report PDF",
    paywall_perk6: "Gestione stock prodotti",
    paywall_perk7: "Multi-vasca",
    paywall_test_note: "Questa è una versione di test. Nessun pagamento reale viene effettuato.",
    report_print_btn: "Stampa / Salva come PDF",
    pool_photo: "Foto vasca",
    remove: "Rimuovi",
    create_pool: "Crea vasca",
    param_tcl: "Cloro totale (mg/L)",
    param_tac: "TAC (mg/L)",
    param_cya: "Stabilizzante CYA (mg/L)",
    param_temp: "Temperatura acqua (°C)",
    param_sel: "Salinità / sale (mg/L)",
    param_brome: "Bromo (mg/L)",
    param_o2: "Ossigeno attivo (mg/L)",
    unlimited_version: "Illimitato",
    active_pool: "Vasca attiva",
    pool_volume: "Volume vasca (m³)",
    treatment_params: "Parametri:",
    treatment_desc: "Il trattamento determina quali parametri vengono misurati e gli obiettivi raccomandati. Il volume viene usato per calcolare le dosi di prodotto.",
    subscription: "Abbonamento",
    unlimited_active: "Modalità illimitata attiva",
    free_mode: "Versione gratuita",
    api_section: "Chiave API (analisi IA)",
    ai_locked_settings: "Analisi IA riservata alla versione illimitata",
    api_key_openai: "Chiave API OpenAI",
    hide: "Nascondi",
    show: "Mostra",
    treatment_chlore: "Cloro",
    treatment_chlore_desc: "Cloro stabilizzato o non, uso comune",
    treatment_sel: "Sale (elettrolizzatore)",
    treatment_sel_desc: "Elettrolizzatore a sale, il cloro è prodotto in continuo",
    treatment_brome: "Bromo",
    treatment_brome_desc: "Trattamento al bromo, comune per spa e piscine coperte",
    treatment_o2: "Ossigeno attivo / PHMB",
    treatment_o2_desc: "Senza cloro né bromo, adatto a pelli sensibili",
    treatment_autre: "Altro (UV, ozono…)",
    treatment_autre_desc: "Sistema alternativo o combinato, parametri base",
    filtration_sable: "Sabbia",
    filtration_cartouche: "Cartuccia",
    filtration_diatomees: "Diatomee",
    filtration_aucune: "Senza filtrazione (naturale)",
  },
  es: {
    tab_pool: "Piscina",
    tab_history: "Historial",
    tab_products: "Productos",
    tab_settings: "Ajustes",
    premium_badge: "Premium",
    last_measure: "ÚLTIMA MEDICIÓN",
    modify: "Editar",
    new_measure: "Nueva medición",
    treatment_plan: "PLAN DE TRATAMIENTO",
    all_in_range: "Todos los parámetros medidos están en el rango objetivo.",
    no_measure: "Sin mediciones registradas",
    no_measure_sub: "Añade tu primera serie de mediciones para ver el estado de tu piscina.",
    add_measure: "Añadir medición",
    daily_limit: "Límite diario alcanzado — pasar a ilimitado",
    apply_advice: "Aplicar estos consejos",
    apply_advice_sub: "Selecciona los consejos aplicados e introduce las cantidades reales.",
    advice_applied: "Consejos aplicados",
    advice_partial: "parcialmente aplicados",
    adjust: "Ajustar",
    ai_analysis: "ANÁLISIS IA",
    ai_analyze_btn: "Analizar con Claude",
    ai_locked: "Función reservada para la versión ilimitada",
    ai_analyzing: "Analizando…",
    ai_api_missing: "Introduce tu clave API en Ajustes para activar el análisis IA.",
    follow_order: "Sigue los pasos en orden: cada tratamiento modifica el equilibrio del agua.",
    in_range: "En objetivo",
    too_high: "Demasiado alto",
    too_low: "Demasiado bajo",
    target: "objetivo",
    evolution: "Evolución",
    show_values: "Mostrar valores en el gráfico",
    journal: "Registro",
    no_history: "Sin historial aún",
    no_history_sub: "Tus mediciones aparecerán aquí con el tiempo.",
    report: "Informe",
    generate_report: "Generar informe de la piscina",
    report_locked: "Informe PDF reservado para versión ilimitada",
    report_desc: "El informe incluye el historial de mediciones, consejos dados y cantidades realmente aplicadas.",
    new_measure_title: "Nueva medición",
    edit_measure_title: "Editar medición",
    date_time: "Fecha y hora",
    photo_hint: "Fotografía la pantalla de tu fotómetro con valores legibles, o coloca tu tira de prueba empapada junto a la leyenda del tubo y fotografíalos juntos.",
    photos_label: "Fotos de la medición",
    camera_btn: "Cámara",
    gallery_btn: "Biblioteca",
    other_photo: "Otra foto",
    other_gallery: "Otra de biblioteca",
    photos_done: "¿Has terminado de añadir fotos?",
    yes_analyze: "Sí, analizar",
    add_more: "Añadir más",
    analyze_btn: "Analizar",
    analyzing: "Analizando...",
    analyze_locked: "Foto + análisis IA reservados para versión ilimitada",
    note_optional: "Nota (opcional)",
    note_placeholder: "Agua turbia, sol fuerte, natación prevista...",
    save_measure: "Guardar medición",
    save_changes: "Guardar cambios",
    my_products: "MIS PRODUCTOS",
    products_formula: "El dosaje se calcula como: {cantidad} para variar el parámetro en {efecto} por {volumen} m³.",
    products_locked: "Función reservada para la versión ilimitada",
    stock_not_managed: "La gestión de stock no está activada para esta piscina. Actívala en Ajustes.",
    activate_in_settings: "Activar en Ajustes →",
    delete_all_products: "Eliminar todos los productos de esta piscina",
    stock_label: "Stock:",
    stock_remaining: "restante",
    edit_product: "Editar producto",
    new_product: "Nuevo producto",
    product_photo: "Foto del producto (etiqueta)",
    product_name: "Nombre del producto",
    effect: "Efecto",
    quantity: "Cantidad",
    effect_variation: "Efecto (variación)",
    for_x_m3: "Por X m³",
    wait_hours: "Tiempo de espera antes del siguiente tratamiento (horas)",
    container_size: "Tamaño del envase",
    current_stock: "Stock actual",
    new_product_btn: "Producto nuevo (100%)",
    manual_entry: "Introducir manualmente",
    note_precaution: "Nota / precaución",
    save_product: "Guardar producto",
    stock_not_managed_modal: "La gestión de stock no está activada para esta piscina.",
    stock_locked: "Gestión de stock reservada para versión ilimitada",
    last_consumptions: "Últimas 10 consumiciones",
    apply_title: "Aplicar estos consejos",
    apply_subtitle: "Selecciona los consejos aplicados para la medición del",
    confirm_btn: "Confirmar",
    confirm_count: "consejo",
    confirm_count_plural: "consejos",
    quantities_title: "Cantidades aplicadas",
    quantities_subtitle: "Ajusta las cantidades si es necesario — esta información se usará en tu informe.",
    quantity_applied: "Cantidad aplicada",
    unit: "Unidad",
    back_btn: "← Volver",
    validate_btn: "Validar",
    stock_empty: "Stock agotado para este producto.",
    add_arrow: "Añadir →",
    settings_title: "Ajustes",
    my_pools: "Mis piscinas",
    pool_name: "Nombre de la piscina",
    location: "Ubicación",
    volume: "Volumen (m³)",
    treatment_type: "Tipo de tratamiento",
    filtration_type: "Tipo de filtración",
    manage_stock_label: "Gestión de stock",
    manage_stock_desc: "Hace seguimiento del consumo de productos y lo muestra en el informe.",
    manage_stock_locked: "Disponible en versión ilimitada",
    api_key_label: "Clave API Anthropic o URL proxy Cloudflare Worker",
    provider_label: "Proveedor",
    api_key_placeholder: "sk-ant-... o https://mi-proxy.workers.dev",
    api_key_desc: "Tu clave se almacena localmente.",
    premium_section: "VERSIÓN",
    premium_label: "Versión ilimitada",
    premium_test: "Interruptor de prueba — sin pago real",
    premium_desc: "Gratuito: 1 medición por día, varias piscinas. Ilimitado: mediciones ilimitadas, fotos, productos.",
    delete_measures: "Eliminar todas las mediciones de esta piscina",
    sensitive_zone: "ZONA SENSIBLE",
    add_pool: "Añadir piscina",
    delete_pool: "Eliminar esta piscina",
    language_label: "Idioma",
    report_title: "Informe de seguimiento",
    generated_on: "generado el",
    params_evolution: "EVOLUCIÓN DE PARÁMETROS",
    detailed_history: "HISTORIAL DE MEDICIONES Y CONSUMOS",
    no_measures_report: "Sin mediciones registradas para esta piscina.",
    date_col: "FECHA",
    ph_col: "PH",
    cl_libre_col: "CL LIBRE",
    cl_total_col: "CL TOTAL",
    tac_col: "TAC",
    cya_col: "CYA",
    temp_col: "TEMP.",
    product_col: "Producto aplicado",
    quantity_col: "Cantidad",
    stock_col: "Stock",
    download_pdf: "Descargar PDF",
    close: "Cerrar",
    delete: "Eliminar",
    wait_before_next: "Esperar {h}h antes del siguiente tratamiento",
    start_after: "Comenzar al menos {h}h después del paso anterior",
    measure_after: "Esperar {h}h antes de medir de nuevo",
    missing_product: "no disponible en tus productos",
    missing_product_tip: "Sin producto {action} en tu lista — añade uno en la pestaña Productos.",
    see_dosage: "Ver dosaje",
    paywall_title: "Pasar a ilimitado",
    paywall_desc: "Mediciones ilimitadas · Análisis IA de tiras · Informe PDF · Gestión de stock",
    paywall_btn: "Activar versión ilimitada",
    paywall_close: "Más tarde",
    add_pool_title: "Nueva piscina",
    edit_pool_title: "Editar piscina",
    pool_name_placeholder: "Mi piscina",
    pool_location_placeholder: "Jardín, terraza...",
    pool_volume_placeholder: "72",
    save_pool: "Guardar",
    loading: "Cargando...",
    error_analyze: "Análisis imposible",
    verify_connection: "Comprueba tu conexión y las fotos.",
    free_version: "Gratuito",
    param_ph: "pH",
    param_fcl: "Cloro libre (mg/L)",
    axis_legend_u: "ᴜ escala unidades (pH, cloro) — izquierda",
    action_ph_minus: "Baja el pH",
        photos_section: "Fotos de mediciones",
    pool_photos_label: "Fotos de la piscina (opcional)",
    pool_photo_locked: "Fotos de piscina reservadas para versión ilimitada",
    sign_in: "Iniciar sesión",
    account_section: "Mi cuenta",
    confirm_password: "Confirmar contraseña",
    pwd_min6: "Mínimo 6 caracteres",
    error_pwd_mismatch: "Las contraseñas no coinciden.",
    error_email_required: "Email inválido.",
    account_created: "¡Cuenta creada!",
    verify_email_notice: "Se ha enviado un email de confirmación a tu dirección. Haz clic en el enlace para activar tu cuenta.",
    account_created_sub: "Bienvenido a PoolApp. Ya puedes usar la app.",
    start_app: "Iniciar la app",
    sign_out: "Cerrar sesión",
    delete_account: "Eliminar mi cuenta",
    delete_account_confirm: "¿Eliminar permanentemente tu cuenta y todos tus datos? Esta acción es irreversible.",
    reauth_required: "Vuelve a iniciar sesión antes de eliminar tu cuenta.",
    not_signed_in: "No conectado — modo offline",
    create_account: "Crear cuenta",
    reset_password: "Contraseña olvidada",
    continue_google: "Continuar con Google",
    or: "o",
    password: "Contraseña",
    no_account: "¿Sin cuenta? Regístrate",
    already_account: "¿Ya tienes cuenta? Inicia sesión",
    forgot_password: "¿Olvidaste tu contraseña?",
    back_to_login: "← Volver al inicio de sesión",
    send_reset: "Enviar enlace",
    reset_sent: "Email de restablecimiento enviado.",
    skip_login: "Continuar sin cuenta",
    wrong_password: "Contraseña incorrecta.",
    user_not_found: "No hay cuenta con este email.",
    email_in_use: "Este email ya está en uso.",
    weak_password: "Contraseña demasiado corta (mín. 6 caracteres).",
    firebase_not_configured: "⚠️ Firebase no configurado — solo modo offline.",
    note_ph_minus: "Verificar el pH antes de cada adición. Máx 1 kg/100 m³/día o espaciar 2h.",
    note_ph_plus: "Distribuir por toda la piscina con filtración en marcha.",
    note_chlore_choc: "Verter por la noche después del atardecer. No estabiliza (no aumenta el CYA).",
    note_galets: "Aumenta el CYA con cada uso. Evitar si el CYA ya supera los 50 mg/L.",
    action_ph_plus: "Sube el pH",
    action_chlore: "Cloro no estabilizado (choque)",
    action_chlore_stabilise: "Cloro estabilizado (CYA +)",
    action_tac_plus: "Sube el TAC",
    action_brome: "Bromo",
    action_o2: "Oxígeno activo",
    action_sel: "Sal (salinidad)",
    axis_legend_d: "ᴅ escala decenas (TAC, CYA, temperatura) — derecha",
    reco_tac_low: "TAC demasiado bajo ({val} mg/L)",
    reco_ph_high: "pH demasiado alto ({val})",
    reco_ph_low: "pH demasiado bajo ({val})",
    reco_cl_combined: "Cloro combinado elevado ({val} mg/L)",
    reco_cl_low: "Cloro libre demasiado bajo ({val} mg/L)",
    reco_cl_high: "Cloro libre demasiado alto ({val} mg/L)",
    reco_brome_low: "Bromo demasiado bajo ({val} mg/L)",
    reco_o2_low: "Oxígeno activo demasiado bajo ({val} mg/L)",
    reco_sel_low: "Salinidad demasiado baja ({val} mg/L)",
    reco_cya_high: "Estabilizador demasiado alto ({val} mg/L)",
    reco_target: "para alcanzar",
    reco_dose_prefix: "≈",
    reco_no_product: "No se necesita producto",
    reco_water_renewal: "Renovación parcial del agua",
    reco_water_renewal_text: "Renovar ≈ {pct} % del volumen para volver a 40 mg/L",
    reco_cl_excess_text: "Dejar que el cloro se degrade naturalmente al sol, evitar bañarse mientras tanto.",
    reco_cl_shock_text: "esta noche (tratamiento de choque)",
    reco_note_tac: "Un TAC bajo hace el pH inestable.",
    reco_note_combined: "Cloro combinado = cloraminas, señal de desinfección insuficiente. Añadir por la noche, filtración continua.",
    reco_note_sel: "Usar sal de piscina (NaCl puro ≥ 99%). Disolver antes de añadir o verter cerca del skimmer, filtración 24h.",
    reco_note_o2: "No mezclar con cloro. Filtración durante 4h.",
    reco_note_brome: "Verter lejos de las entradas de agua, filtración en marcha.",
    reco_note_cya: "Ningún producto baja el CYA químicamente, solo la dilución funciona. Evitar cloro estabilizado mientras el CYA sea alto.",
    reco_fallback_tac: "Producto TAC+ (bicarbonato de sodio)",
    reco_fallback_ph_minus: "pH menos",
    reco_fallback_ph_plus: "pH más",
    reco_fallback_chlore: "Cloro shock no estabilizado",
    reco_fallback_brome: "Bromo (pastillas o gránulos)",
    reco_fallback_o2: "Oxígeno activo (peróxido de hidrógeno estabilizado)",
    reco_fallback_sel: "Sal de piscina (NaCl puro)",
    stock_empty_badge: "sin stock",
    paywall_perk1: "Mediciones ilimitadas (en lugar de 1 por día)",
    paywall_perk2: "Fotos fotómetro/tiras con análisis IA",
    paywall_perk3: "Fotos de piscina adjuntas a cada medición",
    paywall_perk4: "Foto de cada producto (etiqueta, dosaje)",

    paywall_perk5: "Historial ilimitado + informe PDF",
    paywall_perk6: "Gestión de stock de productos",
    paywall_perk7: "Multi-piscina",
    paywall_test_note: "Esta es una versión de prueba. No se realiza ningún pago real.",
    report_print_btn: "Imprimir / Guardar como PDF",
    pool_photo: "Foto piscina",
    remove: "Quitar",
    create_pool: "Crear piscina",
    param_tcl: "Cloro total (mg/L)",
    param_tac: "TAC (mg/L)",
    param_cya: "Estabilizador CYA (mg/L)",
    param_temp: "Temperatura del agua (°C)",
    param_sel: "Salinidad / sal (mg/L)",
    param_brome: "Bromo (mg/L)",
    param_o2: "Oxígeno activo (mg/L)",
    unlimited_version: "Ilimitado",
    active_pool: "Piscina activa",
    pool_volume: "Volumen piscina (m³)",
    treatment_params: "Parámetros:",
    treatment_desc: "El tratamiento determina qué parámetros se miden y los objetivos recomendados. El volumen se usa para calcular las dosis de producto.",
    subscription: "Suscripción",
    unlimited_active: "Modo ilimitado activo",
    free_mode: "Versión gratuita",
    api_section: "Clave API (análisis IA)",
    ai_locked_settings: "Análisis IA reservado para versión ilimitada",
    api_key_openai: "Clave API OpenAI",
    hide: "Ocultar",
    show: "Mostrar",
    treatment_chlore: "Cloro",
    treatment_chlore_desc: "Cloro estabilizado o no, uso común",
    treatment_sel: "Sal (electrolizador)",
    treatment_sel_desc: "Electrolizador de sal, cloro producido continuamente",
    treatment_brome: "Bromo",
    treatment_brome_desc: "Tratamiento con bromo, común para spas y piscinas interiores",
    treatment_o2: "Oxígeno activo / PHMB",
    treatment_o2_desc: "Sin cloro ni bromo, adecuado para pieles sensibles",
    treatment_autre: "Otro (UV, ozono…)",
    treatment_autre_desc: "Sistema alternativo o combinado, parámetros básicos",
    filtration_sable: "Arena",
    filtration_cartouche: "Cartucho",
    filtration_diatomees: "Tierra de diatomeas",
    filtration_aucune: "Sin filtración (natural)",
  },
  pt: {
    tab_pool: "Piscina",
    tab_history: "Histórico",
    tab_products: "Produtos",
    tab_settings: "Configurações",
    premium_badge: "Premium",
    last_measure: "ÚLTIMA MEDIÇÃO",
    modify: "Editar",
    new_measure: "Nova medição",
    treatment_plan: "PLANO DE TRATAMENTO",
    all_in_range: "Todos os parâmetros medidos estão na faixa alvo.",
    no_measure: "Nenhuma medição registrada",
    no_measure_sub: "Adicione sua primeira série de medições para ver o estado da sua piscina.",
    add_measure: "Adicionar medição",
    daily_limit: "Limite diário atingido — passar para ilimitado",
    apply_advice: "Aplicar estas recomendações",
    apply_advice_sub: "Selecione os conselhos aplicados e insira as quantidades reais.",
    advice_applied: "Recomendações aplicadas",
    advice_partial: "parcialmente aplicadas",
    adjust: "Ajustar",
    ai_analysis: "ANÁLISE IA",
    ai_analyze_btn: "Analisar com Claude",
    ai_locked: "Funcionalidade reservada para a versão ilimitada",
    ai_analyzing: "Analisando…",
    ai_api_missing: "Insira sua chave API nas Configurações para ativar a análise IA.",
    follow_order: "Siga os passos na ordem: cada tratamento modifica o equilíbrio da água.",
    in_range: "Na faixa",
    too_high: "Muito alto",
    too_low: "Muito baixo",
    target: "alvo",
    evolution: "Evolução",
    show_values: "Mostrar valores no gráfico",
    journal: "Registro",
    no_history: "Ainda sem histórico",
    no_history_sub: "Suas medições aparecerão aqui ao longo do tempo.",
    report: "Relatório",
    generate_report: "Gerar relatório da piscina",
    report_locked: "Relatório PDF reservado para versão ilimitada",
    report_desc: "O relatório inclui o histórico de medições, conselhos dados e quantidades realmente aplicadas.",
    new_measure_title: "Nova medição",
    edit_measure_title: "Editar medição",
    date_time: "Data e hora",
    photo_hint: "Fotografe a tela do seu fotômetro com valores legíveis, ou coloque sua tira de teste embebida ao lado da legenda do tubo e fotografe ambos juntos.",
    photos_label: "Fotos da medição",
    camera_btn: "Câmera",
    gallery_btn: "Biblioteca",
    other_photo: "Outra foto",
    other_gallery: "Outra da biblioteca",
    photos_done: "Terminou de adicionar fotos?",
    yes_analyze: "Sim, analisar",
    add_more: "Adicionar mais",
    analyze_btn: "Analisar",
    analyzing: "Analisando...",
    analyze_locked: "Foto + análise IA reservadas para versão ilimitada",
    note_optional: "Nota (opcional)",
    note_placeholder: "Água turva, sol forte, natação prevista...",
    save_measure: "Salvar medição",
    save_changes: "Salvar alterações",
    my_products: "MEUS PRODUTOS",
    products_formula: "A dosagem é calculada como: {quantidade} para variar o parâmetro em {efeito} por {volume} m³.",
    products_locked: "Funcionalidade reservada para a versão ilimitada",
    stock_not_managed: "A gestão de estoque não está ativada para esta piscina. Ative nas Configurações.",
    activate_in_settings: "Ativar nas Configurações →",
    delete_all_products: "Excluir todos os produtos desta piscina",
    stock_label: "Estoque:",
    stock_remaining: "restante",
    edit_product: "Editar produto",
    new_product: "Novo produto",
    product_photo: "Foto do produto (rótulo)",
    product_name: "Nome do produto",
    effect: "Efeito",
    quantity: "Quantidade",
    effect_variation: "Efeito (variação)",
    for_x_m3: "Por X m³",
    wait_hours: "Tempo de espera antes do próximo tratamento (horas)",
    container_size: "Tamanho do recipiente",
    current_stock: "Estoque atual",
    new_product_btn: "Produto novo (100%)",
    manual_entry: "Inserir manualmente",
    note_precaution: "Nota / precaução",
    save_product: "Salvar produto",
    stock_not_managed_modal: "A gestão de estoque não está ativada para esta piscina.",
    stock_locked: "Gestão de estoque reservada para versão ilimitada",
    last_consumptions: "Últimas 10 consumições",
    apply_title: "Aplicar estas recomendações",
    apply_subtitle: "Selecione os conselhos aplicados para a medição de",
    confirm_btn: "Confirmar",
    confirm_count: "recomendação",
    confirm_count_plural: "recomendações",
    quantities_title: "Quantidades aplicadas",
    quantities_subtitle: "Ajuste as quantidades se necessário — estas informações serão usadas no seu relatório.",
    quantity_applied: "Quantidade aplicada",
    unit: "Unidade",
    back_btn: "← Voltar",
    validate_btn: "Validar",
    stock_empty: "Estoque esgotado para este produto.",
    add_arrow: "Adicionar →",
    settings_title: "Configurações",
    my_pools: "Minhas piscinas",
    pool_name: "Nome da piscina",
    location: "Localização",
    volume: "Volume (m³)",
    treatment_type: "Tipo de tratamento",
    filtration_type: "Tipo de filtração",
    manage_stock_label: "Gestão de estoque",
    manage_stock_desc: "Rastreia o consumo de produtos e o exibe no relatório.",
    manage_stock_locked: "Disponível na versão ilimitada",
    api_key_label: "Chave API Anthropic ou URL proxy Cloudflare Worker",
    provider_label: "Provedor",
    api_key_placeholder: "sk-ant-... ou https://meu-proxy.workers.dev",
    api_key_desc: "Sua chave é armazenada localmente.",
    premium_section: "VERSÃO",
    premium_label: "Versão ilimitada",
    premium_test: "Interruptor de teste — sem pagamento real",
    premium_desc: "Gratuito: 1 medição por dia, várias piscinas. Ilimitado: medições ilimitadas, fotos, produtos.",
    delete_measures: "Excluir todas as medições desta piscina",
    sensitive_zone: "ZONA SENSÍVEL",
    add_pool: "Adicionar piscina",
    delete_pool: "Excluir esta piscina",
    language_label: "Idioma",
    report_title: "Relatório de monitoramento",
    generated_on: "gerado em",
    params_evolution: "EVOLUÇÃO DOS PARÂMETROS",
    detailed_history: "HISTÓRICO DE MEDIÇÕES E CONSUMOS",
    no_measures_report: "Nenhuma medição registrada para esta piscina.",
    date_col: "DATA",
    ph_col: "PH",
    cl_libre_col: "CL LIVRE",
    cl_total_col: "CL TOTAL",
    tac_col: "TAC",
    cya_col: "CYA",
    temp_col: "TEMP.",
    product_col: "Produto aplicado",
    quantity_col: "Quantidade",
    stock_col: "Estoque",
    download_pdf: "Baixar PDF",
    close: "Fechar",
    delete: "Excluir",
    wait_before_next: "Aguardar {h}h antes do próximo tratamento",
    start_after: "Iniciar pelo menos {h}h após o passo anterior",
    measure_after: "Aguardar {h}h antes de medir novamente",
    missing_product: "não disponível nos seus produtos",
    missing_product_tip: "Nenhum produto {action} na sua lista — adicione um na aba Produtos.",
    see_dosage: "Ver dosagem",
    paywall_title: "Passar para ilimitado",
    paywall_desc: "Medições ilimitadas · Análise IA de tiras · Relatório PDF · Gestão de estoque",
    paywall_btn: "Ativar versão ilimitada",
    paywall_close: "Mais tarde",
    add_pool_title: "Nova piscina",
    edit_pool_title: "Editar piscina",
    pool_name_placeholder: "Minha piscina",
    pool_location_placeholder: "Jardim, terraço...",
    pool_volume_placeholder: "72",
    save_pool: "Salvar",
    loading: "Carregando...",
    error_analyze: "Análise impossível",
    verify_connection: "Verifique sua conexão e as fotos.",
    free_version: "Gratuito",
    param_ph: "pH",
    param_fcl: "Cloro livre (mg/L)",
    axis_legend_u: "ᴜ escala unidades (pH, cloro) — esquerda",
    action_ph_minus: "Baixa o pH",
        photos_section: "Fotos das medições",
    pool_photos_label: "Fotos da piscina (opcional)",
    pool_photo_locked: "Fotos da piscina reservadas para versão ilimitada",
    sign_in: "Entrar",
    account_section: "Minha conta",
    confirm_password: "Confirmar senha",
    pwd_min6: "Mínimo 6 caracteres",
    error_pwd_mismatch: "As senhas não coincidem.",
    error_email_required: "Email inválido.",
    account_created: "Conta criada!",
    verify_email_notice: "Um email de confirmação foi enviado para o teu endereço. Clica no link para ativar a tua conta.",
    account_created_sub: "Bem-vindo ao PoolApp. Já podes usar a app.",
    start_app: "Iniciar a app",
    sign_out: "Sair",
    delete_account: "Eliminar minha conta",
    delete_account_confirm: "Eliminar permanentemente a tua conta e todos os dados? Esta ação é irreversível.",
    reauth_required: "Faz login novamente antes de eliminar a tua conta.",
    not_signed_in: "Não conectado — modo offline",
    create_account: "Criar conta",
    reset_password: "Senha esquecida",
    continue_google: "Continuar com Google",
    or: "ou",
    password: "Senha",
    no_account: "Sem conta? Cadastre-se",
    already_account: "Já tem conta? Entrar",
    forgot_password: "Esqueceu a senha?",
    back_to_login: "← Voltar ao login",
    send_reset: "Enviar link",
    reset_sent: "Email de redefinição enviado.",
    skip_login: "Continuar sem conta",
    wrong_password: "Senha incorreta.",
    user_not_found: "Nenhuma conta com este email.",
    email_in_use: "Este email já está em uso.",
    weak_password: "Senha muito curta (mín. 6 caracteres).",
    firebase_not_configured: "⚠️ Firebase não configurado — apenas modo offline.",
    note_ph_minus: "Verificar o pH antes de cada adição. Máx 1 kg/100 m³/dia ou espaçar 2h.",
    note_ph_plus: "Distribuir por toda a piscina com filtração em funcionamento.",
    note_chlore_choc: "Adicionar à noite após o pôr do sol. Não estabiliza (não aumenta o CYA).",
    note_galets: "Aumenta o CYA a cada uso. Evitar se o CYA já estiver acima de 50 mg/L.",
    action_ph_plus: "Sobe o pH",
    action_chlore: "Cloro não estabilizado (choque)",
    action_chlore_stabilise: "Cloro estabilizado (CYA +)",
    action_tac_plus: "Sobe o TAC",
    action_brome: "Bromo",
    action_o2: "Oxigênio ativo",
    action_sel: "Sal (salinidade)",
    axis_legend_d: "ᴅ escala dezenas (TAC, CYA, temperatura) — direita",
    reco_tac_low: "TAC muito baixo ({val} mg/L)",
    reco_ph_high: "pH muito alto ({val})",
    reco_ph_low: "pH muito baixo ({val})",
    reco_cl_combined: "Cloro combinado elevado ({val} mg/L)",
    reco_cl_low: "Cloro livre muito baixo ({val} mg/L)",
    reco_cl_high: "Cloro livre muito alto ({val} mg/L)",
    reco_brome_low: "Bromo muito baixo ({val} mg/L)",
    reco_o2_low: "Oxigênio ativo muito baixo ({val} mg/L)",
    reco_sel_low: "Salinidade muito baixa ({val} mg/L)",
    reco_cya_high: "Estabilizador muito alto ({val} mg/L)",
    reco_target: "para atingir",
    reco_dose_prefix: "≈",
    reco_no_product: "Nenhum produto necessário",
    reco_water_renewal: "Renovação parcial da água",
    reco_water_renewal_text: "Renovar ≈ {pct} % do volume para voltar a 40 mg/L",
    reco_cl_excess_text: "Deixar o cloro degradar naturalmente ao sol, evitar nadar enquanto isso.",
    reco_cl_shock_text: "esta noite (tratamento de choque)",
    reco_note_tac: "Um TAC baixo torna o pH instável.",
    reco_note_combined: "Cloro combinado = cloraminas, sinal de desinfecção insuficiente. Adicionar à noite, filtração contínua.",
    reco_note_sel: "Usar sal de piscina (NaCl puro ≥ 99%). Dissolver antes de adicionar ou verter perto do skimmer, filtração 24h.",
    reco_note_o2: "Não misturar com cloro. Filtração por 4h.",
    reco_note_brome: "Verter longe das entradas de água, filtração em funcionamento.",
    reco_note_cya: "Nenhum produto baixa o CYA quimicamente, só a diluição funciona. Evitar cloro estabilizado enquanto o CYA estiver alto.",
    reco_fallback_tac: "Produto TAC+ (bicarbonato de sódio)",
    reco_fallback_ph_minus: "pH menos",
    reco_fallback_ph_plus: "pH mais",
    reco_fallback_chlore: "Cloro shock não estabilizado",
    reco_fallback_brome: "Bromo (pastilhas ou grânulos)",
    reco_fallback_o2: "Oxigênio ativo (peróxido de hidrogênio estabilizado)",
    reco_fallback_sel: "Sal de piscina (NaCl puro)",
    stock_empty_badge: "sem stock",
    paywall_perk1: "Medições ilimitadas (em vez de 1 por dia)",
    paywall_perk2: "Fotos de fotómetro/tiras com análise IA",
    paywall_perk3: "Fotos da piscina anexadas a cada medição",
    paywall_perk4: "Foto de cada produto (rótulo, dosagem)",

    paywall_perk5: "Histórico ilimitado + relatório PDF",
    paywall_perk6: "Gestão de stock de produtos",
    paywall_perk7: "Multi-piscina",
    paywall_test_note: "Esta é uma versão de teste. Nenhum pagamento real é efetuado.",
    report_print_btn: "Imprimir / Salvar como PDF",
    pool_photo: "Foto piscina",
    remove: "Remover",
    create_pool: "Criar piscina",
    param_tcl: "Cloro total (mg/L)",
    param_tac: "TAC (mg/L)",
    param_cya: "Estabilizador CYA (mg/L)",
    param_temp: "Temperatura da água (°C)",
    param_sel: "Salinidade / sal (mg/L)",
    param_brome: "Bromo (mg/L)",
    param_o2: "Oxigênio ativo (mg/L)",
    unlimited_version: "Ilimitado",
    active_pool: "Piscina ativa",
    pool_volume: "Volume piscina (m³)",
    treatment_params: "Parâmetros:",
    treatment_desc: "O tratamento determina quais parâmetros são medidos e os alvos recomendados. O volume é usado para calcular as doses de produto.",
    subscription: "Assinatura",
    unlimited_active: "Modo ilimitado ativo",
    free_mode: "Versão gratuita",
    api_section: "Chave API (análise IA)",
    ai_locked_settings: "Análise IA reservada para versão ilimitada",
    api_key_openai: "Chave API OpenAI",
    hide: "Ocultar",
    show: "Mostrar",
    treatment_chlore: "Cloro",
    treatment_chlore_desc: "Cloro estabilizado ou não, uso comum",
    treatment_sel: "Sal (eletrólise)",
    treatment_sel_desc: "Eletrólise de sal, cloro produzido continuamente",
    treatment_brome: "Bromo",
    treatment_brome_desc: "Tratamento com bromo, comum para spas e piscinas internas",
    treatment_o2: "Oxigênio ativo / PHMB",
    treatment_o2_desc: "Sem cloro nem bromo, adequado para peles sensíveis",
    treatment_autre: "Outro (UV, ozônio…)",
    treatment_autre_desc: "Sistema alternativo ou combinado, parâmetros básicos",
    filtration_sable: "Areia",
    filtration_cartouche: "Cartucho",
    filtration_diatomees: "Terra de diatomáceas",
    filtration_aucune: "Sem filtração (natural)",
  },
};

function useT(lang) {
  return function t(key, vars) {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.fr;
    let str = dict[key] || TRANSLATIONS.fr[key] || key;
    if (vars) {
      Object.keys(vars).forEach((k) => {
        str = str.replace(`{${k}}`, vars[k]);
      });
    }
    return str;
  };
}

const LANGUAGE_OPTIONS = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
  { value: "it", label: "Italiano" },
  { value: "es", label: "Español" },
  { value: "pt", label: "Português" },
];


// Tous les paramètres possibles, tous traitements confondus
const TARGETS = {
  pH:     { min: 7.2, max: 7.4, unit: "",      label: "pH" },
  fCl:    { min: 1,   max: 3,   unit: "mg/L",  label: "Chlore libre" },
  tCl:    { min: 1,   max: 3,   unit: "mg/L",  label: "Chlore total" },
  tac:    { min: 80,  max: 120, unit: "mg/L",  label: "TAC" },
  cya:    { min: 30,  max: 50,  unit: "mg/L",  label: "Stabilisant (CYA)" },
  temp:   { min: 24,  max: 30,  unit: "°C",    label: "Température de l'eau" },
  sel:    { min: 3000,max: 5000,unit: "mg/L",  label: "Salinité (sel)" },
  brome:  { min: 2,   max: 4,   unit: "mg/L",  label: "Brome" },
  o2:     { min: 10,  max: 30,  unit: "mg/L",  label: "Oxygène actif" },
};

// Types de traitement — définissent quels paramètres sont pertinents
// et si les cibles standard s'appliquent ou sont ajustées.
// Structure de base sans labels (les labels sont traduits dynamiquement)
const TREATMENT_TYPES_BASE = [
  { value: "chlore",  labelKey: "treatment_chlore",  descKey: "treatment_chlore_desc",  params: ["pH", "fCl", "tCl", "tac", "cya", "temp"], targets: {} },
  { value: "sel",     labelKey: "treatment_sel",     descKey: "treatment_sel_desc",     params: ["pH", "fCl", "tCl", "tac", "sel", "temp"], targets: { pH: { min: 7.2, max: 7.6 }, fCl: { min: 0.5, max: 2 }, sel: { min: 3000, max: 5000 } } },
  { value: "brome",   labelKey: "treatment_brome",   descKey: "treatment_brome_desc",   params: ["pH", "brome", "tac", "temp"], targets: { pH: { min: 7.2, max: 7.6 }, brome: { min: 2, max: 4 } } },
  { value: "o2",      labelKey: "treatment_o2",      descKey: "treatment_o2_desc",      params: ["pH", "o2", "tac", "temp"], targets: { pH: { min: 6.8, max: 7.4 }, o2: { min: 10, max: 30 } } },
  { value: "autre",   labelKey: "treatment_autre",   descKey: "treatment_autre_desc",   params: ["pH", "fCl", "tac", "temp"], targets: {} },
];

const FILTRATION_TYPES_BASE = [
  { value: "sable",     labelKey: "filtration_sable" },
  { value: "cartouche", labelKey: "filtration_cartouche" },
  { value: "diatomees", labelKey: "filtration_diatomees" },
  { value: "aucune",    labelKey: "filtration_aucune" },
];

// Compatibilité : TREATMENT_TYPES avec labels français par défaut
const TREATMENT_TYPES = TREATMENT_TYPES_BASE.map((tt) => ({
  ...tt,
  label: (TRANSLATIONS.fr[tt.labelKey] || tt.value),
  description: (TRANSLATIONS.fr[tt.descKey] || ""),
}));

const FILTRATION_TYPES = FILTRATION_TYPES_BASE.map((ft) => ({
  ...ft,
  label: (TRANSLATIONS.fr[ft.labelKey] || ft.value),
}));

// Retourne TREATMENT_TYPES avec labels traduits
function getTreatmentTypes(lang) {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.fr;
  return TREATMENT_TYPES_BASE.map((tt) => ({
    ...tt,
    label: dict[tt.labelKey] || TRANSLATIONS.fr[tt.labelKey] || tt.value,
    description: dict[tt.descKey] || TRANSLATIONS.fr[tt.descKey] || "",
  }));
}

// Retourne FILTRATION_TYPES avec labels traduits
function getFiltrationTypes(lang) {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.fr;
  return FILTRATION_TYPES_BASE.map((ft) => ({
    ...ft,
    label: dict[ft.labelKey] || TRANSLATIONS.fr[ft.labelKey] || ft.value,
  }));
}

// Retourne les cibles effectives pour le traitement donné
// (fusionne les cibles par défaut avec les surcharges du traitement)
function getEffectiveTargets(treatmentType) {
  const tt = TREATMENT_TYPES.find((t) => t.value === treatmentType) || TREATMENT_TYPES[0];
  const effective = {};
  for (const key of tt.params) {
    const base = TARGETS[key];
    const override = tt.targets[key] || {};
    if (base) effective[key] = { ...base, ...override };
  }
  return effective;
}

// Retourne la liste des clés de paramètres actifs pour le traitement donné
function getActiveParams(treatmentType) {
  const tt = TREATMENT_TYPES.find((t) => t.value === treatmentType) || TREATMENT_TYPES[0];
  return tt.params; // conserve la casse d'origine ex: "pH", "fCl", "tCl"
}

const DEFAULT_PRODUCTS = [
  {
    id: "ph-minus",
    name: "pH moins (acide / Reva Minus type)",
    action: "ph-",
    doseAmount: 30,
    doseUnit: "g",
    effectAmount: 0.1,
    effectPer: 10,
    waitHours: 2,
    noteKey: "note_ph_minus",
    note: "Vérifier le pH avant chaque ajout. Max 1 kg/100 m³/jour, ou espacer de 2h.",
    containerAmount: 1000,
    containerUnit: "kg",
    stockPercent: 100,
  },
  {
    id: "ph-plus",
    name: "pH plus",
    action: "ph+",
    doseAmount: 20,
    doseUnit: "g",
    effectAmount: 0.1,
    effectPer: 10,
    waitHours: 2,
    noteKey: "note_ph_plus",
    note: "Répartir sur tout le bassin, filtration en marche.",
    containerAmount: 1000,
    containerUnit: "kg",
    stockPercent: 100,
  },
  {
    id: "chlore-choc",
    name: "Chlore choc non stabilisé (type Chloryte)",
    action: "chlore",
    doseAmount: 150,
    doseUnit: "g",
    effectAmount: 1,
    effectPer: 10,
    waitHours: 12,
    noteKey: "note_chlore_choc",
    note: "À verser le soir, soleil couché. Ne stabilise pas (n'augmente pas le CYA).",
    containerAmount: 1000,
    containerUnit: "kg",
    stockPercent: 100,
  },
  {
    id: "galets-stabilises",
    name: "Galets chlore stabilisé 5-en-1 (type Chlorilong)",
    action: "chlore-stabilise",
    doseAmount: 250,
    doseUnit: "g",
    effectAmount: 1,
    effectPer: 30,
    waitHours: 24,
    noteKey: "note_galets",
    note: "Augmente le CYA à chaque utilisation. À éviter si CYA déjà > 50 mg/L.",
    containerAmount: 1000,
    containerUnit: "kg",
    stockPercent: 100,
  },
];

function getProductActions(lang) {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.fr;
  return [
    { value: "ph-",              label: dict.action_ph_minus || "Baisse le pH" },
    { value: "ph+",              label: dict.action_ph_plus || "Monte le pH" },
    { value: "chlore",           label: dict.action_chlore || "Chlore non stabilisé (choc)" },
    { value: "chlore-stabilise", label: dict.action_chlore_stabilise || "Chlore stabilisé (CYA +)" },
    { value: "tac+",             label: dict.action_tac_plus || "Monte le TAC" },
    { value: "brome",            label: dict.action_brome || "Brome" },
    { value: "o2",               label: dict.action_o2 || "Oxygène actif" },
    { value: "sel",              label: dict.action_sel || "Sel (salinité)" },
  ];
}
// Fallback statique pour les usages sans lang (prompts IA)
const PRODUCT_ACTIONS = getProductActions("fr");

const DEFAULT_WAIT_HOURS = {
  "ph-": 2,
  "ph+": 2,
  "chlore": 12,
  "chlore-stabilise": 24,
  "tac+": 6,
  "brome": 6,
  "o2": 4,
  "sel": 24,
};

const ACTION_PRIORITY = {
  "tac+": 1,
  "ph-": 2,
  "ph+": 2,
  "chlore": 3,
  "chlore-stabilise": 4,
  "brome": 3,
  "o2": 3,
  "sel": 5,
};

const STORAGE_KEYS = {
  measures: "pool:measures",
  products: "pool:products",
  settings: "pool:settings",
  premium: "pool:premium",
  pools: "pool:pools",
  activePool: "pool:activePool",
  applications: "pool:applications",
  apiKey: "pool:apiKey",
  apiProvider: "pool:apiProvider",
};

// ---------- Helpers ----------
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function todayLocalDatetime() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function statusFor(param, value, customTargets) {
  if (value === undefined || value === null || value === "") return null;
  const targets = customTargets || TARGETS;
  const t = targets[param];
  if (!t) return null;
  const v = parseFloat(value);
  if (Number.isNaN(v)) return null;
  if (v < t.min) return "low";
  if (v > t.max) return "high";
  return "ok";
}

function statusColor(status) {
  if (status === "ok") return "#1a8fd1";
  if (status === "low") return "#d98c2b";
  if (status === "high") return "#c4502f";
  return "#6a7d90";
}

function statusLabel(status, t) {
  if (status === "ok") return t ? t("in_range") : "Dans la cible";
  if (status === "low") return t ? t("too_low") : "Trop bas";
  if (status === "high") return t ? t("too_high") : "Trop haut";
  return "—";
}

function isSameDay(isoA, isoB) {
  const a = new Date(isoA);
  const b = new Date(isoB);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function hasMeasureToday(measures) {
  const now = new Date().toISOString();
  return measures.some((m) => isSameDay(m.date, now));
}

async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Convertit un dataURL "data:image/jpeg;base64,XXXX" en {mediaType, data}
function parseDataUrl(dataUrl) {
  const match = /^data:(image\/[a-zA-Z]+);base64,(.*)$/.exec(dataUrl);
  if (!match) return null;
  return { mediaType: match[1], data: match[2] };
}

// ---------- Helpers IA (Anthropic + OpenAI) ----------

async function callAIWithImage({ apiKey, apiProvider, prompt, imageDataUrl }) {
  const parsed = parseDataUrl(imageDataUrl);
  if (!parsed) throw new Error("Image invalide");

  if (apiProvider === "openai") {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: `data:${parsed.mediaType};base64,${parsed.data}` } },
            ],
          },
        ],
      }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Erreur OpenAI ${response.status}`);
    }
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  } else {
    // Si apiKey commence par "http", c'est une URL de proxy
    const endpoint = apiKey.startsWith("http")
      ? apiKey.replace(/\/+$/, "") + "/v1/messages"
      : "https://api.anthropic.com/v1/messages";
    const authHeaders = apiKey.startsWith("http")
      ? {}
      : { "x-api-key": apiKey, "anthropic-dangerous-direct-browser-access": "true" };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        ...authHeaders,
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: parsed.mediaType, data: parsed.data } },
              { type: "text", text: prompt },
            ],
          },
        ],
      }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Erreur Anthropic ${response.status}`);
    }
    const data = await response.json();
    return (data.content || []).find((b) => b.type === "text")?.text || "";
  }
}

async function callAIText({ apiKey, apiProvider, prompt }) {
  if (apiProvider === "openai") {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 1200,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Erreur OpenAI ${response.status}`);
    }
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  } else {
    const isProxy = apiKey.startsWith("http");
    const endpoint = isProxy
      ? apiKey.replace(/\/+$/, "").replace(/\/v1\/messages$/, "") + "/v1/messages"
      : "https://api.anthropic.com/v1/messages";
    const authHeaders = isProxy
      ? {}
      : { "x-api-key": apiKey, "anthropic-dangerous-direct-browser-access": "true" };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        ...authHeaders,
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1200,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Erreur Anthropic ${response.status}`);
    }
    const data = await response.json();
    return (data.content || []).find((b) => b.type === "text")?.text || "";
  }
}

async function analyzeStripPhoto({ apiKey, apiProvider, dataUrl }) {
  const prompt = `Tu es un expert en chimie de l'eau de piscine. Analyse cette photo qui montre soit :
- Un écran de photomètre affichant des valeurs numériques
- Une bandelette de test posée à côté de la légende colorée de son tube

Lis toutes les valeurs visibles et retourne-les.

Réponds UNIQUEMENT en JSON valide, sans texte avant ou après, sans markdown, sans commentaires :
{"pH": nombre ou null, "fCl": nombre ou null, "tCl": nombre ou null, "tac": nombre ou null, "cya": nombre ou null, "confidence": "haute" ou "moyenne" ou "basse", "note": "une phrase en français sur la lisibilité"}

Règles strictes :
- Les valeurs doivent être des nombres (pas des chaînes)
- null si le paramètre n'est pas visible
- JSON pur, rien d'autre`;

  const text = await callAIWithImage({ apiKey, apiProvider, prompt, imageDataUrl: dataUrl });
  // Extraction robuste du JSON même si l'IA ajoute du texte autour
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Réponse IA non parseable : " + text.slice(0, 200));
  return JSON.parse(match[0]);
}

// ---------- Composant principal ----------

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { error: error.message };
  }
  componentDidCatch(error, info) {
    this.setState({ error: error.message + "\n\nSTACK:\n" + error.stack + "\n\nCOMPONENT STACK:\n" + (info && info.componentStack ? info.componentStack : "N/A") });
  }
  render() {
    if (this.state.error) {
      return React.createElement("div", {
        style: { padding: 24, fontFamily: "monospace", fontSize: 11, color: "#c00", whiteSpace: "pre-wrap", overflowY: "auto", maxHeight: "100vh", background: "#fff5f5" }
      }, "CRASH DÉTECTÉ:\n\n" + this.state.error);
    }
    return this.props.children;
  }
}

// ---------- Firebase Auth ----------
// INSTRUCTIONS DÉPLOIEMENT: Ajouter dans index.html avant le script principal:
// <script type="module">
//   import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
//   import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
//   import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
//   const firebaseConfig = { apiKey: "...", authDomain: "...", projectId: "...", ... }; // ← coller ta config Firebase
//   const app = initializeApp(firebaseConfig);
//   window._fbAuth = getAuth(app);
//   window._fbDb = getFirestore(app);
//   window._fbGoogle = new GoogleAuthProvider();
//   window._fbSignInWithPopup = signInWithPopup;
//   window._fbSignIn = signInWithEmailAndPassword;
//   window._fbSignUp = createUserWithEmailAndPassword;
//   window._fbResetPwd = sendPasswordResetEmail;
//   window._fbSignOut = signOut;
//   window._fbDoc = doc;
//   window._fbSetDoc = setDoc;
//   window._fbGetDoc = getDoc;
//   window._fbOnAuth = onAuthStateChanged;
// </script>

const FB = {
  ready: () => !!window._fbAuth,
  onAuth: (cb) => window._fbOnAuth ? window._fbOnAuth(window._fbAuth, cb) : (() => {}),
  signInGoogle: () => window._fbSignInWithPopup(window._fbAuth, window._fbGoogle),
  signIn: (email, pwd) => window._fbSignIn(window._fbAuth, email, pwd),
  signUp: (email, pwd) => window._fbSignUp(window._fbAuth, email, pwd),
  resetPwd: (email) => window._fbResetPwd(window._fbAuth, email),
  sendVerification: async (user) => {
    if (!window._fbSendEmailVerification) return;
    await window._fbSendEmailVerification(user);
  },
  deleteAccount: async () => {
    if (!window._fbDeleteUser || !window._fbAuth?.currentUser) return;
    await window._fbDeleteUser(window._fbAuth.currentUser);
  },
  signOut: () => window._fbSignOut(window._fbAuth),
  saveUser: async (uid, data) => {
    if (!window._fbDb) return;
    await window._fbSetDoc(window._fbDoc(window._fbDb, "users", uid), data, { merge: true });
  },
  getUser: async (uid) => {
    if (!window._fbDb) return null;
    const snap = await window._fbGetDoc(window._fbDoc(window._fbDb, "users", uid));
    return snap.exists() ? snap.data() : null;
  },
};

// Helper analytics — fire-and-forget
function track(event, params) {
  try { window._fbLog && window._fbLog(event, params); } catch (e) {}
}

function LoginScreen({ lang, onSkip }) {
  const t = useT(lang || "fr");
  const [mode, setMode] = useState("login"); // login | signup | reset | done
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  const firebaseReady = FB.ready();

  async function handleGoogle() {
    setError(""); setBusy(true);
    try {
      await FB.signInGoogle();
      // signInWithRedirect — la page va se recharger, pas de suite immédiate
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  async function handleSubmit() {
    setError(""); setInfo(""); setBusy(true);
    try {
      if (mode === "reset") {
        await FB.resetPwd(email);
        setInfo(t("reset_sent"));
        setTimeout(() => setMode("login"), 3000);
      } else if (mode === "signup") {
        if (!email.trim()) { setError(t("error_email_required")); setBusy(false); return; }
        if (pwd.length < 6) { setError(t("weak_password")); setBusy(false); return; }
        if (pwd !== pwd2) { setError(t("error_pwd_mismatch")); setBusy(false); return; }
        const cred = await FB.signUp(email, pwd);
        track("sign_up", { method: "email" });
        // Envoie l'email de vérification
        await FB.sendVerification(cred.user).catch(() => {});
        // Enregistre le profil dans Firestore
        await FB.saveUser(cred.user.uid, {
          email: cred.user.email,
          createdAt: new Date().toISOString(),
          isPremium: false,
        }).catch(() => {});
        setMode("done");
        // onAuthStateChanged se déclenchera et appellera onSuccess via PoolApp
      } else {
        await FB.signIn(email, pwd);
        // onAuthStateChanged se déclenchera automatiquement
      }
    } catch (e) {
      const msg = e.code === "auth/wrong-password" || e.code === "auth/invalid-credential" ? t("wrong_password")
        : e.code === "auth/user-not-found" ? t("user_not_found")
        : e.code === "auth/email-already-in-use" ? t("email_in_use")
        : e.code === "auth/weak-password" ? t("weak_password")
        : e.code === "auth/invalid-email" ? t("error_email_required")
        : e.message;
      setError(msg);
    } finally { setBusy(false); }
  }

  // Écran de succès après inscription
  if (mode === "done") {
    return (
      <div style={{ minHeight: "100vh", background: "#eaf4fb", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ width: "100%", maxWidth: 380, background: "#fff", borderRadius: 20, padding: 32, boxShadow: "0 4px 24px #0a6ebd18", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#e8f8ef", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <CheckCircle2 size={28} color="#1a8fd1" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#0d2b4e", marginBottom: 8 }}>{t("account_created")}</div>
          <div style={{ fontSize: 13, color: "#6a7d90", marginBottom: 12 }}>{t("account_created_sub")}</div>
          <div style={{ fontSize: 12, color: "#a8721a", background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 10, padding: "10px 14px", marginBottom: 20, textAlign: "left" }}>
            📧 {t("verify_email_notice")}
          </div>
          <button
            style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: "#0a6ebd", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
            onClick={onSkip}
          >
            {t("start_app")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#eaf4fb", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 380, background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 4px 24px #0a6ebd18" }}>
        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "#0a6ebd", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
            <Droplets size={28} color="#fff" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#0d2b4e" }}>PoolApp</div>
          <div style={{ fontSize: 13, color: "#6a7d90", marginTop: 2 }}>
            {mode === "signup" ? t("create_account") : mode === "reset" ? t("reset_password") : t("sign_in")}
          </div>
        </div>

        {!firebaseReady && (
          <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#7a5a00", marginBottom: 16 }}>
            {t("firebase_not_configured")}
          </div>
        )}

        {/* Google — seulement login et signup */}
        {firebaseReady && mode !== "reset" && (
          <>
            <button
              style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: "1.5px solid #d0e4f5", background: "#f8fafd", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: 14, fontWeight: 600, color: "#0d2b4e", cursor: busy ? "not-allowed" : "pointer", marginBottom: 16, opacity: busy ? 0.6 : 1 }}
              onClick={handleGoogle}
              disabled={busy}
            >
              <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg>
              {busy ? "..." : t("continue_google")}
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: "#e6ebe9" }} />
              <span style={{ fontSize: 12, color: "#9aa9a5" }}>{t("or")}</span>
              <div style={{ flex: 1, height: 1, background: "#e6ebe9" }} />
            </div>
          </>
        )}

        {/* Formulaire email */}
        {firebaseReady && (
          <>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#4a6480", display: "block", marginBottom: 4 }}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #d0e4f5", fontSize: 14, marginBottom: 10, boxSizing: "border-box" }}
              placeholder="votre@email.com"
              onKeyDown={e => e.key === "Enter" && mode !== "signup" && handleSubmit()}
            />

            {mode !== "reset" && (
              <>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#4a6480", display: "block", marginBottom: 4 }}>{t("password")}</label>
                <input
                  type="password" value={pwd} onChange={e => setPwd(e.target.value)}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #d0e4f5", fontSize: 14, marginBottom: 10, boxSizing: "border-box" }}
                  placeholder={mode === "signup" ? t("pwd_min6") : "••••••••"}
                  onKeyDown={e => e.key === "Enter" && mode === "login" && handleSubmit()}
                />
              </>
            )}

            {/* Confirmation mot de passe à l'inscription */}
            {mode === "signup" && (
              <>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#4a6480", display: "block", marginBottom: 4 }}>{t("confirm_password")}</label>
                <input
                  type="password" value={pwd2} onChange={e => setPwd2(e.target.value)}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: pwd2 && pwd !== pwd2 ? "1.5px solid #c0392b" : "1.5px solid #d0e4f5", fontSize: 14, marginBottom: 10, boxSizing: "border-box" }}
                  placeholder="••••••••"
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                />
                {pwd2 && pwd !== pwd2 && (
                  <div style={{ fontSize: 11, color: "#c0392b", marginTop: -6, marginBottom: 8 }}>{t("error_pwd_mismatch")}</div>
                )}
              </>
            )}

            {error && <div style={{ fontSize: 12, color: "#c0392b", marginBottom: 8, padding: "8px 10px", background: "#fdf0ef", borderRadius: 8 }}>{error}</div>}
            {info && <div style={{ fontSize: 12, color: "#1a8fd1", marginBottom: 8, padding: "8px 10px", background: "#e8f4fd", borderRadius: 8 }}>{info}</div>}

            <button
              style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: busy ? "#7ab8e8" : "#0a6ebd", color: "#fff", fontWeight: 700, fontSize: 15, cursor: busy ? "not-allowed" : "pointer", marginBottom: 14 }}
              onClick={handleSubmit}
              disabled={busy}
            >
              {busy ? "..." : mode === "signup" ? t("create_account") : mode === "reset" ? t("send_reset") : t("sign_in")}
            </button>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
              {mode === "login" && (
                <>
                  <button onClick={() => { setMode("signup"); setError(""); setPwd(""); setPwd2(""); }} style={{ background: "none", border: "none", color: "#0a6ebd", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>{t("no_account")}</button>
                  <button onClick={() => { setMode("reset"); setError(""); }} style={{ background: "none", border: "none", color: "#9aa9a5", fontSize: 12, cursor: "pointer" }}>{t("forgot_password")}</button>
                </>
              )}
              {mode === "signup" && (
                <button onClick={() => { setMode("login"); setError(""); setPwd(""); setPwd2(""); }} style={{ background: "none", border: "none", color: "#6a7d90", fontSize: 13, cursor: "pointer" }}>{t("already_account")}</button>
              )}
              {mode === "reset" && (
                <button onClick={() => { setMode("login"); setError(""); }} style={{ background: "none", border: "none", color: "#6a7d90", fontSize: 12, cursor: "pointer" }}>{t("back_to_login")}</button>
              )}
            </div>
          </>
        )}

        {/* Skip */}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #f0f4f8", textAlign: "center" }}>
          <button onClick={onSkip} style={{ background: "none", border: "none", color: "#b0bec5", fontSize: 12, cursor: "pointer" }}>
            {t("skip_login")}
          </button>
          <div style={{ marginTop: 8, fontSize: 10, color: "#d0d8e0" }}>v{APP_VERSION}</div>
        </div>
      </div>
    </div>
  );
}


function PoolApp() {
  const [authUser, setAuthUser] = useState(undefined); // undefined=loading, null=anonymous, object=logged in
  const [showLogin, setShowLogin] = useState(false);

  const [pools, setPools] = useState([
    { id: "default", name: "Ma piscine", location: "Valbonne (06)", volume: 72, treatmentType: "chlore", filtration: "sable" },
  ]);
  const [activePoolId, setActivePoolId] = useState("default");
  const [measures, setMeasures] = useState([]);
  const [products, setProducts] = useState(() =>
    DEFAULT_PRODUCTS.map((p) => ({ ...p, poolId: "default" }))
  );
  const [tab, setTab] = useState("dashboard"); // dashboard | history | products | settings
  const [showAddMeasure, setShowAddMeasure] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingMeasure, setEditingMeasure] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  function openPaywall(source) {
    track("paywall_shown", { source: source || "unknown" });
    setShowPaywall(true);
  }
  const [showAddPool, setShowAddPool] = useState(false);
  const [lang, setLang] = useState("fr");
  const [isPremium, setIsPremium] = useState(false);
  const [applications, setApplications] = useState([]);
  const [validatingMeasure, setValidatingMeasure] = useState(null);
  const [validatingSelectedRecs, setValidatingSelectedRecs] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [apiProvider, setApiProvider] = useState("anthropic"); // "anthropic" | "openai"
  const [loaded, setLoaded] = useState(false);

  const [authResolved, setAuthResolved] = useState(false);

  // --- Firebase Auth ---
  useEffect(() => {
    if (!FB.ready()) { setAuthUser(null); setAuthResolved(true); return; }
    const redirectPending = !!window._fbRedirectUser;
    let resolved = false;

    const unsub = FB.onAuth(async (user) => {
      if (user) {
        setAuthUser(user);
        setShowLogin(false);
        window.storage.set("auth_skipped", "true").catch(() => {});
        try { window._fbSetUserId && window._fbSetUserId(user.uid); } catch (e) {}
        track("login", { method: user.providerData?.[0]?.providerId || "unknown" });
        try {
          const data = await FB.getUser(user.uid);
          if (data?.isPremium !== undefined) setIsPremium(data.isPremium);
        } catch (e) {}
        FB.saveUser(user.uid, { email: user.email, lastSeen: new Date().toISOString() }).catch(() => {});
        if (!resolved) { resolved = true; setAuthResolved(true); }
      } else {
        if (redirectPending && !resolved) {
          setTimeout(() => {
            if (!window._fbAuth?.currentUser) {
              setAuthUser(null);
              if (!resolved) { resolved = true; setAuthResolved(true); }
            }
          }, 3000);
        } else {
          setAuthUser(null);
          if (!resolved) setTimeout(() => { resolved = true; setAuthResolved(true); }, 500);
        }
      }
    });
    return () => unsub();
  }, []);

  // N'affiche le login qu'apres stabilisation Firebase
  useEffect(() => {
    if (!loaded || !authResolved) return;
    const fbUser = window._fbAuth?.currentUser;
    if (!authUser && !fbUser) {
      window.storage.get("auth_skipped").then(v => {
        if (!v?.value && !window._fbAuth?.currentUser) setShowLogin(true);
      }).catch(() => {});
    } else {
      setShowLogin(false);
    }
  }, [loaded, authResolved, authUser]);

  // --- Chargement initial depuis le stockage persistant ---
  useEffect(() => {
    async function load() {
      let loadedMeasures = [];
      let loadedProducts = null;
      try {
        const m = await window.storage.get(STORAGE_KEYS.measures);
        if (m?.value) loadedMeasures = JSON.parse(m.value);
      } catch (e) {}
      try {
        const p = await window.storage.get(STORAGE_KEYS.products);
        if (p?.value) loadedProducts = JSON.parse(p.value);
      } catch (e) {}

      let loadedPools = null;
      try {
        const pl = await window.storage.get(STORAGE_KEYS.pools);
        if (pl?.value) loadedPools = JSON.parse(pl.value);
      } catch (e) {}

      if (!loadedPools) {
        // Migration depuis l'ancien format mono-bassin
        let legacyVolume = 72;
        let legacyName = "Ma piscine";
        let legacyLocation = "Valbonne (06)";
        try {
          const s = await window.storage.get(STORAGE_KEYS.settings);
          if (s?.value) {
            const parsed = JSON.parse(s.value);
            if (parsed.volume) legacyVolume = parsed.volume;
            if (parsed.poolName) legacyName = parsed.poolName;
            if (parsed.location) legacyLocation = parsed.location;
          }
        } catch (e) {}
        loadedPools = [
          { id: "default", name: legacyName, location: legacyLocation, volume: legacyVolume },
        ];
        // Les mesures/produits existants n'avaient pas de poolId : on les rattache au bassin par défaut
        loadedMeasures = loadedMeasures.map((m) => (m.poolId ? m : { ...m, poolId: "default" }));
      }
      // Migration : ajoute treatmentType/filtration aux anciens bassins qui n'en ont pas
      loadedPools = loadedPools.map((p) => ({
        treatmentType: "chlore",
        filtration: "sable",
        manageStock: false,
        ...p,
      }));
      setPools(loadedPools);

      let loadedActiveId = loadedPools[0]?.id || "default";
      try {
        const ap = await window.storage.get(STORAGE_KEYS.activePool);
        if (ap?.value) {
          const parsedId = JSON.parse(ap.value);
          if (loadedPools.find((pl) => pl.id === parsedId)) loadedActiveId = parsedId;
        }
      } catch (e) {}
      setActivePoolId(loadedActiveId);

      setMeasures(loadedMeasures);
      if (loadedProducts) {
        // Anciens produits sans poolId (avant la saisie par bassin) : rattachés au bassin actif
        loadedProducts = loadedProducts.map((p) =>
          p.poolId ? p : { ...p, poolId: loadedActiveId }
        );
        setProducts(loadedProducts);
      }

      try {
        const pr = await window.storage.get(STORAGE_KEYS.premium);
        if (pr?.value) setIsPremium(JSON.parse(pr.value) === true);
      } catch (e) {}
      try {
        const savedLang = await window.storage.get("app_lang");
        if (savedLang?.value) setLang(JSON.parse(savedLang.value));
      } catch (e) {}
      try {
        const ap = await window.storage.get(STORAGE_KEYS.applications);
        if (ap?.value) setApplications(JSON.parse(ap.value));
      } catch (e) {}
      try {
        const ak = await window.storage.get(STORAGE_KEYS.apiKey);
        if (ak?.value) setApiKey(JSON.parse(ak.value));
      } catch (e) {}
      try {
        const aprov = await window.storage.get(STORAGE_KEYS.apiProvider);
        if (aprov?.value) setApiProvider(JSON.parse(aprov.value));
      } catch (e) {}
      setLoaded(true);
      // Envoie la version comme propriété utilisateur Analytics
      try { window._fbSetUserProperty?.("app_version", APP_VERSION); } catch(e) {}
      track("app_open", { version: APP_VERSION });
    }
    load();
  }, []);

  // --- Sauvegardes ---
  useEffect(() => {
    if (!loaded) return;
    window.storage.set(STORAGE_KEYS.measures, JSON.stringify(measures)).catch(() => {});
  }, [measures, loaded]);

  useEffect(() => {
    if (!loaded) return;
    window.storage.set(STORAGE_KEYS.products, JSON.stringify(products)).catch(() => {});
  }, [products, loaded]);

  useEffect(() => {
    if (!loaded) return;
    window.storage.set(STORAGE_KEYS.pools, JSON.stringify(pools)).catch(() => {});
  }, [pools, loaded]);

  useEffect(() => {
    if (!loaded) return;
    window.storage.set(STORAGE_KEYS.activePool, JSON.stringify(activePoolId)).catch(() => {});
  }, [activePoolId, loaded]);

  useEffect(() => {
    if (!loaded) return;
    window.storage.set(STORAGE_KEYS.premium, JSON.stringify(isPremium)).catch(() => {});
  }, [isPremium, loaded]);

  useEffect(() => {
    if (!loaded) return;
    window.storage.set(STORAGE_KEYS.applications, JSON.stringify(applications)).catch(() => {});
  }, [applications, loaded]);

  useEffect(() => {
    if (!loaded) return;
    window.storage.set(STORAGE_KEYS.apiKey, JSON.stringify(apiKey)).catch(() => {});
  }, [apiKey, loaded]);

  useEffect(() => {
    if (!loaded) return;
    window.storage.set(STORAGE_KEYS.apiProvider, JSON.stringify(apiProvider)).catch(() => {});
  }, [apiProvider, loaded]);

  const activePool = useMemo(
    () => pools.find((p) => p.id === activePoolId) || pools[0],
    [pools, activePoolId]
  );

  const effectiveTargets = useMemo(
    () => getEffectiveTargets(activePool?.treatmentType || "chlore"),
    [activePool]
  );

  const activeParamKeys = useMemo(
    () => getActiveParams(activePool?.treatmentType || "chlore"),
    [activePool]
  );

  const poolMeasures = useMemo(
    () => measures.filter((m) => (m.poolId || "default") === activePoolId),
    [measures, activePoolId]
  );

  const poolProducts = useMemo(
    () => products.filter((p) => (p.poolId || "default") === activePoolId),
    [products, activePoolId]
  );

  const poolApplications = useMemo(
    () => applications.filter((a) => a.poolId === activePoolId),
    [applications, activePoolId]
  );

  const sortedMeasures = useMemo(
    () => [...poolMeasures].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [poolMeasures]
  );
  const latest = sortedMeasures[0] || null;
  const blockedByLimit = !isPremium && hasMeasureToday(measures);

  const validatingMeasureRecs = useMemo(() => {
    if (!validatingMeasure) return [];
    const tFn = (key, vars) => {
      const dict = TRANSLATIONS[lang] || TRANSLATIONS.fr;
      let str = dict[key] || TRANSLATIONS.fr[key] || key;
      if (vars) Object.keys(vars).forEach(k => { str = str.replace(`{${k}}`, vars[k]); });
      return str;
    };
    return computeRecommendations(validatingMeasure, activePool?.volume || 0, poolProducts, effectiveTargets, activeParamKeys, tFn);
  }, [validatingMeasure, activePool, poolProducts, effectiveTargets, activeParamKeys, lang]);

  const existingApplicationForValidating = useMemo(() => {
    if (!validatingMeasure) return null;
    return applications.find((a) => a.measureId === validatingMeasure.id) || null;
  }, [validatingMeasure, applications]);

  function addMeasure(entry) {
    if (entry.id) {
      setMeasures((prev) => prev.map((m) => (m.id === entry.id ? { ...m, ...entry } : m)));
      track("measure_edit");
    } else {
      setMeasures((prev) => [...prev, { id: uid(), poolId: activePoolId, ...entry }]);
      track("measure_add", { has_photos: !!(entry.photos?.length || entry.photo), has_pool_photos: !!(entry.poolPhotos?.length) });
    }
    setShowAddMeasure(false);
    setEditingMeasure(null);
  }

  function deleteMeasure(id) {
    setMeasures((prev) => prev.filter((m) => m.id !== id));
  }

  function deleteAllMeasuresForActivePool() {
    setMeasures((prev) => prev.filter((m) => (m.poolId || "default") !== activePoolId));
  }

  function saveApplication(measureId, steps, allApplied) {
    track("treatment_applied", { steps_count: steps.length, all_applied: allApplied });
    // Déduire le stock consommé pour chaque produit utilisé, qu'il soit appliqué partiellement ou totalement
    const stepsWithAmount = steps.filter((s) => s.appliedAmount);
    if (stepsWithAmount.length > 0) {
      setProducts((prev) => prev.map((prod) => {
        const step = stepsWithAmount.find((s) => s.productName === prod.name);
        if (!step || !prod.containerAmount) return prod;
        const cUnit = prod.containerUnit || "kg";
        let appliedInContainerUnit = step.appliedAmount;
        if (cUnit === "kg" && step.doseUnit === "g") appliedInContainerUnit = step.appliedAmount / 1000;
        if (cUnit === "L" && step.doseUnit === "mL") appliedInContainerUnit = step.appliedAmount / 1000;
        const consumed = (appliedInContainerUnit / prod.containerAmount) * 100;
        const newStock = Math.max(0, (prod.stockPercent ?? 100) - consumed);
        return { ...prod, stockPercent: Math.round(newStock * 10) / 10 };
      }));
    }
    setApplications((prev) => {
      const withoutThisMeasure = prev.filter((a) => a.measureId !== measureId);
      return [
        ...withoutThisMeasure,
        {
          id: uid(),
          poolId: activePoolId,
          measureId,
          appliedAt: new Date().toISOString(),
          allApplied: !!allApplied,
          steps,
        },
      ];
    });
    setValidatingMeasure(null);
  }

  function saveProduct(p) {
    if (p.__delete) {
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
      setEditingProduct(null);
      setShowAddProduct(false);
      return;
    }
    setProducts((prev) => {
      const exists = prev.find((x) => x.id === p.id);
      if (exists) return prev.map((x) => (x.id === p.id ? { ...x, ...p } : x));
      return [...prev, { ...p, id: uid(), poolId: activePoolId, stockPercent: p.stockPercent ?? 100 }];
    });
    setEditingProduct(null);
    setShowAddProduct(false);
  }

  function deleteProduct(id) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  function resetAllProducts() {
    setProducts((prev) => prev.filter((p) => (p.poolId || "default") !== activePoolId));
  }

  function handleOpenAddMeasure() {
    if (blockedByLimit) {
      openPaywall();
    } else {
      setShowAddMeasure(true);
    }
  }

  function handleEditMeasure(m) {
    // Modifier une mesure existante ne crée pas de nouvelle entrée :
    // pas concerné par la limite quotidienne gratuite.
    setEditingMeasure(m);
    setShowAddMeasure(true);
  }

  function handleValidateApplication(m, recsOverride, selectedRecsOverride, adjustMode) {
    if (!isPremium) {
      openPaywall();
      return;
    }
    setValidatingMeasure(m);
    if (selectedRecsOverride) setValidatingSelectedRecs({ selected: selectedRecsOverride, adjustMode: !!adjustMode });
    else setValidatingSelectedRecs(null);
  }

  function addPool(pool) {
    const id = uid();
    setPools((prev) => [...prev, { id, ...pool }]);
    setProducts((prev) => {
      const toDuplicate = prev.filter((p) => (p.poolId || "default") === activePoolId);
      const duplicated = toDuplicate.map((p) => ({ ...p, id: uid(), poolId: id }));
      return [...prev, ...duplicated];
    });
    setActivePoolId(id);
    setShowAddPool(false);
  }

  function updatePool(id, updates) {
    setPools((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }

  function deletePool(id) {
    if (pools.length <= 1) return; // toujours garder au moins un bassin
    setPools((prev) => prev.filter((p) => p.id !== id));
    setMeasures((prev) => prev.filter((m) => (m.poolId || "default") !== id));
    setProducts((prev) => prev.filter((p) => (p.poolId || "default") !== id));
    if (activePoolId === id) {
      const remaining = pools.filter((p) => p.id !== id);
      setActivePoolId(remaining[0]?.id || "default");
    }
  }

  function handleWantAddPool() {
    if (!isPremium) {
      openPaywall();
      return;
    }
    setShowAddPool(true);
  }

  return (
    <>
    {showLogin && (
      <div style={{ position: "fixed", inset: 0, zIndex: 1000, overflowY: "auto" }}>
        <LoginScreen
          lang={lang}
          onSkip={() => {
            track("auth_skip");
            setShowLogin(false);
            window.storage.set("auth_skipped", "true").catch(() => {});
          }}
        />
      </div>
    )}
    <div style={styles.app} className="app">
      <Header
        poolName={activePool?.name}
        location={activePool?.location}
        poolPhoto={activePool?.photo}
        isPremium={isPremium}
        pools={pools}
        activePoolId={activePoolId}
        onSwitchPool={setActivePoolId}
        onAddPool={handleWantAddPool}
        lang={lang}
      />
      <main style={styles.main}>
        {tab === "dashboard" && (
          <Dashboard
            latest={latest}
            volume={activePool?.volume || 0}
            products={poolProducts}
            manageStock={!!activePool?.manageStock}
            lang={lang}
            onWantPremium={() => openPaywall()}
            onAddMeasure={handleOpenAddMeasure}
            onEditMeasure={handleEditMeasure}
            onValidateApplication={handleValidateApplication}
            applicationForLatest={latest ? poolApplications.find((a) => a.measureId === latest.id) : null}
            blockedByLimit={blockedByLimit}
            isPremium={isPremium}
            apiKey={apiKey}
            apiProvider={apiProvider}
            recentMeasures={sortedMeasures}
            effectiveTargets={effectiveTargets}
            activeParamKeys={activeParamKeys}
          />
        )}
        {tab === "history" && (
          <HistoryView
            measures={sortedMeasures}
            onDelete={deleteMeasure}
            onEdit={handleEditMeasure}
            onAdd={handleOpenAddMeasure}
            onValidateApplication={handleValidateApplication}
            applications={poolApplications}
            isPremium={isPremium}
            poolName={activePool?.name}
            onGenerateReport={() => setShowReport(true)}
            onWantPremiumForReport={() => openPaywall()}
            lang={lang}
          />
        )}
        {tab === "products" && (
          <ProductsView
            products={poolProducts}
            onEdit={(p) => {
              setEditingProduct(p);
              setShowAddProduct(true);
            }}
            onAddNew={() => {
              setEditingProduct(null);
              setShowAddProduct(true);
            }}
            onDelete={deleteProduct}
            onResetAll={resetAllProducts}
            isPremium={isPremium}
            poolName={activePool?.name}
            manageStock={!!activePool?.manageStock}
            onWantPremium={() => openPaywall()}
            onWantSettings={() => setTab("settings")}
            lang={lang}
          />
        )}
        {tab === "settings" && (
          <SettingsView
            pools={pools}
            activePoolId={activePoolId}
            onUpdatePool={updatePool}
            onDeletePool={deletePool}
            onSwitchPool={setActivePoolId}
            onWantAddPool={handleWantAddPool}
            onDeleteAllMeasures={deleteAllMeasuresForActivePool}
            authUser={authUser}
            onSignOut={async () => {
              await FB.signOut().catch(() => {});
              window.storage.set("auth_skipped", "").catch(() => {});
              setAuthUser(null);
              setShowLogin(true);
            }}
            onSignIn={() => setShowLogin(true)}
            onDeleteAccount={async () => {
              try {
                const uid = authUser?.uid;
                await FB.deleteAccount();
                // Supprime aussi le doc Firestore
                if (uid && window._fbDb && window._fbDoc && window._fbDeleteDoc) {
                  await window._fbDeleteDoc(window._fbDoc(window._fbDb, "users", uid)).catch(() => {});
                }
                window.storage.set("auth_skipped", "").catch(() => {});
                setAuthUser(null);
                setShowLogin(true);
              } catch (e) {
                // Firebase exige une ré-authentification récente pour supprimer
                if (e.code === "auth/requires-recent-login") {
                  alert("Reconnecte-toi d'abord pour pouvoir supprimer ton compte.");
                } else {
                  alert(e.message);
                }
              }
            }}
            poolMeasureCount={poolMeasures.length}
            onGenerateReport={() => setShowReport(true)}
            onWantPremiumForReport={() => openPaywall()}
            onWantPremium={() => openPaywall()}
            isPremium={isPremium}
            setIsPremium={setIsPremium}
            apiKey={apiKey}
            setApiKey={setApiKey}
            apiProvider={apiProvider}
            setApiProvider={setApiProvider}
            lang={lang}
            setLang={setLang}
          />
        )}
      </main>

      <TabBar tab={tab} setTab={setTab} lang={lang} />

      {showAddMeasure && (
        <AddMeasureModal
          measure={editingMeasure}
          onClose={() => {
            setShowAddMeasure(false);
            setEditingMeasure(null);
          }}
          onSave={addMeasure}
          isPremium={isPremium}
          onWantPremium={() => {
            setShowAddMeasure(false);
            setEditingMeasure(null);
            openPaywall();
          }}
          apiKey={apiKey}
          apiProvider={apiProvider}
          activeParamKeys={activeParamKeys}
          lang={lang}
        />
      )}

      {showAddProduct && (
        <ProductModal
          product={editingProduct}
          onClose={() => {
            setShowAddProduct(false);
            setEditingProduct(null);
          }}
          onSave={saveProduct}
          isPremium={isPremium}
          onWantPremium={() => {
            setShowAddProduct(false);
            setEditingProduct(null);
            openPaywall();
          }}
          applications={poolApplications}
          manageStock={!!activePool?.manageStock}
          lang={lang}
          onWantManageStock={() => {
            setShowAddProduct(false);
            setEditingProduct(null);
            setTab("settings");
          }}
        />
      )}

      {showPaywall && (
        <PaywallModal
          lang={lang}
          onClose={() => setShowPaywall(false)}
          onActivate={() => {
            track("upgrade_activated");
            setIsPremium(true);
            setApiKey("https://poolapp-proxy.arnaud-goumain.workers.dev");
            setShowPaywall(false);
          }}
        />
      )}

      {showAddPool && (
        <AddPoolModal onClose={() => setShowAddPool(false)} onSave={addPool} lang={lang} />
      )}

      {validatingMeasure && isPremium && (
        <ValidateApplicationModal
          measure={validatingMeasure}
          recs={validatingMeasureRecs}
          existingApplication={existingApplicationForValidating}
          onClose={() => { setValidatingMeasure(null); setValidatingSelectedRecs(null); }}
          onSave={saveApplication}
          preselected={validatingSelectedRecs}
          products={poolProducts}
          manageStock={!!activePool?.manageStock}
          lang={lang}
          onWantAddProduct={() => { setValidatingMeasure(null); setValidatingSelectedRecs(null); setTab("products"); }}
        />
      )}

      {showReport && isPremium && (
        <ReportView
          pool={activePool}
          measures={poolMeasures}
          applications={poolApplications}
          products={poolProducts}
          onClose={() => setShowReport(false)}
          manageStock={!!activePool?.manageStock}
          lang={lang}
        />
      )}
    </div>
    </>
  );
}

// ---------- Header ----------
function Header({ poolName, location, poolPhoto, isPremium, pools, activePoolId, onSwitchPool, onAddPool, lang }) {
  const t = useT(lang);
  const treatmentTypes = getTreatmentTypes(lang);
  const [showSwitcher, setShowSwitcher] = useState(false);

  return (
    <header style={styles.header}>
      <div style={styles.headerIcon}>
        {poolPhoto ? (
          <img src={poolPhoto} alt="" style={{ width: 38, height: 38, borderRadius: 10, objectFit: "cover", display: "block" }} />
        ) : (
          <Droplets size={22} color="#e8f4fd" strokeWidth={2.2} />
        )}
      </div>
      <button
        style={styles.headerTitleBtn}
        onClick={() => setShowSwitcher((s) => !s)}
      >
        <div style={styles.headerTitleRow}>
          <span style={styles.headerTitle}>{poolName}</span>
          <ChevronDown
            size={16}
            color="#e8f4fd"
            strokeWidth={2.6}
            style={{
              transform: showSwitcher ? "rotate(180deg)" : "none",
              transition: "transform .15s",
            }}
          />
        </div>
        <div style={styles.headerSub}>{location}</div>
      </button>
      {isPremium && (
        <div style={styles.premiumBadge}>
          <Crown size={12} color="#3a2a0a" strokeWidth={2.4} />
          <span>Premium</span>
        </div>
      )}

      {showSwitcher && (
        <div style={styles.poolSwitcherOverlay} onClick={() => setShowSwitcher(false)}>
          <div style={styles.poolSwitcherDropdown} onClick={(e) => e.stopPropagation()}>
            <div style={styles.poolSwitcherTitle}>Mes bassins</div>
            {pools.map((p) => (
              <button
                key={p.id}
                style={{
                  ...styles.poolSwitcherItem,
                  background: p.id === activePoolId ? "#e9f6f1" : "transparent",
                }}
                onClick={() => {
                  onSwitchPool(p.id);
                  setShowSwitcher(false);
                }}
              >
                {p.photo ? (
                  <img src={p.photo} alt="" style={styles.poolSwitcherThumb} />
                ) : (
                  <Droplets size={16} color={p.id === activePoolId ? "#0a6ebd" : "#6a7d90"} />
                )}
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: "#0d2b4e" }}>{p.name}</div>
                  <div style={{ fontSize: 11.5, color: "#6a7d90" }}>{p.location} · {p.volume} m³ · {treatmentTypes.find((tt) => tt.value === p.treatmentType)?.label || "Chlore"}</div>
                </div>
                {p.id === activePoolId && <CheckCircle2 size={16} color="#1a8fd1" />}
              </button>
            ))}
            <button
              style={styles.poolSwitcherAddBtn}
              onClick={() => {
                setShowSwitcher(false);
                onAddPool();
              }}
            >
              <Plus size={16} /> {t("add_pool")}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

// ---------- Tab bar ----------
function TabBar({ tab, setTab, lang }) {
  const t = useT(lang);
  const tabs = [
    { id: "dashboard", label: t("tab_pool"), icon: Droplets },
    { id: "history", label: t("tab_history"), icon: History },
    { id: "products", label: t("tab_products"), icon: Beaker },
    { id: "settings", label: t("tab_settings"), icon: Settings2 },
  ];
  return (
    <nav style={styles.tabBar}>
      {tabs.map((tb) => {
        const Icon = tb.icon;
        const active = tab === tb.id;
        return (
          <button
            key={tb.id}
            onClick={() => {
              setTab(tb.id);
              track("screen_view", { screen_name: tb.id });
            }}
            style={{
              ...styles.tabBtn,
              color: active ? "#0a6ebd" : "#6a7d90",
            }}
          >
            <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
            <span style={{ fontSize: 11, marginTop: 3, fontWeight: active ? 700 : 500 }}>
              {tb.label}
            </span>
          </button>
        );
      })}
      <div style={{ position: "absolute", top: 2, right: 8, fontSize: 9, color: "transparent" }}></div>
    </nav>
  );
}

// ---------- Dashboard ----------
function Dashboard({ latest, volume, products, manageStock, onAddMeasure, onEditMeasure, onValidateApplication, applicationForLatest, blockedByLimit, isPremium, onWantPremium, apiKey, apiProvider, recentMeasures, effectiveTargets, activeParamKeys, lang }) {
  const t = useT(lang);
  const [aiComment, setAiComment] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [selectedRecs, setSelectedRecs] = useState({});

  async function handleAiAnalysis() {
    if (!apiKey || !latest) return;
    setAiLoading(true);
    setAiError(null);
    setAiComment("");
    try {
      const historyLines = (recentMeasures || [])
        .slice(-10)
        .map((m) =>
          `- ${formatDate(m.date)}: pH=${m.pH ?? "?"}, fCl=${m.fCl ?? "?"}, tCl=${m.tCl ?? "?"}, TAC=${m.tac ?? "?"}, CYA=${m.cya ?? "?"}, T°=${m.temp ?? "?"}`
        )
        .join("\n");

      const productsLines = products
        .map((p) => `- ${p.name} (${PRODUCT_ACTIONS.find((a) => a.value === p.action)?.label ?? p.action})`)
        .join("\n");

      const prompt = `Tu es un expert en traitement de l'eau de piscine. Voici les données d'une piscine privée de ${volume} m³.

DERNIÈRE MESURE (${formatDate(latest.date)}) :
- pH : ${latest.pH ?? "non mesuré"}
- Chlore libre (fCl) : ${latest.fCl ?? "non mesuré"} mg/L
- Chlore total (tCl) : ${latest.tCl ?? "non mesuré"} mg/L
- TAC : ${latest.tac ?? "non mesuré"} mg/L
- Stabilisant (CYA) : ${latest.cya ?? "non mesuré"} mg/L
- Température : ${latest.temp ?? "non mesurée"} °C

HISTORIQUE DES 10 DERNIÈRES MESURES :
${historyLines || "Aucun historique disponible"}

PRODUITS DISPONIBLES :
${productsLines || "Aucun produit renseigné"}

Cibles recommandées : pH 7.2–7.4, chlore libre 1–3 mg/L, TAC 80–120 mg/L, CYA 30–50 mg/L, température 24–30 °C.

En tenant compte de l'historique, fournis une analyse concise (5–8 phrases maximum) qui :
1. Commente les tendances observées sur les dernières mesures (pas seulement la dernière)
2. Identifie si des traitements semblent inefficaces (paramètre qui ne s'améliore pas)
3. Donne des conseils avancés ou des mises en garde spécifiques à cette situation
4. Reste factuel, sans répéter ce que le plan de traitement dit déjà

Réponds directement en français, sans titre ni introduction.`;

      const text = await callAIText({ apiKey, apiProvider, prompt });
      setAiComment(text.trim());
    } catch (e) {
      setAiError(e.message || "Erreur lors de l'analyse IA");
    } finally {
      setAiLoading(false);
    }
  }
  const recs = useMemo(
    () => (latest ? computeRecommendations(latest, volume, products, effectiveTargets, activeParamKeys, t) : []),
    [latest, volume, products, effectiveTargets, activeParamKeys]
  );

  if (!latest) {
    return (
      <div style={styles.emptyState}>
        <Droplets size={40} color="#7ab8e8" strokeWidth={1.5} />
        <p style={styles.emptyTitle}>{t("no_measure")}</p>
        <p style={styles.emptyText}>{t("no_measure_sub")}</p>
        <button style={styles.primaryBtn} onClick={onAddMeasure}>
          <Plus size={18} /> {t("add_measure")}
        </button>
      </div>
    );
  }

  // Paramètres actifs selon le traitement, filtrés par ceux effectivement saisis
  const allPossibleParams = activeParamKeys || ["pH", "fCl", "tCl", "tac", "cya", "temp"];
  const params = allPossibleParams.filter((p) => {
    const v = latest[p];
    return v !== undefined && v !== "" && v !== null;
  });

  return (
    <div>
      <div style={styles.sectionRow}>
        <span style={styles.sectionLabel}>{t("last_measure")}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={styles.sectionDate}>{formatDate(latest.date)}</span>
          <button style={styles.editLinkBtn} onClick={() => onEditMeasure(latest)}>
            <Settings2 size={13} /> {t("modify")}
          </button>
        </div>
      </div>

      {latest.photo && (
        <div style={styles.measurePhotoWrap}>
          <img src={latest.photo} alt="Photo de la mesure" style={styles.measurePhoto} />
        </div>
      )}

      {latest.note && (
        <div style={styles.latestNoteBox}>
          <span style={styles.latestNoteText}>{latest.note}</span>
        </div>
      )}

      <div style={styles.grid}>
        {params.map((p) => (
          <ParamCard key={p} param={p} value={latest[p]} effectiveTargets={effectiveTargets} lang={lang} />
        ))}
      </div>

      {blockedByLimit ? (
        <button style={styles.addMeasureBtnLocked} onClick={onAddMeasure}>
          <Lock size={16} /> {t("daily_limit")}
        </button>
      ) : (
        <button style={styles.addMeasureBtn} onClick={onAddMeasure}>
          <Plus size={18} /> {t("new_measure")}
        </button>
      )}

      <div style={styles.recoHeader}>
        <span style={styles.sectionLabel}>{t("treatment_plan")}</span>
      </div>

      {recs.length === 0 ? (
        <div style={styles.allGoodCard}>
          <CheckCircle2 size={22} color="#1a8fd1" />
          <span style={{ color: "#0a6ebd", fontWeight: 600, fontSize: 14 }}>
            {t("all_in_range")}
          </span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {recs.length > 1 && (
            <p style={styles.helpText}>{t("follow_order")}</p>
          )}
          {recs.map((r, i) => (
            <RecoCard
              key={i}
              reco={r}
              isLast={i === recs.length - 1}
              selectable={!applicationForLatest}
              selected={!!selectedRecs[i]}
              onToggle={() => setSelectedRecs((prev) => ({ ...prev, [i]: !prev[i] }))}
              manageStock={manageStock}
              products={products}
              lang={lang}
            />
          ))}

          {(() => {
            const selectedCount = Object.values(selectedRecs).filter(Boolean).length;
            return applicationForLatest ? (
              <div style={styles.applyConfirmedCard}>
                <CheckCircle2 size={16} color="#1a8fd1" />
                <span style={{ flex: 1 }}>
                  {t("advice_applied")} {applicationForLatest.allApplied ? "" : t("advice_partial")}{" "}
                  le {formatDate(applicationForLatest.appliedAt)}
                </span>
                <button style={styles.editLinkBtn} onClick={() => {
                  const sel = {};
                  recs.forEach((r, i) => {
                    sel[i] = applicationForLatest.steps?.some((s) => s.action === r.action) ?? true;
                  });
                  onValidateApplication(latest, recs, sel, true);
                }}>
                  {t("adjust")}
                </button>
              </div>
            ) : (
              <div>
                <button
                  style={{ ...styles.validateApplyBtn, opacity: selectedCount === 0 ? 0.5 : 1 }}
                  disabled={selectedCount === 0}
                  onClick={() => {
                    if (selectedCount === 0) return;
                    onValidateApplication(latest, recs, selectedRecs);
                  }}
                >
                  <CheckCircle2 size={16} /> {t("apply_advice")}
                  {selectedCount > 0 && ` (${selectedCount})`}
                  {!isPremium && <Lock size={14} style={{ marginLeft: 4 }} />}
                </button>
                <p style={{ ...styles.helpTextSmall, marginTop: 6, textAlign: "center" }}>
                  {t("apply_advice_sub")}
                </p>
              </div>
            );
          })()}
        </div>
      )}

      <div style={styles.aiSection}>
        <div style={styles.aiSectionTitle}>
          <Sparkles size={14} color="#1a8fd1" /> {t("ai_analysis")}
        </div>
        {!isPremium ? (
          <button style={styles.aiLockedBtn} onClick={onWantPremium}>
            <Lock size={15} />
            <span>{t("ai_locked")}</span>
          </button>
        ) : apiKey ? (
          <>
            <button
              style={{
                ...styles.aiAnalyzeBtn,
                ...(aiLoading ? styles.aiAnalyzeBtnLoading : {}),
              }}
              onClick={handleAiAnalysis}
              disabled={aiLoading || !latest}
            >
              {aiLoading ? (
                <><Loader2 size={14} className="spin" /> {t("ai_analyzing")}</>
              ) : (
                <><Sparkles size={14} /> {t("ai_analyze_btn")}</>
              )}
            </button>
            {aiComment && (
              <div style={styles.aiCommentBox}>{aiComment}</div>
            )}
            {aiError && (
              <div style={styles.aiErrorBox}>{aiError}</div>
            )}
          </>
        ) : (
          <div style={styles.aiKeyMissing}>
            <Lock size={14} color="#a0a8b0" />
            <span>{t("ai_api_missing")}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ParamCard({ param, value, effectiveTargets, lang }) {
  const t = useT(lang || "fr");
  const allTargets = effectiveTargets || TARGETS;
  const paramTarget = allTargets[param] || TARGETS[param];
  if (!paramTarget) return null;
  const status = statusFor(param, value, allTargets);
  const color = statusColor(status);
  return (
    <div style={{ ...styles.paramCard, borderColor: color + "33" }}>
      <div style={styles.paramTop}>
        <span style={styles.paramLabel}>{paramTarget.label}</span>
        <span style={{ ...styles.paramDot, background: color }} />
      </div>
      <div style={styles.paramValue}>
        {value}
        <span style={styles.paramUnit}>{paramTarget.unit}</span>
      </div>
      <div style={{ ...styles.paramStatus, color }}>{statusLabel(status, t)}</div>
      <div style={styles.paramRange}>
        {t("target")} {paramTarget.min}–{paramTarget.max} {paramTarget.unit}
      </div>
    </div>
  );
}

function RecoCard({ reco, isLast, selectable, selected, onToggle, manageStock, products, lang }) {
  const t = useT(lang || "fr");
  return (
    <div
      style={{
        ...styles.recoCard,
        ...(selectable ? {
          cursor: "pointer",
          border: selected ? "2px solid #0a6ebd" : "1.5px solid #d0e4f5",
          background: selected ? "#eaf5fd" : styles.recoCard.background,
        } : {}),
      }}
      onClick={selectable ? onToggle : undefined}
    >
      <div style={{ ...styles.recoTop, justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={styles.recoStepBadge}>{reco.stepNumber}</div>
          <span style={styles.recoParam}>{reco.title}</span>
        </div>
        {selectable && (
          <div style={{
            width: 22, height: 22, borderRadius: 6, flexShrink: 0,
            border: selected ? "2px solid #0a6ebd" : "2px solid #b0c4d8",
            background: selected ? "#0a6ebd" : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {selected && <CheckCircle2 size={14} color="#fff" />}
          </div>
        )}
      </div>

      {reco.startsAfterHours > 0 && (
        <div style={styles.recoTiming}>
          <Clock size={13} color="#a8721a" />
          {t("start_after", { h: reco.startsAfterHours })}
        </div>
      )}

      {(() => {
        const missingFromStock = manageStock && products && reco.productAvailable &&
          !products.find((p) => p.name === reco.productName && (p.stockPercent ?? 100) > 0);
        return (
          <div style={styles.recoProductRow}>
            {reco.productPhoto && (
              <img src={reco.productPhoto} alt="" style={styles.recoProductThumb} />
            )}
            <div style={styles.recoProduct}>
              {reco.productName}
              {reco.productAvailable === false && (
                <span style={styles.recoMissingTag}>
                  <AlertTriangle size={11} /> {t("missing_product")}
                </span>
              )}
              {missingFromStock && (
                <span style={{ ...styles.recoMissingTag, background: "#fdf0ef", color: "#c0392b", borderColor: "#f5c6c2" }}>
                  <AlertTriangle size={11} /> {t("stock_empty_badge")}
                </span>
              )}
            </div>
          </div>
        );
      })()}
      <div style={styles.recoDose}>{reco.doseText}</div>

      {!!reco.waitHours && (
        <div style={styles.recoWait}>
          <Clock size={13} color="#0a6ebd" />
          {isLast ? t("measure_after", { h: reco.waitHours }) : t("wait_before_next", { h: reco.waitHours })}
        </div>
      )}

      {reco.note && <div style={styles.recoNote}>{reco.note}</div>}
    </div>
  );
}

// Formate une dose avec conversion automatique g→kg et mL→L
function formatDose(amount, unit) {
  if (!amount && amount !== 0) return `? ${unit}`;
  if (unit === "g" && amount >= 1000) {
    const kg = amount / 1000;
    return `${Number.isInteger(kg) ? kg : kg.toFixed(2).replace(/\.?0+$/, "")} kg`;
  }
  if (unit === "mL" && amount >= 1000) {
    const L = amount / 1000;
    return `${Number.isInteger(L) ? L : L.toFixed(2).replace(/\.?0+$/, "")} L`;
  }
  return `${amount} ${unit}`;
}

// ---------- Logique de recommandation ----------
function computeRecommendations(latest, volume, products, effectiveTargets, activeParamKeys, t) {
  const _ = t || ((k, vars) => {
    // fallback fr si pas de t fourni
    let s = (TRANSLATIONS.fr[k] || k);
    if (vars) Object.keys(vars).forEach(v => { s = s.replace(`{${v}}`, vars[v]); });
    return s;
  });

  const targets = effectiveTargets || getEffectiveTargets("chlore");
  const paramKeys = activeParamKeys || ["pH", "fCl", "tCl", "tac", "cya", "temp"];
  const paramKeysLower = paramKeys.map((k) => k.toLowerCase());
  const targetsLower = Object.fromEntries(Object.entries(targets).map(([k, v]) => [k.toLowerCase(), v]));
  const latestLower = Object.fromEntries(Object.entries(latest).map(([k, v]) => [k.toLowerCase(), v]));

  const steps = [];
  const has = (key) => paramKeysLower.includes(key.toLowerCase());

  // Traduit la note d'un produit : utilise noteKey si c'est un produit par défaut, sinon la note brute
  const prodNote = (prod, fallbackKey) =>
    prod ? (prod.noteKey ? _(prod.noteKey) : prod.note) || _(fallbackKey) : _(fallbackKey);
  const tac = parseFloat(latestLower.tac);
  if (has("tac") && !Number.isNaN(tac) && targetsLower.tac && tac < targetsLower.tac.min) {
    const prod = products.find((p) => p.action === "tac+");
    steps.push({
      action: "tac+",
      title: _("reco_tac_low", { val: tac }),
      productName: prod ? prod.name : _("reco_fallback_tac"),
      productAvailable: !!prod,
      productPhoto: prod?.photo || null,
      doseText: prod
        ? `${_("reco_dose_prefix")} ${formatDose(prod.doseAmount, prod.doseUnit)} ${_("see_dosage").toLowerCase()}`
        : _("missing_product_tip", { action: "tac+" }),
      computedDoseAmount: prod?.doseAmount ?? null,
      doseUnit: prod?.doseUnit || null,
      note: prodNote(prod, "reco_note_tac"),
      waitHours: prod?.waitHours ?? DEFAULT_WAIT_HOURS["tac+"],
    });
  }

  // pH
  const phVal = parseFloat(latestLower.ph);
  if (has("ph") && !Number.isNaN(phVal) && targetsLower.ph) {
    const phTargets = targetsLower.ph;
    const targetMid = (phTargets.min + phTargets.max) / 2;
    if (phVal > phTargets.max) {
      const diff = phVal - targetMid;
      const prod = products.find((p) => p.action === "ph-");
      const computedDose = prod ? Math.round(prod.doseAmount * (volume / prod.effectPer) * (diff / prod.effectAmount)) : null;
      steps.push({
        action: "ph-",
        title: _("reco_ph_high", { val: phVal }),
        productName: prod ? prod.name : _("reco_fallback_ph_minus"),
        productAvailable: !!prod,
        productPhoto: prod?.photo || null,
        doseText: prod
          ? `${_("reco_dose_prefix")} ${formatDose(computedDose, prod.doseUnit)} ${_("reco_target")} ${targetMid.toFixed(1)}`
          : _("missing_product_tip", { action: "ph-" }),
        computedDoseAmount: computedDose,
        doseUnit: prod?.doseUnit || null,
        note: prodNote(prod, "reco_note_tac"),
        waitHours: prod?.waitHours ?? DEFAULT_WAIT_HOURS["ph-"],
      });
    } else if (phVal < phTargets.min) {
      const diff = targetMid - phVal;
      const prod = products.find((p) => p.action === "ph+");
      const computedDose = prod ? Math.round(prod.doseAmount * (volume / prod.effectPer) * (diff / prod.effectAmount)) : null;
      steps.push({
        action: "ph+",
        title: _("reco_ph_low", { val: phVal }),
        productName: prod ? prod.name : _("reco_fallback_ph_plus"),
        productAvailable: !!prod,
        productPhoto: prod?.photo || null,
        doseText: prod
          ? `${_("reco_dose_prefix")} ${formatDose(computedDose, prod.doseUnit)} ${_("reco_target")} ${targetMid.toFixed(1)}`
          : _("missing_product_tip", { action: "ph+" }),
        computedDoseAmount: computedDose,
        doseUnit: prod?.doseUnit || null,
        note: prodNote(prod, "reco_note_tac"),
        waitHours: prod?.waitHours ?? DEFAULT_WAIT_HOURS["ph+"],
      });
    }
  }

  // Chlore libre / combiné
  const fCl = parseFloat(latestLower.fcl);
  const tCl = parseFloat(latestLower.tcl);
  const combined = !Number.isNaN(fCl) && !Number.isNaN(tCl) ? Math.max(0, tCl - fCl) : null;

  if (has("fcl") && !Number.isNaN(fCl) && targetsLower.fcl) {
    const fclT = targetsLower.fcl;
    if (combined !== null && combined > 0.5) {
      const targetFcl = Math.max(fclT.max, combined * 3);
      const prod = products.find((p) => p.action === "chlore");
      const computedDose = prod ? Math.round(prod.doseAmount * (volume / prod.effectPer) * (targetFcl / prod.effectAmount)) : null;
      steps.push({
        action: "chlore",
        title: _("reco_cl_combined", { val: combined.toFixed(2) }),
        productName: prod ? prod.name : _("reco_fallback_chlore"),
        productAvailable: !!prod,
        productPhoto: prod?.photo || null,
        doseText: prod
          ? `${_("reco_dose_prefix")} ${formatDose(computedDose, prod.doseUnit)} ${_("reco_cl_shock_text")}`
          : _("missing_product_tip", { action: "chlore" }),
        computedDoseAmount: computedDose,
        doseUnit: prod?.doseUnit || null,
        note: _("reco_note_combined"),
        waitHours: prod?.waitHours ?? DEFAULT_WAIT_HOURS["chlore"],
      });
    } else if (fCl < fclT.min) {
      const targetFcl = (fclT.min + fclT.max) / 2;
      const diff = targetFcl - fCl;
      const prod = products.find((p) => p.action === "chlore");
      const computedDose = prod ? Math.round(prod.doseAmount * (volume / prod.effectPer) * (diff / prod.effectAmount)) : null;
      steps.push({
        action: "chlore",
        title: _("reco_cl_low", { val: fCl }),
        productName: prod ? prod.name : _("reco_fallback_chlore"),
        productAvailable: !!prod,
        productPhoto: prod?.photo || null,
        doseText: prod
          ? `${_("reco_dose_prefix")} ${formatDose(computedDose, prod.doseUnit)} ${_("reco_target")} ${targetFcl} mg/L`
          : _("missing_product_tip", { action: "chlore" }),
        computedDoseAmount: computedDose,
        doseUnit: prod?.doseUnit || null,
        note: prodNote(prod, "reco_note_combined"),
        waitHours: prod?.waitHours ?? DEFAULT_WAIT_HOURS["chlore"],
      });
    } else if (fCl > fclT.max) {
      steps.push({
        action: "chlore-excess",
        title: _("reco_cl_high", { val: fCl }),
        productName: _("reco_no_product"),
        productAvailable: true,
        doseText: _("reco_cl_excess_text"),
        computedDoseAmount: null,
        doseUnit: null,
        waitHours: 0,
      });
    }
  }

  // Brome
  const bromeVal = parseFloat(latestLower.brome);
  if (has("brome") && !Number.isNaN(bromeVal) && targetsLower.brome) {
    const brT = targetsLower.brome;
    if (bromeVal < brT.min) {
      const prod = products.find((p) => p.action === "brome");
      const diff = ((brT.min + brT.max) / 2) - bromeVal;
      const computedDose = prod ? Math.round(prod.doseAmount * (volume / prod.effectPer) * (diff / prod.effectAmount)) : null;
      steps.push({
        action: "brome",
        title: _("reco_brome_low", { val: bromeVal }),
        productName: prod ? prod.name : _("reco_fallback_brome"),
        productAvailable: !!prod,
        productPhoto: prod?.photo || null,
        doseText: prod
          ? `${_("reco_dose_prefix")} ${formatDose(computedDose, prod.doseUnit)} ${_("reco_target")} ${(brT.min + brT.max) / 2} mg/L`
          : _("missing_product_tip", { action: "brome" }),
        computedDoseAmount: computedDose,
        doseUnit: prod?.doseUnit || null,
        note: _("reco_note_brome"),
        waitHours: prod?.waitHours ?? 6,
      });
    }
  }

  // Oxygène actif
  const o2Val = parseFloat(latest.o2);
  if (has("o2") && !Number.isNaN(o2Val) && targets.o2) {
    const o2T = targets.o2;
    if (o2Val < o2T.min) {
      const prod = products.find((p) => p.action === "o2");
      const diff = ((o2T.min + o2T.max) / 2) - o2Val;
      const computedDose = prod ? Math.round(prod.doseAmount * (volume / prod.effectPer) * (diff / prod.effectAmount)) : null;
      steps.push({
        action: "o2",
        title: _("reco_o2_low", { val: o2Val }),
        productName: prod ? prod.name : _("reco_fallback_o2"),
        productAvailable: !!prod,
        productPhoto: prod?.photo || null,
        doseText: prod
          ? `${_("reco_dose_prefix")} ${formatDose(computedDose, prod.doseUnit)}`
          : _("missing_product_tip", { action: "o2" }),
        computedDoseAmount: computedDose,
        doseUnit: prod?.doseUnit || null,
        note: _("reco_note_o2"),
        waitHours: prod?.waitHours ?? 4,
      });
    }
  }

  // Sel
  const selVal = parseFloat(latestLower.sel);
  if (has("sel") && !Number.isNaN(selVal) && targetsLower.sel) {
    const selT = targetsLower.sel;
    if (selVal < selT.min) {
      const diff = ((selT.min + selT.max) / 2) - selVal;
      const selKg = Math.round((diff * volume) / 1000);
      steps.push({
        action: "sel",
        title: _("reco_sel_low", { val: selVal }),
        productName: _("reco_fallback_sel"),
        productAvailable: true,
        doseText: _("reco_water_renewal_text", { pct: selKg }).replace("{pct}", selKg) ||
          `${_("reco_dose_prefix")} ${selKg} kg ${_("reco_target")} ${Math.round((selT.min + selT.max) / 2)} mg/L`,
        computedDoseAmount: selKg,
        doseUnit: "kg",
        note: _("reco_note_sel"),
        waitHours: 24,
      });
    }
  }

  // CYA
  const cya = parseFloat(latestLower.cya);
  if (has("cya") && !Number.isNaN(cya) && targetsLower.cya && cya > targetsLower.cya.max) {
    const renewalPercent = Math.round((1 - 40 / cya) * 100);
    steps.push({
      action: "renouvellement",
      title: _("reco_cya_high", { val: cya }),
      productName: _("reco_water_renewal"),
      productAvailable: true,
      doseText: _("reco_water_renewal_text", { pct: renewalPercent }),
      computedDoseAmount: renewalPercent,
      doseUnit: "%",
      note: _("reco_note_cya"),
      waitHours: 0,
    });
  }

  steps.sort((a, b) => (ACTION_PRIORITY[a.action] ?? 9) - (ACTION_PRIORITY[b.action] ?? 9));
  let cumulativeHours = 0;
  return steps.map((step, i) => {
    const startsAfter = cumulativeHours;
    cumulativeHours += step.waitHours || 0;
    return { ...step, stepNumber: i + 1, startsAfterHours: startsAfter };
  });
}

// ---------- Historique ----------
function HistoryView({ measures, onDelete, onEdit, onAdd, onValidateApplication, applications, isPremium, poolName, onGenerateReport, onWantPremiumForReport, lang }) {
  const t = useT(lang);
  const [activeParams, setActiveParams] = useState(["pH", "fCl"]);
  const [showValues, setShowValues] = useState(false);

  const chartData = useMemo(() => {
    return [...measures]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((m) => ({
        date: formatDateShort(m.date),
        timestamp: new Date(m.date).getTime(),
        pH: m.pH !== undefined && m.pH !== "" ? parseFloat(m.pH) : null,
        fCl: m.fCl !== undefined && m.fCl !== "" ? parseFloat(m.fCl) : null,
        tCl: m.tCl !== undefined && m.tCl !== "" ? parseFloat(m.tCl) : null,
        tac: m.tac !== undefined && m.tac !== "" ? parseFloat(m.tac) : null,
        cya: m.cya !== undefined && m.cya !== "" ? parseFloat(m.cya) : null,
        temp: m.temp !== undefined && m.temp !== "" ? parseFloat(m.temp) : null,
      }));
  }, [measures]);

  const chartParams = [
    { key: "pH", color: "#1a8fd1", label: "pH", axis: "left" },
    { key: "fCl", color: "#2b7fd9", label: t("param_fcl").replace(" (mg/L)", ""), axis: "left" },
    { key: "tCl", color: "#8a6fd1", label: t("param_tcl").replace(" (mg/L)", ""), axis: "left" },
    { key: "tac", color: "#d98c2b", label: t("tac_col"), axis: "right" },
    { key: "cya", color: "#c4502f", label: t("cya_col"), axis: "right" },
    { key: "temp", color: "#e0578a", label: t("temp_col"), axis: "right" },
  ];

  const allKeys = chartParams.map((cp) => cp.key);
  const allActive = allKeys.every((k) => activeParams.includes(k));

  function toggleParam(key) {
    setActiveParams((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function toggleAll() {
    setActiveParams(allActive ? [] : allKeys);
  }

  if (measures.length === 0) {
    return (
      <div style={styles.emptyState}>
        <History size={40} color="#7ab8e8" strokeWidth={1.5} />
        <p style={styles.emptyTitle}>{t("no_history")}</p>
        <p style={styles.emptyText}>{t("no_history_sub")}</p>
        <button style={styles.primaryBtn} onClick={onAdd}>
          <Plus size={18} /> {t("add_measure")}
        </button>
      </div>
    );
  }

  return (
    <div>
      {poolName && <div style={styles.poolNameTag}>{poolName}</div>}
      <div style={styles.sectionRow}>
        <span style={styles.sectionLabel}>{t("evolution")}</span>
      </div>

      <div style={styles.chipsRow}>
        <button
          onClick={toggleAll}
          style={{
            ...styles.chip,
            ...styles.chipAll,
            background: allActive ? "#0a6ebd" : "#f1f4f3",
            borderColor: allActive ? "#0a6ebd" : "#d0e4f5",
            color: allActive ? "#ffffff" : "#2d4a6e",
          }}
        >
          {allActive ? t("show_values") : t("show_values")}
        </button>
        {chartParams.map((cp) => (
          <button
            key={cp.key}
            onClick={() => toggleParam(cp.key)}
            style={{
              ...styles.chip,
              background: activeParams.includes(cp.key) ? cp.color + "22" : "#f1f4f3",
              borderColor: activeParams.includes(cp.key) ? cp.color : "#d0e4f5",
              color: activeParams.includes(cp.key) ? cp.color : "#6a7d90",
            }}
          >
            {cp.label}
            <span style={styles.chipAxisTag}>{cp.axis === "left" ? "ᴜ" : "ᴅ"}</span>
          </button>
        ))}
      </div>

      <p style={styles.axisLegend}>
        <span style={styles.axisLegendItem}>{t("axis_legend_u")}</span>
        <span style={styles.axisLegendItem}>{t("axis_legend_d")}</span>
      </p>

      <label style={styles.checkboxRow}>
        <input
          type="checkbox"
          checked={showValues}
          onChange={(e) => setShowValues(e.target.checked)}
        />
        <span>{t("show_values")}</span>
      </label>

      {/* Détermine si les mesures couvrent plus d'un jour */}
      {(() => {
        const timestamps = chartData.map((d) => d.timestamp);
        const spanMs = timestamps.length > 1 ? Math.max(...timestamps) - Math.min(...timestamps) : 0;
        const showTime = spanMs < 86400000 * 2; // moins de 2 jours → affiche heure
        return (
          <div style={styles.chartCard}>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: showValues ? 18 : 8, right: 12, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6ebe9" />
                <XAxis
                  dataKey="timestamp"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  scale="time"
                  tickFormatter={(ts) => {
                    const d = new Date(ts);
                    if (showTime) {
                      return `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;
                    }
                    return `${d.getDate().toString().padStart(2,"0")}/${(d.getMonth()+1).toString().padStart(2,"0")}`;
                  }}
                  tick={{ fontSize: 10, fill: "#6a7d90" }}
                />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 10, fill: "#6a7d90" }}
              width={28}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 10, fill: "#6a7d90" }}
              width={28}
            />
            <Tooltip
              labelFormatter={(ts) => formatDate(new Date(ts).toISOString())}
              contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #d0e4f5" }}
            />
            {chartParams
              .filter((cp) => activeParams.includes(cp.key))
              .map((cp) => (
                <Line
                  key={cp.key}
                  yAxisId={cp.axis}
                  type="monotone"
                  dataKey={cp.key}
                  stroke={cp.color}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                  label={
                    showValues
                      ? { fontSize: 10, fill: cp.color, position: "top", offset: 8 }
                      : false
                  }
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
          </div>
        );
      })()}

      <div style={styles.sectionRow}>
        <span style={styles.sectionLabel}>{t("journal")}</span>
        <button style={styles.smallAddBtn} onClick={onAdd}>
          <Plus size={16} />
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {measures.map((m) => (
          <MeasureRow
            key={m.id}
            measure={m}
            onDelete={() => onDelete(m.id)}
            onEdit={() => onEdit(m)}
            onValidateApplication={() => onValidateApplication(m)}
            application={applications.find((a) => a.measureId === m.id)}
            isPremium={isPremium}
            lang={lang}
          />
        ))}
      </div>

      <div style={{ ...styles.sectionRow, marginTop: 18 }}>
        <span style={styles.sectionLabel}>{t("report")}</span>
      </div>
      {isPremium ? (
        <button style={styles.validateApplyBtn} onClick={onGenerateReport}>
          <FileText size={16} /> {t("generate_report")}
        </button>
      ) : (
        <button style={styles.photoLockedBtn} onClick={onWantPremiumForReport}>
          <Lock size={16} />
          <span>{t("report_locked")}</span>
        </button>
      )}
      <p style={styles.helpTextSmall}>{t("report_desc")}</p>
    </div>
  );
}

function MeasureRow({ measure, onDelete, onEdit, onValidateApplication, application, isPremium, lang }) {
  const t = useT(lang || "fr");
  const [open, setOpen] = useState(false);
  const params = ["pH", "fCl", "tCl", "tac", "cya", "temp"].filter(
    (p) => measure[p] !== undefined && measure[p] !== "" && measure[p] !== null
  );
  return (
    <div style={styles.measureRow}>
      <button
        style={styles.measureRowHeader}
        onClick={() => setOpen((o) => !o)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          {measure.photo && (
            <img src={measure.photo} alt="" style={styles.measureThumb} />
          )}
          <span style={styles.measureDate}>{formatDate(measure.date)}</span>
        </div>
        <ChevronRight
          size={16}
          color="#6a7d90"
          style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform .15s" }}
        />
      </button>
      {open && (
        <div style={styles.measureDetails}>
          {/* Photos d'analyse (photomètre/bandelette) */}
          {(() => {
            const allPhotos = measure.photos?.length ? measure.photos : (measure.photo ? [measure.photo] : []);
            if (!allPhotos.length) return null;
            return (
              <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 10 }}>
                {allPhotos.map((src, idx) => (
                  <img key={idx} src={src} alt="" style={{ height: 110, borderRadius: 8, objectFit: "cover", flexShrink: 0, border: "1px solid #d0e4f5" }} />
                ))}
              </div>
            );
          })()}
          {/* Photos bassin */}
          {measure.poolPhotos?.length > 0 && (
            <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 10 }}>
              {measure.poolPhotos.map((src, idx) => (
                <img key={idx} src={src} alt="" style={{ height: 110, borderRadius: 8, objectFit: "cover", flexShrink: 0, border: "1px solid #d0e4f5" }} />
              ))}
            </div>
          )}
          <div style={styles.measureChips}>
            {params.map((p) => {
              const status = statusFor(p, measure[p]);
              return (
                <span
                  key={p}
                  style={{
                    ...styles.measureChip,
                    color: statusColor(status),
                    borderColor: statusColor(status) + "44",
                  }}
                >
                  {TARGETS[p].label}: {measure[p]} {TARGETS[p].unit}
                </span>
              );
            })}
          </div>
          {measure.note && <div style={styles.measureNote}>{measure.note}</div>}

          {application ? (
            <div style={styles.applyConfirmedCard}>
              <CheckCircle2 size={16} color="#1a8fd1" />
              <span style={{ flex: 1 }}>
                {t("advice_applied")} {application.allApplied ? "" : t("advice_partial")} le{" "}
                {formatDate(application.appliedAt)}
              </span>
              <button style={styles.editLinkBtn} onClick={onValidateApplication}>
                {t("adjust")}
              </button>
            </div>
          ) : (
            <button style={styles.validateApplyBtnSmall} onClick={onValidateApplication}>
              <CheckCircle2 size={14} /> {t("apply_advice")}
              {!isPremium && <Lock size={12} style={{ marginLeft: 2 }} />}
            </button>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button style={styles.editBtn} onClick={onEdit}>
              <Settings2 size={14} /> {t("modify")}
            </button>
            <button style={styles.deleteBtn} onClick={onDelete}>
              <Trash2 size={14} /> {t("delete")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Modal Ajout mesure ----------
function AddMeasureModal({ measure, onClose, onSave, isPremium, onWantPremium, apiKey, apiProvider, activeParamKeys, lang }) {
  const t = useT(lang || "fr");
  const isEditing = !!measure;
  const [date, setDate] = useState(
    measure ? new Date(measure.date).toISOString().slice(0, 16) : todayLocalDatetime()
  );
  const [method, setMethod] = useState(measure?.method || "photometre"); // photometre | bandelette
  const [pH, setPH] = useState(measure?.pH ?? "");
  const [fCl, setFCl] = useState(measure?.fCl ?? "");
  const [tCl, setTCl] = useState(measure?.tCl ?? "");
  const [tac, setTac] = useState(measure?.tac ?? "");
  const [cya, setCya] = useState(measure?.cya ?? "");
  const [temp, setTemp] = useState(measure?.temp ?? "");
  const [sel, setSel] = useState(measure?.sel ?? "");
  const [brome, setBrome] = useState(measure?.brome ?? "");
  const [o2, setO2] = useState(measure?.o2 ?? "");
  const [note, setNote] = useState(measure?.note || "");
  const [photos, setPhotos] = useState(
    measure?.photo ? [measure.photo] : (measure?.photos || [])
  );
  const [poolPhotos, setPoolPhotos] = useState(measure?.poolPhotos || []);
  const [poolPhotoBusy, setPoolPhotoBusy] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);
  const [analyzeNote, setAnalyzeNote] = useState(null);
  const [confirmAnalyze, setConfirmAnalyze] = useState(false);
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const poolFileInputRef = useRef(null);
  const poolGalleryInputRef = useRef(null);

  async function handlePoolPhotoChange(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setPoolPhotoBusy(true);
    try {
      const dataUrls = await Promise.all(files.map(fileToDataUrl));
      setPoolPhotos((prev) => [...prev, ...dataUrls]);
    } catch (err) { /* silencieux */ } finally {
      setPoolPhotoBusy(false);
      e.target.value = "";
    }
  }

  async function handlePhotoChange(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setPhotoBusy(true);
    try {
      const dataUrls = await Promise.all(files.map(fileToDataUrl));
      setPhotos((prev) => [...prev, ...dataUrls]);
    } catch (err) {
      // silencieux
    } finally {
      setPhotoBusy(false);
      e.target.value = "";
    }
  }

  function removePhoto(idx) {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
    setAnalyzeNote(null);
    setAnalyzeError(null);
  }

  async function handleAnalyze() {
    if (!photos.length) return;
    setConfirmAnalyze(false);
    setAnalyzing(true);
    setAnalyzeError(null);
    setAnalyzeNote(null);
    try {
      // Analyse chaque photo et fusionne les résultats (dernière valeur non-null gagne)
      const merged = {};
      const notes = [];
      for (const dataUrl of photos) {
        const result = await analyzeStripPhoto({ apiKey, apiProvider, dataUrl });
        Object.keys(result).forEach((k) => {
          if (result[k] !== null && result[k] !== undefined && k !== "confidence" && k !== "note") {
            merged[k] = result[k];
          }
        });
        if (result.note) notes.push(result.note);
      }
      if (merged.pH !== undefined) setPH(String(merged.pH));
      if (merged.fCl !== undefined) setFCl(String(merged.fCl));
      if (merged.tCl !== undefined) setTCl(String(merged.tCl));
      if (merged.tac !== undefined) setTac(String(merged.tac));
      if (merged.cya !== undefined) setCya(String(merged.cya));
      setAnalyzeNote(
        `${photos.length} photo(s) — ${notes.join(" / ") || t("verify_connection")}`
      );
    } catch (err) {
      setAnalyzeError(t("error_analyze") + " : " + (err?.message || t("verify_connection")));
    } finally {
      setAnalyzing(false);
    }
  }

  function handleSave() {
    onSave({
      ...(isEditing ? { id: measure.id } : {}),
      date: new Date(date).toISOString(),
      method,
      pH,
      fCl,
      tCl,
      tac,
      cya,
      temp,
      sel,
      brome,
      o2,
      note,
      photo: photos[0] || null,
      photos,
      poolPhotos,
    });
  }

  // Tous les champs possibles, filtrés selon le traitement du bassin
  const ALL_FIELDS = [
    { key: "pH",   label: t("param_ph"),    value: pH,    set: setPH,    step: "0.01", placeholder: "7.40" },
    { key: "fCl",  label: t("param_fcl"),   value: fCl,   set: setFCl,   step: "0.01", placeholder: "1.20" },
    { key: "tCl",  label: t("param_tcl"),   value: tCl,   set: setTCl,   step: "0.01", placeholder: "1.30" },
    { key: "tac",  label: t("param_tac"),   value: tac,   set: setTac,   step: "1",    placeholder: "100" },
    { key: "cya",  label: t("param_cya"),   value: cya,   set: setCya,   step: "1",    placeholder: "40" },
    { key: "temp", label: t("param_temp"),  value: temp,  set: setTemp,  step: "0.1",  placeholder: "27" },
    { key: "sel",  label: t("param_sel"),   value: sel,   set: setSel,   step: "10",   placeholder: "4000" },
    { key: "brome",label: t("param_brome"), value: brome, set: setBrome, step: "0.1",  placeholder: "3.0" },
    { key: "o2",   label: t("param_o2"),    value: o2,    set: setO2,    step: "0.5",  placeholder: "20" },
  ];
  const fields = activeParamKeys
    ? ALL_FIELDS.filter((f) => activeParamKeys.includes(f.key))
    : ALL_FIELDS.filter((f) => ["pH","fCl","tCl","tac","cya","temp"].includes(f.key));

  return (
    <ModalShell onClose={onClose} title={isEditing ? t("edit_measure_title") : t("new_measure_title")}>
      <label style={styles.fieldLabel}>{t("date_time")}</label>
      <input
        type="datetime-local"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        style={styles.input}
      />

      {isPremium ? (
        <div style={styles.photoHintBox}>
          <Camera size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{t("photo_hint")}</span>
        </div>
      ) : null}

      <label style={styles.fieldLabel}>{t("photos_label")}</label>
      {isPremium ? (
        <div>
          {/* Grille de miniatures */}
          {photos.length > 0 && (
            <div style={styles.photoGrid}>
              {photos.map((src, idx) => (
                <div key={idx} style={styles.photoThumbWrap}>
                  <img src={src} alt={`Photo ${idx + 1}`} style={styles.photoThumb} />
                  <button style={styles.photoThumbRemove} onClick={() => removePhoto(idx)}>
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 2 boutons : appareil photo + bibliothèque */}
          <div style={{ ...styles.photoCaptureBtnRow, marginTop: photos.length ? 8 : 0 }}>
            <button
              type="button"
              style={styles.photoCaptureBtnHalf}
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera size={17} />
              {photoBusy ? t("loading") : photos.length ? t("other_photo") : t("camera_btn")}
            </button>
            <button
              type="button"
              style={styles.photoCaptureBtnHalf}
              onClick={() => galleryInputRef.current?.click()}
            >
              <ImageOff size={17} />
              {photoBusy ? t("loading") : photos.length ? t("other_gallery") : t("gallery_btn")}
            </button>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" multiple onChange={handlePhotoChange} style={styles.hiddenFileInput} />
          <input ref={galleryInputRef} type="file" accept="image/*" multiple onChange={handlePhotoChange} style={styles.hiddenFileInput} />

          {/* Bouton analyser + confirmation */}
          {photos.length > 0 && apiKey && (
            <div style={{ marginTop: 10 }}>
              {!confirmAnalyze ? (
                <button
                  type="button"
                  style={styles.analyzeBtn}
                  onClick={() => setConfirmAnalyze(true)}
                  disabled={analyzing}
                >
                  <Sparkles size={14} />
                  {t("analyze_btn")} {photos.length > 1 ? `(${photos.length})` : ""}
                </button>
              ) : (
                <div style={styles.confirmAnalyzeBox}>
                  <span>{t("photos_done")}</span>
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button style={styles.confirmYesBtn} onClick={handleAnalyze} disabled={analyzing}>
                      {analyzing
                        ? <><Loader2 size={13} className="spin" /> {t("analyzing")}</>
                        : t("yes_analyze")}
                    </button>
                    <button style={styles.confirmNoBtn} onClick={() => setConfirmAnalyze(false)}>
                      {t("add_more")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {analyzeNote && <div style={{ ...styles.analyzeNoteOk, marginTop: 8 }}>{analyzeNote}</div>}
          {analyzeError && <div style={{ ...styles.analyzeNoteError, marginTop: 8 }}>{analyzeError}</div>}
        </div>
      ) : (
        <button style={styles.photoLockedBtn} onClick={onWantPremium}>
          <Lock size={16} />
          <span>{t("analyze_locked")}</span>
        </button>
      )}

      <div style={styles.fieldGrid}>
        {fields.map((f) => (
          <div key={f.key}>
            <label style={styles.fieldLabel}>{f.label}</label>
            <input
              type="number"
              step={f.step}
              inputMode="decimal"
              placeholder={f.placeholder}
              value={f.value}
              onChange={(e) => f.set(e.target.value)}
              style={styles.input}
            />
          </div>
        ))}
      </div>

      <label style={styles.fieldLabel}>{t("note_optional")}</label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={t("note_placeholder")}
        style={{ ...styles.input, minHeight: 64, resize: "vertical" }}
      />

      {isPremium ? (
        <div style={{ marginTop: 4 }}>
          <label style={styles.fieldLabel}>{t("pool_photos_label")}</label>
          {poolPhotos.length > 0 && (
            <div style={styles.photoGrid}>
              {poolPhotos.map((src, idx) => (
                <div key={idx} style={styles.photoThumbWrap}>
                  <img src={src} alt="" style={styles.photoThumb} />
                  <button style={styles.photoThumbRemove} onClick={() => setPoolPhotos((prev) => prev.filter((_, i) => i !== idx))}>
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div style={{ ...styles.photoCaptureBtnRow, marginTop: poolPhotos.length ? 8 : 0 }}>
            <button type="button" style={styles.photoCaptureBtnHalf} onClick={() => poolFileInputRef.current?.click()}>
              <Camera size={17} />
              {poolPhotoBusy ? t("loading") : poolPhotos.length ? t("other_photo") : t("camera_btn")}
            </button>
            <button type="button" style={styles.photoCaptureBtnHalf} onClick={() => poolGalleryInputRef.current?.click()}>
              <ImageOff size={17} />
              {poolPhotoBusy ? t("loading") : poolPhotos.length ? t("other_gallery") : t("gallery_btn")}
            </button>
          </div>
          <input ref={poolFileInputRef} type="file" accept="image/*" capture="environment" multiple onChange={handlePoolPhotoChange} style={styles.hiddenFileInput} />
          <input ref={poolGalleryInputRef} type="file" accept="image/*" multiple onChange={handlePoolPhotoChange} style={styles.hiddenFileInput} />
        </div>
      ) : (
        <div style={{ marginTop: 4 }}>
          <label style={styles.fieldLabel}>{t("pool_photos_label")}</label>
          <button style={styles.photoLockedBtn} onClick={onWantPremium}>
            <Lock size={16} />
            <span>{t("pool_photo_locked")}</span>
          </button>
        </div>
      )}

      <button style={styles.primaryBtn} onClick={handleSave}>
        {isEditing ? t("save_changes") : t("save_measure")}
      </button>
    </ModalShell>
  );
}

// ---------- Validation des conseils appliqués ----------
function ValidateApplicationModal({ measure, recs, existingApplication, onClose, onSave, preselected, products, manageStock, onWantAddProduct, lang }) {
  const t = useT(lang || "fr");
  function toDisplayUnit(amount, unit) {
    if (amount == null) return { value: "", displayUnit: unit };
    if (unit === "g" && amount >= 1000) return { value: parseFloat((amount / 1000).toFixed(3)), displayUnit: "kg" };
    if (unit === "mL" && amount >= 1000) return { value: parseFloat((amount / 1000).toFixed(3)), displayUnit: "L" };
    return { value: amount, displayUnit: unit };
  }
  function toBaseUnit(value, displayUnit, baseUnit) {
    const v = parseFloat(value);
    if (isNaN(v)) return null;
    if (displayUnit === "kg" && baseUnit === "g") return v * 1000;
    if (displayUnit === "L" && baseUnit === "mL") return v * 1000;
    return v;
  }

  // Étape 1 : sélection des conseils à appliquer
  // Étape 2 : saisie des quantités pour les conseils sélectionnés
  const [step, setStep] = useState((preselected?.adjustMode || preselected?.selected) ? "quantities" : "select");
  const [selected, setSelected] = useState(() => {
    if (preselected?.selected) return preselected.selected;
    if (preselected && !preselected.selected) return preselected;
    const init = {};
    recs.forEach((_, i) => { init[i] = true; });
    return init;
  });
  const [amounts, setAmounts] = useState(() => {
    const init = {};
    recs.forEach((r, i) => {
      const existing = existingApplication?.steps?.find((s) => s.action === r.action);
      const raw = existing ? existing.appliedAmount : r.computedDoseAmount;
      const { value } = toDisplayUnit(raw, r.doseUnit || "g");
      init[i] = value;
    });
    return init;
  });

  const selectedCount = Object.values(selected).filter(Boolean).length;

  function handleConfirmSelection() {
    if (selectedCount === 0) return;
    setStep("quantities");
  }

  function handleSave() {
    const steps = recs
      .filter((_, i) => selected[i])
      .map((r, idx) => {
        const i = recs.indexOf(r);
        const baseUnit = r.doseUnit || "g";
        const { displayUnit } = toDisplayUnit(r.computedDoseAmount, baseUnit);
        return {
          action: r.action,
          title: r.title,
          productName: r.productName,
          appliedAmount: toBaseUnit(amounts[i], displayUnit, baseUnit),
          doseUnit: baseUnit,
        };
      });
    const allApplied = selectedCount === recs.length;
    onSave(measure.id, steps, allApplied);
  }

  if (step === "select") {
    return (
      <ModalShell onClose={onClose} title={t("apply_title")}>
        <p style={styles.helpText}>
          {t("apply_subtitle")} {formatDate(measure.date)}.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
          {recs.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelected((prev) => ({ ...prev, [i]: !prev[i] }))}
              style={{
                ...styles.applyStepCard,
                display: "flex",
                alignItems: "center",
                gap: 12,
                cursor: "pointer",
                border: selected[i] ? "2px solid #0a6ebd" : "1.5px solid #d0e4f5",
                background: selected[i] ? "#e8f4fd" : "#f8fafd",
                textAlign: "left",
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                border: selected[i] ? "2px solid #0a6ebd" : "2px solid #b0c4d8",
                background: selected[i] ? "#0a6ebd" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {selected[i] && <CheckCircle2 size={14} color="#fff" />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={styles.applyStepTitle}>{r.title}</div>
                <div style={styles.applyStepProduct}>{r.productName}</div>
                {r.doseText && <div style={{ fontSize: 12, color: "#4a6480", marginTop: 2 }}>{r.doseText}</div>}
              </div>
            </button>
          ))}
        </div>
        <button
          style={{ ...styles.primaryBtn, marginTop: 16, opacity: selectedCount === 0 ? 0.5 : 1 }}
          onClick={handleConfirmSelection}
          disabled={selectedCount === 0}
        >
          {t("confirm_btn")} ({selectedCount} {selectedCount > 1 ? t("confirm_count_plural") : t("confirm_count")})
        </button>
      </ModalShell>
    );
  }

  // Étape 2 : saisie des quantités
  return (
    <ModalShell onClose={onClose} title={t("quantities_title")}>
      <p style={styles.helpText}>{t("quantities_subtitle")}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 4 }}>
        {recs.filter((_, i) => selected[i]).map((r) => {
          const i = recs.indexOf(r);
          const baseUnit = r.doseUnit || "g";
          const { displayUnit } = toDisplayUnit(r.computedDoseAmount, baseUnit);
          return (
            <div key={i} style={styles.applyStepCard}>
              <div style={styles.applyStepTitle}>{r.title}</div>
              <div style={styles.applyStepProduct}>{r.productName}</div>
              {manageStock && products && r.productAvailable &&
                !products.find((p) => p.name === r.productName && (p.stockPercent ?? 100) > 0) && (
                <div style={{ padding: "8px 10px", borderRadius: 8, background: "#fdf0ef", border: "1px solid #f5c6c2", marginBottom: 8, fontSize: 12, color: "#c0392b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span><AlertTriangle size={12} style={{ marginRight: 4 }} />{t("stock_empty")}</span>
                  <button type="button" onClick={onWantAddProduct} style={{ background: "none", border: "none", color: "#c0392b", fontWeight: 700, fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>
                    {t("add_arrow")}
                  </button>
                </div>
              )}
              {r.doseUnit ? (
                <div style={styles.fieldGrid}>
                  <div>
                    <label style={styles.fieldLabel}>{t("quantity_applied")}</label>
                    <input
                      type="number"
                      style={styles.input}
                      value={amounts[i] ?? ""}
                      onChange={(e) => setAmounts((prev) => ({ ...prev, [i]: e.target.value }))}
                      placeholder={r.computedDoseAmount != null ? String(toDisplayUnit(r.computedDoseAmount, baseUnit).value) : ""}
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label style={styles.fieldLabel}>{t("unit")}</label>
                    <div style={styles.unitTag}>{displayUnit}</div>
                  </div>
                </div>
              ) : (
                <p style={styles.helpTextSmall}>{r.doseText}</p>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
        <button style={styles.primaryBtn} onClick={handleSave}>
          {t("validate_btn")}
        </button>
        <button style={{ ...styles.primaryBtn, background: "#f0f6fb", color: "#0a6ebd", border: "1px solid #d0e4f5" }}
          onClick={() => setStep("select")}>
          {t("back_btn")}
        </button>
      </div>
    </ModalShell>
  );
}

// ---------- Produits ----------
function ProductsView({ products, onEdit, onAddNew, onDelete, onResetAll, isPremium, onWantPremium, onWantSettings, poolName, manageStock, lang }) {
  const t = useT(lang);

  // Version gratuite : écran paywall uniquement
  if (!isPremium) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 24px", gap: 16, textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "#f0f6fb", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Lock size={26} color="#0a6ebd" />
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#0d2b4e" }}>{t("my_products")}</div>
        <div style={{ fontSize: 14, color: "#4a6480", lineHeight: 1.5, maxWidth: 300 }}>{t("products_locked")}</div>
        <button
          style={{ marginTop: 8, padding: "13px 28px", borderRadius: 12, border: "none", background: "#0a6ebd", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
          onClick={onWantPremium}
        >
          <Crown size={15} style={{ marginRight: 7, verticalAlign: "middle" }} />
          {t("paywall_btn")}
        </button>
      </div>
    );
  }

  function handleResetAll() {
    if (products.length === 0) return;
    const ok = window.confirm(`${products.length} ${products.length > 1 ? t("confirm_count_plural") : t("confirm_count")} ?`);
    if (ok) onResetAll();
  }

  return (
    <div>
      {poolName && <div style={styles.poolNameTag}>{poolName}</div>}
      <div style={styles.sectionRow}>
        <span style={styles.sectionLabel}>{t("my_products")}</span>
        {manageStock && (
          <button style={styles.smallAddBtn} onClick={onAddNew}>
            <Plus size={16} />
          </button>
        )}
      </div>

      {!manageStock ? (
        <div style={styles.stockNotManagedBox}>
          <span>{t("stock_not_managed")}</span>
          <button type="button" style={styles.stockActivateLink} onClick={onWantSettings}>
            {t("activate_in_settings")}
          </button>
        </div>
      ) : (
        <>
          <p style={styles.helpText}>{t("products_formula")}</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {products.map((p) => (
              <button key={p.id} style={styles.productRow} onClick={() => onEdit(p)}>
                {p.photo ? (
                  <img src={p.photo} alt="" style={styles.productThumb} />
                ) : (
                  <div style={styles.productThumbPlaceholder}>
                    <Beaker size={16} color="#7ab8e8" />
                  </div>
                )}
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={styles.productName}>{p.name}</div>
                  <div style={styles.productMeta}>
                    {p.doseAmount} {p.doseUnit} → {p.effectAmount} / {p.effectPer} m³ ·{" "}
                    {getProductActions(lang).find((a) => a.value === p.action)?.label}
                    {!!p.waitHours && ` · ${p.waitHours}h`}
                  </div>
                  {(() => {
                    const pct = p.stockPercent ?? 100;
                    const low = pct <= 20;
                    const container = p.containerAmount || 1;
                    const cUnit = p.containerUnit || "kg";
                    const remaining = (container * pct / 100);
                    const displayVal = Number.isInteger(remaining) ? remaining : remaining.toFixed(2).replace(/\.?0+$/, "");
                    return (
                      <div style={{ marginTop: 6 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                          <span style={{ fontSize: 11, color: low ? "#c0392b" : "#4a6480", fontWeight: 600 }}>
                            {t("stock_label")} {pct} %
                          </span>
                          <span style={{ fontSize: 11, color: low ? "#c0392b" : "#6a7d90" }}>
                            ≈ {displayVal} {cUnit} {t("stock_remaining")}
                          </span>
                        </div>
                        <div style={{ height: 5, borderRadius: 99, background: "#e8f0f8", overflow: "hidden" }}>
                          <div style={{
                            height: "100%",
                            width: `${pct}%`,
                            borderRadius: 99,
                            background: low ? "#c0392b" : pct <= 50 ? "#d98c2b" : "#1a8fd1",
                            transition: "width 0.3s",
                          }} />
                        </div>
                      </div>
                    );
                  })()}
                </div>
                <ChevronRight size={16} color="#6a7d90" />
              </button>
            ))}
            {products.length === 0 && (
              <p style={styles.emptyText}>{t("new_product")}</p>
            )}
          </div>

          {products.length > 0 && (
            <button style={styles.dangerLinkBtn} onClick={handleResetAll}>
              <Trash2 size={14} /> {t("delete_all_products")}
            </button>
          )}
        </>
      )}
    </div>
  );
}

function ProductModal({ product, onClose, onSave, isPremium, onWantPremium, applications, manageStock, onWantManageStock, lang }) {
  const t = useT(lang || "fr");
  const [name, setName] = useState(product?.name || "");
  const [action, setAction] = useState(product?.action || "ph-");
  const [doseAmount, setDoseAmount] = useState(product?.doseAmount ?? 30);
  const [doseUnit, setDoseUnit] = useState(product?.doseUnit || "g");
  const [effectAmount, setEffectAmount] = useState(product?.effectAmount ?? 0.1);
  const [effectPer, setEffectPer] = useState(product?.effectPer ?? 10);
  const [waitHours, setWaitHours] = useState(product?.waitHours ?? DEFAULT_WAIT_HOURS[product?.action || "ph-"] ?? 2);
  const [note, setNote] = useState(product?.note || "");
  const [photo, setPhoto] = useState(product?.photo || null);
  const [stockPercent, setStockPercent] = useState(product?.stockPercent ?? null);
  const [containerAmount, setContainerAmount] = useState(product?.containerAmount ?? 1);
  const [containerUnit, setContainerUnit] = useState(product?.containerUnit ?? "kg");
  const [photoBusy, setPhotoBusy] = useState(false);
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoBusy(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      setPhoto(dataUrl);
    } catch (err) {
      // silencieux
    } finally {
      setPhotoBusy(false);
    }
  }

  function handleSave() {
    if (!name.trim()) return;
    onSave({
      id: product?.id,
      name: name.trim(),
      action,
      doseAmount: parseFloat(doseAmount) || 0,
      doseUnit,
      effectAmount: parseFloat(effectAmount) || 1,
      effectPer: parseFloat(effectPer) || 1,
      waitHours: parseFloat(waitHours) || 0,
      note,
      photo,
      stockPercent: stockPercent ?? 100,
      containerAmount: parseFloat(containerAmount) || 1,
      containerUnit: containerUnit || "kg",
    });
  }

  return (
    <ModalShell
      onClose={onClose}
      title={product ? t("edit_product") : t("new_product")}
      rightAction={
        product ? (
          <button style={styles.modalDeleteBtn} onClick={() => onSave({ ...product, __delete: true })}>
            <Trash2 size={16} />
          </button>
        ) : null
      }
    >
      <label style={styles.fieldLabel}>{t("product_photo")}</label>
      {isPremium ? (
        <div>
          {photo ? (
            <div style={styles.photoPreviewWrap}>
              <img src={photo} alt="" style={styles.photoPreview} />
              <button style={styles.photoRemoveBtn} onClick={() => setPhoto(null)}>
                <X size={14} /> {t("remove")}
              </button>
            </div>
          ) : (
            <div style={styles.photoCaptureBtnRow}>
              <button type="button" style={styles.photoCaptureBtnHalf} onClick={() => fileInputRef.current?.click()}>
                <Camera size={17} />
                {photoBusy ? "..." : t("camera_btn")}
              </button>
              <button type="button" style={styles.photoCaptureBtnHalf} onClick={() => galleryInputRef.current?.click()}>
                <ImageOff size={17} />
                {photoBusy ? "..." : t("gallery_btn")}
              </button>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} style={styles.hiddenFileInput} />
          <input ref={galleryInputRef} type="file" accept="image/*" onChange={handlePhotoChange} style={styles.hiddenFileInput} />
        </div>
      ) : (
        <button style={styles.photoLockedBtn} onClick={onWantPremium}>
          <Lock size={16} />
          <span>{t("analyze_locked")}</span>
        </button>
      )}

      <label style={styles.fieldLabel}>{t("product_name")}</label>
      <input
        style={styles.input}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="ex: Chlore choc XYZ"
      />

      <label style={styles.fieldLabel}>{t("effect")}</label>
      <select style={styles.input} value={action} onChange={(e) => setAction(e.target.value)}>
        {getProductActions(lang).map((a) => (
          <option key={a.value} value={a.value}>{a.label}</option>
        ))}
      </select>

      <div style={styles.fieldGrid}>
        <div>
          <label style={styles.fieldLabel}>{t("quantity")}</label>
          <input type="number" style={styles.input} value={doseAmount} onChange={(e) => setDoseAmount(e.target.value)} />
        </div>
        <div>
          <label style={styles.fieldLabel}>{t("effect_variation")}</label>
          <input type="number" style={styles.input} value={effectAmount} onChange={(e) => setEffectAmount(e.target.value)} />
        </div>
        <div>
          <label style={styles.fieldLabel}>{t("for_x_m3")}</label>
          <input type="number" style={styles.input} value={effectPer} onChange={(e) => setEffectPer(e.target.value)} />
        </div>
      </div>

      <label style={styles.fieldLabel}>{t("wait_hours")}</label>
      <input type="number" style={styles.input} value={waitHours} onChange={(e) => setWaitHours(e.target.value)} placeholder="2" />

      {!isPremium ? (
        <button style={styles.photoLockedBtn} onClick={onWantPremium}>
          <Lock size={16} />
          <span>{t("stock_locked")}</span>
        </button>
      ) : !manageStock ? (
        <div style={styles.stockNotManagedBox}>
          <span>{t("stock_not_managed_modal")}</span>
          <button type="button" style={styles.stockActivateLink} onClick={onWantManageStock}>
            {t("activate_in_settings")}
          </button>
        </div>
      ) : (
        <>
          <label style={styles.fieldLabel}>{t("container_size")}</label>
          <div style={styles.segmentedControl}>
            {["kg", "L"].map((u) => (
              <button key={u} type="button" onClick={() => setContainerUnit(u)}
                style={{ ...styles.segmentedBtn, ...(containerUnit === u ? styles.segmentedBtnActive : {}) }}>
                {u}
              </button>
            ))}
          </div>
          <input type="number" style={styles.input} value={containerAmount}
            onChange={(e) => setContainerAmount(e.target.value)} placeholder="1" min="0.01" step="0.1" />

          <label style={styles.fieldLabel}>{t("current_stock")}</label>
          {stockPercent === null ? (
            <div style={styles.stockInitRow}>
              <button type="button" style={styles.stockInitBtn} onClick={() => setStockPercent(100)}>
                {t("new_product_btn")}
              </button>
              <button type="button" style={styles.stockInitBtn} onClick={() => setStockPercent(50)}>
                {t("manual_entry")}
              </button>
            </div>
          ) : (
            <div style={styles.stockSliderWrap}>
              <input type="range" min="0" max="100" value={stockPercent}
                onChange={(e) => setStockPercent(Number(e.target.value))} style={{ flex: 1 }} />
              <span style={{ ...styles.stockPercentLabel, color: stockPercent <= 20 ? "#c0392b" : "#0d2b4e", fontWeight: 700 }}>
                {stockPercent} %
              </span>
            </div>
          )}
        </>
      )}

      {isPremium && product && (() => {
        const history = (applications || [])
          .flatMap((app) => (app.steps || [])
            .filter((s) => s.productName === product.name && s.appliedAmount)
            .map((s) => ({ date: app.appliedAt, amount: s.appliedAmount, unit: s.doseUnit || "g" }))
          )
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 10);
        if (!history.length) return null;
        return (
          <div style={{ marginBottom: 12 }}>
            <label style={styles.fieldLabel}>{t("last_consumptions")}</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {history.map((h, i) => {
                const unit = h.unit || "g";
                const amt = h.amount;
                const displayAmt = (unit === "g" && amt >= 1000)
                  ? `${(amt/1000).toFixed(2).replace(/\.?0+$/, "")} kg`
                  : (unit === "mL" && amt >= 1000)
                  ? `${(amt/1000).toFixed(2).replace(/\.?0+$/, "")} L`
                  : `${amt} ${unit}`;
                return (
                  <div key={i} style={styles.consumptionRow}>
                    <span style={styles.consumptionDate}>{formatDate(h.date)}</span>
                    <span style={styles.consumptionAmt}>{displayAmt}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      <label style={styles.fieldLabel}>{t("note_precaution")}</label>
      <textarea style={{ ...styles.input, minHeight: 64, resize: "vertical" }}
        value={note} onChange={(e) => setNote(e.target.value)} />

      <button style={styles.primaryBtn} onClick={handleSave}>
        {t("save_product")}
      </button>
    </ModalShell>
  );
}

// ---------- Réglages ----------
function SettingsView({ pools, activePoolId, onUpdatePool, onDeletePool, onSwitchPool, onWantAddPool, onDeleteAllMeasures: onDeleteAllMeasuresRaw, poolMeasureCount, onGenerateReport, onWantPremiumForReport, onWantPremium, isPremium, setIsPremium, apiKey, setApiKey, apiProvider, setApiProvider, lang, setLang, authUser, onSignOut, onSignIn, onDeleteAccount }) {
  const t = useT(lang);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [pendingLang, setPendingLang] = useState(lang);
  const treatmentTypes = getTreatmentTypes(lang);
  const filtrationTypes = getFiltrationTypes(lang);
  const activePool = pools.find((p) => p.id === activePoolId) || pools[0];
  const [showApiKey, setShowApiKey] = useState(false);

  function onDeleteAllMeasures() {
    if (!poolMeasureCount) return;
    const ok = window.confirm(
      `${t("delete_measures")} "${activePool?.name}" ?`
    );
    if (ok) onDeleteAllMeasuresRaw();
  }

  return (
    <div>
      <div style={styles.sectionRow}>
        <span style={styles.sectionLabel}>{t("language_label")}</span>
      </div>
      <button
        type="button"
        style={styles.langPickerBtn}
        onClick={() => { setPendingLang(lang); setShowLangPicker(true); }}
      >
        <span>{LANGUAGE_OPTIONS.find((o) => o.value === lang)?.label || "Français"}</span>
        <ChevronDown size={16} />
      </button>

      {showLangPicker && (
        <div style={styles.langPickerOverlay} onClick={() => setShowLangPicker(false)}>
          <div style={styles.langPickerSheet} onClick={(e) => e.stopPropagation()}>
            <div style={styles.langPickerTitle}>{t("language_label")}</div>
            <div style={styles.langPickerList}>
              {LANGUAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  style={{
                    ...styles.langPickerItem,
                    background: pendingLang === opt.value ? "#e8f4fd" : "transparent",
                    color: pendingLang === opt.value ? "#0a6ebd" : "#0d2b4e",
                    fontWeight: pendingLang === opt.value ? 700 : 500,
                  }}
                  onClick={() => setPendingLang(opt.value)}
                >
                  <span>{opt.label}</span>
                  {pendingLang === opt.value && (
                    <CheckCircle2 size={18} color="#0a6ebd" />
                  )}
                </button>
              ))}
            </div>
            <button
              style={styles.primaryBtn}
              onClick={() => {
                setLang(pendingLang);
                setShowLangPicker(false);
              }}
            >
              {t("validate_btn")}
            </button>
          </div>
        </div>
      )}

      {/* --- Section Compte --- */}
      <div style={styles.sectionRow}>
        <span style={styles.sectionLabel}>{t("account_section")}</span>
      </div>
      {authUser ? (
        <div style={{ background: "#f0f6fb", borderRadius: 12, padding: "14px", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0d2b4e" }}>{authUser.displayName || authUser.email}</div>
              {authUser.displayName && <div style={{ fontSize: 11.5, color: "#6a7d90", marginTop: 2 }}>{authUser.email}</div>}
            </div>
            <button
              style={{ padding: "8px 14px", borderRadius: 10, border: "1.5px solid #d0e4f5", background: "#fff", color: "#c0392b", fontWeight: 600, fontSize: 12, cursor: "pointer", flexShrink: 0 }}
              onClick={onSignOut}
            >
              {t("sign_out")}
            </button>
          </div>
          <button
            style={{ width: "100%", padding: "9px 0", borderRadius: 10, border: "1.5px solid #f5c6c2", background: "#fdf0ef", color: "#c0392b", fontWeight: 600, fontSize: 12, cursor: "pointer" }}
            onClick={() => {
              if (window.confirm(t("delete_account_confirm"))) {
                onDeleteAccount();
              }
            }}
          >
            🗑 {t("delete_account")}
          </button>
        </div>
      ) : (
        <div style={{ background: "#f0f6fb", borderRadius: 12, padding: "12px 14px", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ fontSize: 13, color: "#6a7d90" }}>{t("not_signed_in")}</div>
          <button
            style={{ padding: "8px 14px", borderRadius: 10, border: "none", background: "#0a6ebd", color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" }}
            onClick={onSignIn}
          >
            {t("sign_in")}
          </button>
        </div>
      )}

      <div style={styles.sectionRow}>
        <span style={styles.sectionLabel}>{t("subscription")}</span>
      </div>

      <div style={styles.testPremiumCard}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Crown size={18} color={isPremium ? "#a8721a" : "#9aa9a5"} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: "#0d2b4e" }}>
              {isPremium ? t("unlimited_active") : t("free_mode")}
            </div>
            <div style={{ fontSize: 11.5, color: "#6a7d90" }}>
              {t("premium_test")}
            </div>
          </div>
        </div>
        <ToggleSwitch
          checked={isPremium}
          onChange={(val) => {
            if (val) {
              onWantPremium();
            } else {
              setIsPremium(false);
              setApiKey("");
            }
          }}
        />
      </div>

      <p style={styles.helpText}>
{t("premium_desc")}
      </p>

      <div style={styles.sectionRow}>
        <span style={styles.sectionLabel}>{t("my_pools")}</span>
        <button style={styles.smallAddBtn} onClick={onWantAddPool}>
          <Plus size={16} />
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
        {pools.map((p) => (
          <div
            key={p.id}
            style={{
              ...styles.poolListRow,
              borderColor: p.id === activePoolId ? "#0a6ebd" : "#e6ebe9",
            }}
          >
            <button style={styles.poolListMain} onClick={() => onSwitchPool(p.id)}>
              {p.photo ? (
                <img src={p.photo} alt="" style={styles.poolSwitcherThumb} />
              ) : (
                <Droplets size={16} color={p.id === activePoolId ? "#0a6ebd" : "#7ab8e8"} />
              )}
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: "#0d2b4e" }}>{p.name}</div>
                <div style={{ fontSize: 11.5, color: "#6a7d90" }}>{p.location} · {p.volume} m³ · {treatmentTypes.find((tt) => tt.value === p.treatmentType)?.label || t("treatment_chlore")}</div>
              </div>
              {p.id === activePoolId && <CheckCircle2 size={16} color="#1a8fd1" />}
            </button>
            {pools.length > 1 && (
              <button style={styles.poolListDeleteBtn} onClick={() => onDeletePool(p.id)}>
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div style={styles.sectionRow}>
        <span style={styles.sectionLabel}>{t("active_pool")}</span>
      </div>

      <label style={styles.fieldLabel}>{t("pool_name")}</label>
      <input
        style={styles.input}
        value={activePool?.name || ""}
        onChange={(e) => onUpdatePool(activePool.id, { name: e.target.value })}
      />

      <label style={styles.fieldLabel}>{t("location")}</label>
      <input
        style={styles.input}
        value={activePool?.location || ""}
        onChange={(e) => onUpdatePool(activePool.id, { location: e.target.value })}
      />

      <label style={styles.fieldLabel}>{t("pool_volume")}</label>
      <input
        type="number"
        style={styles.input}
        value={activePool?.volume || 0}
        onChange={(e) => onUpdatePool(activePool.id, { volume: parseFloat(e.target.value) || 0 })}
      />

      <label style={styles.fieldLabel}>{t("treatment_type")}</label>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {treatmentTypes.map((tt) => (
          <button
            key={tt.value}
            type="button"
            style={{
              ...styles.treatmentOption,
              ...(activePool?.treatmentType === tt.value ? styles.treatmentOptionActive : {}),
            }}
            onClick={() => onUpdatePool(activePool.id, { treatmentType: tt.value })}
          >
            <div style={styles.treatmentOptionTop}>
              <span style={styles.treatmentOptionLabel}>{tt.label}</span>
              {activePool?.treatmentType === tt.value && (
                <CheckCircle2 size={16} color="#0a6ebd" />
              )}
            </div>
            <div style={styles.treatmentOptionDesc}>{tt.description}</div>
            <div style={styles.treatmentOptionParams}>
              {t("treatment_params")} {tt.params.join(", ")}
            </div>
          </button>
        ))}
      </div>

      <label style={{ ...styles.fieldLabel, marginTop: 14 }}>{t("filtration_type")}</label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {filtrationTypes.map((ft) => (
          <button
            key={ft.value}
            type="button"
            onClick={() => onUpdatePool(activePool.id, { filtration: ft.value })}
            style={{
              ...styles.filtrationOption,
              ...(activePool?.filtration === ft.value ? styles.filtrationOptionActive : {}),
            }}
          >
            {ft.label}
          </button>
        ))}
      </div>

      <p style={styles.helpText}>
{t("treatment_desc")}
      </p>

      {isPremium && (
        <div style={{ ...styles.sectionRow, marginTop: 14 }}>
          <div>
            <span style={styles.sectionLabel}>{t("manage_stock_label")}</span>
            <div style={{ fontSize: 12, color: "#6a7d90", marginTop: 2 }}>
              {t("manage_stock_desc")}
            </div>
          </div>
          <ToggleSwitch
            checked={!!activePool?.manageStock}
            onChange={(val) => onUpdatePool(activePool.id, { manageStock: val })}
          />
        </div>
      )}

      <div style={styles.sectionRow}>
        <span style={styles.sectionLabel}>{t("api_section")}</span>
      </div>

      {!isPremium ? (
        <button style={styles.photoLockedBtn} onClick={onWantPremium}>
          <Lock size={16} />
          <span>{t("ai_locked_settings")}</span>
        </button>
      ) : (
        <>
          <label style={styles.fieldLabel}>{t("provider_label")}</label>
          <div style={styles.segmentedControl}>
            {[
              { value: "anthropic", label: "Anthropic (Claude)" },
              { value: "openai", label: "OpenAI (ChatGPT)" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setApiProvider(opt.value)}
                style={{
                  ...styles.segmentedBtn,
                  ...(apiProvider === opt.value ? styles.segmentedBtnActive : {}),
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <label style={styles.fieldLabel}>
            {apiProvider === "openai" ? t("api_key_openai") : t("api_key_label")}
          </label>
          <div style={styles.apiKeyRow}>
            <input
              type={showApiKey ? "text" : "password"}
              style={{ ...styles.input, flex: 1 }}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={t("api_key_placeholder")}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <button
              type="button"
              onClick={() => setShowApiKey((v) => !v)}
              style={styles.eyeBtn}
              title={showApiKey ? t("hide") : t("show")}
            >
              {showApiKey
                ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              }
            </button>
          </div>
          <p style={styles.helpTextSmall}>
{t("api_key_desc")}
          </p>
        </>
      )}

      <div style={styles.sectionRow}>
        <span style={styles.sectionLabel}>{t("sensitive_zone")}</span>
      </div>
      <button style={styles.dangerLinkBtn} onClick={onDeleteAllMeasures}>
        <Trash2 size={14} /> {t("delete_measures")}
      </button>

      <div style={styles.versionTag}>PoolApp v{APP_VERSION}</div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 44,
        height: 26,
        borderRadius: 99,
        border: "none",
        background: checked ? "#0a6ebd" : "#d8e2df",
        position: "relative",
        cursor: "pointer",
        flexShrink: 0,
        transition: "background .15s",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: checked ? 21 : 3,
          width: 20,
          height: 20,
          borderRadius: 99,
          background: "#ffffff",
          transition: "left .15s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      />
    </button>
  );
}

// ---------- Paywall ----------
function PaywallModal({ onClose, onActivate, lang }) {
  const t = useT(lang || "fr");
  const perks = [
    t("paywall_perk1"),
    t("paywall_perk2"),
    t("paywall_perk3"),
    t("paywall_perk4"),
    t("paywall_perk5"),
    t("paywall_perk6"),
    t("paywall_perk7"),
  ];
  return (
    <ModalShell onClose={onClose} title={t("paywall_title")}>
      <div style={styles.paywallHero}>
        <Crown size={30} color="#a8721a" />
        <div style={styles.paywallPrice}>2,99 € / mois</div>
        <div style={styles.paywallPriceSub}>ou 19,99 € / an</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, margin: "16px 2px" }}>
        {perks.map((perk, i) => (
          <div key={i} style={styles.paywallPerk}>
            <CheckCircle2 size={16} color="#1a8fd1" />
            <span>{perk}</span>
          </div>
        ))}
      </div>
      <button style={styles.primaryBtn} onClick={onActivate}>
        {t("paywall_btn")}
      </button>
      <p style={{ ...styles.helpText, textAlign: "center" }}>
        {t("paywall_test_note")}
      </p>
    </ModalShell>
  );
}

// ---------- Ajout d'un bassin ----------
function AddPoolModal({ onClose, onSave, lang }) {
  const t = useT(lang || "fr");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [volume, setVolume] = useState(50);
  const [photo, setPhoto] = useState(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoBusy(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      setPhoto(dataUrl);
    } catch (err) {
      // silencieux
    } finally {
      setPhotoBusy(false);
    }
  }

  function handleSave() {
    if (!name.trim()) return;
    onSave({ name: name.trim(), location: location.trim(), volume: parseFloat(volume) || 0, photo });
  }

  return (
    <ModalShell onClose={onClose} title={t("add_pool_title")}>
      <label style={styles.fieldLabel}>{t("pool_photo")}</label>
      <div>
        {photo ? (
          <div style={styles.photoPreviewWrap}>
            <img src={photo} alt="" style={styles.photoPreview} />
            <button style={styles.photoRemoveBtn} onClick={() => setPhoto(null)}>
              <X size={14} /> {t("remove")}
            </button>
          </div>
        ) : (
          <div style={styles.photoCaptureBtnRow}>
            <button
              type="button"
              style={styles.photoCaptureBtnHalf}
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera size={17} />
              {photoBusy ? "..." : t("camera_btn")}
            </button>
            <button
              type="button"
              style={styles.photoCaptureBtnHalf}
              onClick={() => galleryInputRef.current?.click()}
            >
              <ImageOff size={17} />
              {photoBusy ? "..." : t("gallery_btn")}
            </button>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} style={styles.hiddenFileInput} />
        <input ref={galleryInputRef} type="file" accept="image/*" onChange={handlePhotoChange} style={styles.hiddenFileInput} />
      </div>

      <label style={styles.fieldLabel}>{t("pool_name")}</label>
      <input
        style={styles.input}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("pool_name_placeholder")}
      />

      <label style={styles.fieldLabel}>{t("location")}</label>
      <input
        style={styles.input}
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder={t("pool_location_placeholder")}
      />

      <label style={styles.fieldLabel}>{t("volume")}</label>
      <input
        type="number"
        style={styles.input}
        value={volume}
        onChange={(e) => setVolume(e.target.value)}
      />

      <button style={styles.primaryBtn} onClick={handleSave}>
        {t("create_pool")}
      </button>
    </ModalShell>
  );
}

// ---------- Rapport ----------
function ReportView({ pool, measures, applications, products, onClose, manageStock, lang }) {
  const t = useT(lang);
  const [showValues, setShowValues] = useState(false);

  const sortedMeasures = useMemo(
    () => [...measures].sort((a, b) => new Date(a.date) - new Date(b.date)),
    [measures]
  );

  const chartData = useMemo(
    () =>
      sortedMeasures.map((m) => ({
        date: formatDateShort(m.date),
        timestamp: new Date(m.date).getTime(),
        pH: m.pH !== undefined && m.pH !== "" ? parseFloat(m.pH) : null,
        fCl: m.fCl !== undefined && m.fCl !== "" ? parseFloat(m.fCl) : null,
        tCl: m.tCl !== undefined && m.tCl !== "" ? parseFloat(m.tCl) : null,
        tac: m.tac !== undefined && m.tac !== "" ? parseFloat(m.tac) : null,
        cya: m.cya !== undefined && m.cya !== "" ? parseFloat(m.cya) : null,
        temp: m.temp !== undefined && m.temp !== "" ? parseFloat(m.temp) : null,
      })),
    [sortedMeasures]
  );

  const chartParams = [
    { key: "pH", color: "#1a8fd1", label: "pH", axis: "left" },
    { key: "fCl", color: "#2b7fd9", label: t("param_fcl").replace(" (mg/L)", ""), axis: "left" },
    { key: "tCl", color: "#8a6fd1", label: t("param_tcl").replace(" (mg/L)", ""), axis: "left" },
    { key: "tac", color: "#d98c2b", label: t("tac_col"), axis: "right" },
    { key: "cya", color: "#c4502f", label: t("cya_col"), axis: "right" },
    { key: "temp", color: "#e0578a", label: t("temp_col"), axis: "right" },
  ];

  // Pour chaque mesure : recalcule le plan de traitement qui avait été
  // donné (avec les produits actuels) et retrouve l'application validée
  // correspondante si elle existe.
  const rows = useMemo(() => {
    const repTargets = getEffectiveTargets(pool?.treatmentType || "chlore");
    const repParams = getActiveParams(pool?.treatmentType || "chlore");
    return sortedMeasures.map((m) => {
      const recs = computeRecommendations(m, pool?.volume || 0, products, repTargets, repParams, t);
      const application = applications.find((a) => a.measureId === m.id) || null;
      return { measure: m, recs, application };
    });
  }, [sortedMeasures, pool, products, applications]);

  const localeMap = { fr: "fr-FR", en: "en-GB", de: "de-DE", it: "it-IT", es: "es-ES", pt: "pt-PT" };
  const generatedAt = new Date().toLocaleString(localeMap[lang] || "fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <div style={styles.reportOverlay} className="report-print-root">
      <div style={styles.reportToolbar} className="no-print">
        <button style={styles.reportCloseBtn} onClick={onClose}>
          <X size={18} /> {t("close")}
        </button>
        <label style={styles.reportToolbarCheckbox}>
          <input
            type="checkbox"
            checked={showValues}
            onChange={(e) => setShowValues(e.target.checked)}
          />
          <span>{t("show_values")}</span>
        </label>
        <button style={styles.reportPrintBtn} onClick={() => window.print()}>
          <Download size={16} /> {t("report_print_btn")}
        </button>
      </div>

      <div style={styles.reportPage} id="report-printable">
        <div style={styles.reportHeader}>
          <div style={styles.reportHeaderIcon}>
            <Droplets size={20} color="#e8f4fd" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={styles.reportTitle}>{t("report_title")} — {pool?.name}</div>
            <div style={styles.reportSubtitle}>
              {pool?.location} · {pool?.volume} m³ · {t("generated_on")} {generatedAt}
            </div>
          </div>
          {pool?.photo && (
            <img
              src={pool.photo}
              alt={pool?.name}
              style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover", border: "1.5px solid #d0e4f5", flexShrink: 0 }}
            />
          )}
        </div>

        <div style={styles.reportSectionTitle}>{t("params_evolution")}</div>
        {chartData.length > 0 ? (() => {
          const timestamps = chartData.map((d) => d.timestamp);
          const spanMs = timestamps.length > 1 ? Math.max(...timestamps) - Math.min(...timestamps) : 0;
          const showTime = spanMs < 86400000 * 2;
          return (
          <React.Fragment>
          <div style={styles.reportChartWrap}>
            <ResponsiveContainer width="100%" height={showValues ? 380 : 340}>
            <LineChart
              data={chartData}
              margin={{ top: showValues ? 24 : 8, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e6ebe9" />
              <XAxis
                dataKey="timestamp"
                type="number"
                domain={["dataMin", "dataMax"]}
                scale="time"
                tickFormatter={(ts) => {
                  const d = new Date(ts);
                  if (showTime) return `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;
                  return `${d.getDate().toString().padStart(2,"0")}/${(d.getMonth()+1).toString().padStart(2,"0")}`;
                }}
                tick={{ fontSize: 12, fill: "#2d4a6e" }}
              />
              <YAxis yAxisId="left" tick={{ fontSize: 12, fill: "#2d4a6e" }} width={30} />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12, fill: "#2d4a6e" }}
                width={30}
              />
              {chartParams.map((cp) => (
                <Line
                  key={cp.key}
                  yAxisId={cp.axis}
                  type="monotone"
                  dataKey={cp.key}
                  name={cp.label}
                  stroke={cp.color}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  connectNulls
                  label={
                    showValues
                      ? { fontSize: 11, fill: cp.color, position: "top", offset: 6 }
                      : false
                  }
                />
              ))}
            </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 16px", marginTop: 8, padding: "0 8px" }}>
            {chartParams.map((cp) => (
              <div key={cp.key} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#2d4a6e" }}>
                <svg width="16" height="4"><line x1="0" y1="2" x2="16" y2="2" stroke={cp.color} strokeWidth="2"/><circle cx="8" cy="2" r="2" fill={cp.color}/></svg>
                {cp.label}
              </div>
            ))}
          </div>
          </React.Fragment>
          );
        })() : (
          <p style={styles.helpTextSmall}>{t("no_measures_report")}</p>
        )}

        <div style={styles.reportSectionTitle}>{t("detailed_history")}</div>
        {rows.length === 0 ? (
          <p style={styles.helpTextSmall}>{t("no_measures_report")}</p>
        ) : (
          <table style={{ ...styles.reportTable, fontSize: 11 }}>
            <thead>
              <tr>
                <th style={styles.reportThCell}>{t("date_col")}</th>
                <th style={styles.reportThCell}>pH</th>
                <th style={styles.reportThCell}>{t("cl_libre_col")}</th>
                <th style={styles.reportThCell}>{t("cl_total_col")}</th>
                <th style={styles.reportThCell}>{t("tac_col")}</th>
                <th style={styles.reportThCell}>{t("cya_col")}</th>
                <th style={styles.reportThCell}>{t("temp_col")}</th>
                <th style={styles.reportThCell}>{t("product_col")}</th>
                <th style={styles.reportThCell}>{t("quantity_col")}</th>
                {manageStock && <th style={styles.reportThCell}>{t("stock_col")}</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ measure, application }, i) => {
                const applied = application?.steps?.filter((s) => s.appliedAmount) || [];
                const rowCount = Math.max(1, applied.length);
                return Array.from({ length: rowCount }).map((_, j) => {
                  const step = applied[j] || null;
                  const prod = step ? products.find((p) => p.name === step.productName) : null;
                  return (
                    <tr key={`${i}-${j}`} style={{ background: i % 2 === 0 ? "#f8fafd" : "#ffffff" }}>
                      {j === 0 && (
                        <>
                          <td style={{ ...styles.reportTdCell, fontWeight: 600, color: "#0d2b4e" }} rowSpan={rowCount}>{formatDate(measure.date)}</td>
                          <td style={styles.reportTdCell} rowSpan={rowCount}>{measure.pH ?? "—"}</td>
                          <td style={styles.reportTdCell} rowSpan={rowCount}>{measure.fCl != null && measure.fCl !== "" ? `${measure.fCl} mg/L` : "—"}</td>
                          <td style={styles.reportTdCell} rowSpan={rowCount}>{measure.tCl != null && measure.tCl !== "" ? `${measure.tCl} mg/L` : "—"}</td>
                          <td style={styles.reportTdCell} rowSpan={rowCount}>{measure.tac != null && measure.tac !== "" ? `${measure.tac} mg/L` : "—"}</td>
                          <td style={styles.reportTdCell} rowSpan={rowCount}>{measure.cya != null && measure.cya !== "" ? `${measure.cya} mg/L` : "—"}</td>
                          <td style={styles.reportTdCell} rowSpan={rowCount}>{measure.temp != null && measure.temp !== "" ? `${measure.temp} °C` : "—"}</td>
                        </>
                      )}
                      <td style={styles.reportTdCell}>{step ? step.productName : "—"}</td>
                      <td style={{ ...styles.reportTdCell, fontWeight: 700, color: "#0a6ebd" }}>
                        {step ? formatDose(step.appliedAmount, step.doseUnit || "g") : "—"}
                      </td>
                      {manageStock && <td style={{ ...styles.reportTdCell, color: prod && (prod.stockPercent ?? 100) <= 20 ? "#c0392b" : "#4a6480", fontWeight: 600 }}>
                        {prod ? `${prod.stockPercent ?? 100} %` : "—"}
                      </td>}
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        )}

        {/* Section photos des mesures */}
        {rows.some(({ measure }) => (measure.photos?.length || measure.photo || measure.poolPhotos?.length)) && (
          <div style={{ marginTop: 24 }}>
            <div style={styles.reportSectionTitle}>{t("photos_section")}</div>
            {rows.map(({ measure }, i) => {
              const analysisPhotos = measure.photos?.length ? measure.photos : (measure.photo ? [measure.photo] : []);
              const poolPhotos = measure.poolPhotos || [];
              const allPhotos = [...analysisPhotos, ...poolPhotos];
              if (!allPhotos.length) return null;
              return (
                <div key={i} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#4a6480", marginBottom: 6 }}>
                    {formatDate(measure.date)}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {allPhotos.map((src, j) => (
                      <img key={j} src={src} alt="" style={{ height: 120, borderRadius: 8, objectFit: "cover", border: "1px solid #d0e4f5" }} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Modal shell ----------
function ModalShell({ children, onClose, title, rightAction }) {
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalSheet} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <span style={styles.modalTitle}>{title}</span>
          <div style={{ display: "flex", gap: 8 }}>
            {rightAction}
            <button style={styles.modalCloseBtn} onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>
        <div style={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
}

// ---------- Format dates ----------
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function formatDateShort(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}

// ---------- Styles ----------
const styles = {
  reportOverlay: {
    position: "fixed",
    inset: 0,
    background: "#ffffff",
    zIndex: 200,
    overflowY: "auto",
  },
  reportToolbar: {
    position: "sticky",
    top: 0,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    background: "#064a8a",
    zIndex: 5,
  },
  reportCloseBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "transparent",
    border: "none",
    color: "#e8f4fd",
    fontSize: 13.5,
    fontWeight: 600,
    cursor: "pointer",
  },
  reportPrintBtn: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    background: "#1a8fd1",
    border: "none",
    borderRadius: 10,
    color: "#ffffff",
    fontSize: 13,
    fontWeight: 700,
    padding: "9px 14px",
    cursor: "pointer",
  },
  reportToolbarCheckbox: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "#e8f4fd",
    fontSize: 12.5,
    fontWeight: 500,
  },
  reportPage: {
    maxWidth: 820,
    margin: "0 auto",
    padding: "24px 20px 60px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#0d2b4e",
  },
  reportHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    paddingBottom: 16,
    marginBottom: 18,
    borderBottom: "2px solid #0a6ebd",
  },
  reportHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    background: "#0a6ebd",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  reportTitle: { fontSize: 18, fontWeight: 800, color: "#0d2b4e" },
  reportSubtitle: { fontSize: 12.5, color: "#6a7d90", marginTop: 2 },
  reportSectionTitle: {
    fontSize: 14,
    fontWeight: 800,
    color: "#0a6ebd",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginTop: 26,
    marginBottom: 12,
  },
  reportChartWrap: {
    background: "#fafcfb",
    borderRadius: 12,
    padding: 8,
  },
  reportRow: { marginBottom: 18 },
  reportRowDate: { fontSize: 14, fontWeight: 700, color: "#0d2b4e", marginBottom: 8 },
  reportTable: { width: "100%", borderCollapse: "collapse", marginBottom: 10 },
  reportThCell: {
    padding: "6px 8px",
    textAlign: "left",
    fontSize: 10,
    fontWeight: 700,
    color: "#6a7d90",
    textTransform: "uppercase",
    borderBottom: "2px solid #d0e4f5",
    whiteSpace: "nowrap",
  },
  reportTdCell: {
    padding: "6px 8px",
    fontSize: 11,
    color: "#2d4a6e",
    borderBottom: "1px solid #e8f0f8",
    verticalAlign: "top",
  },
  reportTableCell: {
    border: "1px solid #d0e4f5",
    padding: "7px 10px",
    textAlign: "left",
    verticalAlign: "top",
  },
  reportTableCellLabel: { fontSize: 10.5, color: "#6a7d90", textTransform: "uppercase" },
  reportTableCellValue: { fontSize: 13, fontWeight: 700, color: "#0d2b4e", marginTop: 1 },
  reportSubLabel: {
    fontSize: 11.5,
    fontWeight: 700,
    color: "#6a7d90",
    textTransform: "uppercase",
    marginBottom: 5,
  },
  reportConseilText: { fontSize: 12.5, color: "#6a7d90", fontStyle: "italic" },
  reportConseilList: { margin: 0, paddingLeft: 18 },
  reportConseilItem: { fontSize: 12.5, color: "#2d4a6e", lineHeight: 1.6 },
  reportAppliedTag: { color: "#1a8fd1", fontWeight: 600 },
  reportNotAppliedTag: { color: "#a8721a", fontStyle: "italic" },
  reportDivider: { height: 1, background: "#d0e4f5", marginTop: 16 },
  app: {
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    background: "#f0f6fb",
    maxWidth: 480,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    color: "#0d2b4e",
    height: "100dvh",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "20px 18px 16px",
    background: "linear-gradient(135deg, #0a6ebd, #064a8a)",
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: "rgba(255,255,255,0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleBtn: {
    flex: 1,
    background: "transparent",
    border: "none",
    padding: 0,
    textAlign: "left",
    cursor: "pointer",
    position: "relative",
  },
  headerTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  headerTitle: { color: "#ffffff", fontSize: 17, fontWeight: 700, letterSpacing: -0.2 },
  headerSub: { color: "#a8d4f0", fontSize: 12.5, marginTop: 1 },
  premiumBadge: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    background: "#f5d999",
    color: "#3a2a0a",
    fontSize: 11,
    fontWeight: 800,
    padding: "5px 9px",
    borderRadius: 99,
  },
  poolSwitcherOverlay: {
    position: "fixed",
    inset: 0,
    background: "transparent",
    zIndex: 60,
  },
  poolSwitcherDropdown: {
    position: "fixed",
    top: 78,
    left: 18,
    width: 280,
    maxWidth: "calc(100vw - 36px)",
    background: "#ffffff",
    borderRadius: 14,
    padding: "10px 10px 12px",
    boxShadow: "0 12px 30px rgba(15,30,28,0.28)",
    zIndex: 61,
  },
  poolSwitcherTitle: {
    fontSize: 11.5,
    fontWeight: 800,
    color: "#6a7d90",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    padding: "6px 10px 8px",
  },
  poolSwitcherItem: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 10px",
    borderRadius: 11,
    border: "none",
    cursor: "pointer",
  },
  poolSwitcherThumb: {
    width: 32,
    height: 32,
    borderRadius: 8,
    objectFit: "cover",
    flexShrink: 0,
  },
  poolSwitcherAddBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 6,
    padding: "10px 0",
    borderRadius: 11,
    border: "1.5px dashed #90c4e8",
    background: "transparent",
    color: "#0a6ebd",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
  },
  poolNameTag: {
    display: "inline-block",
    fontSize: 11.5,
    fontWeight: 700,
    color: "#0a6ebd",
    background: "#e9f6f1",
    padding: "4px 10px",
    borderRadius: 99,
    marginBottom: 12,
  },
  poolListRow: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    background: "#ffffff",
    border: "1.5px solid",
    borderRadius: 12,
    paddingRight: 6,
  },
  poolListMain: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "11px 12px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
  },
  poolListDeleteBtn: {
    width: 30,
    height: 30,
    borderRadius: 9,
    border: "none",
    background: "#fde8e1",
    color: "#c4502f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
  },
  main: { flex: 1, padding: "16px 16px 24px", overflowY: "auto", WebkitOverflowScrolling: "touch" },
  sectionRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    margin: "4px 2px 10px",
  },
  sectionLabel: { fontSize: 13, fontWeight: 700, color: "#2d4a6e", textTransform: "uppercase", letterSpacing: 0.4 },
  sectionDate: { fontSize: 12.5, color: "#6a7d90" },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginBottom: 14,
  },
  paramCard: {
    background: "#ffffff",
    borderRadius: 14,
    padding: "12px 14px",
    border: "1px solid",
    boxShadow: "0 1px 2px rgba(15,94,86,0.04)",
  },
  paramTop: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  paramLabel: { fontSize: 12, color: "#5d6e6a", fontWeight: 600 },
  paramDot: { width: 8, height: 8, borderRadius: 99 },
  paramValue: { fontSize: 24, fontWeight: 800, marginTop: 4, color: "#0d2b4e" },
  paramUnit: { fontSize: 12, fontWeight: 600, color: "#6a7d90", marginLeft: 3 },
  paramStatus: { fontSize: 12, fontWeight: 700, marginTop: 2 },
  paramRange: { fontSize: 11, color: "#9aa9a5", marginTop: 2 },
  addMeasureBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "11px 0",
    borderRadius: 12,
    border: "1.5px dashed #90c4e8",
    background: "transparent",
    color: "#0a6ebd",
    fontWeight: 700,
    fontSize: 13.5,
    marginBottom: 22,
    cursor: "pointer",
  },
  addMeasureBtnLocked: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    padding: "11px 0",
    borderRadius: 12,
    border: "1.5px solid #f0d9a8",
    background: "#fdf6e6",
    color: "#a8721a",
    fontWeight: 700,
    fontSize: 13.5,
    marginBottom: 22,
    cursor: "pointer",
  },
  measurePhotoWrap: { marginBottom: 12 },
  measurePhoto: {
    width: "100%",
    maxHeight: 180,
    objectFit: "cover",
    borderRadius: 14,
    border: "1px solid #e6ebe9",
  },
  measureThumb: {
    width: 32,
    height: 32,
    objectFit: "cover",
    borderRadius: 8,
    flexShrink: 0,
  },
  measurePhotoFull: {
    width: "100%",
    maxHeight: 220,
    objectFit: "cover",
    borderRadius: 10,
    marginBottom: 10,
  },
  recoHeader: { margin: "4px 2px 10px" },
  allGoodCard: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#e9f6f1",
    border: "1px solid #c9e8dc",
    borderRadius: 14,
    padding: "14px 14px",
  },
  validateApplyBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    padding: "13px 0",
    marginTop: 4,
    borderRadius: 12,
    border: "1.5px solid #0a6ebd",
    background: "#ffffff",
    color: "#0a6ebd",
    fontWeight: 700,
    fontSize: 13.5,
    cursor: "pointer",
  },
  validateApplyBtnSmall: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    width: "100%",
    padding: "9px 0",
    borderRadius: 10,
    border: "1.5px solid #0a6ebd",
    background: "#ffffff",
    color: "#0a6ebd",
    fontWeight: 600,
    fontSize: 12.5,
    cursor: "pointer",
  },
  applyConfirmedCard: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    background: "#e9f6f1",
    border: "1px solid #c9e8dc",
    borderRadius: 12,
    padding: "11px 14px",
    fontSize: 12.5,
    color: "#0a6ebd",
    fontWeight: 600,
    marginTop: 4,
  },
  recoCard: {
    background: "#fff7f2",
    border: "1px solid #f3d9c8",
    borderRadius: 14,
    padding: "13px 14px",
  },
  recoTop: { display: "flex", alignItems: "center", gap: 8, marginBottom: 4 },
  recoStepBadge: {
    width: 20,
    height: 20,
    borderRadius: 99,
    background: "#c4502f",
    color: "#ffffff",
    fontSize: 11,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  recoParam: { fontSize: 13.5, fontWeight: 700, color: "#8a3a1f" },
  recoTiming: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontSize: 11.5,
    fontWeight: 700,
    color: "#a8721a",
    background: "#fdf6e6",
    border: "1px solid #f0d9a8",
    borderRadius: 8,
    padding: "5px 8px",
    marginBottom: 7,
  },
  recoProductRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  recoProductThumb: {
    width: 36,
    height: 36,
    borderRadius: 8,
    objectFit: "cover",
    flexShrink: 0,
    border: "1px solid #d0e4f5",
  },
  recoProduct: {
    fontSize: 13,
    fontWeight: 600,
    color: "#0d2b4e",
    marginBottom: 2,
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  recoMissingTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: 3,
    fontSize: 10.5,
    fontWeight: 700,
    color: "#c4502f",
    background: "#fde8e1",
    padding: "2px 7px",
    borderRadius: 99,
  },
  recoDose: { fontSize: 13, color: "#2d4a6e" },
  recoWait: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontSize: 12,
    fontWeight: 600,
    color: "#0a6ebd",
    marginTop: 7,
  },
  recoNote: { fontSize: 11.5, color: "#6a7d90", marginTop: 6, lineHeight: 1.4 },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "60px 24px",
    gap: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: 700, marginTop: 6 },
  emptyText: { fontSize: 13.5, color: "#6a7d90", lineHeight: 1.5, maxWidth: 280 },
  dangerLinkBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    width: "100%",
    marginTop: 18,
    padding: "11px 0",
    background: "transparent",
    border: "none",
    color: "#c4502f",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  langPickerBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1.5px solid #d0e4f5",
    background: "#f0f6fb",
    color: "#0d2b4e",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    boxSizing: "border-box",
  },
  langPickerOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(10,30,60,0.45)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    zIndex: 200,
  },
  langPickerSheet: {
    background: "#ffffff",
    borderRadius: "20px 20px 0 0",
    padding: "20px 18px 32px",
    width: "100%",
    maxWidth: 480,
    boxShadow: "0 -4px 24px rgba(10,30,60,0.12)",
  },
  langPickerTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#0d2b4e",
    marginBottom: 14,
    textAlign: "center",
  },
  langPickerList: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    marginBottom: 16,
  },
  langPickerItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: "13px 14px",
    borderRadius: 10,
    border: "none",
    fontSize: 15,
    cursor: "pointer",
    textAlign: "left",
    transition: "background 0.1s",
  },
  versionTag: {
    textAlign: "center",
    fontSize: 11,
    color: "#9aa9a5",
    marginTop: 24,
    marginBottom: 4,
  },
  primaryBtn: {
    marginTop: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    width: "100%",
    padding: "13px 0",
    borderRadius: 13,
    border: "none",
    background: "#0a6ebd",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: 14.5,
    cursor: "pointer",
  },
  chipsRow: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  chip: {
    padding: "6px 11px",
    borderRadius: 99,
    border: "1px solid",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  chipAll: {
    fontWeight: 800,
  },
  chipAxisTag: {
    fontSize: 9,
    fontWeight: 800,
    opacity: 0.6,
    marginLeft: 4,
  },
  axisLegend: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    fontSize: 10.5,
    color: "#9aa9a5",
    margin: "0 2px 10px",
  },
  axisLegendItem: { display: "inline-flex", gap: 3 },
  chartCard: {
    background: "#ffffff",
    borderRadius: 14,
    padding: "10px 6px 4px",
    border: "1px solid #e6ebe9",
    marginBottom: 20,
  },
  smallAddBtn: {
    width: 28,
    height: 28,
    borderRadius: 99,
    border: "none",
    background: "#0a6ebd",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  measureRow: {
    background: "#ffffff",
    borderRadius: 12,
    border: "1px solid #e6ebe9",
    overflow: "hidden",
  },
  measureRowHeader: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 14px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
  },
  measureDate: { fontSize: 13.5, fontWeight: 600, color: "#0d2b4e" },
  measureDetails: { padding: "0 14px 14px" },
  measureChips: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 },
  measureChip: {
    fontSize: 11.5,
    fontWeight: 600,
    padding: "4px 9px",
    borderRadius: 99,
    border: "1px solid",
    background: "#fafcfb",
  },
  measureNote: { fontSize: 12, color: "#6a7d90", marginBottom: 8, fontStyle: "italic" },
  deleteBtn: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontSize: 12,
    color: "#c4502f",
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
  },
  editBtn: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontSize: 12,
    color: "#0a6ebd",
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
  },
  editLinkBtn: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: 12,
    fontWeight: 600,
    color: "#0a6ebd",
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
  },
  helpText: { fontSize: 12, color: "#6a7d90", lineHeight: 1.5, margin: "4px 2px 14px" },
  productRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#ffffff",
    border: "1px solid #e6ebe9",
    borderRadius: 12,
    padding: "12px 14px",
    cursor: "pointer",
    textAlign: "left",
  },
  productName: { fontSize: 14, fontWeight: 700, color: "#0d2b4e" },
  productMeta: { fontSize: 11.5, color: "#6a7d90", marginTop: 2 },
  productThumb: {
    width: 40,
    height: 40,
    objectFit: "cover",
    borderRadius: 9,
    flexShrink: 0,
  },
  productThumbPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 9,
    background: "#eef5f3",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  tabBar: {
    display: "flex",
    background: "#ffffff",
    borderTop: "1px solid #e6ebe9",
    width: "100%",
    alignItems: "center",
    zIndex: 10,
    boxShadow: "0 -1px 8px rgba(10,110,189,0.06)",
    flexShrink: 0,
  },
  tabVersion: {
    textAlign: "center",
    fontSize: 9.5,
    color: "#b0bec8",
    padding: "3px 0 1px",
    background: "#f0f6fb",
    letterSpacing: 0.3,
    maxWidth: 480,
    margin: "0 auto",
    width: "100%",
  },
  tabBtn: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "9px 0 10px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(10,30,28,0.45)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    zIndex: 300,
  },
  modalSheet: {
    background: "#ffffff",
    width: "100%",
    maxWidth: 480,
    maxHeight: "88vh",
    borderRadius: "20px 20px 0 0",
    overflowY: "auto",
    paddingBottom: 24,
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 18px 8px",
    position: "sticky",
    top: 0,
    background: "#ffffff",
  },
  modalTitle: { fontSize: 16, fontWeight: 800, color: "#0d2b4e" },
  modalCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 99,
    border: "none",
    background: "#f1f4f3",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#2d4a6e",
  },
  modalDeleteBtn: {
    width: 30,
    height: 30,
    borderRadius: 99,
    border: "none",
    background: "#fde8e1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#c4502f",
  },
  modalBody: { padding: "8px 18px 0" },
  fieldLabel: {
    display: "block",
    fontSize: 12,
    fontWeight: 700,
    color: "#5d6e6a",
    margin: "12px 2px 5px",
  },
  fieldGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  applyStepCard: {
    background: "#f5f9f8",
    borderRadius: 12,
    padding: "12px 14px",
    border: "1px solid #e6ebe9",
  },
  applyStepTitle: { fontSize: 13.5, fontWeight: 700, color: "#0d2b4e", marginBottom: 2 },
  applyStepProduct: { fontSize: 12.5, color: "#6a7d90", marginBottom: 8 },
  unitTag: {
    display: "flex",
    alignItems: "center",
    height: 42,
    padding: "0 12px",
    background: "#edf4fb",
    borderRadius: 10,
    fontSize: 13.5,
    color: "#2d4a6e",
    fontWeight: 600,
    boxSizing: "border-box",
  },
  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    marginTop: 16,
    fontSize: 13.5,
    color: "#0d2b4e",
    fontWeight: 500,
  },
  helpTextSmall: { fontSize: 12.5, color: "#6a7d90", lineHeight: 1.5 },
  segmentedControl: {
    display: "flex",
    background: "#edf4fb",
    borderRadius: 12,
    padding: 3,
    gap: 3,
    marginBottom: 4,
  },
  segmentedBtn: {
    flex: 1,
    padding: "9px 6px",
    border: "none",
    borderRadius: 10,
    background: "transparent",
    color: "#4a6480",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all .15s",
  },
  segmentedBtnActive: {
    background: "#ffffff",
    color: "#0a6ebd",
    boxShadow: "0 1px 4px rgba(10,30,28,.14)",
  },
  apiKeyRow: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  eyeBtn: {
    flexShrink: 0,
    width: 36,
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    border: "1px solid #d0e4f5",
    background: "#f0f6fb",
    color: "#4a6480",
    cursor: "pointer",
  },
  aiSection: {
    marginTop: 22,
    padding: "14px 16px",
    background: "#f8f4fc",
    borderRadius: 14,
    border: "1px solid #e2d9f3",
  },
  aiSectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    fontWeight: 800,
    color: "#7a3fa0",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  aiAnalyzeBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    width: "100%",
    padding: "11px 0",
    borderRadius: 11,
    border: "none",
    background: "#7a3fa0",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: 13.5,
    cursor: "pointer",
  },
  aiAnalyzeBtnLoading: {
    background: "#a47cc4",
    cursor: "not-allowed",
  },
  aiCommentBox: {
    marginTop: 12,
    padding: "12px 14px",
    background: "#ffffff",
    borderRadius: 10,
    border: "1px solid #e2d9f3",
    fontSize: 13.5,
    color: "#0d2b4e",
    lineHeight: 1.65,
    whiteSpace: "pre-wrap",
  },
  aiErrorBox: {
    marginTop: 10,
    padding: "10px 12px",
    background: "#fff5f3",
    borderRadius: 10,
    border: "1px solid #f0c0b8",
    fontSize: 12.5,
    color: "#c4502f",
  },
  aiKeyMissing: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 0",
    fontSize: 12.5,
    color: "#a0a8b0",
  },
  analyzeBtn: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    padding: "7px 12px",
    borderRadius: 9,
    border: "none",
    background: "#7a3fa0",
    color: "#ffffff",
    fontWeight: 600,
    fontSize: 12.5,
    cursor: "pointer",
  },
  analyzeBtnDisabled: {
    background: "#c8c0d4",
    cursor: "not-allowed",
  },
  treatmentOption: {
    width: "100%",
    textAlign: "left",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1.5px solid #d0e4f5",
    background: "#ffffff",
    cursor: "pointer",
  },
  treatmentOptionActive: {
    border: "1.5px solid #0a6ebd",
    background: "#eaf5fd",
  },
  treatmentOptionTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3,
  },
  treatmentOptionLabel: {
    fontSize: 14,
    fontWeight: 700,
    color: "#0d2b4e",
  },
  treatmentOptionDesc: {
    fontSize: 12,
    color: "#6a7d90",
    lineHeight: 1.4,
  },
  treatmentOptionParams: {
    fontSize: 11,
    color: "#a0b0ac",
    marginTop: 4,
    fontStyle: "italic",
  },
  filtrationOption: {
    padding: "11px 8px",
    borderRadius: 10,
    border: "1.5px solid #d0e4f5",
    background: "#ffffff",
    color: "#4a6480",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    textAlign: "center",
  },
  filtrationOptionActive: {
    border: "1.5px solid #0a6ebd",
    background: "#eaf5fd",
    color: "#0a6ebd",
  },
  stripHint: {
    fontSize: 12.5,
    color: "#6a7d90",
    lineHeight: 1.5,
    padding: "8px 12px",
    background: "#f0f6fb",
    borderRadius: 9,
    border: "1px solid #e6ebe9",
    marginBottom: 4,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    borderRadius: 11,
    border: "1.5px solid #d0e4f5",
    fontSize: 14,
    fontFamily: "inherit",
    background: "#fafcfb",
    color: "#0d2b4e",
    outline: "none",
  },
  photoCaptureBtnRow: {
    display: "flex",
    gap: 8,
  },
  photoCaptureBtnHalf: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flex: 1,
    padding: "13px 0",
    borderRadius: 12,
    border: "1.5px dashed #90c4e8",
    background: "#f0f6fb",
    color: "#0a6ebd",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    boxSizing: "border-box",
  },
  photoCaptureBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    padding: "13px 0",
    borderRadius: 12,
    border: "1.5px dashed #90c4e8",
    background: "#f5f9f8",
    color: "#0a6ebd",
    fontWeight: 600,
    fontSize: 13.5,
    cursor: "pointer",
    boxSizing: "border-box",
  },
  hiddenFileInput: {
    position: "absolute",
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    border: 0,
  },
  aiLockedBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    padding: "12px 0",
    borderRadius: 10,
    border: "1.5px solid #90c4e8",
    background: "#e8f4fd",
    color: "#0a6ebd",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    boxSizing: "border-box",
  },
  photoHintBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    padding: "10px 12px",
    borderRadius: 10,
    background: "#e8f4fd",
    border: "1px solid #90c4e8",
    color: "#0d2b4e",
    fontSize: 13,
    lineHeight: 1.5,
    marginBottom: 10,
  },
  photoGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  photoThumbWrap: {
    position: "relative",
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: "hidden",
    border: "1.5px solid #d0e4f5",
    flexShrink: 0,
  },
  photoThumb: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  photoThumbRemove: {
    position: "absolute",
    top: 3,
    right: 3,
    width: 20,
    height: 20,
    borderRadius: 99,
    background: "rgba(0,0,0,0.55)",
    border: "none",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
  },
  confirmAnalyzeBox: {
    padding: "12px 14px",
    borderRadius: 12,
    background: "#e8f4fd",
    border: "1px solid #90c4e8",
    fontSize: 13.5,
    color: "#0d2b4e",
  },
  confirmYesBtn: {
    flex: 1,
    padding: "9px 0",
    borderRadius: 9,
    border: "none",
    background: "#0a6ebd",
    color: "#fff",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  confirmNoBtn: {
    flex: 1,
    padding: "9px 0",
    borderRadius: 9,
    border: "1px solid #90c4e8",
    background: "#fff",
    color: "#0a6ebd",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
  },
  latestNoteBox: {
    marginBottom: 10,
    padding: "9px 13px",
    borderRadius: 10,
    background: "#f0f6fb",
    border: "1px solid #d0e4f5",
  },
  latestNoteText: {
    fontSize: 13,
    color: "#2d4a6e",
    fontStyle: "italic",
  },
  stockInitRow: {
    display: "flex",
    gap: 8,
    marginBottom: 4,
  },
  stockInitBtn: {
    flex: 1,
    padding: "10px 0",
    borderRadius: 10,
    border: "1.5px solid #d0e4f5",
    background: "#f0f6fb",
    color: "#0a6ebd",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
  },
  stockSliderWrap: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  stockPercentLabel: {
    minWidth: 44,
    textAlign: "right",
    fontSize: 15,
  },
  productStockBadge: {
    display: "inline-block",
    fontSize: 11.5,
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: 99,
    border: "1px solid",
    marginTop: 3,
  },
  stockNotManagedBox: {
    padding: "12px 14px",
    borderRadius: 10,
    background: "#f0f6fb",
    border: "1px solid #d0e4f5",
    fontSize: 13,
    color: "#2d4a6e",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginBottom: 10,
  },
  stockActivateLink: {
    background: "none",
    border: "none",
    color: "#0a6ebd",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
    padding: 0,
    textAlign: "left",
  },
  consumptionRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 8,
    background: "#f0f6fb",
    border: "1px solid #d0e4f5",
  },
  consumptionDate: {
    fontSize: 12,
    color: "#4a6480",
  },
  consumptionAmt: {
    fontSize: 12,
    fontWeight: 700,
    color: "#0a6ebd",
  },
  photoLockedBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    padding: "13px 0",
    borderRadius: 12,
    border: "1.5px solid #f0d9a8",
    background: "#fdf6e6",
    color: "#a8721a",
    fontWeight: 600,
    fontSize: 13.5,
    cursor: "pointer",
    boxSizing: "border-box",
  },
  photoPreviewWrap: { position: "relative" },
  photoPreview: {
    width: "100%",
    maxHeight: 200,
    objectFit: "cover",
    borderRadius: 12,
    border: "1px solid #d0e4f5",
  },
  photoRemoveBtn: {
    marginTop: 7,
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontSize: 12,
    color: "#c4502f",
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
  },
  testPremiumCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#ffffff",
    border: "1px solid #e6ebe9",
    borderRadius: 14,
    padding: "13px 14px",
    marginBottom: 10,
  },
  paywallHero: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    padding: "14px 0 6px",
    textAlign: "center",
  },
  paywallPrice: { fontSize: 22, fontWeight: 800, color: "#0d2b4e", marginTop: 6 },
  paywallPriceSub: { fontSize: 12.5, color: "#6a7d90" },
  paywallPerk: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    fontSize: 13.5,
    color: "#2d4a6e",
    fontWeight: 500,
  },
};

// ---------- Point d'entrée ----------
// ---------- Icône PWA — bleu piscine ----------
(function injectPwaIcons() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1a8fd1"/>
        <stop offset="100%" stop-color="#064a8a"/>
      </linearGradient>
      <clipPath id="rnd"><rect width="512" height="512" rx="115"/></clipPath>
    </defs>
    <!-- fond dégradé bleu -->
    <rect width="512" height="512" rx="115" fill="url(#bg)"/>
    <!-- vague de fond -->
    <path d="M0 340 Q128 290 256 330 Q384 370 512 310 L512 512 L0 512Z" fill="#0a6ebd" opacity="0.55" clip-path="url(#rnd)"/>
    <path d="M0 380 Q128 340 256 375 Q384 410 512 360 L512 512 L0 512Z" fill="#064a8a" opacity="0.6" clip-path="url(#rnd)"/>
    <!-- goutte principale -->
    <path d="M256 110 C256 110 176 222 176 286 C176 330 212 366 256 366 C300 366 336 330 336 286 C336 222 256 110 256 110Z" fill="white" opacity="0.95"/>
    <!-- reflet interne goutte -->
    <ellipse cx="234" cy="252" rx="14" ry="28" fill="white" opacity="0.35" transform="rotate(-20 234 252)"/>
  </svg>`;
  const url = "data:image/svg+xml;base64," + btoa(svg);
  ["icon", "shortcut icon", "apple-touch-icon"].forEach((rel) => {
    const existing = document.querySelector(`link[rel="${rel}"]`);
    const link = existing || document.createElement("link");
    link.rel = rel;
    link.href = url;
    if (!existing) document.head.appendChild(link);
  });
  const meta = document.querySelector('meta[name="theme-color"]') || document.createElement("meta");
  meta.name = "theme-color";
  meta.content = "#064a8a";
  if (!meta.parentNode) document.head.appendChild(meta);
})();

const __root = ReactDOM.createRoot(document.getElementById("root"));
__root.render(React.createElement(PoolApp));
const __loader = document.getElementById("boot-loader");
if (__loader) __loader.remove();
