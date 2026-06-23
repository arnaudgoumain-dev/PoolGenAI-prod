const { useState, useEffect, useMemo, useRef } = React;
const {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, Legend
} = Recharts;
const {
  Plus, Trash2, Droplets, X, ChevronRight, ChevronDown, Settings2, AlertTriangle, CheckCircle2,
  History, Beaker, Camera, Lock, Crown, ImageOff, Sparkles, Loader2, Clock, FileText, Download
} = LucideReact;

// ---------- Constantes / cibles ----------
const APP_VERSION = "0.35";

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
    last_measure: t("last_measure"),
    modify: t("modify"),
    new_measure: t("new_measure"),
    treatment_plan: t("treatment_plan"),
    all_in_range: t("all_in_range"),
    no_measure: t("no_measure"),
    no_measure_sub: t("no_measure_sub"),
    add_measure: t("add_measure"),
    daily_limit: t("daily_limit"),
    apply_advice: t("apply_advice"),
    apply_advice_sub: t("apply_advice_sub"),
    advice_applied: t("advice_applied"),
    advice_partial: t("advice_partial"),
    adjust: t("adjust"),
    ai_analysis: t("ai_analysis"),
    ai_analyze_btn: t("ai_analyze_btn"),
    ai_locked: t("ai_locked"),
    ai_analyzing: t("ai_analyzing"),
    ai_api_missing: t("ai_api_missing"),
    follow_order: t("follow_order"),
    // Status
    in_range: "Dans la cible",
    too_high: "Trop haut",
    too_low: "Trop bas",
    target: "cible",
    // History
    evolution: t("evolution"),
    show_values: t("show_values"),
    journal: t("journal"),
    no_history: t("no_history"),
    no_history_sub: t("no_history_sub"),
    report: t("report"),
    generate_report: t("generate_report"),
    report_locked: t("report_locked"),
    report_desc: t("report_desc"),
    // Measure modal
    new_measure_title: t("new_measure_title"),
    edit_measure_title: t("edit_measure_title"),
    date_time: t("date_time"),
    photo_hint: "Prends en photo l'écran de ton photomètre avec les valeurs lisibles, ou place ta bandelette imbibée à côté de la légende du tube et photographie les deux ensemble.",
    photos_label: t("photos_label"),
    camera_btn: "Appareil photo",
    gallery_btn: "Bibliothèque",
    other_photo: "Autre photo",
    other_gallery: "Autre depuis biblio",
    photos_done: t("photos_done"),
    yes_analyze: t("yes_analyze"),
    add_more: t("add_more"),
    analyze_btn: "Analyser",
    analyzing: "Analyse en cours...",
    analyze_locked: "Photo + analyse IA réservées à la version illimitée",
    note_optional: t("note_optional"),
    note_placeholder: t("note_placeholder"),
    save_measure: "Enregistrer la mesure",
    save_changes: "Enregistrer les modifications",
    // Products
    my_products: t("my_products"),
    products_formula: "Le dosage est calculé selon : {quantité produit} pour faire varier le paramètre de {effet} sur {volume de référence} m³. Ces produits sont propres à ce bassin.",
    products_locked: t("products_locked"),
    stock_not_managed: t("stock_not_managed"),
    activate_in_settings: t("activate_in_settings"),
    delete_all_products: t("delete_all_products"),
    stock_label: "Stock :",
    stock_remaining: "restant",
    // Product modal
    edit_product: t("edit_product"),
    new_product: t("new_product"),
    product_photo: t("product_photo"),
    product_name: t("product_name"),
    effect: t("effect"),
    quantity: t("quantity"),
    effect_variation: t("effect_variation"),
    for_x_m3: t("for_x_m3"),
    wait_hours: t("wait_hours"),
    container_size: t("container_size"),
    current_stock: t("current_stock"),
    new_product_btn: t("new_product_btn"),
    manual_entry: t("manual_entry"),
    note_precaution: t("note_precaution"),
    save_product: t("save_product"),
    stock_not_managed_modal: t("stock_not_managed_modal"),
    stock_locked: t("stock_locked"),
    last_consumptions: t("last_consumptions"),
    // Apply modal
    apply_title: t("apply_title"),
    apply_subtitle: t("apply_subtitle"),
    confirm_btn: t("confirm_btn"),
    confirm_count: "conseil",
    confirm_count_plural: "conseils",
    quantities_title: t("quantities_title"),
    quantities_subtitle: t("quantities_subtitle"),
    quantity_applied: t("quantity_applied"),
    unit: t("unit"),
    back_btn: t("back_btn"),
    validate_btn: t("validate_btn"),
    stock_empty: t("stock_empty"),
    add_arrow: t("add_arrow"),
    // Settings
    settings_title: "Réglages",
    my_pools: t("my_pools"),
    pool_name: t("pool_name"),
    location: t("location"),
    volume: t("volume"),
    treatment_type: "Type de traitement",
    filtration_type: "Type de filtration",
    manage_stock_label: t("manage_stock_label"),
    manage_stock_desc: t("manage_stock_desc"),
    manage_stock_locked: t("manage_stock_locked"),
    api_key_label: "Clé API Anthropic ou URL du proxy Cloudflare Worker",
    provider_label: t("provider_label"),
    api_key_placeholder: "sk-ant-... ou https://mon-proxy.workers.dev",
    api_key_desc: "Ta clé est stockée localement. Pour Anthropic, saisis une clé sk-ant-... ou l'URL de ton proxy Cloudflare Worker (recommandé).",
    premium_section: "VERSION",
    premium_label: "Version illimitée",
    premium_test: t("premium_test"),
    premium_desc: "En version gratuite : 1 mesure par jour (tous bassins confondus), plusieurs bassins avec photo d'identification. En illimité : mesures sans limite, photos sur mesures et produits.",
    delete_measures: t("delete_measures"),
    sensitive_zone: t("sensitive_zone"),
    add_pool: "Ajouter un bassin",
    delete_pool: "Supprimer ce bassin",
    language_label: "Langue",
    // Report
    report_title: "Rapport de suivi",
    generated_on: t("generated_on"),
    params_evolution: t("params_evolution"),
    detailed_history: t("detailed_history"),
    no_measures_report: t("no_measures_report"),
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
    download_pdf: t("download_pdf"),
    close: t("close"),
    // Reco
    wait_before_next: "Attendre {h}h avant le traitement suivant",
    start_after: "À débuter au moins {h}h après l'étape précédente",
    measure_after: "Attendre {h}h avant de mesurer à nouveau",
    missing_product: "non disponible dans tes produits",
    missing_product_tip: "Aucun produit {action} dans ta liste — ajoutes-en un dans l'onglet Produits.",
    see_dosage: "Voir dosage",
    // Paywall
    paywall_title: t("paywall_title"),
    paywall_desc: t("paywall_desc"),
    paywall_btn: t("paywall_btn"),
    paywall_close: t("paywall_close"),
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
    unlimited_version: "Illimité",
  },
  en: {
    tab_pool: "Pool",
    tab_history: "History",
    tab_products: "Products",
    tab_settings: "Settings",
    premium_badge: "Premium",
    last_measure: "LAST READING",
    modify: "Edit",
    new_measure: "+ New reading",
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
    unlimited_version: "Unlimited",
  },
  de: {
    tab_pool: "Becken",
    tab_history: "Verlauf",
    tab_products: "Produkte",
    tab_settings: "Einstellungen",
    premium_badge: "Premium",
    last_measure: "LETZTE MESSUNG",
    modify: "Bearbeiten",
    new_measure: "+ Neue Messung",
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
    unlimited_version: "Unbegrenzt",
  },
  it: {
    tab_pool: "Vasca",
    tab_history: "Storico",
    tab_products: "Prodotti",
    tab_settings: "Impostazioni",
    premium_badge: "Premium",
    last_measure: "ULTIMA MISURAZIONE",
    modify: "Modifica",
    new_measure: "+ Nuova misurazione",
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
    unlimited_version: "Illimitato",
  },
  es: {
    tab_pool: "Piscina",
    tab_history: "Historial",
    tab_products: "Productos",
    tab_settings: "Ajustes",
    premium_badge: "Premium",
    last_measure: "ÚLTIMA MEDICIÓN",
    modify: "Editar",
    new_measure: "+ Nueva medición",
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
    unlimited_version: "Ilimitado",
  },
  pt: {
    tab_pool: "Piscina",
    tab_history: "Histórico",
    tab_products: "Produtos",
    tab_settings: "Configurações",
    premium_badge: "Premium",
    last_measure: "ÚLTIMA MEDIÇÃO",
    modify: "Editar",
    new_measure: "+ Nova medição",
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
    unlimited_version: "Ilimitado",
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
const TREATMENT_TYPES = [
  {
    value: "chlore",
    label: "Chlore",
    description: "Chlore stabilisé ou non, usage courant",
    params: ["pH", "fCl", "tCl", "tac", "cya", "temp"],
    targets: {}, // utilise les cibles standard de TARGETS
  },
  {
    value: "sel",
    label: "Sel (électrolyseur)",
    description: "Électrolyseur au sel, le chlore est produit en continu",
    params: ["pH", "fCl", "tCl", "tac", "sel", "temp"],
    targets: {
      pH:  { min: 7.2, max: 7.6 },   // tolérance légèrement plus large
      fCl: { min: 0.5, max: 2 },      // électrolyseur maintient en continu, doses plus faibles
      sel: { min: 3000, max: 5000 },
    },
  },
  {
    value: "brome",
    label: "Brome",
    description: "Traitement au brome, courant pour spas et piscines intérieures",
    params: ["pH", "brome", "tac", "temp"],
    targets: {
      pH:    { min: 7.2, max: 7.6 },
      brome: { min: 2, max: 4 },
    },
  },
  {
    value: "o2",
    label: "Oxygène actif / PHMB",
    description: "Sans chlore ni brome, adapté aux peaux sensibles",
    params: ["pH", "o2", "tac", "temp"],
    targets: {
      pH: { min: 6.8, max: 7.4 },    // plage pH différente pour O2 actif
      o2: { min: 10, max: 30 },
    },
  },
  {
    value: "autre",
    label: "Autre (UV, ozone…)",
    description: "Système alternatif ou combiné, paramètres de base",
    params: ["pH", "fCl", "tac", "temp"],
    targets: {},
  },
];

const FILTRATION_TYPES = [
  { value: "sable",     label: "Sable" },
  { value: "cartouche", label: "Cartouche" },
  { value: "diatomees", label: "Diatomées" },
  { value: "aucune",    label: "Sans filtration (naturelle)" },
];

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
    note: "Augmente le CYA à chaque utilisation. À éviter si CYA déjà > 50 mg/L.",
    containerAmount: 1000,
    containerUnit: "kg",
    stockPercent: 100,
  },
];

const PRODUCT_ACTIONS = [
  { value: "ph-",             label: "Baisse le pH" },
  { value: "ph+",             label: "Monte le pH" },
  { value: "chlore",          label: "Chlore non stabilisé (choc)" },
  { value: "chlore-stabilise",label: "Chlore stabilisé (CYA +)" },
  { value: "tac+",            label: "Monte le TAC" },
  { value: "brome",           label: "Brome" },
  { value: "o2",              label: "Oxygène actif" },
  { value: "sel",             label: "Sel (salinité)" },
];

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

function statusLabel(status) {
  if (status === "ok") return "Dans la cible";
  if (status === "low") return "Trop bas";
  if (status === "high") return "Trop haut";
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

function PoolApp() {
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
    return computeRecommendations(validatingMeasure, activePool?.volume || 0, poolProducts, effectiveTargets, activeParamKeys);
  }, [validatingMeasure, activePool, poolProducts, effectiveTargets, activeParamKeys]);

  const existingApplicationForValidating = useMemo(() => {
    if (!validatingMeasure) return null;
    return applications.find((a) => a.measureId === validatingMeasure.id) || null;
  }, [validatingMeasure, applications]);

  function addMeasure(entry) {
    if (entry.id) {
      // Édition d'une mesure existante
      setMeasures((prev) => prev.map((m) => (m.id === entry.id ? { ...m, ...entry } : m)));
    } else {
      setMeasures((prev) => [...prev, { id: uid(), poolId: activePoolId, ...entry }]);
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
    // Déduire le stock consommé pour chaque produit utilisé
    if (allApplied) {
      setProducts((prev) => prev.map((prod) => {
        const step = steps.find((s) => s.productName === prod.name);
        if (!step || !step.appliedAmount || !prod.containerAmount) return prod;
        // appliedAmount est toujours en g ou mL (unité de base)
        // containerAmount est en kg ou L selon containerUnit
        const cUnit = prod.containerUnit || "kg";
        // Convertir appliedAmount en kg ou L pour comparer au contenant
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
      setShowPaywall(true);
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
      setShowPaywall(true);
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
    setShowAddPool(true);
  }

  return (
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
            onWantPremium={() => setShowPaywall(true)}
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
            onWantPremiumForReport={() => setShowPaywall(true)}
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
            onWantPremium={() => setShowPaywall(true)}
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
            poolMeasureCount={poolMeasures.length}
            onGenerateReport={() => setShowReport(true)}
            onWantPremiumForReport={() => setShowPaywall(true)}
            onWantPremium={() => setShowPaywall(true)}
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
            setShowPaywall(true);
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
            setShowPaywall(true);
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
            setIsPremium(true);
            setApiKey("https://poolapp-proxy.arnaud-goumain.workers.dev");
            setShowPaywall(false);
          }}
        />
      )}

      {showAddPool && (
        <AddPoolModal onClose={() => setShowAddPool(false)} onSave={addPool} />
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
        />
      )}
    </div>
  );
}

// ---------- Header ----------
function Header({ poolName, location, poolPhoto, isPremium, pools, activePoolId, onSwitchPool, onAddPool, lang }) {
  const t = useT(lang);
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
                  <div style={{ fontSize: 11.5, color: "#6a7d90" }}>{p.location} · {p.volume} m³ · {TREATMENT_TYPES.find((t) => t.value === p.treatmentType)?.label || "Chlore"}</div>
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
              <Plus size={16} /> Ajouter un bassin
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
    <>
      <div style={styles.tabVersion}>v{APP_VERSION}</div>
      <nav style={styles.tabBar}>
      {tabs.map((t) => {
        const Icon = t.icon;
        const active = tab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              ...styles.tabBtn,
              color: active ? "#0a6ebd" : "#6a7d90",
            }}
          >
            <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
            <span style={{ fontSize: 11, marginTop: 3, fontWeight: active ? 700 : 500 }}>
              {t.label}
            </span>
          </button>
        );
      })}
    </nav>
    </>
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
    () => (latest ? computeRecommendations(latest, volume, products, effectiveTargets, activeParamKeys) : []),
    [latest, volume, products, effectiveTargets, activeParamKeys]
  );

  if (!latest) {
    return (
      <div style={styles.emptyState}>
        <Droplets size={40} color="#7ab8e8" strokeWidth={1.5} />
        <p style={styles.emptyTitle}>Aucune mesure enregistrée</p>
        <p style={styles.emptyText}>
          Ajoute ta première série de mesures pour voir l'état de ton bassin et les
          traitements recommandés.
        </p>
        <button style={styles.primaryBtn} onClick={onAddMeasure}>
          <Plus size={18} /> Ajouter une mesure
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
        <span style={styles.sectionLabel}>Dernière mesure</span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={styles.sectionDate}>{formatDate(latest.date)}</span>
          <button style={styles.editLinkBtn} onClick={() => onEditMeasure(latest)}>
            <Settings2 size={13} /> Modifier
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
          <Lock size={16} /> Limite quotidienne atteinte — passer en illimité
        </button>
      ) : (
        <button style={styles.addMeasureBtn} onClick={onAddMeasure}>
          <Plus size={18} /> Nouvelle mesure
        </button>
      )}

      <div style={styles.recoHeader}>
        <span style={styles.sectionLabel}>Plan de traitement</span>
      </div>

      {recs.length === 0 ? (
        <div style={styles.allGoodCard}>
          <CheckCircle2 size={22} color="#1a8fd1" />
          <span style={{ color: "#0a6ebd", fontWeight: 600, fontSize: 14 }}>
            Tous les paramètres mesurés sont dans la cible.
          </span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {recs.length > 1 && (
            <p style={styles.helpText}>
              Suis les étapes dans l'ordre : chaque traitement modifie l'équilibre de l'eau et
              peut fausser le suivant s'il n'a pas eu le temps d'agir.
            </p>
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
            />
          ))}

          {(() => {
            const selectedCount = Object.values(selectedRecs).filter(Boolean).length;
            return applicationForLatest ? (
              <div style={styles.applyConfirmedCard}>
                <CheckCircle2 size={16} color="#1a8fd1" />
                <span style={{ flex: 1 }}>
                  Conseils {applicationForLatest.allApplied ? "appliqués" : "partiellement appliqués"}{" "}
                  le {formatDate(applicationForLatest.appliedAt)}
                </span>
                <button style={styles.editLinkBtn} onClick={() => {
                  const sel = {};
                  recs.forEach((r, i) => {
                    sel[i] = applicationForLatest.steps?.some((s) => s.action === r.action) ?? true;
                  });
                  onValidateApplication(latest, recs, sel, true);
                }}>
                  Ajuster
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
                  <CheckCircle2 size={16} /> Appliquer ces conseils
                  {selectedCount > 0 && ` (${selectedCount})`}
                  {!isPremium && <Lock size={14} style={{ marginLeft: 4 }} />}
                </button>
                <p style={{ ...styles.helpTextSmall, marginTop: 6, textAlign: "center" }}>
                  Coche les conseils à appliquer puis saisis les quantités réelles.
                </p>
              </div>
            );
          })()}
        </div>
      )}

      <div style={styles.aiSection}>
        <div style={styles.aiSectionTitle}>
          <Sparkles size={14} color="#1a8fd1" /> Analyse IA
        </div>
        {!isPremium ? (
          <button style={styles.aiLockedBtn} onClick={onWantPremium}>
            <Lock size={15} />
            <span>Fonctionnalité réservée à la version illimitée</span>
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
                <><Loader2 size={14} className="spin" /> Analyse en cours…</>
              ) : (
                <><Sparkles size={14} /> Analyser avec {apiProvider === "openai" ? "ChatGPT" : "Claude"}</>
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
            <span>Renseigne ta clé API dans les Réglages pour activer l'analyse IA.</span>
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
      <div style={{ ...styles.paramStatus, color }}>{statusLabel(status, lang)}</div>
      <div style={styles.paramRange}>
        {t("target")} {paramTarget.min}–{paramTarget.max} {paramTarget.unit}
      </div>
    </div>
  );
}

function RecoCard({ reco, isLast, selectable, selected, onToggle, manageStock, products }) {
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
          À débuter au moins {reco.startsAfterHours}h après l'étape précédente
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
                  <AlertTriangle size={11} /> non disponible dans tes produits
                </span>
              )}
              {missingFromStock && (
                <span style={{ ...styles.recoMissingTag, background: "#fdf0ef", color: "#c0392b", borderColor: "#f5c6c2" }}>
                  <AlertTriangle size={11} /> stock épuisé
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
          Attendre {reco.waitHours}h avant {isLast ? "de mesurer à nouveau" : "le traitement suivant"}
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
function computeRecommendations(latest, volume, products, effectiveTargets, activeParamKeys) {
  const targets = effectiveTargets || getEffectiveTargets("chlore");
  const paramKeys = activeParamKeys || ["pH", "fCl", "tCl", "tac", "cya", "temp"];

  // Normaliser en minuscules pour les comparaisons internes
  const paramKeysLower = paramKeys.map((k) => k.toLowerCase());
  const targetsLower = Object.fromEntries(
    Object.entries(targets).map(([k, v]) => [k.toLowerCase(), v])
  );
  const latestLower = Object.fromEntries(
    Object.entries(latest).map(([k, v]) => [k.toLowerCase(), v])
  );

  const steps = [];
  const has = (key) => paramKeysLower.includes(key.toLowerCase());

  // TAC (en premier — influence le pH)
  const tac = parseFloat(latestLower.tac);
  if (has("tac") && !Number.isNaN(tac) && targetsLower.tac && tac < targetsLower.tac.min) {
    const prod = products.find((p) => p.action === "tac+");
    steps.push({
      action: "tac+",
      title: `TAC trop bas (${tac} mg/L)`,
      productName: prod ? prod.name : "Produit TAC+ (bicarbonate de sodium)",
      productAvailable: !!prod,
      productPhoto: prod?.photo || null,
      doseText: prod
        ? `Voir dosage : ${formatDose(prod.doseAmount, prod.doseUnit)} → +${prod.effectAmount} mg/L sur ${prod.effectPer} m³`
        : "Aucun produit TAC+ dans ta liste — ajoute-en un dans l'onglet Produits.",
      computedDoseAmount: prod?.doseAmount ?? null,
      doseUnit: prod?.doseUnit || null,
      note: prod?.note || "Un TAC bas rend le pH instable.",
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
        title: `pH trop haut (${phVal})`,
        productName: prod ? prod.name : "pH moins",
        productAvailable: !!prod,
        productPhoto: prod?.photo || null,
        doseText: prod
          ? `≈ ${formatDose(computedDose, prod.doseUnit)} pour viser ${targetMid.toFixed(1)}`
          : "Aucun produit pH- dans ta liste — ajoute-en un dans l'onglet Produits.",
        computedDoseAmount: computedDose,
        doseUnit: prod?.doseUnit || null,
        note: prod?.note,
        waitHours: prod?.waitHours ?? DEFAULT_WAIT_HOURS["ph-"],
      });
    } else if (phVal < phTargets.min) {
      const diff = targetMid - phVal;
      const prod = products.find((p) => p.action === "ph+");
      const computedDose = prod ? Math.round(prod.doseAmount * (volume / prod.effectPer) * (diff / prod.effectAmount)) : null;
      steps.push({
        action: "ph+",
        title: `pH trop bas (${phVal})`,
        productName: prod ? prod.name : "pH plus",
        productAvailable: !!prod,
        productPhoto: prod?.photo || null,
        doseText: prod
          ? `≈ ${formatDose(computedDose, prod.doseUnit)} pour viser ${targetMid.toFixed(1)}`
          : "Aucun produit pH+ dans ta liste — ajoute-en un dans l'onglet Produits.",
        computedDoseAmount: computedDose,
        doseUnit: prod?.doseUnit || null,
        note: prod?.note,
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
        title: `Chlore combiné élevé (${combined.toFixed(2)} mg/L)`,
        productName: prod ? prod.name : "Chlore choc non stabilisé",
        productAvailable: !!prod,
        productPhoto: prod?.photo || null,
        doseText: prod
          ? `≈ ${formatDose(computedDose, prod.doseUnit)} ce soir (choc renforcé)`
          : "Aucun produit chlore choc dans ta liste — ajoute-en un dans l'onglet Produits.",
        computedDoseAmount: computedDose,
        doseUnit: prod?.doseUnit || null,
        note: "Chlore combiné = chloramines, signe d'une désinfection insuffisante. Verser le soir, filtration en continu.",
        waitHours: prod?.waitHours ?? DEFAULT_WAIT_HOURS["chlore"],
      });
    } else if (fCl < fclT.min) {
      const targetFcl = (fclT.min + fclT.max) / 2;
      const diff = targetFcl - fCl;
      const prod = products.find((p) => p.action === "chlore");
      const computedDose = prod ? Math.round(prod.doseAmount * (volume / prod.effectPer) * (diff / prod.effectAmount)) : null;
      steps.push({
        action: "chlore",
        title: `Chlore libre trop bas (${fCl} mg/L)`,
        productName: prod ? prod.name : "Chlore choc non stabilisé",
        productAvailable: !!prod,
        productPhoto: prod?.photo || null,
        doseText: prod
          ? `≈ ${formatDose(computedDose, prod.doseUnit)} pour viser ${targetFcl} mg/L`
          : "Aucun produit chlore dans ta liste — ajoute-en un dans l'onglet Produits.",
        computedDoseAmount: computedDose,
        doseUnit: prod?.doseUnit || null,
        note: prod?.note,
        waitHours: prod?.waitHours ?? DEFAULT_WAIT_HOURS["chlore"],
      });
    } else if (fCl > fclT.max) {
      steps.push({
        action: "chlore-excess",
        title: `Chlore libre trop haut (${fCl} mg/L)`,
        productName: "Aucun produit nécessaire",
        productAvailable: true,
        doseText: "Laisser le chlore se dégrader naturellement au soleil, ne pas se baigner en attendant.",
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
        title: `Brome trop bas (${bromeVal} mg/L)`,
        productName: prod ? prod.name : "Brome (pastilles ou granulés)",
        productAvailable: !!prod,
        productPhoto: prod?.photo || null,
        doseText: prod
          ? `≈ ${formatDose(computedDose, prod.doseUnit)} pour viser ${(brT.min + brT.max) / 2} mg/L`
          : "Aucun produit brome dans ta liste — ajoute-en un dans l'onglet Produits.",
        computedDoseAmount: computedDose,
        doseUnit: prod?.doseUnit || null,
        note: "Verser loin des arrivées d'eau, filtration en marche.",
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
        title: `Oxygène actif trop bas (${o2Val} mg/L)`,
        productName: prod ? prod.name : "Oxygène actif (peroxyde d'hydrogène stabilisé)",
        productAvailable: !!prod,
        productPhoto: prod?.photo || null,
        doseText: prod
          ? `≈ ${formatDose(computedDose, prod.doseUnit)}`
          : "Aucun produit oxygène actif dans ta liste — ajoute-en un dans l'onglet Produits.",
        computedDoseAmount: computedDose,
        doseUnit: prod?.doseUnit || null,
        note: "Ne pas mélanger avec le chlore. Filtration en marche pendant 4h.",
        waitHours: prod?.waitHours ?? 4,
      });
    }
  }

  // Sel (salinité pour électrolyseur)
  const selVal = parseFloat(latestLower.sel);
  if (has("sel") && !Number.isNaN(selVal) && targetsLower.sel) {
    const selT = targetsLower.sel;
    if (selVal < selT.min) {
      const diff = ((selT.min + selT.max) / 2) - selVal;
      const selKg = Math.round((diff * volume) / 1000); // g/L × m³ = g → /1000 pour kg
      steps.push({
        action: "sel",
        title: `Salinité trop basse (${selVal} mg/L)`,
        productName: "Sel de piscine (NaCl pur)",
        productAvailable: true,
        doseText: `≈ ${selKg} kg pour viser ${Math.round((selT.min + selT.max) / 2)} mg/L`,
        computedDoseAmount: selKg,
        doseUnit: "kg",
        note: "Utiliser du sel spécial piscine (NaCl pur ≥ 99%). Dissoudre avant l'ajout ou verser directement près du skimmer, filtration en marche 24h.",
        waitHours: 24,
      });
    }
  }

  // CYA (pertinent seulement si le traitement l'inclut)
  const cya = parseFloat(latestLower.cya);
  if (has("cya") && !Number.isNaN(cya) && targetsLower.cya && cya > targetsLower.cya.max) {
    const renewalPercent = Math.round((1 - 40 / cya) * 100);
    steps.push({
      action: "renouvellement",
      title: `Stabilisant trop élevé (${cya} mg/L)`,
      productName: "Renouvellement d'eau partiel",
      productAvailable: true,
      doseText: `Renouveler ≈ ${renewalPercent} % du volume pour revenir vers 40 mg/L`,
      computedDoseAmount: renewalPercent,
      doseUnit: "%",
      note: "Aucun produit ne fait baisser le CYA chimiquement, seule la dilution fonctionne. Éviter le chlore stabilisé tant que le CYA est haut.",
      waitHours: 0,
    });
  }

  // Tri et calcul des délais cumulés
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
    { key: "fCl", color: "#2b7fd9", label: "Chlore libre", axis: "left" },
    { key: "tCl", color: "#8a6fd1", label: "Chlore total", axis: "left" },
    { key: "tac", color: "#d98c2b", label: "TAC", axis: "right" },
    { key: "cya", color: "#c4502f", label: "CYA", axis: "right" },
    { key: "temp", color: "#e0578a", label: "Température", axis: "right" },
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
        <p style={styles.emptyTitle}>Pas encore d'historique</p>
        <p style={styles.emptyText}>Tes mesures apparaîtront ici au fil du temps.</p>
        <button style={styles.primaryBtn} onClick={onAdd}>
          <Plus size={18} /> Ajouter une mesure
        </button>
      </div>
    );
  }

  return (
    <div>
      {poolName && <div style={styles.poolNameTag}>{poolName}</div>}
      <div style={styles.sectionRow}>
        <span style={styles.sectionLabel}>Évolution</span>
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
          {allActive ? "Tout masquer" : "Tout afficher"}
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
        <span style={styles.axisLegendItem}><b>ᴜ</b> échelle unités (pH, chlore) — gauche</span>
        <span style={styles.axisLegendItem}><b>ᴅ</b> échelle dizaines (TAC, CYA, température) — droite</span>
      </p>

      <label style={styles.checkboxRow}>
        <input
          type="checkbox"
          checked={showValues}
          onChange={(e) => setShowValues(e.target.checked)}
        />
        <span>Afficher les valeurs sur le graphique</span>
      </label>

      <div style={styles.chartCard}>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: showValues ? 18 : 8, right: 12, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e6ebe9" />
            <XAxis
              dataKey="timestamp"
              type="number"
              domain={["dataMin", "dataMax"]}
              scale="time"
              tickFormatter={(ts) => formatDateShort(new Date(ts).toISOString())}
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

      <div style={styles.sectionRow}>
        <span style={styles.sectionLabel}>Journal</span>
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
          />
        ))}
      </div>

      <div style={{ ...styles.sectionRow, marginTop: 18 }}>
        <span style={styles.sectionLabel}>Rapport</span>
      </div>
      {isPremium ? (
        <button style={styles.validateApplyBtn} onClick={onGenerateReport}>
          <FileText size={16} /> Générer le rapport de ce bassin
        </button>
      ) : (
        <button style={styles.photoLockedBtn} onClick={onWantPremiumForReport}>
          <Lock size={16} />
          <span>Rapport PDF réservé à la version illimitée</span>
        </button>
      )}
      <p style={styles.helpTextSmall}>
        Le rapport reprend l'historique des mesures, les conseils donnés et les quantités
        réellement appliquées pour ce bassin.
      </p>
    </div>
  );
}

function MeasureRow({ measure, onDelete, onEdit, onValidateApplication, application, isPremium }) {
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
          {measure.photo && (
            <img src={measure.photo} alt="Photo de la mesure" style={styles.measurePhotoFull} />
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
                Conseils {application.allApplied ? "appliqués" : "partiellement appliqués"} le{" "}
                {formatDate(application.appliedAt)}
              </span>
              <button style={styles.editLinkBtn} onClick={onValidateApplication}>
                Ajuster
              </button>
            </div>
          ) : (
            <button style={styles.validateApplyBtnSmall} onClick={onValidateApplication}>
              <CheckCircle2 size={14} /> Appliquer ces conseils
              {!isPremium && <Lock size={12} style={{ marginLeft: 2 }} />}
            </button>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button style={styles.editBtn} onClick={onEdit}>
              <Settings2 size={14} /> Modifier
            </button>
            <button style={styles.deleteBtn} onClick={onDelete}>
              <Trash2 size={14} /> Supprimer
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
  const [photoBusy, setPhotoBusy] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);
  const [analyzeNote, setAnalyzeNote] = useState(null);
  const [confirmAnalyze, setConfirmAnalyze] = useState(false);
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);

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
        `${photos.length} photo(s) analysée(s) — ${notes.join(" / ") || "vérifie les valeurs avant d'enregistrer."}`
      );
    } catch (err) {
      setAnalyzeError("Analyse impossible : " + (err?.message || "erreur inconnue") + ". Vérifie ta connexion et les photos.");
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
    });
  }

  // Tous les champs possibles, filtrés selon le traitement du bassin
  const ALL_FIELDS = [
    { key: "pH",   label: "pH",                        value: pH,    set: setPH,    step: "0.01", placeholder: "7.40" },
    { key: "fCl",  label: "Chlore libre (mg/L)",       value: fCl,   set: setFCl,   step: "0.01", placeholder: "1.20" },
    { key: "tCl",  label: "Chlore total (mg/L)",       value: tCl,   set: setTCl,   step: "0.01", placeholder: "1.30" },
    { key: "tac",  label: "TAC (mg/L)",                value: tac,   set: setTac,   step: "1",    placeholder: "100" },
    { key: "cya",  label: "Stabilisant CYA (mg/L)",   value: cya,   set: setCya,   step: "1",    placeholder: "40" },
    { key: "temp", label: "Température de l'eau (°C)", value: temp,  set: setTemp,  step: "0.1",  placeholder: "27" },
    { key: "sel",  label: "Salinité / sel (mg/L)",     value: sel,   set: setSel,   step: "10",   placeholder: "4000" },
    { key: "brome",label: "Brome (mg/L)",              value: brome, set: setBrome, step: "0.1",  placeholder: "3.0" },
    { key: "o2",   label: "Oxygène actif (mg/L)",      value: o2,    set: setO2,    step: "0.5",  placeholder: "20" },
  ];
  const fields = activeParamKeys
    ? ALL_FIELDS.filter((f) => activeParamKeys.includes(f.key))
    : ALL_FIELDS.filter((f) => ["pH","fCl","tCl","tac","cya","temp"].includes(f.key));

  return (
    <ModalShell onClose={onClose} title={isEditing ? "Modifier la mesure" : "Nouvelle mesure"}>
      <label style={styles.fieldLabel}>Date et heure</label>
      <input
        type="datetime-local"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        style={styles.input}
      />

      {isPremium ? (
        <div style={styles.photoHintBox}>
          <Camera size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>
            Prends en photo l'écran de ton photomètre avec les valeurs lisibles, ou place ta bandelette imbibée à côté de la légende du tube et photographie les deux ensemble.
          </span>
        </div>
      ) : null}

      <label style={styles.fieldLabel}>Photos de la mesure</label>
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
                  <span>Tu as terminé d'ajouter des photos ?</span>
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button style={styles.confirmYesBtn} onClick={handleAnalyze} disabled={analyzing}>
                      {analyzing
                        ? <><Loader2 size={13} className="spin" /> Analyse…</>
                        : "Oui, analyser"}
                    </button>
                    <button style={styles.confirmNoBtn} onClick={() => setConfirmAnalyze(false)}>
                      Ajouter d'autres
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
          <span>Photo + analyse IA réservées à la version illimitée</span>
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

      <label style={styles.fieldLabel}>Note (optionnel)</label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Eau trouble, fort ensoleillement, baignade prévue..."
        style={{ ...styles.input, minHeight: 64, resize: "vertical" }}
      />

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
      <ModalShell onClose={onClose} title="Appliquer ces conseils">
        <p style={styles.helpText}>
          Sélectionne les conseils que tu as appliqués pour la mesure du {formatDate(measure.date)}.
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
          Confirmer ({selectedCount} conseil{selectedCount > 1 ? "s" : ""})
        </button>
      </ModalShell>
    );
  }

  // Étape 2 : saisie des quantités
  return (
    <ModalShell onClose={onClose} title="Quantités appliquées">
      <p style={styles.helpText}>
        Ajuste les quantités si besoin — ces informations serviront pour ton rapport.
      </p>
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
                  <span><AlertTriangle size={12} style={{ marginRight: 4 }} />Stock épuisé pour ce produit.</span>
                  <button type="button" onClick={onWantAddProduct} style={{ background: "none", border: "none", color: "#c0392b", fontWeight: 700, fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>
                    Ajouter →
                  </button>
                </div>
              )}
              {r.doseUnit ? (
                <div style={styles.fieldGrid}>
                  <div>
                    <label style={styles.fieldLabel}>Quantité appliquée</label>
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
                    <label style={styles.fieldLabel}>Unité</label>
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
          Valider
        </button>
        <button style={{ ...styles.primaryBtn, background: "#f0f6fb", color: "#0a6ebd", border: "1px solid #d0e4f5" }}
          onClick={() => setStep("select")}>
          ← Retour
        </button>
      </div>
    </ModalShell>
  );
}

// ---------- Produits ----------
function ProductsView({ products, onEdit, onAddNew, onDelete, onResetAll, isPremium, onWantPremium, onWantSettings, poolName, manageStock, lang }) {
  const t = useT(lang);
  function handleResetAll() {
    if (products.length === 0) return;
    const ok = window.confirm(
      `Supprimer les ${products.length} produit(s) de ce bassin ? Cette action est irréversible.`
    );
    if (ok) onResetAll();
  }

  return (
    <div>
      {poolName && <div style={styles.poolNameTag}>{poolName}</div>}
      <div style={styles.sectionRow}>
        <span style={styles.sectionLabel}>Mes produits</span>
        {(!isPremium || manageStock) && (
          <button style={styles.smallAddBtn} onClick={onAddNew}>
            <Plus size={16} />
          </button>
        )}
      </div>

      {isPremium && !manageStock ? (
        <div style={styles.stockNotManagedBox}>
          <span>La gestion du stock n'est pas activée pour ce bassin. Active-la dans Réglages pour gérer les quantités et voir les consommations.</span>
          <button type="button" style={styles.stockActivateLink} onClick={isPremium ? onWantSettings : onWantPremium}>
            Activer dans Réglages →
          </button>
        </div>
      ) : (
        <>
      <p style={styles.helpText}>
        Le dosage est calculé selon : {"{quantité produit}"} pour faire varier le paramètre de{" "}
        {"{effet}"} sur {"{volume de référence}"} m³. Ces produits sont propres à ce bassin.
      </p>

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
                {p.doseAmount} {p.doseUnit} → {p.effectAmount} sur {p.effectPer} m³ ·{" "}
                {PRODUCT_ACTIONS.find((a) => a.value === p.action)?.label}
                {!!p.waitHours && ` · attente ${p.waitHours}h`}
              </div>
              {isPremium && manageStock && (() => {
                const pct = p.stockPercent ?? 100;
                const low = pct <= 20;
                const container = p.containerAmount || 1;
                const cUnit = p.containerUnit || "kg";
                const remaining = (container * pct / 100);
                const displayVal = Number.isInteger(remaining) ? remaining : remaining.toFixed(2).replace(/\.?0+$/, "");
                const displayUnit = cUnit;
                return (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                      <span style={{ fontSize: 11, color: low ? "#c0392b" : "#4a6480", fontWeight: 600 }}>
                        Stock : {pct} %
                      </span>
                      <span style={{ fontSize: 11, color: low ? "#c0392b" : "#6a7d90" }}>
                        ≈ {displayVal} {displayUnit} restant{remaining > 1 ? "s" : ""}
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
          <p style={styles.emptyText}>Aucun produit. Ajoute ton premier produit de traitement.</p>
        )}
      </div>

      {products.length > 0 && (
        <button style={styles.dangerLinkBtn} onClick={handleResetAll}>
          <Trash2 size={14} /> Supprimer tous les produits de ce bassin
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
      title={product ? "Modifier le produit" : "Nouveau produit"}
      rightAction={
        product ? (
          <button
            style={styles.modalDeleteBtn}
            onClick={() => {
              onSave({ ...product, __delete: true });
            }}
          >
            <Trash2 size={16} />
          </button>
        ) : null
      }
    >
      <label style={styles.fieldLabel}>Photo du produit (étiquette)</label>
      {isPremium ? (
        <div>
          {photo ? (
            <div style={styles.photoPreviewWrap}>
              <img src={photo} alt="Aperçu" style={styles.photoPreview} />
              <button style={styles.photoRemoveBtn} onClick={() => setPhoto(null)}>
                <X size={14} /> Retirer
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
                {photoBusy ? "..." : "Appareil photo"}
              </button>
              <button
                type="button"
                style={styles.photoCaptureBtnHalf}
                onClick={() => galleryInputRef.current?.click()}
              >
                <ImageOff size={17} />
                {photoBusy ? "..." : "Bibliothèque"}
              </button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoChange}
            style={styles.hiddenFileInput}
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            style={styles.hiddenFileInput}
          />
        </div>
      ) : (
        <button style={styles.photoLockedBtn} onClick={onWantPremium}>
          <Lock size={16} />
          <span>Photo réservée à la version illimitée</span>
        </button>
      )}

      <label style={styles.fieldLabel}>Nom du produit</label>
      <input
        style={styles.input}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="ex: Chlore choc XYZ"
      />

      <label style={styles.fieldLabel}>Effet</label>
      <select style={styles.input} value={action} onChange={(e) => setAction(e.target.value)}>
        {PRODUCT_ACTIONS.map((a) => (
          <option key={a.value} value={a.value}>
            {a.label}
          </option>
        ))}
      </select>

      <div style={styles.fieldGrid}>
        <div>
          <label style={styles.fieldLabel}>Quantité</label>
          <input
            type="number"
            style={styles.input}
            value={doseAmount}
            onChange={(e) => setDoseAmount(e.target.value)}
          />
        </div>

        <div>
          <label style={styles.fieldLabel}>Effet (variation)</label>
          <input
            type="number"
            style={styles.input}
            value={effectAmount}
            onChange={(e) => setEffectAmount(e.target.value)}
          />
        </div>
        <div>
          <label style={styles.fieldLabel}>Pour X m³</label>
          <input
            type="number"
            style={styles.input}
            value={effectPer}
            onChange={(e) => setEffectPer(e.target.value)}
          />
        </div>
      </div>

      <label style={styles.fieldLabel}>Délai d'attente avant le traitement suivant (heures)</label>
      <input
        type="number"
        style={styles.input}
        value={waitHours}
        onChange={(e) => setWaitHours(e.target.value)}
        placeholder="2"
      />

      {!isPremium ? (
        <button style={styles.photoLockedBtn} onClick={onWantPremium}>
          <Lock size={16} />
          <span>Gestion du stock réservée à la version illimitée</span>
        </button>
      ) : !manageStock ? (
        <div style={styles.stockNotManagedBox}>
          <span>La gestion du stock n'est pas activée pour ce bassin.</span>
          <button type="button" style={styles.stockActivateLink} onClick={onWantManageStock}>
            Activer dans Réglages →
          </button>
        </div>
      ) : (
        <>
          <label style={styles.fieldLabel}>Taille du contenant</label>
          <div style={styles.segmentedControl}>
            {["kg", "L"].map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setContainerUnit(u)}
                style={{
                  ...styles.segmentedBtn,
                  ...(containerUnit === u ? styles.segmentedBtnActive : {}),
                }}
              >
                {u}
              </button>
            ))}
          </div>
          <input
            type="number"
            style={styles.input}
            value={containerAmount}
            onChange={(e) => setContainerAmount(e.target.value)}
            placeholder="1"
            min="0.01"
            step="0.1"
          />

          <label style={styles.fieldLabel}>Stock actuel</label>
          {stockPercent === null ? (
            <div style={styles.stockInitRow}>
              <button type="button" style={styles.stockInitBtn} onClick={() => setStockPercent(100)}>
                Produit neuf (100 %)
              </button>
              <button type="button" style={styles.stockInitBtn} onClick={() => setStockPercent(50)}>
                Saisir manuellement
              </button>
            </div>
          ) : (
            <div style={styles.stockSliderWrap}>
              <input
                type="range" min="0" max="100"
                value={stockPercent}
                onChange={(e) => setStockPercent(Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ ...styles.stockPercentLabel, color: stockPercent <= 20 ? "#c0392b" : "#0d2b4e", fontWeight: 700 }}>
                {stockPercent} %
              </span>
            </div>
          )}
        </>
      )}

      {isPremium && product && (() => {
        // Extraire les 10 dernières consommations de ce produit
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
            <label style={styles.fieldLabel}>10 dernières consommations</label>
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

      <label style={styles.fieldLabel}>Note / précaution</label>
      <textarea
        style={{ ...styles.input, minHeight: 64, resize: "vertical" }}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <button style={styles.primaryBtn} onClick={handleSave}>
        Enregistrer le produit
      </button>
    </ModalShell>
  );
}

// ---------- Réglages ----------
function SettingsView({ pools, activePoolId, onUpdatePool, onDeletePool, onSwitchPool, onWantAddPool, onDeleteAllMeasures: onDeleteAllMeasuresRaw, poolMeasureCount, onGenerateReport, onWantPremiumForReport, onWantPremium, isPremium, setIsPremium, apiKey, setApiKey, apiProvider, setApiProvider, lang, setLang }) {
  const t = useT(lang);
  const activePool = pools.find((p) => p.id === activePoolId) || pools[0];
  const [showApiKey, setShowApiKey] = useState(false);

  function onDeleteAllMeasures() {
    if (!poolMeasureCount) return;
    const ok = window.confirm(
      `Supprimer les ${poolMeasureCount} mesure(s) de "${activePool?.name}" ? Cette action est irréversible.`
    );
    if (ok) onDeleteAllMeasuresRaw();
  }

  return (
    <div>
      <div style={styles.sectionRow}>
        <span style={styles.sectionLabel}>Abonnement</span>
      </div>

      <div style={styles.testPremiumCard}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Crown size={18} color={isPremium ? "#a8721a" : "#9aa9a5"} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: "#0d2b4e" }}>
              {isPremium ? "Mode illimité actif" : "Version gratuite"}
            </div>
            <div style={{ fontSize: 11.5, color: "#6a7d90" }}>
              Interrupteur de test — pas de vrai paiement ici
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
        En version gratuite : 1 mesure par jour (tous bassins confondus), plusieurs bassins
        avec photo d'identification. En illimité : mesures sans limite, photos sur mesures
        et produits.
      </p>

      <div style={styles.sectionRow}>
        <span style={styles.sectionLabel}>Mes bassins</span>
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
                <div style={{ fontSize: 11.5, color: "#6a7d90" }}>{p.location} · {p.volume} m³ · {TREATMENT_TYPES.find((t) => t.value === p.treatmentType)?.label || "Chlore"}</div>
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
        <span style={styles.sectionLabel}>Bassin actif</span>
      </div>

      <label style={styles.fieldLabel}>Nom du bassin</label>
      <input
        style={styles.input}
        value={activePool?.name || ""}
        onChange={(e) => onUpdatePool(activePool.id, { name: e.target.value })}
      />

      <label style={styles.fieldLabel}>Localisation</label>
      <input
        style={styles.input}
        value={activePool?.location || ""}
        onChange={(e) => onUpdatePool(activePool.id, { location: e.target.value })}
      />

      <label style={styles.fieldLabel}>Volume du bassin (m³)</label>
      <input
        type="number"
        style={styles.input}
        value={activePool?.volume || 0}
        onChange={(e) => onUpdatePool(activePool.id, { volume: parseFloat(e.target.value) || 0 })}
      />

      <label style={styles.fieldLabel}>Type de traitement</label>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {TREATMENT_TYPES.map((tt) => (
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
              Paramètres : {tt.params.join(", ")}
            </div>
          </button>
        ))}
      </div>

      <label style={{ ...styles.fieldLabel, marginTop: 14 }}>Type de filtration</label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {FILTRATION_TYPES.map((ft) => (
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
        Le traitement détermine quels paramètres sont mesurés et les cibles recommandées.
        Le volume est utilisé pour calculer les doses de produits.
      </p>

      {isPremium && (
        <div style={{ ...styles.sectionRow, marginTop: 14 }}>
          <div>
            <span style={styles.sectionLabel}>Gestion du stock</span>
            <div style={{ fontSize: 12, color: "#6a7d90", marginTop: 2 }}>
              Suit la consommation des produits et l'affiche dans le rapport.
            </div>
          </div>
          <ToggleSwitch
            checked={!!activePool?.manageStock}
            onChange={(val) => onUpdatePool(activePool.id, { manageStock: val })}
          />
        </div>
      )}

      <div style={styles.sectionRow}>
        <span style={styles.sectionLabel}>Clé API (analyse IA)</span>
      </div>

      {!isPremium ? (
        <button style={styles.photoLockedBtn} onClick={onWantPremium}>
          <Lock size={16} />
          <span>Analyse IA réservée à la version illimitée</span>
        </button>
      ) : (
        <>
          <label style={styles.fieldLabel}>Provider</label>
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
            {apiProvider === "openai"
              ? "Clé API OpenAI"
              : "Clé API Anthropic ou URL du proxy Cloudflare Worker"}
          </label>
          <div style={styles.apiKeyRow}>
            <input
              type={showApiKey ? "text" : "password"}
              style={{ ...styles.input, flex: 1 }}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={apiProvider === "openai" ? "sk-..." : "sk-ant-... ou https://mon-proxy.workers.dev"}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <button
              type="button"
              onClick={() => setShowApiKey((v) => !v)}
              style={styles.eyeBtn}
              title={showApiKey ? "Masquer" : "Afficher"}
            >
              {showApiKey
                ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              }
            </button>
          </div>
          <p style={styles.helpTextSmall}>
            Ta clé est stockée localement. Pour Anthropic, saisis une clé sk-ant-... ou l'URL de ton proxy Cloudflare Worker (recommandé).
          </p>
        </>
      )}

      <div style={styles.sectionRow}>
        <span style={styles.sectionLabel}>Zone sensible</span>
      </div>
      <button style={styles.dangerLinkBtn} onClick={onDeleteAllMeasures}>
        <Trash2 size={14} /> Supprimer toutes les mesures de ce bassin
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
    "Mesures illimitées (au lieu d'1 par jour)",
    "Photo de chaque mesure (preuve, archive visuelle)",
    "Photo de chaque produit (étiquette, dosage)",
    "Historique illimité",
    "Multi-bassins",
  ];
  return (
    <ModalShell onClose={onClose} title="Passer en illimité">
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
        Activer (test — sans paiement)
      </button>
      <p style={{ ...styles.helpText, textAlign: "center" }}>
        Ceci est une version de test. Aucun paiement réel n'est effectué.
      </p>
    </ModalShell>
  );
}

// ---------- Ajout d'un bassin ----------
function AddPoolModal({ onClose, onSave }) {
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
    <ModalShell onClose={onClose} title="Nouveau bassin">
      <label style={styles.fieldLabel}>Photo du bassin</label>
      <div>
        {photo ? (
          <div style={styles.photoPreviewWrap}>
            <img src={photo} alt="Aperçu" style={styles.photoPreview} />
            <button style={styles.photoRemoveBtn} onClick={() => setPhoto(null)}>
              <X size={14} /> Retirer
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
              {photoBusy ? "..." : "Appareil photo"}
            </button>
            <button
              type="button"
              style={styles.photoCaptureBtnHalf}
              onClick={() => galleryInputRef.current?.click()}
            >
              <ImageOff size={17} />
              {photoBusy ? "..." : "Bibliothèque"}
            </button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoChange}
          style={styles.hiddenFileInput}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          style={styles.hiddenFileInput}
        />
      </div>

      <label style={styles.fieldLabel}>Nom du bassin</label>
      <input
        style={styles.input}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="ex: Piscine, Spa, Bassin de la maison de famille"
      />

      <label style={styles.fieldLabel}>Localisation</label>
      <input
        style={styles.input}
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="ex: Valbonne (06)"
      />

      <label style={styles.fieldLabel}>Volume (m³)</label>
      <input
        type="number"
        style={styles.input}
        value={volume}
        onChange={(e) => setVolume(e.target.value)}
      />

      <button style={styles.primaryBtn} onClick={handleSave}>
        Créer le bassin
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
    { key: "fCl", color: "#2b7fd9", label: "Chlore libre", axis: "left" },
    { key: "tCl", color: "#8a6fd1", label: "Chlore total", axis: "left" },
    { key: "tac", color: "#d98c2b", label: "TAC", axis: "right" },
    { key: "cya", color: "#c4502f", label: "CYA", axis: "right" },
    { key: "temp", color: "#e0578a", label: "Température", axis: "right" },
  ];

  // Pour chaque mesure : recalcule le plan de traitement qui avait été
  // donné (avec les produits actuels) et retrouve l'application validée
  // correspondante si elle existe.
  const rows = useMemo(() => {
    const repTargets = getEffectiveTargets(pool?.treatmentType || "chlore");
    const repParams = getActiveParams(pool?.treatmentType || "chlore");
    return sortedMeasures.map((m) => {
      const recs = computeRecommendations(m, pool?.volume || 0, products, repTargets, repParams);
      const application = applications.find((a) => a.measureId === m.id) || null;
      return { measure: m, recs, application };
    });
  }, [sortedMeasures, pool, products, applications]);

  const generatedAt = new Date().toLocaleString("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <div style={styles.reportOverlay} className="report-print-root">
      <div style={styles.reportToolbar} className="no-print">
        <button style={styles.reportCloseBtn} onClick={onClose}>
          <X size={18} /> Fermer
        </button>
        <label style={styles.reportToolbarCheckbox}>
          <input
            type="checkbox"
            checked={showValues}
            onChange={(e) => setShowValues(e.target.checked)}
          />
          <span>Afficher les valeurs</span>
        </label>
        <button style={styles.reportPrintBtn} onClick={() => window.print()}>
          <Download size={16} /> Imprimer / Enregistrer en PDF
        </button>
      </div>

      <div style={styles.reportPage} id="report-printable">
        <div style={styles.reportHeader}>
          <div style={styles.reportHeaderIcon}>
            <Droplets size={20} color="#e8f4fd" />
          </div>
          <div>
            <div style={styles.reportTitle}>Rapport de suivi — {pool?.name}</div>
            <div style={styles.reportSubtitle}>
              {pool?.location} · {pool?.volume} m³ · généré le {generatedAt}
            </div>
          </div>
        </div>

        <div style={styles.reportSectionTitle}>Évolution des paramètres</div>
        {chartData.length > 0 ? (
          <div style={styles.reportChartWrap}>
            <LineChart
              width={760}
              height={showValues ? 320 : 280}
              data={chartData}
              margin={{ top: showValues ? 24 : 8, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e6ebe9" />
              <XAxis
                dataKey="timestamp"
                type="number"
                domain={["dataMin", "dataMax"]}
                scale="time"
                tickFormatter={(ts) => formatDateShort(new Date(ts).toISOString())}
                tick={{ fontSize: 10, fill: "#2d4a6e" }}
              />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "#2d4a6e" }} width={30} />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 10, fill: "#2d4a6e" }}
                width={30}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
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
                      ? { fontSize: 9, fill: cp.color, position: "top", offset: 6 }
                      : false
                  }
                />
              ))}
            </LineChart>
          </div>
        ) : (
          <p style={styles.helpTextSmall}>Aucune mesure à afficher.</p>
        )}

        <div style={styles.reportSectionTitle}>Historique des mesures et consommations</div>
        {rows.length === 0 ? (
          <p style={styles.helpTextSmall}>Aucune mesure enregistrée pour ce bassin.</p>
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
                {manageStock && <th style={styles.reportThCell}>{t("product_col")}</th>}
                {manageStock && <th style={styles.reportThCell}>{t("quantity_col")}</th>}
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
                      {manageStock && <td style={styles.reportTdCell}>{step ? step.productName : "—"}</td>}
                      {manageStock && <td style={{ ...styles.reportTdCell, fontWeight: 700, color: "#0a6ebd" }}>
                        {step ? formatDose(step.appliedAmount, step.doseUnit || "g") : "—"}
                      </td>}
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
    display: "flex",
    justifyContent: "center",
    overflowX: "auto",
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
    minHeight: "100vh",
    maxWidth: 480,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    color: "#0d2b4e",
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
  main: { flex: 1, padding: "16px 16px 90px", overflowY: "auto" },
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
    position: "sticky",
    bottom: 0,
    display: "flex",
    background: "#ffffff",
    borderTop: "1px solid #e6ebe9",
    maxWidth: 480,
    margin: "0 auto",
    width: "100%",
    alignItems: "center",
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
    zIndex: 50,
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
