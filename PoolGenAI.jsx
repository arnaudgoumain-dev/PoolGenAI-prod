const { useState, useEffect, useMemo, useRef } = React;
const {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, Legend
} = Recharts;
const {
  Plus, Trash2, Droplets, X, ChevronRight, ChevronDown, Settings2, AlertTriangle, CheckCircle2,
  History, Beaker, Camera, Lock, Crown, ImageOff, Sparkles, Loader2, Clock, FileText, Download,
  Eye, EyeOff, Share2, MapPin, LocateFixed
} = LucideReact;

// ---------- Constantes / cibles ----------
const APP_VERSION = "1.95.1";
const CGU_VERSION = "1.3"; // v1.3 : clause 5 corrigée (clé API proxy, éditeur sous-traitant RGPD), article 12 - contribution photo base commune
// v1.95.0 — Plafond de bassins actifs pour un compte Premium (contrôle
// client ; la vraie limite est imposée par firestore.rules côté serveur).
const MAX_POOLS_CLIENT = 3;

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
    daily_limit: "Limite quotidienne atteinte — passer en Premium",
    apply_advice: "Appliquer ces conseils",
    apply_advice_sub: "Sélectionne les conseils à appliquer puis saisis les quantités réelles.",
    advice_applied: "Conseils appliqués",
    advice_partial: "partiellement appliqués",
    adjust: "Ajuster",
    ai_analysis: "ANALYSE IA",
    ai_analyze_btn: "Analyser avec l'IA",
    ai_locked: "Fonctionnalité réservée à la version Premium",
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
    show_all_params: "Afficher les paramètres",
    hide_all_params: "Masquer les paramètres",
    journal: "Journal",
    no_history: "Pas encore d'historique",
    no_history_sub: "Tes mesures apparaîtront ici au fil du temps.",
    report: "Rapport",
    time_col: "Horaire",
    advised_col: "Conseillé",
    ccl_col: "CCL",
    hard_col: "TH",
    phos_col: "Phos.",
    copper_col: "Cuivre",
    iron_col: "Fer",
    param_ccl: "Chlore combiné (CCL)",
    param_hard: "Dureté (TH)",
    param_phos: "Phosphates",
    param_copper: "Cuivre",
    param_iron: "Fer",
    reco_hard_low: "Dureté trop basse ({val} mg/L)",
    reco_hard_high: "Dureté trop élevée ({val} mg/L)",
    reco_phos_high: "Phosphates trop élevés ({val} µg/L)",
    reco_copper_high: "Cuivre trop élevé ({val} mg/L)",
    reco_iron_high: "Fer trop élevé ({val} mg/L)",
    reco_fallback_hard: "Chlorure de calcium",
    reco_fallback_phos: "Anti-phosphates",
    reco_fallback_sequestrant: "Séquestrant métaux",
    note_tac_plus: "Ajouter progressivement, filtration en marche. Attendre 6h avant autre traitement.",
    note_calcium: "Diluer avant ajout. Ne pas mélanger avec d'autres produits. Filtration en marche.",
    note_anti_phos: "Verser devant la buse de refoulement, filtration en marche 24h.",
    note_sequestrant: "Traitement cuivre/fer. Verser en périphérie du bassin, filtration en marche.",
    note_floculant: "Traitement ponctuel eau trouble, pas de suivi automatique par l'appli. Verser devant les buses de refoulement, filtration en marche, puis arrêter 24h pour décantation.",
    action_hard_plus: "Monte la dureté (TH)",
    action_phos_minus: "Réduit les phosphates",
    action_sequestrant: "Séquestrant métaux (cuivre/fer)",
    action_floculant: "Floculant / clarifiant",
    action_outil_mesure: "Outil de mesure (bandelettes, etc.)",
    legal_notices: "Mentions légales",
    lcen_title: "Mentions légales (LCEN)",
    lcen_editor: "Éditeur",
    lcen_editor_val: "Arnaud Goumain — Particulier",
    lcen_host: "Hébergement",
    lcen_host_val: "GitHub Inc. / Microsoft Corporation\n88 Colin P Kelly Jr St\nSan Francisco, CA 94107, USA",
    lcen_contact: "Contact",
    lcen_contact_val: "support@poolgenai.com",
    lcen_cgu_title: "Conditions générales d'utilisation",
    lcen_ai_title: "Intelligence artificielle",
    lcen_ai_val: "Lorsque vous utilisez l'analyse IA, vos données transitent par l'infrastructure technique de l'éditeur (serveur intermédiaire), qui utilise une clé API souscrite par l'éditeur. Aucune conservation ni journalisation du contenu transmis sur ce serveur.",
    lcen_photos_title: "Photos",
    lcen_photos_val: "Ne soumettez que des photos de matériel de mesure ou d'eau du bassin. Sont exclus : personnes identifiables, éléments de localisation du domicile, données personnelles visibles.",
    lcen_gdpr: "Données personnelles",
    lcen_gdpr_val: "Conformément au RGPD et à la loi Informatique et Libertés, vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité de vos données. Pour exercer ces droits, contactez-nous à l'adresse ci-dessus. Vous pouvez également déposer une réclamation auprès de la CNIL : www.cnil.fr",
    lcen_calibration_title: "Amélioration collective des analyses",
    lcen_calibration_val: "Lorsqu'une mesure comporte à la fois une photo de photomètre et une photo de bandelette pour un même paramètre, PoolGenAI peut extraire une donnée de calibration anonyme (couleur mesurée, valeur de référence, type de bandelette identifié) et la partager avec l'ensemble des utilisateurs de l'application, dans le seul but d'améliorer la précision de l'interprétation des bandelettes pour tous. Ces données de calibration ne contiennent ni photo, ni identifiant de compte, ni aucune information permettant de remonter à l'utilisateur d'origine. L'utilisateur peut désactiver cette contribution à tout moment dans les réglages de l'application ; ce refus n'affecte pas l'utilisation normale de PoolGenAI.",
    lcen_photocontrib_title: "Contribution de photos à la base commune de produits",
    lcen_photocontrib_val: "Lorsqu'un utilisateur photographie un produit qui ne dispose pas encore de photo dans la base commune de produits partagée entre utilisateurs, cette photo peut être transmise et stockée pour illustrer la fiche produit correspondante, visible par l'ensemble des utilisateurs. Seule la photo du produit est concernée. Une fois contribuée, la photo ne peut pas être retirée individuellement — aucune information ne relie une photo à son contributeur.",
    photo_warning_title: "Attention avant de photographier",
    photo_warning_body: "Assurez-vous que la photo ne contient pas :\n• de personnes identifiables\n• d'éléments permettant de localiser votre domicile\n• de données personnelles visibles\n\nNous recommandons de désactiver la géolocalisation dans les paramètres de votre appareil photo.",
    photo_warning_confirm: "J'ai compris, continuer",
    ai_clause_title: "Analyse par intelligence artificielle",
    ai_clause_body: "Lorsque vous activez l'analyse IA, vos données (mesures et photos) transitent par l'infrastructure technique de PoolGenAI, qui utilise une clé API souscrite par l'éditeur — vous n'avez aucune clé à fournir. Aucune conservation ni journalisation du contenu transmis sur ce serveur intermédiaire.",
    cgu_update_title: "Conditions mises à jour",
    cgu_update_body: "Les conditions d'utilisation ont été mises à jour (v{version}). Merci de les relire et de les accepter pour continuer.",
    cgu_update_accept: "Lire et accepter",
    cgu_version_label: "CGU version",
    cgu_accepted_on: "Acceptées le",
    cgu_updated_title: "Mise à jour des conditions",
    cgu_updated_body: "Les conditions d'utilisation ont été mises à jour. Merci de les relire et de les accepter pour continuer.",
    cgu_required_title: "Conditions d'utilisation",
    cgu_required_body: "Merci de valider nos conditions d'utilisation pour continuer.",
    cgu_read_full_text: "Lire le texte complet",
    cgu_hide_full_text: "Masquer le texte",
    applied_col: "Appliqué",
    disclaimer_title: "Mentions légales & Conditions d'utilisation",
    disclaimer_cgu: "J'accepte les conditions générales d'utilisation et la politique de confidentialité",
    disclaimer_data: "J'accepte que mes données de traitement (mesures, produits, photos) soient collectées et potentiellement partagées avec des partenaires du secteur piscine/spa à des fins d'amélioration des analyses",
    disclaimer_required: "L'acceptation des CGU est obligatoire pour utiliser PoolGenAI",
    disclaimer_pro: "Les professionnels utilisant PoolGenAI pour des prestations réalisées pour le compte de tiers sont tenus de faire valider aux propriétaires des bassins traités la collecte de données par l'éditeur.",
    revoke_data_consent: "Révoquer le consentement données",
    revoke_data_confirm: "Ton consentement a été révoqué. Tes données ne seront plus partagées.",
    pool_email: "Email rapport PDF",
    pool_email_placeholder: "contact@exemple.com",
    pool_settings_title: "Paramètres du bassin",
    edit_pool: "Modifier le bassin",
    generate_report: "Générer le rapport de ce bassin",
    report_locked: "Rapport PDF réservé à la version Premium",
    report_desc: "Le rapport reprend l'historique des mesures, les conseils donnés et les quantités réellement appliquées pour ce bassin.",
    diag_section: "DIAGNOSTIC IA",
    diag_placeholder: "Décris le problème que tu rencontres avec ton bassin malgré les traitements (ex: eau trouble, chlore qui disparaît, algues persistantes...)",
    diag_submit: "Analyser avec l'IA",
    diag_analyzing: "Analyse en cours...",
    diag_confidence: "Indice de confiance",
    diag_history_title: "Historique diagnostics IA",
    diag_history_date: "Date",
    diag_history_note: "Note",
    diag_history_response: "Réponse IA",
    diag_history_confidence: "Confiance",
    diag_history_delete: "Supprimer",
    diag_history_empty: "Aucun diagnostic enregistré pour le moment.",
    diag_history_locked: "Historique des diagnostics IA réservé à la version Premium",
    diag_history_confirm_delete: "Supprimer ce diagnostic ?",
    update_required_title: "Nouvelle version disponible",
    update_required_desc: "Une nouvelle version de PoolGenAI a été déployée. Mets à jour l'application pour continuer.",
    update_required_btn: "Mettre à jour maintenant",
    update_in_progress_title: "Mise à jour en cours",
    update_in_progress_desc: "Ça ne prend que quelques instants, l'application va se recharger automatiquement.",
    diag_off_topic: "Cette question ne concerne pas le traitement de l'eau de bassin. Je ne peux répondre qu'aux questions liées à la chimie de l'eau, aux produits de traitement et aux équipements de piscine.",
            diag_error: "Analyse impossible",
    import_pdf_btn: "Importer un rapport PDF",
    import_pdf_prefill_title: "Mesure importée depuis PDF",
    import_pdf_analyzing: "Lecture du fichier par l'IA...",
    import_pdf_error: "Impossible de lire ce fichier",
    import_pdf_no_values: "Aucune valeur trouvée dans ce fichier",
    import_pdf_needs_ai: "Import PDF disponible avec l'analyse IA (Réglages → Activer l'analyse IA)",
    import_diag_added_one: "1 diagnostic IA importé depuis ce document.",
    import_diag_added_many: "{n} diagnostics IA importés depuis ce document.",
    suspended_title: "Compte suspendu",
    suspended_desc: "Ton compte a été suspendu et l'accès à l'application n'est plus disponible.",
    suspended_erase_btn: "Effacer mes données",
    suspended_erasing: "Effacement en cours...",
    suspended_erase_confirm: "Cette action supprime définitivement toutes tes données (mesures, produits, historique, diagnostics). Continuer ?",
    legend_title: "Légende des paramètres et valeurs cibles",
    ccl_fcl_tcl_error: "Erreur : FCL + CCL ne peut pas dépasser TCL. Vérifie les valeurs saisies.",
    tcl_forced_to_fcl_info: "TCL ne peut pas être inférieur à FCL — valeur corrigée à {val}. Reclique sur Enregistrer pour confirmer.",
    param_ph_long: "Potentiel Hydrogène", param_fcl_long: "Chlore libre", param_tcl_long: "Chlore total",
    param_ccl_long: "Chlore combiné (chloramines)", param_tac_long: "Titre Alcalimétrique Complet",
    param_cya_long: "Acide cyanurique (stabilisant)", param_th_long: "Titre Hydrotimétrique (dureté)",
    param_phos_long: "Phosphates", param_cu_long: "Cuivre", param_fe_long: "Fer", param_temp_long: "Température de l'eau",
    // Measure modal
    new_measure_title: "Nouvelle mesure",
    edit_measure_title: "Modifier la mesure",
    date_time: "Date et heure",
    photo_hint: "Prends en photo l'écran de ton photomètre avec les valeurs lisibles, ou place ta bandelette imbibée à côté de la légende du tube et photographie les deux ensemble.",
    photo_hint_bandelette: "Bandelette : prends 2 à 3 photos en tournant le tube pour exposer chaque échelle de couleur.",
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
    analyze_locked: "Photo + analyse IA réservées à la version Premium",
    product_ai_hint: "Active l'analyse IA dans les Réglages pour remplir ces champs automatiquement à partir de la photo.",
    product_sync_error: "Échec de la synchronisation des produits — la photo est peut-être trop volumineuse, réessaie avec une photo plus légère.",
    config_sync_error: "Échec de la synchronisation — vérifie ta connexion. ({detail})",
    repair_orphaned_title: "{count} entrée(s) orpheline(s) détectée(s)",
    repair_orphaned_desc: "Des mesures, applications ou produits ne sont rattachés à aucun bassin existant (souvent après un bug de synchro). Elles seront rattachées à ton bassin actif.",
    repair_orphaned_btn: "Réparer maintenant",
    repair_orphaned_confirm: "Rattacher {count} entrée(s) orpheline(s) au bassin actif ?",
    delete_pool_confirm: "Désactiver ce bassin ? Il ne sera plus visible dans l'application, mais son historique est conservé.",
    account_deleted_title: "Compte supprimé",
    account_deleted_desc: "Ce compte a été supprimé et l'accès à l'application n'est plus disponible.",
    account_deleted_request_btn: "Ne pas recommencer avec cette adresse, et demander la récupération ou la suppression de mes données",
    back_to_home: "Revenir à la page d'accueil",
    reactivate_btn: "Recommencer avec cette adresse",
    reactivate_confirm: "Repartir de zéro avec cette adresse ? Tes bassins actuels seront masqués (jamais affichés, mais pas supprimés). Tu devras créer un nouveau bassin.",
    reset_password_hint: "Réinitialiser mon mot de passe",
    data_request_title: "Récupération ou suppression des données",
    data_request_desc: "Choisis l'action souhaitée. Une demande sera envoyée au support, qui te recontactera par email.",
    data_request_option_erase: "Effacer toutes mes données",
    data_request_option_recover: "Récupérer toutes mes données, ne pas les effacer",
    data_request_option_recover_erase: "Récupérer et effacer toutes mes données",
    data_request_submit: "Envoyer la demande",
    data_request_sending: "Envoi en cours...",
    data_request_sent: "Demande envoyée. Le support te recontactera par email.",
    data_request_error: "Échec de l'envoi. Réessaie ou écris directement à support@poolgenai.com.",
    note_optional: "Note (optionnel)",
    note_placeholder: "Eau trouble, fort ensoleillement, baignade prévue...",
    save_measure: "Enregistrer la mesure",
    save: "Enregistrer",
    cancel: "Annuler",
    save_changes: "Enregistrer les modifications",
    // Products
    my_products: "MES PRODUITS",
    products_formula: "Le dosage est calculé selon : {quantité produit} pour faire varier le paramètre de {effet} sur {volume de référence} m³. Ces produits sont propres à ce bassin.",
    products_to_buy: "Mes produits à acheter",
    products_to_buy_empty: "Rien à acheter pour le moment — tous les stocks sont suffisants.",
    generic_products_section: "Produits recommandés manquants",
    generic_products_hint: "D'après le type de traitement de ce bassin, ces produits ne sont pas encore dans ta liste.",
    add_generic_product: "Ajouter",
    generic_product_added: "Ajouté à tes produits",
    reason_low_stock: "Stock bas",
    reason_insufficient_plan: "Insuffisant pour le plan en cours",
    apply_product_manual: "Appliquer un produit",
    reason_manual_maintenance: "Entretien manuel",
    products_locked: "Fonctionnalité réservée à la version Premium",
    stock_not_managed: "La gestion du stock n'est pas activée pour ce bassin. Active-la dans Réglages pour gérer les quantités et voir les consommations.",
    activate_in_settings: "Activer dans Réglages →",
    delete_all_products: "Supprimer tous les produits de ce bassin",
    stock_label: "Stock :",
    stock_remaining: "restant",
    // Product modal
    edit_product: "Modifier le produit",
    new_product: "Nouveau produit",
    product_photo: "Photo du produit (étiquette)",
    product_photo_hint: "Prends une photo par élément — face du produit, code-barre, notice indiquant dose/effet/volume — pour une reconnaissance plus fiable. Une seule photo suffit si tout est visible dessus.",
    common_product_candidate_title: "Produit proche trouvé dans la base commune :",
    common_product_same: "Oui, même produit",
    common_product_different: "Non, produit différent",
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
    stock_locked: "Gestion du stock réservée à la version Premium",
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
    // Wizard traitement
    wizard_title: "Plan de traitement",
    wizard_step: "Étape",
    wizard_of: "sur",
    wizard_now: "Maintenant",
    wizard_in: "Dans",
    wizard_at: "à",
    wizard_scheduled: "Prévu",
    wizard_earliest: "Au plus tôt",
    chlore_timing_tip: "Pour une meilleure efficacité, applique de préférence le soir, après la dernière baignade et au coucher du soleil.",
    wizard_done: "C'est fait",
    wizard_skip: "Passer cette étape",
    wizard_anticipate: "Appliquer maintenant",
    wizard_finish: "Terminer le plan",
    wizard_reminder: "Te rappeler la prochaine étape ?",
    wizard_reminder_yes: "Oui, me rappeler",
    wizard_reminder_no: "Non merci",
    wizard_next_step: "Prochaine étape",
    wizard_start: "Démarrer le plan",
    plan_in_progress: "Plan de traitement en cours",
    wizard_apply_time: "Heure d'application",
    wizard_edit_prev: "Modifier l'étape précédente",
    wizard_resume: "Reprendre le plan",
    wizard_completed: "Plan de traitement terminé ✓",
    wizard_partial: "Plan en cours",
    countdown_done: "C'est l'heure !",
    treatment_at: "Traitement appliqué à",
    edit_treatment_section_title: "Traitement appliqué",
    treatment_skipped: "Étape passée",
    // Settings
    settings_title: "Réglages",
    my_pools: "Mes bassins",
    pool_name: "Nom du bassin",
    location: "Localisation",
    volume: "Volume (m³)",
    treatment_type: "Type de traitement",
    measure_device_label: "Méthode de mesure",
    measure_device_photometre: "Photomètre uniquement",
    measure_device_bandelette: "Bandelette uniquement",
    measure_device_both: "Les deux",
    strip_model_label: "Modèle de bandelette utilisé",
    strip_model_none: "Non précisé",
    filtration_type: "Type de filtration",
    manage_stock_label: "Gestion du stock",
    manage_stock_desc: "Suit la consommation des produits et l\'affiche dans le rapport.",
    manage_stock_locked: "Disponible en version Premium",
    api_key_label: "Clé API Anthropic ou URL du proxy Cloudflare Worker",
    provider_label: "Provider",
    api_key_placeholder: "sk-ant-... ou https://mon-proxy.workers.dev",
    api_key_desc: "Ta clé est stockée localement. Pour Anthropic, saisis une clé sk-ant-... ou l'URL de ton proxy Cloudflare Worker (recommandé).",
    premium_section: "VERSION",
    premium_label: "Version Premium",
    premium_test: "Abonnement mensuel ou annuel",
    premium_desc: "En version gratuite : 1 bassin, aucun invité, 1 mesure par jour. En Premium : jusqu'à 3 bassins, 2 invités par bassin, mesures sans limite, photos sur mesures et produits.",
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
    cl_libre_col: "FCL",
    cl_total_col: "TCL",
    tac_col: "TAC",
    cya_col: "CYA",
    temp_col: "TEMP.",
    product_col: "Produit",
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
    paywall_title: "Passer à la version Premium",
    paywall_desc: "Mesures sans limite · Analyse IA des bandelettes · Rapport PDF · Gestion du stock",
    paywall_context_measure_limit: "Tu as atteint la limite d'1 mesure gratuite par jour.",
    paywall_context_start_plan: "Le suivi de traitement pas à pas est réservé à la version Premium.",
    paywall_context_products: "La gestion des produits et du stock est réservée à la version Premium.",
    pool_limit_reached: "Limite de 3 bassins atteinte en version Premium.",
    paywall_context_report: "Le rapport PDF est réservé à la version Premium.",
    paywall_context_photos: "L'analyse photo par IA est réservée à la version Premium.",
    paywall_context_stock: "La gestion du stock est réservée à la version Premium.",
    paywall_btn: "Activer la version Premium",
    paywall_close: "Plus tard",
    // Pool
    add_pool_title: "Nouveau bassin",
    first_pool_title: "Bienvenue sur PoolGenAI",
    first_pool_intro: "Configure ton premier bassin pour commencer à suivre sa chimie de l'eau.",
    edit_pool_title: "Modifier le bassin",
    pool_name_placeholder: "Ma piscine",
    pool_location_placeholder: "Rechercher une ville...",
    location_use_gps: "Me géolocaliser",
    location_searching: "Recherche...",
    location_search_error: "Recherche indisponible, réessaie",
    location_no_results: "Aucune ville trouvée",
    location_gps_error: "Géolocalisation indisponible",
    pool_volume_placeholder: "72",
    save_pool: "Enregistrer",
    // Misc
    loading: "Chargement...",
    ai_timer_hint: "L'analyse peut prendre jusqu'à 30 secondes.",
    ai_reliability: "Fiabilité de l'analyse",
    ai_no_values: "Aucune valeur lisible sur cette photo. Vérifie la qualité et l'orientation de l'image.",
    error_analyze: "Analyse impossible",
    verify_connection: "Vérifie ta connexion et les photos.",
    free_version: "Gratuit",
    param_ph: "pH",
    param_fcl: "Chlore libre (mg/L)",
    axis_legend_u: "ᴜ échelle unités (pH, chlore) — gauche",
    action_ph_minus: "Baisse le pH",
        photos_section: "Photos des mesures",
    pool_photos_label: "Photos du bassin (optionnel)",
    pool_photo_locked: "Photos du bassin réservées à la version Premium",
    sign_in: "Connexion",
    account_section: "Mon compte",
    confirm_password: "Confirmer le mot de passe",
    pwd_min6: "6 caractères minimum",
    error_pwd_mismatch: "Les mots de passe ne correspondent pas.",
    error_email_required: "Email invalide.",
    account_created: "Compte créé !",
    verify_email_notice: "Un email de confirmation a été envoyé à ton adresse. Clique sur le lien pour activer ton compte.",
    verify_gate_title: "Vérifie ton adresse email",
    verify_gate_desc: "Pour accéder à l'application, confirme ton adresse en cliquant sur le lien reçu par email",
    verify_gate_check_btn: "J'ai confirmé — Continuer",
    verify_link_checking: "Vérification de ton email en cours…",
    verify_link_verified_title: "Email vérifié !",
    verify_link_verified_desc: "Ton adresse email est confirmée. Tu peux continuer.",
    verify_link_already_title: "Déjà vérifié",
    verify_link_already_desc: "Cette adresse email était déjà confirmée.",
    verify_link_expired_title: "Lien expiré",
    verify_link_expired_desc: "Ce lien de vérification a expiré. Redemande un nouvel email depuis l'app.",
    verify_link_invalid_title: "Lien invalide",
    verify_link_invalid_desc: "Ce lien de vérification n'est pas valide. Redemande un nouvel email depuis l'app.",
    verify_link_error_title: "Erreur",
    verify_link_error_desc: "Impossible de vérifier ton email pour le moment. Réessaie plus tard.",
    verify_link_continue_btn: "Continuer vers l'app",
    merge_link_pending_title: "Confirmer la fusion ?",
    merge_link_pending_desc: "Un code-barre a été détecté pour une fiche produit déjà présente dans la base commune, sans code-barre associé. Confirme pour relier les deux.",
    merge_link_confirm_btn: "Confirmer la fusion",
    merge_link_cancel_btn: "Annuler",
    merge_link_confirming: "Fusion en cours…",
    merge_link_merged_title: "Fusion confirmée",
    merge_link_merged_desc: "Le code-barre a été relié à la fiche produit existante.",
    merge_link_already_merged_title: "Déjà fusionné",
    merge_link_already_merged_desc: "Cette fusion avait déjà été confirmée.",
    merge_link_expired_title: "Lien expiré",
    merge_link_expired_desc: "Ce lien de confirmation a expiré (validité 7 jours).",
    merge_link_invalid_title: "Lien invalide",
    merge_link_invalid_desc: "Ce lien de confirmation n'est pas valide.",
    merge_link_error_title: "Erreur",
    merge_link_error_desc: "Impossible de confirmer la fusion pour le moment. Réessaie plus tard.",
    verify_gate_checking: "Vérification...",
    verify_gate_still_unverified: "Ton email n'est pas encore confirmé. Vérifie ta boîte de réception (et les spams).",
    verify_gate_resend_btn: "Renvoyer l'email de confirmation",
    verify_gate_resend_sent: "Email renvoyé — pense à vérifier tes spams.",
    verify_gate_resend_error: "Impossible d'envoyer l'email pour le moment. Réessaie plus tard.",
    verify_gate_signout: "Se déconnecter",
    verify_email_send_failed: "L'email de confirmation n'a pas pu être envoyé. Réessaie ci-dessous.",
    verify_email_retry_btn: "Renvoyer l'email",
    verify_email_resent: "Email renvoyé ✓",
    account_created_sub: "Bienvenue sur PoolGenAI. Tu peux maintenant utiliser l'app.",
    start_app: "Démarrer l'app",
    sign_out: "Se déconnecter",
    delete_account: "Supprimer mon compte",
    delete_account_confirm: "Supprimer ton compte ? Tu ne pourras plus te connecter. Tes données sont conservées — tu pourras demander leur récupération ou leur effacement définitif.",
    account_delete_flag_error: "Échec de la suppression du compte. Réessaie.",
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
    user_not_found: "Aucun compte avec cet email. Si tu penses que c'est une erreur, contacte support@poolgenai.com",
    account_disabled: "Ce compte a été désactivé. Contacte support@poolgenai.com pour plus d'informations.",
    login_failed_unified: "Email ou mot de passe incorrect.",
    create_account_hint: "Pas encore de compte ? Créer un compte",
    email_in_use: "Cet email est déjà utilisé.",
    weak_password: "Mot de passe trop court (6 caractères min).",
    firebase_not_configured: "⚠️ Firebase non configuré — fonctionnement hors-ligne uniquement.",
    note_ph_minus: "Vérifier le pH avant chaque ajout. Max 1 kg/100 m³/jour, ou espacer de 2h.",
    note_ph_plus: "Répartir sur tout le bassin, filtration en marche.",
    note_chlore_choc: "À verser le soir, soleil couché. Ne stabilise pas (n'augmente pas le CYA).",
    note_galets: "Augmente le CYA à chaque utilisation. À éviter si CYA déjà > 50 mg/L.",
    prod_name_ph_minus: "pH moins (acide / Reva Minus type)",
    prod_name_ph_plus: "pH plus",
    prod_name_chlore_choc: "Chlore choc non stabilisé (type Chloryte)",
    prod_name_galets: "Galets chlore stabilisé 5-en-1 (type Chlorilong)",
    packaging_type: "Conditionnement",
    packaging_vrac: "Vrac / granulés",
    packaging_galets: "Galets / sticks",
    unit_weight_label: "Poids d'une unité (g)",
    maintenance_ratio_label: "Ratio d'entretien fabricant",
    maintenance_units_label: "Nb unités",
    maintenance_volume_label: "Pour m³",
    maintenance_days_label: "Tous les X jours",
    unit_galets: "galets",
    unit_units: "unités",
    quantity_unit_mode_kg: "kg",
    quantity_unit_mode_units: "unités",
    maintenance_card_title: "Entretien continu",
    maintenance_card_text: "{units} galet(s) / {volume} m³, tous les {days} jours",
    no_stock_category_hint: "Aucun produit en stock dans cette catégorie — saisie libre",
    no_stock_generic_hint: "Aucun produit en stock dans cette catégorie — produit générique proposé",
    prod_name_tac_plus: "Produit TAC+ (bicarbonate de sodium)",
    prod_name_calcium: "Chlorure de calcium (dureté +)",
    prod_name_anti_phos: "Anti-phosphates (PHOSfree type)",
    prod_name_sequestrant: "Séquestrant métaux (Metal Free type)",
    prod_name_floculant: "Floculant clarifiant liquide (type Reva-Flock)",
    prod_name_sel: "Sel de piscine (NaCl pur ≥ 99%, sac 25 kg)",
    action_ph_plus: "Monte le pH",
    action_chlore: "Chlore non stabilisé (choc)",
    action_chlore_stabilise: "Chlore stabilisé (CYA +)",
    action_tac_plus: "Monte le TAC",
    action_tac_minus: "Baisse le TAC",
    action_brome: "Brome",
    action_o2: "Oxygène actif",
    action_sel: "Sel (salinité)",
    axis_legend_d: "ᴅ échelle dizaines (TAC, CYA, température) — droite",
    reco_tac_low: "TAC trop bas ({val} mg/L)",
    reco_tac_high: "TAC trop haut ({val} mg/L)",
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
    reco_recheck_later: "Recontrôle recommandé dans quelques heures",
    reco_cl_shock_text: "ce soir (choc renforcé)",
    reco_note_tac: "Un TAC bas rend le pH instable.",
    reco_note_tac_minus: "Même acide que le pH-, mais effet à calibrer séparément sur le TAC. Corriger avant le pH, par petites doses.",
    reco_no_product_note: "Aucun produit configuré pour cette action. Ajoute-en un dans l'onglet Produits.",
    product_empty_delete_confirm: "{name} est à 0% de stock. Le supprimer de la liste ?",
    product_missing_values: "Renseigne ces champs avant d'enregistrer : {fields}.",
    reco_note_ph_before_tac: "pH corrigé avant le TAC : à ce pH le chlore serait peu efficace, et le TAC n'est pas assez bas pour être urgent.",
    reco_order_intro_default: "Cet ordre suit la logique de traitement : les paramètres qui empêchent l'efficacité des autres sont corrigés en premier.",
    reco_order_reason_metals: "Le séquestrant passe avant tout désinfectant car des métaux dissous ont été détectés — sinon le chlore les précipite et tache le bassin.",
    reco_order_reason_contamination: "Le désinfectant passe en priorité car le chlore combiné est élevé ({combined} mg/L) : il faut viser {target} mg/L de chlore libre pour atteindre le point de rupture et détruire les chloramines.",
    reco_order_reason_cya_block: "Le choc chlore est remplacé par une dilution car le stabilisant (CYA) est trop élevé pour qu'un choc soit efficace.",
    reco_order_reason_ph_before_tac: "Le pH passe avant le TAC car l'écart est trop important pour attendre.",
    reco_order_reason_ph_chlore_delay: "Un délai de 6h est respecté entre la correction du pH et le choc chlore pour éviter toute précipitation.",
    reco_note_combined: "Chlore combiné = chloramines, signe d'une désinfection insuffisante. Verser le soir, filtration en continu.",
    reco_note_sel: "Utiliser du sel spécial piscine (NaCl pur ≥ 99%). Dissoudre avant l'ajout ou verser directement près du skimmer, filtration en marche 24h.",
    reco_note_o2: "Ne pas mélanger avec le chlore. Filtration en marche pendant 4h.",
    prod_name_o2_liquide: "Oxygène actif liquide (peroxyde d'hydrogène)",
    note_o2_liquide: "Ne pas mélanger avec le chlore. Verser devant les buses de refoulement, filtration en marche.",
    reco_note_brome: "Verser loin des arrivées d'eau, filtration en marche.",
    reco_note_cya: "Aucun produit ne fait baisser le CYA chimiquement, seule la dilution fonctionne. Éviter le chlore stabilisé tant que le CYA est haut.",
    reco_cya_block_shock: "Stabilisant trop élevé pour un choc efficace ({val} mg/L)",
    reco_note_cya_block_shock: "Au-delà de 75 mg/L de CYA, un choc chlore classique n'atteint plus le point de rupture. Seule la dilution (renouvellement d'eau) fonctionne — pas de chlore choc tant que ce n'est pas fait.",
    reco_fallback_tac: "Produit TAC+ (bicarbonate de sodium)",
    reco_fallback_tac_minus: "Produit TAC- (acide chlorhydrique ou bisulfate de sodium)",
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
    paywall_perk7: "Jusqu'à 3 bassins, 2 invités par bassin",
    paywall_test_note: "Paiement sécurisé via Stripe. Résiliable à tout moment.",
    paywall_price_monthly: "2,99 € / mois",
    paywall_price_yearly: "24,99 € / an",
    paywall_price_yearly_hint: "ou 24,99 € / an",
    paywall_plan_monthly: "Mensuel",
    paywall_plan_yearly: "Annuel",
    paywall_plan_yearly_badge: "-30%",
    manage_subscription_btn: "Gérer mon abonnement",
    checkout_error: "Impossible de démarrer le paiement. Réessaie.",
    portal_error: "Impossible d'ouvrir la gestion de l'abonnement. Réessaie.",
    stripe_activation_checking: "Confirmation de ton paiement en cours…",
    stripe_activation_delay_title: "Ça prend plus de temps que prévu",
    stripe_activation_delay_desc: "Ton paiement a été reçu, mais l'activation tarde un peu. Réessaie de recharger l'app dans une minute.",
    stripe_activation_continue_btn: "Continuer",
    premium_reveal_title: "Premium activé",
    premium_reveal_sub: "Jusqu'à 3 bassins, 2 invités par bassin, mesures sans limite",
    premium_downgrade_title: "Retour à la version gratuite",
    premium_downgrade_sub: "Les fonctionnalités Premium sont désormais désactivées",
    premium_downgrade_confirm_title: "Désactiver la version Premium ?",
    premium_downgrade_confirm_desc: "Tu perdras l'accès à :",
    premium_downgrade_confirm_btn: "Désactiver la version Premium",
    premium_downgrade_cancel_btn: "Annuler et continuer Premium",
    onboarding_step1_title: "Bienvenue sur PoolGenAI",
    onboarding_step1_text: "Suis la chimie de ta piscine facilement : mesures, dosages, plan de traitement personnalisé.",
    onboarding_step2_title: "Une photo suffit",
    onboarding_step2_text: "Prends en photo ta bandelette ou l'écran de ton photomètre. L'IA lit les couleurs et remplit les champs à ta place — plus besoin de comparer à l'œil.",
    onboarding_step3_title: "Des résultats clairs",
    onboarding_step3_text: "Chaque paramètre est comparé à sa cible : pH, chlore, TAC, stabilisant... Un code couleur simple te dit en un coup d'œil ce qui va, et ce qui doit être corrigé.",
    onboarding_step4_title: "Un plan priorisé",
    onboarding_step4_text: "L'app détermine l'ordre des traitements à appliquer et les délais à respecter entre chaque étape, pour ne pas gâcher un traitement en enchaînant trop vite.",
    onboarding_step5_title: "Applique en confiance",
    onboarding_step5_text: "La dose exacte est calculée pour le volume de ton bassin et le produit que tu utilises. Coche l'étape une fois faite, l'app passe à la suivante.",
    onboarding_step6_title: "Suis l'évolution",
    onboarding_step6_text: "Visualise tes mesures dans le temps pour repérer les tendances et anticiper les dérives avant qu'elles ne deviennent un problème.",
    onboarding_step7_title: "Gère ton stock",
    onboarding_step7_text: "Suis les quantités restantes de chaque produit et reçois une alerte avant la rupture.\n\nAjoute ta première mesure quand tu veux. Jusqu'à 3 bassins, rapport PDF et plus : découvre Premium plus tard dans Réglages.",
    onboarding_step3_legend_bad: "Trop haut ou trop bas",
    onboarding_next: "Suivant",
    onboarding_skip: "Passer",
    onboarding_start: "C'est parti",
    help_section: "Aide",
    settings_replay_onboarding: "Revoir la présentation",
    context_switch_premium_title: "Bassin Premium",
    context_switch_premium_sub: "Ce bassin profite des fonctionnalités Premium de son propriétaire",
    context_switch_free_title: "Retour à ton bassin",
    context_switch_free_sub: "Tu es de retour sur ton propre bassin",
    report_print_btn: "Imprimer / Enregistrer en PDF",
    share_report: "Partager le rapport",
    report_email_subject: "Rapport PoolGenAI — {pool}",
    report_email_greeting: "Bonjour,",
    report_email_body: "Veuillez trouver ci-dessous les instructions pour obtenir le rapport PDF de la piscine \"{pool}\" :",
    report_email_step1: "1. Ouvrez l'application PoolGenAI",
    report_email_step2: "2. Onglet Historique → Générer le rapport",
    report_email_step3: "3. Cliquez sur \"Imprimer / Enregistrer en PDF\"",
    report_email_sign: "Cordialement,",
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
    unlimited_version: "Premium",
    active_pool: "Bassin actif",
    pool_volume: "Volume du bassin (m³)",
    treatment_params: "Paramètres :",
    treatment_desc: "Le traitement détermine quels paramètres sont mesurés et les cibles recommandées. Le volume est utilisé pour calculer les doses de produits.",
    subscription: "Abonnement",
    unlimited_active: "Mode Premium actif",
    free_mode: "Version gratuite",
    api_section: "ANALYSE IA",
    ai_toggle_label: "Activer l'analyse IA",
    ai_toggle_desc: "Permet d'analyser les photos de mesure par intelligence artificielle.",
    calibration_toggle_label: "Contribuer à l'amélioration collective",
    calibration_toggle_desc: "Partage des données de calibration anonymes (couleur mesurée, valeur de référence) pour améliorer la lecture des bandelettes pour tous. Aucune photo ni identifiant transmis.",
    ai_password_title: "Accès configuration IA",
    ai_password_prompt: "Saisir le mot de passe pour activer l'analyse IA",
    ai_password_error: "Mot de passe incorrect",
    ai_configure_btn: "Configurer la clé API",
    ai_config_title: "Configuration IA",
    ai_config_back: "Retour aux réglages",
    ai_locked_settings: "Analyse IA réservée à la version Premium",
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
    // v1.60.0 — Section Délégation (regroupe utilisateurs secondaires +
    // bassins où JE suis invité)
    delegation_section_title: "Délégation",
    linked_pools_title: "Bassins où je suis invité",
    linked_pools_empty: "Tu n'as accès à aucun bassin en tant qu'invité.",
    request_revocation_button: "Demander la révocation",
    request_revocation_confirm: "Demander la révocation de ton accès au bassin \"{pool}\" ? {pseudo} recevra un email pour confirmer.",
    request_revocation_sent: "Demande envoyée. Tu recevras un email une fois la révocation confirmée.",
    request_revocation_error: "Échec de l'envoi de la demande.",
    // v1.55.0 — Utilisateurs secondaires (brique 3)
    secondary_section_title: "Utilisateurs secondaires",
    secondary_section_intro: "Invite jusqu'à 2 personnes à accéder à un même bassin (réservé à la version Premium).",
    secondary_invite_requires_premium: "Les invitations sont réservées à la version Premium.",
    secondary_invite_pool_full: "Ce bassin a déjà 2 invités, c'est le maximum.",
    secondary_invite_button: "Inviter quelqu'un",
    secondary_invite_email_label: "Email de la personne à inviter",
    secondary_invite_pool_label: "Bassin concerné",
    secondary_invite_send: "Envoyer l'invitation",
    secondary_invite_sent: "Invitation envoyée.",
    secondary_invite_error: "Échec de l'invitation",
    secondary_active_title: "Accès actifs",
    secondary_active_empty: "Aucun accès actif.",
    secondary_pool_label: "Bassin : {pool}",
    secondary_revoke_button: "Révoquer",
    secondary_revoke_confirm: "Révoquer l'accès de {email} ?",
    secondary_revoke_error: "Échec de la révocation",
    secondary_pending_title: "Invitations en attente",
    secondary_pending_empty: "Aucune invitation en attente.",
    secondary_pending_expires: "Expire le {date}",
    secondary_pending_expired: "Expirée",
    secondary_cancel_button: "Annuler",
    secondary_cancel_confirm: "Annuler l'invitation envoyée à {email} ?",
    secondary_cancel_error: "Échec de l'annulation",
    pseudo_label: "Ton pseudo",
    pseudo_placeholder: "Visible par les personnes qui t'invitent",
    pseudo_save: "Enregistrer",
    pseudo_saved: "Pseudo enregistré.",
    pseudo_invalid: "2 à 24 caractères (lettres, chiffres, espaces, tirets).",
    pseudo_taken_suggestion: "Déjà pris. Essaie : {suggestion}",
    pseudo_error: "Échec de l'enregistrement du pseudo",
    context_title: "Bassin affiché",
    context_own: "Mes bassins",
    secondary_pool_unavailable_title: "Bassin introuvable",
    secondary_pool_unavailable_desc: "Ce bassin est introuvable. Il a peut-être été supprimé, ou le chargement rencontre un problème réseau. Réessaie plus tard.",
    secondary_pool_revoked_desc: "Ton accès à ce bassin a été révoqué par son propriétaire.",
    secondary_invited_label: "{pool} - Invité",
    context_loading: "Chargement du bassin…",
    context_secondary_option: "Bassin de {pseudo}",
    banner_secondary: "{pool} — compte de {pseudo}",
    invite_response_title: "Invitation",
    invite_response_text: "{pseudo} t'invite à accéder au bassin {pool}.",
    invite_response_accept: "Accepter",
    invite_response_decline: "Refuser",
    invite_response_accepted: "Invitation acceptée. Retrouve ce bassin dans Réglages.",
    invite_response_declined: "Invitation refusée.",
    invite_response_expired: "Cette invitation a expiré.",
    invite_response_limit_reached: "Limite de 2 bassins invités atteinte en version gratuite — passe en Premium pour en accepter davantage.",
    invite_response_requires_premium: "Ce compte n'est plus en version Premium, l'invitation ne peut pas être acceptée.",
    invite_response_invalid: "Invitation invalide ou déjà utilisée.",
    invite_response_mismatch: "Cette invitation ne correspond pas à ton compte connecté.",
    invite_response_error: "Erreur lors du traitement de l'invitation.",
    invite_response_checking: "Vérification de l'invitation…",
    // v1.60.0 — Confirmation de révocation (côté propriétaire, miroir invite_response_*)
    revocation_response_title: "Demande de révocation",
    revocation_response_text: "{pseudo} a demandé la révocation de son invitation sur le bassin {pool}.",
    revocation_response_accept: "Accepter la demande de révocation",
    revocation_response_done: "Révocation effectuée.",
    revocation_response_invalid: "Cette demande n'existe plus ou a déjà été traitée.",
    revocation_response_expired: "Cette demande de révocation a expiré.",
    revocation_response_mismatch: "Cette demande ne concerne pas ton compte connecté.",
    revocation_response_error: "Erreur lors du traitement de la demande.",
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
    daily_limit: "Daily limit reached — go Premium",
    apply_advice: "Apply these recommendations",
    apply_advice_sub: "Select the advice to apply then enter the actual quantities.",
    advice_applied: "Recommendations applied",
    advice_partial: "partially applied",
    adjust: "Adjust",
    ai_analysis: "AI ANALYSIS",
    ai_analyze_btn: "Analyze with AI",
    ai_locked: "Feature reserved for Premium",
    ai_analyzing: "Analyzing…",
    ai_api_missing: "Enter your API key in Settings to enable AI analysis.",
    follow_order: "Follow the steps in order: each treatment changes water balance and may skew the next if not given time to work.",
    in_range: "On target",
    too_high: "Too high",
    too_low: "Too low",
    target: "target",
    evolution: "Evolution",
    show_values: "Show values on chart",
    show_all_params: "Show parameters",
    hide_all_params: "Hide parameters",
    journal: "Log",
    no_history: "No history yet",
    no_history_sub: "Your readings will appear here over time.",
    report: "Report",
    time_col: "Time",
    advised_col: "Advised",
    ccl_col: "CCL",
    hard_col: "TH",
    phos_col: "Phos.",
    copper_col: "Copper",
    iron_col: "Iron",
    param_ccl: "Combined chlorine (CCL)",
    param_hard: "Hardness (TH)",
    param_phos: "Phosphates",
    param_copper: "Copper",
    param_iron: "Iron",
    reco_hard_low: "Hardness too low ({val} mg/L)",
    reco_hard_high: "Hardness too high ({val} mg/L)",
    reco_phos_high: "Phosphates too high ({val} µg/L)",
    reco_copper_high: "Copper too high ({val} mg/L)",
    reco_iron_high: "Iron too high ({val} mg/L)",
    reco_fallback_hard: "Calcium chloride",
    reco_fallback_phos: "Anti-phosphates",
    reco_fallback_sequestrant: "Metal sequestrant",
    note_tac_plus: "Add gradually, filtration running. Wait 6h before next treatment.",
    note_calcium: "Dilute before adding. Do not mix with other products. Filtration running.",
    note_anti_phos: "Pour in front of return jet, filtration running 24h.",
    note_sequestrant: "Copper/iron treatment. Pour around pool perimeter, filtration running.",
    note_floculant: "One-off treatment for cloudy water, not tracked automatically by the app. Pour in front of the return jets, filtration running, then stop for 24h to let it settle.",
    action_hard_plus: "Increase hardness (TH)",
    action_phos_minus: "Reduce phosphates",
    action_sequestrant: "Metal sequestrant (copper/iron)",
    action_floculant: "Flocculant / clarifier",
    action_outil_mesure: "Measuring tool (test strips, etc.)",
    legal_notices: "Legal notices",
    lcen_title: "Legal notices",
    lcen_editor: "Publisher",
    lcen_editor_val: "Arnaud Goumain — Private individual",
    lcen_host: "Hosting",
    lcen_host_val: "GitHub Inc. / Microsoft Corporation\n88 Colin P Kelly Jr St\nSan Francisco, CA 94107, USA",
    lcen_contact: "Contact",
    lcen_contact_val: "support@poolgenai.com",
    lcen_cgu_title: "Terms of use",
    lcen_ai_title: "Artificial intelligence",
    lcen_ai_val: "When you use AI analysis, your data goes through the publisher's technical infrastructure (intermediary server), which uses an API key subscribed by the publisher. No retention or logging of transmitted content on this server.",
    lcen_photos_title: "Photos",
    lcen_photos_val: "Only submit photos of measuring equipment or pool water. Excluded: identifiable persons, home location elements, visible personal data.",
    lcen_gdpr: "Personal data",
    lcen_gdpr_val: "Under GDPR and applicable data protection law, you have the right to access, rectify, erase and port your data. To exercise these rights, contact us at the address above. You may also file a complaint with your national data protection authority.",
    lcen_calibration_title: "Collective improvement of photo analysis",
    lcen_calibration_val: "When a measurement includes both a photometer photo and a test strip photo for the same parameter, PoolGenAI may extract an anonymous calibration data point (measured colour, reference value, identified test strip type) and share it with all users of the application, solely to improve the accuracy of test strip interpretation for everyone. This calibration data contains no photo, no account identifier, and no information that could identify the original user. Users can disable this contribution at any time in the application settings; declining does not affect normal use of PoolGenAI.",
    lcen_photocontrib_title: "Photo contribution to the shared product database",
    lcen_photocontrib_val: "When a user photographs a product that does not yet have a photo in the shared product database, that photo may be transmitted and stored to illustrate the corresponding product entry, visible to all users. Only the product photo itself is concerned. Once contributed, a photo cannot be individually withdrawn — no information links a photo to its contributor.",
    photo_warning_title: "Warning before taking photos",
    photo_warning_body: "Make sure the photo does not contain:\n• identifiable persons\n• elements that could locate your home\n• visible personal data\n\nWe recommend disabling geotagging in your camera settings.",
    photo_warning_confirm: "I understand, continue",
    ai_clause_title: "AI analysis",
    ai_clause_body: "When you enable AI analysis, your data (measurements and photos) goes through PoolGenAI's technical infrastructure, which uses an API key subscribed by the publisher — you never need to provide a key. No retention or logging of transmitted content on this intermediary server.",
    cgu_update_title: "Terms updated",
    cgu_update_body: "The terms of use have been updated (v{version}). Please read and accept them to continue.",
    cgu_update_accept: "Read and accept",
    cgu_version_label: "Terms version",
    cgu_accepted_on: "Accepted on",
    cgu_updated_title: "Terms updated",
    cgu_updated_body: "The terms of use have been updated. Please read and accept them to continue.",
    cgu_required_title: "Terms of use",
    cgu_required_body: "Please accept our terms of use to continue.",
    cgu_read_full_text: "Read the full text",
    cgu_hide_full_text: "Hide text",
    applied_col: "Applied",
    disclaimer_title: "Legal Notice & Terms of Use",
    disclaimer_cgu: "I accept the terms of use and privacy policy",
    disclaimer_data: "I agree that my treatment data (measurements, products, photos) may be collected and potentially shared with pool/spa industry partners for analysis improvement purposes",
    disclaimer_required: "Accepting the Terms of Use is required to use PoolGenAI",
    disclaimer_pro: "Professionals using PoolGenAI for services performed on behalf of third parties must obtain the pool owners' consent for data collection by the publisher.",
    revoke_data_consent: "Revoke data consent",
    revoke_data_confirm: "Your consent has been revoked. Your data will no longer be shared.",
    pool_email: "PDF report email",
    pool_email_placeholder: "contact@example.com",
    pool_settings_title: "Pool settings",
    edit_pool: "Edit pool",
    generate_report: "Generate pool report",
    report_locked: "PDF report reserved for Premium",
    report_desc: "The report includes the reading history, advice given and quantities actually applied for this pool.",
    diag_section: "AI DIAGNOSTIC",
    diag_placeholder: "Describe the problem you're experiencing with your pool despite treatments (e.g. cloudy water, chlorine disappearing, persistent algae...)",
    diag_submit: "Analyse with AI",
    diag_analyzing: "Analysing...",
    diag_confidence: "Confidence level",
    diag_history_title: "AI diagnostics history",
    diag_history_date: "Date",
    diag_history_note: "Note",
    diag_history_response: "AI response",
    diag_history_confidence: "Confidence",
    diag_history_delete: "Delete",
    diag_history_empty: "No diagnostic saved yet.",
    diag_history_locked: "AI diagnostics history reserved for Premium",
    diag_history_confirm_delete: "Delete this diagnostic?",
    update_required_title: "New version available",
    update_required_desc: "A new version of PoolGenAI has been released. Update the app to continue.",
    update_required_btn: "Update now",
    update_in_progress_title: "Update in progress",
    update_in_progress_desc: "This only takes a moment, the app will reload automatically.",
    diag_off_topic: "This question is not related to pool water treatment. I can only answer questions about water chemistry, treatment products and pool equipment.",
            diag_error: "Analysis failed",
    import_pdf_btn: "Import PDF report",
    import_pdf_prefill_title: "Reading imported from PDF",
    import_pdf_analyzing: "AI is reading the file...",
    import_pdf_error: "Unable to read this file",
    import_pdf_no_values: "No values found in this file",
    import_pdf_needs_ai: "PDF import available with AI analysis (Settings → Enable AI analysis)",
    import_diag_added_one: "1 AI diagnostic imported from this document.",
    import_diag_added_many: "{n} AI diagnostics imported from this document.",
    suspended_title: "Account suspended",
    suspended_desc: "Your account has been suspended and access to the app is no longer available.",
    suspended_erase_btn: "Erase my data",
    suspended_erasing: "Erasing...",
    suspended_erase_confirm: "This permanently deletes all your data (readings, products, history, diagnostics). Continue?",
    legend_title: "Parameters legend and target values",
    ccl_fcl_tcl_error: "Error: FCL + CCL cannot exceed TCL. Check the entered values.",
    tcl_forced_to_fcl_info: "TCL cannot be lower than FCL — value corrected to {val}. Tap Save again to confirm.",
    param_ph_long: "Hydrogen Potential", param_fcl_long: "Free chlorine", param_tcl_long: "Total chlorine",
    param_ccl_long: "Combined chlorine (chloramines)", param_tac_long: "Total Alkalinity",
    param_cya_long: "Cyanuric acid (stabiliser)", param_th_long: "Total Hardness",
    param_phos_long: "Phosphates", param_cu_long: "Copper", param_fe_long: "Iron", param_temp_long: "Water temperature",
    new_measure_title: "New reading",
    edit_measure_title: "Edit reading",
    date_time: "Date and time",
    photo_hint: "Take a photo of your photometer screen with readable values, or place your soaked test strip next to the tube legend and photograph both together.",
    photo_hint_bandelette: "Test strip: take 2-3 photos while rotating the tube to expose every colour scale.",
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
    analyze_locked: "Photo + AI analysis reserved for Premium",
    product_ai_hint: "Enable AI analysis in Settings to auto-fill these fields from the photo.",
    product_sync_error: "Product sync failed — the photo may be too large, try again with a lighter photo.",
    config_sync_error: "Sync failed — check your connection. ({detail})",
    repair_orphaned_title: "{count} orphaned entrie(s) detected",
    repair_orphaned_desc: "Some measures, treatments or products aren't linked to any existing pool (often after a sync bug). They'll be reattached to your active pool.",
    repair_orphaned_btn: "Repair now",
    repair_orphaned_confirm: "Reattach {count} orphaned entrie(s) to the active pool?",
    delete_pool_confirm: "Disable this pool? It will no longer appear in the app, but its history is kept.",
    account_deleted_title: "Account deleted",
    account_deleted_desc: "This account has been deleted and access to the app is no longer available.",
    account_deleted_request_btn: "Don't start fresh with this address, and request data recovery or deletion",
    back_to_home: "Back to home",
    reactivate_btn: "Start fresh with this address",
    reactivate_confirm: "Start fresh with this address? Your current pools will be hidden (never shown again, but not deleted). You'll need to create a new pool.",
    reset_password_hint: "Reset my password",
    data_request_title: "Data recovery or deletion",
    data_request_desc: "Choose the action you want. A request will be sent to support, who will contact you by email.",
    data_request_option_erase: "Erase all my data",
    data_request_option_recover: "Recover all my data, don't erase it",
    data_request_option_recover_erase: "Recover and erase all my data",
    data_request_submit: "Send request",
    data_request_sending: "Sending...",
    data_request_sent: "Request sent. Support will contact you by email.",
    data_request_error: "Failed to send. Try again or email support@poolgenai.com directly.",
    note_optional: "Note (optional)",
    note_placeholder: "Cloudy water, strong sun, swimming planned...",
    save_measure: "Save reading",
    save: "Save",
    cancel: "Cancel",
    save_changes: "Save changes",
    my_products: "MY PRODUCTS",
    products_formula: "Dosage calculated as: {quantity} to change parameter by {effect} per {volume} m³. These products are specific to this pool.",
    products_to_buy: "Products to buy",
    products_to_buy_empty: "Nothing to buy right now — all stock levels are sufficient.",
    generic_products_section: "Missing recommended products",
    generic_products_hint: "Based on this pool's treatment type, these products aren't in your list yet.",
    add_generic_product: "Add",
    generic_product_added: "Added to your products",
    reason_low_stock: "Low stock",
    reason_insufficient_plan: "Not enough for the current plan",
    apply_product_manual: "Apply a product",
    reason_manual_maintenance: "Manual maintenance",
    products_locked: "Feature reserved for Premium",
    stock_not_managed: "Stock management is not enabled for this pool. Enable it in Settings to track quantities and view consumption.",
    activate_in_settings: "Enable in Settings →",
    delete_all_products: "Delete all products for this pool",
    stock_label: "Stock:",
    stock_remaining: "remaining",
    edit_product: "Edit product",
    new_product: "New product",
    product_photo: "Product photo (label)",
    product_photo_hint: "Take one photo per element — product front, barcode, dosage notice — for more reliable recognition. One photo is enough if everything is visible on it.",
    common_product_candidate_title: "Similar product found in the shared database:",
    common_product_same: "Yes, same product",
    common_product_different: "No, different product",
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
    stock_locked: "Stock management reserved for Premium",
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
    // Wizard traitement
    wizard_title: "Treatment plan",
    wizard_step: "Step",
    wizard_of: "of",
    wizard_now: "Now",
    wizard_in: "In",
    wizard_at: "at",
    wizard_scheduled: "Scheduled",
    wizard_earliest: "Earliest",
    chlore_timing_tip: "For best results, apply preferably in the evening, after the last swim and at sunset.",
    wizard_done: "Done",
    wizard_skip: "Skip this step",
    wizard_anticipate: "Apply now",
    wizard_finish: "Finish plan",
    wizard_reminder: "Remind me for next step?",
    wizard_reminder_yes: "Yes, remind me",
    wizard_reminder_no: "No thanks",
    wizard_next_step: "Next step",
    wizard_start: "Start plan",
    plan_in_progress: "Treatment plan in progress",
    wizard_apply_time: "Application time",
    wizard_edit_prev: "Edit previous step",
    wizard_resume: "Resume plan",
    wizard_completed: "Treatment plan completed ✓",
    wizard_partial: "Plan in progress",
    countdown_done: "Time to treat!",
    treatment_at: "Treatment applied at",
    edit_treatment_section_title: "Treatment applied",
    treatment_skipped: "Step skipped",
    settings_title: "Settings",
    my_pools: "My pools",
    pool_name: "Pool name",
    location: "Location",
    volume: "Volume (m³)",
    treatment_type: "Treatment type",
    measure_device_label: "Measurement method",
    measure_device_photometre: "Photometer only",
    measure_device_bandelette: "Test strip only",
    measure_device_both: "Both",
    strip_model_label: "Test strip model used",
    strip_model_none: "Not specified",
    filtration_type: "Filtration type",
    manage_stock_label: "Stock management",
    manage_stock_desc: "Tracks product consumption and displays it in the report.",
    manage_stock_locked: "Available in Premium",
    api_key_label: "Anthropic API key or Cloudflare Worker proxy URL",
    provider_label: "Provider",
    api_key_placeholder: "sk-ant-... or https://my-proxy.workers.dev",
    api_key_desc: "Your key is stored locally. For Anthropic, enter a sk-ant-... key or your Cloudflare Worker proxy URL (recommended).",
    premium_section: "VERSION",
    premium_label: "Premium version",
    premium_test: "Monthly or yearly subscription",
    premium_desc: "Free: 1 pool, no invites, 1 reading per day. Premium: up to 3 pools, 2 invites per pool, unlimited readings, photos on readings and products.",
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
    cl_libre_col: "FCL",
    cl_total_col: "TCL",
    tac_col: "ALK",
    cya_col: "CYA",
    temp_col: "TEMP.",
    product_col: "Product",
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
    paywall_title: "Go Premium",
    paywall_desc: "Unlimited readings · AI strip analysis · PDF report · Stock management",
    paywall_context_measure_limit: "You've reached the limit of 1 free reading per day.",
    paywall_context_start_plan: "Step-by-step treatment tracking is reserved for Premium.",
    paywall_context_products: "Product and stock management is reserved for Premium.",
    pool_limit_reached: "Limit of 3 pools reached on Premium.",
    paywall_context_report: "The PDF report is reserved for Premium.",
    paywall_context_photos: "AI photo analysis is reserved for Premium.",
    paywall_context_stock: "Stock management is reserved for Premium.",
    paywall_btn: "Activate Premium",
    paywall_close: "Later",
    add_pool_title: "New pool",
    first_pool_title: "Welcome to PoolGenAI",
    first_pool_intro: "Set up your first pool to start tracking its water chemistry.",
    edit_pool_title: "Edit pool",
    pool_name_placeholder: "My pool",
    pool_location_placeholder: "Search for a city...",
    location_use_gps: "Use my location",
    location_searching: "Searching...",
    location_search_error: "Search unavailable, try again",
    location_no_results: "No city found",
    location_gps_error: "Location unavailable",
    pool_volume_placeholder: "72",
    save_pool: "Save",
    loading: "Loading...",
    ai_timer_hint: "Analysis may take up to 30 seconds.",
    ai_reliability: "Analysis reliability",
    ai_no_values: "No readable values on this photo. Check the image quality and orientation.",
    error_analyze: "Analysis failed",
    verify_connection: "Check your connection and photos.",
    free_version: "Free",
    param_ph: "pH",
    param_fcl: "Free chlorine (mg/L)",
    axis_legend_u: "ᴜ unit scale (pH, chlorine) — left",
    action_ph_minus: "Lowers pH",
        photos_section: "Reading photos",
    pool_photos_label: "Pool photos (optional)",
    pool_photo_locked: "Pool photos reserved for Premium",
    sign_in: "Sign in",
    account_section: "My account",
    confirm_password: "Confirm password",
    pwd_min6: "6 characters minimum",
    error_pwd_mismatch: "Passwords do not match.",
    error_email_required: "Invalid email.",
    account_created: "Account created!",
    verify_email_notice: "A confirmation email has been sent to your address. Click the link to activate your account.",
    verify_gate_title: "Verify your email address",
    verify_gate_desc: "To access the app, confirm your address by clicking the link you received by email",
    verify_gate_check_btn: "I've confirmed — Continue",
    verify_link_checking: "Verifying your email…",
    verify_link_verified_title: "Email verified!",
    verify_link_verified_desc: "Your email address is confirmed. You can continue.",
    verify_link_already_title: "Already verified",
    verify_link_already_desc: "This email address was already confirmed.",
    verify_link_expired_title: "Link expired",
    verify_link_expired_desc: "This verification link has expired. Request a new email from the app.",
    verify_link_invalid_title: "Invalid link",
    verify_link_invalid_desc: "This verification link isn't valid. Request a new email from the app.",
    verify_link_error_title: "Error",
    verify_link_error_desc: "Couldn't verify your email right now. Try again later.",
    verify_link_continue_btn: "Continue to the app",
    merge_link_pending_title: "Confirm the merge?",
    merge_link_pending_desc: "A barcode was detected for a product sheet already in the shared database, with no barcode linked yet. Confirm to link the two.",
    merge_link_confirm_btn: "Confirm merge",
    merge_link_cancel_btn: "Cancel",
    merge_link_confirming: "Merging…",
    merge_link_merged_title: "Merge confirmed",
    merge_link_merged_desc: "The barcode has been linked to the existing product sheet.",
    merge_link_already_merged_title: "Already merged",
    merge_link_already_merged_desc: "This merge had already been confirmed.",
    merge_link_expired_title: "Link expired",
    merge_link_expired_desc: "This confirmation link has expired (valid 7 days).",
    merge_link_invalid_title: "Invalid link",
    merge_link_invalid_desc: "This confirmation link is not valid.",
    merge_link_error_title: "Error",
    merge_link_error_desc: "Couldn't confirm the merge right now. Try again later.",
    verify_gate_checking: "Checking...",
    verify_gate_still_unverified: "Your email isn't confirmed yet. Check your inbox (and spam folder).",
    verify_gate_resend_btn: "Resend confirmation email",
    verify_gate_resend_sent: "Email resent — remember to check your spam folder.",
    verify_gate_resend_error: "Couldn't send the email right now. Try again later.",
    verify_gate_signout: "Sign out",
    verify_email_send_failed: "The confirmation email couldn't be sent. Try again below.",
    verify_email_retry_btn: "Resend email",
    verify_email_resent: "Email resent ✓",
    account_created_sub: "Welcome to PoolGenAI. You can now use the app.",
    start_app: "Start the app",
    sign_out: "Sign out",
    delete_account: "Delete my account",
    delete_account_confirm: "Delete your account? You won't be able to log in anymore. Your data is kept — you can request its recovery or permanent deletion.",
    account_delete_flag_error: "Failed to delete the account. Try again.",
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
    user_not_found: "No account with this email. If you think this is a mistake, contact support@poolgenai.com",
    account_disabled: "This account has been disabled. Contact support@poolgenai.com for more information.",
    login_failed_unified: "Incorrect email or password.",
    create_account_hint: "No account yet? Create one",
    email_in_use: "This email is already in use.",
    weak_password: "Password too short (min 6 characters).",
    firebase_not_configured: "⚠️ Firebase not configured — offline mode only.",
    note_ph_minus: "Check pH before each addition. Max 1 kg/100 m³/day, or space 2h apart.",
    note_ph_plus: "Spread across the pool with filtration running.",
    note_chlore_choc: "Pour in the evening after sunset. Does not stabilise (does not raise CYA).",
    note_galets: "Raises CYA with each use. Avoid if CYA is already above 50 mg/L.",
    prod_name_ph_minus: "pH reducer (acid / Reva Minus type)",
    prod_name_ph_plus: "pH increaser",
    prod_name_chlore_choc: "Unstabilised shock chlorine (Chloryte type)",
    prod_name_galets: "5-in-1 stabilised chlorine tablets (Chlorilong type)",
    packaging_type: "Packaging",
    packaging_vrac: "Bulk / granules",
    packaging_galets: "Tablets / sticks",
    unit_weight_label: "Weight per unit (g)",
    maintenance_ratio_label: "Manufacturer maintenance ratio",
    maintenance_units_label: "Nb units",
    maintenance_volume_label: "Per m³",
    maintenance_days_label: "Every X days",
    unit_galets: "tablets",
    unit_units: "units",
    quantity_unit_mode_kg: "kg",
    quantity_unit_mode_units: "units",
    maintenance_card_title: "Ongoing maintenance",
    maintenance_card_text: "{units} tablet(s) / {volume} m³, every {days} days",
    no_stock_category_hint: "No product in stock in this category — free entry",
    no_stock_generic_hint: "No product in stock in this category — generic product suggested",
    prod_name_tac_plus: "TAC+ product (sodium bicarbonate)",
    prod_name_calcium: "Calcium chloride (hardness +)",
    prod_name_anti_phos: "Anti-phosphates (PHOSfree type)",
    prod_name_sequestrant: "Metal sequestrant (Metal Free type)",
    prod_name_floculant: "Liquid clarifying flocculant (Reva-Flock type)",
    prod_name_sel: "Pool salt (pure NaCl ≥ 99%, 25 kg bag)",
    action_ph_plus: "Raises pH",
    action_chlore: "Unstabilised chlorine (shock)",
    action_chlore_stabilise: "Stabilised chlorine (CYA +)",
    action_tac_plus: "Raises alkalinity",
    action_tac_minus: "Lowers alkalinity",
    action_brome: "Bromine",
    action_o2: "Active oxygen",
    action_sel: "Salt (salinity)",
    axis_legend_d: "ᴅ tens scale (TAC, CYA, temperature) — right",
    reco_tac_low: "TAC too low ({val} mg/L)",
    reco_tac_high: "TAC too high ({val} mg/L)",
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
    reco_recheck_later: "Recheck recommended in a few hours",
    reco_cl_shock_text: "tonight (shock treatment)",
    reco_note_tac: "Low TAC makes pH unstable.",
    reco_note_tac_minus: "Same acid as pH-, but its TAC effect must be calibrated separately. Correct before pH, in small doses.",
    reco_no_product_note: "No product configured for this action. Add one in the Products tab.",
    product_empty_delete_confirm: "{name} is at 0% stock. Remove it from the list?",
    product_missing_values: "Fill in these fields before saving: {fields}.",
    reco_note_ph_before_tac: "pH corrected before TAC: chlorine would be inefficient at this pH, and TAC isn't low enough to be urgent.",
    reco_order_intro_default: "This order follows the treatment logic: parameters that hinder the effectiveness of the others are corrected first.",
    reco_order_reason_metals: "Sequestrant comes before any disinfectant because dissolved metals were detected — otherwise chlorine precipitates them and stains the pool.",
    reco_order_reason_contamination: "Disinfectant takes priority because combined chlorine is high ({combined} mg/L): aim for {target} mg/L free chlorine to reach breakpoint and destroy chloramines.",
    reco_order_reason_cya_block: "The chlorine shock is replaced by dilution because the stabiliser (CYA) is too high for a shock to be effective.",
    reco_order_reason_ph_before_tac: "pH comes before TAC because the gap is too large to wait.",
    reco_order_reason_ph_chlore_delay: "A 6-hour delay is enforced between the pH correction and the chlorine shock to avoid precipitation.",
    reco_note_combined: "Combined chlorine = chloramines, sign of insufficient disinfection. Add in the evening, keep filtration running.",
    reco_note_sel: "Use pool-grade salt (pure NaCl ≥ 99%). Dissolve before adding or pour directly near the skimmer, run filtration for 24h.",
    reco_note_o2: "Do not mix with chlorine. Run filtration for 4h.",
    prod_name_o2_liquide: "Liquid active oxygen (hydrogen peroxide)",
    note_o2_liquide: "Do not mix with chlorine. Pour in front of the return jets, filtration running.",
    reco_note_brome: "Pour away from water inlets, run filtration.",
    reco_note_cya: "No product lowers CYA chemically, only dilution works. Avoid stabilised chlorine while CYA is high.",
    reco_cya_block_shock: "Stabiliser too high for an effective shock ({val} mg/L)",
    reco_note_cya_block_shock: "Above 75 mg/L CYA, a standard chlorine shock can no longer reach breakpoint. Only dilution (partial water renewal) works — no chlorine shock until that's done.",
    reco_fallback_tac: "TAC+ product (sodium bicarbonate)",
    reco_fallback_tac_minus: "TAC- product (hydrochloric acid or sodium bisulfate)",
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
    paywall_perk7: "Up to 3 pools, 2 invites per pool",
    paywall_test_note: "Secure payment via Stripe. Cancel anytime.",
    paywall_price_monthly: "€2.99 / month",
    paywall_price_yearly: "€24.99 / year",
    paywall_price_yearly_hint: "or €24.99 / year",
    paywall_plan_monthly: "Monthly",
    paywall_plan_yearly: "Yearly",
    paywall_plan_yearly_badge: "-30%",
    manage_subscription_btn: "Manage subscription",
    checkout_error: "Couldn't start checkout. Try again.",
    portal_error: "Couldn't open subscription management. Try again.",
    stripe_activation_checking: "Confirming your payment…",
    stripe_activation_delay_title: "This is taking longer than usual",
    stripe_activation_delay_desc: "Your payment was received, but activation is taking a bit longer. Try reloading the app in a minute.",
    stripe_activation_continue_btn: "Continue",
    premium_reveal_title: "Premium activated",
    premium_reveal_sub: "Up to 3 pools, 2 invites per pool, unlimited readings",
    premium_downgrade_title: "Back to the free version",
    premium_downgrade_sub: "Premium features are now disabled",
    premium_downgrade_confirm_title: "Disable Premium?",
    premium_downgrade_confirm_desc: "You will lose access to:",
    premium_downgrade_confirm_btn: "Disable Premium",
    premium_downgrade_cancel_btn: "Cancel and keep Premium",
    onboarding_step1_title: "Welcome to PoolGenAI",
    onboarding_step1_text: "Track your pool's chemistry with ease: readings, dosing, and a personalized treatment plan.",
    onboarding_step2_title: "One photo is enough",
    onboarding_step2_text: "Take a photo of your test strip or photometer screen. The AI reads the colors and fills in the fields for you — no more eyeballing a comparison chart.",
    onboarding_step3_title: "Clear results",
    onboarding_step3_text: "Each parameter is compared to its target: pH, chlorine, TAC, stabilizer... A simple color code tells you at a glance what's fine, and what needs correcting.",
    onboarding_step4_title: "A prioritized plan",
    onboarding_step4_text: "The app works out the order to apply treatments and the wait time between each step, so you don't waste a treatment by rushing the next one.",
    onboarding_step5_title: "Apply with confidence",
    onboarding_step5_text: "The exact dose is calculated for your pool's volume and the product you're using. Check off the step once it's done, and the app moves to the next one.",
    onboarding_step6_title: "Track the trend",
    onboarding_step6_text: "See your readings over time to spot trends and catch drift before it becomes a problem.",
    onboarding_step7_title: "Manage your stock",
    onboarding_step7_text: "Track how much of each product you have left and get an alert before you run out.\n\nAdd your first reading whenever you like. Up to 3 pools, PDF reports and more: discover Premium later in Settings.",
    onboarding_step3_legend_bad: "Too high or too low",
    onboarding_next: "Next",
    onboarding_skip: "Skip",
    onboarding_start: "Let's go",
    help_section: "Help",
    settings_replay_onboarding: "Replay the introduction",
    context_switch_premium_title: "Premium pool",
    context_switch_premium_sub: "This pool benefits from its owner's Premium features",
    context_switch_free_title: "Back to your pool",
    context_switch_free_sub: "You're back on your own pool",
    report_print_btn: "Print / Save as PDF",
    share_report: "Share report",
    report_email_subject: "PoolGenAI report — {pool}",
    report_email_greeting: "Hello,",
    report_email_body: "Please find below the instructions to get the PDF report for the pool \"{pool}\":",
    report_email_step1: "1. Open the PoolGenAI app",
    report_email_step2: "2. History tab → Generate report",
    report_email_step3: "3. Click \"Print / Save as PDF\"",
    report_email_sign: "Best regards,",
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
    unlimited_version: "Premium",
    active_pool: "Active pool",
    pool_volume: "Pool volume (m³)",
    treatment_params: "Parameters:",
    treatment_desc: "The treatment determines which parameters are measured and the recommended targets. Volume is used to calculate product doses.",
    subscription: "Subscription",
    unlimited_active: "Premium mode active",
    free_mode: "Free version",
    api_section: "AI ANALYSIS",
    ai_toggle_label: "Enable AI analysis",
    ai_toggle_desc: "Allows analyzing measurement photos using artificial intelligence.",
    calibration_toggle_label: "Contribute to collective improvement",
    calibration_toggle_desc: "Shares anonymous calibration data (measured colour, reference value) to improve test strip reading for everyone. No photo or identifier is transmitted.",
    ai_password_title: "AI configuration access",
    ai_password_prompt: "Enter password to enable AI analysis",
    ai_password_error: "Incorrect password",
    ai_configure_btn: "Configure API key",
    ai_config_title: "AI Configuration",
    ai_config_back: "Back to settings",
    ai_locked_settings: "AI analysis reserved for Premium",
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
    // v1.60.0 — Delegation section (secondary users + pools I'm invited to)
    delegation_section_title: "Delegation",
    linked_pools_title: "Pools I'm invited to",
    linked_pools_empty: "You don't have access to any pool as a guest.",
    request_revocation_button: "Request revocation",
    request_revocation_confirm: "Request revocation of your access to pool \"{pool}\"? {pseudo} will get an email to confirm.",
    request_revocation_sent: "Request sent. You'll get an email once the revocation is confirmed.",
    request_revocation_error: "Failed to send the request.",
    secondary_section_title: "Secondary users",
    secondary_section_intro: "Invite up to 2 people to access the same pool (reserved for Premium).",
    secondary_invite_requires_premium: "Invitations are reserved for Premium.",
    secondary_invite_pool_full: "This pool already has 2 invitees, that's the maximum.",
    secondary_invite_button: "Invite someone",
    secondary_invite_email_label: "Email of the person to invite",
    secondary_invite_pool_label: "Pool",
    secondary_invite_send: "Send invitation",
    secondary_invite_sent: "Invitation sent.",
    secondary_invite_error: "Failed to send invitation",
    secondary_active_title: "Active access",
    secondary_active_empty: "No active access.",
    secondary_pool_label: "Pool: {pool}",
    secondary_revoke_button: "Revoke",
    secondary_revoke_confirm: "Revoke access for {email}?",
    secondary_revoke_error: "Failed to revoke access",
    secondary_pending_title: "Pending invitations",
    secondary_pending_empty: "No pending invitations.",
    secondary_pending_expires: "Expires on {date}",
    secondary_pending_expired: "Expired",
    secondary_cancel_button: "Cancel",
    secondary_cancel_confirm: "Cancel the invitation sent to {email}?",
    secondary_cancel_error: "Failed to cancel invitation",
    pseudo_label: "Your nickname",
    pseudo_placeholder: "Visible to people who invite you",
    pseudo_save: "Save",
    pseudo_saved: "Nickname saved.",
    pseudo_invalid: "2 to 24 characters (letters, digits, spaces, dashes).",
    pseudo_taken_suggestion: "Already taken. Try: {suggestion}",
    pseudo_error: "Failed to save nickname",
    context_title: "Pool shown",
    context_own: "My pools",
    secondary_pool_unavailable_title: "Pool unavailable",
    secondary_pool_unavailable_desc: "This pool can't be found. It may have been deleted, or there's a network issue loading it. Try again later.",
    secondary_pool_revoked_desc: "Your access to this pool has been revoked by its owner.",
    secondary_invited_label: "{pool} - Invited",
    context_loading: "Loading pool…",
    context_secondary_option: "{pseudo}'s pool",
    banner_secondary: "{pool} — {pseudo}'s account",
    invite_response_title: "Invitation",
    invite_response_text: "{pseudo} invites you to access the pool {pool}.",
    invite_response_accept: "Accept",
    invite_response_decline: "Decline",
    invite_response_accepted: "Invitation accepted. Find this pool in Settings.",
    invite_response_declined: "Invitation declined.",
    invite_response_expired: "This invitation has expired.",
    invite_response_limit_reached: "Free plan limit of 2 invited pools reached — go Premium to accept more.",
    invite_response_requires_premium: "This account is no longer on Premium, the invitation can't be accepted.",
    invite_response_invalid: "Invalid or already used invitation.",
    invite_response_mismatch: "This invitation doesn't match your logged-in account.",
    invite_response_error: "Error while processing the invitation.",
    invite_response_checking: "Checking invitation…",
    revocation_response_title: "Revocation request",
    revocation_response_text: "{pseudo} requested revocation of their invitation to pool {pool}.",
    revocation_response_accept: "Accept the revocation request",
    revocation_response_done: "Revocation done.",
    revocation_response_invalid: "This request no longer exists or was already handled.",
    revocation_response_expired: "This revocation request has expired.",
    revocation_response_mismatch: "This request doesn't match your logged-in account.",
    revocation_response_error: "Error while processing the request.",
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
    daily_limit: "Tageslimit erreicht — Premium nutzen",
    apply_advice: "Empfehlungen anwenden",
    apply_advice_sub: "Wähle die angewendeten Empfehlungen und gib die tatsächlichen Mengen ein.",
    advice_applied: "Empfehlungen angewendet",
    advice_partial: "teilweise angewendet",
    adjust: "Anpassen",
    ai_analysis: "KI-ANALYSE",
    ai_analyze_btn: "Mit KI analysieren",
    ai_locked: "Funktion für Premium reserviert",
    ai_analyzing: "Analyse läuft…",
    ai_api_missing: "API-Schlüssel in Einstellungen eingeben, um KI-Analyse zu aktivieren.",
    follow_order: "Schritte der Reihe nach befolgen: jede Behandlung verändert das Wassergleichgewicht.",
    in_range: "Im Zielbereich",
    too_high: "Zu hoch",
    too_low: "Zu niedrig",
    target: "Ziel",
    evolution: "Verlauf",
    show_values: "Werte im Diagramm anzeigen",
    show_all_params: "Parameter anzeigen",
    hide_all_params: "Parameter ausblenden",
    journal: "Protokoll",
    no_history: "Noch kein Verlauf",
    no_history_sub: "Deine Messungen werden hier im Laufe der Zeit angezeigt.",
    report: "Bericht",
    time_col: "Uhrzeit",
    advised_col: "Empfohlen",
    ccl_col: "CCL",
    hard_col: "TH",
    phos_col: "Phos.",
    copper_col: "Kupfer",
    iron_col: "Eisen",
    param_ccl: "Gebundenes Chlor (CCL)",
    param_hard: "Härte (TH)",
    param_phos: "Phosphate",
    param_copper: "Kupfer",
    param_iron: "Eisen",
    reco_hard_low: "Härte zu niedrig ({val} mg/L)",
    reco_hard_high: "Härte zu hoch ({val} mg/L)",
    reco_phos_high: "Phosphate zu hoch ({val} µg/L)",
    reco_copper_high: "Kupfer zu hoch ({val} mg/L)",
    reco_iron_high: "Eisen zu hoch ({val} mg/L)",
    reco_fallback_hard: "Calciumchlorid",
    reco_fallback_phos: "Anti-Phosphat",
    reco_fallback_sequestrant: "Metallsequestriermittel",
    note_tac_plus: "Schrittweise hinzufügen, Filtration läuft. 6h warten.",
    note_calcium: "Vor der Zugabe verdünnen. Filtration läuft.",
    note_anti_phos: "Vor der Rückflussdüse eingießen, Filtration 24h laufen lassen.",
    note_sequestrant: "Kupfer/Eisen-Behandlung. Am Beckenrand eingießen.",
    note_floculant: "Einmalbehandlung bei trübem Wasser, wird von der App nicht automatisch verfolgt. Vor den Einlaufdüsen eingießen, Filtration laufen lassen, dann 24h stoppen zum Absetzen.",
    action_hard_plus: "Härte erhöhen (TH)",
    action_phos_minus: "Phosphate reduzieren",
    action_sequestrant: "Metallsequestriermittel (Kupfer/Eisen)",
    action_floculant: "Flockungsmittel / Klärer",
    action_outil_mesure: "Messwerkzeug (Teststreifen usw.)",
    legal_notices: "Rechtliche Hinweise",
    lcen_title: "Rechtliche Hinweise",
    lcen_editor: "Herausgeber",
    lcen_editor_val: "Arnaud Goumain — Privatperson",
    lcen_host: "Hosting",
    lcen_host_val: "GitHub Inc. / Microsoft Corporation\n88 Colin P Kelly Jr St\nSan Francisco, CA 94107, USA",
    lcen_contact: "Kontakt",
    lcen_contact_val: "support@poolgenai.com",
    lcen_cgu_title: "Nutzungsbedingungen",
    lcen_ai_title: "Künstliche Intelligenz",
    lcen_ai_val: "Bei der KI-Analyse laufen Ihre Daten über die technische Infrastruktur des Herausgebers (Vermittlungsserver), der einen vom Herausgeber abonnierten API-Schlüssel verwendet. Keine Speicherung oder Protokollierung der übertragenen Inhalte auf diesem Server.",
    lcen_photos_title: "Fotos",
    lcen_photos_val: "Senden Sie nur Fotos von Messgeräten oder Poolwasser. Ausgeschlossen: identifizierbare Personen, Standortelemente, sichtbare persönliche Daten.",
    lcen_gdpr: "Personenbezogene Daten",
    lcen_gdpr_val: "Gemäß DSGVO haben Sie das Recht auf Zugang, Berichtigung, Löschung und Übertragbarkeit Ihrer Daten. Wenden Sie sich an uns unter der oben genannten Adresse oder reichen Sie eine Beschwerde bei Ihrer Datenschutzbehörde ein.",
    lcen_calibration_title: "Kollektive Verbesserung der Fotoanalyse",
    lcen_calibration_val: "Wenn eine Messung sowohl ein Photometerfoto als auch ein Teststreifenfoto für denselben Parameter enthält, kann PoolGenAI einen anonymen Kalibrierungsdatenpunkt (gemessene Farbe, Referenzwert, erkannter Teststreifentyp) extrahieren und ihn mit allen Nutzern der Anwendung teilen, einzig um die Genauigkeit der Teststreifen-Interpretation für alle zu verbessern. Diese Kalibrierungsdaten enthalten weder Fotos noch Kontokennungen noch Informationen, die Rückschlüsse auf den ursprünglichen Nutzer zulassen. Nutzer können diesen Beitrag jederzeit in den Anwendungseinstellungen deaktivieren; eine Ablehnung beeinträchtigt die normale Nutzung von PoolGenAI nicht.",
    lcen_photocontrib_title: "Fotobeitrag zur gemeinsamen Produktdatenbank",
    lcen_photocontrib_val: "Wenn ein Nutzer ein Produkt fotografiert, für das noch kein Foto in der gemeinsamen Produktdatenbank vorhanden ist, kann dieses Foto übermittelt und gespeichert werden, um den entsprechenden Produkteintrag zu illustrieren, sichtbar für alle Nutzer. Nur das Produktfoto selbst ist betroffen. Einmal beigetragen, kann ein Foto nicht einzeln zurückgezogen werden — keine Information verknüpft ein Foto mit seinem Beitragenden.",
    photo_warning_title: "Warnung vor dem Fotografieren",
    photo_warning_body: "Stellen Sie sicher, dass das Foto nicht enthält:\n• erkennbare Personen\n• Elemente, die Ihren Wohnort identifizieren könnten\n• sichtbare personenbezogene Daten\n\nWir empfehlen, die Geolokalisierung in den Kameraeinstellungen zu deaktivieren.",
    photo_warning_confirm: "Verstanden, weiter",
    ai_clause_title: "KI-Analyse",
    ai_clause_body: "Wenn Sie die KI-Analyse aktivieren, laufen Ihre Daten (Messwerte und Fotos) über die technische Infrastruktur von PoolGenAI, die einen vom Herausgeber abonnierten API-Schlüssel verwendet — Sie müssen keinen eigenen Schlüssel angeben. Keine Speicherung oder Protokollierung der übertragenen Inhalte auf diesem Vermittlungsserver.",
    cgu_update_title: "AGB aktualisiert",
    cgu_update_body: "Die Nutzungsbedingungen wurden aktualisiert (v{version}). Bitte lesen und akzeptieren Sie sie.",
    cgu_update_accept: "Lesen und akzeptieren",
    cgu_version_label: "AGB-Version",
    cgu_accepted_on: "Akzeptiert am",
    cgu_updated_title: "AGB aktualisiert",
    cgu_updated_body: "Die Nutzungsbedingungen wurden aktualisiert. Bitte lesen und akzeptieren Sie sie.",
    cgu_required_title: "Nutzungsbedingungen",
    cgu_required_body: "Bitte akzeptiere unsere Nutzungsbedingungen, um fortzufahren.",
    cgu_read_full_text: "Vollständigen Text lesen",
    cgu_hide_full_text: "Text ausblenden",
    applied_col: "Angewendet",
    disclaimer_title: "Rechtliche Hinweise & Nutzungsbedingungen",
    disclaimer_cgu: "Ich akzeptiere die Nutzungsbedingungen und Datenschutzrichtlinie",
    disclaimer_data: "Ich stimme zu, dass meine Behandlungsdaten (Messungen, Produkte, Fotos) gesammelt und möglicherweise mit Partnern der Pool/Spa-Branche geteilt werden",
    disclaimer_required: "Die Annahme der Nutzungsbedingungen ist erforderlich",
    disclaimer_pro: "Fachleute, die PoolGenAI für Dienstleistungen im Auftrag Dritter verwenden, müssen die Zustimmung der Beckeneigentümer zur Datenerhebung einholen.",
    revoke_data_consent: "Datenzustimmung widerrufen",
    revoke_data_confirm: "Ihre Zustimmung wurde widerrufen.",
    pool_email: "PDF-Bericht E-Mail",
    pool_email_placeholder: "kontakt@beispiel.de",
    pool_settings_title: "Beckeneinstellungen",
    edit_pool: "Becken bearbeiten",
    generate_report: "Beckenbericht erstellen",
    report_locked: "PDF-Bericht nur in Premium",
    report_desc: "Der Bericht enthält den Messverlauf, gegebene Ratschläge und tatsächlich angewendete Mengen.",
    diag_section: "KI-DIAGNOSE",
    diag_placeholder: "Beschreibe das Problem mit deinem Becken trotz Behandlungen (z.B. trübes Wasser, verschwindender Chlorgehalt, hartnäckige Algen...)",
    diag_submit: "Mit KI analysieren",
    diag_analyzing: "Analyse läuft...",
    diag_confidence: "Vertrauensindex",
    diag_history_title: "KI-Diagnoseverlauf",
    diag_history_date: "Datum",
    diag_history_note: "Notiz",
    diag_history_response: "KI-Antwort",
    diag_history_confidence: "Vertrauen",
    diag_history_delete: "Löschen",
    diag_history_empty: "Noch keine Diagnose gespeichert.",
    diag_history_locked: "KI-Diagnoseverlauf nur in Premium",
    diag_history_confirm_delete: "Diese Diagnose löschen?",
    update_required_title: "Neue Version verfügbar",
    update_required_desc: "Eine neue Version von PoolGenAI wurde veröffentlicht. Aktualisiere die App, um fortzufahren.",
    update_required_btn: "Jetzt aktualisieren",
    update_in_progress_title: "Aktualisierung läuft",
    update_in_progress_desc: "Das dauert nur einen Moment, die App wird automatisch neu geladen.",
    diag_off_topic: "Diese Frage betrifft nicht die Wasserbehandlung. Ich beantworte nur Fragen zur Wasserchemie, Behandlungsprodukten und Poolausrüstung.",
            diag_error: "Analyse fehlgeschlagen",
    import_pdf_btn: "PDF-Bericht importieren",
    import_pdf_prefill_title: "Messung aus PDF importiert",
    import_pdf_analyzing: "KI liest die Datei...",
    import_pdf_error: "Diese Datei kann nicht gelesen werden",
    import_pdf_no_values: "Keine Werte in dieser Datei gefunden",
    import_pdf_needs_ai: "PDF-Import verfügbar mit KI-Analyse (Einstellungen → KI-Analyse aktivieren)",
    import_diag_added_one: "1 KI-Diagnose aus diesem Dokument importiert.",
    import_diag_added_many: "{n} KI-Diagnosen aus diesem Dokument importiert.",
    suspended_title: "Konto gesperrt",
    suspended_desc: "Dein Konto wurde gesperrt und der Zugriff auf die App ist nicht mehr möglich.",
    suspended_erase_btn: "Meine Daten löschen",
    suspended_erasing: "Wird gelöscht...",
    suspended_erase_confirm: "Dies löscht dauerhaft alle deine Daten (Messungen, Produkte, Verlauf, Diagnosen). Fortfahren?",
    legend_title: "Parameterlegende und Zielwerte",
    ccl_fcl_tcl_error: "Fehler: FCL + CCL darf TCL nicht überschreiten. Bitte Werte prüfen.",
    tcl_forced_to_fcl_info: "TCL kann nicht niedriger als FCL sein — Wert auf {val} korrigiert. Zum Bestätigen erneut auf Speichern tippen.",
    param_ph_long: "Wasserstoffpotenzial", param_fcl_long: "Freies Chlor", param_tcl_long: "Gesamtchlor",
    param_ccl_long: "Gebundenes Chlor (Chloramine)", param_tac_long: "Gesamtalkalinität",
    param_cya_long: "Cyanursäure (Stabilisator)", param_th_long: "Gesamthärte",
    param_phos_long: "Phosphate", param_cu_long: "Kupfer", param_fe_long: "Eisen", param_temp_long: "Wassertemperatur",
    new_measure_title: "Neue Messung",
    edit_measure_title: "Messung bearbeiten",
    date_time: "Datum und Uhrzeit",
    photo_hint: "Fotografiere den Photometerbildschirm mit lesbaren Werten oder lege deinen getränkten Teststreifen neben die Tubuslegende und fotografiere beide zusammen.",
    photo_hint_bandelette: "Teststreifen: Mache 2-3 Fotos und drehe dabei die Tube, um jede Farbskala sichtbar zu machen.",
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
    analyze_locked: "Foto + KI-Analyse nur in Premium",
    product_ai_hint: "Aktiviere die KI-Analyse in den Einstellungen, um diese Felder automatisch aus dem Foto auszufüllen.",
    product_sync_error: "Produktsynchronisierung fehlgeschlagen — das Foto ist evtl. zu groß, versuche es mit einem leichteren Foto erneut.",
    config_sync_error: "Synchronisierung fehlgeschlagen — prüfe deine Verbindung. ({detail})",
    repair_orphaned_title: "{count} verwaiste Eintrag/Einträge gefunden",
    repair_orphaned_desc: "Einige Messungen, Behandlungen oder Produkte sind keinem bestehenden Becken zugeordnet (oft nach einem Synchronisierungsfehler). Sie werden deinem aktiven Becken zugeordnet.",
    repair_orphaned_btn: "Jetzt reparieren",
    repair_orphaned_confirm: "{count} verwaiste Einträge dem aktiven Becken zuordnen?",
    delete_pool_confirm: "Dieses Becken deaktivieren? Es wird in der App nicht mehr angezeigt, der Verlauf bleibt jedoch erhalten.",
    account_deleted_title: "Konto gelöscht",
    account_deleted_desc: "Dieses Konto wurde gelöscht und der Zugriff auf die App ist nicht mehr möglich.",
    account_deleted_request_btn: "Nicht mit dieser Adresse neu beginnen, sondern Datenwiederherstellung oder -löschung beantragen",
    back_to_home: "Zurück zur Startseite",
    reactivate_btn: "Mit dieser Adresse neu beginnen",
    reactivate_confirm: "Mit dieser Adresse neu beginnen? Deine aktuellen Becken werden ausgeblendet (nie wieder angezeigt, aber nicht gelöscht). Du musst ein neues Becken anlegen.",
    reset_password_hint: "Passwort zurücksetzen",
    data_request_title: "Datenwiederherstellung oder -löschung",
    data_request_desc: "Wähle die gewünschte Aktion. Eine Anfrage wird an den Support gesendet, der sich per E-Mail bei dir meldet.",
    data_request_option_erase: "Alle meine Daten löschen",
    data_request_option_recover: "Alle meine Daten wiederherstellen, nicht löschen",
    data_request_option_recover_erase: "Alle meine Daten wiederherstellen und löschen",
    data_request_submit: "Anfrage senden",
    data_request_sending: "Wird gesendet...",
    data_request_sent: "Anfrage gesendet. Der Support meldet sich per E-Mail.",
    data_request_error: "Senden fehlgeschlagen. Versuche es erneut oder schreibe direkt an support@poolgenai.com.",
    note_optional: "Notiz (optional)",
    note_placeholder: "Trübes Wasser, starke Sonne, Schwimmen geplant...",
    save_measure: "Messung speichern",
    save: "Speichern",
    cancel: "Abbrechen",
    save_changes: "Änderungen speichern",
    my_products: "MEINE PRODUKTE",
    products_formula: "Dosierung berechnet als: {Menge} um Parameter um {Effekt} pro {Volumen} m³ zu ändern.",
    products_to_buy: "Einkaufsliste",
    products_to_buy_empty: "Aktuell nichts zu kaufen — alle Bestände sind ausreichend.",
    generic_products_section: "Fehlende empfohlene Produkte",
    generic_products_hint: "Basierend auf der Behandlungsart dieses Pools fehlen diese Produkte noch in deiner Liste.",
    add_generic_product: "Hinzufügen",
    generic_product_added: "Zu deinen Produkten hinzugefügt",
    reason_low_stock: "Niedriger Bestand",
    reason_insufficient_plan: "Nicht genug für den laufenden Plan",
    apply_product_manual: "Produkt anwenden",
    reason_manual_maintenance: "Manuelle Pflege",
    products_locked: "Funktion für Premium reserviert",
    stock_not_managed: "Lagerverwaltung für dieses Becken nicht aktiviert. In Einstellungen aktivieren.",
    activate_in_settings: "In Einstellungen aktivieren →",
    delete_all_products: "Alle Produkte für dieses Becken löschen",
    stock_label: "Lager:",
    stock_remaining: "verbleibend",
    edit_product: "Produkt bearbeiten",
    new_product: "Neues Produkt",
    product_photo: "Produktfoto (Etikett)",
    product_photo_hint: "Mach ein Foto pro Element — Produktvorderseite, Barcode, Dosierungshinweis — für eine zuverlässigere Erkennung. Ein Foto reicht, wenn alles darauf sichtbar ist.",
    common_product_candidate_title: "Ähnliches Produkt in der gemeinsamen Datenbank gefunden:",
    common_product_same: "Ja, gleiches Produkt",
    common_product_different: "Nein, anderes Produkt",
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
    stock_locked: "Lagerverwaltung nur in Premium",
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
    wizard_title: "Behandlungsplan",
    wizard_step: "Schritt",
    wizard_of: "von",
    wizard_now: "Jetzt",
    wizard_in: "In",
    wizard_at: "um",
    wizard_scheduled: "Geplant",
    wizard_earliest: "Frühestens",
    chlore_timing_tip: "Für beste Wirksamkeit am besten abends anwenden, nach dem letzten Bad und bei Sonnenuntergang.",
    wizard_done: "Erledigt",
    wizard_skip: "Schritt überspringen",
    wizard_anticipate: "Jetzt anwenden",
    wizard_finish: "Plan beenden",
    wizard_reminder: "Nächsten Schritt erinnern?",
    wizard_reminder_yes: "Ja, erinnern",
    wizard_reminder_no: "Nein danke",
    wizard_next_step: "Nächster Schritt",
    wizard_start: "Plan starten",
    plan_in_progress: "Behandlungsplan läuft",
    wizard_apply_time: "Anwendungszeitpunkt",
    wizard_edit_prev: "Vorherigen Schritt bearbeiten",
    wizard_resume: "Plan fortsetzen",
    wizard_completed: "Behandlungsplan abgeschlossen ✓",
    wizard_partial: "Plan läuft",
    countdown_done: "Zeit für die Behandlung!",
    treatment_at: "Behandlung angewendet um",
    edit_treatment_section_title: "Angewendete Behandlung",
    treatment_skipped: "Schritt übersprungen",
    settings_title: "Einstellungen",
    my_pools: "Meine Becken",
    pool_name: "Beckenname",
    location: "Standort",
    volume: "Volumen (m³)",
    treatment_type: "Behandlungsart",
    measure_device_label: "Messmethode",
    measure_device_photometre: "Nur Photometer",
    measure_device_bandelette: "Nur Teststreifen",
    measure_device_both: "Beides",
    strip_model_label: "Verwendetes Teststreifenmodell",
    strip_model_none: "Nicht angegeben",
    filtration_type: "Filtrationsart",
    manage_stock_label: "Lagerverwaltung",
    manage_stock_desc: "Verfolgt den Produktverbrauch und zeigt ihn im Bericht an.",
    manage_stock_locked: "In Premium verfügbar",
    api_key_label: "Anthropic API-Schlüssel oder Cloudflare Worker Proxy-URL",
    provider_label: "Anbieter",
    api_key_placeholder: "sk-ant-... oder https://mein-proxy.workers.dev",
    api_key_desc: "Dein Schlüssel wird lokal gespeichert.",
    premium_section: "VERSION",
    premium_label: "Premium-Version",
    premium_test: "Monatliches oder jährliches Abo",
    premium_desc: "Kostenlos: 1 Becken, keine Einladungen, 1 Messung pro Tag. Premium: bis zu 3 Becken, 2 Einladungen pro Becken, unbegrenzte Messungen, Fotos, Produkte.",
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
    cl_libre_col: "FCL",
    cl_total_col: "TCL",
    tac_col: "KH",
    cya_col: "CYA",
    temp_col: "TEMP.",
    product_col: "Produkt",
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
    paywall_title: "Zu Premium wechseln",
    paywall_desc: "Unbegrenzte Messungen · KI-Streifenanalyse · PDF-Bericht · Lagerverwaltung",
    paywall_context_measure_limit: "Du hast das Limit von 1 kostenlosen Messung pro Tag erreicht.",
    paywall_context_start_plan: "Die schrittweise Behandlungsverfolgung ist Premium vorbehalten.",
    paywall_context_products: "Die Produkt- und Lagerverwaltung ist Premium vorbehalten.",
    pool_limit_reached: "Limit von 3 Becken in Premium erreicht.",
    paywall_context_report: "Der PDF-Bericht ist Premium vorbehalten.",
    paywall_context_photos: "Die KI-Fotoanalyse ist Premium vorbehalten.",
    paywall_context_stock: "Die Lagerverwaltung ist Premium vorbehalten.",
    paywall_btn: "Premium aktivieren",
    paywall_close: "Später",
    add_pool_title: "Neues Becken",
    first_pool_title: "Willkommen bei PoolGenAI",
    first_pool_intro: "Richte dein erstes Becken ein, um mit der Wasserchemie-Überwachung zu beginnen.",
    ai_timer_hint: "L'analisi può richiedere fino a 30 secondi.",
    ai_reliability: "Affidabilità dell'analisi",
    ai_no_values: "Nessun valore leggibile su questa foto. Controlla la qualità e l'orientamento dell'immagine.",
    edit_pool_title: "Becken bearbeiten",
    pool_name_placeholder: "Mein Pool",
    pool_location_placeholder: "Stadt suchen...",
    location_use_gps: "Standort verwenden",
    location_searching: "Suche...",
    location_search_error: "Suche nicht verfügbar, erneut versuchen",
    location_no_results: "Keine Stadt gefunden",
    location_gps_error: "Standort nicht verfügbar",
    pool_volume_placeholder: "72",
    save_pool: "Speichern",
    loading: "Laden...",
    ai_timer_hint: "Die Analyse kann bis zu 30 Sekunden dauern.",
    ai_reliability: "Zuverlässigkeit der Analyse",
    ai_no_values: "Keine lesbaren Werte auf diesem Foto. Überprüfe Qualität und Ausrichtung des Bildes.",
    error_analyze: "Analyse fehlgeschlagen",
    verify_connection: "Verbindung und Fotos prüfen.",
    free_version: "Kostenlos",
    param_ph: "pH",
    param_fcl: "Freies Chlor (mg/L)",
    axis_legend_u: "ᴜ Einheitsskala (pH, Chlor) — links",
    action_ph_minus: "pH senken",
        photos_section: "Messfotos",
    pool_photos_label: "Beckenfotos (optional)",
    pool_photo_locked: "Beckenfotos nur in Premium",
    sign_in: "Anmelden",
    account_section: "Mein Konto",
    confirm_password: "Passwort bestätigen",
    pwd_min6: "Mindestens 6 Zeichen",
    error_pwd_mismatch: "Passwörter stimmen nicht überein.",
    error_email_required: "Ungültige E-Mail.",
    account_created: "Konto erstellt!",
    verify_email_notice: "Eine Bestätigungs-E-Mail wurde an deine Adresse gesendet. Klicke auf den Link, um dein Konto zu aktivieren.",
    verify_gate_title: "Bestätige deine E-Mail-Adresse",
    verify_gate_desc: "Um die App zu nutzen, bestätige deine Adresse über den Link, den du per E-Mail erhalten hast",
    verify_gate_check_btn: "Bestätigt — Weiter",
    verify_link_checking: "E-Mail wird überprüft…",
    verify_link_verified_title: "E-Mail bestätigt!",
    verify_link_verified_desc: "Deine E-Mail-Adresse ist bestätigt. Du kannst fortfahren.",
    verify_link_already_title: "Bereits bestätigt",
    verify_link_already_desc: "Diese E-Mail-Adresse war bereits bestätigt.",
    verify_link_expired_title: "Link abgelaufen",
    verify_link_expired_desc: "Dieser Bestätigungslink ist abgelaufen. Fordere eine neue E-Mail in der App an.",
    verify_link_invalid_title: "Ungültiger Link",
    verify_link_invalid_desc: "Dieser Bestätigungslink ist ungültig. Fordere eine neue E-Mail in der App an.",
    verify_link_error_title: "Fehler",
    verify_link_error_desc: "E-Mail konnte gerade nicht überprüft werden. Versuche es später erneut.",
    verify_link_continue_btn: "Weiter zur App",
    merge_link_pending_title: "Zusammenführung bestätigen?",
    merge_link_pending_desc: "Für ein Produktdatenblatt, das bereits in der gemeinsamen Datenbank ohne Barcode existiert, wurde ein Barcode erkannt. Bestätige, um beide zu verknüpfen.",
    merge_link_confirm_btn: "Zusammenführung bestätigen",
    merge_link_cancel_btn: "Abbrechen",
    merge_link_confirming: "Zusammenführung läuft…",
    merge_link_merged_title: "Zusammenführung bestätigt",
    merge_link_merged_desc: "Der Barcode wurde mit dem bestehenden Produktdatenblatt verknüpft.",
    merge_link_already_merged_title: "Bereits zusammengeführt",
    merge_link_already_merged_desc: "Diese Zusammenführung wurde bereits bestätigt.",
    merge_link_expired_title: "Link abgelaufen",
    merge_link_expired_desc: "Dieser Bestätigungslink ist abgelaufen (gültig 7 Tage).",
    merge_link_invalid_title: "Ungültiger Link",
    merge_link_invalid_desc: "Dieser Bestätigungslink ist ungültig.",
    merge_link_error_title: "Fehler",
    merge_link_error_desc: "Die Zusammenführung konnte gerade nicht bestätigt werden. Versuch es später erneut.",
    verify_gate_checking: "Wird geprüft...",
    verify_gate_still_unverified: "Deine E-Mail ist noch nicht bestätigt. Prüfe dein Postfach (auch den Spam-Ordner).",
    verify_gate_resend_btn: "Bestätigungs-E-Mail erneut senden",
    verify_gate_resend_sent: "E-Mail erneut gesendet — prüfe auch deinen Spam-Ordner.",
    verify_gate_resend_error: "E-Mail konnte gerade nicht gesendet werden. Versuch es später erneut.",
    verify_gate_signout: "Abmelden",
    verify_email_send_failed: "Die Bestätigungs-E-Mail konnte nicht gesendet werden. Versuch es unten erneut.",
    verify_email_retry_btn: "E-Mail erneut senden",
    verify_email_resent: "E-Mail erneut gesendet ✓",
    account_created_sub: "Willkommen bei PoolGenAI. Du kannst die App jetzt nutzen.",
    start_app: "App starten",
    sign_out: "Abmelden",
    delete_account: "Konto löschen",
    delete_account_confirm: "Konto löschen? Du kannst dich danach nicht mehr anmelden. Deine Daten bleiben erhalten — du kannst ihre Wiederherstellung oder endgültige Löschung beantragen.",
    account_delete_flag_error: "Kontolöschung fehlgeschlagen. Versuche es erneut.",
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
    user_not_found: "Kein Konto mit dieser E-Mail. Falls das ein Irrtum ist, kontaktiere support@poolgenai.com",
    account_disabled: "Dieses Konto wurde gesperrt. Kontaktiere support@poolgenai.com für weitere Informationen.",
    login_failed_unified: "E-Mail oder Passwort falsch.",
    create_account_hint: "Noch kein Konto? Konto erstellen",
    email_in_use: "Diese E-Mail wird bereits verwendet.",
    weak_password: "Passwort zu kurz (mind. 6 Zeichen).",
    firebase_not_configured: "⚠️ Firebase nicht konfiguriert — nur Offline-Modus.",
    note_ph_minus: "pH vor jeder Zugabe prüfen. Max 1 kg/100 m³/Tag oder 2h Abstand.",
    note_ph_plus: "Im gesamten Becken verteilen, Filtration in Betrieb.",
    note_chlore_choc: "Abends nach Sonnenuntergang zugeben. Stabilisiert nicht (erhöht CYA nicht).",
    note_galets: "Erhöht CYA bei jeder Nutzung. Vermeiden wenn CYA bereits über 50 mg/L.",
    prod_name_ph_minus: "pH-Senker (Säure / Reva Minus Typ)",
    prod_name_ph_plus: "pH-Heber",
    prod_name_chlore_choc: "Nicht stabilisiertes Schockchlor (Chloryte Typ)",
    prod_name_galets: "5-in-1 stabilisierte Chlortabletten (Chlorilong Typ)",
    packaging_type: "Verpackung",
    packaging_vrac: "Lose / Granulat",
    packaging_galets: "Tabletten / Sticks",
    unit_weight_label: "Gewicht pro Einheit (g)",
    maintenance_ratio_label: "Herstellerangabe Pflegedosierung",
    maintenance_units_label: "Anzahl Einheiten",
    maintenance_volume_label: "Pro m³",
    maintenance_days_label: "Alle X Tage",
    unit_galets: "Tabletten",
    unit_units: "Einheiten",
    quantity_unit_mode_kg: "kg",
    quantity_unit_mode_units: "Einheiten",
    maintenance_card_title: "Laufende Pflege",
    maintenance_card_text: "{units} Tablette(n) / {volume} m³, alle {days} Tage",
    no_stock_category_hint: "Kein Produkt in dieser Kategorie auf Lager — freie Eingabe",
    no_stock_generic_hint: "Kein Produkt in dieser Kategorie auf Lager — generisches Produkt vorgeschlagen",
    prod_name_tac_plus: "KH+-Produkt (Natriumbicarbonat)",
    prod_name_calcium: "Calciumchlorid (Härte +)",
    prod_name_anti_phos: "Anti-Phosphat (PHOSfree Typ)",
    prod_name_sequestrant: "Metallsequestriermittel (Metal Free Typ)",
    prod_name_floculant: "Flüssiges Flockungsmittel (Typ Reva-Flock)",
    prod_name_sel: "Poolsalz (reines NaCl ≥ 99%, 25-kg-Sack)",
    action_ph_plus: "pH erhöhen",
    action_chlore: "Nicht stabilisiertes Chlor (Schock)",
    action_chlore_stabilise: "Stabilisiertes Chlor (CYA +)",
    action_tac_plus: "KH erhöhen",
    action_tac_minus: "KH senken",
    action_brome: "Brom",
    action_o2: "Aktivsauerstoff",
    action_sel: "Salz (Salzgehalt)",
    axis_legend_d: "ᴅ Zehnerskala (TAC, CYA, Temperatur) — rechts",
    reco_tac_low: "KH zu niedrig ({val} mg/L)",
    reco_tac_high: "KH zu hoch ({val} mg/L)",
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
    reco_recheck_later: "Erneute Kontrolle in ein paar Stunden empfohlen",
    reco_cl_shock_text: "heute Abend (Schockbehandlung)",
    reco_note_tac: "Niedriger KH macht den pH instabil.",
    reco_note_tac_minus: "Gleiche Säure wie pH-, aber die KH-Wirkung muss separat kalibriert werden. Vor dem pH korrigieren, in kleinen Dosen.",
    reco_no_product_note: "Kein Produkt für diese Aktion konfiguriert. Füge eines im Tab Produkte hinzu.",
    product_empty_delete_confirm: "{name} hat 0% Bestand. Aus der Liste entfernen?",
    product_missing_values: "Fülle diese Felder vor dem Speichern aus: {fields}.",
    reco_note_ph_before_tac: "pH vor KH korrigiert: Chlor wäre bei diesem pH-Wert wenig wirksam, und der KH ist nicht niedrig genug, um dringend zu sein.",
    reco_order_intro_default: "Diese Reihenfolge folgt der Behandlungslogik: Parameter, die die Wirksamkeit der anderen beeinträchtigen, werden zuerst korrigiert.",
    reco_order_reason_metals: "Der Sequestrierer kommt vor jedem Desinfektionsmittel, da gelöste Metalle festgestellt wurden — sonst fällt das Chlor sie aus und färbt das Becken.",
    reco_order_reason_contamination: "Das Desinfektionsmittel hat Priorität, da das gebundene Chlor hoch ist ({combined} mg/L): Ziel sind {target} mg/L freies Chlor, um den Breakpoint zu erreichen und Chloramine zu zerstören.",
    reco_order_reason_cya_block: "Die Chlorschockbehandlung wird durch Verdünnung ersetzt, da der Stabilisator (CYA) zu hoch für eine wirksame Schockbehandlung ist.",
    reco_order_reason_ph_before_tac: "Der pH-Wert kommt vor dem KH, da die Abweichung zu groß ist, um zu warten.",
    reco_order_reason_ph_chlore_delay: "Zwischen der pH-Korrektur und der Chlorschockbehandlung wird eine Wartezeit von 6 Stunden eingehalten, um Ausfällungen zu vermeiden.",
    reco_note_combined: "Gebundenes Chlor = Chloramine, Zeichen unzureichender Desinfektion. Abends zugeben, Filtration durchlaufen lassen.",
    reco_note_sel: "Poolsalz (reines NaCl ≥ 99%) verwenden. Vor dem Zugeben auflösen oder direkt beim Skimmer zugeben, 24h filtrieren.",
    reco_note_o2: "Nicht mit Chlor mischen. 4h filtrieren.",
    prod_name_o2_liquide: "Flüssiger Aktivsauerstoff (Wasserstoffperoxid)",
    note_o2_liquide: "Nicht mit Chlor mischen. Vor den Rücklaufdüsen eingießen, Filtration eingeschaltet.",
    reco_note_brome: "Weit von Wasserzuläufen entfernt zugeben, Filtration laufen lassen.",
    reco_note_cya: "Kein Produkt senkt CYA chemisch, nur Verdünnung wirkt. Stabilisiertes Chlor vermeiden solange CYA hoch ist.",
    reco_cya_block_shock: "Stabilisator zu hoch für eine wirksame Schockbehandlung ({val} mg/L)",
    reco_note_cya_block_shock: "Über 75 mg/L CYA erreicht eine klassische Chlorschockbehandlung den Breakpoint nicht mehr. Nur Verdünnung (teilweiser Wasseraustausch) wirkt — keine Chlorschockbehandlung, bevor das erledigt ist.",
    reco_fallback_tac: "KH+-Produkt (Natriumbicarbonat)",
    reco_fallback_tac_minus: "KH--Produkt (Salzsäure oder Natriumbisulfat)",
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
    paywall_perk7: "Bis zu 3 Becken, 2 Einladungen pro Becken",
    paywall_test_note: "Sichere Zahlung über Stripe. Jederzeit kündbar.",
    paywall_price_monthly: "2,99 € / Monat",
    paywall_price_yearly: "24,99 € / Jahr",
    paywall_price_yearly_hint: "oder 24,99 € / Jahr",
    paywall_plan_monthly: "Monatlich",
    paywall_plan_yearly: "Jährlich",
    paywall_plan_yearly_badge: "-30%",
    manage_subscription_btn: "Abo verwalten",
    checkout_error: "Bezahlung konnte nicht gestartet werden. Versuche es erneut.",
    portal_error: "Abo-Verwaltung konnte nicht geöffnet werden. Versuche es erneut.",
    stripe_activation_checking: "Zahlung wird bestätigt…",
    stripe_activation_delay_title: "Das dauert länger als gewöhnlich",
    stripe_activation_delay_desc: "Deine Zahlung ist eingegangen, die Aktivierung dauert aber etwas länger. Lade die App in einer Minute neu.",
    stripe_activation_continue_btn: "Weiter",
    premium_reveal_title: "Premium aktiviert",
    premium_reveal_sub: "Bis zu 3 Becken, 2 Einladungen pro Becken, unbegrenzte Messungen",
    premium_downgrade_title: "Zurück zur kostenlosen Version",
    premium_downgrade_sub: "Premium-Funktionen sind jetzt deaktiviert",
    premium_downgrade_confirm_title: "Premium deaktivieren?",
    premium_downgrade_confirm_desc: "Du verlierst den Zugriff auf:",
    premium_downgrade_confirm_btn: "Premium deaktivieren",
    premium_downgrade_cancel_btn: "Abbrechen und Premium behalten",
    onboarding_step1_title: "Willkommen bei PoolGenAI",
    onboarding_step1_text: "Behalte die Chemie deines Pools im Blick: Messungen, Dosierung und ein persönlicher Behandlungsplan.",
    onboarding_step2_title: "Ein Foto genügt",
    onboarding_step2_text: "Fotografiere deinen Teststreifen oder das Display deines Photometers. Die KI liest die Farben und füllt die Felder für dich aus — kein Vergleichen von Hand mehr.",
    onboarding_step3_title: "Klare Ergebnisse",
    onboarding_step3_text: "Jeder Parameter wird mit seinem Zielwert verglichen: pH, Chlor, TAC, Stabilisator... Eine einfache Farbcodierung zeigt dir auf einen Blick, was passt und was korrigiert werden muss.",
    onboarding_step4_title: "Ein priorisierter Plan",
    onboarding_step4_text: "Die App legt die Reihenfolge der Behandlungen und die Wartezeiten zwischen den Schritten fest, damit du keine Behandlung durch zu schnelles Vorgehen verschwendest.",
    onboarding_step5_title: "Sicher anwenden",
    onboarding_step5_text: "Die genaue Dosis wird für das Volumen deines Pools und das verwendete Produkt berechnet. Hake den Schritt ab, sobald er erledigt ist, und die App geht zum nächsten über.",
    onboarding_step6_title: "Verfolge den Verlauf",
    onboarding_step6_text: "Sieh dir deine Messungen im Zeitverlauf an, um Trends zu erkennen und Abweichungen zu bemerken, bevor sie zum Problem werden.",
    onboarding_step7_title: "Behalte deinen Bestand im Blick",
    onboarding_step7_text: "Verfolge die verbleibenden Mengen jedes Produkts und erhalte eine Warnung, bevor der Vorrat zur Neige geht.\n\nFüge deine erste Messung hinzu, wann immer du möchtest. Bis zu 3 Becken, PDF-Berichte und mehr: entdecke Premium später in den Einstellungen.",
    onboarding_step3_legend_bad: "Zu hoch oder zu niedrig",
    onboarding_next: "Weiter",
    onboarding_skip: "Überspringen",
    onboarding_start: "Los geht's",
    help_section: "Hilfe",
    settings_replay_onboarding: "Einführung erneut ansehen",
    context_switch_premium_title: "Premium-Pool",
    context_switch_premium_sub: "Dieser Pool profitiert von den Premium-Funktionen seines Eigentümers",
    context_switch_free_title: "Zurück zu deinem Pool",
    context_switch_free_sub: "Du bist zurück auf deinem eigenen Pool",
    report_print_btn: "Drucken / Als PDF speichern",
    share_report: "Bericht teilen",
    report_email_subject: "PoolGenAI-Bericht — {pool}",
    report_email_greeting: "Hallo,",
    report_email_body: "Anbei finden Sie die Anweisungen zum Abrufen des PDF-Berichts für das Becken \"{pool}\":",
    report_email_step1: "1. Öffnen Sie die PoolGenAI-App",
    report_email_step2: "2. Verlauf-Tab → Bericht generieren",
    report_email_step3: "3. Klicken Sie auf \"Drucken / Als PDF speichern\"",
    report_email_sign: "Mit freundlichen Grüßen,",
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
    unlimited_version: "Premium",
    active_pool: "Aktives Becken",
    pool_volume: "Beckenvolumen (m³)",
    treatment_params: "Parameter:",
    treatment_desc: "Die Behandlung bestimmt, welche Parameter gemessen werden und die empfohlenen Ziele. Das Volumen wird zur Berechnung der Produktdosen verwendet.",
    subscription: "Abonnement",
    unlimited_active: "Premium-Modus aktiv",
    free_mode: "Kostenlose Version",
    api_section: "KI-ANALYSE",
    ai_toggle_label: "KI-Analyse aktivieren",
    ai_toggle_desc: "Ermöglicht die Analyse von Messfotos mit künstlicher Intelligenz.",
    calibration_toggle_label: "Zur kollektiven Verbesserung beitragen",
    calibration_toggle_desc: "Teilt anonyme Kalibrierungsdaten (gemessene Farbe, Referenzwert), um die Teststreifen-Ablesung für alle zu verbessern. Es werden keine Fotos oder Kennungen übertragen.",
    ai_password_title: "KI-Konfigurationszugang",
    ai_password_prompt: "Passwort eingeben, um KI-Analyse zu aktivieren",
    ai_password_error: "Falsches Passwort",
    ai_configure_btn: "API-Schlüssel konfigurieren",
    ai_config_title: "KI-Konfiguration",
    ai_config_back: "Zurück zu den Einstellungen",
    ai_locked_settings: "KI-Analyse nur in Premium",
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
    delegation_section_title: "Delegation",
    linked_pools_title: "Becken, zu denen ich eingeladen bin",
    linked_pools_empty: "Du hast als Gast keinen Zugriff auf ein Becken.",
    request_revocation_button: "Widerruf beantragen",
    request_revocation_confirm: "Widerruf deines Zugriffs auf das Becken \"{pool}\" beantragen? {pseudo} erhält eine E-Mail zur Bestätigung.",
    request_revocation_sent: "Anfrage gesendet. Du erhältst eine E-Mail, sobald der Widerruf bestätigt ist.",
    request_revocation_error: "Anfrage konnte nicht gesendet werden.",
    secondary_section_title: "Zweitnutzer",
    secondary_section_intro: "Lade bis zu 2 Personen ein, auf dasselbe Becken zuzugreifen (nur in Premium).",
    secondary_invite_requires_premium: "Einladungen sind Premium vorbehalten.",
    secondary_invite_pool_full: "Dieses Becken hat bereits 2 Eingeladene, das ist das Maximum.",
    secondary_invite_button: "Jemanden einladen",
    secondary_invite_email_label: "E-Mail der einzuladenden Person",
    secondary_invite_pool_label: "Becken",
    secondary_invite_send: "Einladung senden",
    secondary_invite_sent: "Einladung gesendet.",
    secondary_invite_error: "Einladung fehlgeschlagen",
    secondary_active_title: "Aktive Zugänge",
    secondary_active_empty: "Kein aktiver Zugang.",
    secondary_pool_label: "Becken: {pool}",
    secondary_revoke_button: "Widerrufen",
    secondary_revoke_confirm: "Zugang von {email} widerrufen?",
    secondary_revoke_error: "Widerruf fehlgeschlagen",
    secondary_pending_title: "Ausstehende Einladungen",
    secondary_pending_empty: "Keine ausstehenden Einladungen.",
    secondary_pending_expires: "Läuft ab am {date}",
    secondary_pending_expired: "Abgelaufen",
    secondary_cancel_button: "Abbrechen",
    secondary_cancel_confirm: "Die an {email} gesendete Einladung stornieren?",
    secondary_cancel_error: "Stornierung fehlgeschlagen",
    pseudo_label: "Dein Spitzname",
    pseudo_placeholder: "Sichtbar für Personen, die dich einladen",
    pseudo_save: "Speichern",
    pseudo_saved: "Spitzname gespeichert.",
    pseudo_invalid: "2 bis 24 Zeichen (Buchstaben, Zahlen, Leerzeichen, Bindestriche).",
    pseudo_taken_suggestion: "Bereits vergeben. Versuche: {suggestion}",
    pseudo_error: "Speichern des Spitznamens fehlgeschlagen",
    context_title: "Angezeigtes Becken",
    context_own: "Meine Becken",
    secondary_pool_unavailable_title: "Becken nicht verfügbar",
    secondary_pool_unavailable_desc: "Dieses Becken wurde nicht gefunden. Es wurde eventuell gelöscht, oder es gibt ein Netzwerkproblem beim Laden. Versuche es später erneut.",
    secondary_pool_revoked_desc: "Dein Zugriff auf dieses Becken wurde vom Eigentümer widerrufen.",
    secondary_invited_label: "{pool} - Eingeladen",
    context_loading: "Becken wird geladen…",
    context_secondary_option: "Becken von {pseudo}",
    banner_secondary: "{pool} — Konto von {pseudo}",
    invite_response_title: "Einladung",
    invite_response_text: "{pseudo} lädt dich ein, auf das Becken {pool} zuzugreifen.",
    invite_response_accept: "Annehmen",
    invite_response_decline: "Ablehnen",
    invite_response_accepted: "Einladung angenommen. Du findest das Becken in den Einstellungen.",
    invite_response_declined: "Einladung abgelehnt.",
    invite_response_expired: "Diese Einladung ist abgelaufen.",
    invite_response_limit_reached: "Limit von 2 eingeladenen Becken im kostenlosen Plan erreicht — wechsle zu Premium, um mehr anzunehmen.",
    invite_response_requires_premium: "Dieses Konto ist nicht mehr in Premium, die Einladung kann nicht angenommen werden.",
    invite_response_invalid: "Ungültige oder bereits verwendete Einladung.",
    invite_response_mismatch: "Diese Einladung passt nicht zu deinem angemeldeten Konto.",
    invite_response_error: "Fehler bei der Verarbeitung der Einladung.",
    invite_response_checking: "Einladung wird geprüft…",
    revocation_response_title: "Widerrufsanfrage",
    revocation_response_text: "{pseudo} hat den Widerruf der Einladung zum Becken {pool} beantragt.",
    revocation_response_accept: "Widerrufsanfrage bestätigen",
    revocation_response_done: "Widerruf durchgeführt.",
    revocation_response_invalid: "Diese Anfrage existiert nicht mehr oder wurde bereits bearbeitet.",
    revocation_response_expired: "Diese Widerrufsanfrage ist abgelaufen.",
    revocation_response_mismatch: "Diese Anfrage passt nicht zu deinem angemeldeten Konto.",
    revocation_response_error: "Fehler bei der Bearbeitung der Anfrage.",
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
    daily_limit: "Limite giornaliero raggiunto — passa a Premium",
    apply_advice: "Applica questi consigli",
    apply_advice_sub: "Seleziona i consigli applicati e inserisci le quantità reali.",
    advice_applied: "Consigli applicati",
    advice_partial: "parzialmente applicati",
    adjust: "Regola",
    ai_analysis: "ANALISI IA",
    ai_analyze_btn: "Analizza con l'IA",
    ai_locked: "Funzione riservata a Premium",
    ai_analyzing: "Analisi in corso…",
    ai_api_missing: "Inserisci la tua chiave API nelle Impostazioni per abilitare l'analisi IA.",
    follow_order: "Segui i passaggi nell'ordine: ogni trattamento modifica l'equilibrio dell'acqua.",
    in_range: "Nell'intervallo",
    too_high: "Troppo alto",
    too_low: "Troppo basso",
    target: "obiettivo",
    evolution: "Evoluzione",
    show_values: "Mostra valori sul grafico",
    show_all_params: "Mostra parametri",
    hide_all_params: "Nascondi parametri",
    journal: "Registro",
    no_history: "Ancora nessuno storico",
    no_history_sub: "Le tue misurazioni appariranno qui nel tempo.",
    report: "Rapporto",
    time_col: "Orario",
    advised_col: "Consigliato",
    ccl_col: "CCL",
    hard_col: "TH",
    phos_col: "Fos.",
    copper_col: "Rame",
    iron_col: "Ferro",
    param_ccl: "Cloro combinato (CCL)",
    param_hard: "Durezza (TH)",
    param_phos: "Fosfati",
    param_copper: "Rame",
    param_iron: "Ferro",
    reco_hard_low: "Durezza troppo bassa ({val} mg/L)",
    reco_hard_high: "Durezza troppo alta ({val} mg/L)",
    reco_phos_high: "Fosfati troppo alti ({val} µg/L)",
    reco_copper_high: "Rame troppo alto ({val} mg/L)",
    reco_iron_high: "Ferro troppo alto ({val} mg/L)",
    reco_fallback_hard: "Cloruro di calcio",
    reco_fallback_phos: "Anti-fosfati",
    reco_fallback_sequestrant: "Sequestrante metalli",
    note_tac_plus: "Aggiungere gradualmente, filtrazione in funzione. Attendere 6h.",
    note_calcium: "Diluire prima dell'aggiunta. Filtrazione in funzione.",
    note_anti_phos: "Versare davanti all'ugello di ritorno, filtrazione 24h.",
    note_sequestrant: "Trattamento rame/ferro. Versare intorno alla vasca.",
    note_floculant: "Trattamento puntuale per acqua torbida, non monitorato automaticamente dall'app. Versare davanti agli ugelli di mandata, filtrazione in funzione, poi fermare per 24h per la decantazione.",
    action_hard_plus: "Aumenta la durezza (TH)",
    action_phos_minus: "Riduce i fosfati",
    action_sequestrant: "Sequestrante metalli (rame/ferro)",
    action_floculant: "Flocculante / chiarificante",
    action_outil_mesure: "Strumento di misura (strisce reattive, ecc.)",
    legal_notices: "Note legali",
    lcen_title: "Note legali",
    lcen_editor: "Editore",
    lcen_editor_val: "Arnaud Goumain — Privato",
    lcen_host: "Hosting",
    lcen_host_val: "GitHub Inc. / Microsoft Corporation\n88 Colin P Kelly Jr St\nSan Francisco, CA 94107, USA",
    lcen_contact: "Contatto",
    lcen_contact_val: "support@poolgenai.com",
    lcen_cgu_title: "Termini di utilizzo",
    lcen_ai_title: "Intelligenza artificiale",
    lcen_ai_val: "Quando utilizzi l'analisi IA, i tuoi dati passano attraverso l'infrastruttura tecnica dell'editore (server intermediario), che utilizza una chiave API sottoscritta dall'editore. Nessuna conservazione né registrazione dei contenuti trasmessi su questo server.",
    lcen_photos_title: "Foto",
    lcen_photos_val: "Inviare solo foto di apparecchiature di misurazione o acqua della piscina. Esclusi: persone identificabili, elementi di localizzazione, dati personali visibili.",
    lcen_gdpr: "Dati personali",
    lcen_gdpr_val: "Ai sensi del RGPD, hai il diritto di accedere, rettificare, cancellare e trasferire i tuoi dati. Contattaci all'indirizzo sopra o presenta un reclamo all'autorità di protezione dei dati.",
    lcen_calibration_title: "Miglioramento collettivo delle analisi foto",
    lcen_calibration_val: "Quando una misurazione include sia una foto del fotometro sia una foto della striscia reattiva per lo stesso parametro, PoolGenAI può estrarre un dato di calibrazione anonimo (colore misurato, valore di riferimento, tipo di striscia identificato) e condividerlo con tutti gli utenti dell'applicazione, al solo scopo di migliorare la precisione dell'interpretazione delle strisce reattive per tutti. Questi dati di calibrazione non contengono foto, identificativi dell'account né alcuna informazione che permetta di risalire all'utente originario. L'utente può disattivare questo contributo in qualsiasi momento nelle impostazioni dell'applicazione; il rifiuto non influisce sull'uso normale di PoolGenAI.",
    lcen_photocontrib_title: "Contributo di foto al database comune dei prodotti",
    lcen_photocontrib_val: "Quando un utente fotografa un prodotto che non ha ancora una foto nel database comune dei prodotti condiviso tra utenti, questa foto può essere trasmessa e memorizzata per illustrare la scheda prodotto corrispondente, visibile a tutti gli utenti. È interessata solo la foto del prodotto stesso. Una volta contribuita, la foto non può essere ritirata individualmente — nessuna informazione collega una foto al suo contributore.",
    photo_warning_title: "Attenzione prima di fotografare",
    photo_warning_body: "Assicurati che la foto non contenga:\n• persone identificabili\n• elementi che possano localizzare la tua abitazione\n• dati personali visibili\n\nTi consigliamo di disattivare la geolocalizzazione nelle impostazioni della fotocamera.",
    photo_warning_confirm: "Ho capito, continua",
    ai_clause_title: "Analisi IA",
    ai_clause_body: "Quando attivi l'analisi IA, i tuoi dati (misure e foto) passano attraverso l'infrastruttura tecnica di PoolGenAI, che utilizza una chiave API sottoscritta dall'editore — non devi fornire alcuna chiave. Nessuna conservazione né registrazione dei contenuti trasmessi su questo server intermediario.",
    cgu_update_title: "Termini aggiornati",
    cgu_update_body: "I termini di utilizzo sono stati aggiornati (v{version}). Per favore leggili e accettali per continuare.",
    cgu_update_accept: "Leggi e accetta",
    cgu_version_label: "Versione termini",
    cgu_accepted_on: "Accettato il",
    cgu_updated_title: "Termini aggiornati",
    cgu_updated_body: "I termini di utilizzo sono stati aggiornati. Si prega di rileggerli e accettarli.",
    cgu_required_title: "Termini di utilizzo",
    cgu_required_body: "Accetta i nostri termini di utilizzo per continuare.",
    cgu_read_full_text: "Leggi il testo completo",
    cgu_hide_full_text: "Nascondi il testo",
    applied_col: "Applicato",
    disclaimer_title: "Note legali & Condizioni d'uso",
    disclaimer_cgu: "Accetto i termini di utilizzo e la politica sulla privacy",
    disclaimer_data: "Acconsento alla raccolta dei miei dati di trattamento e alla possibile condivisione con partner del settore piscine/spa",
    disclaimer_required: "L'accettazione dei termini è obbligatoria",
    disclaimer_pro: "I professionisti che utilizzano PoolGenAI per conto di terzi devono ottenere il consenso dei proprietari delle vasche.",
    revoke_data_consent: "Revoca consenso dati",
    revoke_data_confirm: "Il tuo consenso è stato revocato.",
    pool_email: "Email rapporto PDF",
    pool_email_placeholder: "contatto@esempio.it",
    pool_settings_title: "Impostazioni vasca",
    edit_pool: "Modifica vasca",
    generate_report: "Genera rapporto della vasca",
    report_locked: "Rapporto PDF riservato a Premium",
    report_desc: "Il rapporto include lo storico delle misurazioni, i consigli dati e le quantità effettivamente applicate.",
    diag_section: "DIAGNOSI IA",
    diag_placeholder: "Descrivi il problema che stai riscontrando con la tua vasca nonostante i trattamenti (es. acqua torbida, cloro che scompare, alghe persistenti...)",
    diag_submit: "Analizza con l'IA",
    diag_analyzing: "Analisi in corso...",
    diag_confidence: "Indice di fiducia",
    diag_history_title: "Storico diagnosi IA",
    diag_history_date: "Data",
    diag_history_note: "Nota",
    diag_history_response: "Risposta IA",
    diag_history_confidence: "Fiducia",
    diag_history_delete: "Elimina",
    diag_history_empty: "Nessuna diagnosi salvata per ora.",
    diag_history_locked: "Storico diagnosi IA riservato a Premium",
    diag_history_confirm_delete: "Eliminare questa diagnosi?",
    update_required_title: "Nuova versione disponibile",
    update_required_desc: "È stata rilasciata una nuova versione di PoolGenAI. Aggiorna l'app per continuare.",
    update_required_btn: "Aggiorna ora",
    update_in_progress_title: "Aggiornamento in corso",
    update_in_progress_desc: "Ci vuole solo un attimo, l'app si ricaricherà automaticamente.",
    diag_off_topic: "Questa domanda non riguarda il trattamento dell'acqua della piscina. Rispondo solo a domande sulla chimica dell'acqua, sui prodotti di trattamento e sulle attrezzature per piscine.",
            diag_error: "Analisi impossibile",
    import_pdf_btn: "Importa rapporto PDF",
    import_pdf_prefill_title: "Misurazione importata da PDF",
    import_pdf_analyzing: "L'IA sta leggendo il file...",
    import_pdf_error: "Impossibile leggere questo file",
    import_pdf_no_values: "Nessun valore trovato in questo file",
    import_pdf_needs_ai: "Importazione PDF disponibile con analisi IA (Impostazioni → Attiva analisi IA)",
    import_diag_added_one: "1 diagnosi IA importata da questo documento.",
    import_diag_added_many: "{n} diagnosi IA importate da questo documento.",
    suspended_title: "Account sospeso",
    suspended_desc: "Il tuo account è stato sospeso e l'accesso all'app non è più disponibile.",
    suspended_erase_btn: "Cancella i miei dati",
    suspended_erasing: "Cancellazione in corso...",
    suspended_erase_confirm: "Questa azione elimina definitivamente tutti i tuoi dati (misurazioni, prodotti, storico, diagnosi). Continuare?",
    legend_title: "Legenda parametri e valori target",
    ccl_fcl_tcl_error: "Errore: FCL + CCL non può superare TCL. Verificare i valori inseriti.",
    tcl_forced_to_fcl_info: "TCL non può essere inferiore a FCL — valore corretto a {val}. Tocca di nuovo Salva per confermare.",
    param_ph_long: "Potenziale di idrogeno", param_fcl_long: "Cloro libero", param_tcl_long: "Cloro totale",
    param_ccl_long: "Cloro combinato (cloroammine)", param_tac_long: "Alcalinità totale",
    param_cya_long: "Acido cianurico (stabilizzante)", param_th_long: "Durezza totale",
    param_phos_long: "Fosfati", param_cu_long: "Rame", param_fe_long: "Ferro", param_temp_long: "Temperatura acqua",
    new_measure_title: "Nuova misurazione",
    edit_measure_title: "Modifica misurazione",
    date_time: "Data e ora",
    photo_hint: "Fotografa lo schermo del tuo fotometro con valori leggibili, o posiziona il tuo striscio bagnato accanto alla legenda del tubo e fotografali insieme.",
    photo_hint_bandelette: "Striscia reattiva: scatta 2-3 foto ruotando il tubo per esporre ogni scala di colore.",
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
    analyze_locked: "Foto + analisi IA riservate a Premium",
    product_ai_hint: "Attiva l'analisi IA nelle Impostazioni per compilare automaticamente questi campi dalla foto.",
    product_sync_error: "Sincronizzazione prodotti fallita — la foto è forse troppo pesante, riprova con una foto più leggera.",
    config_sync_error: "Sincronizzazione fallita — controlla la connessione. ({detail})",
    repair_orphaned_title: "{count} voce/i orfana/e rilevata/e",
    repair_orphaned_desc: "Alcune misure, trattamenti o prodotti non sono collegati a nessuna piscina esistente (spesso dopo un bug di sincronizzazione). Verranno ricollegati alla tua piscina attiva.",
    repair_orphaned_btn: "Ripara ora",
    repair_orphaned_confirm: "Ricollegare {count} voce/i orfana/e alla piscina attiva?",
    delete_pool_confirm: "Disattivare questa piscina? Non sarà più visibile nell'app, ma lo storico viene conservato.",
    account_deleted_title: "Account eliminato",
    account_deleted_desc: "Questo account è stato eliminato e l'accesso all'app non è più disponibile.",
    account_deleted_request_btn: "Non ricominciare con questo indirizzo, e richiedi il recupero o l'eliminazione dei miei dati",
    back_to_home: "Torna alla pagina iniziale",
    reactivate_btn: "Ricomincia con questo indirizzo",
    reactivate_confirm: "Ricominciare da zero con questo indirizzo? Le tue piscine attuali saranno nascoste (mai più mostrate, ma non eliminate). Dovrai creare una nuova piscina.",
    reset_password_hint: "Reimposta la mia password",
    data_request_title: "Recupero o eliminazione dei dati",
    data_request_desc: "Scegli l'azione desiderata. Una richiesta sarà inviata al supporto, che ti contatterà via email.",
    data_request_option_erase: "Elimina tutti i miei dati",
    data_request_option_recover: "Recupera tutti i miei dati, non eliminarli",
    data_request_option_recover_erase: "Recupera ed elimina tutti i miei dati",
    data_request_submit: "Invia richiesta",
    data_request_sending: "Invio in corso...",
    data_request_sent: "Richiesta inviata. Il supporto ti contatterà via email.",
    data_request_error: "Invio non riuscito. Riprova o scrivi direttamente a support@poolgenai.com.",
    note_optional: "Nota (opzionale)",
    note_placeholder: "Acqua torbida, sole forte, nuoto previsto...",
    save_measure: "Salva misurazione",
    save: "Salva",
    cancel: "Annulla",
    save_changes: "Salva modifiche",
    my_products: "I MIEI PRODOTTI",
    products_formula: "Il dosaggio è calcolato come: {quantità} per variare il parametro di {effetto} per {volume} m³.",
    products_to_buy: "Prodotti da acquistare",
    products_to_buy_empty: "Niente da acquistare al momento — le scorte sono sufficienti.",
    generic_products_section: "Prodotti consigliati mancanti",
    generic_products_hint: "In base al tipo di trattamento di questa piscina, questi prodotti non sono ancora nella tua lista.",
    add_generic_product: "Aggiungi",
    generic_product_added: "Aggiunto ai tuoi prodotti",
    reason_low_stock: "Scorta bassa",
    reason_insufficient_plan: "Insufficiente per il piano in corso",
    apply_product_manual: "Applica un prodotto",
    reason_manual_maintenance: "Manutenzione manuale",
    products_locked: "Funzione riservata a Premium",
    stock_not_managed: "La gestione dello stock non è attivata per questa vasca. Attivala nelle Impostazioni.",
    activate_in_settings: "Attiva nelle Impostazioni →",
    delete_all_products: "Elimina tutti i prodotti per questa vasca",
    stock_label: "Stock:",
    stock_remaining: "rimanente",
    edit_product: "Modifica prodotto",
    new_product: "Nuovo prodotto",
    product_photo: "Foto prodotto (etichetta)",
    product_photo_hint: "Scatta una foto per ogni elemento — fronte del prodotto, codice a barre, foglio dosaggio — per un riconoscimento più affidabile. Una sola foto basta se tutto è visibile su di essa.",
    common_product_candidate_title: "Prodotto simile trovato nel database comune:",
    common_product_same: "Sì, stesso prodotto",
    common_product_different: "No, prodotto diverso",
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
    stock_locked: "Gestione stock riservata a Premium",
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
    wizard_title: "Piano di trattamento",
    wizard_step: "Passo",
    wizard_of: "di",
    wizard_now: "Adesso",
    wizard_in: "Tra",
    wizard_at: "alle",
    wizard_scheduled: "Previsto",
    wizard_earliest: "Al più presto",
    chlore_timing_tip: "Per una migliore efficacia, applica preferibilmente la sera, dopo l'ultimo bagno e al tramonto.",
    wizard_done: "Fatto",
    wizard_skip: "Salta questo passo",
    wizard_anticipate: "Applica ora",
    wizard_finish: "Termina piano",
    wizard_reminder: "Ricordarmi il prossimo passo?",
    wizard_reminder_yes: "Sì, ricordami",
    wizard_reminder_no: "No grazie",
    wizard_next_step: "Prossimo passo",
    wizard_start: "Avvia piano",
    plan_in_progress: "Piano di trattamento in corso",
    wizard_apply_time: "Orario di applicazione",
    wizard_edit_prev: "Modifica fase precedente",
    wizard_resume: "Riprendi piano",
    wizard_completed: "Piano di trattamento completato ✓",
    wizard_partial: "Piano in corso",
    countdown_done: "È ora di trattare!",
    treatment_at: "Trattamento applicato alle",
    edit_treatment_section_title: "Trattamento applicato",
    treatment_skipped: "Passo saltato",
    settings_title: "Impostazioni",
    my_pools: "Le mie vasche",
    pool_name: "Nome vasca",
    location: "Posizione",
    volume: "Volume (m³)",
    treatment_type: "Tipo di trattamento",
    measure_device_label: "Metodo di misurazione",
    measure_device_photometre: "Solo fotometro",
    measure_device_bandelette: "Solo striscia reattiva",
    measure_device_both: "Entrambi",
    strip_model_label: "Modello di striscia reattiva utilizzato",
    strip_model_none: "Non specificato",
    filtration_type: "Tipo di filtrazione",
    manage_stock_label: "Gestione stock",
    manage_stock_desc: "Tiene traccia del consumo dei prodotti e lo mostra nel rapporto.",
    manage_stock_locked: "Disponibile in Premium",
    api_key_label: "Chiave API Anthropic o URL proxy Cloudflare Worker",
    provider_label: "Provider",
    api_key_placeholder: "sk-ant-... o https://mio-proxy.workers.dev",
    api_key_desc: "La tua chiave è memorizzata localmente.",
    premium_section: "VERSIONE",
    premium_label: "Versione Premium",
    premium_test: "Abbonamento mensile o annuale",
    premium_desc: "Gratuito: 1 vasca, nessun invito, 1 misurazione al giorno. Premium: fino a 3 vasche, 2 inviti per vasca, misurazioni illimitate, foto, prodotti.",
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
    cl_libre_col: "FCL",
    cl_total_col: "TCL",
    tac_col: "TAC",
    cya_col: "CYA",
    temp_col: "TEMP.",
    product_col: "Prodotto",
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
    paywall_title: "Passa a Premium",
    paywall_desc: "Misurazioni illimitate · Analisi IA strisce · Rapporto PDF · Gestione stock",
    paywall_context_measure_limit: "Hai raggiunto il limite di 1 misurazione gratuita al giorno.",
    paywall_context_start_plan: "Il monitoraggio del trattamento passo passo è riservato a Premium.",
    paywall_context_products: "La gestione di prodotti e stock è riservata a Premium.",
    pool_limit_reached: "Limite di 3 vasche raggiunto in Premium.",
    paywall_context_report: "Il rapporto PDF è riservato a Premium.",
    paywall_context_photos: "L'analisi foto IA è riservata a Premium.",
    paywall_context_stock: "La gestione dello stock è riservata a Premium.",
    ai_timer_hint: "El análisis puede tardar hasta 30 segundos.",
    ai_reliability: "Fiabilidad del análisis",
    ai_no_values: "Ningún valor legible en esta foto. Verifica la calidad y orientación de la imagen.",
    paywall_btn: "Attiva Premium",
    paywall_close: "Più tardi",
    add_pool_title: "Nuova vasca",
    first_pool_title: "Benvenuto su PoolGenAI",
    first_pool_intro: "Configura la tua prima vasca per iniziare a monitorare la chimica dell'acqua.",
    edit_pool_title: "Modifica vasca",
    pool_name_placeholder: "La mia piscina",
    pool_location_placeholder: "Cerca una città...",
    location_use_gps: "Usa la mia posizione",
    location_searching: "Ricerca...",
    location_search_error: "Ricerca non disponibile, riprova",
    location_no_results: "Nessuna città trovata",
    location_gps_error: "Posizione non disponibile",
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
    pool_photo_locked: "Foto vasca riservate a Premium",
    sign_in: "Accedi",
    account_section: "Il mio account",
    confirm_password: "Conferma password",
    pwd_min6: "Minimo 6 caratteri",
    error_pwd_mismatch: "Le password non corrispondono.",
    error_email_required: "Email non valida.",
    account_created: "Account creato!",
    verify_email_notice: "Un'email di conferma è stata inviata al tuo indirizzo. Clicca sul link per attivare il tuo account.",
    verify_gate_title: "Verifica il tuo indirizzo email",
    verify_gate_desc: "Per accedere all'app, conferma il tuo indirizzo cliccando sul link ricevuto via email",
    verify_gate_check_btn: "Confermato — Continua",
    verify_link_checking: "Verifica della tua email in corso…",
    verify_link_verified_title: "Email verificata!",
    verify_link_verified_desc: "Il tuo indirizzo email è confermato. Puoi continuare.",
    verify_link_already_title: "Già verificata",
    verify_link_already_desc: "Questo indirizzo email era già confermato.",
    verify_link_expired_title: "Link scaduto",
    verify_link_expired_desc: "Questo link di verifica è scaduto. Richiedi una nuova email dall'app.",
    verify_link_invalid_title: "Link non valido",
    verify_link_invalid_desc: "Questo link di verifica non è valido. Richiedi una nuova email dall'app.",
    verify_link_error_title: "Errore",
    verify_link_error_desc: "Impossibile verificare la tua email al momento. Riprova più tardi.",
    verify_link_continue_btn: "Continua verso l'app",
    merge_link_pending_title: "Confermare la fusione?",
    merge_link_pending_desc: "È stato rilevato un codice a barre per una scheda prodotto già presente nel database comune, senza codice a barre collegato. Conferma per collegare i due.",
    merge_link_confirm_btn: "Conferma la fusione",
    merge_link_cancel_btn: "Annulla",
    merge_link_confirming: "Fusione in corso…",
    merge_link_merged_title: "Fusione confermata",
    merge_link_merged_desc: "Il codice a barre è stato collegato alla scheda prodotto esistente.",
    merge_link_already_merged_title: "Già fusa",
    merge_link_already_merged_desc: "Questa fusione era già stata confermata.",
    merge_link_expired_title: "Link scaduto",
    merge_link_expired_desc: "Questo link di conferma è scaduto (valido 7 giorni).",
    merge_link_invalid_title: "Link non valido",
    merge_link_invalid_desc: "Questo link di conferma non è valido.",
    merge_link_error_title: "Errore",
    merge_link_error_desc: "Impossibile confermare la fusione al momento. Riprova più tardi.",
    verify_gate_checking: "Verifica in corso...",
    verify_gate_still_unverified: "La tua email non è ancora confermata. Controlla la posta in arrivo (e lo spam).",
    verify_gate_resend_btn: "Reinvia l'email di conferma",
    verify_gate_resend_sent: "Email reinviata — controlla anche lo spam.",
    verify_gate_resend_error: "Impossibile inviare l'email ora. Riprova più tardi.",
    verify_gate_signout: "Disconnetti",
    verify_email_send_failed: "Impossibile inviare l'email di conferma. Riprova qui sotto.",
    verify_email_retry_btn: "Reinvia email",
    verify_email_resent: "Email reinviata ✓",
    account_created_sub: "Benvenuto su PoolGenAI. Puoi usare l'app ora.",
    start_app: "Avvia l'app",
    sign_out: "Disconnetti",
    delete_account: "Elimina account",
    delete_account_confirm: "Eliminare il tuo account? Non potrai più accedere. I tuoi dati restano conservati — potrai richiederne il recupero o l'eliminazione definitiva.",
    account_delete_flag_error: "Eliminazione dell'account non riuscita. Riprova.",
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
    user_not_found: "Nessun account con questa email. Se pensi sia un errore, contatta support@poolgenai.com",
    account_disabled: "Questo account è stato disattivato. Contatta support@poolgenai.com per maggiori informazioni.",
    login_failed_unified: "Email o password errati.",
    create_account_hint: "Non hai un account? Creane uno",
    email_in_use: "Questa email è già in uso.",
    weak_password: "Password troppo corta (min 6 caratteri).",
    firebase_not_configured: "⚠️ Firebase non configurato — solo modalità offline.",
    note_ph_minus: "Controllare il pH prima di ogni aggiunta. Max 1 kg/100 m³/giorno o distanziare di 2h.",
    note_ph_plus: "Distribuire in tutta la vasca con filtrazione in funzione.",
    note_chlore_choc: "Versare la sera dopo il tramonto. Non stabilizza (non aumenta il CYA).",
    note_galets: "Aumenta il CYA ad ogni utilizzo. Evitare se il CYA è già sopra 50 mg/L.",
    prod_name_ph_minus: "Riduttore pH (acido / tipo Reva Minus)",
    prod_name_ph_plus: "Aumentatore pH",
    prod_name_chlore_choc: "Cloro shock non stabilizzato (tipo Chloryte)",
    prod_name_galets: "Pastiglie cloro stabilizzato 5-in-1 (tipo Chlorilong)",
    packaging_type: "Confezione",
    packaging_vrac: "Sfuso / granulare",
    packaging_galets: "Pastiglie / stick",
    unit_weight_label: "Peso per unità (g)",
    maintenance_ratio_label: "Rapporto di manutenzione del produttore",
    maintenance_units_label: "N. unità",
    maintenance_volume_label: "Per m³",
    maintenance_days_label: "Ogni X giorni",
    unit_galets: "pastiglie",
    unit_units: "unità",
    quantity_unit_mode_kg: "kg",
    quantity_unit_mode_units: "unità",
    maintenance_card_title: "Manutenzione continua",
    maintenance_card_text: "{units} pastiglia/e / {volume} m³, ogni {days} giorni",
    no_stock_category_hint: "Nessun prodotto in stock in questa categoria — inserimento libero",
    no_stock_generic_hint: "Nessun prodotto in stock in questa categoria — prodotto generico proposto",
    prod_name_tac_plus: "Prodotto TAC+ (bicarbonato di sodio)",
    prod_name_calcium: "Cloruro di calcio (durezza +)",
    prod_name_anti_phos: "Anti-fosfati (tipo PHOSfree)",
    prod_name_sequestrant: "Sequestrante metalli (tipo Metal Free)",
    prod_name_floculant: "Flocculante chiarificante liquido (tipo Reva-Flock)",
    prod_name_sel: "Sale da piscina (NaCl puro ≥ 99%, sacco 25 kg)",
    action_ph_plus: "Alza il pH",
    action_chlore: "Cloro non stabilizzato (shock)",
    action_chlore_stabilise: "Cloro stabilizzato (CYA +)",
    action_tac_plus: "Alza il TAC",
    action_tac_minus: "Abbassa il TAC",
    action_brome: "Bromo",
    action_o2: "Ossigeno attivo",
    action_sel: "Sale (salinità)",
    axis_legend_d: "ᴅ scala decine (TAC, CYA, temperatura) — destra",
    reco_tac_low: "TAC troppo basso ({val} mg/L)",
    reco_tac_high: "TAC troppo alto ({val} mg/L)",
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
    reco_recheck_later: "Ricontrollo consigliato tra qualche ora",
    reco_cl_shock_text: "stasera (trattamento shock)",
    reco_note_tac: "Un TAC basso rende il pH instabile.",
    reco_note_tac_minus: "Stesso acido del pH-, ma l'effetto sul TAC va calibrato separatamente. Correggere prima del pH, a piccole dosi.",
    reco_no_product_note: "Nessun prodotto configurato per questa azione. Aggiungine uno nella scheda Prodotti.",
    product_empty_delete_confirm: "{name} è allo 0% di scorta. Rimuoverlo dalla lista?",
    product_missing_values: "Compila questi campi prima di salvare: {fields}.",
    reco_note_ph_before_tac: "pH corretto prima del TAC: a questo pH il cloro sarebbe poco efficace, e il TAC non è abbastanza basso da essere urgente.",
    reco_order_intro_default: "Quest'ordine segue la logica di trattamento: i parametri che ostacolano l'efficacia degli altri vengono corretti per primi.",
    reco_order_reason_metals: "Il sequestrante passa prima di ogni disinfettante perché sono stati rilevati metalli disciolti — altrimenti il cloro li precipita e macchia la piscina.",
    reco_order_reason_contamination: "Il disinfettante ha priorità perché il cloro combinato è alto ({combined} mg/L): puntare a {target} mg/L di cloro libero per raggiungere il punto di rottura e distruggere le clorammine.",
    reco_order_reason_cya_block: "Lo shock a cloro è sostituito dalla diluizione perché lo stabilizzante (CYA) è troppo alto perché uno shock sia efficace.",
    reco_order_reason_ph_before_tac: "Il pH passa prima del TAC perché lo scarto è troppo grande per aspettare.",
    reco_order_reason_ph_chlore_delay: "Viene rispettata un'attesa di 6 ore tra la correzione del pH e lo shock a cloro per evitare precipitazioni.",
    reco_note_combined: "Cloro combinato = cloramine, segno di disinfezione insufficiente. Aggiungere la sera, filtrazione in continuo.",
    reco_note_sel: "Usare sale da piscina (NaCl puro ≥ 99%). Sciogliere prima dell'aggiunta o versare vicino allo skimmer, filtrazione 24h.",
    reco_note_o2: "Non mescolare con il cloro. Filtrazione per 4h.",
    prod_name_o2_liquide: "Ossigeno attivo liquido (perossido di idrogeno)",
    note_o2_liquide: "Non mescolare con il cloro. Versare davanti agli ugelli di mandata, filtrazione in funzione.",
    reco_note_brome: "Versare lontano dagli ingressi d'acqua, filtrazione in marcia.",
    reco_note_cya: "Nessun prodotto abbassa il CYA chimicamente, solo la diluizione funziona. Evitare cloro stabilizzato finché il CYA è alto.",
    reco_cya_block_shock: "Stabilizzante troppo alto per uno shock efficace ({val} mg/L)",
    reco_note_cya_block_shock: "Oltre 75 mg/L di CYA, uno shock a cloro classico non raggiunge più il punto di rottura. Funziona solo la diluizione (rinnovo parziale dell'acqua) — niente shock a cloro finché non è fatto.",
    reco_fallback_tac: "Prodotto TAC+ (bicarbonato di sodio)",
    reco_fallback_tac_minus: "Prodotto TAC- (acido cloridrico o bisolfato di sodio)",
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
    paywall_perk7: "Fino a 3 vasche, 2 inviti per vasca",
    paywall_test_note: "Pagamento sicuro tramite Stripe. Annullabile in qualsiasi momento.",
    paywall_price_monthly: "2,99 € / mese",
    paywall_price_yearly: "24,99 € / anno",
    paywall_price_yearly_hint: "o 24,99 € / anno",
    paywall_plan_monthly: "Mensile",
    paywall_plan_yearly: "Annuale",
    paywall_plan_yearly_badge: "-30%",
    manage_subscription_btn: "Gestisci abbonamento",
    checkout_error: "Impossibile avviare il pagamento. Riprova.",
    portal_error: "Impossibile aprire la gestione dell'abbonamento. Riprova.",
    stripe_activation_checking: "Conferma del pagamento in corso…",
    stripe_activation_delay_title: "Sta impiegando più tempo del previsto",
    stripe_activation_delay_desc: "Il pagamento è stato ricevuto, ma l'attivazione richiede un po' più di tempo. Riprova a ricaricare l'app tra un minuto.",
    stripe_activation_continue_btn: "Continua",
    premium_reveal_title: "Premium attivato",
    premium_reveal_sub: "Fino a 3 vasche, 2 inviti per vasca, misurazioni senza limiti",
    premium_downgrade_title: "Ritorno alla versione gratuita",
    premium_downgrade_sub: "Le funzionalità Premium sono ora disattivate",
    premium_downgrade_confirm_title: "Disattivare Premium?",
    premium_downgrade_confirm_desc: "Perderai l'accesso a:",
    premium_downgrade_confirm_btn: "Disattiva Premium",
    premium_downgrade_cancel_btn: "Annulla e mantieni Premium",
    onboarding_step1_title: "Benvenuto su PoolGenAI",
    onboarding_step1_text: "Tieni sotto controllo la chimica della tua piscina: misurazioni, dosaggi e un piano di trattamento personalizzato.",
    onboarding_step2_title: "Basta una foto",
    onboarding_step2_text: "Fotografa la tua striscia reattiva o lo schermo del fotometro. L'IA legge i colori e compila i campi al posto tuo — niente più confronti a occhio.",
    onboarding_step3_title: "Risultati chiari",
    onboarding_step3_text: "Ogni parametro viene confrontato con il suo obiettivo: pH, cloro, TAC, stabilizzante... Un semplice codice colore ti dice a colpo d'occhio cosa va bene e cosa va corretto.",
    onboarding_step4_title: "Un piano con priorità",
    onboarding_step4_text: "L'app stabilisce l'ordine dei trattamenti da applicare e i tempi di attesa tra una fase e l'altra, così da non sprecare un trattamento andando troppo di fretta.",
    onboarding_step5_title: "Applica con fiducia",
    onboarding_step5_text: "La dose esatta viene calcolata in base al volume della tua piscina e al prodotto che usi. Spunta la fase una volta completata, l'app passa alla successiva.",
    onboarding_step6_title: "Segui l'andamento",
    onboarding_step6_text: "Visualizza le tue misurazioni nel tempo per individuare le tendenze e anticipare gli squilibri prima che diventino un problema.",
    onboarding_step7_title: "Gestisci le scorte",
    onboarding_step7_text: "Tieni traccia delle quantità rimanenti di ogni prodotto e ricevi un avviso prima che finisca.\n\nAggiungi la tua prima misurazione quando vuoi. Fino a 3 piscine, report PDF e altro: scopri Premium più avanti nelle Impostazioni.",
    onboarding_step3_legend_bad: "Troppo alto o troppo basso",
    onboarding_next: "Avanti",
    onboarding_skip: "Salta",
    onboarding_start: "Iniziamo",
    help_section: "Aiuto",
    settings_replay_onboarding: "Rivedi la presentazione",
    context_switch_premium_title: "Piscina Premium",
    context_switch_premium_sub: "Questa piscina beneficia delle funzionalità Premium del suo proprietario",
    context_switch_free_title: "Ritorno alla tua piscina",
    context_switch_free_sub: "Sei tornato sulla tua piscina",
    report_print_btn: "Stampa / Salva come PDF",
    share_report: "Condividi il rapporto",
    report_email_subject: "Rapporto PoolGenAI — {pool}",
    report_email_greeting: "Salve,",
    report_email_body: "Di seguito le istruzioni per ottenere il rapporto PDF della piscina \"{pool}\":",
    report_email_step1: "1. Aprire l'app PoolGenAI",
    report_email_step2: "2. Scheda Cronologia → Genera rapporto",
    report_email_step3: "3. Fare clic su \"Stampa / Salva come PDF\"",
    report_email_sign: "Cordiali saluti,",
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
    unlimited_version: "Premium",
    active_pool: "Vasca attiva",
    pool_volume: "Volume vasca (m³)",
    treatment_params: "Parametri:",
    treatment_desc: "Il trattamento determina quali parametri vengono misurati e gli obiettivi raccomandati. Il volume viene usato per calcolare le dosi di prodotto.",
    subscription: "Abbonamento",
    unlimited_active: "Modalità Premium attiva",
    free_mode: "Versione gratuita",
    api_section: "ANALISI IA",
    ai_toggle_label: "Attiva analisi IA",
    ai_toggle_desc: "Permette di analizzare le foto di misura con intelligenza artificiale.",
    calibration_toggle_label: "Contribuisci al miglioramento collettivo",
    calibration_toggle_desc: "Condivide dati di calibrazione anonimi (colore misurato, valore di riferimento) per migliorare la lettura delle strisce reattive per tutti. Nessuna foto o identificativo viene trasmesso.",
    ai_password_title: "Accesso configurazione IA",
    ai_password_prompt: "Inserire la password per attivare l'analisi IA",
    ai_password_error: "Password errata",
    ai_configure_btn: "Configura chiave API",
    ai_config_title: "Configurazione IA",
    ai_config_back: "Torna alle impostazioni",
    ai_locked_settings: "Analisi IA riservata a Premium",
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
    delegation_section_title: "Delega",
    linked_pools_title: "Vasche a cui sono invitato",
    linked_pools_empty: "Non hai accesso a nessuna vasca come ospite.",
    request_revocation_button: "Richiedi revoca",
    request_revocation_confirm: "Richiedere la revoca del tuo accesso alla vasca \"{pool}\"? {pseudo} riceverà un'email per confermare.",
    request_revocation_sent: "Richiesta inviata. Riceverai un'email quando la revoca sarà confermata.",
    request_revocation_error: "Invio della richiesta non riuscito.",
    secondary_section_title: "Utenti secondari",
    secondary_section_intro: "Invita fino a 2 persone ad accedere alla stessa piscina (riservato a Premium).",
    secondary_invite_requires_premium: "Gli inviti sono riservati a Premium.",
    secondary_invite_pool_full: "Questa piscina ha già 2 invitati, è il massimo.",
    secondary_invite_button: "Invita qualcuno",
    secondary_invite_email_label: "Email della persona da invitare",
    secondary_invite_pool_label: "Piscina",
    secondary_invite_send: "Invia invito",
    secondary_invite_sent: "Invito inviato.",
    secondary_invite_error: "Invio dell'invito non riuscito",
    secondary_active_title: "Accessi attivi",
    secondary_active_empty: "Nessun accesso attivo.",
    secondary_pool_label: "Piscina: {pool}",
    secondary_revoke_button: "Revoca",
    secondary_revoke_confirm: "Revocare l'accesso di {email}?",
    secondary_revoke_error: "Revoca non riuscita",
    secondary_pending_title: "Inviti in sospeso",
    secondary_pending_empty: "Nessun invito in sospeso.",
    secondary_pending_expires: "Scade il {date}",
    secondary_pending_expired: "Scaduto",
    secondary_cancel_button: "Annulla",
    secondary_cancel_confirm: "Annullare l'invito inviato a {email}?",
    secondary_cancel_error: "Annullamento non riuscito",
    pseudo_label: "Il tuo nome utente",
    pseudo_placeholder: "Visibile a chi ti invita",
    pseudo_save: "Salva",
    pseudo_saved: "Nome utente salvato.",
    pseudo_invalid: "Da 2 a 24 caratteri (lettere, numeri, spazi, trattini).",
    pseudo_taken_suggestion: "Già in uso. Prova: {suggestion}",
    pseudo_error: "Salvataggio del nome utente non riuscito",
    context_title: "Piscina visualizzata",
    context_own: "Le mie piscine",
    secondary_pool_unavailable_title: "Piscina non disponibile",
    secondary_pool_unavailable_desc: "Questa piscina non è stata trovata. Potrebbe essere stata eliminata, oppure c'è un problema di rete nel caricamento. Riprova più tardi.",
    secondary_pool_revoked_desc: "Il tuo accesso a questa piscina è stato revocato dal proprietario.",
    secondary_invited_label: "{pool} - Invitato",
    context_loading: "Caricamento piscina…",
    context_secondary_option: "Piscina di {pseudo}",
    banner_secondary: "{pool} — account di {pseudo}",
    invite_response_title: "Invito",
    invite_response_text: "{pseudo} ti invita ad accedere alla piscina {pool}.",
    invite_response_accept: "Accetta",
    invite_response_decline: "Rifiuta",
    invite_response_accepted: "Invito accettato. Trovi questa piscina nelle Impostazioni.",
    invite_response_declined: "Invito rifiutato.",
    invite_response_expired: "Questo invito è scaduto.",
    invite_response_limit_reached: "Limite di 2 piscine invitate raggiunto nel piano gratuito — passa a Premium per accettarne altre.",
    invite_response_requires_premium: "Questo account non è più in Premium, l'invito non può essere accettato.",
    invite_response_invalid: "Invito non valido o già utilizzato.",
    invite_response_mismatch: "Questo invito non corrisponde al tuo account collegato.",
    invite_response_error: "Errore durante l'elaborazione dell'invito.",
    invite_response_checking: "Verifica dell'invito…",
    revocation_response_title: "Richiesta di revoca",
    revocation_response_text: "{pseudo} ha richiesto la revoca del proprio invito alla vasca {pool}.",
    revocation_response_accept: "Accetta la richiesta di revoca",
    revocation_response_done: "Revoca effettuata.",
    revocation_response_invalid: "Questa richiesta non esiste più o è già stata gestita.",
    revocation_response_expired: "Questa richiesta di revoca è scaduta.",
    revocation_response_mismatch: "Questa richiesta non corrisponde al tuo account connesso.",
    revocation_response_error: "Errore durante l'elaborazione della richiesta.",
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
    daily_limit: "Límite diario alcanzado — pasar a Premium",
    apply_advice: "Aplicar estos consejos",
    apply_advice_sub: "Selecciona los consejos aplicados e introduce las cantidades reales.",
    advice_applied: "Consejos aplicados",
    advice_partial: "parcialmente aplicados",
    adjust: "Ajustar",
    ai_analysis: "ANÁLISIS IA",
    ai_analyze_btn: "Analizar con IA",
    ai_locked: "Función reservada para Premium",
    ai_analyzing: "Analizando…",
    ai_api_missing: "Introduce tu clave API en Ajustes para activar el análisis IA.",
    follow_order: "Sigue los pasos en orden: cada tratamiento modifica el equilibrio del agua.",
    in_range: "En objetivo",
    too_high: "Demasiado alto",
    too_low: "Demasiado bajo",
    target: "objetivo",
    evolution: "Evolución",
    show_values: "Mostrar valores en el gráfico",
    show_all_params: "Mostrar parámetros",
    hide_all_params: "Ocultar parámetros",
    journal: "Registro",
    no_history: "Sin historial aún",
    no_history_sub: "Tus mediciones aparecerán aquí con el tiempo.",
    report: "Informe",
    time_col: "Hora",
    advised_col: "Aconsejado",
    ccl_col: "CCL",
    hard_col: "TH",
    phos_col: "Fos.",
    copper_col: "Cobre",
    iron_col: "Hierro",
    param_ccl: "Cloro combinado (CCL)",
    param_hard: "Dureza (TH)",
    param_phos: "Fosfatos",
    param_copper: "Cobre",
    param_iron: "Hierro",
    reco_hard_low: "Dureza demasiado baja ({val} mg/L)",
    reco_hard_high: "Dureza demasiado alta ({val} mg/L)",
    reco_phos_high: "Fosfatos demasiado altos ({val} µg/L)",
    reco_copper_high: "Cobre demasiado alto ({val} mg/L)",
    reco_iron_high: "Hierro demasiado alto ({val} mg/L)",
    reco_fallback_hard: "Cloruro de calcio",
    reco_fallback_phos: "Anti-fosfatos",
    reco_fallback_sequestrant: "Secuestrante de metales",
    note_tac_plus: "Añadir gradualmente, filtración en marcha. Esperar 6h.",
    note_calcium: "Diluir antes de añadir. Filtración en marcha.",
    note_anti_phos: "Verter delante del inyector de retorno, filtración 24h.",
    note_sequestrant: "Tratamiento cobre/hierro. Verter alrededor de la piscina.",
    note_floculant: "Tratamiento puntual para agua turbia, no monitorizado automáticamente por la app. Verter delante de las boquillas de impulsión, filtración en marcha, luego detener 24h para la decantación.",
    action_hard_plus: "Aumentar dureza (TH)",
    action_phos_minus: "Reducir fosfatos",
    action_sequestrant: "Secuestrante de metales (cobre/hierro)",
    action_floculant: "Floculante / clarificante",
    action_outil_mesure: "Herramienta de medición (tiras reactivas, etc.)",
    legal_notices: "Avisos legales",
    lcen_title: "Avisos legales",
    lcen_editor: "Editor",
    lcen_editor_val: "Arnaud Goumain — Particular",
    lcen_host: "Alojamiento",
    lcen_host_val: "GitHub Inc. / Microsoft Corporation\n88 Colin P Kelly Jr St\nSan Francisco, CA 94107, USA",
    lcen_contact: "Contacto",
    lcen_contact_val: "support@poolgenai.com",
    lcen_cgu_title: "Condiciones de uso",
    lcen_ai_title: "Inteligencia artificial",
    lcen_ai_val: "Al usar el análisis de IA, sus datos pasan por la infraestructura técnica del editor (servidor intermediario), que utiliza una clave API suscrita por el editor. Sin conservación ni registro del contenido transmitido en este servidor.",
    lcen_photos_title: "Fotos",
    lcen_photos_val: "Solo envíe fotos de equipos de medición o agua de la piscina. Excluidos: personas identificables, elementos de localización, datos personales visibles.",
    lcen_gdpr: "Datos personales",
    lcen_gdpr_val: "De acuerdo con el RGPD, tiene derecho a acceder, rectificar, suprimir y portar sus datos. Contáctenos en la dirección anterior o presente una reclamación ante la autoridad de protección de datos.",
    lcen_calibration_title: "Mejora colectiva de los análisis de fotos",
    lcen_calibration_val: "Cuando una medición incluye tanto una foto del fotómetro como una foto de la tira reactiva para el mismo parámetro, PoolGenAI puede extraer un dato de calibración anónimo (color medido, valor de referencia, tipo de tira identificado) y compartirlo con todos los usuarios de la aplicación, únicamente con el fin de mejorar la precisión de la interpretación de las tiras reactivas para todos. Estos datos de calibración no contienen fotos, identificadores de cuenta ni ninguna información que permita identificar al usuario de origen. El usuario puede desactivar esta contribución en cualquier momento en los ajustes de la aplicación; esta negativa no afecta al uso normal de PoolGenAI.",
    lcen_photocontrib_title: "Contribución de fotos a la base común de productos",
    lcen_photocontrib_val: "Cuando un usuario fotografía un producto que aún no tiene foto en la base común de productos compartida entre usuarios, esa foto puede transmitirse y almacenarse para ilustrar la ficha de producto correspondiente, visible para todos los usuarios. Solo se ve afectada la foto del producto en sí. Una vez contribuida, la foto no puede retirarse individualmente — ninguna información vincula una foto con su contribuyente.",
    photo_warning_title: "Atención antes de fotografiar",
    photo_warning_body: "Asegúrese de que la foto no contenga:\n• personas identificables\n• elementos que puedan localizar su domicilio\n• datos personales visibles\n\nRecomendamos desactivar la geolocalización en los ajustes de la cámara.",
    photo_warning_confirm: "Entendido, continuar",
    ai_clause_title: "Análisis IA",
    ai_clause_body: "Al activar el análisis IA, sus datos (medidas y fotos) pasan por la infraestructura técnica de PoolGenAI, que utiliza una clave API suscrita por el editor — usted no debe proporcionar ninguna clave. Sin conservación ni registro del contenido transmitido en este servidor intermediario.",
    cgu_update_title: "Términos actualizados",
    cgu_update_body: "Los términos de uso han sido actualizados (v{version}). Por favor léalos y acéptelos para continuar.",
    cgu_update_accept: "Leer y aceptar",
    cgu_version_label: "Versión términos",
    cgu_accepted_on: "Aceptado el",
    cgu_updated_title: "Términos actualizados",
    cgu_updated_body: "Los términos de uso han sido actualizados. Por favor léalos y acéptelos.",
    cgu_required_title: "Términos de uso",
    cgu_required_body: "Acepta nuestros términos de uso para continuar.",
    cgu_read_full_text: "Leer el texto completo",
    cgu_hide_full_text: "Ocultar el texto",
    applied_col: "Aplicado",
    disclaimer_title: "Aviso legal & Condiciones de uso",
    disclaimer_cgu: "Acepto los términos de uso y la política de privacidad",
    disclaimer_data: "Acepto que mis datos de tratamiento sean recopilados y compartidos con socios del sector piscinas/spa",
    disclaimer_required: "La aceptación de los términos es obligatoria",
    disclaimer_pro: "Los profesionales que usen PoolGenAI para servicios a terceros deben obtener el consentimiento de los propietarios de las piscinas.",
    revoke_data_consent: "Revocar consentimiento de datos",
    revoke_data_confirm: "Tu consentimiento ha sido revocado.",
    pool_email: "Email informe PDF",
    pool_email_placeholder: "contacto@ejemplo.es",
    pool_settings_title: "Configuración de la piscina",
    edit_pool: "Editar piscina",
    generate_report: "Generar informe de la piscina",
    report_locked: "Informe PDF reservado para Premium",
    report_desc: "El informe incluye el historial de mediciones, consejos dados y cantidades realmente aplicadas.",
    diag_section: "DIAGNÓSTICO IA",
    diag_placeholder: "Describe el problema que tienes con tu piscina a pesar de los tratamientos (ej. agua turbia, cloro que desaparece, algas persistentes...)",
    diag_submit: "Analizar con IA",
    diag_analyzing: "Analizando...",
    diag_confidence: "Índice de confianza",
    diag_history_title: "Historial de diagnósticos IA",
    diag_history_date: "Fecha",
    diag_history_note: "Nota",
    diag_history_response: "Respuesta IA",
    diag_history_confidence: "Confianza",
    diag_history_delete: "Eliminar",
    diag_history_empty: "Aún no hay diagnósticos guardados.",
    diag_history_locked: "Historial de diagnósticos IA reservado para Premium",
    diag_history_confirm_delete: "¿Eliminar este diagnóstico?",
    update_required_title: "Nueva versión disponible",
    update_required_desc: "Se ha publicado una nueva versión de PoolGenAI. Actualiza la aplicación para continuar.",
    update_required_btn: "Actualizar ahora",
    update_in_progress_title: "Actualización en curso",
    update_in_progress_desc: "Solo tardará un momento, la aplicación se recargará automáticamente.",
    diag_off_topic: "Esta pregunta no está relacionada con el tratamiento del agua de piscina. Solo respondo preguntas sobre química del agua, productos de tratamiento y equipos de piscina.",
            diag_error: "Análisis fallido",
    import_pdf_btn: "Importar informe PDF",
    import_pdf_prefill_title: "Medición importada desde PDF",
    import_pdf_analyzing: "La IA está leyendo el archivo...",
    import_pdf_error: "No se puede leer este archivo",
    import_pdf_no_values: "No se encontraron valores en este archivo",
    import_pdf_needs_ai: "Importación PDF disponible con análisis IA (Ajustes → Activar análisis IA)",
    import_diag_added_one: "1 diagnóstico IA importado desde este documento.",
    import_diag_added_many: "{n} diagnósticos IA importados desde este documento.",
    suspended_title: "Cuenta suspendida",
    suspended_desc: "Tu cuenta ha sido suspendida y el acceso a la aplicación ya no está disponible.",
    suspended_erase_btn: "Borrar mis datos",
    suspended_erasing: "Borrando...",
    suspended_erase_confirm: "Esto elimina permanentemente todos tus datos (mediciones, productos, historial, diagnósticos). ¿Continuar?",
    legend_title: "Leyenda de parámetros y valores objetivo",
    ccl_fcl_tcl_error: "Error: FCL + CCL no puede superar TCL. Verifica los valores introducidos.",
    tcl_forced_to_fcl_info: "TCL no puede ser inferior a FCL — valor corregido a {val}. Vuelve a tocar Guardar para confirmar.",
    param_ph_long: "Potencial de hidrógeno", param_fcl_long: "Cloro libre", param_tcl_long: "Cloro total",
    param_ccl_long: "Cloro combinado (cloraminas)", param_tac_long: "Alcalinidad total",
    param_cya_long: "Ácido cianúrico (estabilizador)", param_th_long: "Dureza total",
    param_phos_long: "Fosfatos", param_cu_long: "Cobre", param_fe_long: "Hierro", param_temp_long: "Temperatura del agua",
    new_measure_title: "Nueva medición",
    edit_measure_title: "Editar medición",
    date_time: "Fecha y hora",
    photo_hint: "Fotografía la pantalla de tu fotómetro con valores legibles, o coloca tu tira de prueba empapada junto a la leyenda del tubo y fotografíalos juntos.",
    photo_hint_bandelette: "Tira reactiva: toma 2-3 fotos girando el tubo para exponer cada escala de color.",
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
    analyze_locked: "Foto + análisis IA reservados para Premium",
    product_ai_hint: "Activa el análisis IA en Ajustes para rellenar estos campos automáticamente a partir de la foto.",
    product_sync_error: "Error al sincronizar productos — la foto quizá es demasiado pesada, prueba con una foto más ligera.",
    config_sync_error: "Fallo de sincronización — comprueba tu conexión. ({detail})",
    repair_orphaned_title: "{count} entrada(s) huérfana(s) detectada(s)",
    repair_orphaned_desc: "Algunas mediciones, tratamientos o productos no están vinculados a ninguna piscina existente (a menudo tras un error de sincronización). Se vincularán a tu piscina activa.",
    repair_orphaned_btn: "Reparar ahora",
    repair_orphaned_confirm: "¿Vincular {count} entrada(s) huérfana(s) a la piscina activa?",
    delete_pool_confirm: "¿Desactivar esta piscina? Ya no aparecerá en la aplicación, pero su historial se conserva.",
    account_deleted_title: "Cuenta eliminada",
    account_deleted_desc: "Esta cuenta ha sido eliminada y el acceso a la aplicación ya no está disponible.",
    account_deleted_request_btn: "No empezar de nuevo con esta dirección, y solicitar la recuperación o eliminación de mis datos",
    back_to_home: "Volver a la página de inicio",
    reactivate_btn: "Empezar de nuevo con esta dirección",
    reactivate_confirm: "¿Empezar de cero con esta dirección? Tus piscinas actuales se ocultarán (no se mostrarán más, pero no se eliminarán). Tendrás que crear una piscina nueva.",
    reset_password_hint: "Restablecer mi contraseña",
    data_request_title: "Recuperación o eliminación de datos",
    data_request_desc: "Elige la acción que deseas. Se enviará una solicitud al soporte, que te contactará por email.",
    data_request_option_erase: "Eliminar todos mis datos",
    data_request_option_recover: "Recuperar todos mis datos, no eliminarlos",
    data_request_option_recover_erase: "Recuperar y eliminar todos mis datos",
    data_request_submit: "Enviar solicitud",
    data_request_sending: "Enviando...",
    data_request_sent: "Solicitud enviada. El soporte te contactará por email.",
    data_request_error: "Error al enviar. Inténtalo de nuevo o escribe directamente a support@poolgenai.com.",
    note_optional: "Nota (opcional)",
    note_placeholder: "Agua turbia, sol fuerte, natación prevista...",
    save_measure: "Guardar medición",
    save: "Guardar",
    cancel: "Cancelar",
    save_changes: "Guardar cambios",
    my_products: "MIS PRODUCTOS",
    products_formula: "El dosaje se calcula como: {cantidad} para variar el parámetro en {efecto} por {volumen} m³.",
    products_to_buy: "Productos por comprar",
    products_to_buy_empty: "Nada que comprar por ahora — todas las existencias son suficientes.",
    generic_products_section: "Productos recomendados que faltan",
    generic_products_hint: "Según el tipo de tratamiento de esta piscina, estos productos aún no están en tu lista.",
    add_generic_product: "Añadir",
    generic_product_added: "Añadido a tus productos",
    reason_low_stock: "Stock bajo",
    reason_insufficient_plan: "Insuficiente para el plan en curso",
    apply_product_manual: "Aplicar un producto",
    reason_manual_maintenance: "Mantenimiento manual",
    products_locked: "Función reservada para Premium",
    stock_not_managed: "La gestión de stock no está activada para esta piscina. Actívala en Ajustes.",
    activate_in_settings: "Activar en Ajustes →",
    delete_all_products: "Eliminar todos los productos de esta piscina",
    stock_label: "Stock:",
    stock_remaining: "restante",
    edit_product: "Editar producto",
    new_product: "Nuevo producto",
    product_photo: "Foto del producto (etiqueta)",
    product_photo_hint: "Toma una foto por elemento — frente del producto, código de barras, ficha de dosis — para un reconocimiento más fiable. Una sola foto basta si todo es visible en ella.",
    common_product_candidate_title: "Producto similar encontrado en la base común:",
    common_product_same: "Sí, mismo producto",
    common_product_different: "No, producto diferente",
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
    stock_locked: "Gestión de stock reservada para Premium",
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
    wizard_title: "Plan de tratamiento",
    wizard_step: "Paso",
    wizard_of: "de",
    wizard_now: "Ahora",
    wizard_in: "En",
    wizard_at: "a las",
    wizard_scheduled: "Programado",
    wizard_earliest: "Lo antes posible",
    chlore_timing_tip: "Para una mejor eficacia, aplica preferiblemente por la noche, después del último baño y al atardecer.",
    wizard_done: "Hecho",
    wizard_skip: "Saltar este paso",
    wizard_anticipate: "Aplicar ahora",
    wizard_finish: "Terminar plan",
    wizard_reminder: "¿Recordarme el siguiente paso?",
    wizard_reminder_yes: "Sí, recordarme",
    wizard_reminder_no: "No gracias",
    wizard_next_step: "Siguiente paso",
    wizard_start: "Iniciar plan",
    plan_in_progress: "Plan de tratamiento en curso",
    wizard_apply_time: "Hora de aplicación",
    wizard_edit_prev: "Editar paso anterior",
    wizard_resume: "Reanudar plan",
    wizard_completed: "Plan de tratamiento completado ✓",
    wizard_partial: "Plan en curso",
    countdown_done: "¡Es hora de tratar!",
    treatment_at: "Tratamiento aplicado a las",
    edit_treatment_section_title: "Tratamiento aplicado",
    treatment_skipped: "Paso omitido",
    settings_title: "Ajustes",
    my_pools: "Mis piscinas",
    pool_name: "Nombre de la piscina",
    location: "Ubicación",
    volume: "Volumen (m³)",
    treatment_type: "Tipo de tratamiento",
    measure_device_label: "Método de medición",
    measure_device_photometre: "Solo fotómetro",
    measure_device_bandelette: "Solo tira reactiva",
    measure_device_both: "Ambos",
    strip_model_label: "Modelo de tira reactiva utilizado",
    strip_model_none: "No especificado",
    filtration_type: "Tipo de filtración",
    manage_stock_label: "Gestión de stock",
    manage_stock_desc: "Hace seguimiento del consumo de productos y lo muestra en el informe.",
    manage_stock_locked: "Disponible en Premium",
    api_key_label: "Clave API Anthropic o URL proxy Cloudflare Worker",
    provider_label: "Proveedor",
    api_key_placeholder: "sk-ant-... o https://mi-proxy.workers.dev",
    api_key_desc: "Tu clave se almacena localmente.",
    premium_section: "VERSIÓN",
    premium_label: "Versión Premium",
    premium_test: "Suscripción mensual o anual",
    premium_desc: "Gratuito: 1 piscina, sin invitaciones, 1 medición por día. Premium: hasta 3 piscinas, 2 invitaciones por piscina, mediciones ilimitadas, fotos, productos.",
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
    cl_libre_col: "FCL",
    cl_total_col: "TCL",
    tac_col: "TAC",
    cya_col: "CYA",
    temp_col: "TEMP.",
    product_col: "Producto",
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
    paywall_title: "Pasar a Premium",
    ai_timer_hint: "A análise pode levar até 30 segundos.",
    ai_reliability: "Confiabilidade da análise",
    ai_no_values: "Nenhum valor legível nesta foto. Verifique a qualidade e orientação da imagem.",
    paywall_desc: "Mediciones ilimitadas · Análisis IA de tiras · Informe PDF · Gestión de stock",
    paywall_context_measure_limit: "Has alcanzado el límite de 1 medición gratuita al día.",
    paywall_context_start_plan: "El seguimiento del tratamiento paso a paso está reservado a Premium.",
    paywall_context_products: "La gestión de productos y stock está reservada a Premium.",
    pool_limit_reached: "Límite de 3 piscinas alcanzado en Premium.",
    paywall_context_report: "El informe PDF está reservado a Premium.",
    paywall_context_photos: "El análisis de fotos con IA está reservado a Premium.",
    paywall_context_stock: "La gestión de stock está reservada a Premium.",
    paywall_btn: "Activar Premium",
    paywall_close: "Más tarde",
    add_pool_title: "Nueva piscina",
    first_pool_title: "Bienvenido a PoolGenAI",
    first_pool_intro: "Configura tu primera piscina para empezar a seguir su química del agua.",
    edit_pool_title: "Editar piscina",
    pool_name_placeholder: "Mi piscina",
    pool_location_placeholder: "Buscar una ciudad...",
    location_use_gps: "Usar mi ubicación",
    location_searching: "Buscando...",
    location_search_error: "Búsqueda no disponible, inténtalo de nuevo",
    location_no_results: "No se encontró ninguna ciudad",
    location_gps_error: "Ubicación no disponible",
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
    pool_photo_locked: "Fotos de piscina reservadas para Premium",
    sign_in: "Iniciar sesión",
    account_section: "Mi cuenta",
    confirm_password: "Confirmar contraseña",
    pwd_min6: "Mínimo 6 caracteres",
    error_pwd_mismatch: "Las contraseñas no coinciden.",
    error_email_required: "Email inválido.",
    account_created: "¡Cuenta creada!",
    verify_email_notice: "Se ha enviado un email de confirmación a tu dirección. Haz clic en el enlace para activar tu cuenta.",
    verify_gate_title: "Verifica tu dirección de email",
    verify_gate_desc: "Para acceder a la app, confirma tu dirección haciendo clic en el enlace que recibiste por email",
    verify_gate_check_btn: "Confirmado — Continuar",
    verify_link_checking: "Verificando tu email…",
    verify_link_verified_title: "¡Email verificado!",
    verify_link_verified_desc: "Tu dirección de email está confirmada. Puedes continuar.",
    verify_link_already_title: "Ya verificado",
    verify_link_already_desc: "Esta dirección de email ya estaba confirmada.",
    verify_link_expired_title: "Enlace caducado",
    verify_link_expired_desc: "Este enlace de verificación ha caducado. Solicita un nuevo email desde la app.",
    verify_link_invalid_title: "Enlace no válido",
    verify_link_invalid_desc: "Este enlace de verificación no es válido. Solicita un nuevo email desde la app.",
    verify_link_error_title: "Error",
    verify_link_error_desc: "No se pudo verificar tu email en este momento. Inténtalo más tarde.",
    verify_link_continue_btn: "Continuar a la app",
    merge_link_pending_title: "¿Confirmar la fusión?",
    merge_link_pending_desc: "Se detectó un código de barras para una ficha de producto ya presente en la base común, sin código de barras asociado. Confirma para vincular ambas.",
    merge_link_confirm_btn: "Confirmar fusión",
    merge_link_cancel_btn: "Cancelar",
    merge_link_confirming: "Fusionando…",
    merge_link_merged_title: "Fusión confirmada",
    merge_link_merged_desc: "El código de barras se vinculó a la ficha de producto existente.",
    merge_link_already_merged_title: "Ya fusionado",
    merge_link_already_merged_desc: "Esta fusión ya había sido confirmada.",
    merge_link_expired_title: "Enlace caducado",
    merge_link_expired_desc: "Este enlace de confirmación ha caducado (válido 7 días).",
    merge_link_invalid_title: "Enlace inválido",
    merge_link_invalid_desc: "Este enlace de confirmación no es válido.",
    merge_link_error_title: "Error",
    merge_link_error_desc: "No se pudo confirmar la fusión en este momento. Inténtalo más tarde.",
    verify_gate_checking: "Comprobando...",
    verify_gate_still_unverified: "Tu email todavía no está confirmado. Revisa tu bandeja de entrada (y spam).",
    verify_gate_resend_btn: "Reenviar email de confirmación",
    verify_gate_resend_sent: "Email reenviado — revisa también el spam.",
    verify_gate_resend_error: "No se pudo enviar el email ahora. Inténtalo más tarde.",
    verify_gate_signout: "Cerrar sesión",
    verify_email_send_failed: "No se pudo enviar el email de confirmación. Inténtalo de nuevo abajo.",
    verify_email_retry_btn: "Reenviar email",
    verify_email_resent: "Email reenviado ✓",
    account_created_sub: "Bienvenido a PoolGenAI. Ya puedes usar la app.",
    start_app: "Iniciar la app",
    sign_out: "Cerrar sesión",
    delete_account: "Eliminar mi cuenta",
    delete_account_confirm: "¿Eliminar tu cuenta? Ya no podrás iniciar sesión. Tus datos se conservan — podrás solicitar su recuperación o eliminación definitiva.",
    account_delete_flag_error: "Error al eliminar la cuenta. Inténtalo de nuevo.",
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
    user_not_found: "No hay cuenta con este email. Si crees que es un error, contacta con support@poolgenai.com",
    account_disabled: "Esta cuenta ha sido desactivada. Contacta con support@poolgenai.com para más información.",
    login_failed_unified: "Email o contraseña incorrectos.",
    create_account_hint: "¿Aún no tienes cuenta? Crear una cuenta",
    email_in_use: "Este email ya está en uso.",
    weak_password: "Contraseña demasiado corta (mín. 6 caracteres).",
    firebase_not_configured: "⚠️ Firebase no configurado — solo modo offline.",
    note_ph_minus: "Verificar el pH antes de cada adición. Máx 1 kg/100 m³/día o espaciar 2h.",
    note_ph_plus: "Distribuir por toda la piscina con filtración en marcha.",
    note_chlore_choc: "Verter por la noche después del atardecer. No estabiliza (no aumenta el CYA).",
    note_galets: "Aumenta el CYA con cada uso. Evitar si el CYA ya supera los 50 mg/L.",
    prod_name_ph_minus: "Reductor de pH (ácido / tipo Reva Minus)",
    prod_name_ph_plus: "Incrementador de pH",
    prod_name_chlore_choc: "Cloro choque no estabilizado (tipo Chloryte)",
    prod_name_galets: "Pastillas cloro estabilizado 5-en-1 (tipo Chlorilong)",
    packaging_type: "Envase",
    packaging_vrac: "A granel / granulado",
    packaging_galets: "Pastillas / sticks",
    unit_weight_label: "Peso por unidad (g)",
    maintenance_ratio_label: "Ratio de mantenimiento del fabricante",
    maintenance_units_label: "Nº unidades",
    maintenance_volume_label: "Por m³",
    maintenance_days_label: "Cada X días",
    unit_galets: "pastillas",
    unit_units: "unidades",
    quantity_unit_mode_kg: "kg",
    quantity_unit_mode_units: "unidades",
    maintenance_card_title: "Mantenimiento continuo",
    maintenance_card_text: "{units} pastilla(s) / {volume} m³, cada {days} días",
    no_stock_category_hint: "Ningún producto en stock en esta categoría — entrada libre",
    no_stock_generic_hint: "Ningún producto en stock en esta categoría — producto genérico propuesto",
    prod_name_tac_plus: "Producto TAC+ (bicarbonato de sodio)",
    prod_name_calcium: "Cloruro de calcio (dureza +)",
    prod_name_anti_phos: "Anti-fosfatos (tipo PHOSfree)",
    prod_name_sequestrant: "Secuestrante de metales (tipo Metal Free)",
    prod_name_floculant: "Floculante clarificante líquido (tipo Reva-Flock)",
    prod_name_sel: "Sal de piscina (NaCl puro ≥ 99%, saco 25 kg)",
    action_ph_plus: "Sube el pH",
    action_chlore: "Cloro no estabilizado (choque)",
    action_chlore_stabilise: "Cloro estabilizado (CYA +)",
    action_tac_plus: "Sube el TAC",
    action_tac_minus: "Baja el TAC",
    action_brome: "Bromo",
    action_o2: "Oxígeno activo",
    action_sel: "Sal (salinidad)",
    axis_legend_d: "ᴅ escala decenas (TAC, CYA, temperatura) — derecha",
    reco_tac_low: "TAC demasiado bajo ({val} mg/L)",
    reco_tac_high: "TAC demasiado alto ({val} mg/L)",
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
    reco_recheck_later: "Se recomienda volver a comprobar en unas horas",
    reco_cl_shock_text: "esta noche (tratamiento de choque)",
    reco_note_tac: "Un TAC bajo hace el pH inestable.",
    reco_note_tac_minus: "Mismo ácido que el pH-, pero su efecto sobre el TAC debe calibrarse por separado. Corregir antes que el pH, en dosis pequeñas.",
    reco_no_product_note: "No hay ningún producto configurado para esta acción. Añade uno en la pestaña Productos.",
    product_empty_delete_confirm: "{name} está al 0% de stock. ¿Eliminarlo de la lista?",
    product_missing_values: "Completa estos campos antes de guardar: {fields}.",
    reco_note_ph_before_tac: "pH corregido antes que el TAC: a este pH el cloro sería poco eficaz, y el TAC no está lo bastante bajo para ser urgente.",
    reco_order_intro_default: "Este orden sigue la lógica de tratamiento: los parámetros que impiden la eficacia de los demás se corrigen primero.",
    reco_order_reason_metals: "El secuestrante pasa antes que cualquier desinfectante porque se detectaron metales disueltos — si no, el cloro los precipita y mancha la piscina.",
    reco_order_reason_contamination: "El desinfectante tiene prioridad porque el cloro combinado es alto ({combined} mg/L): hay que apuntar a {target} mg/L de cloro libre para alcanzar el punto de ruptura y destruir las cloraminas.",
    reco_order_reason_cya_block: "El choque de cloro se sustituye por dilución porque el estabilizador (CYA) está demasiado alto para que un choque sea eficaz.",
    reco_order_reason_ph_before_tac: "El pH pasa antes que el TAC porque la desviación es demasiado grande para esperar.",
    reco_order_reason_ph_chlore_delay: "Se respeta una espera de 6 horas entre la corrección del pH y el choque de cloro para evitar precipitaciones.",
    reco_note_combined: "Cloro combinado = cloraminas, señal de desinfección insuficiente. Añadir por la noche, filtración continua.",
    reco_note_sel: "Usar sal de piscina (NaCl puro ≥ 99%). Disolver antes de añadir o verter cerca del skimmer, filtración 24h.",
    reco_note_o2: "No mezclar con cloro. Filtración durante 4h.",
    prod_name_o2_liquide: "Oxígeno activo líquido (peróxido de hidrógeno)",
    note_o2_liquide: "No mezclar con cloro. Verter delante de las boquillas de retorno, con la filtración en marcha.",
    reco_note_brome: "Verter lejos de las entradas de agua, filtración en marcha.",
    reco_note_cya: "Ningún producto baja el CYA químicamente, solo la dilución funciona. Evitar cloro estabilizado mientras el CYA sea alto.",
    reco_cya_block_shock: "Estabilizador demasiado alto para un choque eficaz ({val} mg/L)",
    reco_note_cya_block_shock: "Por encima de 75 mg/L de CYA, un choque de cloro clásico ya no alcanza el punto de ruptura. Solo la dilución (renovación parcial del agua) funciona — nada de choque de cloro hasta que esté hecho.",
    reco_fallback_tac: "Producto TAC+ (bicarbonato de sodio)",
    reco_fallback_tac_minus: "Producto TAC- (ácido clorhídrico o bisulfato de sodio)",
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
    paywall_perk7: "Hasta 3 piscinas, 2 invitaciones por piscina",
    paywall_test_note: "Pago seguro a través de Stripe. Cancelable en cualquier momento.",
    paywall_price_monthly: "2,99 € / mes",
    paywall_price_yearly: "24,99 € / año",
    paywall_price_yearly_hint: "o 24,99 € / año",
    paywall_plan_monthly: "Mensual",
    paywall_plan_yearly: "Anual",
    paywall_plan_yearly_badge: "-30%",
    manage_subscription_btn: "Gestionar suscripción",
    checkout_error: "No se pudo iniciar el pago. Inténtalo de nuevo.",
    portal_error: "No se pudo abrir la gestión de la suscripción. Inténtalo de nuevo.",
    stripe_activation_checking: "Confirmando tu pago…",
    stripe_activation_delay_title: "Esto está tardando más de lo habitual",
    stripe_activation_delay_desc: "Tu pago se ha recibido, pero la activación tarda un poco más. Intenta recargar la app en un minuto.",
    stripe_activation_continue_btn: "Continuar",
    premium_reveal_title: "Premium activado",
    premium_reveal_sub: "Hasta 3 piscinas, 2 invitaciones por piscina, mediciones sin límite",
    premium_downgrade_title: "Volver a la versión gratuita",
    premium_downgrade_sub: "Las funciones Premium están ahora desactivadas",
    premium_downgrade_confirm_title: "¿Desactivar Premium?",
    premium_downgrade_confirm_desc: "Perderás el acceso a:",
    premium_downgrade_confirm_btn: "Desactivar Premium",
    premium_downgrade_cancel_btn: "Cancelar y mantener Premium",
    onboarding_step1_title: "Bienvenido a PoolGenAI",
    onboarding_step1_text: "Controla la química de tu piscina fácilmente: mediciones, dosis y un plan de tratamiento personalizado.",
    onboarding_step2_title: "Con una foto basta",
    onboarding_step2_text: "Haz una foto de tu tira reactiva o de la pantalla de tu fotómetro. La IA lee los colores y rellena los campos por ti — se acabó comparar a ojo.",
    onboarding_step3_title: "Resultados claros",
    onboarding_step3_text: "Cada parámetro se compara con su objetivo: pH, cloro, TAC, estabilizante... Un código de color sencillo te dice de un vistazo qué está bien y qué hay que corregir.",
    onboarding_step4_title: "Un plan priorizado",
    onboarding_step4_text: "La app determina el orden de los tratamientos a aplicar y los tiempos de espera entre cada paso, para que no desperdicies un tratamiento por ir demasiado rápido.",
    onboarding_step5_title: "Aplica con confianza",
    onboarding_step5_text: "La dosis exacta se calcula según el volumen de tu piscina y el producto que uses. Marca el paso una vez hecho, y la app pasa al siguiente.",
    onboarding_step6_title: "Sigue la evolución",
    onboarding_step6_text: "Visualiza tus mediciones a lo largo del tiempo para detectar tendencias y anticipar desviaciones antes de que se conviertan en un problema.",
    onboarding_step7_title: "Gestiona tu stock",
    onboarding_step7_text: "Controla las cantidades restantes de cada producto y recibe una alerta antes de que se agote.\n\nAñade tu primera medición cuando quieras. Hasta 3 piscinas, informes en PDF y más: descubre Premium más tarde en Ajustes.",
    onboarding_step3_legend_bad: "Demasiado alto o demasiado bajo",
    onboarding_next: "Siguiente",
    onboarding_skip: "Omitir",
    onboarding_start: "Empezar",
    help_section: "Ayuda",
    settings_replay_onboarding: "Volver a ver la presentación",
    context_switch_premium_title: "Piscina Premium",
    context_switch_premium_sub: "Esta piscina se beneficia de las funciones Premium de su propietario",
    context_switch_free_title: "De vuelta a tu piscina",
    context_switch_free_sub: "Has vuelto a tu propia piscina",
    report_print_btn: "Imprimir / Guardar como PDF",
    share_report: "Compartir informe",
    report_email_subject: "Informe PoolGenAI — {pool}",
    report_email_greeting: "Hola,",
    report_email_body: "A continuación encontrará las instrucciones para obtener el informe PDF de la piscina \"{pool}\":",
    report_email_step1: "1. Abra la app PoolGenAI",
    report_email_step2: "2. Pestaña Historial → Generar informe",
    report_email_step3: "3. Haga clic en \"Imprimir / Guardar como PDF\"",
    report_email_sign: "Atentamente,",
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
    unlimited_version: "Premium",
    active_pool: "Piscina activa",
    pool_volume: "Volumen piscina (m³)",
    treatment_params: "Parámetros:",
    treatment_desc: "El tratamiento determina qué parámetros se miden y los objetivos recomendados. El volumen se usa para calcular las dosis de producto.",
    subscription: "Suscripción",
    unlimited_active: "Modo Premium activo",
    free_mode: "Versión gratuita",
    api_section: "ANÁLISIS IA",
    ai_toggle_label: "Activar análisis IA",
    ai_toggle_desc: "Permite analizar fotos de medición con inteligencia artificial.",
    calibration_toggle_label: "Contribuir a la mejora colectiva",
    calibration_toggle_desc: "Comparte datos de calibración anónimos (color medido, valor de referencia) para mejorar la lectura de tiras reactivas para todos. No se transmite ninguna foto ni identificador.",
    ai_password_title: "Acceso configuración IA",
    ai_password_prompt: "Introducir contraseña para activar el análisis IA",
    ai_password_error: "Contraseña incorrecta",
    ai_configure_btn: "Configurar clave API",
    ai_config_title: "Configuración IA",
    ai_config_back: "Volver a ajustes",
    ai_locked_settings: "Análisis IA reservado para Premium",
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
    delegation_section_title: "Delegación",
    linked_pools_title: "Piscinas a las que estoy invitado",
    linked_pools_empty: "No tienes acceso a ninguna piscina como invitado.",
    request_revocation_button: "Solicitar revocación",
    request_revocation_confirm: "¿Solicitar la revocación de tu acceso a la piscina \"{pool}\"? {pseudo} recibirá un email para confirmar.",
    request_revocation_sent: "Solicitud enviada. Recibirás un email cuando se confirme la revocación.",
    request_revocation_error: "Fallo al enviar la solicitud.",
    secondary_section_title: "Usuarios secundarios",
    secondary_section_intro: "Invita hasta a 2 personas a acceder a la misma piscina (reservado a Premium).",
    secondary_invite_requires_premium: "Las invitaciones están reservadas a Premium.",
    secondary_invite_pool_full: "Esta piscina ya tiene 2 invitados, es el máximo.",
    secondary_invite_button: "Invitar a alguien",
    secondary_invite_email_label: "Email de la persona a invitar",
    secondary_invite_pool_label: "Piscina",
    secondary_invite_send: "Enviar invitación",
    secondary_invite_sent: "Invitación enviada.",
    secondary_invite_error: "Error al enviar la invitación",
    secondary_active_title: "Accesos activos",
    secondary_active_empty: "Ningún acceso activo.",
    secondary_pool_label: "Piscina: {pool}",
    secondary_revoke_button: "Revocar",
    secondary_revoke_confirm: "¿Revocar el acceso de {email}?",
    secondary_revoke_error: "Error al revocar el acceso",
    secondary_pending_title: "Invitaciones pendientes",
    secondary_pending_empty: "Ninguna invitación pendiente.",
    secondary_pending_expires: "Caduca el {date}",
    secondary_pending_expired: "Caducada",
    secondary_cancel_button: "Cancelar",
    secondary_cancel_confirm: "¿Cancelar la invitación enviada a {email}?",
    secondary_cancel_error: "Error al cancelar la invitación",
    pseudo_label: "Tu apodo",
    pseudo_placeholder: "Visible para quienes te inviten",
    pseudo_save: "Guardar",
    pseudo_saved: "Apodo guardado.",
    pseudo_invalid: "De 2 a 24 caracteres (letras, números, espacios, guiones).",
    pseudo_taken_suggestion: "Ya está en uso. Prueba: {suggestion}",
    pseudo_error: "Error al guardar el apodo",
    context_title: "Piscina mostrada",
    context_own: "Mis piscinas",
    secondary_pool_unavailable_title: "Piscina no disponible",
    secondary_pool_unavailable_desc: "No se encuentra esta piscina. Puede que haya sido eliminada, o hay un problema de red al cargarla. Inténtalo más tarde.",
    secondary_pool_revoked_desc: "Tu acceso a esta piscina ha sido revocado por su propietario.",
    secondary_invited_label: "{pool} - Invitado",
    context_loading: "Cargando piscina…",
    context_secondary_option: "Piscina de {pseudo}",
    banner_secondary: "{pool} — cuenta de {pseudo}",
    invite_response_title: "Invitación",
    invite_response_text: "{pseudo} te invita a acceder a la piscina {pool}.",
    invite_response_accept: "Aceptar",
    invite_response_decline: "Rechazar",
    invite_response_accepted: "Invitación aceptada. Encuentra esta piscina en Ajustes.",
    invite_response_declined: "Invitación rechazada.",
    invite_response_expired: "Esta invitación ha caducado.",
    invite_response_limit_reached: "Límite de 2 piscinas invitadas alcanzado en el plan gratuito — pasa a Premium para aceptar más.",
    invite_response_requires_premium: "Esta cuenta ya no está en Premium, la invitación no se puede aceptar.",
    invite_response_invalid: "Invitación no válida o ya utilizada.",
    invite_response_mismatch: "Esta invitación no corresponde a tu cuenta conectada.",
    invite_response_error: "Error al procesar la invitación.",
    invite_response_checking: "Comprobando la invitación…",
    revocation_response_title: "Solicitud de revocación",
    revocation_response_text: "{pseudo} ha solicitado la revocación de su invitación a la piscina {pool}.",
    revocation_response_accept: "Aceptar la solicitud de revocación",
    revocation_response_done: "Revocación realizada.",
    revocation_response_invalid: "Esta solicitud ya no existe o ya ha sido gestionada.",
    revocation_response_expired: "Esta solicitud de revocación ha caducado.",
    revocation_response_mismatch: "Esta solicitud no corresponde a tu cuenta conectada.",
    revocation_response_error: "Error al procesar la solicitud.",
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
    daily_limit: "Limite diário atingido — passar para Premium",
    apply_advice: "Aplicar estas recomendações",
    apply_advice_sub: "Selecione os conselhos aplicados e insira as quantidades reais.",
    advice_applied: "Recomendações aplicadas",
    advice_partial: "parcialmente aplicadas",
    adjust: "Ajustar",
    ai_analysis: "ANÁLISE IA",
    ai_analyze_btn: "Analisar com IA",
    ai_locked: "Funcionalidade reservada para o Premium",
    ai_analyzing: "Analisando…",
    ai_api_missing: "Insira sua chave API nas Configurações para ativar a análise IA.",
    follow_order: "Siga os passos na ordem: cada tratamento modifica o equilíbrio da água.",
    in_range: "Na faixa",
    too_high: "Muito alto",
    too_low: "Muito baixo",
    target: "alvo",
    evolution: "Evolução",
    show_values: "Mostrar valores no gráfico",
    show_all_params: "Mostrar parâmetros",
    hide_all_params: "Ocultar parâmetros",
    journal: "Registro",
    no_history: "Ainda sem histórico",
    no_history_sub: "Suas medições aparecerão aqui ao longo do tempo.",
    report: "Relatório",
    time_col: "Horário",
    advised_col: "Aconselhado",
    ccl_col: "CCL",
    hard_col: "TH",
    phos_col: "Fos.",
    copper_col: "Cobre",
    iron_col: "Ferro",
    param_ccl: "Cloro combinado (CCL)",
    param_hard: "Dureza (TH)",
    param_phos: "Fosfatos",
    param_copper: "Cobre",
    param_iron: "Ferro",
    reco_hard_low: "Dureza muito baixa ({val} mg/L)",
    reco_hard_high: "Dureza muito alta ({val} mg/L)",
    reco_phos_high: "Fosfatos muito altos ({val} µg/L)",
    reco_copper_high: "Cobre muito alto ({val} mg/L)",
    reco_iron_high: "Ferro muito alto ({val} mg/L)",
    reco_fallback_hard: "Cloreto de cálcio",
    reco_fallback_phos: "Anti-fosfatos",
    reco_fallback_sequestrant: "Sequestrante de metais",
    note_tac_plus: "Adicionar gradualmente, filtração ligada. Aguardar 6h.",
    note_calcium: "Diluir antes de adicionar. Filtração ligada.",
    note_anti_phos: "Despejar na frente do injetor de retorno, filtração 24h.",
    note_sequestrant: "Tratamento cobre/ferro. Despejar ao redor da piscina.",
    note_floculant: "Tratamento pontual para água turva, não monitorizado automaticamente pela app. Despejar em frente aos bocais de retorno, filtração em funcionamento, depois parar 24h para decantação.",
    action_hard_plus: "Aumentar dureza (TH)",
    action_phos_minus: "Reduzir fosfatos",
    action_sequestrant: "Sequestrante de metais (cobre/ferro)",
    action_floculant: "Floculante / clarificante",
    action_outil_mesure: "Ferramenta de medição (tiras de teste, etc.)",
    legal_notices: "Avisos legais",
    lcen_title: "Avisos legais",
    lcen_editor: "Editor",
    lcen_editor_val: "Arnaud Goumain — Particular",
    lcen_host: "Hospedagem",
    lcen_host_val: "GitHub Inc. / Microsoft Corporation\n88 Colin P Kelly Jr St\nSan Francisco, CA 94107, USA",
    lcen_contact: "Contato",
    lcen_contact_val: "support@poolgenai.com",
    lcen_cgu_title: "Termos de uso",
    lcen_ai_title: "Inteligência artificial",
    lcen_ai_val: "Ao usar a análise de IA, os seus dados passam pela infraestrutura técnica do editor (servidor intermediário), que utiliza uma chave API subscrita pelo editor. Sem retenção nem registo do conteúdo transmitido neste servidor.",
    lcen_photos_title: "Fotos",
    lcen_photos_val: "Envie apenas fotos de equipamentos de medição ou água da piscina. Excluídos: pessoas identificáveis, elementos de localização, dados pessoais visíveis.",
    lcen_gdpr: "Dados pessoais",
    lcen_gdpr_val: "De acordo com o RGPD, você tem o direito de acessar, retificar, apagar e portar seus dados. Entre em contato conosco no endereço acima ou apresente uma reclamação à autoridade de proteção de dados.",
    lcen_calibration_title: "Melhoria coletiva das análises de fotos",
    lcen_calibration_val: "Quando uma medição inclui tanto uma foto do fotômetro quanto uma foto da tira de teste para o mesmo parâmetro, o PoolGenAI pode extrair um dado de calibração anônimo (cor medida, valor de referência, tipo de tira identificado) e compartilhá-lo com todos os usuários do aplicativo, com o único objetivo de melhorar a precisão da interpretação das tiras de teste para todos. Esses dados de calibração não contêm fotos, identificadores de conta nem qualquer informação que permita identificar o usuário de origem. O usuário pode desativar essa contribuição a qualquer momento nas configurações do aplicativo; essa recusa não afeta o uso normal do PoolGenAI.",
    lcen_photocontrib_title: "Contribuição de fotos para a base comum de produtos",
    lcen_photocontrib_val: "Quando um usuário fotografa um produto que ainda não tem foto na base comum de produtos partilhada entre usuários, essa foto pode ser transmitida e armazenada para ilustrar a ficha de produto correspondente, visível a todos os usuários. Apenas a foto do produto em si está envolvida. Uma vez contribuída, a foto não pode ser retirada individualmente — nenhuma informação liga uma foto ao seu contribuidor.",
    photo_warning_title: "Atenção antes de fotografar",
    photo_warning_body: "Certifique-se de que a foto não contenha:\n• pessoas identificáveis\n• elementos que possam localizar sua residência\n• dados pessoais visíveis\n\nRecomendamos desativar a geolocalização nas configurações da câmera.",
    photo_warning_confirm: "Entendi, continuar",
    ai_clause_title: "Análise IA",
    ai_clause_body: "Ao ativar a análise IA, os seus dados (medições e fotos) passam pela infraestrutura técnica do PoolGenAI, que utiliza uma chave API subscrita pelo editor — não precisa de fornecer nenhuma chave. Sem retenção nem registo do conteúdo transmitido neste servidor intermediário.",
    cgu_update_title: "Termos atualizados",
    cgu_update_body: "Os termos de uso foram atualizados (v{version}). Por favor leia e aceite-os para continuar.",
    cgu_update_accept: "Ler e aceitar",
    cgu_version_label: "Versão termos",
    cgu_accepted_on: "Aceito em",
    cgu_updated_title: "Termos atualizados",
    cgu_updated_body: "Os termos de uso foram atualizados. Por favor leia e aceite-os.",
    cgu_required_title: "Termos de uso",
    cgu_required_body: "Aceita os nossos termos de uso para continuar.",
    cgu_read_full_text: "Ler o texto completo",
    cgu_hide_full_text: "Ocultar o texto",
    applied_col: "Aplicado",
    disclaimer_title: "Aviso legal & Termos de uso",
    disclaimer_cgu: "Aceito os termos de uso e a política de privacidade",
    disclaimer_data: "Concordo que meus dados de tratamento sejam coletados e compartilhados com parceiros do setor de piscinas/spa",
    disclaimer_required: "A aceitação dos termos é obrigatória",
    disclaimer_pro: "Os profissionais que usam o PoolGenAI para serviços prestados a terceiros devem obter o consentimento dos proprietários das piscinas.",
    revoke_data_consent: "Revogar consentimento de dados",
    revoke_data_confirm: "Seu consentimento foi revogado.",
    pool_email: "Email relatório PDF",
    pool_email_placeholder: "contato@exemplo.com.br",
    pool_settings_title: "Configurações da piscina",
    edit_pool: "Editar piscina",
    generate_report: "Gerar relatório da piscina",
    report_locked: "Relatório PDF reservado para o Premium",
    report_desc: "O relatório inclui o histórico de medições, conselhos dados e quantidades realmente aplicadas.",
    diag_section: "DIAGNÓSTICO IA",
    diag_placeholder: "Descreve o problema que estás a ter com a tua piscina apesar dos tratamentos (ex. água turva, cloro que desaparece, algas persistentes...)",
    diag_submit: "Analisar com IA",
    diag_analyzing: "A analisar...",
    diag_confidence: "Índice de confiança",
    diag_history_title: "Histórico de diagnósticos IA",
    diag_history_date: "Data",
    diag_history_note: "Nota",
    diag_history_response: "Resposta IA",
    diag_history_confidence: "Confiança",
    diag_history_delete: "Excluir",
    diag_history_empty: "Nenhum diagnóstico salvo ainda.",
    diag_history_locked: "Histórico de diagnósticos IA reservado para o Premium",
    diag_history_confirm_delete: "Excluir este diagnóstico?",
    update_required_title: "Nova versão disponível",
    update_required_desc: "Uma nova versão do PoolGenAI foi lançada. Atualize o aplicativo para continuar.",
    update_required_btn: "Atualizar agora",
    update_in_progress_title: "Atualização em curso",
    update_in_progress_desc: "Demora apenas um instante, a aplicação vai recarregar automaticamente.",
    diag_off_topic: "Esta pergunta não está relacionada com o tratamento da água da piscina. Só respondo a perguntas sobre química da água, produtos de tratamento e equipamentos de piscina.",
            diag_error: "Análise impossível",
    import_pdf_btn: "Importar relatório PDF",
    import_pdf_prefill_title: "Medição importada de PDF",
    import_pdf_analyzing: "A IA está a ler o ficheiro...",
    import_pdf_error: "Impossível ler este ficheiro",
    import_pdf_no_values: "Nenhum valor encontrado neste ficheiro",
    import_pdf_needs_ai: "Importação PDF disponível com análise IA (Definições → Ativar análise IA)",
    import_diag_added_one: "1 diagnóstico IA importado deste documento.",
    import_diag_added_many: "{n} diagnósticos IA importados deste documento.",
    suspended_title: "Conta suspensa",
    suspended_desc: "A tua conta foi suspensa e o acesso à aplicação já não está disponível.",
    suspended_erase_btn: "Apagar os meus dados",
    suspended_erasing: "A apagar...",
    suspended_erase_confirm: "Esta ação apaga permanentemente todos os teus dados (medições, produtos, histórico, diagnósticos). Continuar?",
    legend_title: "Legenda dos parâmetros e valores alvo",
    ccl_fcl_tcl_error: "Erro: FCL + CCL não pode ultrapassar TCL. Verifica os valores introduzidos.",
    tcl_forced_to_fcl_info: "TCL não pode ser inferior a FCL — valor corrigido para {val}. Toca novamente em Guardar para confirmar.",
    param_ph_long: "Potencial de hidrogénio", param_fcl_long: "Cloro livre", param_tcl_long: "Cloro total",
    param_ccl_long: "Cloro combinado (cloraminas)", param_tac_long: "Alcalinidade total",
    param_cya_long: "Ácido cianúrico (estabilizador)", param_th_long: "Dureza total",
    param_phos_long: "Fosfatos", param_cu_long: "Cobre", param_fe_long: "Ferro", param_temp_long: "Temperatura da água",
    new_measure_title: "Nova medição",
    edit_measure_title: "Editar medição",
    date_time: "Data e hora",
    photo_hint: "Fotografe a tela do seu fotômetro com valores legíveis, ou coloque sua tira de teste embebida ao lado da legenda do tubo e fotografe ambos juntos.",
    photo_hint_bandelette: "Tira de teste: tire 2-3 fotos girando o tubo para expor cada escala de cor.",
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
    analyze_locked: "Foto + análise IA reservadas para o Premium",
    product_ai_hint: "Ative a análise IA nas Definições para preencher estes campos automaticamente a partir da foto.",
    product_sync_error: "Falha na sincronização dos produtos — a foto pode ser demasiado grande, tenta com uma foto mais leve.",
    config_sync_error: "Falha na sincronização — verifica a tua ligação. ({detail})",
    repair_orphaned_title: "{count} entrada(s) órfã(s) detetada(s)",
    repair_orphaned_desc: "Algumas medições, tratamentos ou produtos não estão associados a nenhuma piscina existente (geralmente após um erro de sincronização). Serão associados à tua piscina ativa.",
    repair_orphaned_btn: "Reparar agora",
    repair_orphaned_confirm: "Associar {count} entrada(s) órfã(s) à piscina ativa?",
    delete_pool_confirm: "Desativar esta piscina? Deixará de aparecer na aplicação, mas o histórico é mantido.",
    account_deleted_title: "Conta eliminada",
    account_deleted_desc: "Esta conta foi eliminada e o acesso à aplicação já não está disponível.",
    account_deleted_request_btn: "Não recomeçar com este endereço, e pedir a recuperação ou eliminação dos meus dados",
    back_to_home: "Voltar à página inicial",
    reactivate_btn: "Recomeçar com este endereço",
    reactivate_confirm: "Recomeçar do zero com este endereço? As tuas piscinas atuais ficarão ocultas (nunca mais mostradas, mas não eliminadas). Terás de criar uma nova piscina.",
    reset_password_hint: "Repor a minha palavra-passe",
    data_request_title: "Recuperação ou eliminação de dados",
    data_request_desc: "Escolhe a ação pretendida. Será enviado um pedido ao suporte, que te contactará por email.",
    data_request_option_erase: "Eliminar todos os meus dados",
    data_request_option_recover: "Recuperar todos os meus dados, não eliminar",
    data_request_option_recover_erase: "Recuperar e eliminar todos os meus dados",
    data_request_submit: "Enviar pedido",
    data_request_sending: "A enviar...",
    data_request_sent: "Pedido enviado. O suporte vai contactar-te por email.",
    data_request_error: "Falha ao enviar. Tenta novamente ou escreve diretamente para support@poolgenai.com.",
    note_optional: "Nota (opcional)",
    note_placeholder: "Água turva, sol forte, natação prevista...",
    save_measure: "Salvar medição",
    save: "Guardar",
    cancel: "Cancelar",
    save_changes: "Salvar alterações",
    my_products: "MEUS PRODUTOS",
    products_formula: "A dosagem é calculada como: {quantidade} para variar o parâmetro em {efeito} por {volume} m³.",
    products_to_buy: "Produtos a comprar",
    products_to_buy_empty: "Nada a comprar por agora — todos os stocks são suficientes.",
    generic_products_section: "Produtos recomendados em falta",
    generic_products_hint: "Com base no tipo de tratamento desta piscina, estes produtos ainda não estão na tua lista.",
    add_generic_product: "Adicionar",
    generic_product_added: "Adicionado aos teus produtos",
    reason_low_stock: "Stock baixo",
    reason_insufficient_plan: "Insuficiente para o plano em curso",
    apply_product_manual: "Aplicar um produto",
    reason_manual_maintenance: "Manutenção manual",
    products_locked: "Funcionalidade reservada para o Premium",
    stock_not_managed: "A gestão de estoque não está ativada para esta piscina. Ative nas Configurações.",
    activate_in_settings: "Ativar nas Configurações →",
    delete_all_products: "Excluir todos os produtos desta piscina",
    stock_label: "Estoque:",
    stock_remaining: "restante",
    edit_product: "Editar produto",
    new_product: "Novo produto",
    product_photo: "Foto do produto (rótulo)",
    product_photo_hint: "Tira uma foto por elemento — frente do produto, código de barras, ficha de dosagem — para um reconhecimento mais fiável. Uma só foto basta se tudo estiver visível nela.",
    common_product_candidate_title: "Produto semelhante encontrado na base comum:",
    common_product_same: "Sim, mesmo produto",
    common_product_different: "Não, produto diferente",
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
    stock_locked: "Gestão de estoque reservada para o Premium",
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
    wizard_title: "Plano de tratamento",
    wizard_step: "Passo",
    wizard_of: "de",
    wizard_now: "Agora",
    wizard_in: "Em",
    wizard_at: "às",
    wizard_scheduled: "Previsto",
    wizard_earliest: "O mais cedo possível",
    chlore_timing_tip: "Para melhor eficácia, aplica de preferência à noite, após o último banho e ao pôr do sol.",
    wizard_done: "Feito",
    wizard_skip: "Pular este passo",
    wizard_anticipate: "Aplicar agora",
    wizard_finish: "Terminar plano",
    wizard_reminder: "Lembrar do próximo passo?",
    wizard_reminder_yes: "Sim, lembrar",
    wizard_reminder_no: "Não, obrigado",
    wizard_next_step: "Próximo passo",
    wizard_start: "Iniciar plano",
    plan_in_progress: "Plano de tratamento em curso",
    wizard_apply_time: "Hora de aplicação",
    wizard_edit_prev: "Editar etapa anterior",
    wizard_resume: "Retomar plano",
    wizard_completed: "Plano de tratamento concluído ✓",
    wizard_partial: "Plano em andamento",
    countdown_done: "Hora do tratamento!",
    treatment_at: "Tratamento aplicado às",
    edit_treatment_section_title: "Tratamento aplicado",
    treatment_skipped: "Passo ignorado",
    settings_title: "Configurações",
    my_pools: "Minhas piscinas",
    pool_name: "Nome da piscina",
    location: "Localização",
    volume: "Volume (m³)",
    treatment_type: "Tipo de tratamento",
    measure_device_label: "Método de medição",
    measure_device_photometre: "Apenas fotômetro",
    measure_device_bandelette: "Apenas tira de teste",
    measure_device_both: "Ambos",
    strip_model_label: "Modelo de tira de teste utilizado",
    strip_model_none: "Não especificado",
    filtration_type: "Tipo de filtração",
    manage_stock_label: "Gestão de estoque",
    manage_stock_desc: "Rastreia o consumo de produtos e o exibe no relatório.",
    manage_stock_locked: "Disponível no Premium",
    api_key_label: "Chave API Anthropic ou URL proxy Cloudflare Worker",
    provider_label: "Provedor",
    api_key_placeholder: "sk-ant-... ou https://meu-proxy.workers.dev",
    api_key_desc: "Sua chave é armazenada localmente.",
    premium_section: "VERSÃO",
    premium_label: "Versão Premium",
    premium_test: "Assinatura mensal ou anual",
    premium_desc: "Gratuito: 1 piscina, sem convites, 1 medição por dia. Premium: até 3 piscinas, 2 convites por piscina, medições ilimitadas, fotos, produtos.",
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
    cl_libre_col: "FCL",
    cl_total_col: "TCL",
    tac_col: "TAC",
    cya_col: "CYA",
    temp_col: "TEMP.",
    product_col: "Produto",
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
    paywall_title: "Passar para Premium",
    paywall_desc: "Medições ilimitadas · Análise IA de tiras · Relatório PDF · Gestão de estoque",
    paywall_context_measure_limit: "Você atingiu o limite de 1 medição gratuita por dia.",
    paywall_context_start_plan: "O acompanhamento passo a passo do tratamento é reservado ao Premium.",
    paywall_context_products: "A gestão de produtos e estoque é reservada ao Premium.",
    pool_limit_reached: "Limite de 3 piscinas atingido no Premium.",
    paywall_context_report: "O relatório PDF é reservado ao Premium.",
    paywall_context_photos: "A análise de fotos por IA é reservada ao Premium.",
    paywall_context_stock: "A gestão de estoque é reservada ao Premium.",
    paywall_btn: "Ativar o Premium",
    paywall_close: "Mais tarde",
    add_pool_title: "Nova piscina",
    first_pool_title: "Bem-vindo ao PoolGenAI",
    first_pool_intro: "Configura a tua primeira piscina para começar a acompanhar a química da água.",
    edit_pool_title: "Editar piscina",
    pool_name_placeholder: "Minha piscina",
    pool_location_placeholder: "Pesquisar uma cidade...",
    location_use_gps: "Usar minha localização",
    location_searching: "Buscando...",
    location_search_error: "Busca indisponível, tente novamente",
    location_no_results: "Nenhuma cidade encontrada",
    location_gps_error: "Localização indisponível",
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
    pool_photo_locked: "Fotos da piscina reservadas para o Premium",
    sign_in: "Entrar",
    account_section: "Minha conta",
    confirm_password: "Confirmar senha",
    pwd_min6: "Mínimo 6 caracteres",
    error_pwd_mismatch: "As senhas não coincidem.",
    error_email_required: "Email inválido.",
    account_created: "Conta criada!",
    verify_email_notice: "Um email de confirmação foi enviado para o teu endereço. Clica no link para ativar a tua conta.",
    verify_gate_title: "Verifica o teu endereço de email",
    verify_gate_desc: "Para aceder à app, confirma o teu endereço clicando no link recebido por email",
    verify_gate_check_btn: "Confirmei — Continuar",
    verify_link_checking: "A verificar o teu email…",
    verify_link_verified_title: "Email verificado!",
    verify_link_verified_desc: "O teu endereço de email está confirmado. Podes continuar.",
    verify_link_already_title: "Já verificado",
    verify_link_already_desc: "Este endereço de email já estava confirmado.",
    verify_link_expired_title: "Link expirado",
    verify_link_expired_desc: "Este link de verificação expirou. Pede um novo email na app.",
    verify_link_invalid_title: "Link inválido",
    verify_link_invalid_desc: "Este link de verificação não é válido. Pede um novo email na app.",
    verify_link_error_title: "Erro",
    verify_link_error_desc: "Não foi possível verificar o teu email agora. Tenta mais tarde.",
    verify_link_continue_btn: "Continuar para a app",
    merge_link_pending_title: "Confirmar a fusão?",
    merge_link_pending_desc: "Foi detetado um código de barras para uma ficha de produto já presente na base comum, sem código de barras associado. Confirma para ligar as duas.",
    merge_link_confirm_btn: "Confirmar fusão",
    merge_link_cancel_btn: "Cancelar",
    merge_link_confirming: "A fundir…",
    merge_link_merged_title: "Fusão confirmada",
    merge_link_merged_desc: "O código de barras foi ligado à ficha de produto existente.",
    merge_link_already_merged_title: "Já fundido",
    merge_link_already_merged_desc: "Esta fusão já tinha sido confirmada.",
    merge_link_expired_title: "Link expirado",
    merge_link_expired_desc: "Este link de confirmação expirou (válido 7 dias).",
    merge_link_invalid_title: "Link inválido",
    merge_link_invalid_desc: "Este link de confirmação não é válido.",
    merge_link_error_title: "Erro",
    merge_link_error_desc: "Não foi possível confirmar a fusão neste momento. Tenta mais tarde.",
    verify_gate_checking: "A verificar...",
    verify_gate_still_unverified: "O teu email ainda não está confirmado. Verifica a caixa de entrada (e o spam).",
    verify_gate_resend_btn: "Reenviar email de confirmação",
    verify_gate_resend_sent: "Email reenviado — verifica também o spam.",
    verify_gate_resend_error: "Não foi possível enviar o email agora. Tenta mais tarde.",
    verify_gate_signout: "Terminar sessão",
    verify_email_send_failed: "Não foi possível enviar o email de confirmação. Tenta novamente abaixo.",
    verify_email_retry_btn: "Reenviar email",
    verify_email_resent: "Email reenviado ✓",
    account_created_sub: "Bem-vindo ao PoolGenAI. Já podes usar a app.",
    start_app: "Iniciar a app",
    sign_out: "Sair",
    delete_account: "Eliminar minha conta",
    delete_account_confirm: "Eliminar a tua conta? Deixarás de conseguir iniciar sessão. Os teus dados são mantidos — poderás pedir a sua recuperação ou eliminação definitiva.",
    account_delete_flag_error: "Falha ao eliminar a conta. Tenta novamente.",
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
    user_not_found: "Nenhuma conta com este email. Se achas que é um erro, contacta support@poolgenai.com",
    account_disabled: "Esta conta foi desativada. Contacta support@poolgenai.com para mais informações.",
    login_failed_unified: "Email ou palavra-passe incorretos.",
    create_account_hint: "Ainda não tens conta? Criar conta",
    email_in_use: "Este email já está em uso.",
    weak_password: "Senha muito curta (mín. 6 caracteres).",
    firebase_not_configured: "⚠️ Firebase não configurado — apenas modo offline.",
    note_ph_minus: "Verificar o pH antes de cada adição. Máx 1 kg/100 m³/dia ou espaçar 2h.",
    note_ph_plus: "Distribuir por toda a piscina com filtração em funcionamento.",
    note_chlore_choc: "Adicionar à noite após o pôr do sol. Não estabiliza (não aumenta o CYA).",
    note_galets: "Aumenta o CYA a cada uso. Evitar se o CYA já estiver acima de 50 mg/L.",
    prod_name_ph_minus: "Redutor de pH (ácido / tipo Reva Minus)",
    prod_name_ph_plus: "Aumentador de pH",
    prod_name_chlore_choc: "Cloro choque não estabilizado (tipo Chloryte)",
    prod_name_galets: "Pastilhas cloro estabilizado 5-em-1 (tipo Chlorilong)",
    packaging_type: "Embalagem",
    packaging_vrac: "A granel / granulado",
    packaging_galets: "Pastilhas / sticks",
    unit_weight_label: "Peso por unidade (g)",
    maintenance_ratio_label: "Rácio de manutenção do fabricante",
    maintenance_units_label: "Nº unidades",
    maintenance_volume_label: "Por m³",
    maintenance_days_label: "A cada X dias",
    unit_galets: "pastilhas",
    unit_units: "unidades",
    quantity_unit_mode_kg: "kg",
    quantity_unit_mode_units: "unidades",
    maintenance_card_title: "Manutenção contínua",
    maintenance_card_text: "{units} pastilha(s) / {volume} m³, a cada {days} dias",
    no_stock_category_hint: "Nenhum produto em stock nesta categoria — entrada livre",
    no_stock_generic_hint: "Nenhum produto em stock nesta categoria — produto genérico sugerido",
    prod_name_tac_plus: "Produto TAC+ (bicarbonato de sódio)",
    prod_name_calcium: "Cloreto de cálcio (dureza +)",
    prod_name_anti_phos: "Anti-fosfatos (tipo PHOSfree)",
    prod_name_sequestrant: "Sequestrador de metais (tipo Metal Free)",
    prod_name_floculant: "Floculante clarificante líquido (tipo Reva-Flock)",
    prod_name_sel: "Sal de piscina (NaCl puro ≥ 99%, saco 25 kg)",
    action_ph_plus: "Sobe o pH",
    action_chlore: "Cloro não estabilizado (choque)",
    action_chlore_stabilise: "Cloro estabilizado (CYA +)",
    action_tac_plus: "Sobe o TAC",
    action_tac_minus: "Desce o TAC",
    action_brome: "Bromo",
    action_o2: "Oxigênio ativo",
    action_sel: "Sal (salinidade)",
    axis_legend_d: "ᴅ escala dezenas (TAC, CYA, temperatura) — direita",
    reco_tac_low: "TAC muito baixo ({val} mg/L)",
    reco_tac_high: "TAC muito alto ({val} mg/L)",
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
    reco_recheck_later: "Recomenda-se novo controlo dentro de algumas horas",
    reco_cl_shock_text: "esta noite (tratamento de choque)",
    reco_note_tac: "Um TAC baixo torna o pH instável.",
    reco_note_tac_minus: "Mesmo ácido do pH-, mas o efeito no TAC deve ser calibrado à parte. Corrigir antes do pH, em pequenas doses.",
    reco_no_product_note: "Nenhum produto configurado para esta ação. Adiciona um no separador Produtos.",
    product_empty_delete_confirm: "{name} está a 0% de stock. Remover da lista?",
    product_missing_values: "Preenche estes campos antes de guardar: {fields}.",
    reco_note_ph_before_tac: "pH corrigido antes do TAC: a este pH o cloro seria pouco eficaz, e o TAC não está baixo o suficiente para ser urgente.",
    reco_order_intro_default: "Esta ordem segue a lógica de tratamento: os parâmetros que impedem a eficácia dos outros são corrigidos primeiro.",
    reco_order_reason_metals: "O sequestrante passa antes de qualquer desinfetante porque foram detetados metais dissolvidos — caso contrário, o cloro precipita-os e mancha a piscina.",
    reco_order_reason_contamination: "O desinfetante tem prioridade porque o cloro combinado está alto ({combined} mg/L): o objetivo é {target} mg/L de cloro livre para atingir o ponto de rutura e destruir as cloraminas.",
    reco_order_reason_cya_block: "O choque de cloro é substituído por diluição porque o estabilizador (CYA) está demasiado alto para um choque ser eficaz.",
    reco_order_reason_ph_before_tac: "O pH passa antes do TAC porque o desvio é demasiado grande para esperar.",
    reco_order_reason_ph_chlore_delay: "Respeita-se um intervalo de 6h entre a correção do pH e o choque de cloro para evitar precipitações.",
    reco_note_combined: "Cloro combinado = cloraminas, sinal de desinfecção insuficiente. Adicionar à noite, filtração contínua.",
    reco_note_sel: "Usar sal de piscina (NaCl puro ≥ 99%). Dissolver antes de adicionar ou verter perto do skimmer, filtração 24h.",
    reco_note_o2: "Não misturar com cloro. Filtração por 4h.",
    prod_name_o2_liquide: "Oxigénio ativo líquido (peróxido de hidrogénio)",
    note_o2_liquide: "Não misturar com cloro. Deitar em frente aos bicais de retorno, com a filtração em funcionamento.",
    reco_note_brome: "Verter longe das entradas de água, filtração em funcionamento.",
    reco_note_cya: "Nenhum produto baixa o CYA quimicamente, só a diluição funciona. Evitar cloro estabilizado enquanto o CYA estiver alto.",
    reco_cya_block_shock: "Estabilizador muito alto para um choque eficaz ({val} mg/L)",
    reco_note_cya_block_shock: "Acima de 75 mg/L de CYA, um choque de cloro clássico já não atinge o ponto de ruptura. Só a diluição (renovação parcial da água) funciona — nada de choque de cloro até isso ser feito.",
    reco_fallback_tac: "Produto TAC+ (bicarbonato de sódio)",
    reco_fallback_tac_minus: "Produto TAC- (ácido clorídrico ou bissulfato de sódio)",
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
    paywall_perk7: "Até 3 piscinas, 2 convites por piscina",
    paywall_test_note: "Pagamento seguro via Stripe. Cancelável a qualquer momento.",
    paywall_price_monthly: "2,99 € / mês",
    paywall_price_yearly: "24,99 € / ano",
    paywall_price_yearly_hint: "ou 24,99 € / ano",
    paywall_plan_monthly: "Mensal",
    paywall_plan_yearly: "Anual",
    paywall_plan_yearly_badge: "-30%",
    manage_subscription_btn: "Gerir assinatura",
    checkout_error: "Não foi possível iniciar o pagamento. Tenta novamente.",
    portal_error: "Não foi possível abrir a gestão da assinatura. Tenta novamente.",
    stripe_activation_checking: "A confirmar o teu pagamento…",
    stripe_activation_delay_title: "Está a demorar mais do que o habitual",
    stripe_activation_delay_desc: "O teu pagamento foi recebido, mas a ativação está a demorar um pouco mais. Tenta recarregar a app daqui a um minuto.",
    stripe_activation_continue_btn: "Continuar",
    premium_reveal_title: "Premium ativado",
    premium_reveal_sub: "Até 3 piscinas, 2 convites por piscina, medições sem limite",
    premium_downgrade_title: "Voltar à versão gratuita",
    premium_downgrade_sub: "Os recursos Premium estão agora desativados",
    premium_downgrade_confirm_title: "Desativar o Premium?",
    premium_downgrade_confirm_desc: "Perderás o acesso a:",
    premium_downgrade_confirm_btn: "Desativar o Premium",
    premium_downgrade_cancel_btn: "Cancelar e manter Premium",
    onboarding_step1_title: "Bem-vindo ao PoolGenAI",
    onboarding_step1_text: "Acompanha a química da tua piscina com facilidade: medições, dosagens e um plano de tratamento personalizado.",
    onboarding_step2_title: "Basta uma foto",
    onboarding_step2_text: "Tira uma foto da tua tira reagente ou do ecrã do fotómetro. A IA lê as cores e preenche os campos por ti — acabou-se comparar a olho.",
    onboarding_step3_title: "Resultados claros",
    onboarding_step3_text: "Cada parâmetro é comparado com o seu objetivo: pH, cloro, TAC, estabilizante... Um código de cores simples diz-te num relance o que está bem e o que precisa de correção.",
    onboarding_step4_title: "Um plano priorizado",
    onboarding_step4_text: "A app determina a ordem dos tratamentos a aplicar e os tempos de espera entre cada etapa, para não desperdiçares um tratamento por avançares depressa demais.",
    onboarding_step5_title: "Aplica com confiança",
    onboarding_step5_text: "A dose exata é calculada para o volume da tua piscina e o produto que usas. Marca a etapa como feita, e a app avança para a seguinte.",
    onboarding_step6_title: "Acompanha a evolução",
    onboarding_step6_text: "Visualiza as tuas medições ao longo do tempo para identificar tendências e antecipar desvios antes que se tornem um problema.",
    onboarding_step7_title: "Gere o teu stock",
    onboarding_step7_text: "Acompanha as quantidades restantes de cada produto e recebe um alerta antes de esgotar.\n\nAdiciona a tua primeira medição quando quiseres. Até 3 piscinas, relatório PDF e mais: descobre o Premium mais tarde em Definições.",
    onboarding_step3_legend_bad: "Demasiado alto ou demasiado baixo",
    onboarding_next: "Seguinte",
    onboarding_skip: "Saltar",
    onboarding_start: "Vamos lá",
    help_section: "Ajuda",
    settings_replay_onboarding: "Rever a apresentação",
    context_switch_premium_title: "Piscina Premium",
    context_switch_premium_sub: "Esta piscina beneficia das funcionalidades Premium do seu proprietário",
    context_switch_free_title: "De volta à tua piscina",
    context_switch_free_sub: "Estás de volta à tua própria piscina",
    report_print_btn: "Imprimir / Salvar como PDF",
    share_report: "Partilhar relatório",
    report_email_subject: "Relatório PoolGenAI — {pool}",
    report_email_greeting: "Olá,",
    report_email_body: "Encontra abaixo as instruções para obter o relatório PDF da piscina \"{pool}\":",
    report_email_step1: "1. Abra a app PoolGenAI",
    report_email_step2: "2. Aba Histórico → Gerar relatório",
    report_email_step3: "3. Clique em \"Imprimir / Salvar como PDF\"",
    report_email_sign: "Com os melhores cumprimentos,",
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
    unlimited_version: "Premium",
    active_pool: "Piscina ativa",
    pool_volume: "Volume piscina (m³)",
    treatment_params: "Parâmetros:",
    treatment_desc: "O tratamento determina quais parâmetros são medidos e os alvos recomendados. O volume é usado para calcular as doses de produto.",
    subscription: "Assinatura",
    unlimited_active: "Modo Premium ativo",
    free_mode: "Versão gratuita",
    api_section: "ANÁLISE IA",
    ai_toggle_label: "Ativar análise IA",
    ai_toggle_desc: "Permite analisar fotos de medição com inteligência artificial.",
    calibration_toggle_label: "Contribuir para a melhoria coletiva",
    calibration_toggle_desc: "Compartilha dados de calibração anônimos (cor medida, valor de referência) para melhorar a leitura de tiras de teste para todos. Nenhuma foto ou identificador é transmitido.",
    ai_password_title: "Acesso configuração IA",
    ai_password_prompt: "Digite a senha para ativar a análise IA",
    ai_password_error: "Senha incorreta",
    ai_configure_btn: "Configurar chave API",
    ai_config_title: "Configuração IA",
    ai_config_back: "Voltar às configurações",
    ai_locked_settings: "Análise IA reservada para o Premium",
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
    delegation_section_title: "Delegação",
    linked_pools_title: "Piscinas às quais fui convidado",
    linked_pools_empty: "Não tens acesso a nenhuma piscina como convidado.",
    request_revocation_button: "Pedir revogação",
    request_revocation_confirm: "Pedir a revogação do teu acesso à piscina \"{pool}\"? {pseudo} vai receber um email para confirmar.",
    request_revocation_sent: "Pedido enviado. Vais receber um email assim que a revogação for confirmada.",
    request_revocation_error: "Falha ao enviar o pedido.",
    secondary_section_title: "Usuários secundários",
    secondary_section_intro: "Convida até 2 pessoas para acessar a mesma piscina (reservado ao Premium).",
    secondary_invite_requires_premium: "Os convites são reservados ao Premium.",
    secondary_invite_pool_full: "Esta piscina já tem 2 convidados, é o máximo.",
    secondary_invite_button: "Convidar alguém",
    secondary_invite_email_label: "Email da pessoa a convidar",
    secondary_invite_pool_label: "Piscina",
    secondary_invite_send: "Enviar convite",
    secondary_invite_sent: "Convite enviado.",
    secondary_invite_error: "Falha ao enviar o convite",
    secondary_active_title: "Acessos ativos",
    secondary_active_empty: "Nenhum acesso ativo.",
    secondary_pool_label: "Piscina: {pool}",
    secondary_revoke_button: "Revogar",
    secondary_revoke_confirm: "Revogar o acesso de {email}?",
    secondary_revoke_error: "Falha ao revogar o acesso",
    secondary_pending_title: "Convites pendentes",
    secondary_pending_empty: "Nenhum convite pendente.",
    secondary_pending_expires: "Expira em {date}",
    secondary_pending_expired: "Expirado",
    secondary_cancel_button: "Cancelar",
    secondary_cancel_confirm: "Cancelar o convite enviado para {email}?",
    secondary_cancel_error: "Falha ao cancelar o convite",
    pseudo_label: "Teu apelido",
    pseudo_placeholder: "Visível para quem te convida",
    pseudo_save: "Guardar",
    pseudo_saved: "Apelido guardado.",
    pseudo_invalid: "De 2 a 24 caracteres (letras, números, espaços, hífens).",
    pseudo_taken_suggestion: "Já em uso. Tenta: {suggestion}",
    pseudo_error: "Falha ao guardar o apelido",
    context_title: "Piscina exibida",
    context_own: "Minhas piscinas",
    secondary_pool_unavailable_title: "Piscina indisponível",
    secondary_pool_unavailable_desc: "Esta piscina não foi encontrada. Pode ter sido eliminada, ou há um problema de rede ao carregar. Tenta novamente mais tarde.",
    secondary_pool_revoked_desc: "O teu acesso a esta piscina foi revogado pelo proprietário.",
    secondary_invited_label: "{pool} - Convidado",
    context_loading: "A carregar a piscina…",
    context_secondary_option: "Piscina de {pseudo}",
    banner_secondary: "{pool} — conta de {pseudo}",
    invite_response_title: "Convite",
    invite_response_text: "{pseudo} convida-te a aceder à piscina {pool}.",
    invite_response_accept: "Aceitar",
    invite_response_decline: "Recusar",
    invite_response_accepted: "Convite aceite. Encontra esta piscina nas Definições.",
    invite_response_declined: "Convite recusado.",
    invite_response_expired: "Este convite expirou.",
    invite_response_limit_reached: "Limite de 2 piscinas convidadas atingido no plano gratuito — passa para Premium para aceitar mais.",
    invite_response_requires_premium: "Esta conta já não está no Premium, o convite não pode ser aceite.",
    invite_response_invalid: "Convite inválido ou já utilizado.",
    invite_response_mismatch: "Este convite não corresponde à tua conta ligada.",
    invite_response_error: "Erro ao processar o convite.",
    invite_response_checking: "A verificar o convite…",
    revocation_response_title: "Pedido de revogação",
    revocation_response_text: "{pseudo} pediu a revogação do seu convite à piscina {pool}.",
    revocation_response_accept: "Aceitar o pedido de revogação",
    revocation_response_done: "Revogação efetuada.",
    revocation_response_invalid: "Este pedido já não existe ou já foi tratado.",
    revocation_response_expired: "Este pedido de revogação expirou.",
    revocation_response_mismatch: "Este pedido não corresponde à tua conta ligada.",
    revocation_response_error: "Erro ao processar o pedido.",
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
  ccl:    { min: 0,   max: 0.5, unit: "mg/L",  label: "Chlore combiné (CCL)" },
  tac:    { min: 80,  max: 120, unit: "mg/L",  label: "TAC" },
  cya:    { min: 30,  max: 50,  unit: "mg/L",  label: "Stabilisant (CYA)" },
  hard:   { min: 200, max: 400, unit: "mg/L",  label: "Dureté (TH)" },
  phos:   { min: 0,   max: 100, unit: "µg/L",  label: "Phosphates" },
  copper: { min: 0,   max: 0.2, unit: "mg/L",  label: "Cuivre" },
  iron:   { min: 0,   max: 0.1, unit: "mg/L",  label: "Fer" },
  temp:   { min: 24,  max: 30,  unit: "°C",    label: "Température de l'eau" },
  sel:    { min: 3000,max: 5000,unit: "mg/L",  label: "Salinité (sel)" },
  brome:  { min: 2,   max: 4,   unit: "mg/L",  label: "Brome" },
  o2:     { min: 10,  max: 30,  unit: "mg/L",  label: "Oxygène actif" },
};

// Types de traitement — définissent quels paramètres sont pertinents
// et si les cibles standard s'appliquent ou sont ajustées.
// Structure de base sans labels (les labels sont traduits dynamiquement)
const TREATMENT_TYPES_BASE = [
  { value: "chlore",  labelKey: "treatment_chlore",  descKey: "treatment_chlore_desc",  params: ["pH", "fCl", "tCl", "ccl", "tac", "cya", "hard", "phos", "copper", "iron", "temp"], targets: {} },
  { value: "sel",     labelKey: "treatment_sel",     descKey: "treatment_sel_desc",     params: ["pH", "fCl", "tCl", "ccl", "tac", "sel", "hard", "phos", "copper", "iron", "temp"], targets: { pH: { min: 7.2, max: 7.6 }, fCl: { min: 0.5, max: 2 }, sel: { min: 3000, max: 5000 } } },
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

// v1.68.0 — Actions produit pertinentes pour un type de traitement donné,
// utilisé pour proposer les produits génériques manquants (DEFAULT_PRODUCTS)
// dans "Mes produits à acheter". ph-/ph+/tac+/tac-/sequestrant/floculant
// sont communs à tous les types (entretien général, indépendant du mode de
// désinfection).
function getRelevantActionsForTreatment(treatmentType) {
  const common = ["ph-", "ph+", "tac+", "tac-", "sequestrant", "floculant"];
  switch (treatmentType) {
    case "sel":
      return [...common, "chlore", "chlore-stabilise", "hard+", "phos-", "sel"];
    case "brome":
      return [...common, "brome"];
    case "o2":
      return [...common, "o2"];
    case "autre":
      return [...common, "chlore"];
    case "chlore":
    default:
      return [...common, "chlore", "chlore-stabilise", "hard+", "phos-"];
  }
}

const DEFAULT_PRODUCTS = [
  {
    id: "ph-minus",
    name: "pH moins (acide / Reva Minus type)",
    nameKey: "prod_name_ph_minus",
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
    isDefault: true,
  },
  {
    id: "ph-plus",
    name: "pH plus",
    nameKey: "prod_name_ph_plus",
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
    isDefault: true,
  },
  {
    id: "chlore-choc",
    name: "Chlore choc non stabilisé (type Chloryte)",
    nameKey: "prod_name_chlore_choc",
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
    isDefault: true,
  },
  {
    id: "galets-stabilises",
    name: "Galets chlore stabilisé 5-en-1 (type Chlorilong)",
    nameKey: "prod_name_galets",
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
    isDefault: true,
    packagingType: "galets",
    unitWeight: 250,
    maintenanceRatio: { units: 1, volumePer: 30, days: 10 },
  },
  // v1.58.0 — Produit standard manquant pour l'action "brome" : sans lui,
  // findProduct("brome") ne renvoyait jamais de dose calculable (carte
  // affichait seulement "aucun produit configuré", jamais de quantité).
  // Référence : galets BCDMH (bromochloro-diméthyl-hydantoïne), ~33% de
  // brome actif en masse (MM ≈ 241 g/mol, 1 atome de Br ≈ 80 g/mol). Un
  // galet de 20 g ≈ 6,6 g de brome actif. Dose calibrée à partir d'un cas
  // vérifié (12 galets de 20 g, soit 240 g de produit, pour amener 40 m³
  // de 0 à 2 mg/L) → 30 g de produit / 10 m³ / 1 mg/L. Valeur pour une
  // remise à niveau ponctuelle, pas pour l'amorçage initial d'un
  // brominateur (qui suit un protocole différent, non couvert ici).
  {
    id: "brome-bcdmh",
    name: "Brome BCDMH (galets ou granulés)",
    nameKey: "reco_fallback_brome",
    action: "brome",
    doseAmount: 30,
    doseUnit: "g",
    effectAmount: 1,
    effectPer: 10,
    waitHours: 6,
    noteKey: "reco_note_brome",
    note: "Verser loin des arrivées d'eau, filtration en marche.",
    containerAmount: 1,
    containerUnit: "kg",
    stockPercent: 100,
    isDefault: true,
    packagingType: "galets",
    unitWeight: 20,
  },
  // v1.58.0 — Idem pour "o2" : référence monopersulfate de potassium (MPS)
  // en granulés, forme solide la plus courante pour un ajout direct (le
  // peroxyde d'hydrogène liquide se dose en volume, pas en masse, et
  // suit un ratio différent). Dose calibrée sur plusieurs sources
  // convergentes (traitement choc usuel : 15 à 20 g/m³ pour remonter
  // vers le haut de la plage cible 5-10 mg/L) → 200 g / 10 m³ / 10 mg/L,
  // soit 20 g/m³ pour 10 mg/L. Cohérent avec le format des autres
  // produits (cf. tac-plus, calcium-plus).
  {
    id: "o2-mps",
    name: "Oxygène actif (monopersulfate de potassium, granulés)",
    nameKey: "reco_fallback_o2",
    action: "o2",
    doseAmount: 200,
    doseUnit: "g",
    effectAmount: 10,
    effectPer: 10,
    waitHours: 4,
    noteKey: "reco_note_o2",
    note: "Ne pas mélanger avec le chlore. Filtration en marche pendant 4h.",
    containerAmount: 1,
    containerUnit: "kg",
    stockPercent: 100,
    isDefault: true,
  },
  // v1.75.0 — Backlog : dosage liquide pour l'oxygène actif. Le peroxyde
  // d'hydrogène liquide se dose en volume, avec un ratio différent du
  // granulé MPS ci-dessus. Dose calibrée sur plusieurs sources convergentes
  // (entretien hebdomadaire usuel : 6 à 8 cL/m³ pour un plafond cible de
  // 10 mg/L, produit générique ~30% — cf. Swimmy, leprodestravaux.fr, Delta
  // Industrie) → 70 mL/10 m³/10 mg/L, milieu de la fourchette. Bidon
  // courant 5 L.
  {
    id: "o2-liquide",
    name: "Oxygène actif liquide (peroxyde d'hydrogène)",
    nameKey: "prod_name_o2_liquide",
    action: "o2",
    doseAmount: 70,
    doseUnit: "mL",
    effectAmount: 10,
    effectPer: 10,
    waitHours: 4,
    noteKey: "note_o2_liquide",
    note: "Ne pas mélanger avec le chlore. Verser devant les buses de refoulement, filtration en marche.",
    containerAmount: 5,
    containerUnit: "L",
    stockPercent: 100,
    isDefault: true,
  },
  {
    id: "tac-plus",
    name: "Produit TAC+ (bicarbonate de sodium)",
    nameKey: "prod_name_tac_plus",
    action: "tac+",
    doseAmount: 200,
    doseUnit: "g",
    effectAmount: 10,
    effectPer: 10,
    waitHours: 6,
    noteKey: "note_tac_plus",
    note: "Ajouter progressivement, filtration en marche. Attendre 6h avant autre traitement.",
    containerAmount: 5,
    containerUnit: "kg",
    stockPercent: 100,
    isDefault: true,
  },
  // v1.56.0 — Produit standard manquant pour l'action "tac-" : sans lui,
  // findProduct("tac-") renvoyait null (aucune dose calculable, aucun
  // produit cohérent proposé dans le wizard). Même acide que ph- (bisulfate
  // de sodium), mais fiche et dosage séparés car son effet sur le TAC se
  // calibre différemment de son effet sur le pH (cf. reco_note_tac_minus).
  {
    id: "tac-minus",
    name: "Produit TAC- (acide chlorhydrique ou bisulfate de sodium)",
    nameKey: "reco_fallback_tac_minus",
    action: "tac-",
    doseAmount: 200,
    doseUnit: "g",
    effectAmount: 10,
    effectPer: 10,
    waitHours: 6,
    noteKey: "reco_note_tac_minus",
    note: "Même acide que le pH-, mais effet à calibrer séparément sur le TAC. Corriger avant le pH, par petites doses.",
    containerAmount: 5,
    containerUnit: "kg",
    stockPercent: 100,
    isDefault: true,
  },
  {
    id: "calcium-plus",
    name: "Chlorure de calcium (dureté +)",
    nameKey: "prod_name_calcium",
    action: "hard+",
    doseAmount: 160,
    doseUnit: "g",
    effectAmount: 10,
    effectPer: 10,
    waitHours: 4,
    noteKey: "note_calcium",
    note: "Diluer avant ajout. Ne pas mélanger avec d'autres produits. Filtration en marche.",
    containerAmount: 5,
    containerUnit: "kg",
    stockPercent: 100,
    isDefault: true,
  },
  {
    id: "anti-phosphates",
    name: "Anti-phosphates (PHOSfree type)",
    nameKey: "prod_name_anti_phos",
    action: "phos-",
    doseAmount: 50,
    doseUnit: "mL",
    effectAmount: 100,
    effectPer: 10,
    waitHours: 24,
    noteKey: "note_anti_phos",
    note: "Verser directement devant la buse de refoulement, filtration en marche 24h.",
    containerAmount: 1,
    containerUnit: "L",
    stockPercent: 100,
    isDefault: true,
  },
  {
    id: "sequestrant",
    name: "Séquestrant métaux (Metal Free type)",
    nameKey: "prod_name_sequestrant",
    action: "sequestrant",
    doseAmount: 100,
    doseUnit: "mL",
    effectAmount: 1,
    effectPer: 10,
    waitHours: 12,
    noteKey: "note_sequestrant",
    note: "Traitement préventif cuivre/fer. Verser en périphérie du bassin, filtration en marche.",
    containerAmount: 1,
    containerUnit: "L",
    stockPercent: 100,
    isDefault: true,
  },
  {
    id: "floculant",
    name: "Floculant clarifiant liquide (type Reva-Flock)",
    nameKey: "prod_name_floculant",
    action: "floculant",
    doseAmount: 150,
    doseUnit: "mL",
    effectAmount: 0,
    effectPer: 10,
    waitHours: 24,
    noteKey: "note_floculant",
    note: "Traitement ponctuel eau trouble, pas de suivi automatique par l'appli. Verser devant les buses de refoulement, filtration en marche, puis arrêter 24h pour décantation.",
    containerAmount: 1,
    containerUnit: "L",
    stockPercent: 100,
    isDefault: true,
  },
  {
    id: "sel-piscine",
    name: "Sel de piscine (NaCl pur ≥ 99%, sac 25 kg)",
    nameKey: "prod_name_sel",
    action: "sel",
    doseAmount: 25,
    doseUnit: "kg",
    effectAmount: 0,
    effectPer: 0,
    waitHours: 24,
    noteKey: "reco_note_sel",
    note: "Utiliser du sel spécial piscine (NaCl pur ≥ 99%). Dissoudre avant l'ajout ou verser directement près du skimmer, filtration en marche 24h.",
    containerAmount: 25,
    containerUnit: "kg",
    stockPercent: 100,
    isDefault: true,
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
    { value: "tac-",             label: dict.action_tac_minus || "Baisse le TAC" },
    { value: "brome",            label: dict.action_brome || "Brome" },
    { value: "o2",               label: dict.action_o2 || "Oxygène actif" },
    { value: "sel",              label: dict.action_sel || "Sel (salinité)" },
    { value: "hard+",            label: dict.action_hard_plus || "Monte la dureté (TH)" },
    { value: "phos-",            label: dict.action_phos_minus || "Réduit les phosphates" },
    { value: "sequestrant",      label: dict.action_sequestrant || "Séquestrant métaux (cuivre/fer)" },
    // v1.50.0 — Traitement ponctuel sans paramètre mesuré associé (eau
    // trouble) : jamais proposé automatiquement par computeRecommendations,
    // ajout manuel uniquement au stock/plan.
    { value: "floculant",        label: dict.action_floculant || "Floculant / clarifiant" },
    // Lot B (v1.32.0) — catégorie sans dose ni type de traitement : ne sert
    // jamais de candidat dans findProduct() (qui filtre par action de
    // traitement réelle), donc aucun risque qu'un outil de mesure soit
    // proposé comme produit à appliquer.
    { value: "outil-mesure",     label: dict.action_outil_mesure || "Outil de mesure (bandelettes, etc.)" },
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
  "tac-": 6,
  "brome": 6,
  "o2": 4,
  "sel": 24,
  "hard+": 4,
  "phos-": 24,
  "sequestrant": 12,
  "floculant": 24,
  "sel": 24,
};

// v1.50.0 — Actions dont la dose ne varie pas en fonction d'un écart mesuré
// (contrairement à ph-, chlore, tac+... qui utilisent effectAmount/effectPer
// dans une règle de trois). Le formulaire produit masque le champ "Effet"
// pour ces actions : la dose est soit une recommandation fixe du fabricant
// par volume (séquestrant, floculant), soit calculée par un ratio physique
// indépendant du produit (sel — voir PHYSICS_DOSE_ACTIONS ci-dessous).
const FIXED_DOSE_ACTIONS = new Set(["sequestrant", "floculant"]);

// v1.50.0 — Actions où même la dose du produit ne sert pas au calcul : le
// sel se calcule uniquement via un ratio physique fixe (1 kg/m³ = +1000
// mg/L, voir computeRecommendations). Le formulaire masque Quantité, Effet
// et Pour X m³ ; seuls le nom et le suivi de stock (taille de contenant)
// restent pertinents.
const PHYSICS_DOSE_ACTIONS = new Set(["sel"]);

// Ordre de base (utilisé quand aucune règle contextuelle ne s'applique)
const ACTION_PRIORITY = {
  "tac+": 1,
  "tac-": 1,
  "hard+": 1,
  "ph-": 2,
  "ph+": 2,
  "chlore": 3,
  "chlore-stabilise": 4,
  "brome": 3,
  "o2": 3,
  "phos-": 4,
  "sequestrant": 5,
  "sel": 5,
};

// Ajuste l'ordre selon le contexte réel de l'eau. Deux interactions chimiques
// changent l'ordre optimal par rapport à l'ordre fixe ci-dessus :
// 1. Le bicarbonate de sodium (TAC+) remonte légèrement le pH. Si on doit BAISSER
//    le pH (ph-) et que le TAC n'est pas critique (>= 60 mg/L, encore un minimum de
//    pouvoir tampon), corriger le pH avant le TAC évite de devoir en remettre une
//    couche. Si le TAC est critique (< 60), le pH restera instable de toute façon
//    tant qu'il n'est pas corrigé — donc TAC d'abord malgré la légère remontée.
// 2. Un chlore combiné élevé (> 0.5 mg/L, signe de chloramines/contamination) est
//    traité comme une urgence sanitaire : mieux vaut désinfecter tout de suite
//    (même à un pH pas encore optimal) que d'attendre la fin de la séquence TAC/pH.
function computeStepPriority(step, ctx) {
  const base = ACTION_PRIORITY[step.action] ?? 9;
  const { tac, phVal, phTargetMax, combined, metalsUrgent } = ctx || {};
  const tacCritical = tac != null && !Number.isNaN(tac) && tac < 60;
  const needsPhMinus = phVal != null && phTargetMax != null && phVal > phTargetMax;
  const contaminationUrgent = combined != null && combined > 0.5;

  // v1.44.0 — Métaux dissous (fer/cuivre) avant tout oxydant : le chlore/brome/O2
  // en présence de métaux dissous forme un précipité (taches parois/liner). Le
  // séquestrant doit toujours passer en premier, même avant une contamination
  // urgente (priorité 0 ci-dessous) — d'où -1, strictement avant tout le reste.
  if (metalsUrgent && step.action === "sequestrant") {
    return -1;
  }
  if (contaminationUrgent && (step.action === "chlore" || step.action === "brome" || step.action === "o2")) {
    return 0;
  }
  if (needsPhMinus && !tacCritical) {
    if (step.action === "ph-") return 1;
    if (step.action === "tac+") return 2;
  }
  return base;
}

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
  aiEnabled: "pool:aiEnabled",
  activePlan: "pool:activePlan",
  gdprConsent: "pool:gdprConsent",
  dataConsent: "pool:dataConsent",
  cguVersion: "pool:cguVersion",
  cguAcceptedDate: "pool:cguAcceptedDate",
  lastUid: "pool:lastUid",
  viewContext: "pool:viewContext",
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

// Parse une date retournée par l'IA (extraction depuis document importé).
// Si pas d'indicateur de fuseau (ni Z ni +HH:MM), on l'interprète comme heure locale
// pour éviter le décalage UTC → local. Retourne null si rawDate est vide/invalide.
function parseFlexibleDate(rawDate) {
  if (!rawDate) return null;
  const raw = String(rawDate).trim();
  if (!raw) return null;
  const hasTimezone = /Z$|[+-]\d{2}:\d{2}$/.test(raw);
  try {
    if (!hasTimezone) {
      const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/);
      if (match) {
        const [, y, mo, d, h, mi, s] = match;
        return new Date(+y, +mo - 1, +d, +h, +mi, +(s || 0)).toISOString();
      }
      return new Date(raw).toISOString();
    }
    return new Date(raw).toISOString();
  } catch (e) {
    return null;
  }
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
  return "#6a7d90"; // v1.71.0 — statut inconnu : couleur neutre fixe, jamais thémée
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

// Redimensionne et recompresse une photo (dataURL) pour rester léger en stockage
// Firestore (documents limités à 1 Mo) tout en gardant assez de résolution pour
// la lecture (étiquette produit, bandelette...) et l'analyse IA.
// v1.35.0 — Lot B (calibration) : normalise le nom d'un produit "outil-mesure"
// pour en faire une clé de regroupement stable dans calibrationPoints.
// Minuscules, accents retirés, espaces multiples/en bord de chaîne réduits —
// évite que "Mareva 6 en 1" et "mareva  6-en-1 " comptent comme deux modèles
// différents. Pas de liste fermée : la clé est directement dérivée du nom
// saisi par l'utilisateur dans son stock (cf. discussion Lot B point 2).
function normalizeStripModel(name) {
  return (name || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // accents
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function compressImageDataUrl(dataUrl, maxDim = 1280, quality = 0.72) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      try {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      } catch (e) {
        resolve(dataUrl); // fallback : on garde l'original si le canvas échoue
      }
    };
    img.onerror = () => resolve(dataUrl); // fallback silencieux
    img.src = dataUrl;
  });
}

// Convertit un dataURL "data:image/jpeg;base64,XXXX" en {mediaType, data}
function parseDataUrl(dataUrl) {
  const match = /^data:(image\/[a-zA-Z]+);base64,(.*)$/.exec(dataUrl);
  if (!match) return null;
  return { mediaType: match[1], data: match[2] };
}

// v1.36.0 — Lot B (calibration) : échantillonne la couleur moyenne d'un petit
// carré de pixels autour d'un point donné en coordonnées fractionnaires
// (0 à 1, origine en haut à gauche), sur l'image chargée depuis dataUrl.
// Moyenner sur un carré (plutôt qu'un seul pixel) réduit le bruit JPEG et les
// petites erreurs de localisation de l'IA. boxSize = côté du carré en pixels,
// mesuré sur l'image réelle (pas redimensionnée).
function sampleColorAt(dataUrl, xNorm, yNorm, boxSize = 8) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const cx = Math.round(xNorm * img.naturalWidth);
        const cy = Math.round(yNorm * img.naturalHeight);
        const half = Math.round(boxSize / 2);
        const sx = Math.max(0, cx - half);
        const sy = Math.max(0, cy - half);
        const w = Math.min(boxSize, img.naturalWidth - sx);
        const h = Math.min(boxSize, img.naturalHeight - sy);
        if (w <= 0 || h <= 0) { reject(new Error("Coordonnées hors image")); return; }
        const { data } = ctx.getImageData(sx, sy, w, h);
        let r = 0, g = 0, b = 0, n = 0;
        for (let i = 0; i < data.length; i += 4) {
          r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
        }
        resolve({ r: Math.round(r / n), g: Math.round(g / n), b: Math.round(b / n) });
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error("Image illisible"));
    img.src = dataUrl;
  });
}

// v1.37.0 — Lot B (qualité calibration) : comme sampleColorAt, mais calcule en
// plus des métriques de qualité (netteté, exposition) sur une fenêtre plus
// large que la fenêtre de couleur. Une seule image chargée pour les deux
// calculs. La fenêtre de qualité doit être plus grande que celle de couleur
// (8px) car la variance de Laplace a besoin de plus de pixels pour être
// stable — sinon les effets de bord du noyau dominent le résultat.
// Calculée sur l'image déjà compressée (celle envoyée à l'IA), pas la photo
// d'origine : c'est la qualité de la donnée réellement utilisée pour la
// mesure de couleur qui compte, pas la netteté théorique du capteur photo.
function sampleColorAndQuality(dataUrl, xNorm, yNorm, colorBoxSize = 8, qualityBoxSize = 24) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const cx = Math.round(xNorm * img.naturalWidth);
        const cy = Math.round(yNorm * img.naturalHeight);

        // Couleur moyenne — identique à sampleColorAt
        const colorHalf = Math.round(colorBoxSize / 2);
        const csx = Math.max(0, cx - colorHalf);
        const csy = Math.max(0, cy - colorHalf);
        const cw = Math.min(colorBoxSize, img.naturalWidth - csx);
        const ch = Math.min(colorBoxSize, img.naturalHeight - csy);
        if (cw <= 0 || ch <= 0) { reject(new Error("Coordonnées hors image")); return; }
        const colorData = ctx.getImageData(csx, csy, cw, ch).data;
        let r = 0, g = 0, b = 0, n = 0;
        for (let i = 0; i < colorData.length; i += 4) {
          r += colorData[i]; g += colorData[i + 1]; b += colorData[i + 2]; n++;
        }
        const color = { r: Math.round(r / n), g: Math.round(g / n), b: Math.round(b / n) };

        // Qualité — fenêtre plus large, niveaux de gris (luminance pondérée)
        const qHalf = Math.round(qualityBoxSize / 2);
        const qsx = Math.max(0, cx - qHalf);
        const qsy = Math.max(0, cy - qHalf);
        const qw = Math.min(qualityBoxSize, img.naturalWidth - qsx);
        const qh = Math.min(qualityBoxSize, img.naturalHeight - qsy);
        let sharpness = null, exposure = null, exposureClipped = null;
        if (qw >= 3 && qh >= 3) {
          const qData = ctx.getImageData(qsx, qsy, qw, qh).data;
          const gray = new Float32Array(qw * qh);
          let sum = 0, clipped = 0;
          for (let i = 0, p = 0; i < qData.length; i += 4, p++) {
            const lum = 0.299 * qData[i] + 0.587 * qData[i + 1] + 0.114 * qData[i + 2];
            gray[p] = lum;
            sum += lum;
            if (lum <= 5 || lum >= 250) clipped++;
          }
          exposure = Math.round(sum / gray.length);
          exposureClipped = (clipped / gray.length) > 0.05;

          // Variance de Laplace (noyau [[0,1,0],[1,-4,1],[0,1,0]], bords ignorés)
          let lapSum = 0, lapSumSq = 0, lapN = 0;
          for (let y = 1; y < qh - 1; y++) {
            for (let x = 1; x < qw - 1; x++) {
              const idx = y * qw + x;
              const lap = gray[idx - qw] + gray[idx + qw] + gray[idx - 1] + gray[idx + 1] - 4 * gray[idx];
              lapSum += lap;
              lapSumSq += lap * lap;
              lapN++;
            }
          }
          if (lapN > 0) {
            const lapMean = lapSum / lapN;
            sharpness = Math.round((lapSumSq / lapN - lapMean * lapMean) * 100) / 100;
          }
        }

        resolve({ color, sharpness, exposure, exposureClipped });
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error("Image illisible"));
    img.src = dataUrl;
  });
}

// ---------- Helpers géocodage (Nominatim / OpenStreetMap) ----------
// Formate une adresse Nominatim en "Ville (dép)" pour la France, "Ville, Pays" à l'international
function formatNominatimAddress(addr) {
  if (!addr) return null;
  const city = addr.city || addr.town || addr.village || addr.municipality || addr.hamlet;
  if (!city) return null;
  const country = addr.country || "";
  const countryCode = (addr.country_code || "").toLowerCase();
  if (countryCode === "fr") {
    let dept = null;
    const iso6 = addr["ISO3166-2-lvl6"];
    if (iso6 && iso6.includes("-")) dept = iso6.split("-")[1];
    if (!dept && addr.postcode) dept = addr.postcode.slice(0, 2);
    return dept ? `${city} (${dept})` : city;
  }
  return country ? `${city}, ${country}` : city;
}

// Recherche de villes via Nominatim. Retourne une liste de { label, lat, lon }
async function nominatimSearch(query, lang) {
  if (!query || query.trim().length < 3) return [];
  const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&accept-language=${encodeURIComponent(lang || "fr")}&featureType=city&q=${encodeURIComponent(query.trim())}`;
  const res = await fetch(url, { headers: { "Accept": "application/json" } });
  if (!res.ok) throw new Error("nominatim_search_failed");
  const data = await res.json();
  const seen = new Set();
  const out = [];
  for (const item of data) {
    const label = formatNominatimAddress(item.address);
    if (!label || seen.has(label)) continue;
    seen.add(label);
    out.push({ label, lat: item.lat, lon: item.lon });
  }
  return out;
}

// Reverse geocoding (coordonnées GPS -> "Ville (dép)" / "Ville, Pays")
async function nominatimReverse(lat, lon, lang) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&accept-language=${encodeURIComponent(lang || "fr")}&lat=${lat}&lon=${lon}`;
  const res = await fetch(url, { headers: { "Accept": "application/json" } });
  if (!res.ok) throw new Error("nominatim_reverse_failed");
  const data = await res.json();
  return formatNominatimAddress(data.address);
}

// ---------- Helpers IA (Anthropic + OpenAI) ----------

async function getFirebaseAuthHeader() {
  try {
    const user = window._fbAuth?.currentUser;
    if (!user) return {};
    const token = await user.getIdToken();
    return { "Authorization": `Bearer ${token}` };
  } catch (e) {
    return {};
  }
}

// v1.53.0 — Simplifié : un seul fournisseur (Anthropic), un seul chemin (le
// proxy Cloudflare fourni par l'app dans le cadre de l'abonnement). Plus de
// choix utilisateur, plus de clé personnelle, plus de branche OpenAI — voir
// nettoyage Réglages/CGU du 260706. Le paramètre "apiProvider" reste accepté
// pour compatibilité de signature mais n'est plus utilisé : le fournisseur
// pourra changer côté app plus tard, mais uniquement en éditant ce fichier,
// jamais via un choix utilisateur.
async function callAIWithImage({ apiKey, prompt, imageDataUrl, uid: callerUid, maxTokens = 1000, enableWebSearch = false }) {
  // v1.49.0 — imageDataUrl accepte soit une seule dataUrl (string,
  // rétrocompatible), soit un tableau de dataUrls (plusieurs photos du même
  // produit : face, code-barre, notice). Toutes les images sont envoyées
  // dans le même message pour que Claude puisse croiser les infos entre elles.
  const dataUrls = Array.isArray(imageDataUrl) ? imageDataUrl : [imageDataUrl];
  const parsedImages = dataUrls.map((u) => parseDataUrl(u)).filter(Boolean);
  if (parsedImages.length === 0) throw new Error("Image invalide");

  const endpoint = apiKey.replace(/\/+$/, "") + "/v1/messages";
  const authHeaders = await getFirebaseAuthHeader();
  const uidHeaders = callerUid ? { "x-uid": callerUid } : {};

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
      ...authHeaders,
      ...uidHeaders,
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens,
      messages: [
        {
          role: "user",
          content: [
            ...parsedImages.map((parsed) => ({ type: "image", source: { type: "base64", media_type: parsed.mediaType, data: parsed.data } })),
            { type: "text", text: prompt },
          ],
        },
      ],
      // v1.47.0 — Recherche web côté serveur (Anthropic), utilisée
      // uniquement pour l'analyse produit (voir analyzeProductPhoto). Claude
      // décide lui-même s'il cherche ; la réponse finale arrive dans le même
      // appel, pas d'aller-retour à gérer ici. Le Worker étant un pur
      // relais, ce paramètre est transmis tel quel sans modification côté
      // poolgenai-proxy.js.
      ...(enableWebSearch ? { tools: [{ type: "web_search_20250305", name: "web_search" }] } : {}),
    }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || err?.error || `Erreur Anthropic ${response.status}`);
  }
  const data = await response.json();
  // v1.47.0 — Avec la recherche web activée, la réponse peut contenir
  // plusieurs blocs (server_tool_use, web_search_tool_result, text...). Le
  // dernier bloc "text" est la réponse finale de Claude après recherche,
  // contrairement au premier qui pourrait être un commentaire intermédiaire.
  const textBlocks = (data.content || []).filter((b) => b.type === "text");
  return textBlocks.length > 0 ? textBlocks[textBlocks.length - 1].text : "";
}

async function callAIText({ apiKey, prompt, uid: callerUid }) {
  const endpoint = apiKey.replace(/\/+$/, "").replace(/\/v1\/messages$/, "") + "/v1/messages";
  const authHeaders = await getFirebaseAuthHeader();
  const uidHeaders = callerUid ? { "x-uid": callerUid } : {};

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
      ...authHeaders,
      ...uidHeaders,
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || err?.error || `Erreur Anthropic ${response.status}`);
  }
  const data = await response.json();
  return (data.content || []).find((b) => b.type === "text")?.text || "";
}

async function analyzeStripPhoto({ apiKey, apiProvider, dataUrl, uid: callerUid }) {
  const prompt = `Tu es un expert en chimie de l'eau de piscine. Analyse cette photo qui montre soit :

CAS 1 — PHOTOMÈTRE NUMÉRIQUE (WaterLink SpinTouch, PoolLab, LaMotte, Hanna, etc.)
Lis directement les valeurs numériques affichées à l'écran.

CAS 2 — BANDELETTE DE TEST
La bandelette a été trempée dans l'eau et présente des tampons colorés.
Méthode de lecture :
1. Le tube de bandelettes affiche une échelle de couleurs de référence pour chaque paramètre, avec les valeurs numériques associées à chaque couleur.
2. Compare la couleur de chaque tampon de la bandelette avec l'échelle de référence visible sur le tube.
3. Retourne la valeur numérique correspondant à la couleur la plus proche sur l'échelle.
4. Si le tube de référence n'est pas visible sur la photo, indique confidence: "basse" et essaie quand même d'estimer.

Correspondances des abréviations courantes :
- FCL / Free Cl / Cl libre → fCl (chlore libre)
- TCL / Total Cl / Cl total → tCl (chlore total)
- CCL / Combined Cl / Chloramines → ccl (chlore combiné)
- pH → pH
- ALK / TAC / Alkalinity → tac (alcalinité totale)
- CYA / Stabilizer / Cyanuric → cya (stabilisant)
- HARD / TH / Hardness / Calcium → hard (dureté)
- PHOS / Phosphates → phos (phosphates, en µg/L)
- COPPER / Cu → copper (cuivre)
- IRON / Fe → iron (fer)
- TEMP / Temperature → temp (température en °C)
- BROME / Br → brome
- O2 / Active O2 → o2

Réponds UNIQUEMENT en JSON valide, sans texte avant ou après, sans markdown, sans commentaires :
{"device": "photometre" ou "bandelette", "pH": nombre ou null, "fCl": nombre ou null, "tCl": nombre ou null, "ccl": nombre ou null, "tac": nombre ou null, "cya": nombre ou null, "hard": nombre ou null, "phos": nombre ou null, "copper": nombre ou null, "iron": nombre ou null, "temp": nombre ou null, "brome": nombre ou null, "o2": nombre ou null, "sel": nombre ou null, "confidence": "haute" ou "moyenne" ou "basse", "reliability": entier de 1 à 5 (1=très peu fiable, 5=très fiable), "reliability_by_param": {"pH": entier 1-5, "fCl": entier 1-5, ...} (une entrée par paramètre non-null uniquement, note la lisibilité de CE tampon précis — un reflet ou un angle défavorable sur un seul tampon doit baisser SA note sans affecter les autres), "sample_points": {"pH": {"pad": [x, y], "reference": [x, y], "padSizeFraction": nombre}, ...} (UNIQUEMENT si device est "bandelette" ; pour chaque paramètre où tu es CONFIANT d'avoir localisé précisément à la fois le tampon coloré ET la case de référence correspondante sur l'échelle imprimée du tube, donne leurs coordonnées en fraction de l'image, x et y entre 0 et 1, origine en haut à gauche ; omets complètement l'entrée pour un paramètre si tu n'es pas confiant sur la localisation exacte — ne devine jamais des coordonnées approximatives ; "padSizeFraction" est une estimation approximative de la largeur du tampon coloré exprimée en fraction de la largeur totale de l'image, 0 à 1, sert uniquement d'indicateur de qualité donc une estimation grossière suffit, contrairement à pad/reference qui doivent être précis — omets ce champ si tu ne peux pas l'estimer visuellement), "reliability_reason": "une phrase en français expliquant la note de fiabilité (qualité image, lisibilité échelle, etc.)", "note": "une phrase en français sur la lisibilité et la méthode utilisée"}

Règles strictes :
- "device" indique lequel des deux CAS ci-dessus correspond à la photo analysée — jamais null, choisis le plus probable même en cas de doute
- Pour un PHOTOMÈTRE : retourne les valeurs numériques exactes affichées à l'écran
- Pour une BANDELETTE : retourne une ESTIMATION de la valeur basée sur la comparaison des couleurs avec l'échelle du tube — une valeur approchée est préférable à null
- "reliability_by_param" : évalue CHAQUE tampon indépendamment (reflet, angle de vue, netteté de la zone précise), ne recopie pas la même note partout par défaut
- "sample_points" : uniquement des coordonnées précises et vérifiées, jamais d'estimation grossière — mieux vaut omettre un paramètre que donner des coordonnées fausses
- "padSizeFraction" : seule exception à la règle ci-dessus — une estimation approximative est acceptée, contrairement aux coordonnées pad/reference
- Les valeurs doivent être des nombres (pas des chaînes)
- null uniquement si le paramètre est vraiment impossible à lire ou absent de la bandelette
- JSON pur, rien d'autre`;

  const text = await callAIWithImage({ apiKey, apiProvider, prompt, imageDataUrl: dataUrl, uid: callerUid, maxTokens: 1500 });
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Réponse IA non parseable : " + text.slice(0, 200));
  return JSON.parse(match[0]);
}

async function analyzeProductPhoto({ apiKey, apiProvider, dataUrls, uid: callerUid }) {
  const photos = Array.isArray(dataUrls) ? dataUrls : [dataUrls];
  const multiPhotoNote = photos.length > 1
    ? `Tu reçois ${photos.length} photos du MÊME produit, prises séparément (face, code-barre, notice de dosage selon ce qui était visible). Croise les informations entre toutes les photos : le nom peut venir de la photo de face, le code-barre de sa photo dédiée, la dose/effet de la notice. `
    : "";
  const prompt = `Tu es un expert en chimie de l'eau de piscine. ${multiPhotoNote}Analyse ${photos.length > 1 ? "ces photos" : "cette photo"} d'étiquette ou d'emballage d'un produit de traitement piscine (chlore, pH, sel, algicide, floculant, etc.).

Procède en deux temps :

1. Identifie : le nom commercial exact du produit, la marque, la substance active principale (nom chimique, ex: "hypochlorite de calcium", "acide sulfamique"), et si visible un code-barre (numéro EAN/UPC imprimé sous les barres, PAS le motif de barres lui-même que tu ne peux pas décoder — uniquement le numéro).

2. Cherche sur le web la fiche technique ou la notice officielle de ce produit précis (site du fabricant ou d'un revendeur reconnu), pour trouver la dose de traitement recommandée. Les valeurs trouvées par cette recherche priment sur celles lues sur l'étiquette si les deux sont disponibles — une notice officielle en ligne est plus fiable qu'une lecture visuelle d'étiquette (reflets, angle, texte petit). Si la recherche ne trouve rien d'exploitable pour ce produit précis, utilise uniquement ce qui est lisible sur la photo. Si tu trouves une photo officielle du produit sur le site du fabricant ou d'un revendeur pendant cette recherche, note son URL directe (lien qui pointe vers le fichier image lui-même, pas une page HTML).

Informations à renseigner, dans les deux cas :
- Son action principale (une seule valeur parmi : "ph-", "ph+", "chlore", "chlore-stabilise", "tac+", "tac-", "brome", "o2", "sel", "hard+", "phos-", "sequestrant")
  - "chlore" = chlore choc/non stabilisé, "chlore-stabilise" = galets/pastilles au chlore stabilisé (contient de l'acide cyanurique/CYA)
  - "tac-" = acide utilisé pour baisser l'alcalinité (acide chlorhydrique, bisulfate de sodium) — à distinguer de "ph-" même si c'est parfois le même produit physique : choisis "tac-" seulement si l'étiquette ou la notice présente explicitement ce produit comme correcteur de TAC/alcalinité
- La dose conseillée et son unité (g, kg, ml ou L) — dose de TRAITEMENT, pas la taille du contenant
- L'effet annoncé sur le paramètre concerné pour un volume d'eau donné (ex : "20g augmente le pH de 0,1 pour 10m³")
- Le délai d'attente avant baignade recommandé en heures
- La taille TOTALE du contenant/emballage tel que vendu (ex : "5 kg", "25 kg", "1 L", "20 L")
- Le conditionnement du produit : "galets" si le produit se présente sous forme d'unités solides discrètes (galets, pastilles, sticks, comprimés), "vrac" sinon (poudre, granulés en vrac, liquide)
- Si conditionnement "galets" : le poids d'une seule unité en grammes (ex: "galets de 250g" → 250). Cherche cette info sur l'étiquette (souvent indiquée à côté du nombre d'unités ou du poids total divisé par le nombre d'unités), puis sur le web si absente de l'étiquette (même recherche que pour la dose de traitement)
- Si conditionnement "galets" : le ratio d'entretien continu annoncé par le fabricant, tel qu'affiché sur l'emballage ou trouvé sur le web (ex : "1 galet / 30 m³ / 7-10 jours") — nombre d'unités, volume en m³, et nombre de jours entre deux ajouts. Ce ratio est différent de la dose de traitement correctif : ne pas le confondre ni le déduire, uniquement le rapporter s'il est explicitement indiqué

Réponds UNIQUEMENT en JSON valide, sans texte avant ou après, sans markdown :
{"name": "nom du produit ou null", "barcode": "numéro EAN/UPC en chaîne de caractères ou null", "activeSubstance": "nom chimique ou null", "action": "une des valeurs listées ci-dessus ou null", "doseAmount": nombre ou null, "doseUnit": "g" ou "kg" ou "ml" ou "L" ou null, "effectAmount": nombre ou null, "effectPer": nombre de m³ ou null, "waitHours": nombre ou null, "containerAmount": nombre ou null, "containerUnit": "g" ou "kg" ou "ml" ou "L" ou null, "packagingType": "galets" ou "vrac" ou null, "unitWeight": nombre en grammes ou null, "maintenanceUnits": nombre ou null, "maintenanceVolumePer": nombre de m³ ou null, "maintenanceDays": nombre ou null, "productImageUrl": "URL directe de la photo officielle trouvée en ligne, ou null si aucune", "source": "web" ou "etiquette", "confidence": "haute" ou "moyenne" ou "basse", "note": "une phrase en français sur ce qui a été trouvé, en précisant si ça vient de la recherche web ou de la lecture d'étiquette"}

Règles strictes :
- null pour toute information absente ou illisible, ne devine jamais une valeur non présente
- "barcode" doit être le numéro exact lu sous le code-barre, jamais reconstruit ou deviné — null si le numéro n'est pas net
- "productImageUrl" : uniquement une URL trouvée réellement pendant la recherche web, jamais une URL inventée ou reconstruite — null si aucune trouvée
- "source" doit refléter honnêtement d'où viennent les valeurs de dose/effet renvoyées : "web" seulement si la recherche a effectivement trouvé une notice exploitable pour ce produit précis, "etiquette" sinon
- "maintenanceUnits"/"maintenanceVolumePer"/"maintenanceDays" : uniquement si "packagingType" est "galets" ET que le ratio est explicitement affiché — null sinon, jamais déduit de la dose de traitement
- Les nombres sont des nombres, jamais des chaînes
- JSON pur, rien d'autre`;

  const text = await callAIWithImage({ apiKey, apiProvider, prompt, imageDataUrl: photos, uid: callerUid, maxTokens: 1500, enableWebSearch: apiProvider !== "openai" });
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Réponse IA non parseable : " + text.slice(0, 200));
  return JSON.parse(match[0]);
}

// ---------- Base commune de produits : appels au Worker ----------
// v1.48.0 — Trois routes ajoutées côté Worker (voir poolgenai-proxy.js) :
// lookup (par code-barre puis recherche floue), create (nouvelle fiche),
// use (incrément callCount + re-vérification web au multiple de 50).
// v1.79.0 — Séparation dev/test/prod : le Worker Cloudflare (proxy IA) est
// choisi selon le hostname, même logique que la config Firebase dans
// index.html.
// v1.88.0 — BUG : dev restait à null, donc TOUS les appels proxy (set-pseudo,
// analyse photo IA, invitations, vérification email, etc.) partaient vers le
// Worker PROD (fallback silencieux), qui rejetait les tokens émis par
// poolgenai-dev (FIREBASE_PROJECT_ID ne correspond pas). URL réelle branchée.
const PROXY_URLS = {
  prod: "https://poolgenai-proxy.support-poolgenai.workers.dev",
  test: "https://poolgenai-proxy-test.support-poolgenai.workers.dev",
  dev: "https://poolgenai-proxy-dev.support-poolgenai.workers.dev",
};
function detectPoolGenAIEnv() {
  if (typeof window !== "undefined" && window.__poolgenaiEnv) return window.__poolgenaiEnv;
  const h = typeof window !== "undefined" ? window.location.hostname : "";
  if (h === "app.poolgenai.com") return "prod";
  if (h === "test.poolgenai.com") return "test";
  return "dev";
}
const PROXY_BASE_URL = PROXY_URLS[detectPoolGenAIEnv()] || PROXY_URLS.prod;

async function lookupCommonProduct({ idToken, barcode, name, activeSubstance }) {
  const res = await fetch(`${PROXY_BASE_URL}/product-lookup`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ barcode, name, activeSubstance }),
  });
  if (!res.ok) throw new Error(`Échec du lookup base commune (${res.status})`);
  return res.json();
}

async function createCommonProduct({ idToken, payload }) {
  const res = await fetch(`${PROXY_BASE_URL}/product-create`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Échec de création base commune (${res.status})`);
  return res.json();
}

async function markCommonProductUsed({ idToken, productId }) {
  const res = await fetch(`${PROXY_BASE_URL}/product-use`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ productId }),
  });
  if (!res.ok) throw new Error(`Échec d'incrément base commune (${res.status})`);
  return res.json();
}

// v1.51.0 — Upload photo utilisateur vers R2 pour illustrer une fiche
// commonProducts. Le Worker déduplique côté serveur (ne remplace jamais un
// photoUrl déjà présent) : premier arrivé, premier servi. photoBase64 est le
// contenu base64 seul (sans le préfixe "data:image/jpeg;base64,").
async function uploadCommonProductPhoto({ idToken, productId, photoBase64 }) {
  const res = await fetch(`${PROXY_BASE_URL}/product-photo-upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ productId, photoBase64 }),
  });
  if (!res.ok) throw new Error(`Échec d'upload photo base commune (${res.status})`);
  return res.json();
}

async function confirmCommonProductMerge({ mergeId, token }) {
  const res = await fetch(`${PROXY_BASE_URL}/confirm-merge`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mergeId, token }),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ...data };
}

// v1.55.0 — Utilisateurs secondaires (brique 3)
async function getInvitationInfo(token) {
  const res = await fetch(`${PROXY_BASE_URL}/invitation-info?token=${encodeURIComponent(token)}`);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ...data };
}

async function respondToInvitation(idToken, token, action) {
  const res = await fetch(`${PROXY_BASE_URL}/respond-invitation`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ token, action }),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ...data };
}

// v1.60.0 — Demande de révocation initiée par l'invité, confirmée par le
// propriétaire (miroir de getInvitationInfo/respondToInvitation).
async function getRevocationRequestInfo(token) {
  const res = await fetch(`${PROXY_BASE_URL}/revocation-info?token=${encodeURIComponent(token)}`);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ...data };
}

async function respondToRevocation(idToken, token) {
  const res = await fetch(`${PROXY_BASE_URL}/respond-revocation`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ token }),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ...data };
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

// Comparaison de contenu (JSON) — utilisée pour éviter de remplacer un state
// par une donnée cloud identique (voir commentaire dans le useEffect de synchro
// Firestore plus bas, fix v1.27.2 de la boucle d'écritures ping-pong entre appareils).
// Fix v1.27.4 : tri des clés avant stringify, car deux objets au contenu identique
// mais à l'ordre de clés différent (ex: écho Firestore vs état local) étaient
// jugés à tort "différents", ce qui suffisait à relancer la boucle d'écriture.
function stableStringify(obj) {
  if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj)) return "[" + obj.map(stableStringify).join(",") + "]";
  const keys = Object.keys(obj).sort();
  return "{" + keys.map((k) => JSON.stringify(k) + ":" + stableStringify(obj[k])).join(",") + "}";
}
function deepEqual(a, b) {
  try {
    return stableStringify(a) === stableStringify(b);
  } catch (e) {
    return false;
  }
}

// v1.30.0 — Reconstitue le champ photo (inline, base64) sur chaque produit à
// partir de la map { productId: photo } issue de la collection Firestore
// users/{uid}/productPhotos. Ne touche pas aux produits dont l'id n'a pas
// d'entrée dans la map (photo pas encore migrée, ou produit sans photo) :
// dans ce cas le champ photo local (potentiellement encore inline dans
// config/main pour les anciens comptes) est conservé tel quel.
function mergeProductPhotos(products, photosMap) {
  if (!products || !products.length || !photosMap) return products;
  return products.map((p) =>
    Object.prototype.hasOwnProperty.call(photosMap, p.id) ? { ...p, photo: photosMap[p.id] } : p
  );
}

const FB = {
  ready: () => !!window._fbAuth,
  onAuth: (cb) => window._fbOnAuth ? window._fbOnAuth(window._fbAuth, cb) : (() => {}),
  signInGoogle: () => window._fbSignInWithPopup(window._fbAuth, window._fbGoogle),
  reauthGoogle: () => window._fbReauthGoogle ? window._fbReauthGoogle() : Promise.reject(new Error("not available")),
  reauthEmail: (password) => window._fbReauthEmail ? window._fbReauthEmail(password) : Promise.reject(new Error("not available")),
  signIn: (email, pwd) => window._fbSignIn(window._fbAuth, email, pwd),
  signUp: (email, pwd) => window._fbSignUp(window._fbAuth, email, pwd),
  resetPwd: (email) => window._fbResetPwd(window._fbAuth, email),
  sendVerification: async (user) => {
    if (!user) return;
    const idToken = await user.getIdToken();
    // v1.89.0 — Fix : cette route était codée en dur vers le Worker PROD,
    // donc jamais atteinte correctement depuis TEST/DEV (idToken rejeté par
    // vérification d'audience, aucun mail n'était jamais envoyé). Suit
    // maintenant l'environnement courant comme le reste des appels au proxy.
    const res = await fetch(`${PROXY_BASE_URL}/send-verification-email`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${idToken}` },
    });
    if (!res.ok) {
      let msg = `Erreur ${res.status}`;
      try {
        const data = await res.json();
        if (data?.error) msg = data.error;
      } catch (e) {}
      throw new Error(msg);
    }
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
  // ── Measures sync ──
  measuresCol: (uid) => window._fbCollection(window._fbDb, "users", uid, "measures"),
  // v1.39.0 — Fix : measure.photos/poolPhotos (jusqu'à 10 photos, 1280px/q0.72)
  // dépassaient la limite Firestore de 1 Mio par document une fois inclus dans
  // measures/{id} (write rejeté côté client avec status 400, avalé par le
  // .catch(() => {}) des appelants → mesure jamais visible en historique, sans
  // aucune erreur affichée). saveMeasure ne persiste plus que les champs
  // texte + des compteurs ; les photos vont dans la sous-collection dédiée
  // ci-dessous via saveMeasurePhotos, à appeler séparément par l'appelant.
  saveMeasure: async (uid, measure) => {
    if (!window._fbDb || !window._fbSetDoc) return;
    const { photo, photos, poolPhotos, ...lightMeasure } = measure;
    const photoCount = photos?.length || (photo ? 1 : 0);
    const poolPhotoCount = poolPhotos?.length || 0;
    const ref = window._fbDoc(window._fbDb, "users", uid, "measures", measure.id);
    await window._fbSetDoc(ref, { ...lightMeasure, photoCount, poolPhotoCount });
  },
  deleteMeasure: async (uid, measureId) => {
    if (!window._fbDb || !window._fbDeleteDoc) return;
    const ref = window._fbDoc(window._fbDb, "users", uid, "measures", measureId);
    await window._fbDeleteDoc(ref);
    await FB.deleteMeasurePhotos(uid, measureId);
  },
  getMeasures: async (uid) => {
    if (!window._fbDb || !window._fbGetDocs) return [];
    const col = window._fbCollection(window._fbDb, "users", uid, "measures");
    const snap = await window._fbGetDocs(col);
    return snap.docs.map(d => d.data());
  },
  // v1.57.8 — poolId optionnel : en contexte secondaire, la règle Firestore
  // (isActiveSecondaryForPool) ne peut valider un "list" que si la requête
  // est prouvablement restreinte au bon poolId — sinon Firestore refuse toute
  // la collection en bloc dès qu'un seul document historique appartient à un
  // autre bassin (permission-denied silencieux, aucun document livré).
  onMeasures: (uid, cb, poolId) => {
    if (!window._fbDb || !window._fbOnSnapshot) return () => {};
    const col = window._fbCollection(window._fbDb, "users", uid, "measures");
    const target = poolId ? window._fbQuery(col, window._fbWhere("poolId", "==", poolId)) : col;
    return window._fbOnSnapshot(target, (snap) => {
      cb(snap.docs.map(d => d.data()));
    });
  },
  // ── Photos de mesure sync (v1.39.0) — un document par photo, sous
  // users/{uid}/measures/{measureId}/photos/{photoId}. "p{i}" pour les photos
  // d'analyse (photomètre/bandelette), "pp{i}" pour les photos de bassin.
  // Chaque doc reste minuscule (une seule image), donc aucune limite de
  // nombre de photos par mesure ne pose de risque de dépassement 1 Mio.
  saveMeasurePhotos: async (uid, measureId, photos = [], poolPhotos = []) => {
    if (!window._fbDb || !window._fbSetDoc) return;
    const writes = [
      ...photos.map((dataUrl, i) =>
        window._fbSetDoc(window._fbDoc(window._fbDb, "users", uid, "measures", measureId, "photos", `p${i}`), { dataUrl, kind: "analysis", order: i })
      ),
      ...poolPhotos.map((dataUrl, i) =>
        window._fbSetDoc(window._fbDoc(window._fbDb, "users", uid, "measures", measureId, "photos", `pp${i}`), { dataUrl, kind: "pool", order: i })
      ),
    ];
    await Promise.all(writes);
  },
  deleteMeasurePhotos: async (uid, measureId) => {
    if (!window._fbDb || !window._fbGetDocs || !window._fbDeleteDoc) return;
    const col = window._fbCollection(window._fbDb, "users", uid, "measures", measureId, "photos");
    const snap = await window._fbGetDocs(col);
    await Promise.all(snap.docs.map((d) => window._fbDeleteDoc(d.ref)));
  },
  getMeasurePhotos: async (uid, measureId) => {
    if (!window._fbDb || !window._fbGetDocs) return { photos: [], poolPhotos: [] };
    const col = window._fbCollection(window._fbDb, "users", uid, "measures", measureId, "photos");
    const snap = await window._fbGetDocs(col);
    const photos = [], poolPhotos = [];
    snap.docs.forEach((d) => {
      const data = d.data();
      (data.kind === "pool" ? poolPhotos : photos).push({ order: data.order ?? 0, dataUrl: data.dataUrl });
    });
    photos.sort((a, b) => a.order - b.order);
    poolPhotos.sort((a, b) => a.order - b.order);
    return { photos: photos.map((p) => p.dataUrl), poolPhotos: poolPhotos.map((p) => p.dataUrl) };
  },
  // ── Applications sync ──
  saveApplication: async (uid, application) => {
    if (!window._fbDb || !window._fbSetDoc) return;
    const ref = window._fbDoc(window._fbDb, "users", uid, "applications", application.measureId);
    await window._fbSetDoc(ref, application);
  },
  deleteApplication: async (uid, measureId) => {
    if (!window._fbDb || !window._fbDeleteDoc) return;
    const ref = window._fbDoc(window._fbDb, "users", uid, "applications", measureId);
    await window._fbDeleteDoc(ref);
  },
  getApplications: async (uid) => {
    if (!window._fbDb || !window._fbGetDocs) return [];
    const col = window._fbCollection(window._fbDb, "users", uid, "applications");
    const snap = await window._fbGetDocs(col);
    return snap.docs.map(d => d.data());
  },
  onApplications: (uid, cb, poolId) => {
    if (!window._fbDb || !window._fbOnSnapshot) return () => {};
    const col = window._fbCollection(window._fbDb, "users", uid, "applications");
    const target = poolId ? window._fbQuery(col, window._fbWhere("poolId", "==", poolId)) : col;
    return window._fbOnSnapshot(target, (snap) => {
      cb(snap.docs.map(d => d.data()));
    });
  },
  // ── Diagnostics IA sync ──
  saveDiagnostic: async (uid, diagnostic) => {
    if (!window._fbDb || !window._fbSetDoc) return;
    const ref = window._fbDoc(window._fbDb, "users", uid, "diagnostics", diagnostic.id);
    await window._fbSetDoc(ref, diagnostic);
  },
  deleteDiagnostic: async (uid, diagnosticId) => {
    if (!window._fbDb || !window._fbDeleteDoc) return;
    const ref = window._fbDoc(window._fbDb, "users", uid, "diagnostics", diagnosticId);
    await window._fbDeleteDoc(ref);
  },
  onDiagnostics: (uid, cb) => {
    if (!window._fbDb || !window._fbOnSnapshot) return () => {};
    const col = window._fbCollection(window._fbDb, "users", uid, "diagnostics");
    return window._fbOnSnapshot(col, (snap) => {
      cb(snap.docs.map(d => d.data()));
    });
  },
  getDiagnostics: async (uid) => {
    if (!window._fbDb || !window._fbGetDocs) return [];
    const col = window._fbCollection(window._fbDb, "users", uid, "diagnostics");
    const snap = await window._fbGetDocs(col);
    return snap.docs.map(d => d.data());
  },
  // ── Statut de suspension (géré uniquement par l'admin, jamais écrit par le client) ──
  onSuspended: (uid, cb) => {
    if (!window._fbDb || !window._fbOnSnapshot) return () => {};
    const ref = window._fbDoc(window._fbDb, "suspended", uid);
    return window._fbOnSnapshot(ref, (snap) => {
      const data = snap.exists() ? snap.data() : null;
      cb(!!data?.suspended, data?.reason || "");
    }, () => cb(false, ""));
  },
  // ── Suppression de compte en libre-service (soft delete) ──
  // Contrairement à "suspended" (admin-only), ce doc EST écrit par le client
  // lui-même au moment où il clique sur "Supprimer mon compte". Le compte Auth
  // Firebase n'est pas supprimé : seul ce flag bloque l'accès applicatif. Les
  // données Firestore (measures, applications, config, diagnostics) ne sont pas
  // effacées — conservées jusqu'à purge manuelle (ex. suite à une demande RGPD).
  markAccountDeleted: async (uid) => {
    if (!window._fbDb || !window._fbSetDoc) return;
    const ref = window._fbDoc(window._fbDb, "accountDeletions", uid);
    await window._fbSetDoc(ref, { deleted: true, deletedAt: new Date().toISOString() });
  },
  onAccountDeleted: (uid, cb) => {
    if (!window._fbDb || !window._fbOnSnapshot) return () => {};
    const ref = window._fbDoc(window._fbDb, "accountDeletions", uid);
    return window._fbOnSnapshot(ref, (snap) => {
      const data = snap.exists() ? snap.data() : null;
      cb(!!data?.deleted);
    }, () => cb(false));
  },
  // v1.29 — Réactivation en libre-service ("recommencer avec cette adresse").
  // Ne crée jamais un second compte Auth (Firebase interdit deux comptes avec
  // le même email) : on lève juste le flag sur le même uid. La règle Firestore
  // n'autorise que la transition deleted:true → false, rien d'autre.
  reactivateAccount: async (uid) => {
    if (!window._fbDb || !window._fbSetDoc) return;
    const ref = window._fbDoc(window._fbDb, "accountDeletions", uid);
    await window._fbSetDoc(ref, { deleted: false, reactivatedAt: new Date().toISOString() }, { merge: true });
  },
  // Envoie une demande de récupération/effacement des données au support, via
  // le Worker (route à créer côté serveur : POST /account-data-request).
  // Authentifié par ID token Firebase, même pattern que /v1/messages.
  sendAccountDataRequest: async (action, uid, email) => {
    const idToken = window._fbAuth?.currentUser
      ? await window._fbAuth.currentUser.getIdToken()
      : null;
    if (!idToken) throw new Error("Non authentifié");
    // v1.89.0 — Fix : même bug que sendVerification, codé en dur vers PROD.
    const res = await fetch(`${PROXY_BASE_URL}/account-data-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ action, uid, email }),
    });
    if (!res.ok) {
      let msg = `Erreur ${res.status}`;
      try {
        const data = await res.json();
        if (data?.error) msg = data.error;
      } catch (e) {}
      throw new Error(msg);
    }
  },
  // ── Product photos sync (v1.30.0) ──
  // Photos produits stockées à part de config/main (un doc par photo) pour ne
  // plus jamais dépasser la limite Firestore de 1 Mio par document. Bug
  // constaté avec plusieurs dizaines de photos encore en 1280px (avant la
  // compression 300px/qualité 0.5 introduite en v1.29.9) accumulées dans le
  // même document config/main.
  saveProductPhoto: async (uid, productId, photo) => {
    if (!window._fbDb || !window._fbSetDoc) return;
    const ref = window._fbDoc(window._fbDb, "users", uid, "productPhotos", productId);
    await window._fbSetDoc(ref, { photo, updatedAt: new Date().toISOString() });
  },
  deleteProductPhoto: async (uid, productId) => {
    if (!window._fbDb || !window._fbDeleteDoc) return;
    const ref = window._fbDoc(window._fbDb, "users", uid, "productPhotos", productId);
    await window._fbDeleteDoc(ref);
  },
  getProductPhotos: async (uid) => {
    if (!window._fbDb || !window._fbGetDocs) return {};
    const col = window._fbCollection(window._fbDb, "users", uid, "productPhotos");
    const snap = await window._fbGetDocs(col);
    const map = {};
    snap.docs.forEach((d) => { map[d.id] = d.data().photo; });
    return map;
  },
  onProductPhotos: (uid, cb) => {
    if (!window._fbDb || !window._fbOnSnapshot) return () => {};
    const col = window._fbCollection(window._fbDb, "users", uid, "productPhotos");
    return window._fbOnSnapshot(col, (snap) => {
      const map = {};
      snap.docs.forEach((d) => { map[d.id] = d.data().photo; });
      cb(map);
    });
  },
  // ── Config sync (pools, products, activePlan, settings) ──
  saveConfig: async (uid, config) => {
    if (!window._fbDb || !window._fbSetDoc) return;
    const ref = window._fbDoc(window._fbDb, "users", uid, "config", "main");
    await window._fbSetDoc(ref, { ...config, updatedAt: new Date().toISOString() }, { merge: true });
  },
  getConfig: async (uid) => {
    if (!window._fbDb || !window._fbGetDoc) return null;
    const snap = await window._fbGetDoc(window._fbDoc(window._fbDb, "users", uid, "config", "main"));
    return snap.exists() ? snap.data() : null;
  },
  // v1.70.0 — errCb optionnel : Firestore n'appelle jamais cb() en cas de
  // permission-denied (accès secondaire révoqué), l'écoute restait donc
  // bloquée en silence dans "context_loading" indéfiniment. errCb permet de
  // distinguer explicitement ce cas plutôt que de compter uniquement sur un
  // timeout côté UI.
  onConfig: (uid, cb, errCb) => {
    if (!window._fbDb || !window._fbOnSnapshot) return () => {};
    const ref = window._fbDoc(window._fbDb, "users", uid, "config", "main");
    // v1.85.0 — BUG : cb() n'était appelé QUE si le document existait déjà.
    // Pour un compte tout neuf (aucune écriture cloud encore effectuée),
    // config/main n'existe pas → cb() n'était jamais invoqué → cloudConfigReceived
    // restait bloqué à false indéfiniment → spinner "Chargement du bassin"
    // permanent, écran de création du premier bassin jamais atteint. Masqué
    // jusqu'ici sur test/prod car leurs comptes de test avaient déjà un doc
    // config/main d'une session antérieure. Tous les accès aux champs dans le
    // callback (config.pools?.length, etc.) tolèrent déjà un objet vide.
    return window._fbOnSnapshot(ref, (snap) => {
      cb(snap.exists() ? snap.data() : {});
    }, (err) => { if (errCb) errCb(err); });
  },
  // ── Calibration Lot B — collection RACINE, create-only, sans uid (cf.
  // firestore.rules). ID généré côté client via uid() — pas de setDoc avec
  // merge, chaque point est un document indépendant et immuable.
  addCalibrationPoint: async (point) => {
    if (!window._fbDb || !window._fbSetDoc) return;
    const ref = window._fbDoc(window._fbDb, "calibrationPoints", uid());
    await window._fbSetDoc(ref, point);
  },
  // v1.38.0 — Lot B : lit un modèle de calibration agrégé (calculé côté
  // Worker Cloudflare à partir des points contribués par tous les
  // utilisateurs). Collection en lecture seule côté client (cf.
  // firestore.rules), écrite uniquement par le Worker. Retourne null si aucun
  // modèle n'existe encore pour ce couple modèle de bandelette + paramètre
  // (pas assez de points collectés).
  getCalibrationModel: async (stripModel, param) => {
    if (!window._fbDb || !window._fbGetDoc) return null;
    const ref = window._fbDoc(window._fbDb, "calibrationModels", `${stripModel}_${param}`);
    const snap = await window._fbGetDoc(ref);
    return snap.exists() ? snap.data() : null;
  },
  // ── v1.55.0 — Utilisateurs secondaires (brique 3) ──
  // Comptes qui m'ont invité (moi = secondaire). doc.id = primaryUid.
  onLinkedAccounts: (uid, cb) => {
    if (!window._fbDb || !window._fbOnSnapshot) return () => {};
    const col = window._fbCollection(window._fbDb, "users", uid, "linkedAccounts");
    return window._fbOnSnapshot(col, (snap) => {
      cb(snap.docs.map((d) => ({ primaryUid: d.id, ...d.data() })));
    });
  },
  // Comptes que j'ai invités (moi = principal). doc.id = secondaryUid.
  onSecondaryUsers: (uid, cb) => {
    if (!window._fbDb || !window._fbOnSnapshot) return () => {};
    const col = window._fbCollection(window._fbDb, "users", uid, "secondaryUsers");
    return window._fbOnSnapshot(col, (snap) => {
      cb(snap.docs.map((d) => ({ secondaryUid: d.id, ...d.data() })));
    });
  },
};

// Helper analytics — fire-and-forget
function track(event, params) {
  try { window._fbLog && window._fbLog(event, params); } catch (e) {}
}

function LoginScreen({ lang, onSkip, onConsentChange, detectedLang }) {
  const t = useT(lang || detectedLang || "fr");
  const [mode, setMode] = useState("login"); // login | signup | reset | done | disclaimer
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [verifyEmailFailed, setVerifyEmailFailed] = useState(false);
  const [showCreateAccountHint, setShowCreateAccountHint] = useState(false);
  const [showResetHint, setShowResetHint] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [resendDone, setResendDone] = useState(false);
  const [cguAccepted, setCguAccepted] = useState(false);
  const [dataAccepted, setDataAccepted] = useState(false);

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
    setError(""); setInfo(""); setBusy(true); setShowCreateAccountHint(false); setShowResetHint(false);
    try {
      if (mode === "reset") {
        await FB.resetPwd(email);
        setInfo(t("reset_sent"));
        setTimeout(() => setMode("login"), 3000);
      } else if (mode === "signup") {
        if (!email.trim()) { setError(t("error_email_required")); setBusy(false); return; }
        if (pwd.length < 6) { setError(t("weak_password")); setBusy(false); return; }
        if (pwd !== pwd2) { setError(t("error_pwd_mismatch")); setBusy(false); return; }
        if (!cguAccepted) { setError(t("disclaimer_required")); setBusy(false); return; }
        const cred = await FB.signUp(email, pwd);
        track("sign_up", { method: "email" });
        // Envoie l'email de vérification — erreur loggée et exposée à l'écran "done"
        // plutôt qu'avalée silencieusement (impossible jusqu'ici de savoir si ça échouait)
        try {
          await FB.sendVerification(cred.user);
          setVerifyEmailFailed(false);
        } catch (verifyErr) {
          console.error("Échec d'envoi de l'email de vérification :", verifyErr.code, verifyErr.message);
          setVerifyEmailFailed(true);
        }
        // Enregistre le profil dans Firestore
        await FB.saveUser(cred.user.uid, {
          email: cred.user.email,
          createdAt: new Date().toISOString(),
          isPremium: false,
          gdprConsent: true,
          gdprConsentDate: new Date().toISOString(),
          dataConsent: dataAccepted,
          dataConsentDate: dataAccepted ? new Date().toISOString() : null,
          cguVersion: CGU_VERSION,
          cguAcceptedDate: new Date().toISOString(),
        }).catch(() => {});
        if (onConsentChange) onConsentChange({ gdpr: true, data: dataAccepted, cguVersion: CGU_VERSION, cguDate: new Date().toISOString() });
        setMode("done");
        // onAuthStateChanged se déclenchera et appellera onSuccess via PoolGenAIApp
      } else {
        await FB.signIn(email, pwd);
        // onAuthStateChanged se déclenchera automatiquement
      }
    } catch (e) {
      const isLoginCredentialError = mode === "login" &&
        (e.code === "auth/wrong-password" || e.code === "auth/invalid-credential" || e.code === "auth/user-not-found");
      const isSignupEmailInUse = mode === "signup" && e.code === "auth/email-already-in-use";
      const msg = isLoginCredentialError ? t("login_failed_unified")
        : e.code === "auth/wrong-password" || e.code === "auth/invalid-credential" ? t("wrong_password")
        : e.code === "auth/user-not-found" ? t("user_not_found")
        : e.code === "auth/user-disabled" ? t("account_disabled")
        : e.code === "auth/email-already-in-use" ? t("email_in_use")
        : e.code === "auth/weak-password" ? t("weak_password")
        : e.code === "auth/invalid-email" ? t("error_email_required")
        : e.message;
      setShowCreateAccountHint(isLoginCredentialError);
      setShowResetHint(isSignupEmailInUse);
      setError(msg);
    } finally { setBusy(false); }
  }

  // Écran disclaimer
  if (mode === "disclaimer") {
    const tDisc = t; // t est déjà défini via useT au dessus
    const disclaimerText = {
      fr: `CONDITIONS GÉNÉRALES D'UTILISATION — POOLGENAI CGU v1.3
Éditeur : Arnaud Goumain — Particulier
Contact : support@poolgenai.com
Hébergement : GitHub Inc. / Microsoft Corporation, San Francisco, USA

1. NATURE DE L'APPLICATION
PoolGenAI est un outil d'aide à la gestion de la chimie de piscine à usage strictement personnel. Les recommandations générées sont automatiques et ne constituent pas un avis professionnel, technique ou sanitaire.

2. LIMITATION DE RESPONSABILITÉ
Dans les limites autorisées par la loi applicable, la responsabilité de l'éditeur est limitée au montant effectivement versé par l'utilisateur pour l'accès au service au cours des douze derniers mois (soit zéro euro, l'application étant gratuite). L'éditeur ne saurait être tenu responsable des dommages indirects, immatériels, consécutifs ou punitifs, y compris la perte de données, la perte de profits ou tout préjudice résultant de l'application de traitements chimiques basés sur les recommandations de l'application.

3. RESPONSABILITÉ DE L'UTILISATEUR
L'utilisateur est seul responsable de la vérification des dosages recommandés, du respect des notices d'utilisation des produits chimiques, des réglementations locales relatives au traitement de l'eau, et de la sécurité des personnes fréquentant le bassin traité.

4. PRODUITS CHIMIQUES
Les produits de traitement de l'eau peuvent être dangereux. L'utilisateur doit lire les fiches de données de sécurité (FDS) et respecter les précautions d'emploi, de stockage et d'élimination prescrites par les fabricants.

5. INTELLIGENCE ARTIFICIELLE (ANALYSE PAR IA)
Lorsque l'utilisateur active la fonctionnalité d'analyse par intelligence artificielle, les données saisies (valeurs de mesure et photos) sont transmises au fournisseur d'IA via l'infrastructure technique de l'éditeur (serveur intermédiaire), qui utilise une clé API souscrite par l'éditeur. L'éditeur prend en charge les coûts de traitement IA, ne conserve ni ne journalise le contenu transmis sur son serveur intermédiaire, et agit en tant que sous-traitant au sens du RGPD pour cette opération. L'éditeur se réserve le droit de faire évoluer le fournisseur d'IA utilisé sans que cela nécessite une modification des présentes CGU. L'utilisateur reste responsable du contenu des photos qu'il transmet.

6. PHOTOS ET DONNÉES PERSONNELLES
L'utilisateur s'engage à ne soumettre à l'analyse par intelligence artificielle que des photos du matériel de mesure (photomètre, bandelettes), de l'eau du bassin, ou de produits de traitement. Sont strictement exclus : toute image permettant d'identifier des personnes, de localiser un domicile (façade, plaque d'immatriculation, rue visible) ou contenant des données personnelles visibles. L'éditeur décline toute responsabilité quant au contenu des photos soumises par l'utilisateur.

7. USAGE RÉSERVÉ
L'utilisation de PoolGenAI est réservée aux traitements d'eau de bassins de type piscine ou spa. Tout autre usage est exclu de la présente licence.

8. PROFESSIONNELS
Les professionnels utilisant PoolGenAI pour des prestations réalisées pour le compte de tiers sont tenus d'informer les propriétaires des bassins traités des conditions du présent document et d'obtenir leur accord exprès avant toute collecte de données les concernant.

9. DONNÉES PERSONNELLES ET RGPD
Conformément au RGPD et à la loi Informatique et Libertés, l'utilisateur dispose d'un droit d'accès, de rectification, d'effacement et de portabilité de ses données. Pour exercer ces droits ou déposer une réclamation, l'utilisateur peut contacter l'éditeur à support@poolgenai.com ou s'adresser à la CNIL : www.cnil.fr

10. ABSENCE DE GARANTIE
L'application est fournie "en l'état", sans garantie d'aucune sorte, expresse ou implicite, quant à son exactitude, sa fiabilité ou son adéquation à un usage particulier.

11. AMÉLIORATION COLLECTIVE DES ANALYSES PHOTO (DONNÉES DE CALIBRATION)
Lorsqu'une mesure comporte à la fois une photo de photomètre et une photo de bandelette pour un même paramètre, PoolGenAI peut extraire une donnée de calibration anonyme et la partager avec l'ensemble des utilisateurs, pour améliorer la précision de l'interprétation des bandelettes pour tous. Ces données ne contiennent ni photo, ni identifiant de compte. L'utilisateur peut désactiver cette contribution à tout moment dans les réglages.

12. CONTRIBUTION DE PHOTOS À LA BASE COMMUNE DE PRODUITS
Lorsqu'un utilisateur photographie un produit de traitement qui ne dispose pas encore de photo dans la base commune de produits partagée entre utilisateurs, cette photo peut être transmise et stockée pour illustrer la fiche produit correspondante, visible par l'ensemble des utilisateurs. Seule la photo du produit est concernée : l'utilisateur reste seul responsable de ne pas photographier d'éléments personnels ou identifiables. Une fois contribuée, la photo ne peut pas être retirée individuellement (aucune information ne relie une photo à son contributeur).

En créant un compte, l'utilisateur reconnaît avoir pris connaissance de l'intégralité du présent document (CGU v1.3) et en accepte les termes.`,
      en: `TERMS OF USE — POOLGENAI CGU v1.3
Publisher: Arnaud Goumain — Private individual
Contact: support@poolgenai.com
Hosting: GitHub Inc. / Microsoft Corporation, San Francisco, USA

1. NATURE OF THE APPLICATION
PoolGenAI is a personal pool chemistry management tool. Generated recommendations are automatic and do not constitute professional, technical or health advice.

2. LIMITATION OF LIABILITY
To the extent permitted by applicable law, the publisher's liability is limited to the amount actually paid by the user for access to the service in the preceding twelve months (i.e. zero euros, as the application is free). The publisher shall not be liable for indirect, immaterial, consequential or punitive damages, including loss of data, loss of profits, or any damage resulting from the application of chemical treatments based on the application's recommendations.

3. USER RESPONSIBILITY
The user is solely responsible for verifying recommended dosages, following product instructions, complying with local water treatment regulations, and ensuring the safety of persons using the treated pool.

4. CHEMICAL PRODUCTS
Water treatment products may be hazardous. The user must read safety data sheets (SDS) and follow the precautions prescribed by manufacturers.

5. ARTIFICIAL INTELLIGENCE (AI ANALYSIS)
When the user activates the AI analysis feature, the data entered (measurement values and photos) is sent to the AI provider through the publisher's technical infrastructure (intermediary server), which uses an API key subscribed by the publisher. The publisher covers the AI processing costs, does not retain or log content transmitted on its intermediary server, and acts as a data processor under GDPR for this operation. The publisher reserves the right to change the AI provider used without this requiring an amendment to these Terms. The user remains responsible for the content of the photos they submit.

6. PHOTOS AND PERSONAL DATA
The user undertakes to submit to AI analysis only photos of measuring equipment (photometer, test strips), pool water, or treatment products. Strictly excluded are: any image that could identify persons, locate a residence (facade, license plate, visible street) or contain visible personal data. The publisher accepts no liability for the content of photos submitted by the user.

7. PERMITTED USE
Use of PoolGenAI is reserved for water treatment of pool or spa type basins. Any other use is excluded from this licence.

8. PROFESSIONALS
Professionals using PoolGenAI for services performed on behalf of third parties must inform the owners of treated pools of the terms of this document and obtain their express agreement before any collection of data concerning them.

9. PERSONAL DATA AND GDPR
In accordance with the GDPR and the French Data Protection Act, users have the right to access, rectify, erase and port their data. To exercise these rights or lodge a complaint, users may contact the publisher at support@poolgenai.com, or contact the CNIL: www.cnil.fr

10. NO WARRANTY
The application is provided "as is" without warranty of any kind, express or implied, as to its accuracy, reliability or fitness for a particular purpose.

11. COLLECTIVE IMPROVEMENT OF PHOTO ANALYSIS (CALIBRATION DATA)
When a measurement includes both a photometer photo and a test strip photo for the same parameter, PoolGenAI may extract an anonymous calibration data point and share it with all users, to improve strip interpretation accuracy for everyone. This data contains no photo and no account identifier. The user can disable this contribution at any time in settings.

12. PHOTO CONTRIBUTION TO THE SHARED PRODUCT DATABASE
When a user photographs a treatment product that does not yet have a photo in the shared product database, that photo may be transmitted and stored to illustrate the corresponding product entry, visible to all users. Only the product photo itself is concerned: the user remains solely responsible for not photographing personal or identifiable elements. Once contributed, a photo cannot be individually withdrawn (no information links a photo to its contributor).

By creating an account, the user acknowledges having read this document in full (Terms v1.3) and accepts its terms.`,
    };
    const text = disclaimerText[detectedLang || lang] || disclaimerText.en;
    return (
      <div style={{ minHeight: "100vh", background: "#eaf4fb", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div style={{ width: "100%", maxWidth: 480, background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 4px 24px var(--brand-primary)18", maxHeight: "90dvh", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--brand-text-strong)" }}>{tDisc("disclaimer_title")}</div>
            <button onClick={() => setMode("signup")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--brand-text-muted)" }}><X size={20} /></button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", fontSize: 12, color: "#2d4a6e", lineHeight: 1.7, whiteSpace: "pre-wrap", background: "#f5f8fc", borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
            {text}
          </div>
          <button
            style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: "var(--brand-primary)", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
            onClick={() => { setCguAccepted(true); setMode("signup"); }}
          >
            {tDisc("disclaimer_cgu")}
          </button>
          <button
            onClick={() => setMode("signup")}
            style={{ background: "none", border: "none", color: "#9ab0c4", fontSize: 12, cursor: "pointer", marginTop: 10, textAlign: "center" }}
          >
            {tDisc("back_to_login")}
          </button>
        </div>
      </div>
    );
  }

  // Écran de succès après inscription
  if (mode === "done") {
    return (
      <div style={{ minHeight: "100vh", background: "#eaf4fb", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ width: "100%", maxWidth: 380, background: "#fff", borderRadius: 20, padding: 32, boxShadow: "0 4px 24px var(--brand-primary)18", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#e8f8ef", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <CheckCircle2 size={28} color="#1a8fd1" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--brand-text-strong)", marginBottom: 8 }}>{t("account_created")}</div>
          <div style={{ fontSize: 13, color: "var(--brand-text-muted)", marginBottom: 12 }}>{t("account_created_sub")}</div>
          {verifyEmailFailed ? (
            <div style={{ fontSize: 12, color: "#c0392b", background: "#fdf0ef", border: "1px solid #f3c9c4", borderRadius: 10, padding: "10px 14px", marginBottom: 14, textAlign: "left" }}>
              ⚠️ {t("verify_email_send_failed")}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "#a8721a", background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 10, padding: "10px 14px", marginBottom: 14, textAlign: "left" }}>
              📧 {t("verify_email_notice")}
            </div>
          )}
          {verifyEmailFailed && (
            <button
              style={{ width: "100%", padding: "11px 0", borderRadius: 12, border: "1.5px solid var(--brand-primary)", background: "#fff", color: "var(--brand-primary)", fontWeight: 600, fontSize: 13.5, cursor: resendBusy ? "default" : "pointer", marginBottom: 14 }}
              disabled={resendBusy}
              onClick={async () => {
                setResendBusy(true);
                try {
                  await FB.sendVerification(window._fbAuth?.currentUser);
                  setVerifyEmailFailed(false);
                  setResendDone(true);
                } catch (e) {
                  console.error("Échec du renvoi de l'email de vérification :", e.code, e.message);
                }
                setResendBusy(false);
              }}
            >
              {resendBusy ? "..." : resendDone ? t("verify_email_resent") : t("verify_email_retry_btn")}
            </button>
          )}
          <button
            style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: "var(--brand-primary)", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
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
      <div style={{ width: "100%", maxWidth: 380, background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 4px 24px var(--brand-primary)18" }}>
        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--brand-primary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
            <Droplets size={28} color="#fff" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--brand-text-strong)" }}>PoolGenAI</div>
          <div style={{ fontSize: 13, color: "var(--brand-text-muted)", marginTop: 2 }}>
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
              style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: "1.5px solid #d0e4f5", background: "#f8fafd", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: 14, fontWeight: 600, color: "var(--brand-text-strong)", cursor: busy ? "not-allowed" : "pointer", marginBottom: 16, opacity: busy ? 0.6 : 1 }}
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
            <FieldLabel required style={{ fontSize: 12, fontWeight: 600, color: "var(--brand-text-secondary)", display: "block", marginBottom: 4 }}>Email</FieldLabel>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #d0e4f5", fontSize: 14, marginBottom: 10, boxSizing: "border-box" }}
              placeholder="votre@email.com"
              onKeyDown={e => e.key === "Enter" && mode !== "signup" && handleSubmit()}
            />

            {mode !== "reset" && (
              <>
                <FieldLabel required style={{ fontSize: 12, fontWeight: 600, color: "var(--brand-text-secondary)", display: "block", marginBottom: 4 }}>{t("password")}</FieldLabel>
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
                <FieldLabel required style={{ fontSize: 12, fontWeight: 600, color: "var(--brand-text-secondary)", display: "block", marginBottom: 4 }}>{t("confirm_password")}</FieldLabel>
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

            {/* Cases consentement — uniquement en mode signup */}
            {mode === "signup" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14, padding: "12px 14px", background: "#f5f8fc", borderRadius: 10, border: "1px solid #d0e4f5" }}>
                {/* CGU — obligatoire */}
                <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={cguAccepted}
                    onChange={e => setCguAccepted(e.target.checked)}
                    style={{ marginTop: 2, accentColor: "var(--brand-primary)", width: 16, height: 16, flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 12, color: "var(--brand-text-strong)", lineHeight: 1.5 }}>
                    <strong>{t("disclaimer_cgu")}</strong>
                    {" "}<span
                      style={{ color: "var(--brand-primary)", textDecoration: "underline", cursor: "pointer" }}
                      onClick={e => { e.preventDefault(); setMode("disclaimer"); }}
                    >{t("disclaimer_title")}</span>
                  </span>
                </label>
                {/* Données — optionnel */}
                <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={dataAccepted}
                    onChange={e => setDataAccepted(e.target.checked)}
                    style={{ marginTop: 2, accentColor: "var(--brand-primary)", width: 16, height: 16, flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 12, color: "var(--brand-text-secondary)", lineHeight: 1.5 }}>
                    {t("disclaimer_data")}
                  </span>
                </label>
                <div style={{ fontSize: 10, color: "#9ab0c4", fontStyle: "italic" }}>
                  {t("disclaimer_pro")}
                </div>
              </div>
            )}

            {error && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: "#c0392b", padding: "8px 10px", background: "#fdf0ef", borderRadius: 8 }}>{error}</div>
                {showCreateAccountHint && (
                  <button
                    type="button"
                    onClick={() => { setMode("signup"); setError(""); setShowCreateAccountHint(false); }}
                    style={{ marginTop: 6, background: "none", border: "none", color: "var(--brand-primary)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", padding: 0, textDecoration: "underline" }}
                  >
                    {t("create_account_hint")}
                  </button>
                )}
                {showResetHint && (
                  <button
                    type="button"
                    onClick={() => { setMode("reset"); setError(""); setShowResetHint(false); }}
                    style={{ marginTop: 6, background: "none", border: "none", color: "var(--brand-primary)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", padding: 0, textDecoration: "underline" }}
                  >
                    {t("reset_password_hint")}
                  </button>
                )}
              </div>
            )}
            {info && <div style={{ fontSize: 12, color: "#1a8fd1", marginBottom: 8, padding: "8px 10px", background: "#e8f4fd", borderRadius: 8 }}>{info}</div>}

            <button
              style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: busy ? "var(--brand-icon-light)" : "var(--brand-primary)", color: "#fff", fontWeight: 700, fontSize: 15, cursor: busy ? "not-allowed" : "pointer", marginBottom: 14 }}
              onClick={handleSubmit}
              disabled={busy}
            >
              {busy ? "..." : mode === "signup" ? t("create_account") : mode === "reset" ? t("send_reset") : t("sign_in")}
            </button>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
              {mode === "login" && (
                <>
                  <button onClick={() => { setMode("signup"); setError(""); setPwd(""); setPwd2(""); }} style={{ background: "none", border: "none", color: "var(--brand-primary)", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>{t("no_account")}</button>
                  <button onClick={() => { setMode("reset"); setError(""); }} style={{ background: "none", border: "none", color: "#9aa9a5", fontSize: 12, cursor: "pointer" }}>{t("forgot_password")}</button>
                </>
              )}
              {mode === "signup" && (
                <button onClick={() => { setMode("login"); setError(""); setPwd(""); setPwd2(""); }} style={{ background: "none", border: "none", color: "var(--brand-text-muted)", fontSize: 13, cursor: "pointer" }}>{t("already_account")}</button>
              )}
              {mode === "reset" && (
                <button onClick={() => { setMode("login"); setError(""); }} style={{ background: "none", border: "none", color: "var(--brand-text-muted)", fontSize: 12, cursor: "pointer" }}>{t("back_to_login")}</button>
              )}
            </div>
          </>
        )}

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "#d0d8e0" }}>v{APP_VERSION}</div>
        </div>
      </div>
    </div>
  );
}


function PoolGenAIApp() {
  const [authUser, setAuthUser] = useState(undefined); // undefined=loading, null=anonymous, object=logged in
  const [showLogin, setShowLogin] = useState(false);
  const [showDeleteReauth, setShowDeleteReauth] = useState(false);
  const [deleteReauthError, setDeleteReauthError] = useState(null);
  const [deleteReauthBusy, setDeleteReauthBusy] = useState(false);
  const [emailVerifiedNow, setEmailVerifiedNow] = useState(null); // null = se fier à authUser.emailVerified
  const [verifyChecking, setVerifyChecking] = useState(false);
  const [verifyCheckFailed, setVerifyCheckFailed] = useState(false);
  const [verifySending, setVerifySending] = useState(false);
  const [verifyResendStatus, setVerifyResendStatus] = useState(null); // null | "sent" | "error"

  // ── Lien de vérification email entrant (?token=xxx) ──
  // null tant qu'aucun token n'est présent dans l'URL ; sinon "verifying" |
  // "verified" | "already_verified" | "expired" | "invalid" | "error".
  const [verifyLinkStatus, setVerifyLinkStatus] = useState(null);
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) return;
    setVerifyLinkStatus("verifying");
    // v1.89.0 — Fix : le token de vérification vit dans Firestore de
    // l'environnement courant (test/dev/prod), pas toujours prod — sinon
    // toujours "invalide" pour les comptes créés sur test/dev.
    fetch(`${PROXY_BASE_URL}/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        if (res.status === 410) { setVerifyLinkStatus("expired"); return; }
        if (res.status === 404) { setVerifyLinkStatus("invalid"); return; }
        if (!res.ok) { setVerifyLinkStatus("error"); return; }
        const data = await res.json().catch(() => ({}));
        setVerifyLinkStatus(data.status === "already_verified" ? "already_verified" : "verified");
        // Le champ emailVerified est mis à jour côté Firebase Auth par le Worker, mais
        // le SDK client ne le sait pas tant qu'on ne force pas un reload() — sinon
        // authUser.emailVerified reste périmé en mémoire jusqu'au prochain rechargement complet.
        try {
          if (window._fbAuth?.currentUser) {
            await window._fbAuth.currentUser.reload();
            setEmailVerifiedNow(!!window._fbAuth.currentUser.emailVerified);
          }
        } catch (e) {}
      })
      .catch(() => setVerifyLinkStatus("error"))
      .finally(() => {
        // Nettoie l'URL pour éviter de retraiter le même token si l'utilisateur recharge
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, "", cleanUrl);
      });
  }, []);

  // ── Lien de confirmation de fusion base commune entrant (?confirmMerge=xxx&token=yyy) ──
  // Contrairement au lien de vérification email (auto-confirmé au chargement),
  // celui-ci affiche un écran "Confirmer la fusion ?" avec un bouton explicite
  // avant d'agir — décision du 260706 : une fusion touche une fiche partagée
  // entre utilisateurs, donc un clic seul sur le lien email ne suffit pas.
  // null | "pending_confirmation" | "confirming" | "merged" | "already_merged" | "expired" | "invalid" | "error"
  const [mergeLinkStatus, setMergeLinkStatus] = useState(null);
  const [mergeLinkParams, setMergeLinkParams] = useState(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mergeId = params.get("confirmMerge");
    const token = params.get("token");
    if (!mergeId || !token) return;
    setMergeLinkParams({ mergeId, token });
    setMergeLinkStatus("pending_confirmation");
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, "", cleanUrl);
  }, []);

  async function handleConfirmMergeClick() {
    if (!mergeLinkParams) return;
    setMergeLinkStatus("confirming");
    try {
      const result = await confirmCommonProductMerge(mergeLinkParams);
      if (result.status === 410) { setMergeLinkStatus("expired"); return; }
      if (result.status === 404) { setMergeLinkStatus("invalid"); return; }
      if (result.status && result.status >= 400) { setMergeLinkStatus("error"); return; }
      setMergeLinkStatus(result.status === "already_merged" ? "already_merged" : "merged");
    } catch (e) {
      setMergeLinkStatus("error");
    }
  }

  // ── v1.55.0 — Utilisateurs secondaires (brique 3) ──
  // Lien d'invitation entrant (?respondInvitation=token). Contrairement au
  // lien de fusion, celui-ci exige d'être connecté (avec l'email invité) pour
  // pouvoir répondre — voir handleInviteResponse.
  // null | "loading_info" | "info_ready" | "responding" | "accepted" |
  // "declined" | "expired" | "invalid" | "mismatch" | "error"
  const [inviteLinkStatus, setInviteLinkStatus] = useState(null);
  const [inviteLinkToken, setInviteLinkToken] = useState(null);
  const [inviteLinkInfo, setInviteLinkInfo] = useState(null); // { primaryEmail, poolName }
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("respondInvitation");
    if (!token) return;
    setInviteLinkToken(token);
    setInviteLinkStatus("loading_info");
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, "", cleanUrl);
    getInvitationInfo(token)
      .then((result) => {
        if (typeof result.status === "number") { setInviteLinkStatus("error"); return; }
        if (result.status === "pending") {
          setInviteLinkInfo({ primaryEmail: result.primaryEmail, primaryPseudo: result.primaryPseudo, poolName: result.poolName });
          setInviteLinkStatus("info_ready");
        } else {
          setInviteLinkStatus(result.status || "error"); // invalid | expired | declined | accepted
        }
      })
      .catch(() => setInviteLinkStatus("error"));
  }, []);

  // Force l'écran de connexion tant qu'une invitation est en attente de
  // réponse et qu'on n'est pas connecté (il faut être connecté avec l'email
  // invité pour accepter/refuser).
  useEffect(() => {
    if (inviteLinkStatus && authUser === null) setShowLogin(true);
  }, [inviteLinkStatus, authUser]);

  async function handleInviteResponse(action) {
    if (!inviteLinkToken || !authUser) return;
    setInviteLinkStatus("responding");
    try {
      const idToken = await authUser.getIdToken();
      const result = await respondToInvitation(idToken, inviteLinkToken, action);
      if (result.status === 403) { setInviteLinkStatus("mismatch"); return; }
      if (result.status === 409 && result.code === "invited_limit_reached") { setInviteLinkStatus("limit_reached"); return; }
      if (result.status === 403 && result.code === "invite_requires_premium") { setInviteLinkStatus("requires_premium"); return; }
      if (typeof result.status === "number") { setInviteLinkStatus("error"); return; }
      if (result.status === "accepted" && result.primaryEmail) {
        setInviteLinkInfo((prev) => ({ ...prev, primaryEmail: result.primaryEmail }));
      }
      setInviteLinkStatus(result.status || "error");
    } catch (e) {
      setInviteLinkStatus("error");
    }
  }

  // v1.60.0 — Landing de confirmation de révocation (côté PROPRIÉTAIRE cette
  // fois, pas l'invité) : miroir exact du bloc invitation ci-dessus, avec
  // ?respondRevocation=token à la place de ?respondInvitation=token.
  // null | "loading_info" | "info_ready" | "responding" | "done" |
  // "expired" | "invalid" | "mismatch" | "error"
  const [revocationLinkStatus, setRevocationLinkStatus] = useState(null);
  const [revocationLinkToken, setRevocationLinkToken] = useState(null);
  const [revocationLinkInfo, setRevocationLinkInfo] = useState(null); // { secondaryPseudo, poolName }
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("respondRevocation");
    if (!token) return;
    setRevocationLinkToken(token);
    setRevocationLinkStatus("loading_info");
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, "", cleanUrl);
    getRevocationRequestInfo(token)
      .then((result) => {
        if (typeof result.status === "number") { setRevocationLinkStatus("error"); return; }
        if (result.status === "pending") {
          setRevocationLinkInfo({ secondaryPseudo: result.secondaryPseudo, poolName: result.poolName });
          setRevocationLinkStatus("info_ready");
        } else {
          setRevocationLinkStatus(result.status || "error"); // invalid | expired | done
        }
      })
      .catch(() => setRevocationLinkStatus("error"));
  }, []);

  // Force l'écran de connexion tant qu'une demande de révocation est en
  // attente de confirmation et qu'on n'est pas connecté (il faut être
  // connecté avec le compte propriétaire pour confirmer).
  useEffect(() => {
    if (revocationLinkStatus && authUser === null) setShowLogin(true);
  }, [revocationLinkStatus, authUser]);

  async function handleRevocationConfirm() {
    if (!revocationLinkToken || !authUser) return;
    setRevocationLinkStatus("responding");
    try {
      const idToken = await authUser.getIdToken();
      const result = await respondToRevocation(idToken, revocationLinkToken);
      if (result.status === 403) { setRevocationLinkStatus("mismatch"); return; }
      if (typeof result.status === "number") { setRevocationLinkStatus("error"); return; }
      setRevocationLinkStatus(result.status || "error");
    } catch (e) {
      setRevocationLinkStatus("error");
    }
  }

  // ── Comptes qui m'ont invité (moi = secondaire) + contexte affiché ──
  // linkedAccounts : liste brute (users/{moi}/linkedAccounts), enrichie à la
  // volée (poolName/pseudo) au moment de l'ouverture des réglages — voir
  // SettingsView. viewContext : null = mes bassins ; sinon
  // { primaryUid, poolId, poolName, pseudo } = bassin d'un principal.
  const [linkedAccounts, setLinkedAccounts] = useState([]);
  // v1.70.0 — Distingue "linkedAccounts pas encore chargé" de "chargé et
  // vide" : sans ce flag, le useEffect de contrôle de révocation voyait un
  // tableau vide dès le premier rendu (avant même que l'écoute Firestore
  // n'ait renvoyé son premier snapshot) et éjectait à tort un utilisateur
  // secondaire dont l'accès était pourtant toujours actif.
  const [linkedAccountsLoaded, setLinkedAccountsLoaded] = useState(false);
  const [viewContext, setViewContext] = useState(null);
  const viewContextLoadedRef = useRef(false);
  // v1.57.4 — Switcher unifié (mes bassins + bassins invités, cf. incident
  // "je ne vois pas le bassin invité dans mes réglages"). ownPools : mes
  // bassins, toujours à jour indépendamment du contexte affiché (alimenté
  // par l'effet accountSettingsSync, toujours sur authUser.uid). linkedPoolsInfo :
  // enrichissement de linkedAccounts (nom du bassin + pseudo du principal),
  // remonté ici depuis SecondaryUsersSection (v1.55.0) pour alimenter le
  // switcher du Header, pas seulement l'écran réglages.
  const [ownPools, setOwnPools] = useState([]);
  const [linkedPoolsInfo, setLinkedPoolsInfo] = useState([]);

  useEffect(() => {
    if (!authUser?.uid || !FB.ready()) { setLinkedAccounts([]); setLinkedAccountsLoaded(false); return; }
    setLinkedAccountsLoaded(false);
    const unsub = FB.onLinkedAccounts(authUser.uid, (accounts) => {
      setLinkedAccounts(accounts);
      setLinkedAccountsLoaded(true);
    });
    return () => unsub();
  }, [authUser?.uid]);

  // v1.57.4 — Enrichit linkedAccounts (poolName + pseudo du principal), lu
  // directement depuis config/main du principal — autorisé par la règle
  // isActiveSecondary. Remonté ici (avant : dans SecondaryUsersSection) pour
  // que le switcher unifié du Header y ait accès, pas seulement l'écran réglages.
  useEffect(() => {
    let cancelled = false;
    const active = linkedAccounts.filter((l) => l.status === "active");
    if (!active.length) { setLinkedPoolsInfo([]); return; }
    Promise.all(active.map(async (l) => {
      try {
        const cfg = await FB.getConfig(l.primaryUid);
        const pool = (cfg?.pools || []).find((p) => p.id === l.poolId);
        return { ...l, poolName: pool?.name || "", poolPhoto: pool?.photo || null, pseudo: cfg?.pseudo || l.primaryEmail, ownerIsPremium: !!cfg?.isPremium };
      } catch (e) {
        return { ...l, poolName: "", pseudo: l.primaryEmail };
      }
    })).then((results) => { if (!cancelled) setLinkedPoolsInfo(results); });
    return () => { cancelled = true; };
  }, [linkedAccounts]);

  // Restaure le dernier contexte choisi (persistant entre sessions), une
  // seule fois par connexion — et seulement s'il correspond toujours à un
  // lien actif (au cas où l'accès aurait été révoqué entre-temps).
  useEffect(() => {
    if (!authUser?.uid || viewContextLoadedRef.current) return;
    viewContextLoadedRef.current = true;
    window.storage.get(STORAGE_KEYS.viewContext).then((res) => {
      if (!res?.value) return;
      try {
        const saved = JSON.parse(res.value);
        if (saved?.primaryUid) setViewContext(saved);
      } catch (e) {}
    }).catch(() => {});
  }, [authUser?.uid]);

  // Si le lien correspondant a été révoqué entre-temps, retombe sur "mes bassins".
  // v1.70.0 — Attend linkedAccountsLoaded : sinon le tableau vide de l'état
  // initial déclenchait ce fallback avant même que la vraie liste n'arrive.
  useEffect(() => {
    if (!viewContext || !linkedAccountsLoaded) return;
    if (!linkedAccounts.some((l) => l.primaryUid === viewContext.primaryUid && l.status === "active")) {
      setViewContext(null);
    }
  }, [linkedAccounts, linkedAccountsLoaded, viewContext]);

  function switchToContext(next) {
    setViewContext(next);
    window.storage.set(STORAGE_KEYS.viewContext, JSON.stringify(next || null)).catch(() => {});
  }

  // v1.60.0 — Demande de révocation de mon propre accès à un bassin invité
  // (je ne peux pas me révoquer moi-même). Envoie un email au propriétaire
  // avec un lien de confirmation — voir /request-revoke-own-access.
  async function handleRequestRevocation(primaryUid) {
    if (!authUser) throw new Error("not_signed_in");
    const idToken = await authUser.getIdToken();
    const res = await fetch(`${PROXY_BASE_URL}/request-revoke-own-access`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ primaryUid }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "request_failed");
    }
  }

  // uid dont les données (measures/applications/config) sont actuellement
  // affichées : le mien, ou celui du principal dont je consulte le bassin.
  const dataUid = viewContext ? viewContext.primaryUid : authUser?.uid;

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
  // v1.62.0 — Sous-page "Mes produits à acheter", accessible depuis l'onglet Produits.
  const [showProductsToBuy, setShowProductsToBuy] = useState(false);
  // v1.63.0 — Application manuelle d'un produit hors plan de traitement.
  const [showManualApply, setShowManualApply] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingMeasure, setEditingMeasure] = useState(null);
  // v1.66.0 — Application (traitement) associée à la mesure en cours
  // d'édition, pour permettre de modifier produit/quantité/heure en même
  // temps que la mesure depuis l'écran "Modifier" de l'historique.
  const [editingApplication, setEditingApplication] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  // v1.69.0 — Écran plein cadre joué à l'activation du Premium (effet
  // effervescent), avant que l'app ne se ré-affiche déjà débloquée.
  // v1.90.0 — L'activation réelle passe maintenant par Stripe Checkout
  // (redirection hors app) : ce reveal n'est plus déclenché directement
  // depuis onActivate, mais automatiquement dès que isPremium passe de
  // false à true pendant qu'on attend une confirmation (awaitingStripeActivation).
  // Idem pour la désactivation (variant "downgrade") : plus de confirmation
  // locale (PremiumDowngradeConfirmModal, abandonné — l'annulation réelle
  // se fait désormais dans le portail Stripe), le reveal se déclenche tout
  // seul dès que isPremium passe de true à false (webhook Stripe).
  const [showPremiumReveal, setShowPremiumReveal] = useState(false);
  const [revealVariant, setRevealVariant] = useState("activate");
  const [paywallSource, setPaywallSource] = useState(null);
  function openPaywall(source) {
    track("paywall_shown", { source: source || "unknown" });
    setPaywallSource(source || null);
    setShowPaywall(true);
  }

  // v1.90.0 — Phase C Stripe : démarrage du Checkout (mensuel/annuel) et
  // ouverture du portail de gestion d'abonnement. Les deux routes exigent
  // un ID token Firebase (Authorization: Bearer) et renvoient { url } vers
  // lequel on redirige la page entière (page Stripe hébergée, pas un modal).
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [portalBusy, setPortalBusy] = useState(false);
  const [portalError, setPortalError] = useState(null);
  const [awaitingStripeActivation, setAwaitingStripeActivation] = useState(false);
  const [stripeActivationTimedOut, setStripeActivationTimedOut] = useState(false);
  const awaitingStripeActivationRef = useRef(false);

  // v1.92.0 — Fix : si l'utilisateur fait "retour arrière" depuis la page
  // Stripe Checkout ou le portail Stripe, la plupart des navigateurs
  // restaurent la PWA depuis le bfcache (état JS gelé tel qu'avant la
  // redirection) plutôt que de recharger la page. checkoutBusy/portalBusy
  // restaient alors bloqués à true pour toujours (on ne les remettait jamais
  // à false avant la redirection, volontairement, puisque la page était
  // censée quitter l'app) — ce qui verrouillait le modal d'abonnement.
  // event.persisted === true est le signal fiable d'une restauration bfcache.
  useEffect(() => {
    function onPageShow(e) {
      if (e.persisted) {
        setCheckoutBusy(false);
        setPortalBusy(false);
      }
    }
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  // ── Retour de Stripe Checkout (?stripe=success|cancel) ──
  // v1.90.0 — success : on attend la confirmation isPremium (webhook Stripe
  // + snapshot Firestore) avant d'afficher le reveal, plutôt que de faire
  // confiance au seul retour de navigation (le paiement peut encore être
  // en cours de traitement côté Stripe/webhook à cet instant précis).
  // Fix : ces 2 effets référencent des states déclarés juste au-dessus —
  // ils doivent rester après cette déclaration (une 1ère version placée
  // plus haut dans le composant provoquait un ReferenceError/TDZ au chargement,
  // "Cannot access 'awaitingStripeActivation' before initialization").
  useEffect(() => {
    const stripeParam = new URLSearchParams(window.location.search).get("stripe");
    if (!stripeParam) return;
    if (stripeParam === "success") {
      awaitingStripeActivationRef.current = true;
      setAwaitingStripeActivation(true);
    } else if (stripeParam === "cancel") {
      track("upgrade_checkout_cancelled");
    }
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, "", cleanUrl);
  }, []);

  // Si la confirmation traîne (webhook lent), affiche un message après 15s
  // plutôt que de laisser l'écran d'attente tourner indéfiniment.
  useEffect(() => {
    if (!awaitingStripeActivation) { setStripeActivationTimedOut(false); return; }
    const id = setTimeout(() => setStripeActivationTimedOut(true), 15000);
    return () => clearTimeout(id);
  }, [awaitingStripeActivation]);

  async function handleStartCheckout(plan) {
    if (!authUser) return;
    setCheckoutError(null);
    setCheckoutBusy(true);
    track("upgrade_checkout_started", { plan });
    try {
      const idToken = await authUser.getIdToken();
      const res = await fetch(`${PROXY_BASE_URL}/stripe/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setCheckoutError(data.error || t("checkout_error"));
        setCheckoutBusy(false);
        return;
      }
      window.location.href = data.url;
      // Pas de setCheckoutBusy(false) ici : la page quitte l'app.
    } catch (e) {
      setCheckoutError(t("checkout_error"));
      setCheckoutBusy(false);
    }
  }

  async function handleOpenPortal() {
    if (!authUser) return;
    setPortalError(null);
    setPortalBusy(true);
    track("manage_subscription_opened");
    try {
      const idToken = await authUser.getIdToken();
      const res = await fetch(`${PROXY_BASE_URL}/stripe/create-portal-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setPortalError(data.error || t("portal_error"));
        setPortalBusy(false);
        return;
      }
      window.location.href = data.url;
    } catch (e) {
      setPortalError(t("portal_error"));
      setPortalBusy(false);
    }
  }
  const [showAddPool, setShowAddPool] = useState(false);
  const [lang, setLang] = useState("fr");
  const [isPremium, setIsPremium] = useState(false);
  const [myPseudo, setMyPseudo] = useState(""); // v1.55.0 — pseudo de mon compte (vide = fallback email)
  const [applications, setApplications] = useState([]);
  const [validatingMeasure, setValidatingMeasure] = useState(null);
  // v1.53.0 — Plan actif stocké par bassin (poolId -> plan), plus un objet
  // unique partagé entre tous les bassins. Avant ce fix, lancer un plan sur
  // le bassin B pendant qu'un plan était en cours sur le bassin A écrasait
  // silencieusement celui de A. `activePlan` et `setActivePlan` restent
  // utilisables partout ailleurs dans le fichier exactement comme avant
  // (dérivé/scopé sur activePoolId sous le capot) — aucun autre site d'appel
  // n'a besoin d'être modifié.
  const [activePlanByPool, setActivePlanByPool] = useState({});
  const activePlan = activePlanByPool[activePoolId] || null;
  function setActivePlan(value) {
    setActivePlanByPool((prev) => ({ ...prev, [activePoolId]: value }));
  }
  // v1.53.0 — Migration silencieuse ancien format (objet unique partagé
  // entre tous les bassins) -> nouvelle map { poolId: plan }. Range l'ancien
  // plan dans le bassin de la mesure qu'il concerne si elle existe encore,
  // sinon dans le bassin de repli fourni (mieux que le perdre silencieusement).
  function migrateActivePlan(raw, measuresList, fallbackPoolId) {
    if (!raw || typeof raw !== "object") return {};
    if (raw.measureId) {
      const owningMeasure = (measuresList || []).find((m) => m.id === raw.measureId);
      return { [owningMeasure?.poolId || fallbackPoolId || "default"]: raw };
    }
    return raw; // déjà au nouveau format (map)
  }
  const [showWizard, setShowWizard] = useState(false);
  const [showPhotoWarning, setShowPhotoWarning] = useState(false);
  const [photoWarningCallback, setPhotoWarningCallback] = useState(null);
  const [gdprConsent, setGdprConsent] = useState(false);
  const [dataConsent, setDataConsent] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [acceptedCguVersion, setAcceptedCguVersion] = useState(null);
  // v1.85.0 — Permet de consulter le texte complet des CGU directement depuis
  // l'écran de validation obligatoire (needsCguAcceptance), plutôt que de forcer
  // une acceptation sans possibilité de lecture.
  const [showFullCguInGate, setShowFullCguInGate] = useState(false);
  const [cguAcceptedDate, setCguAcceptedDate] = useState(null);
  // v1.83.0 — Dérivé (pas un flag manuel) : couvre à la fois "jamais accepté"
  // (comptes Google, cguVersion cloud absent) et "version dépassée" (re-acceptation).
  // Se recalcule automatiquement dès que acceptedCguVersion change (ex: rapatriement
  // cloud après connexion), contrairement à l'ancien setShowCguUpdate posé une seule fois.
  const detectedLang = (() => {
    const nav = (navigator.language || navigator.userLanguage || "fr").toLowerCase().slice(0, 2);
    return ["fr","en","de","it","es","pt"].includes(nav) ? nav : "fr";
  })();
  const [validatingSelectedRecs, setValidatingSelectedRecs] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [apiKey, setApiKey] = useState(PROXY_BASE_URL); // v1.89.0 — cohérent avec l'environnement dès le premier rendu
  const [apiProvider, setApiProvider] = useState("anthropic"); // "anthropic" | "openai"
  const [aiEnabled, setAiEnabled] = useState(false);
  // v1.36.0 — Lot B : opt-out de la contribution aux données de calibration
  // partagées (CGU clause 11). Activé par défaut — données anonymes, coût nul
  // pour l'utilisateur, cohérent avec le texte CGU ("peut désactiver").
  const [calibrationContribution, setCalibrationContribution] = useState(true);
  // v1.72.0 — Wizard d'accueil : affiché une seule fois après la création du
  // tout premier bassin d'un compte. onboardingSeen est synchronisé via
  // Firestore (comme calibrationContribution) pour ne pas le revoir en cas
  // de changement d'appareil.
  const [onboardingSeen, setOnboardingSeen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);
  // v1.77.0 — Écran d'attente affiché après clic sur "Mettre à jour" : au
  // lieu de recharger immédiatement (risque de tomber en plein milieu d'un
  // déploiement GitHub Pages pas encore propagé), on poll version.json
  // jusqu'à obtenir une valeur stable, puis seulement là on recharge.
  const [updating, setUpdating] = useState(false);
  const [suspended, setSuspended] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [erasingData, setErasingData] = useState(false);
  const t = useT(lang);

  const [authResolved, setAuthResolved] = useState(false);

  // ── Lightbox globale ──
  useEffect(() => {
    window._openLightbox = (src) => setLightboxSrc(src);
    return () => { delete window._openLightbox; };
  }, []);

  // ── Vérification de version — force la mise à jour si une nouvelle version est déployée ──
  useEffect(() => {
    let cancelled = false;
    async function checkVersion() {
      try {
        const res = await fetch(`version.json?t=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data?.version && data.version !== APP_VERSION) {
          setForceUpdate(true);
        }
      } catch (e) {
        // Erreur réseau : on ignore silencieusement, nouvelle tentative au prochain cycle
      }
    }
    checkVersion();
    const interval = setInterval(checkVersion, 5 * 60 * 1000);
    function onVisible() {
      if (document.visibilityState === "visible") checkVersion();
    }
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", checkVersion);
    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", checkVersion);
    };
  }, []);

  async function forceReloadApp() {
    try {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) await reg.unregister();
      }
      if (window.caches) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch (e) {}
    // Navigation vers une URL anti-cache (bypass du cache HTTP natif du navigateur,
    // en plus du nettoyage du Service Worker ci-dessus)
    const base = window.location.origin + window.location.pathname;
    window.location.href = `${base}?_r=${Date.now()}`;
  }

  // v1.77.0 — Poll version.json jusqu'à 2 lectures consécutives identiques
  // (déploiement stabilisé, plus en cours de propagation) avant de vraiment
  // recharger. Garde-fou à 45s : si ça ne se stabilise jamais (souci réseau
  // persistant), on recharge quand même plutôt que de bloquer l'utilisateur
  // indéfiniment sur l'écran d'attente.
  function startUpdatePolling() {
    setUpdating(true);
    const startedAt = Date.now();
    let lastVersion = null;
    let stableCount = 0;
    async function poll() {
      try {
        const res = await fetch(`version.json?t=${Date.now()}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data?.version && data.version === lastVersion) {
            stableCount += 1;
          } else {
            stableCount = 0;
            lastVersion = data?.version || null;
          }
          if (stableCount >= 2) {
            forceReloadApp();
            return;
          }
        }
      } catch (e) {
        // Erreur réseau : on continue simplement à réessayer.
      }
      if (Date.now() - startedAt > 45000) {
        forceReloadApp();
        return;
      }
      setTimeout(poll, 3000);
    }
    poll();
  }

  // ── Statut de suspension du compte — écoute temps réel ──
  useEffect(() => {
    if (!authUser?.uid) { setSuspended(false); setSuspendReason(""); return; }
    const unsub = FB.onSuspended(authUser.uid, (isSuspended, reason) => {
      setSuspended(isSuspended);
      setSuspendReason(reason || "");
    });
    return () => unsub();
  }, [authUser?.uid]);

  // ── Statut de suppression de compte (soft delete self-service) — écoute temps réel ──
  // Distinct de "suspended" (géré par l'admin) : ici c'est l'utilisateur lui-même qui a
  // demandé la suppression. Le compte Auth reste actif, seul ce flag bloque l'app.
  const [accountDeleted, setAccountDeleted] = useState(false);
  const [showDataRequestScreen, setShowDataRequestScreen] = useState(false);
  useEffect(() => {
    if (!authUser?.uid) { setAccountDeleted(false); setShowDataRequestScreen(false); return; }
    const unsub = FB.onAccountDeleted(authUser.uid, (isDeleted) => {
      setAccountDeleted(isDeleted);
    });
    return () => unsub();
  }, [authUser?.uid]);

  // Efface toutes les données Firestore du compte (users doc + mesures + applications +
  // diagnostics + config) — utilisée par le flux "compte suspendu" et par la suppression
  // de compte classique, qui ne supprimait jusqu'ici que le document racine.
  async function eraseAllUserData(uid) {
    if (!uid || !window._fbDb) return;
    const [ms, apps, diags, photos] = await Promise.all([
      FB.getMeasures(uid).catch(() => []),
      FB.getApplications(uid).catch(() => []),
      FB.getDiagnostics(uid).catch(() => []),
      FB.getProductPhotos(uid).catch(() => ({})),
    ]);
    await Promise.all([
      ...ms.map((m) => FB.deleteMeasure(uid, m.id).catch(() => {})),
      ...apps.map((a) => FB.deleteApplication(uid, a.measureId).catch(() => {})),
      ...diags.map((d) => FB.deleteDiagnostic(uid, d.id).catch(() => {})),
      ...Object.keys(photos).map((id) => FB.deleteProductPhoto(uid, id).catch(() => {})),
    ]);
    if (window._fbDoc && window._fbDeleteDoc) {
      await window._fbDeleteDoc(window._fbDoc(window._fbDb, "users", uid, "config", "main")).catch(() => {});
      await window._fbDeleteDoc(window._fbDoc(window._fbDb, "users", uid)).catch(() => {});
    }
  }

  // Efface le stockage local (IndexedDB) et remet le state React en mémoire à un
  // état sûr par défaut, pour qu'aucune donnée du compte supprimé ne subsiste
  // localement sur cet appareil (ni visible furtivement, ni ré-uploadée par erreur
  // vers un futur compte via la migration one-shot au premier login).
  async function resetLocalAppState() {
    const blankKeys = [
      [STORAGE_KEYS.measures, "[]"],
      [STORAGE_KEYS.products, "[]"],
      [STORAGE_KEYS.settings, "{}"],
      [STORAGE_KEYS.premium, "false"],
      [STORAGE_KEYS.pools, "[]"],
      [STORAGE_KEYS.activePool, JSON.stringify("default")],
      [STORAGE_KEYS.applications, "[]"],
      [STORAGE_KEYS.apiKey, JSON.stringify("")],
      [STORAGE_KEYS.aiEnabled, "false"],
      [STORAGE_KEYS.activePlan, ""],
      [STORAGE_KEYS.gdprConsent, "false"],
      [STORAGE_KEYS.dataConsent, "false"],
      [STORAGE_KEYS.cguVersion, ""],
      [STORAGE_KEYS.cguAcceptedDate, ""],
      [STORAGE_KEYS.viewContext, "null"],
    ];
    await Promise.all(
      blankKeys.map(([key, value]) => window.storage.set(key, value).catch(() => {}))
    );

    // Réinitialise le state React en mémoire (mêmes valeurs par défaut qu'au premier
    // montage de l'app, pour ne rien casser côté rendu pendant que showLogin masque tout)
    setMeasures([]);
    setProducts(DEFAULT_PRODUCTS.map((p) => ({ ...p, poolId: "default" })));
    setPools([{ id: "default", name: "Ma piscine", location: "Valbonne (06)", volume: 72, treatmentType: "chlore", filtration: "sable" }]);
    setActivePoolId("default");
    setApplications([]);
    setActivePlanByPool({});
    setIsPremium(false);
    setAiEnabled(false);
    setGdprConsent(false);
    setDataConsent(false);
    setAcceptedCguVersion(null);
    setCguAcceptedDate(null);
    // v1.55.0 — évite qu'un contexte secondaire reste affiché pour le
    // prochain compte connecté sur le même appareil.
    setViewContext(null);
    setLinkedAccounts([]);
    setMyPseudo("");
    viewContextLoadedRef.current = false;
  }

  // v1.28.0 — Soft delete : ne supprime plus les données Firestore ni le compte
  // Auth. Marque juste le compte comme supprimé (accountDeletions/{uid}), ce qui
  // bloque l'accès applicatif via l'écran "Compte supprimé". Les données restent
  // en base jusqu'à purge manuelle (ex. réponse à une demande RGPD).
  // v1.28.1 — Fix : un syncConfig en attente (debounce 800ms) capture l'uid au
  // moment de l'appel. S'il se déclenche après signOut(), l'écriture Firestore
  // échoue (permission refusée) et l'erreur apparaît sur l'écran de connexion,
  // juste après la suppression — trompeur, alors que la suppression a réussi.
  // On annule tout debounce en attente avant de se déconnecter.
  // v1.29.2 — Fix : la règle Firestore n'autorisait la transition deleted que
  // dans un sens (true→false, pour la réactivation). Une suppression après une
  // réactivation était donc une transition false→true, rejetée par Firestore.
  // L'erreur était avalée (.catch(() => {})) : l'app déconnectait quand même,
  // donnant l'illusion d'une suppression alors que le flag n'était jamais posé.
  // Maintenant : si l'écriture échoue, on arrête tout AVANT de déconnecter, et
  // l'erreur remonte à l'appelant (alerte ou écran de réauthentification).
  async function performDeleteAccount() {
    const uid = authUser?.uid;
    if (!uid) return;
    try {
      await FB.markAccountDeleted(uid);
    } catch (e) {
      throw new Error(t("account_delete_flag_error") + (e?.message ? " (" + e.message + ")" : ""));
    }
    teardownRef.current = true;
    if (syncDebounceRef.current) { clearTimeout(syncDebounceRef.current); syncDebounceRef.current = null; }
    syncPendingRef.current = {};
    await resetLocalAppState();
    try { await FB.signOut?.(); } catch (e) {}
    window.storage.set("auth_skipped", "").catch(() => {});
    setAuthUser(null);
    setShowLogin(true);
  }

  // v1.29 — "Recommencer avec cette adresse" depuis l'écran "Compte supprimé".
  // Ne touche jamais aux anciennes données : désactive tous les bassins existants
  // (même mécanisme que deletePool, sans confirmation individuelle) pour que
  // l'écran forcé "créer un bassin" prenne le relais, remet isPremium/activePlan
  // à zéro, puis lève le flag de suppression. L'historique reste en base, invisible.
  const [reactivating, setReactivating] = useState(false);
  async function reactivateAccount() {
    const uid = authUser?.uid;
    if (!uid) return;
    setReactivating(true);
    try {
      const resetPools = pools.map((p) =>
        p.disabled ? p : { ...p, disabled: true, disabledAt: new Date().toISOString() }
      );
      setPools(resetPools);
      setActivePoolId("");
      setIsPremium(false);
      setActivePlanByPool({});
      await FB.saveConfig(uid, { pools: resetPools, isPremium: false, activePlan: {} });
      await FB.reactivateAccount(uid);
    } catch (e) {
      alert(e.message);
    } finally {
      setReactivating(false);
    }
  }

  // v1.29.5 — Factorisée pour être réutilisable depuis l'écran "Compte supprimé"
  // ("Revenir à la page d'accueil"), en plus du bouton Se déconnecter classique.
  async function handleSignOut() {
    teardownRef.current = true;
    if (syncDebounceRef.current) { clearTimeout(syncDebounceRef.current); syncDebounceRef.current = null; }
    syncPendingRef.current = {};
    await FB.signOut().catch(() => {});
    await resetLocalAppState();
    window.storage.set("auth_skipped", "").catch(() => {});
    setAuthUser(null);
    setShowLogin(true);
  }

  async function handleEraseSuspendedData() {
    if (!authUser?.uid) return;
    const ok = window.confirm(t("suspended_erase_confirm"));
    if (!ok) return;
    setErasingData(true);
    try {
      teardownRef.current = true;
      if (syncDebounceRef.current) { clearTimeout(syncDebounceRef.current); syncDebounceRef.current = null; }
      syncPendingRef.current = {};
      await eraseAllUserData(authUser.uid);
      await resetLocalAppState();
      window.storage.set("auth_skipped", "").catch(() => {});
      try { await FB.signOut?.(); } catch (e) {}
      setAuthUser(null);
      setSuspended(false);
      setShowLogin(true);
    } catch (e) {
      alert(e.message || t("import_pdf_error"));
    } finally {
      setErasingData(false);
    }
  }


  // Helper pour sauvegarder la config dans Firestore, avec debounce.
  // Fix v1.27.4 : plusieurs useEffect indépendants (pools, activePlan, isPremium,
  // lang, aiEnabled, apiProvider) appellent syncConfig séparément. Quand deux
  // appareils sont ouverts en même temps, chaque écho Firestore reçu par l'un
  // peut redéclencher une réécriture quasi immédiate — l'ancien fix deepEqual
  // (v1.27.2) réduisait mais n'éliminait pas ces rafales. Le debounce regroupe
  // les changements survenant dans une fenêtre de 800ms en un seul appel réseau,
  // et absorbe le ping-pong au lieu de le laisser consommer le quota Firestore.
  // L'erreur est désormais remontée (alert) au lieu d'être avalée en silence.
  // Fix v1.29.1 : resetLocalAppState() remet pools/products/activePlan à leurs
  // valeurs par défaut AVANT signOut() (suppression de compte, effacement RGPD).
  // Ces changements d'état déclenchent les useEffect de synchro alors qu'authUser
  // est encore renseigné, programmant une écriture qui échoue 800ms plus tard,
  // une fois la session coupée — d'où l'alerte "Missing or insufficient
  // permissions" sur l'écran de connexion. teardownRef bloque toute nouvelle
  // programmation dès le début d'une séquence de sortie (déconnexion,
  // suppression de compte, effacement RGPD), quelle que soit la source du
  // changement d'état qui suit.
  const syncDebounceRef = useRef(null);
  const syncPendingRef = useRef({});
  const teardownRef = useRef(false);
  // v1.30.0 — Suivi des photos produits déjà envoyées/confirmées dans la
  // collection productPhotos, pour ne jamais ré-uploader une photo inchangée
  // et pour savoir quand il est sûr de retirer le champ photo inline de
  // config/main (uniquement une fois l'upload confirmé par l'écho Firestore).
  const lastSyncedPhotosRef = useRef({});
  const productPhotosRef = useRef({});
  const [photoMapVersion, setPhotoMapVersion] = useState(0);
  // v1.55.0 — Écriture séparée pour les réglages de compte (isPremium, lang,
  // aiEnabled, calibrationContribution, apiProvider) : ces champs restent
  // TOUJOURS ceux de mon propre compte, même quand je consulte le bassin
  // d'un principal (dataUid ≠ authUser.uid). Debounce indépendant de
  // syncConfig ci-dessous, qui lui cible dataUid.
  const ownSyncDebounceRef = useRef(null);
  const ownSyncPendingRef = useRef({});
  function syncOwnConfig(partial, errorKey) {
    if (!authUser?.uid || !FB.ready() || teardownRef.current) return;
    ownSyncPendingRef.current = { ...ownSyncPendingRef.current, ...partial };
    if (ownSyncDebounceRef.current) clearTimeout(ownSyncDebounceRef.current);
    ownSyncDebounceRef.current = setTimeout(() => {
      const toSend = ownSyncPendingRef.current;
      ownSyncPendingRef.current = {};
      ownSyncDebounceRef.current = null;
      FB.saveConfig(authUser.uid, toSend).catch((e) => {
        const msg = errorKey
          ? t(errorKey) + (e?.message ? " (" + e.message + ")" : "")
          : t("config_sync_error").replace("{detail}", e?.message || "?");
        alert(msg);
      });
    }, 800);
  }

  // v1.55.0 — Écoute toujours mon propre compte (jamais dataUid) pour ces
  // 4 réglages personnels, indépendamment du contexte affiché.
  useEffect(() => {
    if (!authUser?.uid || !FB.ready()) return;
    const unsub = FB.onConfig(authUser.uid, (config) => {
      if (config.isPremium !== undefined) {
        setIsPremium((prev) => (prev === config.isPremium ? prev : config.isPremium));
        window.storage.set(STORAGE_KEYS.premium, JSON.stringify(config.isPremium)).catch(() => {});
      }
      if (config.lang) {
        setLang((prev) => (prev === config.lang ? prev : config.lang));
        window.storage.set("app_lang", JSON.stringify(config.lang)).catch(() => {});
      }
      if (config.aiEnabled !== undefined) {
        setAiEnabled((prev) => (prev === config.aiEnabled ? prev : config.aiEnabled));
      }
      if (config.calibrationContribution !== undefined) {
        setCalibrationContribution((prev) => (prev === config.calibrationContribution ? prev : config.calibrationContribution));
      }
      if (config.onboardingSeen !== undefined) {
        setOnboardingSeen((prev) => (prev === config.onboardingSeen ? prev : config.onboardingSeen));
      }
      if (config.pseudo !== undefined) {
        setMyPseudo((prev) => (prev === config.pseudo ? prev : (config.pseudo || "")));
      }
      // v1.57.4 — Capture aussi mes propres bassins ici, indépendamment du
      // contexte affiché (dataUid peut pointer sur un principal). Sert
      // uniquement au switcher unifié (mes bassins + bassins invités) — la
      // source de vérité pour le bassin actif reste `pools`/`activePools`.
      if (config.pools !== undefined) {
        const myOwn = (config.pools || []).filter((p) => !p.disabled);
        setOwnPools((prev) => (deepEqual(prev, myOwn) ? prev : myOwn));
      }
    });
    return () => unsub();
  }, [authUser?.uid]);

  // v1.90.0 — Déclenche le reveal plein écran directement à partir des
  // vraies transitions isPremium (webhook Stripe → Firestore → ce
  // snapshot), plutôt que depuis un clic local : l'activation comme la
  // désactivation se décident maintenant côté Stripe (Checkout, portail),
  // hors de l'app. "activate" ne se joue que si on l'attendait vraiment
  // (retour de Checkout, awaitingStripeActivationRef) pour ne pas se
  // déclencher sur un simple rechargement d'un compte déjà premium.
  const prevIsPremiumRef = useRef(isPremium);
  useEffect(() => {
    const prev = prevIsPremiumRef.current;
    if (prev === false && isPremium === true && awaitingStripeActivationRef.current) {
      awaitingStripeActivationRef.current = false;
      setAwaitingStripeActivation(false);
      setRevealVariant("activate");
      setShowPremiumReveal(true);
      track("upgrade_activated", { via: "stripe" });
      setApiKey(PROXY_BASE_URL); // v1.89.0 — suit l'environnement courant, pas figé sur PROD.
      // v1.91.0 — À chaque activation premium confirmée par Stripe, l'analyse
      // IA est réactivée par défaut (même logique que manageStock ci-dessous).
      // Choix assumé : un downgrade puis un re-upgrade repasse aiEnabled à
      // true, sans mémoriser un choix de désactivation antérieur.
      setAiEnabled(true);
      // v1.29.7 — À l'activation, la gestion de stock s'active par défaut sur le
      // bassin actif ; on garde les produits (nom, dosage) mais on remet leur
      // pourcentage de stock à 0 pour forcer une saisie réelle.
      if (activePool) {
        updatePool(activePool.id, { manageStock: true });
        setProducts((prevProducts) =>
          prevProducts.map((p) =>
            (p.poolId || "default") === activePool.id ? { ...p, stockPercent: 0 } : p
          )
        );
      }
    } else if (prev === true && isPremium === false) {
      setRevealVariant("downgrade");
      setShowPremiumReveal(true);
      track("premium_deactivated", { via: "stripe" });
    }
    prevIsPremiumRef.current = isPremium;
  }, [isPremium]);

  function syncConfig(partial, errorKey) {
    if (!dataUid || !FB.ready() || teardownRef.current) return;
    syncPendingRef.current = { ...syncPendingRef.current, ...partial };
    if (syncDebounceRef.current) clearTimeout(syncDebounceRef.current);
    syncDebounceRef.current = setTimeout(() => {
      const toSend = syncPendingRef.current;
      syncPendingRef.current = {};
      syncDebounceRef.current = null;
      FB.saveConfig(dataUid, toSend).catch((e) => {
        const msg = errorKey
          ? t(errorKey) + (e?.message ? " (" + e.message + ")" : "")
          : t("config_sync_error").replace("{detail}", e?.message || "?");
        alert(msg);
      });
    }, 800);
  }

  // ── Synchro Firestore temps réel ──
  // Quand l'utilisateur est connecté, on s'abonne aux collections measures et applications.
  // Les données cloud écrasent les données locales (last-write-wins).
  // v1.55.0 — Ciblée sur dataUid (mon compte, ou celui du principal dont je
  // consulte le bassin) plutôt que systématiquement authUser.uid. isPremium/
  // lang/aiEnabled/calibrationContribution ne sont PLUS gérés ici : voir
  // l'effet accountSettingsSync ci-dessus, toujours sur mon propre compte.
  const firestoreUnsubRef = useRef(null);
  const cloudConfigReceivedRef = useRef(false);
  const [cloudConfigReceived, setCloudConfigReceived] = useState(false);
  // v1.70.0 — "Bassin introuvable" (contexte secondaire) : deux signaux
  // combinés plutôt qu'un seul. poolAccessError se pose immédiatement si
  // Firestore renvoie explicitement permission-denied (accès révoqué de
  // façon certaine). secondaryLoadTimeout ne se déclenche qu'après 5s sans
  // nouvelle ni confirmation ni infirmation (latence réseau, bassin
  // supprimé) — le temps normal de charger reste juste un spinner.
  const [poolAccessError, setPoolAccessError] = useState(null);
  const [secondaryLoadTimeout, setSecondaryLoadTimeout] = useState(false);
  useEffect(() => {
    if (!dataUid || !FB.ready() || !window._fbOnSnapshot) return;
    const uid = dataUid;
    // v1.57.8 — Restreint measures/applications au bon poolId en contexte
    // secondaire (cf. isActiveSecondaryForPool dans les règles) : sans ce
    // filtre, Firestore refuse la liste entière en permission-denied dès
    // qu'un seul document historique du principal appartient à un autre
    // bassin que celui assigné à l'invitation.
    const scopedPoolId = viewContext ? viewContext.poolId : null;
    cloudConfigReceivedRef.current = false;
    setCloudConfigReceived(false);
    setPoolAccessError(null);
    setSecondaryLoadTimeout(false);

    // Nettoyage abonnements précédents
    if (firestoreUnsubRef.current) {
      firestoreUnsubRef.current.forEach(fn => fn());
    }

    const unsubMeasures = FB.onMeasures(uid, (cloudMeasures) => {
      if (cloudMeasures.length > 0) {
        setMeasures((prev) => (deepEqual(prev, cloudMeasures) ? prev : cloudMeasures));
        window.storage.set(STORAGE_KEYS.measures, JSON.stringify(cloudMeasures)).catch(() => {});
      }
    }, scopedPoolId);

    const unsubApplications = FB.onApplications(uid, (cloudApps) => {
      if (cloudApps.length > 0) {
        setApplications((prev) => (deepEqual(prev, cloudApps) ? prev : cloudApps));
        window.storage.set(STORAGE_KEYS.applications, JSON.stringify(cloudApps)).catch(() => {});
      }
    }, scopedPoolId);

    const unsubConfig = FB.onConfig(uid, (config) => {
      cloudConfigReceivedRef.current = true;
      setCloudConfigReceived(true);
      // IMPORTANT : ne remplacer le state local que si le contenu a réellement changé.
      // Sinon setPools/setProducts créent une nouvelle référence de tableau à chaque
      // snapshot reçu (même si les données sont identiques), ce qui redéclenche les
      // useEffect de synchro config → Firestore (lignes ~5250+), qui réécrivent la
      // même donnée sur Firestore, qui redéclenche onSnapshot sur les autres appareils
      // connectés, etc. → boucle d'écritures en ping-pong entre appareils, source du
      // dépassement de quota Firestore constaté en session (v1.27.2).
      if (config.pools?.length) {
        setPools((prev) => (deepEqual(prev, config.pools) ? prev : config.pools));
        window.storage.set(STORAGE_KEYS.pools, JSON.stringify(config.pools)).catch(() => {});
      }
      if (config.products?.length) {
        const merged = mergeProductPhotos(config.products, productPhotosRef.current);
        setProducts((prev) => (deepEqual(prev, merged) ? prev : merged));
        window.storage.set(STORAGE_KEYS.products, JSON.stringify(merged)).catch(() => {});
      }
      if (config.activePlan !== undefined && config.activePlan !== null) {
        const migrated = migrateActivePlan(config.activePlan, measures, activePoolId);
        setActivePlanByPool((prev) => (deepEqual(prev, migrated) ? prev : migrated));
        window.storage.set(STORAGE_KEYS.activePlan, JSON.stringify(migrated)).catch(() => {});
      }
      // v1.55.0 — isPremium/lang/aiEnabled/calibrationContribution/pseudo : gérés
      // par l'effet accountSettingsSync (toujours mon propre compte), plus ici.
      // v1.53.0 — apiProvider n'est plus lu depuis Firestore : valeur fixe
      // "anthropic" imposée au chargement (voir plus bas), jamais un réglage
      // synchronisé entre appareils.
    }, (err) => {
      // v1.70.0 — permission-denied confirme sans ambiguïté un accès révoqué
      // (cf. règle users/{uid}/config/main : lecture conditionnée à
      // isActiveSecondary). Affiché immédiatement, sans attendre le timeout.
      if (viewContext && err?.code === "permission-denied") {
        setPoolAccessError("denied");
      }
    });

    // v1.30.0 — Écoute temps réel de productPhotos. Alimente productPhotosRef
    // (consommé par le merge ci-dessus et par l'effet de synchro config→cloud)
    // et réattache les photos aux produits déjà en state, pour les autres
    // appareils connectés au même compte.
    const unsubProductPhotos = FB.onProductPhotos(uid, (photosMap) => {
      productPhotosRef.current = photosMap;
      Object.keys(photosMap).forEach((id) => { lastSyncedPhotosRef.current[id] = photosMap[id]; });
      setPhotoMapVersion((v) => v + 1);
      setProducts((prev) => {
        const merged = mergeProductPhotos(prev, photosMap);
        return deepEqual(prev, merged) ? prev : merged;
      });
    });

    firestoreUnsubRef.current = [unsubMeasures, unsubApplications, unsubConfig, unsubProductPhotos];
    return () => {
      unsubMeasures();
      unsubApplications();
      unsubConfig();
      unsubProductPhotos();
    };
  }, [dataUid, viewContext?.poolId]);

  // v1.70.0 — Filet de sécurité pour le contexte secondaire : si après 5s le
  // bassin n'est toujours ni confirmé (cloudConfigReceived) ni explicitement
  // refusé (poolAccessError), on cesse de considérer ça comme un simple
  // temps de chargement — l'écran "Bassin introuvable" prend le relais avec
  // un message générique (bassin supprimé, ou souci réseau persistant).
  useEffect(() => {
    if (!viewContext || cloudConfigReceived || poolAccessError) return;
    const timer = setTimeout(() => setSecondaryLoadTimeout(true), 5000);
    return () => clearTimeout(timer);
  }, [viewContext, cloudConfigReceived, poolAccessError]);

  // --- Firebase Auth ---
  useEffect(() => {
    if (!FB.ready()) { setAuthUser(null); setAuthResolved(true); return; }
    const redirectPending = !!window._fbRedirectUser;
    let resolved = false;

    const unsub = FB.onAuth(async (user) => {
      if (user) {
        teardownRef.current = false;
        // Détection de changement d'utilisateur sur cet appareil : si un compte
        // différent a été utilisé avant (même sans déconnexion explicite), on
        // nettoie tout AVANT de charger/synchroniser quoi que ce soit, pour ne
        // jamais laisser les données d'un utilisateur visibles par un autre.
        try {
          const lastUidEntry = await window.storage.get(STORAGE_KEYS.lastUid);
          const lastUid = lastUidEntry?.value ? JSON.parse(lastUidEntry.value) : null;
          if (lastUid && lastUid !== user.uid) {
            await resetLocalAppState();
          }
          window.storage.set(STORAGE_KEYS.lastUid, JSON.stringify(user.uid)).catch(() => {});
        } catch (e) {}

        setAuthUser(user);
        setShowLogin(false);
        window.storage.set("auth_skipped", "true").catch(() => {});
        try { window._fbSetUserId && window._fbSetUserId(user.uid); } catch (e) {}
        track("login", { method: user.providerData?.[0]?.providerId || "unknown" });
        try {
          const data = await FB.getUser(user.uid);
          if (data?.isPremium !== undefined) setIsPremium(data.isPremium);
          // v1.83.0 — Le cloud (Firestore users/{uid}) fait foi pour l'acceptation
          // CGU, plus le cache local seul : un compte Google n'a jamais eu ce champ
          // écrit (handleGoogle ne collecte aucun consentement) et un compte email
          // sur un nouvel appareil n'a pas encore ce champ en cache local. Sans ce
          // rapatriement, acceptedCguVersion reste indéfiniment null/périmé et
          // l'écran de validation ne se déclenche jamais pour ces cas.
          setAcceptedCguVersion(data?.cguVersion || null);
          setCguAcceptedDate(data?.cguAcceptedDate || null);
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
      // auth_skipped désactivé — connexion obligatoire
      if (!window._fbAuth?.currentUser) setShowLogin(true);
    } else {
      setShowLogin(false);
    }
  }, [loaded, authResolved, authUser]);

  // Réinitialise le statut de vérification email "rafraîchi" à chaque changement d'utilisateur
  useEffect(() => {
    setEmailVerifiedNow(null);
    setVerifyCheckFailed(false);
    setVerifyResendStatus(null);
  }, [authUser?.uid]);

  const isGoogleUser = !!authUser?.providerData?.some((p) => p.providerId === "google.com");
  const needsEmailVerification =
    !!authUser && !isGoogleUser &&
    (emailVerifiedNow !== null ? !emailVerifiedNow : authUser.emailVerified === false);
  // v1.83.0 — Couvre le compte jamais passé par l'acceptation CGU (acceptedCguVersion
  // null — cas Google, cf. handleGoogle qui ne collecte aucun consentement) ET le
  // compte dont la version acceptée est dépassée (re-acceptation après mise à jour).
  const cguNeverAccepted = !!authUser && !acceptedCguVersion;
  const needsCguAcceptance =
    !!authUser && (cguNeverAccepted || acceptedCguVersion < CGU_VERSION);

  async function handleCheckEmailVerified() {
    if (!window._fbAuth?.currentUser) return;
    setVerifyChecking(true);
    setVerifyCheckFailed(false);
    try {
      await window._fbAuth.currentUser.reload();
      const nowVerified = !!window._fbAuth.currentUser.emailVerified;
      setEmailVerifiedNow(nowVerified);
      if (!nowVerified) setVerifyCheckFailed(true);
    } catch (e) {
      setVerifyCheckFailed(true);
    } finally {
      setVerifyChecking(false);
    }
  }

  async function handleResendVerification() {
    if (!authUser) return;
    setVerifySending(true);
    setVerifyResendStatus(null);
    try {
      await FB.sendVerification(authUser);
      setVerifyResendStatus("sent");
    } catch (e) {
      setVerifyResendStatus("error");
    } finally {
      setVerifySending(false);
    }
  }

  async function handleSignOutFromVerification() {
    try { await FB.signOut(); } catch (e) {}
    window.storage.set("auth_skipped", "").catch(() => {});
    setAuthUser(null);
    setShowLogin(true);
  }

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
        // Migration depuis l'ancien format mono-bassin — uniquement si de vraies
        // données legacy existent (sinon c'est un utilisateur réellement nouveau,
        // qui ne doit hériter d'aucun bassin/produit par défaut).
        let legacySettings = null;
        try {
          const s = await window.storage.get(STORAGE_KEYS.settings);
          if (s?.value) legacySettings = JSON.parse(s.value);
        } catch (e) {}

        const hasLegacyData = !!legacySettings || loadedMeasures.length > 0 || (loadedProducts && loadedProducts.length > 0);

        if (hasLegacyData) {
          loadedPools = [
            {
              id: "default",
              name: legacySettings?.poolName || "Ma piscine",
              location: legacySettings?.location || "",
              volume: legacySettings?.volume || 50,
            },
          ];
          // Les mesures/produits existants n'avaient pas de poolId : on les rattache au bassin par défaut
          loadedMeasures = loadedMeasures.map((m) => (m.poolId ? m : { ...m, poolId: "default" }));
        } else {
          // Nouvel utilisateur : aucun bassin par défaut
          loadedPools = [];
        }
      }
      // Migration : ajoute treatmentType/filtration aux anciens bassins qui n'en ont pas
      loadedPools = loadedPools.map((p) => ({
        treatmentType: "chlore",
        filtration: "sable",
        manageStock: false,
        ...p,
      }));
      setPools(loadedPools);

      let loadedActiveId = loadedPools[0]?.id || "";
      try {
        const ap = await window.storage.get(STORAGE_KEYS.activePool);
        if (ap?.value) {
          const parsedId = JSON.parse(ap.value);
          if (loadedPools.find((pl) => pl.id === parsedId)) loadedActiveId = parsedId;
        }
      } catch (e) {}
      setActivePoolId(loadedActiveId);

      setMeasures(loadedMeasures);
      // Upload des mesures locales vers Firestore si l'utilisateur est connecté
      if (authUser?.uid && loadedMeasures.length > 0) {
        loadedMeasures.forEach(m => saveMeasureWithThumbnail(authUser.uid, m));
      }
      if (loadedProducts) {
        // Anciens produits sans poolId (avant la saisie par bassin) : rattachés au bassin actif
        loadedProducts = loadedProducts.map((p) =>
          p.poolId ? p : { ...p, poolId: loadedActiveId }
        );
        setProducts(loadedProducts);
      } else if (loadedPools.length === 0) {
        // Nouvel utilisateur : aucun produit/stock par défaut
        setProducts([]);
      }

      try {
        const pl2 = await window.storage.get(STORAGE_KEYS.activePlan);
        if (pl2?.value) {
          try { setActivePlanByPool(migrateActivePlan(JSON.parse(pl2.value), loadedMeasures, loadedActiveId)); } catch(e){}
        }
        const gc = await window.storage.get(STORAGE_KEYS.gdprConsent);
        if (gc?.value === "true") setGdprConsent(true);
        const dc = await window.storage.get(STORAGE_KEYS.dataConsent);
        if (dc?.value === "true") setDataConsent(true);
        const cv = await window.storage.get(STORAGE_KEYS.cguVersion);
        if (cv?.value) setAcceptedCguVersion(cv.value);
        const cd = await window.storage.get(STORAGE_KEYS.cguAcceptedDate);
        if (cd?.value) setCguAcceptedDate(cd.value);
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
        // v1.89.0 — Fix : forçait PROD sur les 3 environnements. Force
        // maintenant l'URL officielle DE L'ENVIRONNEMENT COURANT (ignore
        // toujours toute valeur stockée en IndexedDB, même logique qu'avant).
        setApiKey(PROXY_BASE_URL);
        window.storage.set(STORAGE_KEYS.apiKey, JSON.stringify(PROXY_BASE_URL)).catch(() => {});
        const aie = await window.storage.get(STORAGE_KEYS.aiEnabled);
        if (aie?.value === "true") setAiEnabled(true);
      } catch (e) {}
      try {
        // v1.53.0 — apiProvider n'est plus un choix utilisateur (voir
        // nettoyage Réglages IA du 260706) : toujours "anthropic", ignore
        // toute ancienne valeur "openai" stockée avant ce nettoyage — sinon
        // enableWebSearch resterait désactivé à tort pour ces comptes
        // (callAIWithImage ne branche plus du tout sur "openai" désormais,
        // mais analyzeProductPhoto calcule encore enableWebSearch à partir
        // de cette valeur).
        setApiProvider("anthropic");
        window.storage.set(STORAGE_KEYS.apiProvider, JSON.stringify("anthropic")).catch(() => {});
      } catch (e) {}
      setLoaded(true);
      // Envoie la version comme propriété utilisateur Analytics
      try { window._fbSetUserProperty?.("app_version", APP_VERSION); } catch(e) {}
      track("app_open", { version: APP_VERSION });
      // Upload config initiale vers Firestore (migration one-shot)
      if (authUser?.uid) {
        FB.getConfig(authUser.uid).then(cloudConfig => {
          // N'upload que si pas encore de config cloud
          if (!cloudConfig) {
            // v1.30.0 — Photos exclues de ce premier envoi : elles seront
            // uploadées séparément vers productPhotos par l'effet de synchro
            // dédié, dès que products/loaded sont en state. Évite de recréer
            // un config/main trop volumineux si des photos locales existent
            // déjà avant la toute première connexion cloud.
            FB.saveConfig(authUser.uid, {
              pools: loadedPools,
              products: (loadedProducts || []).map((p) => {
                const { photo, ...rest } = p;
                return { ...rest, hasPhoto: !!photo };
              }),
            }).catch(() => {});
          }
        }).catch(() => {});
      }
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
    window.storage.set(STORAGE_KEYS.activePlan, JSON.stringify(activePlanByPool)).catch(() => {});
  }, [activePlanByPool, loaded]);

  useEffect(() => {
    if (!loaded) return;
    window.storage.set(STORAGE_KEYS.gdprConsent, String(gdprConsent)).catch(() => {});
  }, [gdprConsent, loaded]);

  useEffect(() => {
    if (!loaded) return;
    window.storage.set(STORAGE_KEYS.dataConsent, String(dataConsent)).catch(() => {});
  }, [dataConsent, loaded]);

  useEffect(() => {
    if (!loaded || !acceptedCguVersion) return;
    window.storage.set(STORAGE_KEYS.cguVersion, acceptedCguVersion).catch(() => {});
  }, [acceptedCguVersion, loaded]);

  useEffect(() => {
    if (!loaded || !cguAcceptedDate) return;
    window.storage.set(STORAGE_KEYS.cguAcceptedDate, cguAcceptedDate).catch(() => {});
  }, [cguAcceptedDate, loaded]);

  useEffect(() => {
    if (!loaded) return;
    window.storage.set(STORAGE_KEYS.apiKey, JSON.stringify(apiKey)).catch(() => {});
  }, [apiKey, loaded]);

  useEffect(() => {
    if (!loaded) return;
    window.storage.set(STORAGE_KEYS.apiProvider, JSON.stringify(apiProvider)).catch(() => {});
  }, [apiProvider, loaded]);

  useEffect(() => {
    if (!loaded) return;
    window.storage.set(STORAGE_KEYS.aiEnabled, String(aiEnabled)).catch(() => {});
  }, [aiEnabled, loaded]);

  // Bassins non désactivés — utilisé pour l'affichage (switcher, réglages, écran
  // "créer un bassin"). Le tableau brut `pools` (avec les désactivés) reste la
  // source de vérité pour la synchro Firestore et la détection d'orphelins.
  const activePools = useMemo(() => {
    const base = pools.filter((p) => !p.disabled);
    // v1.55.0 — En contexte secondaire, je ne vois que le bassin qui m'a été
    // confié dans l'invitation, même si techniquement je pourrais lire tous
    // les bassins du principal (règle Firestore large sur config/main).
    if (viewContext) return base.filter((p) => p.id === viewContext.poolId);
    return base;
  }, [pools, viewContext]);

  // Force le bassin actif sur celui assigné dès qu'un contexte secondaire est actif.
  useEffect(() => {
    if (viewContext && activePoolId !== viewContext.poolId) {
      setActivePoolId(viewContext.poolId);
    }
  }, [viewContext, activePoolId]);

  // v1.59.5 — Filet de sécurité : en contexte propriétaire (pas de viewContext),
  // si activePoolId ne correspond plus à aucun de mes bassins actifs (ex. valeur
  // restée sur l'ID d'un bassin invité consulté lors d'une session précédente,
  // ou bassin supprimé/désactivé entre-temps), on retombe sur le premier bassin
  // disponible plutôt que de rester bloqué sur un ID fantôme. Sans ce filet :
  // mesures filtrées sur un ID inexistant → "Aucune mesure" alors que
  // l'historique existe bien, et aucune entrée du switcher n'apparaît cochée.
  useEffect(() => {
    if (viewContext) return;
    if (!activePools.length) return;
    if (!activePools.some((p) => p.id === activePoolId)) {
      setActivePoolId(activePools[0].id);
    }
  }, [viewContext, activePools, activePoolId]);

  // v1.57.4 — Switcher unifié : mes bassins + bassins invités dans une seule
  // liste (remplace l'ancien sélecteur séparé "Bassin affiché" / "Bassin de
  // {pseudo}"). `key` distingue own/invited pour éviter toute collision — les
  // poolId sont souvent "default" sur plusieurs comptes différents.
  const switcherEntries = useMemo(() => {
    const own = ownPools.map((p) => ({
      key: `own:${p.id}`,
      kind: "own",
      id: p.id,
      name: p.name,
      location: p.location,
      photo: p.photo,
    }));
    const invited = linkedPoolsInfo.map((l) => ({
      key: `invited:${l.primaryUid}:${l.poolId}`,
      kind: "invited",
      id: l.poolId,
      name: t("secondary_invited_label", { pool: l.poolName || l.pseudo }),
      location: "",
      photo: l.poolPhoto || null,
      primaryUid: l.primaryUid,
      poolId: l.poolId,
      poolName: l.poolName,
      pseudo: l.pseudo,
      ownerIsPremium: l.ownerIsPremium,
    }));
    return [...own, ...invited];
  }, [ownPools, linkedPoolsInfo, lang]);

  const activeEntryKey = viewContext
    ? `invited:${viewContext.primaryUid}:${viewContext.poolId}`
    : `own:${activePoolId}`;

  // v1.59.2 — Un invité (secondaire) doit hériter des fonctionnalités premium
  // du bassin sur lequel il est invité (celles-ci sont payées par le
  // propriétaire, pas par l'invité). Ne s'applique qu'aux fonctionnalités
  // liées au bassin (limite de mesures, stock, IA, rapport, diagnostic) —
  // PAS à la carte "Mon abonnement" dans Réglages, qui reste celui du compte
  // connecté (demande explicite : "l'abonnement pour mon bassin, pas pour
  // le bassin sur lequel je suis invité").
  const currentLinkedInfo = viewContext
    ? linkedPoolsInfo.find((l) => l.primaryUid === viewContext.primaryUid && l.poolId === viewContext.poolId)
    : null;
  const effectiveIsPremium = viewContext ? !!currentLinkedInfo?.ownerIsPremium : isPremium;

  function handleSelectSwitcherEntry(entry) {
    // v1.74.0 — Si le bassin ciblé change le contexte gratuit/premium effectif
    // (bassin délégué Premium <-> mon bassin gratuit, ou l'inverse), rejoue la
    // transition effervescente entre les deux couleurs, dans les deux sens.
    const wasEffectivePremium = effectiveIsPremium;
    const willBeEffectivePremium = entry.kind === "invited" ? !!entry.ownerIsPremium : isPremium;
    if (entry.kind === "invited") {
      switchToContext({ primaryUid: entry.primaryUid, poolId: entry.poolId, poolName: entry.poolName, pseudo: entry.pseudo });
    } else {
      if (viewContext) switchToContext(null);
      setActivePoolId(entry.id);
    }
    if (willBeEffectivePremium !== wasEffectivePremium) {
      setRevealVariant(willBeEffectivePremium ? "context-premium" : "context-free");
      setShowPremiumReveal(true);
    }
  }

  const activePool = useMemo(
    () => activePools.find((p) => p.id === activePoolId) || activePools[0],
    [activePools, activePoolId]
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
  // v1.29.3 — Fix : blockedByLimit comptait TOUTES les mesures, y compris celles
  // des bassins désactivés (deletePool, ou réactivation de compte). Une mesure
  // loggée aujourd'hui sur un ancien bassin bloquait le quota gratuit même après
  // "Recommencer avec cette adresse". Le quota ne doit porter que sur les
  // bassins visibles.
  const visibleMeasuresForLimit = useMemo(() => {
    const activeIds = new Set(activePools.map((p) => p.id));
    return measures.filter((m) => activeIds.has(m.poolId || "default"));
  }, [measures, activePools]);
  const blockedByLimit = !effectiveIsPremium && hasMeasureToday(visibleMeasuresForLimit);

  const tFn = (key, vars) => {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.fr;
    let str = dict[key] || TRANSLATIONS.fr[key] || key;
    if (vars) Object.keys(vars).forEach(k => { str = str.replace(`{${k}}`, vars[k]); });
    return str;
  };

  const validatingMeasureRecs = useMemo(() => {
    if (!validatingMeasure) return [];
    return computeRecommendations(validatingMeasure, activePool?.volume || 0, poolProducts, effectiveTargets, activeParamKeys, tFn);
  }, [validatingMeasure, activePool, poolProducts, effectiveTargets, activeParamKeys, lang]);

  const existingApplicationForValidating = useMemo(() => {
    if (!validatingMeasure) return null;
    return applications.find((a) => a.measureId === validatingMeasure.id) || null;
  }, [validatingMeasure, applications]);

  // v1.39.0 — Miniature persistée sur measures/{id} (quelques Ko, 150px/q0.5)
  // pour garder un aperçu visible immédiatement (dashboard "dernière mesure",
  // en-tête replié de l'historique) sans dépendre du chargement de la
  // sous-collection photos. Sans elle, le listener temps réel (onMeasures)
  // écrase measure.photo local en quelques centaines de ms après l'ajout,
  // avant même que l'utilisateur ait pu voir la photo.
  function saveMeasureWithThumbnail(uid, m) {
    const photos = m.photos?.length ? m.photos : (m.photo ? [m.photo] : []);
    const poolPhotos = m.poolPhotos || [];
    const firstPhoto = photos[0] || poolPhotos[0] || null;
    if (firstPhoto) {
      compressImageDataUrl(firstPhoto, 150, 0.5).then((thumbnail) => {
        FB.saveMeasure(uid, { ...m, thumbnail }).catch(() => {});
      });
    } else {
      FB.saveMeasure(uid, { ...m, thumbnail: null }).catch(() => {});
    }
    FB.saveMeasurePhotos(uid, m.id, photos, poolPhotos).catch(() => {});
  }

  function addMeasure(entry) {
    if (entry.id) {
      setMeasures((prev) => {
        const updated = prev.map((m) => (m.id === entry.id ? { ...m, ...entry } : m));
        if (dataUid) {
          updated.forEach(m => {
            if (m.id === entry.id) saveMeasureWithThumbnail(dataUid, m);
          });
        }
        return updated;
      });
      track("measure_edit");
    } else {
      const newMeasure = { id: uid(), poolId: activePoolId, ...entry, createdBy: authUser?.uid || null };
      setMeasures((prev) => [...prev, newMeasure]);
      if (dataUid) saveMeasureWithThumbnail(dataUid, newMeasure);
      track("measure_add", { has_photos: !!(entry.photos?.length || entry.photo), has_pool_photos: !!(entry.poolPhotos?.length) });
    }
    setShowAddMeasure(false);
    setEditingMeasure(null);
  }

  function deleteMeasure(id) {
    setMeasures((prev) => prev.filter((m) => m.id !== id));
    // FB.deleteMeasure purge aussi la sous-collection photos associée.
    if (dataUid) FB.deleteMeasure(dataUid, id).catch(() => {});
  }

  function deleteAllMeasuresForActivePool() {
    setMeasures((prev) => prev.filter((m) => (m.poolId || "default") !== activePoolId));
  }

  // Détecte les mesures/applications/produits dont le poolId ne correspond à
  // aucun bassin existant (ex: après un bug de synchro ayant fait perdre l'ID
  // d'origine du bassin — voir v1.25.1).
  const orphanedCount = useMemo(() => {
    if (viewContext || !pools.length) return 0; // v1.55.0 — outil réservé au propriétaire du compte
    const poolIds = new Set(pools.map((p) => p.id));
    const orphanMeasures = measures.filter((m) => !poolIds.has(m.poolId || "default")).length;
    const orphanApps = applications.filter((a) => !poolIds.has(a.poolId || "default")).length;
    const orphanProducts = products.filter((p) => !poolIds.has(p.poolId || "default")).length;
    return orphanMeasures + orphanApps + orphanProducts;
  }, [pools, measures, applications, products, viewContext]);

  async function repairOrphanedData() {
    if (viewContext || !pools.length) return; // v1.55.0 — outil réservé au propriétaire du compte
    const poolIds = new Set(pools.map((p) => p.id));
    const targetPoolId = activePoolId && poolIds.has(activePoolId) ? activePoolId : pools[0].id;

    const fixedMeasures = measures.map((m) =>
      poolIds.has(m.poolId || "default") ? m : { ...m, poolId: targetPoolId }
    );
    const fixedApps = applications.map((a) =>
      poolIds.has(a.poolId || "default") ? a : { ...a, poolId: targetPoolId }
    );
    const fixedProducts = products.map((p) =>
      poolIds.has(p.poolId || "default") ? p : { ...p, poolId: targetPoolId }
    );

    setMeasures(fixedMeasures);
    setApplications(fixedApps);
    setProducts(fixedProducts);

    if (authUser?.uid && FB.ready()) {
      const changedMeasures = fixedMeasures.filter((m, i) => m.poolId !== measures[i]?.poolId);
      const changedApps = fixedApps.filter((a, i) => a.poolId !== applications[i]?.poolId);
      await Promise.all([
        ...changedMeasures.map((m) => FB.saveMeasure(authUser.uid, m).catch(() => {})),
        ...changedApps.map((a) => FB.saveApplication(authUser.uid, a).catch(() => {})),
      ]);
    }
  }

  function saveApplication(measureId, steps, allApplied) {
    track("treatment_applied", { steps_count: steps.length, all_applied: allApplied });
    // Stock décrémenté uniquement quand le plan est entièrement terminé
    if (allApplied) {
      const stepsWithAmount = steps.filter((s) => s.appliedAmount && !s.skipped);
      if (stepsWithAmount.length > 0) {
        const justEmptied = [];
        setProducts((prev) => prev.map((prod) => {
          const step = stepsWithAmount.find((s) => s.productName === prod.name);
          if (!step || !prod.containerAmount) return prod;
          const cUnit = prod.containerUnit || "kg";
          let appliedInContainerUnit = step.appliedAmount;
          if (cUnit === "kg" && step.doseUnit === "g") appliedInContainerUnit = step.appliedAmount / 1000;
          if (cUnit === "L" && step.doseUnit === "mL") appliedInContainerUnit = step.appliedAmount / 1000;
          const consumed = (appliedInContainerUnit / prod.containerAmount) * 100;
          const prevStock = prod.stockPercent ?? 100;
          const newStock = Math.max(0, prevStock - consumed);
          const rounded = Math.round(newStock * 10) / 10;
          // v1.29.8 — Un produit UTILISATEUR (pas standard) qui vient d'atteindre
          // 0% est proposé à la suppression, pour ne pas laisser traîner un
          // produit épuisé dans la liste. Les produits standard, eux, restent
          // toujours en base à 0% (masqués), jamais supprimés.
          if (!prod.isDefault && prevStock > 0 && rounded <= 0) {
            justEmptied.push(prod.id);
          }
          return { ...prod, stockPercent: rounded };
        }));
        if (justEmptied.length > 0) {
          setTimeout(() => {
            justEmptied.forEach((id) => {
              setProducts((prev) => {
                const p = prev.find((x) => x.id === id);
                if (!p) return prev;
                const ok = window.confirm(t("product_empty_delete_confirm", { name: p.name }));
                return ok ? prev.filter((x) => x.id !== id) : prev;
              });
            });
          }, 300);
        }
      }
    }
    setApplications((prev) => {
      const withoutThisMeasure = prev.filter((a) => a.measureId !== measureId);
      const newApp = {
        id: uid(),
        poolId: activePoolId,
        measureId,
        appliedAt: new Date().toISOString(),
        allApplied: !!allApplied,
        steps,
        createdBy: authUser?.uid || null,
      };
      if (dataUid) FB.saveApplication(dataUid, newApp).catch(() => {});
      return [...withoutThisMeasure, newApp];
    });
    setValidatingMeasure(null);
  }

  // v1.63.0 — Application manuelle hors plan (ex. entretien périodique).
  // Décrémente le stock immédiatement (contrairement au plan, pas d'attente
  // de fin de séquence) et enregistre une application distincte, sans
  // measureId, marquée type: "manual" pour être reconnue dans l'historique
  // et le rapport PDF sans se substituer aux applications liées à une mesure.
  function saveManualApplication(product, amount, doseUnit, appliedAt) {
    track("manual_application", { product: product.name });
    if (product.containerAmount) {
      const cUnit = product.containerUnit || "kg";
      let appliedInContainerUnit = amount;
      if (cUnit === "kg" && doseUnit === "g") appliedInContainerUnit = amount / 1000;
      if (cUnit === "L" && doseUnit === "mL") appliedInContainerUnit = amount / 1000;
      const consumed = (appliedInContainerUnit / product.containerAmount) * 100;
      const prevStock = product.stockPercent ?? 100;
      const newStock = Math.max(0, prevStock - consumed);
      const rounded = Math.round(newStock * 10) / 10;
      setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, stockPercent: rounded } : p)));
      if (!product.isDefault && prevStock > 0 && rounded <= 0) {
        setTimeout(() => {
          setProducts((prev) => {
            const p = prev.find((x) => x.id === product.id);
            if (!p) return prev;
            const ok = window.confirm(t("product_empty_delete_confirm", { name: p.name }));
            return ok ? prev.filter((x) => x.id !== product.id) : prev;
          });
        }, 300);
      }
    }
    const newApp = {
      id: uid(),
      poolId: activePoolId,
      measureId: null,
      type: "manual",
      productName: product.name,
      appliedAmount: amount,
      doseUnit,
      appliedAt,
      createdBy: authUser?.uid || null,
    };
    setApplications((prev) => [...prev, newApp]);
    if (dataUid) FB.saveApplication(dataUid, newApp).catch(() => {});
    setShowManualApply(false);
  }

  // v1.66.0 — Édition d'une application déjà enregistrée (produit/quantité/
  // heure), depuis l'écran "Modifier" de l'historique. Corrige le stock en
  // delta : recrédite l'ancien produit puis décompte le nouveau, uniquement
  // pour les steps réellement modifiés (produit ou quantité différents).
  // Un produit générique (non trouvé dans poolProducts) ne subit aucun
  // mouvement de stock, comme partout ailleurs dans l'app.
  function editHistoricalApplication(applicationId, newSteps) {
    const app = applications.find((a) => a.id === applicationId);
    if (!app) return;
    const oldSteps = app.steps || [];

    function applyDelta(list, productName, amount, doseUnit, sign) {
      if (!amount) return list;
      return list.map((p) => {
        if (p.name !== productName || !p.containerAmount) return p;
        const cUnit = p.containerUnit || "kg";
        let inContainerUnit = amount;
        if (cUnit === "kg" && doseUnit === "g") inContainerUnit = amount / 1000;
        if (cUnit === "L" && doseUnit === "mL") inContainerUnit = amount / 1000;
        const pct = (inContainerUnit / p.containerAmount) * 100;
        const next = Math.max(0, Math.min(100, (p.stockPercent ?? 100) + sign * pct));
        return { ...p, stockPercent: Math.round(next * 10) / 10 };
      });
    }

    setProducts((prev) => {
      let updated = prev;
      newSteps.forEach((ns, i) => {
        const os = oldSteps[i];
        if (!os || ns.skipped || !ns.appliedAt) return;
        if (ns.productName === os.productName && ns.appliedAmount === os.appliedAmount) return;
        updated = applyDelta(updated, os.productName, os.appliedAmount, os.doseUnit, +1); // recrédite l'ancien
        updated = applyDelta(updated, ns.productName, ns.appliedAmount, ns.doseUnit, -1); // décompte le nouveau
      });
      return updated;
    });

    const updatedApp = { ...app, steps: newSteps };
    setApplications((prev) => prev.map((a) => (a.id === applicationId ? updatedApp : a)));
    if (dataUid) FB.saveApplication(dataUid, updatedApp).catch(() => {});
  }

  // Démarre le wizard pour une mesure donnée
  function startPlan(measureId, recs) {
    const now = new Date();
    let cumulatedMs = 0;
    const steps = recs.map((r, i) => {
      const scheduledAt = new Date(now.getTime() + cumulatedMs).toISOString();
      cumulatedMs += (r.waitHours || 0) * 3600 * 1000;
      return {
        ...r,
        stepIndex: i,
        scheduledAt,
        appliedAt: null,
        skipped: false,
        appliedAmount: r.computedDoseAmount,
      };
    });
    setActivePlan({ measureId, steps, currentStepIdx: 0 });
  }

  // Helper : construit finalSteps depuis un tableau de steps
  // Pour les steps non encore confirmés (pas d'appliedAt), on ne garde que computedDoseAmount
  function buildFinalSteps(steps) {
    return steps.map(s => ({
      action: s.action, title: s.title,
      productName: s.appliedProductName || s.productName,
      computedDoseAmount: s.computedDoseAmount,
      appliedAmount: (s.appliedAt && !s.skipped) ? s.appliedAmount : null,
      doseUnit: s.doseUnit,
      appliedAt: s.appliedAt, skipped: s.skipped, scheduledAt: s.scheduledAt,
      mode: s.mode, doseText: s.doseText,
    }));
  }

  // Valide une étape du wizard — version sans appel de setter dans setter
  function applyWizardStep(stepIdx, amount, appliedAt, productName) {
    if (!activePlan) return;
    const now = appliedAt || new Date().toISOString();
    const newSteps = activePlan.steps.map((s, i) => {
      if (i !== stepIdx) return s;
      return {
        ...s,
        appliedAt: now,
        appliedAmount: amount,
        skipped: false,
        ...(productName && productName !== s.productName ? { appliedProductName: productName } : {}),
      };
    });
    // Recalculer les scheduledAt des étapes suivantes
    let lastApplied = new Date(now);
    let recalcSteps = newSteps.map((s, i) => {
      if (i < stepIdx) return s;
      if (i === stepIdx) { lastApplied = new Date(now); return s; }
      const scheduled = new Date(lastApplied.getTime() + (newSteps[i-1]?.waitHours || 0) * 3600 * 1000);
      lastApplied = scheduled;
      return { ...s, scheduledAt: scheduled.toISOString() };
    });

    // v1.61.0 — Carte "entretien continu" : si le produit utilisé pour cette
    // étape est configuré en galets/sticks avec un ratio d'entretien
    // fabricant renseigné, on ajoute une carte informative en fin de plan
    // (une seule fois par plan — recalcSteps contient déjà la carte si elle
    // a été ajoutée à une étape précédente). Elle termine le plan : pas de
    // dose à saisir, pas de décompte de stock, juste l'information.
    const appliedStep = recalcSteps[stepIdx];
    const usedProductName = appliedStep.appliedProductName || appliedStep.productName;
    const usedProduct = poolProducts.find((p) => p.name === usedProductName);
    const alreadyHasMaintenanceCard = recalcSteps.some((s) => s.mode === "entretien");
    if (!alreadyHasMaintenanceCard && usedProduct?.packagingType === "galets" && usedProduct?.maintenanceRatio?.units && usedProduct?.maintenanceRatio?.volumePer) {
      const mr = usedProduct.maintenanceRatio;
      recalcSteps = [...recalcSteps, {
        action: "entretien-galets",
        mode: "entretien",
        title: tFn("maintenance_card_title"),
        productName: usedProduct.name,
        productAvailable: true,
        doseText: tFn("maintenance_card_text", { units: mr.units, volume: mr.volumePer, days: mr.days || "?" }),
        computedDoseAmount: null,
        appliedAmount: null,
        doseUnit: null,
        note: null,
        waitHours: 0,
        scheduledAt: new Date(now).toISOString(),
        appliedAt: null,
        skipped: false,
      }];
    }

    // Trouver la prochaine étape non traitée
    let nextIdx = stepIdx + 1;
    while (nextIdx < recalcSteps.length && (recalcSteps[nextIdx].appliedAt || recalcSteps[nextIdx].skipped)) nextIdx++;
    const allDone = nextIdx >= recalcSteps.length;
    const finalSteps = buildFinalSteps(recalcSteps);
    // Sauvegarde intermédiaire dans l'historique à chaque étape
    const applied = finalSteps.filter(s => !s.skipped && s.appliedAt);
    saveApplication(activePlan.measureId, finalSteps, allDone && applied.length === finalSteps.length);
    if (allDone) {
      setActivePlan(null);
      setShowWizard(false);
    } else {
      setActivePlan({ ...activePlan, steps: recalcSteps, currentStepIdx: nextIdx });
    }
  }

  // Modifie un step déjà appliqué (quantité + heure)
  function editWizardStep(stepIdx, amount, appliedAt) {
    if (!activePlan) return;
    const newSteps = activePlan.steps.map((s, i) =>
      i === stepIdx ? { ...s, appliedAmount: amount, appliedAt } : s
    );
    const finalSteps = buildFinalSteps(newSteps);
    const allDone = newSteps.every(s => s.appliedAt || s.skipped);
    const applied = finalSteps.filter(s => !s.skipped && s.appliedAt);
    saveApplication(activePlan.measureId, finalSteps, allDone && applied.length === finalSteps.length);
    setActivePlan({ ...activePlan, steps: newSteps });
  }

  // Passe une étape
  function skipWizardStep(stepIdx) {
    if (!activePlan) return;
    const newSteps = activePlan.steps.map((s, i) =>
      i === stepIdx ? { ...s, skipped: true, appliedAt: new Date().toISOString() } : s
    );
    let nextIdx = stepIdx + 1;
    while (nextIdx < newSteps.length && (newSteps[nextIdx].appliedAt || newSteps[nextIdx].skipped)) nextIdx++;
    const allDone = nextIdx >= newSteps.length;
    const finalSteps = buildFinalSteps(newSteps);
    // Sauvegarde intermédiaire
    saveApplication(activePlan.measureId, finalSteps, false);
    if (allDone) {
      setActivePlan(null);
      setShowWizard(false);
    } else {
      setActivePlan({ ...activePlan, steps: newSteps, currentStepIdx: nextIdx });
    }
  }

  // Abandonne le wizard sans sauvegarder
  function cancelPlan() {
    setActivePlan(null);
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
      openPaywall("measure_limit");
    } else {
      setEditingApplication(null);
      setShowAddMeasure(true);
    }
  }

  function handleEditMeasure(m, application) {
    // Modifier une mesure existante ne crée pas de nouvelle entrée :
    // pas concerné par la limite quotidienne gratuite.
    setEditingMeasure(m);
    setEditingApplication(application || null);
    setShowAddMeasure(true);
  }

  // v1.29.6 — Le démarrage du plan exige maintenant isPremium ET manageStock
  // activé (pas seulement isPremium). Un utilisateur premium qui n'a pas activé
  // la gestion de stock retombe aussi sur le paywall.
  function handleValidateApplication(m, recsOverride, selectedRecsOverride, adjustMode) {
    if (!effectiveIsPremium || !activePool?.manageStock) {
      openPaywall("start_plan");
      return;
    }
    // Si plan déjà en cours pour cette mesure, reprendre
    if (activePlan && activePlan.measureId === m.id) {
      setShowWizard(true);
      return;
    }
    // Sinon démarrer un nouveau plan
    const recs = recsOverride || computeRecommendations(m, activePool?.volume || 0, poolProducts, effectiveTargets, activeParamKeys, tFn);
    startPlan(m.id, recs);
    setShowWizard(true);
  }

  // ── Synchro config → Firestore à chaque changement ──
  // Fix v1.27.3 : un ancien garde "syncedRef" ne sautait que le tout premier passage
  // de cet effet, ce qui semblait viser à éviter de réécrire la donnée qu'on vient de
  // charger localement. En pratique, il empêchait TOUTE écriture ultérieure du champ
  // pools tant que le tableau ne changeait pas de contenu après ce premier passage —
  // ce qui, pour un compte n'ayant jamais modifié ses bassins après le chargement
  // initial, faisait que pools n'était jamais synchronisé vers Firestore (constaté :
  // champ pools absent du doc config/main alors que measures/products étaient bien
  // sync). Retiré : le garde-fou anti-écrasement ci-dessous (tableau vide bloqué tant
  // que cloudConfigReceivedRef n'est pas confirmé) suffit à protéger contre un cache
  // local vidé écrasant les bassins existants.
  useEffect(() => {
    if (!loaded || !dataUid) return;
    // v1.57.2 — Fix incident production : l'ancienne garde ne bloquait que le
    // tableau VIDE (pools.length === 0). Un reset local accidentel (détection
    // erronée de changement de compte, resetLocalAppState()) remplace pools
    // par un bassin par défaut non-vide ("default"/"Ma piscine"), qui passait
    // la garde et partait vers Firestore avant que la vraie config cloud n'ait
    // eu le temps d'arriver — écrasant définitivement les vraies données. On
    // bloque désormais TOUTE écriture tant que cloudConfigReceivedRef n'a pas
    // confirmé avoir reçu la vraie config cloud au moins une fois pour ce uid,
    // peu importe le contenu (vide ou par défaut) du tableau local.
    if (!cloudConfigReceivedRef.current) return;
    syncConfig({ pools });
  }, [pools]);

  // v1.30.0 — Fix bug production (doc config/main > 1 Mio, sync bloquée) :
  // les photos produits ne sont plus jamais envoyées dans config/main. Elles
  // sont poussées séparément vers users/{uid}/productPhotos/{productId}, un
  // doc par photo. Deux effets distincts :
  // 1) upload/suppression de la photo elle-même, dès qu'elle change ;
  // 2) synchro de la métadonnée (hasPhoto) vers config/main, en ne retirant
  //    le champ photo inline que pour les produits dont l'upload est confirmé
  //    (productPhotosRef à jour, alimenté par l'écho temps réel du listener
  //    onProductPhotos) — jamais avant, pour ne perdre aucune photo si
  //    l'upload échoue ou si l'app se ferme en cours de migration.
  useEffect(() => {
    if (!loaded || !dataUid || !FB.ready()) return;
    const uid = dataUid;
    products.forEach((p) => {
      const prevPhoto = lastSyncedPhotosRef.current[p.id];
      if (prevPhoto === p.photo) return;
      lastSyncedPhotosRef.current[p.id] = p.photo;
      if (p.photo) {
        FB.saveProductPhoto(uid, p.id, p.photo).catch(() => {
          lastSyncedPhotosRef.current[p.id] = prevPhoto; // réessaiera au prochain changement de products
        });
      } else if (prevPhoto) {
        FB.deleteProductPhoto(uid, p.id).catch(() => {});
      }
    });
  }, [products]);

  useEffect(() => {
    if (!loaded || !dataUid) return;
    if (!FB.ready()) return;
    // v1.57.2 — Même fix que l'effet pools ci-dessus : voir ce commentaire
    // pour le détail de l'incident (reset accidentel écrasant Firestore).
    if (!cloudConfigReceivedRef.current) return;
    const confirmedPhotos = productPhotosRef.current;
    const metaOnly = products.map((p) => {
      const hasPhoto = !!p.photo;
      const isConfirmed = hasPhoto && confirmedPhotos[p.id] === p.photo;
      if (!hasPhoto || isConfirmed) {
        const { photo, ...rest } = p;
        return { ...rest, hasPhoto };
      }
      return { ...p, hasPhoto }; // upload pas encore confirmé : on garde l'inline pour ne rien perdre
    });
    syncConfig({ products: metaOnly }, "product_sync_error");
  }, [products, photoMapVersion]);

  useEffect(() => {
    if (!loaded || !dataUid) return;
    syncConfig({ activePlan: activePlanByPool });
  }, [activePlanByPool]);

  // v1.57.9 — isPremium : la règle de sécurité bloque toute écriture client
  // qui ferait passer ce champ à TRUE (empêche l'auto-attribution du statut
  // premium), y compris pour le propriétaire. Seul un futur webhook Stripe
  // côté Worker (service account, hors règles de sécurité) pourra le faire
  // passer à true. L'activation via l'interrupteur de test ici ne simule que
  // l'état local, sans persistance.
  // v1.76.0 — La direction inverse (désactivation, passage à FALSE) est en
  // revanche bien persistée sur Firestore désormais (voir syncOwnConfig dans
  // le handler onConfirm de PremiumDowngradeConfirmModal) : sans ça, un true
  // resté en base d'un test antérieur pouvait indéfiniment réaffirmer
  // isPremium=true à chaque snapshot onConfig, rendant le toggle local
  // impuissant à le faire tenir sur OFF après un rechargement.

  useEffect(() => {
    if (!loaded || !authUser?.uid) return;
    syncOwnConfig({ lang });
  }, [lang]);

  useEffect(() => {
    if (!loaded || !authUser?.uid) return;
    syncOwnConfig({ aiEnabled });
  }, [aiEnabled]);

  useEffect(() => {
    if (!loaded || !authUser?.uid) return;
    syncOwnConfig({ calibrationContribution });
  }, [calibrationContribution]);

  useEffect(() => {
    if (!loaded || !authUser?.uid) return;
    syncOwnConfig({ apiProvider });
  }, [apiProvider]);

  // v1.29.3 — Fix : le plan de traitement n'affichait plus les quantités.
  // Cause : quand aucun bassin actif valide n'existe au moment de la création
  // (écran forcé après réactivation de compte ou désactivation du dernier
  // bassin, activePoolId vide), le nouveau bassin ne récupérait aucun produit
  // par duplication. computeRecommendations ne trouvait alors jamais de
  // produit correspondant et retombait sur "produit manquant" au lieu de la
  // quantité — quel que soit le statut premium ou la gestion de stock.
  function addPool(pool) {
    if (viewContext) return; // v1.55.0 — réservé au propriétaire du compte
    const id = uid();
    setPools((prev) => [...prev, { id, ...pool }]);
    setProducts((prev) => {
      const toDuplicate = prev.filter((p) => (p.poolId || "default") === activePoolId);
      if (toDuplicate.length > 0) {
        const duplicated = toDuplicate.map((p) => ({ ...p, id: uid(), poolId: id }));
        return [...prev, ...duplicated];
      }
      const seeded = DEFAULT_PRODUCTS.map((p) => ({ ...p, id: uid(), poolId: id }));
      return [...prev, ...seeded];
    });
    setActivePoolId(id);
    setShowAddPool(false);
  }

  // v1.72.0 — Marque l'onboarding comme vu (fin normale ou "Passer"), synchronisé
  // Firestore pour ne pas le revoir sur un autre appareil. Le lien "Revoir la
  // présentation" dans Réglages rouvre le wizard sans repasser par ici.
  function markOnboardingSeen() {
    setShowOnboarding(false);
    if (!onboardingSeen) {
      setOnboardingSeen(true);
      syncOwnConfig({ onboardingSeen: true });
    }
  }

  function updatePool(id, updates) {
    if (viewContext) return; // v1.55.0 — réservé au propriétaire du compte
    setPools((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }

  // v1.28.0 — Soft delete : le bassin n'est plus retiré, il est marqué désactivé.
  // Measures/applications/products restent rattachées à son poolId, intactes en
  // base (exploitables pour des stats), et ne redeviennent jamais orphelines
  // puisque l'id du bassin reste présent dans `pools`. Seul l'affichage (via
  // `activePools`) le masque à l'utilisateur. Si c'était le dernier bassin actif,
  // aucune recréation automatique : l'écran "créer un bassin" (forced) prend le relais.
  function deletePool(id) {
    if (viewContext) return; // v1.55.0 — réservé au propriétaire du compte
    const ok = window.confirm(t("delete_pool_confirm"));
    if (!ok) return;
    setPools((prev) =>
      prev.map((p) => (p.id === id ? { ...p, disabled: true, disabledAt: new Date().toISOString() } : p))
    );
    if (activePoolId === id) {
      const remainingActive = pools.filter((p) => p.id !== id && !p.disabled);
      setActivePoolId(remainingActive[0]?.id || "");
    }
  }

  function handleWantAddPool() {
    if (!isPremium) {
      openPaywall();
      return;
    }
    // v1.95.0 — Plafond de 3 bassins actifs pour les comptes Premium (avant
    // cette version, aucune limite n'existait une fois Premium activé).
    // Contrôle client uniquement ici ; la vraie limite est appliquée par
    // firestore.rules (activePoolCount) côté serveur.
    const activePoolCount = pools.filter((p) => !p.disabled).length;
    if (activePoolCount >= MAX_POOLS_CLIENT) {
      alert(t("pool_limit_reached"));
      return;
    }
    setShowAddPool(true);
  }

  // v1.82.0 — BUG : ces variables n'étaient posées que sur le <div className="app">
  // interne, alors que plusieurs écrans (vérification email, compte suspendu/supprimé,
  // bassin introuvable, premier bassin forcé...) sont rendus AVANT ce div, dans un
  // Fragment <> qui ne peut porter aucun style. Ces écrans utilisaient donc
  // var(--brand-primary) non définie → fond/texte transparents, boutons invisibles
  // ("blanc sur blanc"). Calculées une fois ici et appliquées au vrai conteneur racine.
  const themeVars = {
    "--brand-primary": effectiveIsPremium ? "#1ca7d1" : "#4a9b82",
    "--brand-primary-dark": effectiveIsPremium ? "#0c7a9e" : "#2a6553",
    "--brand-text-strong": effectiveIsPremium ? "#0d2b4e" : "#173a2b",
    "--brand-text-secondary": effectiveIsPremium ? "#4a6480" : "#3f6552",
    "--brand-text-muted": effectiveIsPremium ? "#6a7d90" : "#5c7d6c",
    "--brand-icon-light": effectiveIsPremium ? "#7ab8e8" : "#7fc7a4",
    "--brand-header-sub": effectiveIsPremium ? "#a8d4f0" : "#bfe0cf",
    "--brand-bg-tint": effectiveIsPremium ? "#f0f6fb" : "#eef6f1",
  };

  return (
    <div style={themeVars}>
    {verifyLinkStatus && (
      <div style={{ position: "fixed", inset: 0, zIndex: 3200, background: "rgba(10,30,60,0.94)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: 28, maxWidth: 380, width: "100%", textAlign: "center", boxShadow: "0 8px 32px var(--brand-primary)33" }}>
          {verifyLinkStatus === "verifying" ? (
            <>
              <Loader2 size={34} className="spin" style={{ marginBottom: 10, color: "var(--brand-primary)" }} />
              <div style={{ fontSize: 14, color: "var(--brand-text-secondary)" }}>{t("verify_link_checking")}</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 34, marginBottom: 10 }}>
                {verifyLinkStatus === "verified" || verifyLinkStatus === "already_verified" ? "✅" : "⚠️"}
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "var(--brand-text-strong)", marginBottom: 8 }}>
                {t(`verify_link_${verifyLinkStatus}_title`)}
              </div>
              <div style={{ fontSize: 13.5, color: "var(--brand-text-secondary)", marginBottom: 18, lineHeight: 1.5 }}>
                {t(`verify_link_${verifyLinkStatus}_desc`)}
              </div>
              <button
                onClick={() => setVerifyLinkStatus(null)}
                style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: "var(--brand-primary)", color: "#fff", fontWeight: 700, fontSize: 14.5, cursor: "pointer" }}
              >
                {t("verify_link_continue_btn")}
              </button>
            </>
          )}
        </div>
      </div>
    )}
    {mergeLinkStatus && (
      <div style={{ position: "fixed", inset: 0, zIndex: 3200, background: "rgba(10,30,60,0.94)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: 28, maxWidth: 380, width: "100%", textAlign: "center", boxShadow: "0 8px 32px var(--brand-primary)33" }}>
          {mergeLinkStatus === "pending_confirmation" ? (
            <>
              <div style={{ fontSize: 34, marginBottom: 10 }}>🔗</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "var(--brand-text-strong)", marginBottom: 8 }}>
                {t("merge_link_pending_title")}
              </div>
              <div style={{ fontSize: 13.5, color: "var(--brand-text-secondary)", marginBottom: 18, lineHeight: 1.5 }}>
                {t("merge_link_pending_desc")}
              </div>
              <button
                onClick={handleConfirmMergeClick}
                style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: "var(--brand-primary)", color: "#fff", fontWeight: 700, fontSize: 14.5, cursor: "pointer", marginBottom: 10 }}
              >
                {t("merge_link_confirm_btn")}
              </button>
              <button
                onClick={() => { setMergeLinkStatus(null); setMergeLinkParams(null); }}
                style={{ width: "100%", padding: "11px 0", borderRadius: 12, border: "1px solid #d8e2ec", background: "transparent", color: "var(--brand-text-secondary)", fontWeight: 600, fontSize: 13.5, cursor: "pointer" }}
              >
                {t("merge_link_cancel_btn")}
              </button>
            </>
          ) : mergeLinkStatus === "confirming" ? (
            <>
              <Loader2 size={34} className="spin" style={{ marginBottom: 10, color: "var(--brand-primary)" }} />
              <div style={{ fontSize: 14, color: "var(--brand-text-secondary)" }}>{t("merge_link_confirming")}</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 34, marginBottom: 10 }}>
                {mergeLinkStatus === "merged" || mergeLinkStatus === "already_merged" ? "✅" : "⚠️"}
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "var(--brand-text-strong)", marginBottom: 8 }}>
                {t(`merge_link_${mergeLinkStatus}_title`)}
              </div>
              <div style={{ fontSize: 13.5, color: "var(--brand-text-secondary)", marginBottom: 18, lineHeight: 1.5 }}>
                {t(`merge_link_${mergeLinkStatus}_desc`)}
              </div>
              <button
                onClick={() => { setMergeLinkStatus(null); setMergeLinkParams(null); }}
                style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: "var(--brand-primary)", color: "#fff", fontWeight: 700, fontSize: 14.5, cursor: "pointer" }}
              >
                {t("verify_link_continue_btn")}
              </button>
            </>
          )}
        </div>
      </div>
    )}
    {awaitingStripeActivation && (
      <div style={{ position: "fixed", inset: 0, zIndex: 3200, background: "rgba(10,30,60,0.94)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: 28, maxWidth: 380, width: "100%", textAlign: "center", boxShadow: "0 8px 32px var(--brand-primary)33" }}>
          {!stripeActivationTimedOut ? (
            <>
              <Loader2 size={34} className="spin" style={{ marginBottom: 10, color: "var(--brand-primary)" }} />
              <div style={{ fontSize: 14, color: "var(--brand-text-secondary)" }}>{t("stripe_activation_checking")}</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 34, marginBottom: 10 }}>⏳</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "var(--brand-text-strong)", marginBottom: 8 }}>
                {t("stripe_activation_delay_title")}
              </div>
              <div style={{ fontSize: 13.5, color: "var(--brand-text-secondary)", marginBottom: 18, lineHeight: 1.5 }}>
                {t("stripe_activation_delay_desc")}
              </div>
              <button
                onClick={() => { awaitingStripeActivationRef.current = false; setAwaitingStripeActivation(false); }}
                style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: "var(--brand-primary)", color: "#fff", fontWeight: 700, fontSize: 14.5, cursor: "pointer" }}
              >
                {t("stripe_activation_continue_btn")}
              </button>
            </>
          )}
        </div>
      </div>
    )}
    {authUser && inviteLinkStatus && (
      <div style={{ position: "fixed", inset: 0, zIndex: 3200, background: "rgba(10,30,60,0.94)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: 28, maxWidth: 380, width: "100%", textAlign: "center", boxShadow: "0 8px 32px var(--brand-primary)33" }}>
          {inviteLinkStatus === "loading_info" || inviteLinkStatus === "responding" ? (
            <>
              <Loader2 size={34} className="spin" style={{ marginBottom: 10, color: "var(--brand-primary)" }} />
              <div style={{ fontSize: 14, color: "var(--brand-text-secondary)" }}>{t("invite_response_checking")}</div>
            </>
          ) : inviteLinkStatus === "info_ready" ? (
            <>
              <div style={{ fontSize: 34, marginBottom: 10 }}>🔗</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "var(--brand-text-strong)", marginBottom: 8 }}>
                {t("invite_response_title")}
              </div>
              <div style={{ fontSize: 13.5, color: "var(--brand-text-secondary)", marginBottom: 18, lineHeight: 1.5 }}>
                {t("invite_response_text", {
                  pseudo: inviteLinkInfo?.primaryPseudo || inviteLinkInfo?.primaryEmail || "",
                  pool: inviteLinkInfo?.poolName || "",
                })}
              </div>
              <button
                onClick={() => handleInviteResponse("accept")}
                style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: "var(--brand-primary)", color: "#fff", fontWeight: 700, fontSize: 14.5, cursor: "pointer", marginBottom: 10 }}
              >
                {t("invite_response_accept")}
              </button>
              <button
                onClick={() => handleInviteResponse("decline")}
                style={{ width: "100%", padding: "11px 0", borderRadius: 12, border: "1px solid #d8e2ec", background: "transparent", color: "var(--brand-text-secondary)", fontWeight: 600, fontSize: 13.5, cursor: "pointer" }}
              >
                {t("invite_response_decline")}
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 34, marginBottom: 10 }}>
                {inviteLinkStatus === "accepted" ? "✅" : "⚠️"}
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "var(--brand-text-strong)", marginBottom: 8 }}>
                {t("invite_response_title")}
              </div>
              <div style={{ fontSize: 13.5, color: "var(--brand-text-secondary)", marginBottom: 18, lineHeight: 1.5 }}>
                {t(`invite_response_${inviteLinkStatus}`)}
              </div>
              <button
                onClick={() => { setInviteLinkStatus(null); setInviteLinkToken(null); setInviteLinkInfo(null); }}
                style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: "var(--brand-primary)", color: "#fff", fontWeight: 700, fontSize: 14.5, cursor: "pointer" }}
              >
                {t("verify_link_continue_btn")}
              </button>
            </>
          )}
        </div>
      </div>
    )}
    {authUser && revocationLinkStatus && (
      <div style={{ position: "fixed", inset: 0, zIndex: 3200, background: "rgba(10,30,60,0.94)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: 28, maxWidth: 380, width: "100%", textAlign: "center", boxShadow: "0 8px 32px var(--brand-primary)33" }}>
          {revocationLinkStatus === "loading_info" || revocationLinkStatus === "responding" ? (
            <>
              <Loader2 size={34} className="spin" style={{ marginBottom: 10, color: "var(--brand-primary)" }} />
              <div style={{ fontSize: 14, color: "var(--brand-text-secondary)" }}>{t("invite_response_checking")}</div>
            </>
          ) : revocationLinkStatus === "info_ready" ? (
            <>
              <div style={{ fontSize: 34, marginBottom: 10 }}>🔓</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "var(--brand-text-strong)", marginBottom: 8 }}>
                {t("revocation_response_title")}
              </div>
              <div style={{ fontSize: 13.5, color: "var(--brand-text-secondary)", marginBottom: 18, lineHeight: 1.5 }}>
                {t("revocation_response_text", {
                  pseudo: revocationLinkInfo?.secondaryPseudo || "",
                  pool: revocationLinkInfo?.poolName || "",
                })}
              </div>
              <button
                onClick={handleRevocationConfirm}
                style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: "var(--brand-primary)", color: "#fff", fontWeight: 700, fontSize: 14.5, cursor: "pointer" }}
              >
                {t("revocation_response_accept")}
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 34, marginBottom: 10 }}>
                {revocationLinkStatus === "done" ? "✅" : "⚠️"}
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "var(--brand-text-strong)", marginBottom: 8 }}>
                {t("revocation_response_title")}
              </div>
              <div style={{ fontSize: 13.5, color: "var(--brand-text-secondary)", marginBottom: 18, lineHeight: 1.5 }}>
                {t(`revocation_response_${revocationLinkStatus}`)}
              </div>
              <button
                onClick={() => { setRevocationLinkStatus(null); setRevocationLinkToken(null); setRevocationLinkInfo(null); }}
                style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: "var(--brand-primary)", color: "#fff", fontWeight: 700, fontSize: 14.5, cursor: "pointer" }}
              >
                {t("verify_link_continue_btn")}
              </button>
            </>
          )}
        </div>
      </div>
    )}
    {forceUpdate && (
      <div style={{ position: "fixed", inset: 0, zIndex: 3000, background: "rgba(10,30,60,0.94)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: 28, maxWidth: 380, width: "100%", textAlign: "center", boxShadow: "0 8px 32px var(--brand-primary)33" }}>
          {updating ? (
            <>
              <Loader2 size={34} className="spin" style={{ color: "var(--brand-primary)", marginBottom: 14 }} />
              <div style={{ fontSize: 17, fontWeight: 800, color: "var(--brand-text-strong)", marginBottom: 8 }}>{t("update_in_progress_title")}</div>
              <div style={{ fontSize: 13.5, color: "var(--brand-text-secondary)", lineHeight: 1.5 }}>{t("update_in_progress_desc")}</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 34, marginBottom: 10 }}>🔄</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "var(--brand-text-strong)", marginBottom: 8 }}>{t("update_required_title")}</div>
              <div style={{ fontSize: 13.5, color: "var(--brand-text-secondary)", marginBottom: 20, lineHeight: 1.5 }}>{t("update_required_desc")}</div>
              <button
                onClick={startUpdatePolling}
                style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: "var(--brand-primary)", color: "#fff", fontWeight: 700, fontSize: 14.5, cursor: "pointer" }}
              >
                {t("update_required_btn")}
              </button>
            </>
          )}
        </div>
      </div>
    )}
    {needsEmailVerification && !forceUpdate && !needsCguAcceptance && (
      <div style={{ position: "fixed", inset: 0, zIndex: 3050, background: "rgba(10,60,50,0.94)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: 28, maxWidth: 380, width: "100%", textAlign: "center", boxShadow: "0 8px 32px #00000033" }}>
          <div style={{ fontSize: 34, marginBottom: 10 }}>📧</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "var(--brand-text-strong)", marginBottom: 8 }}>{t("verify_gate_title")}</div>
          <div style={{ fontSize: 13.5, color: "var(--brand-text-secondary)", marginBottom: 18, lineHeight: 1.5 }}>
            {t("verify_gate_desc")}{authUser?.email ? ` (${authUser.email})` : ""}
          </div>
          {verifyCheckFailed && (
            <div style={{ fontSize: 12.5, color: "#c0392b", marginBottom: 12, background: "#fdf0ef", borderRadius: 8, padding: "8px 10px" }}>
              {t("verify_gate_still_unverified")}
            </div>
          )}
          {verifyResendStatus === "sent" && (
            <div style={{ fontSize: 12.5, color: "#1a7a4a", marginBottom: 12, background: "#eafaf1", borderRadius: 8, padding: "8px 10px" }}>
              {t("verify_gate_resend_sent")}
            </div>
          )}
          {verifyResendStatus === "error" && (
            <div style={{ fontSize: 12.5, color: "#c0392b", marginBottom: 12, background: "#fdf0ef", borderRadius: 8, padding: "8px 10px" }}>
              {t("verify_gate_resend_error")}
            </div>
          )}
          <button
            onClick={handleCheckEmailVerified}
            disabled={verifyChecking}
            style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: "var(--brand-primary)", color: "#fff", fontWeight: 700, fontSize: 14.5, cursor: verifyChecking ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}
          >
            {verifyChecking ? <Loader2 size={16} className="spin" /> : null}
            {verifyChecking ? t("verify_gate_checking") : t("verify_gate_check_btn")}
          </button>
          <button
            onClick={handleResendVerification}
            disabled={verifySending}
            style={{ width: "100%", padding: "11px 0", borderRadius: 12, border: "1.5px solid #d0e4f5", background: "#fff", color: "var(--brand-primary)", fontWeight: 600, fontSize: 13.5, cursor: verifySending ? "default" : "pointer", marginBottom: 14 }}
          >
            {verifySending ? "..." : t("verify_gate_resend_btn")}
          </button>
          <button
            onClick={handleSignOutFromVerification}
            style={{ background: "none", border: "none", color: "var(--brand-text-muted)", fontSize: 12.5, cursor: "pointer" }}
          >
            {t("verify_gate_signout")}
          </button>
        </div>
      </div>
    )}
    {suspended && (
      <div style={{ position: "fixed", inset: 0, zIndex: 3100, background: "rgba(60,20,20,0.94)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: 28, maxWidth: 380, width: "100%", textAlign: "center", boxShadow: "0 8px 32px #00000033" }}>
          <div style={{ fontSize: 34, marginBottom: 10 }}>⛔</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "var(--brand-text-strong)", marginBottom: 8 }}>{t("suspended_title")}</div>
          <div style={{ fontSize: 13.5, color: "var(--brand-text-secondary)", marginBottom: suspendReason ? 8 : 20, lineHeight: 1.5 }}>{t("suspended_desc")}</div>
          {suspendReason && (
            <div style={{ fontSize: 12.5, color: "var(--brand-text-muted)", marginBottom: 20, fontStyle: "italic", background: "#f5f7fa", borderRadius: 8, padding: "8px 10px" }}>
              {suspendReason}
            </div>
          )}
          <button
            onClick={handleEraseSuspendedData}
            disabled={erasingData}
            style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "1.5px solid #c0392b", background: "#fff", color: "#c0392b", fontWeight: 700, fontSize: 14.5, cursor: erasingData ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            {erasingData ? <Loader2 size={16} className="spin" /> : null}
            {erasingData ? t("suspended_erasing") : t("suspended_erase_btn")}
          </button>
        </div>
      </div>
    )}
    {accountDeleted && !showDataRequestScreen && (
      <div style={{ position: "fixed", inset: 0, zIndex: 3100, background: "rgba(60,20,20,0.94)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: 28, maxWidth: 380, width: "100%", textAlign: "center", boxShadow: "0 8px 32px #00000033" }}>
          <div style={{ fontSize: 34, marginBottom: 10 }}>⛔</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "var(--brand-text-strong)", marginBottom: 8 }}>{t("account_deleted_title")}</div>
          <div style={{ fontSize: 13.5, color: "var(--brand-text-secondary)", marginBottom: 20, lineHeight: 1.5 }}>{t("account_deleted_desc")}</div>
          <button
            onClick={() => {
              if (window.confirm(t("reactivate_confirm"))) reactivateAccount();
            }}
            disabled={reactivating}
            style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: reactivating ? "var(--brand-icon-light)" : "var(--brand-primary)", color: "#fff", fontWeight: 700, fontSize: 14.5, cursor: reactivating ? "default" : "pointer", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            {reactivating ? <Loader2 size={16} className="spin" /> : null}
            {t("reactivate_btn")}
          </button>
          <button
            onClick={() => setShowDataRequestScreen(true)}
            style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "1.5px solid var(--brand-primary)", background: "#fff", color: "var(--brand-primary)", fontWeight: 700, fontSize: 14.5, cursor: "pointer", marginBottom: 14 }}
          >
            {t("account_deleted_request_btn")}
          </button>
          <button
            onClick={handleSignOut}
            style={{ background: "none", border: "none", color: "var(--brand-text-muted)", fontWeight: 600, fontSize: 13, cursor: "pointer", textDecoration: "underline" }}
          >
            {t("back_to_home")}
          </button>
        </div>
      </div>
    )}
    {accountDeleted && showDataRequestScreen && (
      <AccountDataRequestScreen
        lang={lang}
        authUser={authUser}
        onClose={() => setShowDataRequestScreen(false)}
        onSubmit={(action) => FB.sendAccountDataRequest(action, authUser?.uid, authUser?.email)}
      />
    )}
    {/* v1.57.5 — Pendant le chargement de la config cloud (bascule de contexte
        ou tout premier chargement), on affichait jusqu'ici le contenu vide de
        l'ancien contexte (measures/products encore en mémoire) — donnait
        l'impression trompeuse d'un historique perdu le temps que la vraie
        config du nouveau dataUid arrive (1-2s sur mobile). */}
    {/* v1.70.0 — En contexte secondaire, ce spinner générique ne doit plus
        tourner indéfiniment si l'accès a été explicitement refusé
        (poolAccessError) ou si 5s se sont écoulées sans résolution
        (secondaryLoadTimeout) : l'écran "Bassin introuvable" prend le relais
        dans ces deux cas au lieu de laisser croire à un simple chargement. */}
    {loaded && authUser && !suspended && !accountDeleted && !forceUpdate && !needsEmailVerification && !needsCguAcceptance && !cloudConfigReceived && !(viewContext && (poolAccessError || secondaryLoadTimeout)) && (
      <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "#f5f8f7", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={34} className="spin" style={{ marginBottom: 10, color: "var(--brand-primary)" }} />
        <div style={{ fontSize: 13.5, color: "var(--brand-text-secondary)" }}>{t("context_loading")}</div>
      </div>
    )}
    {loaded && authUser && !suspended && !accountDeleted && !forceUpdate && !needsEmailVerification && !needsCguAcceptance && activePools.length === 0 && cloudConfigReceived && !viewContext && onboardingSeen && (
      <AddPoolModal forced onSave={addPool} lang={lang} />
    )}
    {/* v1.87.0 — L'onboarding doit venir AVANT la création du premier bassin, pas
        après (ordre inversé jusqu'ici : le formulaire de création s'affichait
        immédiatement, l'onboarding ne se déclenchait qu'une fois addPool() appelé).
        Condition identique à isFirstPoolEver (pools.length === 0 dans addPool),
        mais évaluée ici en amont via activePools.length === 0 && !onboardingSeen. */}
    {loaded && authUser && !suspended && !accountDeleted && !forceUpdate && !needsEmailVerification && !needsCguAcceptance && activePools.length === 0 && cloudConfigReceived && !viewContext && !onboardingSeen && (
      <OnboardingWizard onDone={markOnboardingSeen} lang={lang} />
    )}
    {/* v1.57.3 — En contexte secondaire, activePools peut être vide un court
        instant (le temps que la config du principal arrive après le switch
        de contexte) ou durablement (accès révoqué, bassin supprimé). Dans les
        deux cas, ce n'est JAMAIS au secondaire de créer un bassin — l'ancien
        code affichait le formulaire de création forcée y compris ici, un
        cul-de-sac puisque addPool() est un no-op en contexte secondaire.
        v1.70.0 — Se déclenche aussi sur poolAccessError (refus confirmé) ou
        secondaryLoadTimeout (5s sans résolution), pas seulement quand
        cloudConfigReceived est déjà arrivé avec un tableau de bassins vide. */}
    {loaded && authUser && !suspended && !accountDeleted && !forceUpdate && !needsEmailVerification && !needsCguAcceptance && viewContext &&
      ((activePools.length === 0 && cloudConfigReceived) || poolAccessError || secondaryLoadTimeout) && (
      <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "#f5f8f7", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
        <Droplets size={40} color="var(--brand-icon-light)" style={{ marginBottom: 16 }} />
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--brand-text-strong)", marginBottom: 8 }}>
          {t("secondary_pool_unavailable_title")}
        </div>
        <div style={{ fontSize: 13.5, color: "var(--brand-text-muted)", marginBottom: 24, maxWidth: 320 }}>
          {poolAccessError === "denied" ? t("secondary_pool_revoked_desc") : t("secondary_pool_unavailable_desc")}
        </div>
        <button
          onClick={() => switchToContext(null)}
          style={{ padding: "12px 24px", borderRadius: 12, border: "none", background: "var(--brand-primary)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
        >
          {t("context_own")}
        </button>
      </div>
    )}
    {showLogin && (
      <div style={{ position: "fixed", inset: 0, zIndex: 1000, overflowY: "auto" }}>
        <LoginScreen
          lang={lang}
          detectedLang={detectedLang}
          onSkip={() => {
            // Désactivé — la vérification email persistante (needsEmailVerification)
            // prend le relais automatiquement une fois cet écran fermé.
          }}
          onConsentChange={({ cguVersion: v, cguDate }) => {
            if (v) { setAcceptedCguVersion(v); setCguAcceptedDate(cguDate || new Date().toISOString()); }
          }}
        />
      </div>
    )}
    <div
      style={{
        ...styles.app,
        // v1.82.0 — themeVars calculé une fois en tête du composant (voir plus
        // haut) et réappliqué ici aussi ; redondant avec le conteneur racine
        // mais inoffensif, et évite de casser un éventuel style CSS ciblant
        // spécifiquement .app pour d'autres besoins.
        ...themeVars,
      }}
      className="app"
    >
      {typeof window !== "undefined" && window.__poolgenaiEnv && window.__poolgenaiEnv !== "prod" && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 5000,
            textAlign: "center", padding: "4px 0", fontSize: 11, fontWeight: 700,
            letterSpacing: 0.5, color: "#fff",
            background: window.__poolgenaiEnv === "test" ? "#c98a1f" : "#7a3fb0",
          }}
        >
          {window.__poolgenaiEnv === "test" ? "🧪 ENVIRONNEMENT TEST" : "🛠️ ENVIRONNEMENT DEV"}
        </div>
      )}
      <Header
        poolName={activePool?.name}
        location={activePool?.location}
        poolPhoto={activePool?.photo}
        isPremium={effectiveIsPremium}
        entries={switcherEntries}
        activeEntryKey={activeEntryKey}
        onSelectEntry={handleSelectSwitcherEntry}
        onAddPool={handleWantAddPool}
        viewContext={viewContext}
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
            isPremium={effectiveIsPremium}
            apiKey={aiEnabled && effectiveIsPremium ? apiKey : ""}
            apiProvider={apiProvider}
            recentMeasures={sortedMeasures}
            effectiveTargets={effectiveTargets}
            activeParamKeys={activeParamKeys}
            activePlan={activePlan}
            onResumePlan={() => setShowWizard(true)}
            onOpenManualApply={() => setShowManualApply(true)}
            authUid={dataUid}
          />
        )}
        {tab === "history" && (
          <HistoryView
            measures={sortedMeasures}
            onDelete={deleteMeasure}
            onEdit={handleEditMeasure}
            onAdd={handleOpenAddMeasure}
            onAddPrefilled={(prefilled) => {
              setEditingMeasure({ ...prefilled, __prefilled: true });
              setEditingApplication(null);
              setShowAddMeasure(true);
            }}
            onValidateApplication={handleValidateApplication}
            applications={poolApplications}
            isPremium={effectiveIsPremium}
            poolName={activePool?.name}
            onGenerateReport={() => setShowReport(true)}
            onWantPremiumForReport={() => openPaywall("report")}
            lang={lang}
            apiKey={aiEnabled && effectiveIsPremium ? apiKey : ""}
            apiProvider={apiProvider}
            authUid={dataUid}
            pool={activePool}
            activePlan={activePlan}
          />
        )}
        {tab === "products" && showProductsToBuy && (
          <ProductsToBuyView
            products={poolProducts}
            plan={activePlan}
            latest={latest}
            volume={activePool?.volume || 0}
            effectiveTargets={effectiveTargets}
            activeParamKeys={activeParamKeys}
            lang={lang}
            manageStock={!!activePool?.manageStock}
            poolName={activePool?.name}
            treatmentType={activePool?.treatmentType}
            onQuickAddProduct={(dp) => saveProduct({ ...dp, stockPercent: 0, isDefault: false, photo: null })}
            onBack={() => setShowProductsToBuy(false)}
            onEditProduct={(p) => {
              setEditingProduct(p);
              setShowAddProduct(true);
              setShowProductsToBuy(false);
            }}
          />
        )}
        {tab === "products" && !showProductsToBuy && (
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
            isPremium={effectiveIsPremium}
            poolName={activePool?.name}
            manageStock={!!activePool?.manageStock}
            onWantPremium={() => openPaywall("products")}
            onWantSettings={() => setTab("settings")}
            onWantProductsToBuy={() => setShowProductsToBuy(true)}
            lang={lang}
          />
        )}
        {tab === "settings" && (
          <>
          <SettingsView
            pools={activePools}
            activePoolId={activePoolId}
            onUpdatePool={updatePool}
            onDeletePool={deletePool}
            onSwitchPool={setActivePoolId}
            onWantAddPool={handleWantAddPool}
            viewContext={viewContext}
            onDeleteAllMeasures={deleteAllMeasuresForActivePool}
            orphanedCount={orphanedCount}
            onRepairOrphanedData={repairOrphanedData}
            authUser={authUser}
            onSignOut={handleSignOut}
            onSignIn={() => setShowLogin(true)}
            onDeleteAccount={async () => {
              const isGoogle = authUser?.providerData?.some(p => p.providerId === "google.com");
              if (isGoogle) {
                try {
                  try {
                    await FB.reauthGoogle();
                  } catch (reauthErr) {
                    if (reauthErr.code !== "auth/cancelled-popup-request") throw reauthErr;
                    return;
                  }
                  await performDeleteAccount();
                } catch (e) {
                  alert(e.message);
                }
                return;
              }
              // Compte email/mot de passe : demande le mot de passe avant de tenter la suppression
              setDeleteReauthError(null);
              setShowDeleteReauth(true);
            }}
            poolMeasureCount={poolMeasures.length}
            onGenerateReport={() => setShowReport(true)}
            onWantPremiumForReport={() => openPaywall("report")}
            onWantPremium={() => openPaywall()}
            isPremium={isPremium}
            setIsPremium={setIsPremium}
            onWantManageSubscription={handleOpenPortal}
            portalBusy={portalBusy}
            portalError={portalError}
            onReplayOnboarding={() => setShowOnboarding(true)}
            aiEnabled={aiEnabled}
            setAiEnabled={setAiEnabled}
            calibrationContribution={calibrationContribution}
            setCalibrationContribution={setCalibrationContribution}
            lang={lang}
            setLang={setLang}
            cguAcceptedDate={cguAcceptedDate}
            dataConsent={dataConsent}
            myPseudo={myPseudo}
            onRevokeDataConsent={() => {
              setDataConsent(false);
              if (authUser?.uid) {
                FB.saveUser(authUser.uid, { dataConsent: false, dataConsentDate: null }).catch(() => {});
              }
            }}
          />
          {authUser && (
            <DelegationSection
              authUser={authUser}
              lang={lang}
              linkedPoolsInfo={linkedPoolsInfo}
              onRequestRevocation={handleRequestRevocation}
              isPremium={isPremium}
            />
          )}
          <DangerZoneSection
            lang={lang}
            activePoolName={pools.find((p) => p.id === activePoolId)?.name}
            poolMeasureCount={poolMeasures.length}
            onDeleteAllMeasures={deleteAllMeasuresForActivePool}
            authUser={authUser}
            cguAcceptedDate={cguAcceptedDate}
            onDeleteAccount={async () => {
              const isGoogle = authUser?.providerData?.some(p => p.providerId === "google.com");
              if (isGoogle) {
                try {
                  try {
                    await FB.reauthGoogle();
                  } catch (reauthErr) {
                    if (reauthErr.code !== "auth/cancelled-popup-request") throw reauthErr;
                    return;
                  }
                  await performDeleteAccount();
                } catch (e) {
                  alert(e.message);
                }
                return;
              }
              setDeleteReauthError(null);
              setShowDeleteReauth(true);
            }}
          />
          </>
        )}
      </main>


      <TabBar tab={tab} setTab={setTab} lang={lang} viewContext={viewContext} />

      {showAddMeasure && (
        <AddMeasureModal
          measure={editingMeasure}
          application={editingApplication}
          products={poolProducts}
          manageStock={!!activePool?.manageStock}
          onSaveApplication={editHistoricalApplication}
          onClose={() => {
            setShowAddMeasure(false);
            setEditingMeasure(null);
            setEditingApplication(null);
          }}
          onSave={addMeasure}
          isPremium={effectiveIsPremium}
          onRequestPhotoAccess={(cb) => {
            setPhotoWarningCallback(() => cb);
            setShowPhotoWarning(true);
          }}
          onWantPremium={(source) => {
            setShowAddMeasure(false);
            setEditingMeasure(null);
            setEditingApplication(null);
            openPaywall(source || "photos");
          }}
          apiKey={aiEnabled && effectiveIsPremium ? apiKey : ""}
          apiProvider={apiProvider}
          activeParamKeys={activeParamKeys}
          lang={lang}
          authUid={dataUid}
          measureDevice={activePool?.measureDevice}
          stripProducts={poolProducts.filter((p) => p.action === "outil-mesure")}
          calibrationContribution={calibrationContribution}
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
          isPremium={effectiveIsPremium}
          onWantPremium={(source) => {
            setShowAddProduct(false);
            setEditingProduct(null);
            openPaywall(source || "products");
          }}
          applications={poolApplications}
          manageStock={!!activePool?.manageStock}
          lang={lang}
          aiEnabled={aiEnabled}
          apiKey={aiEnabled && effectiveIsPremium ? apiKey : ""}
          apiProvider={apiProvider}
          authUid={dataUid}
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
          source={paywallSource}
          busy={checkoutBusy}
          error={checkoutError}
          onClose={() => { if (!checkoutBusy) { setShowPaywall(false); setCheckoutError(null); } }}
          onActivate={(plan) => handleStartCheckout(plan)}
        />
      )}

      {showPremiumReveal && (
        <PremiumRevealOverlay onDone={() => setShowPremiumReveal(false)} lang={lang} variant={revealVariant} />
      )}

      {showOnboarding && (
        <OnboardingWizard onDone={markOnboardingSeen} lang={lang} />
      )}

      {showAddPool && (
        <AddPoolModal onClose={() => setShowAddPool(false)} onSave={addPool} lang={lang} />
      )}

      {showDeleteReauth && (
        <DeleteReauthModal
          lang={lang}
          busy={deleteReauthBusy}
          error={deleteReauthError}
          onClose={() => { setShowDeleteReauth(false); setDeleteReauthError(null); }}
          onConfirm={async (password) => {
            setDeleteReauthBusy(true);
            setDeleteReauthError(null);
            try {
              await FB.reauthEmail(password);
              await performDeleteAccount();
              setShowDeleteReauth(false);
            } catch (e) {
              if (e.code === "auth/wrong-password" || e.code === "auth/invalid-credential") {
                setDeleteReauthError(t("wrong_password"));
              } else {
                setDeleteReauthError(e.message);
              }
            } finally {
              setDeleteReauthBusy(false);
            }
          }}
        />
      )}


      {showPhotoWarning && (
        <div style={{ position: "fixed", inset: 0, zIndex: 600, background: "rgba(10,30,60,0.65)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 24, maxWidth: 420, width: "100%", boxShadow: "0 8px 32px var(--brand-primary)22" }}>
            <div style={{ fontSize: 28, textAlign: "center", marginBottom: 8 }}>📸</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--brand-text-strong)", textAlign: "center", marginBottom: 12 }}>
              {tFn("photo_warning_title")}
            </div>
            <div style={{ fontSize: 13, color: "var(--brand-text-secondary)", lineHeight: 1.7, background: "#f5f8fc", borderRadius: 10, padding: "12px 14px", marginBottom: 16, whiteSpace: "pre-line" }}>
              {tFn("photo_warning_body")}
            </div>
            <button
              style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: "var(--brand-primary)", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
              onClick={() => {
                setShowPhotoWarning(false);
                if (photoWarningCallback) { photoWarningCallback(); setPhotoWarningCallback(null); }
              }}
            >
              {tFn("photo_warning_confirm")}
            </button>
            <button
              onClick={() => { setShowPhotoWarning(false); setPhotoWarningCallback(null); }}
              style={{ width: "100%", background: "none", border: "none", color: "#9ab0c4", fontSize: 13, cursor: "pointer", marginTop: 8, padding: "6px 0" }}
            >
              {tFn("cancel")}
            </button>
          </div>
        </div>
      )}

      {/* v1.83.0 — Écran bloquant CGU : jamais accepté (comptes Google, jamais
          passés par la case CGU du signup email) ou version dépassée (re-acceptation).
          zIndex 3060 > 3050 (vérification email) : la CGU prime toujours. */}
      {needsCguAcceptance && !showLogin && (
        <div style={{ position: "fixed", inset: 0, zIndex: 3060, background: "rgba(10,30,60,0.92)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 24, maxWidth: 440, width: "100%", maxHeight: "90dvh", overflowY: "auto", boxSizing: "border-box", boxShadow: "0 8px 32px var(--brand-primary)22" }}>
            <div style={{ fontSize: 24, textAlign: "center", marginBottom: 8 }}>📋</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--brand-text-strong)", textAlign: "center", marginBottom: 8 }}>
              {tFn(cguNeverAccepted ? "cgu_required_title" : "cgu_updated_title")}
            </div>
            <div style={{ fontSize: 13, color: "var(--brand-text-secondary)", lineHeight: 1.6, marginBottom: 16, textAlign: "center" }}>
              {tFn(cguNeverAccepted ? "cgu_required_body" : "cgu_updated_body")}
            </div>
            <div style={{ fontSize: 11, color: "#9ab0c4", textAlign: "center", marginBottom: 16 }}>
              CGU {CGU_VERSION}
            </div>
            <button
              style={{ width: "100%", background: "none", border: "none", color: "var(--brand-primary)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", textAlign: "center", marginBottom: 14, textDecoration: "underline" }}
              onClick={() => setShowFullCguInGate((v) => !v)}
            >
              {tFn(showFullCguInGate ? "cgu_hide_full_text" : "cgu_read_full_text")}
            </button>
            {showFullCguInGate && (
              <div style={{ maxHeight: 260, overflowY: "auto", fontSize: 11.5, color: "#2d4a6e", lineHeight: 1.6, background: "#f5f8fc", borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
                <CguLegalContent lang={lang} />
              </div>
            )}
            <button
              style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: "var(--brand-primary)", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
              onClick={() => {
                const now = new Date().toISOString();
                setAcceptedCguVersion(CGU_VERSION);
                setCguAcceptedDate(now);
                if (authUser?.uid) {
                  FB.saveUser(authUser.uid, { cguVersion: CGU_VERSION, cguAcceptedDate: now }).catch(() => {});
                }
              }}
            >
              {tFn("disclaimer_cgu")}
            </button>
          </div>
        </div>
      )}

      {showWizard && activePlan && effectiveIsPremium && (
        <TreatmentWizard
          plan={activePlan}
          products={poolProducts}
          manageStock={!!activePool?.manageStock}
          lang={lang}
          onApplyStep={(idx, amount, appliedAt, productName) => { applyWizardStep(idx, amount, appliedAt, productName); }}
          onSkipStep={(idx) => { skipWizardStep(idx); }}
          onEditPrevStep={editWizardStep}
          onClose={() => { setShowWizard(false); }}
          onCancel={() => { cancelPlan(); setShowWizard(false); }}
          onWantAddProduct={() => { setShowWizard(false); setTab("products"); }}
        />
      )}

      {showManualApply && (
        <ManualApplyModal
          products={poolProducts}
          lang={lang}
          onClose={() => setShowManualApply(false)}
          onSave={saveManualApplication}
        />
      )}

      {showReport && effectiveIsPremium && (
        <ReportView
          pool={activePool}
          measures={poolMeasures}
          applications={poolApplications}
          products={poolProducts}
          onClose={() => setShowReport(false)}
          manageStock={!!activePool?.manageStock}
          lang={lang}
          authUid={dataUid}
          isPremium={effectiveIsPremium}
        />
      )}

      {lightboxSrc && (
        <PhotoLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}
    </div>
    </div>
  );
}

// ---------- Photo Lightbox ----------
function PhotoLightbox({ src, onClose }) {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const lastDist = useRef(null);
  const lastPos = useRef(null);
  const isDragging = useRef(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function getDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function handleTouchStart(e) {
    if (e.touches.length === 2) {
      lastDist.current = getDistance(e.touches);
    } else if (e.touches.length === 1) {
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      isDragging.current = false;
    }
  }

  function handleTouchMove(e) {
    e.preventDefault();
    if (e.touches.length === 2) {
      const dist = getDistance(e.touches);
      if (lastDist.current) {
        const delta = dist / lastDist.current;
        setScale(s => Math.min(Math.max(s * delta, 1), 5));
      }
      lastDist.current = dist;
    } else if (e.touches.length === 1 && scale > 1) {
      if (lastPos.current) {
        const dx = e.touches[0].clientX - lastPos.current.x;
        const dy = e.touches[0].clientY - lastPos.current.y;
        setTranslate(t => ({ x: t.x + dx, y: t.y + dy }));
        isDragging.current = true;
      }
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }

  function handleTouchEnd(e) {
    lastDist.current = null;
    if (scale <= 1) setTranslate({ x: 0, y: 0 });
  }

  function handleOverlayClick() {
    if (!isDragging.current) onClose();
    isDragging.current = false;
  }

  function handleDoubleTap() {
    if (scale > 1) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    } else {
      setScale(2.5);
    }
  }

  return (
    <div
      onClick={handleOverlayClick}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.92)",
        display: "flex", alignItems: "center", justifyContent: "center",
        touchAction: "none",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <img
        src={src}
        alt=""
        onDoubleClick={(e) => { e.stopPropagation(); handleDoubleTap(); }}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "100vw",
          maxHeight: "100vh",
          objectFit: "contain",
          transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
          transformOrigin: "center center",
          transition: scale === 1 ? "transform 0.25s ease" : "none",
          userSelect: "none",
          pointerEvents: "auto",
        }}
        draggable={false}
      />
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        style={{
          position: "fixed", top: 16, right: 16,
          background: "rgba(0,0,0,0.55)", border: "none", borderRadius: "50%",
          width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: "#fff", zIndex: 1001,
        }}
      >
        <X size={20} />
      </button>
      {scale > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setScale(1); setTranslate({ x: 0, y: 0 }); }}
          style={{
            position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
            background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: 20, padding: "6px 18px", color: "#fff", fontSize: 12,
            fontWeight: 600, cursor: "pointer", zIndex: 1001,
          }}
        >
          1×
        </button>
      )}
    </div>
  );
}

// ---------- Header ----------
function Header({ poolName, location, poolPhoto, isPremium, entries, activeEntryKey, onSelectEntry, onAddPool, viewContext, lang }) {
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
            {entries.map((entry) => {
              const active = entry.key === activeEntryKey;
              return (
                <button
                  key={entry.key}
                  style={{
                    ...styles.poolSwitcherItem,
                    background: active ? "#e9f6f1" : "transparent",
                  }}
                  onClick={() => {
                    onSelectEntry(entry);
                    setShowSwitcher(false);
                  }}
                >
                  <Droplets size={16} color={active ? "var(--brand-primary)" : "var(--brand-text-muted)"} />
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 13.5, color: "var(--brand-text-strong)" }}>{entry.name}</span>
                      {entry.photo && (
                        <img src={entry.photo} alt="" style={styles.poolSwitcherThumbInline} />
                      )}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--brand-text-muted)" }}>
                      {entry.kind === "invited" ? entry.pseudo : entry.location}
                    </div>
                  </div>
                  {active && <CheckCircle2 size={16} color="#1a8fd1" />}
                </button>
              );
            })}
            {!viewContext && (
              <button
                style={styles.poolSwitcherAddBtn}
                onClick={() => {
                  setShowSwitcher(false);
                  onAddPool();
                }}
              >
                <Plus size={16} /> {t("add_pool")}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

// ---------- Tab bar ----------
function TabBar({ tab, setTab, lang, viewContext }) {
  const t = useT(lang);
  const tabs = [
    { id: "dashboard", label: t("tab_pool"), icon: Droplets },
    { id: "history", label: t("tab_history"), icon: History },
    { id: "products", label: t("tab_products"), icon: Beaker },
    { id: "settings", label: t("tab_settings"), icon: Settings2 },
  ];
  return (
    <div style={{ width: "100%", flexShrink: 0 }}>
      {viewContext && (
        <div style={{ textAlign: "center", fontSize: 9.5, color: "#b0bec8", padding: "2px 0", background: "#f5f8fc", letterSpacing: 0.3 }}>
          {t("banner_secondary", { pool: viewContext.poolName, pseudo: viewContext.pseudo })}
        </div>
      )}
      <div style={{ textAlign: "center", fontSize: 9.5, color: "#b0bec8", padding: "2px 0", background: "#f5f8fc", letterSpacing: 0.3, borderTop: "1px solid #e8eef2" }}>
        PoolGenAI v{APP_VERSION}
      </div>
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
                color: active ? "var(--brand-primary)" : "var(--brand-text-muted)",
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
    </div>
  );
}

// ---------- v1.55.0 — Utilisateurs secondaires (brique 3) ----------
function DelegationSection({ authUser, lang, linkedPoolsInfo, onRequestRevocation, isPremium }) {
  const t = useT(lang);
  const [secondaries, setSecondaries] = useState([]); // personnes que j'ai invitées (moi = principal)
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [myPools, setMyPools] = useState([]); // mes propres bassins (pour le sélecteur d'invitation)
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePoolId, setInvitePoolId] = useState("");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteMsg, setInviteMsg] = useState(null);
  const [revokeReqBusy, setRevokeReqBusy] = useState(null); // primaryUid en cours
  const [revokeReqMsg, setRevokeReqMsg] = useState(null); // { primaryUid, text }

  useEffect(() => {
    if (!authUser?.uid || !FB.ready()) return;
    FB.getConfig(authUser.uid).then((cfg) => {
      setMyPools((cfg?.pools || []).filter((p) => !p.disabled));
    }).catch(() => {});
  }, [authUser?.uid]);

  useEffect(() => {
    if (!authUser?.uid || !FB.ready()) return;
    const unsub = FB.onSecondaryUsers(authUser.uid, setSecondaries);
    return () => unsub();
  }, [authUser?.uid]);

  async function refreshPendingInvitations() {
    if (!authUser) return;
    try {
      const idToken = await authUser.getIdToken();
      const res = await fetch(`${PROXY_BASE_URL}/list-pending-invitations`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json().catch(() => ({}));
      setPendingInvitations(data.invitations || []);
    } catch (e) {}
  }
  useEffect(() => { refreshPendingInvitations(); }, [authUser?.uid, secondaries.length]);

  async function handleInviteSend() {
    if (!authUser || !inviteEmail || !invitePoolId) return;
    setInviteBusy(true);
    setInviteMsg(null);
    try {
      const idToken = await authUser.getIdToken();
      const res = await fetch(`${PROXY_BASE_URL}/invite-secondary-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ poolId: invitePoolId, invitedEmail: inviteEmail.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setInviteMsg({ type: "error", text: data.error || t("secondary_invite_error") });
        return;
      }
      setInviteMsg({ type: "ok", text: t("secondary_invite_sent") });
      setInviteEmail("");
      refreshPendingInvitations();
    } catch (e) {
      setInviteMsg({ type: "error", text: t("secondary_invite_error") });
    } finally {
      setInviteBusy(false);
    }
  }

  async function handleRevoke(secondaryUid, email) {
    if (!authUser) return;
    const ok = window.confirm(t("secondary_revoke_confirm", { email }));
    if (!ok) return;
    try {
      const idToken = await authUser.getIdToken();
      const res = await fetch(`${PROXY_BASE_URL}/revoke-secondary-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ secondaryUid }),
      });
      if (!res.ok) alert(t("secondary_revoke_error"));
    } catch (e) {
      alert(t("secondary_revoke_error"));
    }
  }

  // v1.56.0 — Annule une invitation encore en attente (avant acceptation),
  // distinct de handleRevoke qui ne concerne que les accès déjà actifs.
  async function handleCancelInvitation(token, email) {
    if (!authUser) return;
    const ok = window.confirm(t("secondary_cancel_confirm", { email }));
    if (!ok) return;
    try {
      const idToken = await authUser.getIdToken();
      const res = await fetch(`${PROXY_BASE_URL}/cancel-invitation`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        alert(t("secondary_cancel_error"));
        return;
      }
      refreshPendingInvitations();
    } catch (e) {
      alert(t("secondary_cancel_error"));
    }
  }

  // v1.60.0 — Demande de révocation de mon propre accès (bassin où je suis
  // invité). Je ne peux pas me révoquer moi-même (écriture réservée au
  // Worker) : ça envoie un email au propriétaire avec un lien de confirmation.
  async function handleRequestRevocation(link) {
    if (!authUser) return;
    const ok = window.confirm(t("request_revocation_confirm", { pool: link.poolName, pseudo: link.pseudo }));
    if (!ok) return;
    setRevokeReqBusy(link.primaryUid);
    setRevokeReqMsg(null);
    try {
      await onRequestRevocation(link.primaryUid);
      setRevokeReqMsg({ primaryUid: link.primaryUid, text: t("request_revocation_sent") });
    } catch (e) {
      setRevokeReqMsg({ primaryUid: link.primaryUid, text: t("request_revocation_error"), error: true });
    } finally {
      setRevokeReqBusy(null);
    }
  }

  const activeSecondaries = secondaries.filter((s) => s.status === "active");
  // v1.95.0 — La limite est désormais posée PAR BASSIN (2 invités max par
  // bassin en Premium, 0 en gratuit), plus sur l'ensemble du compte.
  const activeSecondariesForSelectedPool = invitePoolId
    ? activeSecondaries.filter((s) => s.poolId === invitePoolId)
    : [];
  const selectedPoolFull = !!invitePoolId && activeSecondariesForSelectedPool.length >= 2;
  const activeLinkedPools = (linkedPoolsInfo || []).filter((l) => l.status === "active");
  const sectionTitleStyle = { fontSize: 13, fontWeight: 700, color: "var(--brand-text-strong)", marginBottom: 8 };
  const subTitleStyle = { fontSize: 12.5, fontWeight: 600, color: "var(--brand-text-secondary)", marginBottom: 6 };
  const emptyStyle = { fontSize: 12.5, color: "#8a9aa8", marginBottom: 14 };
  const cardStyle = { padding: "10px 12px", border: "1px solid #d8e2ec", borderRadius: 10 };

  return (
    <div style={{ marginTop: 24, padding: "0 16px 24px" }}>
      <div style={sectionTitleStyle}>{t("delegation_section_title")}</div>

      {/* v1.60.0 — Bassins où JE suis invité (l'inverse de "Utilisateurs
          secondaires" ci-dessous, qui liste les personnes que J'AI invitées).
          Pas de révocation directe côté invité : demande envoyée par email
          au propriétaire, qui confirme via un lien (voir /request-revoke-own-access). */}
      <div style={subTitleStyle}>{t("linked_pools_title")}</div>
      {activeLinkedPools.length === 0 ? (
        <div style={emptyStyle}>{t("linked_pools_empty")}</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
          {activeLinkedPools.map((l) => (
            <div key={l.primaryUid} style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--brand-text-strong)" }}>{l.poolName || t("secondary_pool_label", { pool: "" })}</div>
                  <div style={{ fontSize: 11.5, color: "#8a9aa8" }}>{l.pseudo}</div>
                </div>
                <button
                  onClick={() => handleRequestRevocation(l)}
                  disabled={revokeReqBusy === l.primaryUid}
                  style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid #e0a0a0", background: "#fff5f5", color: "#c0392b", fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}
                >
                  {revokeReqBusy === l.primaryUid ? "..." : t("request_revocation_button")}
                </button>
              </div>
              {revokeReqMsg?.primaryUid === l.primaryUid && (
                <div style={{ fontSize: 11.5, color: revokeReqMsg.error ? "#c0392b" : "#1a7a4a", marginTop: 6 }}>
                  {revokeReqMsg.text}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={sectionTitleStyle}>{t("secondary_section_title")}</div>
      <div style={{ fontSize: 12, color: "var(--brand-text-muted)", marginBottom: 12 }}>{t("secondary_section_intro")}</div>

      <div style={subTitleStyle}>{t("secondary_active_title")}</div>
      {activeSecondaries.length === 0 ? (
        <div style={emptyStyle}>{t("secondary_active_empty")}</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
          {activeSecondaries.map((s) => (
            <div key={s.secondaryUid} style={{ ...cardStyle, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--brand-text-strong)" }}>{s.email}</div>
                <div style={{ fontSize: 11.5, color: "#8a9aa8" }}>
                  {t("secondary_pool_label", { pool: myPools.find((p) => p.id === s.poolId)?.name || s.poolId })}
                </div>
              </div>
              <button
                onClick={() => handleRevoke(s.secondaryUid, s.email)}
                style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid #e0a0a0", background: "#fff5f5", color: "#c0392b", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
              >
                {t("secondary_revoke_button")}
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={subTitleStyle}>{t("secondary_pending_title")}</div>
      {pendingInvitations.length === 0 ? (
        <div style={emptyStyle}>{t("secondary_pending_empty")}</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
          {pendingInvitations.map((inv) => (
            <div key={inv.token || (inv.invitedEmail + inv.poolId)} style={{ ...cardStyle, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--brand-text-strong)" }}>{inv.invitedEmail}</div>
                <div style={{ fontSize: 11.5, color: "#8a9aa8" }}>
                  {t("secondary_pool_label", { pool: inv.poolName })} ·{" "}
                  {inv.expired
                    ? t("secondary_pending_expired")
                    : t("secondary_pending_expires", { date: new Date(inv.expiresAt).toLocaleDateString(lang) })}
                </div>
              </div>
              {inv.token && (
                <button
                  onClick={() => handleCancelInvitation(inv.token, inv.invitedEmail)}
                  style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid #e0a0a0", background: "#fff5f5", color: "#c0392b", fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}
                >
                  {t("secondary_cancel_button")}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!isPremium ? (
        <div style={emptyStyle}>{t("secondary_invite_requires_premium")}</div>
      ) : (
        <>
          <div style={subTitleStyle}>{t("secondary_invite_button")}</div>
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder={t("secondary_invite_email_label")}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #d8e2ec", fontSize: 13.5, marginBottom: 8, boxSizing: "border-box" }}
          />
          <select
            value={invitePoolId}
            onChange={(e) => setInvitePoolId(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #d8e2ec", fontSize: 13.5, marginBottom: 8 }}
          >
            <option value="">{t("secondary_invite_pool_label")}</option>
            {myPools.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {selectedPoolFull && (
            <div style={{ fontSize: 12, color: "#c0392b", marginBottom: 8 }}>{t("secondary_invite_pool_full")}</div>
          )}
          <button
            onClick={handleInviteSend}
            disabled={inviteBusy || !inviteEmail || !invitePoolId || selectedPoolFull}
            style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: "var(--brand-primary)", color: "#fff", fontWeight: 700, fontSize: 13.5, cursor: inviteBusy ? "not-allowed" : "pointer" }}
          >
            {t("secondary_invite_send")}
          </button>
          {inviteMsg && (
            <div style={{ fontSize: 12, color: inviteMsg.type === "error" ? "#c0392b" : "#1a8fd1", marginTop: 8 }}>{inviteMsg.text}</div>
          )}
        </>
      )}
    </div>
  );
}

// ---------- Dashboard ----------
function Dashboard({ latest, volume, products, manageStock, onAddMeasure, onEditMeasure, onValidateApplication, applicationForLatest, blockedByLimit, isPremium, onWantPremium, apiKey, apiProvider, recentMeasures, effectiveTargets, activeParamKeys, lang, activePlan, onResumePlan, onOpenManualApply, authUid }) {
  const t = useT(lang);
  const [aiComment, setAiComment] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  // v1.40.0 — Vignettes de toutes les photos (analyse + bassin) de la dernière
  // mesure, chargées depuis la sous-collection measures/{id}/photos (voir
  // MeasureRow pour le même pattern en historique). Une mesure tout juste
  // ajoutée dans cette session garde encore latest.photos/photo en mémoire
  // locale (pas encore écrasé par le snapshot cloud) : dans ce cas pas besoin
  // de fetch, on les utilise directement.
  const [latestPhotos, setLatestPhotos] = useState(null);
  useEffect(() => {
    setLatestPhotos(null);
    if (!latest) return;
    const hasAnyPhotos = !!(latest.photoCount || latest.poolPhotoCount || latest.photo || latest.photos?.length || latest.poolPhotos?.length);
    if (!hasAnyPhotos) return;
    if (latest.photos?.length || latest.photo || latest.poolPhotos?.length) {
      setLatestPhotos([
        ...(latest.photos?.length ? latest.photos : (latest.photo ? [latest.photo] : [])),
        ...(latest.poolPhotos || []),
      ]);
      return;
    }
    if (!authUid) return;
    let cancelled = false;
    FB.getMeasurePhotos(authUid, latest.id)
      .then(({ photos, poolPhotos }) => {
        if (cancelled) return;
        setLatestPhotos([...photos, ...poolPhotos]);
      })
      .catch(() => { if (!cancelled) setLatestPhotos([]); });
    return () => { cancelled = true; };
  }, [latest?.id, authUid]);

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

      const text = await callAIText({ apiKey, apiProvider, prompt, uid: authUid });
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
        <Droplets size={40} color="var(--brand-icon-light)" strokeWidth={1.5} />
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

      {latestPhotos?.length > 0 && (
        <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 12 }}>
          {latestPhotos.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt=""
              style={{ height: 90, borderRadius: 8, objectFit: "cover", flexShrink: 0, border: "1px solid #d0e4f5", cursor: "zoom-in" }}
              onClick={() => window._openLightbox?.(src)}
            />
          ))}
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

      {(() => {
        // v1.65.1 — Une fois le plan de traitement entièrement terminé (tous
        // les steps appliqués, aucun skip), on n'affiche plus les cartes de
        // recommandations : elles restent basées sur la mesure d'origine
        // (toujours hors cible) et n'apportent plus rien une fois le plan
        // clos. Seule la confirmation "Plan de traitement terminé ✓" reste.
        const planForLatest = activePlan && latest && activePlan.measureId === latest.id ? activePlan : null;
        const planFullyDone = !!(applicationForLatest && !planForLatest && applicationForLatest.allApplied);

        if (recs.length === 0) {
          return (
            <div style={styles.allGoodCard}>
              <CheckCircle2 size={22} color="#1a8fd1" />
              <span style={{ color: "var(--brand-primary)", fontWeight: 600, fontSize: 14 }}>
                {t("all_in_range")}
              </span>
            </div>
          );
        }

        if (planFullyDone) {
          return (
            <div style={styles.applyConfirmedCard}>
              <CheckCircle2 size={16} color="#1a8fd1" />
              <span style={{ flex: 1 }}>{t("wizard_completed")}</span>
            </div>
          );
        }

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recs.orderExplanation && (
              <p style={styles.helpText}>{recs.orderExplanation}</p>
            )}
            {recs.length > 1 && (
              <p style={styles.helpText}>{t("follow_order")}</p>
            )}
            {recs.map((r, i) => (
              <RecoCard
                key={i}
                reco={r}
                isLast={i === recs.length - 1}
                manageStock={manageStock}
                products={products}
                lang={lang}
              />
            ))}

            {(() => {
              if (applicationForLatest && !planForLatest) {
                return (
                  <div style={styles.applyConfirmedCard}>
                    <CheckCircle2 size={16} color="#1a8fd1" />
                    <span style={{ flex: 1 }}>
                      {applicationForLatest.allApplied ? t("wizard_completed") : t("wizard_partial")}
                    </span>
                  </div>
                );
              }
              if (planForLatest) {
                return <PlanStatusCard plan={planForLatest} onResume={onResumePlan} lang={lang} />;
              }
              return (
                <div>
                  {!latest?.importedFromPdf && (
                    <button
                      style={{
                        ...styles.validateApplyBtn,
                        ...(!manageStock ? { background: "#c3d6e6", color: "#f0f5fa", cursor: "pointer" } : {}),
                      }}
                      onClick={() => onValidateApplication(latest, recs)}
                    >
                      <CheckCircle2 size={16} /> {t("wizard_start")}
                      {!manageStock && <Lock size={14} style={{ marginLeft: 4 }} />}
                    </button>
                  )}
                  <p style={{ ...styles.helpTextSmall, marginTop: 6, textAlign: "center" }}>
                    {t("follow_order")}
                  </p>
                </div>
              );
            })()}
          </div>
        );
      })()}

      {/* v1.63.0 — Application manuelle hors plan (ex. entretien périodique
          au galet), indépendante d'une mesure/plan de traitement. */}
      {manageStock && (
        <button
          type="button"
          onClick={onOpenManualApply}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            width: "100%", boxSizing: "border-box", marginTop: 10,
            padding: "11px 0", borderRadius: 12, border: "1.5px solid #d0e4f5",
            background: "#fff", color: "var(--brand-primary)", fontWeight: 700, fontSize: 14, cursor: "pointer",
          }}
        >
          <Plus size={16} /> {t("apply_product_manual")}
        </button>
      )}

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
  // Utiliser la traduction du label si disponible
  const paramLabelKey = `param_${param.toLowerCase()}`;
  const paramLabel = t(paramLabelKey) !== paramLabelKey ? t(paramLabelKey).replace(/ \(mg\/L\)| \(°C\)| \(µg\/L\)/, "") : paramTarget.label;
  return (
    <div style={{ ...styles.paramCard, borderColor: color + "33" }}>
      <div style={styles.paramTop}>
        <span style={styles.paramLabel}>{paramLabel}</span>
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

function RecoCard({ reco, isLast, manageStock, products, lang }) {
  const t = useT(lang || "fr");
  const isInfo = !!reco.noAction;
  return (
    <div style={isInfo ? styles.recoCardInfo : styles.recoCard}>
      <div style={{ ...styles.recoTop, justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={isInfo ? styles.recoStepBadgeInfo : styles.recoStepBadge}>{reco.stepNumber}</div>
          <span style={isInfo ? styles.recoParamInfo : styles.recoParam}>{reco.title}</span>
        </div>
      </div>

      {/* v1.66.1 — Le badge "À débuter au moins Xh après" n'a de sens que
          pour une vraie action à déclencher. Sur une carte informative
          (rien à appliquer), on affiche à la place un simple rappel de
          recontrôle, sans lien avec le timing des étapes précédentes. */}
      {!isInfo && reco.startsAfterHours > 0 && (
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
      {reco.doseText && <div style={styles.recoDose}>{reco.doseText}</div>}
      {reco.missingTip && <div style={styles.recoNote}>{reco.missingTip}</div>}
      {reco.timingTip && <div style={{ fontSize: 12.5, color: "#3a5a78", marginTop: 4 }}>🌙 {reco.timingTip}</div>}

      {isInfo && (
        <div style={styles.recoInfoTiming}>
          <Clock size={13} color="#2d6a9a" />
          {t("reco_recheck_later")}
        </div>
      )}

      {!isInfo && !!reco.waitHours && (
        <div style={styles.recoWait}>
          <Clock size={13} color="var(--brand-primary)" />
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
  // v1.29.6 — Fix : quand aucun produit n'est trouvé pour l'action recommandée,
  // fallbackKey pointait vers une note spécifique à un AUTRE contexte (ex.
  // "reco_note_tac" utilisée aussi pour ph+/ph-), affichant un message hors
  // sujet ("Un TAC bas rend le pH instable." pour une recommandation pH+).
  // fallbackKey ne doit s'appliquer que si le produit existe mais n'a pas de
  // note ; si le produit est introuvable, le message est toujours générique.
  const prodNote = (prod, fallbackKey) =>
    prod ? (prod.noteKey ? _(prod.noteKey) : prod.note) || _(fallbackKey) : _("reco_no_product_note");
  // Traduit le nom d'un produit : utilise nameKey si disponible, sinon le nom brut
  const prodName = (prod, fallbackKey) =>
    prod ? (prod.nameKey ? _(prod.nameKey) : prod.name) || _(fallbackKey) : _(fallbackKey);
  // v1.29.8 — Remplacement automatique : si l'utilisateur a saisi son propre
  // produit pour une action donnée (ex. "ph+"), il prend le pas sur le produit
  // standard pré-rempli pour la même action, sans action manuelle. Le produit
  // standard reste utilisé pour le calcul de dose tant qu'aucun remplacement
  // n'existe — jamais affiché dans la liste (masqué à 0% de stock), mais
  // "présent" pour que le plan de traitement continue de fonctionner.
  const findProduct = (action) => {
    const candidates = products.filter((p) => p.action === action);
    return candidates.find((p) => !p.isDefault) || candidates.find((p) => p.isDefault) || null;
  };
  // v1.58.0 — Repli utilisé UNIQUEMENT pour le calcul de dose (jamais pour le
  // nom/photo/stock) quand aucun produit n'est configuré pour l'action : la
  // carte et le wizard affichent quand même une dose estimée à partir des
  // valeurs de référence DEFAULT_PRODUCTS, au lieu de rester à null. Le badge
  // "non disponible dans tes produits" reste affiché séparément (productAvailable).
  const defaultProd = (action) => DEFAULT_PRODUCTS.find((p) => p.action === action) || null;
  const tac = parseFloat(latestLower.tac);
  // v1.56.0 — Dose TAC+/TAC- ajustée au volume du bassin et à l'écart mesuré,
  // comme pH et chlore (formule doseAmount × (volume/effectPer) × (écart/effectAmount)).
  // Avant : dose fixe du produit renvoyée telle quelle, sans lien avec l'écart réel.
  if (has("tac") && !Number.isNaN(tac) && targetsLower.tac && tac < targetsLower.tac.min) {
    const tacTargetMid = (targetsLower.tac.min + targetsLower.tac.max) / 2;
    const diff = tacTargetMid - tac;
    const prod = findProduct("tac+");
    const dp = defaultProd("tac+");
    const doseSrc = prod || dp;
    const computedDose = doseSrc ? Math.round(doseSrc.doseAmount * (volume / doseSrc.effectPer) * (diff / doseSrc.effectAmount)) : null;
    steps.push({
      action: "tac+",
      title: _("reco_tac_low", { val: tac }),
      productName: prodName(prod, "reco_fallback_tac"),
      productAvailable: !!prod,
      productPhoto: prod?.photo || null,
      doseText: doseSrc
        ? `${_("reco_dose_prefix")} ${formatDose(computedDose, doseSrc.doseUnit)} ${_("reco_target")} ${tacTargetMid.toFixed(0)}`
        : null,
      missingTip: !prod ? _("missing_product_tip", { action: "tac+" }) : null,
      computedDoseAmount: computedDose,
      doseUnit: doseSrc?.doseUnit || null,
      note: prodNote(prod, "reco_note_tac"),
      waitHours: prod?.waitHours ?? DEFAULT_WAIT_HOURS["tac+"],
    });
  }
  // v1.46.0 — TAC trop haut : même logique que TAC bas, mais avec le produit
  // "tac-" (acide dédié, fiche distincte de ph- — même famille chimique mais
  // effet calibré séparément sur le TAC). La carte s'affiche même si aucun
  // produit n'est configuré pour cette action (missing_product_tip), pour ne
  // jamais masquer silencieusement un TAC hors cible.
  if (has("tac") && !Number.isNaN(tac) && targetsLower.tac && tac > targetsLower.tac.max) {
    const tacTargetMid = (targetsLower.tac.min + targetsLower.tac.max) / 2;
    const diff = tac - tacTargetMid;
    const prod = findProduct("tac-");
    const dp = defaultProd("tac-");
    const doseSrc = prod || dp;
    const computedDose = doseSrc ? Math.round(doseSrc.doseAmount * (volume / doseSrc.effectPer) * (diff / doseSrc.effectAmount)) : null;
    steps.push({
      action: "tac-",
      title: _("reco_tac_high", { val: tac }),
      productName: prodName(prod, "reco_fallback_tac_minus"),
      productAvailable: !!prod,
      productPhoto: prod?.photo || null,
      doseText: doseSrc
        ? `${_("reco_dose_prefix")} ${formatDose(computedDose, doseSrc.doseUnit)} ${_("reco_target")} ${tacTargetMid.toFixed(0)}`
        : null,
      missingTip: !prod ? _("missing_product_tip", { action: "tac-" }) : null,
      computedDoseAmount: computedDose,
      doseUnit: doseSrc?.doseUnit || null,
      note: prodNote(prod, "reco_note_tac_minus"),
      waitHours: prod?.waitHours ?? DEFAULT_WAIT_HOURS["tac-"],
    });
  }

  // pH
  const phVal = parseFloat(latestLower.ph);
  if (has("ph") && !Number.isNaN(phVal) && targetsLower.ph) {
    const phTargets = targetsLower.ph;
    const targetMid = (phTargets.min + phTargets.max) / 2;
    if (phVal > phTargets.max) {
      const diff = phVal - targetMid;
      const prod = findProduct("ph-");
      const dp = defaultProd("ph-");
      const doseSrc = prod || dp;
      const computedDose = doseSrc ? Math.round(doseSrc.doseAmount * (volume / doseSrc.effectPer) * (diff / doseSrc.effectAmount)) : null;
      steps.push({
        action: "ph-",
        title: _("reco_ph_high", { val: phVal }),
        productName: prodName(prod, "reco_fallback_ph_minus"),
        productAvailable: !!prod,
        productPhoto: prod?.photo || null,
        doseText: doseSrc
          ? `${_("reco_dose_prefix")} ${formatDose(computedDose, doseSrc.doseUnit)} ${_("reco_target")} ${targetMid.toFixed(1)}`
          : null,
        missingTip: !prod ? _("missing_product_tip", { action: "ph-" }) : null,
        computedDoseAmount: computedDose,
        doseUnit: doseSrc?.doseUnit || null,
        note: prodNote(prod, "note_ph_minus"),
        waitHours: prod?.waitHours ?? DEFAULT_WAIT_HOURS["ph-"],
      });
    } else if (phVal < phTargets.min) {
      const diff = targetMid - phVal;
      const prod = findProduct("ph+");
      const dp = defaultProd("ph+");
      const doseSrc = prod || dp;
      const computedDose = doseSrc ? Math.round(doseSrc.doseAmount * (volume / doseSrc.effectPer) * (diff / doseSrc.effectAmount)) : null;
      steps.push({
        action: "ph+",
        title: _("reco_ph_low", { val: phVal }),
        productName: prodName(prod, "reco_fallback_ph_plus"),
        productAvailable: !!prod,
        productPhoto: prod?.photo || null,
        doseText: doseSrc
          ? `${_("reco_dose_prefix")} ${formatDose(computedDose, doseSrc.doseUnit)} ${_("reco_target")} ${targetMid.toFixed(1)}`
          : null,
        missingTip: !prod ? _("missing_product_tip", { action: "ph+" }) : null,
        computedDoseAmount: computedDose,
        doseUnit: doseSrc?.doseUnit || null,
        note: prodNote(prod, "note_ph_plus"),
        waitHours: prod?.waitHours ?? DEFAULT_WAIT_HOURS["ph+"],
      });
    }
  }

  // Chlore libre / combiné
  const fCl = parseFloat(latestLower.fcl);
  const tCl = parseFloat(latestLower.tcl);
  const combined = !Number.isNaN(fCl) && !Number.isNaN(tCl) ? Math.max(0, tCl - fCl) : null;
  // v1.45.0 — Capture la cible de point de rupture (10x CC) pour la
  // réutiliser dans le texte explicatif de l'ordre du plan, plus bas.
  let combinedShockTarget = null;

  if (has("fcl") && !Number.isNaN(fCl) && targetsLower.fcl) {
    const fclT = targetsLower.fcl;
    // v1.44.0 — CYA > 75 mg/L bloque tout choc efficace (le CYA protège le
    // chlore de l'UV mais réduit aussi sa puissance oxydante ; au-delà de ce
    // seuil, un choc chlore classique n'atteint plus le point de rupture).
    // Seule la dilution fonctionne : on remplace la recommandation de choc
    // par un renouvellement d'eau, jamais les deux en même temps.
    const cyaValForBlock = parseFloat(latestLower.cya);
    const cyaBlocksShock = has("cya") && !Number.isNaN(cyaValForBlock) && cyaValForBlock > 75;
    if (combined !== null && combined > 0.5 && cyaBlocksShock) {
      const renewalPercent = Math.round((1 - 40 / cyaValForBlock) * 100);
      steps.push({
        action: "renouvellement",
        title: _("reco_cya_block_shock", { val: cyaValForBlock }),
        productName: _("reco_water_renewal"),
        productAvailable: true,
        doseText: _("reco_water_renewal_text", { pct: renewalPercent }),
        computedDoseAmount: renewalPercent,
        doseUnit: "%",
        note: _("reco_note_cya_block_shock"),
        waitHours: 0,
      });
    } else if (combined !== null && combined > 0.5) {
      // v1.44.0 — Fix : la formule du point de rupture est 10x le chlore
      // combiné (référence la plus citée dans la profession, ex. In The Swim :
      // CC 0.5 mg/L → choc jusqu'à 5.0 mg/L), pas 3x comme avant. Et la dose
      // doit se baser sur l'écart à combler (diff), pas sur la cible brute —
      // les autres branches (ph-, ph+, fCl bas, brome, o2) le faisaient déjà,
      // celle-ci utilisait la cible directement, ce qui surdosait.
      const targetFcl = Math.max(fclT.max, combined * 10);
      combinedShockTarget = targetFcl;
      const diff = Math.max(0, targetFcl - fCl);
      const prod = findProduct("chlore");
      const dp = defaultProd("chlore");
      const doseSrc = prod || dp;
      const computedDose = doseSrc ? Math.round(doseSrc.doseAmount * (volume / doseSrc.effectPer) * (diff / doseSrc.effectAmount)) : null;
      steps.push({
        action: "chlore",
        title: _("reco_cl_combined", { val: combined.toFixed(2) }),
        productName: prodName(prod, "reco_fallback_chlore"),
        productAvailable: !!prod,
        productPhoto: prod?.photo || null,
        doseText: doseSrc
          ? `${_("reco_dose_prefix")} ${formatDose(computedDose, doseSrc.doseUnit)} ${_("reco_cl_shock_text")}`
          : null,
        missingTip: !prod ? _("missing_product_tip", { action: "chlore" }) : null,
        computedDoseAmount: computedDose,
        doseUnit: doseSrc?.doseUnit || null,
        note: _("reco_note_combined"),
        timingTip: _("chlore_timing_tip"),
        waitHours: prod?.waitHours ?? DEFAULT_WAIT_HOURS["chlore"],
      });
    } else if (fCl < fclT.min) {
      const targetFcl = (fclT.min + fclT.max) / 2;
      const diff = targetFcl - fCl;
      const prod = findProduct("chlore");
      const dp = defaultProd("chlore");
      const doseSrc = prod || dp;
      const computedDose = doseSrc ? Math.round(doseSrc.doseAmount * (volume / doseSrc.effectPer) * (diff / doseSrc.effectAmount)) : null;
      steps.push({
        action: "chlore",
        title: _("reco_cl_low", { val: fCl }),
        productName: prodName(prod, "reco_fallback_chlore"),
        productAvailable: !!prod,
        productPhoto: prod?.photo || null,
        doseText: doseSrc
          ? `${_("reco_dose_prefix")} ${formatDose(computedDose, doseSrc.doseUnit)} ${_("reco_target")} ${targetFcl} mg/L`
          : null,
        missingTip: !prod ? _("missing_product_tip", { action: "chlore" }) : null,
        computedDoseAmount: computedDose,
        doseUnit: doseSrc?.doseUnit || null,
        // v1.40.0 — Fix : cette branche (chlore libre bas, PAS de problème de
        // combiné) affichait par erreur la note "reco_note_combined" (chloramines,
        // désinfection insuffisante) — copié-collé de la branche ci-dessus. Cette
        // note n'a aucun sens ici. On garde uniquement la note propre au produit
        // si l'utilisateur en a saisi une, sinon pas de note plutôt qu'un message
        // trompeur.
        note: prod ? ((prod.noteKey ? _(prod.noteKey) : prod.note) || null) : null,
        timingTip: _("chlore_timing_tip"),
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
        // v1.66.1 — Carte purement informative (rien à appliquer, dégradation
        // naturelle) : pas de "À débuter après" ni de style "à traiter", voir
        // RecoCard.
        noAction: true,
      });
    }
  }

  // Brome
  const bromeVal = parseFloat(latestLower.brome);
  if (has("brome") && !Number.isNaN(bromeVal) && targetsLower.brome) {
    const brT = targetsLower.brome;
    if (bromeVal < brT.min) {
      // v1.58.0 — Repli de dose désormais possible : DEFAULT_PRODUCTS contient
      // une fiche de référence "brome" (voir commentaire à sa définition).
      const prod = findProduct("brome");
      const dp = defaultProd("brome");
      const doseSrc = prod || dp;
      const diff = ((brT.min + brT.max) / 2) - bromeVal;
      const computedDose = doseSrc ? Math.round(doseSrc.doseAmount * (volume / doseSrc.effectPer) * (diff / doseSrc.effectAmount)) : null;
      steps.push({
        action: "brome",
        title: _("reco_brome_low", { val: bromeVal }),
        productName: prodName(prod, "reco_fallback_brome"),
        productAvailable: !!prod,
        productPhoto: prod?.photo || null,
        doseText: doseSrc
          ? `${_("reco_dose_prefix")} ${formatDose(computedDose, doseSrc.doseUnit)} ${_("reco_target")} ${(brT.min + brT.max) / 2} mg/L`
          : null,
        missingTip: !prod ? _("missing_product_tip", { action: "brome" }) : null,
        computedDoseAmount: computedDose,
        doseUnit: doseSrc?.doseUnit || null,
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
      // v1.58.0 — Repli de dose désormais possible : DEFAULT_PRODUCTS contient
      // une fiche de référence "o2" (voir commentaire à sa définition).
      const prod = findProduct("o2");
      const dp = defaultProd("o2");
      const doseSrc = prod || dp;
      const diff = ((o2T.min + o2T.max) / 2) - o2Val;
      const computedDose = doseSrc ? Math.round(doseSrc.doseAmount * (volume / doseSrc.effectPer) * (diff / doseSrc.effectAmount)) : null;
      steps.push({
        action: "o2",
        title: _("reco_o2_low", { val: o2Val }),
        productName: prodName(prod, "reco_fallback_o2"),
        productAvailable: !!prod,
        productPhoto: prod?.photo || null,
        doseText: doseSrc
          ? `${_("reco_dose_prefix")} ${formatDose(computedDose, doseSrc.doseUnit)}`
          : null,
        missingTip: !prod ? _("missing_product_tip", { action: "o2" }) : null,
        computedDoseAmount: computedDose,
        doseUnit: doseSrc?.doseUnit || null,
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
      // v1.50.0 — Le sel se calcule par un ratio physique fixe (1 kg/m³ =
      // +1000 mg/L, indépendant de la marque), donc computedDoseAmount ne
      // dépend jamais du produit. On relie quand même le produit "sel" en
      // stock pour que le nom réel, la photo et surtout la déduction de
      // stock (générique dans saveApplication, basée sur productName +
      // containerAmount) fonctionnent comme pour les autres actions — avant
      // cette version, aucun produit sel n'était jamais recherché ici.
      const prod = findProduct("sel");
      steps.push({
        action: "sel",
        title: _("reco_sel_low", { val: selVal }),
        productName: prodName(prod, "reco_fallback_sel"),
        productAvailable: !!prod,
        productPhoto: prod?.photo || null,
        doseText: _("reco_water_renewal_text", { pct: selKg }).replace("{pct}", selKg) ||
          `${_("reco_dose_prefix")} ${selKg} kg ${_("reco_target")} ${Math.round((selT.min + selT.max) / 2)} mg/L`,
        computedDoseAmount: selKg,
        doseUnit: "kg",
        note: prodNote(prod, "reco_note_sel"),
        waitHours: prod?.waitHours ?? 24,
      });
    }
  }

  // Dureté (TH / HARD)
  const hardVal = parseFloat(latestLower.hard);
  if (has("hard") && !Number.isNaN(hardVal) && targetsLower.hard) {
    const hardT = targetsLower.hard;
    if (hardVal < hardT.min) {
      const diff = ((hardT.min + hardT.max) / 2) - hardVal;
      const prod = findProduct("hard+");
      const dp = defaultProd("hard+");
      const doseSrc = prod || dp;
      const computedDose = doseSrc ? Math.round(doseSrc.doseAmount * (volume / doseSrc.effectPer) * (diff / doseSrc.effectAmount)) : null;
      steps.push({
        action: "hard+",
        title: _("reco_hard_low", { val: hardVal }),
        productName: prodName(prod, "reco_fallback_hard"),
        productAvailable: !!prod,
        productPhoto: prod?.photo || null,
        doseText: doseSrc ? `${_("reco_dose_prefix")} ${formatDose(computedDose, doseSrc.doseUnit)}` : null,
        missingTip: !prod ? _("missing_product_tip", { action: "hard+" }) : null,
        computedDoseAmount: computedDose,
        doseUnit: doseSrc?.doseUnit || "g",
        note: prodNote(prod, "note_calcium"),
        waitHours: prod?.waitHours ?? DEFAULT_WAIT_HOURS["hard+"],
      });
    } else if (hardVal > hardT.max) {
      steps.push({
        action: "hard-info",
        title: _("reco_hard_high", { val: hardVal }),
        productName: _("reco_no_product"),
        productAvailable: true,
        doseText: _("reco_cl_excess_text"),
        computedDoseAmount: null,
        doseUnit: null,
        note: _("reco_note_cya"),
        waitHours: 0,
        // v1.66.1 — Idem chlore-excess : carte informative, pas d'action.
        noAction: true,
      });
    }
  }

  // Phosphates
  const phosVal = parseFloat(latestLower.phos);
  if (has("phos") && !Number.isNaN(phosVal) && targetsLower.phos && phosVal > targetsLower.phos.max) {
    const prod = findProduct("phos-");
    const dp = defaultProd("phos-");
    const doseSrc = prod || dp;
    const computedDose = doseSrc ? Math.round(doseSrc.doseAmount * (volume / doseSrc.effectPer) * (phosVal / doseSrc.effectAmount)) : null;
    steps.push({
      action: "phos-",
      title: _("reco_phos_high", { val: phosVal }),
      productName: prodName(prod, "reco_fallback_phos"),
      productAvailable: !!prod,
      productPhoto: prod?.photo || null,
      doseText: doseSrc ? `${_("reco_dose_prefix")} ${formatDose(computedDose, doseSrc.doseUnit)}` : null,
      missingTip: !prod ? _("missing_product_tip", { action: "phos-" }) : null,
      computedDoseAmount: computedDose,
      doseUnit: doseSrc?.doseUnit || "mL",
      note: prodNote(prod, "note_anti_phos"),
      waitHours: prod?.waitHours ?? DEFAULT_WAIT_HOURS["phos-"],
    });
  }

  // Cuivre (informatif + séquestrant)
  const copperVal = parseFloat(latestLower.copper);
  if (has("copper") && !Number.isNaN(copperVal) && targetsLower.copper && copperVal > targetsLower.copper.max) {
    const prod = findProduct("sequestrant");
    const dp = defaultProd("sequestrant");
    const doseSrc = prod || dp;
    const computedDose = doseSrc ? Math.round(doseSrc.doseAmount * (volume / doseSrc.effectPer)) : null;
    steps.push({
      action: "sequestrant",
      title: _("reco_copper_high", { val: copperVal }),
      productName: prodName(prod, "reco_fallback_sequestrant"),
      productAvailable: !!prod,
      productPhoto: prod?.photo || null,
      doseText: doseSrc ? `${_("reco_dose_prefix")} ${formatDose(computedDose, doseSrc.doseUnit)}` : null,
      missingTip: !prod ? _("missing_product_tip", { action: "sequestrant" }) : null,
      computedDoseAmount: computedDose,
      doseUnit: doseSrc?.doseUnit || "mL",
      note: prodNote(prod, "note_sequestrant"),
      waitHours: prod?.waitHours ?? DEFAULT_WAIT_HOURS["sequestrant"],
    });
  }

  // Fer (informatif + séquestrant)
  const ironVal = parseFloat(latestLower.iron);
  if (has("iron") && !Number.isNaN(ironVal) && targetsLower.iron && ironVal > targetsLower.iron.max) {
    const prod = findProduct("sequestrant");
    const dp = defaultProd("sequestrant");
    const doseSrc = prod || dp;
    const computedDose = doseSrc ? Math.round(doseSrc.doseAmount * (volume / doseSrc.effectPer)) : null;
    steps.push({
      action: "sequestrant",
      title: _("reco_iron_high", { val: ironVal }),
      productName: prodName(prod, "reco_fallback_sequestrant"),
      productAvailable: !!prod,
      productPhoto: prod?.photo || null,
      doseText: doseSrc ? `${_("reco_dose_prefix")} ${formatDose(computedDose, doseSrc.doseUnit)}` : null,
      missingTip: !prod ? _("missing_product_tip", { action: "sequestrant" }) : null,
      computedDoseAmount: computedDose,
      doseUnit: doseSrc?.doseUnit || "mL",
      note: prodNote(prod, "note_sequestrant"),
      waitHours: prod?.waitHours ?? DEFAULT_WAIT_HOURS["sequestrant"],
    });
  }

  // CYA
  const cya = parseFloat(latestLower.cya);
  // v1.44.0 — Si le blocage de choc (CYA > 75) a déjà ajouté une étape de
  // renouvellement plus haut, on ne la double pas ici.
  if (has("cya") && !Number.isNaN(cya) && targetsLower.cya && cya > targetsLower.cya.max && !steps.some((s) => s.action === "renouvellement")) {
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

  // v1.44.0 — Métaux dissous détectés : le séquestrant doit toujours passer
  // avant tout oxydant (chlore/brome/O2), cf. computeStepPriority.
  const metalsUrgent =
    (has("copper") && !Number.isNaN(copperVal) && targetsLower.copper && copperVal > targetsLower.copper.max) ||
    (has("iron") && !Number.isNaN(ironVal) && targetsLower.iron && ironVal > targetsLower.iron.max);

  const stepPriorityCtx = {
    tac: Number.isNaN(tac) ? null : tac,
    phVal: Number.isNaN(phVal) ? null : phVal,
    phTargetMax: targetsLower.ph ? targetsLower.ph.max : null,
    combined,
    metalsUrgent,
  };
  // v1.59.4 — Ne plus écraser la note de l'étape pH avec une justification
  // d'ordonnancement mentionnant le TAC et le chlore : cette étape ne doit
  // parler que du produit pH appliqué. L'ordre de traitement reste calculé
  // par computeStepPriority (inchangé), seul l'affichage de la justification
  // est retiré.

  steps.sort((a, b) => computeStepPriority(a, stepPriorityCtx) - computeStepPriority(b, stepPriorityCtx));

  // v1.44.0 — Délai obligatoire de 6h entre une correction pH et un choc
  // chlore qui la suit dans le plan : mélanger pH- et chlore choc trop tôt
  // précipite le calcaire et réduit l'efficacité du chlore. Ne s'applique
  // qu'au choc ("chlore"), pas aux autres oxydants ni au chlore d'entretien.
  const phStepIndex = steps.findIndex((s) => s.action === "ph-" || s.action === "ph+");
  const chloreStepIndex = steps.findIndex((s) => s.action === "chlore");
  if (phStepIndex !== -1 && chloreStepIndex !== -1 && chloreStepIndex > phStepIndex) {
    steps[phStepIndex].waitHours = Math.max(steps[phStepIndex].waitHours || 0, 6);
  }
  // v1.44.0 — Petit texte expliquant l'ordre du plan, affiché avant les
  // cartes. Reconstruit les mêmes conditions que le tri ci-dessus (même
  // ordre de priorité) pour rester cohérent avec les étapes affichées.
  const cyaValForReason = parseFloat(latestLower.cya);
  const cyaBlockedShockForReason = has("cya") && !Number.isNaN(cyaValForReason) && cyaValForReason > 75 && combined !== null && combined > 0.5;
  const phChloreDelayApplied = phStepIndex !== -1 && chloreStepIndex !== -1 && chloreStepIndex > phStepIndex;
  const orderReasons = [];
  if (metalsUrgent) orderReasons.push(_("reco_order_reason_metals"));
  if (cyaBlockedShockForReason) {
    orderReasons.push(_("reco_order_reason_cya_block"));
  } else if (combined !== null && combined > 0.5) {
    orderReasons.push(_("reco_order_reason_contamination", { combined: combined.toFixed(2), target: combinedShockTarget }));
  }
  // v1.59.5 — Fix crash : ligne orpheline du refactoring v1.59.4 (variables
  // phTooHigh/tacNotCritical jamais déclarées) provoquant un ReferenceError
  // sur TOUT bassin ayant au moins une mesure. Le commentaire v1.59.4
  // ci-dessus indiquait déjà que cette justification devait être retirée.
  if (phChloreDelayApplied) orderReasons.push(_("reco_order_reason_ph_chlore_delay"));
  const orderExplanation = orderReasons.length > 0
    ? `${_("reco_order_intro_default")} ${orderReasons.join(" ")}`
    : _("reco_order_intro_default");

  let cumulativeHours = 0;
  const result = steps.map((step, i) => {
    const startsAfter = cumulativeHours;
    cumulativeHours += step.waitHours || 0;
    // v1.61.0 — Tous les steps issus de ce calcul sont des actions de
    // traitement correctif ponctuel (par opposition à la carte "entretien
    // continu", ajoutée séparément au moment de l'application d'un step
    // galets dans le Wizard — voir applyWizardStep).
    return { ...step, stepNumber: i + 1, startsAfterHours: startsAfter, mode: "correctif" };
  });
  result.orderExplanation = orderExplanation;
  return result;
}

// ---------- Historique ----------
function HistoryView({ measures, onDelete, onEdit, onAdd, onAddPrefilled, onValidateApplication, applications, isPremium, poolName, onGenerateReport, onWantPremiumForReport, lang, apiKey, apiProvider, authUid, pool, activePlan }) {
  const t = useT(lang);
  const [diagText, setDiagText] = useState("");
  const [diagResult, setDiagResult] = useState(null);
  const [diagLoading, setDiagLoading] = useState(false);
  const [diagError, setDiagError] = useState(null);
  const [diagHistory, setDiagHistory] = useState([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState(null);
  const [importInfo, setImportInfo] = useState(null);
  const importFileRef = useRef(null);

  useEffect(() => {
    if (!authUid || !isPremium) { setDiagHistory([]); return; }
    const unsub = FB.onDiagnostics(authUid, (list) => {
      setDiagHistory([...list].sort((a, b) => new Date(b.date) - new Date(a.date)));
    });
    return () => unsub();
  }, [authUid, isPremium]);

  function deleteDiagEntry(id) {
    setDiagHistory((prev) => prev.filter((d) => d.id !== id));
    if (authUid) FB.deleteDiagnostic(authUid, id).catch(() => {});
  }

  async function handleImportFile(e) {
    const file = e.target.files?.[0];
    if (!file || !apiKey) return;
    e.target.value = "";
    setImportLoading(true); setImportError(null); setImportInfo(null);
    try {
      // Convertir en base64
      const base64 = await new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result.split(",")[1]);
        reader.onerror = () => rej(new Error("Lecture impossible"));
        reader.readAsDataURL(file);
      });

      const isPdf = file.type === "application/pdf";
      const mediaType = isPdf ? "application/pdf" : (file.type || "image/jpeg");

      const prompt = `Tu es un expert en chimie de l'eau de piscine. Analyse ce document (rapport de mesures, relevé de labo, photo de photomètre ou de bandelette, ou export de l'application PoolGenAI).
Extrait toutes les valeurs de paramètres de qualité d'eau présentes, ainsi que la date ET l'heure exactes si visibles, et une note textuelle si présente (commentaire, observation).

Si le document contient une section ou un tableau "Diagnostic IA" / "AI diagnostics" (avec des colonnes du type Date / Note / Réponse IA / Confiance), extrait CHAQUE ligne de ce tableau séparément dans le tableau "diagnostics".

IMPORTANT pour la date/heure :
- Si tu vois une date ET une heure (ex: "28/06/2026 16:48" ou "28 juin 2026 à 16:48"), inclus les deux au format ISO 8601 complet (ex: "2026-06-28T16:48:00")
- Si tu vois seulement une date sans heure, mets l'heure à 00:00:00
- Si aucune date visible, retourne null

Réponds UNIQUEMENT en JSON valide, sans texte avant ni après :
{
  "pH": <number|null>,
  "fCl": <number|null>,
  "tCl": <number|null>,
  "ccl": <number|null>,
  "tac": <number|null>,
  "cya": <number|null>,
  "hard": <number|null>,
  "phos": <number|null>,
  "copper": <number|null>,
  "iron": <number|null>,
  "temp": <number|null>,
  "sel": <number|null>,
  "brome": <number|null>,
  "date": "<ISO 8601 datetime string or null>",
  "note": "<texte de note ou null>",
  "diagnostics": [
    {
      "date": "<ISO 8601 datetime string or null>",
      "note": "<texte de la note/problème signalé>",
      "response": "<texte de la réponse IA>",
      "confidence": <entier de 1 à 5, ou null>
    }
  ]
}
Si aucun tableau Diagnostic IA n'est présent dans le document, retourne "diagnostics": [].`;

      const { jsPDF: _j, ...rest } = {}; // just to ensure closure
      const response = await fetch(apiKey.startsWith("http") ? `${apiKey}/v1/messages` : "https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
          ...(apiKey.startsWith("http") ? { "x-uid": authUid || "" } : { "x-api-key": apiKey, "anthropic-dangerous-direct-browser-access": "true" }),
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1600,
          messages: [{
            role: "user",
            content: [
              {
                type: isPdf ? "document" : "image",
                source: { type: "base64", media_type: mediaType, data: base64 },
              },
              { type: "text", text: prompt },
            ],
          }],
        }),
      });

      const data = await response.json();
      const text = data.content?.map(c => c.text || "").join("").trim();
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      // Vérifier qu'au moins une valeur a été trouvée (mesure OU diagnostic)
      const numKeys = ["pH","fCl","tCl","ccl","tac","cya","hard","phos","copper","iron","temp","sel","brome"];
      const hasValues = numKeys.some(k => parsed[k] != null);
      const importedDiagnostics = Array.isArray(parsed.diagnostics) ? parsed.diagnostics.filter(d => d && (d.note || d.response)) : [];
      if (!hasValues && importedDiagnostics.length === 0) throw new Error(t("import_pdf_no_values"));

      if (hasValues) {
        // Pré-remplir la mesure
        const parsedDate = parseFlexibleDate(parsed.date) || new Date().toISOString();
        const prefilled = {
          __prefilled: true,
          importedFromPdf: true,
          date: parsedDate,
          pH:     parsed.pH     != null ? String(parsed.pH)     : "",
          fCl:    parsed.fCl    != null ? String(parsed.fCl)    : "",
          tCl:    parsed.tCl    != null ? String(parsed.tCl)    : "",
          ccl:    parsed.ccl    != null ? String(parsed.ccl)    : "",
          tac:    parsed.tac    != null ? String(parsed.tac)    : "",
          cya:    parsed.cya    != null ? String(parsed.cya)    : "",
          hard:   parsed.hard   != null ? String(parsed.hard)   : "",
          phos:   parsed.phos   != null ? String(parsed.phos)   : "",
          copper: parsed.copper != null ? String(parsed.copper) : "",
          iron:   parsed.iron   != null ? String(parsed.iron)   : "",
          temp:   parsed.temp   != null ? String(parsed.temp)   : "",
          sel:    parsed.sel    != null ? String(parsed.sel)    : "",
          brome:  parsed.brome  != null ? String(parsed.brome)  : "",
          note:   parsed.note   || "",
        };
        onAddPrefilled(prefilled);
      }

      // Recréer les entrées de diagnostic IA détectées dans le document, s'il y en a
      if (importedDiagnostics.length > 0 && authUid) {
        importedDiagnostics.forEach((d) => {
          const entry = {
            id: uid(),
            date: parseFlexibleDate(d.date) || new Date().toISOString(),
            note: d.note || "",
            suggestion: d.response || "",
            confidence: typeof d.confidence === "number" ? d.confidence : 0,
            confidence_reason: "",
          };
          FB.saveDiagnostic(authUid, entry).catch(() => {});
        });
        setImportInfo(
          importedDiagnostics.length === 1
            ? t("import_diag_added_one")
            : t("import_diag_added_many").replace("{n}", String(importedDiagnostics.length))
        );
      }
    } catch(e) {
      console.error("Import PDF error", e);
      setImportError(e.message || t("import_pdf_error"));
    } finally {
      setImportLoading(false);
    }
  }

  async function handleDiag() {
    if (!diagText.trim() || !apiKey) return;
    setDiagLoading(true); setDiagError(null); setDiagResult(null);
    try {
      const last50 = [...measures].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 50);
      const measuresStr = last50.map(m => {
        const d = new Date(m.date).toLocaleDateString();
        const vals = [];
        if (m.pH != null && m.pH !== "") vals.push(`pH=${m.pH}`);
        if (m.fCl != null && m.fCl !== "") vals.push(`FCL=${m.fCl}`);
        if (m.tCl != null && m.tCl !== "") vals.push(`TCL=${m.tCl}`);
        if (m.ccl != null && m.ccl !== "") vals.push(`CCL=${m.ccl}`);
        if (m.tac != null && m.tac !== "") vals.push(`TAC=${m.tac}`);
        if (m.cya != null && m.cya !== "") vals.push(`CYA=${m.cya}`);
        if (m.hard != null && m.hard !== "") vals.push(`TH=${m.hard}`);
        if (m.phos != null && m.phos !== "") vals.push(`Phos=${m.phos}`);
        if (m.temp != null && m.temp !== "") vals.push(`T=${m.temp}°C`);
        const noteStr = m.note ? ` | Note: "${m.note}"` : "";
        return `${d}: ${vals.join(", ")}${noteStr}`;
      }).join("\n");

      const prompt = `Tu es un expert en traitement de l'eau de piscine de baignade. Tu dois UNIQUEMENT répondre aux questions liées à la chimie de l'eau, aux produits de traitement (chlore, pH, TAC, CYA, phosphates, etc.) et aux équipements de piscine.

Bassin: ${pool?.name || ""}, volume ${pool?.volume || "?"}m³, traitement: ${pool?.treatmentType || "chlore"}.

Mesures récentes (les plus récentes en premier):
${measuresStr}

Problème signalé par l'utilisateur: "${diagText.trim()}"

INSTRUCTIONS:
1. Si la question n'est PAS liée au traitement de l'eau de piscine, réponds uniquement: {"off_topic": true}
2. Sinon, analyse les mesures et le problème, puis réponds UNIQUEMENT en JSON valide:
{
  "suggestion": "texte de la suggestion (2-4 phrases concrètes et actionnables)",
  "confidence": <entier de 1 à 5>,
  "confidence_reason": "explication courte de ce niveau de confiance"
}

Réponds UNIQUEMENT avec le JSON, sans texte avant ni après.`;

      const result = await callAIText({ apiKey, apiProvider, prompt, uid: authUid });
      const clean = result.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      if (parsed.off_topic) {
        setDiagError(t("diag_off_topic"));
      } else {
        setDiagResult(parsed);
        if (authUid) {
          const entry = {
            id: uid(),
            date: new Date().toISOString(),
            note: diagText.trim(),
            suggestion: parsed.suggestion,
            confidence: parsed.confidence,
            confidence_reason: parsed.confidence_reason || "",
          };
          FB.saveDiagnostic(authUid, entry).catch(() => {});
        }
      }
    } catch (e) {
      console.error("Diag error", e);
      setDiagError(t("diag_error") + (e.message ? ` : ${e.message}` : ""));
    } finally {
      setDiagLoading(false);
    }
  }
  const [activeParams, setActiveParams] = useState(["pH", "fCl"]);
  const [showValues, setShowValues] = useState(false);

  const chartData = useMemo(() => {
    return [...measures]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((m) => ({
        date: formatDateShort(m.date),
        timestamp: new Date(m.date).getTime(),
        pH:     m.pH     !== undefined && m.pH     !== "" ? parseFloat(m.pH)     : null,
        fCl:    m.fCl    !== undefined && m.fCl    !== "" ? parseFloat(m.fCl)    : null,
        tCl:    m.tCl    !== undefined && m.tCl    !== "" ? parseFloat(m.tCl)    : null,
        ccl:    m.ccl    !== undefined && m.ccl    !== "" ? parseFloat(m.ccl)    : null,
        tac:    m.tac    !== undefined && m.tac    !== "" ? parseFloat(m.tac)    : null,
        cya:    m.cya    !== undefined && m.cya    !== "" ? parseFloat(m.cya)    : null,
        hard:   m.hard   !== undefined && m.hard   !== "" ? parseFloat(m.hard)   : null,
        phos:   m.phos   !== undefined && m.phos   !== "" ? parseFloat(m.phos)   : null,
        copper: m.copper !== undefined && m.copper !== "" ? parseFloat(m.copper) : null,
        iron:   m.iron   !== undefined && m.iron   !== "" ? parseFloat(m.iron)   : null,
        temp:   m.temp   !== undefined && m.temp   !== "" ? parseFloat(m.temp)   : null,
      }));
  }, [measures]);

  const chartParams = [
    { key: "pH",    color: "#1a8fd1", label: "pH",                                  axis: "left" },
    { key: "fCl",   color: "#2b7fd9", label: t("param_fcl").replace(" (mg/L)", ""), axis: "left" },
    { key: "tCl",   color: "#8a6fd1", label: t("param_tcl").replace(" (mg/L)", ""), axis: "left" },
    { key: "ccl",   color: "#6a4fd1", label: t("ccl_col"),                          axis: "left" },
    { key: "tac",   color: "#d98c2b", label: t("tac_col"),                          axis: "right" },
    { key: "cya",   color: "#c4502f", label: t("cya_col"),                          axis: "right" },
    { key: "hard",  color: "#2b9c8a", label: t("hard_col"),                         axis: "right" },
    { key: "phos",  color: "#8a2b9c", label: t("phos_col"),                         axis: "right" },
    { key: "copper",color: "#b8860b", label: t("copper_col"),                       axis: "left" },
    { key: "iron",  color: "#8b4513", label: t("iron_col"),                         axis: "left" },
    { key: "temp",  color: "#e0578a", label: t("temp_col"),                         axis: "right" },
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
        <History size={40} color="var(--brand-icon-light)" strokeWidth={1.5} />
        <p style={styles.emptyTitle}>{t("no_history")}</p>
        <p style={styles.emptyText}>{t("no_history_sub")}</p>
        <input
          ref={importFileRef}
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          style={{ display: "none" }}
          onChange={handleImportFile}
        />
        {apiKey ? (
          <>
            <button
              style={{ ...styles.validateApplyBtn, background: importLoading ? "var(--brand-text-muted)" : "var(--brand-primary)", fontSize: 13, padding: "9px 14px", marginTop: 8 }}
              onClick={() => importFileRef.current?.click()}
              disabled={importLoading}
            >
              {importLoading ? <Loader2 size={15} className="spin" /> : <FileText size={15} />}
              {importLoading ? t("import_pdf_analyzing") : t("import_pdf_btn")}
            </button>
            {importError && (
              <div style={{ marginTop: 6, fontSize: 12, color: "#c0392b", padding: "6px 10px", background: "#fdf0ef", borderRadius: 8 }}>
                <AlertTriangle size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />{importError}
              </div>
            )}
            {importInfo && (
              <div style={{ marginTop: 6, fontSize: 12, color: "#5b3fa0", padding: "6px 10px", background: "#f3effa", borderRadius: 8 }}>
                {importInfo}
              </div>
            )}
          </>
        ) : (
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--brand-text-muted)", padding: "8px 12px", background: "var(--brand-bg-tint)", borderRadius: 10, border: "1px solid #d0e4f5" }}>
            <Lock size={13} color="var(--brand-text-muted)" />
            <span>{t("import_pdf_needs_ai")}</span>
          </div>
        )}
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
            background: allActive ? "var(--brand-primary)" : "#f1f4f3",
            borderColor: allActive ? "var(--brand-primary)" : "#d0e4f5",
            color: allActive ? "#ffffff" : "#2d4a6e",
          }}
        >
          {allActive ? t("hide_all_params") : t("show_all_params")}
        </button>
        {chartParams.map((cp) => (
          <button
            key={cp.key}
            onClick={() => toggleParam(cp.key)}
            style={{
              ...styles.chip,
              background: activeParams.includes(cp.key) ? cp.color + "22" : "#f1f4f3",
              borderColor: activeParams.includes(cp.key) ? cp.color : "#d0e4f5",
              color: activeParams.includes(cp.key) ? cp.color : "var(--brand-text-muted)",
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
                  tick={{ fontSize: 10, fill: "var(--brand-text-muted)" }}
                />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 10, fill: "var(--brand-text-muted)" }}
              width={28}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 10, fill: "var(--brand-text-muted)" }}
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
      </div>

      {/* v1.66.2 — Bouton "Générer le rapport" déplacé en haut du Journal
          (à la place de l'import PDF, désormais en bas de la liste), sur
          demande d'Arnaud : c'est l'action la plus utilisée depuis cet écran. */}
      <div style={{ marginBottom: 8 }}>
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

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {(() => {
          // v1.63.0 — Journal fusionné : mesures + entretiens manuels (hors
          // plan), triés ensemble par date décroissante (comme measures seul
          // auparavant). Les entretiens manuels n'ont pas de measureId — ils
          // ne rentrent jamais en collision avec la logique existante de
          // MeasureRow/application liée à une mesure.
          const manualApps = (applications || []).filter((a) => a.type === "manual");
          const items = [
            ...measures.map((m) => ({ kind: "measure", date: m.date, m })),
            ...manualApps.map((a) => ({ kind: "manual", date: a.appliedAt, a })),
          ].sort((x, y) => new Date(y.date) - new Date(x.date));
          return items.map((item) =>
            item.kind === "measure" ? (
              <MeasureRow
                key={item.m.id}
                measure={item.m}
                onDelete={() => onDelete(item.m.id)}
                onEdit={() => onEdit(item.m, applications.find((a) => a.measureId === item.m.id))}
                onValidateApplication={() => onValidateApplication(item.m)}
                application={applications.find((a) => a.measureId === item.m.id)}
                isPremium={isPremium}
                manageStock={!!pool?.manageStock}
                lang={lang}
                activePlan={activePlan}
                authUid={authUid}
              />
            ) : (
              <ManualApplicationRow key={item.a.id} app={item.a} lang={lang} />
            )
          );
        })()}
      </div>

      {/* Bouton import PDF — déplacé en bas (v1.66.2) */}
      <div style={{ marginTop: 18 }}>
        <input
          ref={importFileRef}
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          style={{ display: "none" }}
          onChange={handleImportFile}
        />
        {apiKey ? (
          <>
            <button
              style={{ ...styles.validateApplyBtn, background: importLoading ? "var(--brand-text-muted)" : "var(--brand-primary)", fontSize: 13, padding: "9px 14px" }}
              onClick={() => importFileRef.current?.click()}
              disabled={importLoading}
            >
              {importLoading ? <Loader2 size={15} className="spin" /> : <FileText size={15} />}
              {importLoading ? t("import_pdf_analyzing") : t("import_pdf_btn")}
            </button>
            {importError && (
              <div style={{ marginTop: 6, fontSize: 12, color: "#c0392b", padding: "6px 10px", background: "#fdf0ef", borderRadius: 8 }}>
                <AlertTriangle size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />{importError}
              </div>
            )}
            {importInfo && (
              <div style={{ marginTop: 6, fontSize: 12, color: "#5b3fa0", padding: "6px 10px", background: "#f3effa", borderRadius: 8 }}>
                {importInfo}
              </div>
            )}
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--brand-text-muted)", padding: "8px 12px", background: "var(--brand-bg-tint)", borderRadius: 10, border: "1px solid #d0e4f5" }}>
            <Lock size={13} color="var(--brand-text-muted)" />
            <span>{t("import_pdf_needs_ai")}</span>
          </div>
        )}
      </div>

      {apiKey && (
        <div style={{ marginTop: 20 }}>
          <div style={{ ...styles.sectionRow, marginTop: 0 }}>
            <span style={styles.sectionLabel}>{t("diag_section")}</span>
            <Sparkles size={14} color="#7c3aed" style={{ marginLeft: 6 }} />
          </div>
          <textarea
            value={diagText}
            onChange={e => { setDiagText(e.target.value); setDiagResult(null); setDiagError(null); }}
            placeholder={t("diag_placeholder")}
            style={{ ...styles.input, minHeight: 80, resize: "vertical", marginTop: 8 }}
          />
          <button
            style={{ ...styles.aiAnalyzeBtn, ...(diagLoading ? styles.aiAnalyzeBtnLoading : {}), marginTop: 8 }}
            onClick={handleDiag}
            disabled={diagLoading || !diagText.trim()}
          >
            {diagLoading ? <Loader2 size={15} className="spin" /> : <Sparkles size={15} />}
            {diagLoading ? t("ai_analyzing") : t("ai_analyze_btn")}
          </button>
          {diagError && (
            <div style={{ marginTop: 10, padding: "10px 14px", background: "#fdf0ef", borderRadius: 10, border: "1px solid #f5c6c2", fontSize: 13, color: "#c0392b" }}>
              {diagError}
            </div>
          )}
          {diagResult && (
            <div style={{ marginTop: 12, padding: "14px 16px", background: "#f4f0fc", borderRadius: 12, border: "1px solid #e2d9f3" }}>
              <div style={{ fontSize: 13, color: "#2d1b69", lineHeight: 1.6, marginBottom: 10 }}>
                {diagResult.suggestion}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11, color: "var(--brand-text-muted)", fontWeight: 600 }}>{t("diag_confidence")} :</span>
                <span style={{ fontSize: 16, letterSpacing: 2 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} style={{ color: i < diagResult.confidence ? "#f59e0b" : "#d1d5db" }}>★</span>
                  ))}
                </span>
                <span style={{ fontSize: 11, color: "var(--brand-text-muted)" }}>({diagResult.confidence}/5)</span>
              </div>
              {diagResult.confidence_reason && (
                <div style={{ fontSize: 11, color: "var(--brand-text-muted)", marginTop: 4, fontStyle: "italic" }}>
                  {diagResult.confidence_reason}
                </div>
              )}
            </div>
          )}

          <div style={{ ...styles.sectionRow, marginTop: 20 }}>
            <span style={styles.sectionLabel}>{t("diag_history_title")}</span>
          </div>
          {!isPremium ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--brand-text-muted)", padding: "8px 12px", background: "var(--brand-bg-tint)", borderRadius: 10, border: "1px solid #d0e4f5" }}>
              <Lock size={13} color="var(--brand-text-muted)" />
              <span>{t("diag_history_locked")}</span>
            </div>
          ) : diagHistory.length === 0 ? (
            <p style={styles.helpTextSmall}>{t("diag_history_empty")}</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={styles.diagHistTable}>
                <thead>
                  <tr>
                    <th style={{ ...styles.diagHistTh, width: 62 }}>{t("diag_history_date")}</th>
                    <th style={styles.diagHistTh}>{t("diag_history_note")}</th>
                    <th style={styles.diagHistTh}>{t("diag_history_response")}</th>
                    <th style={{ ...styles.diagHistTh, width: 54 }}>{t("diag_history_confidence")}</th>
                    <th style={{ ...styles.diagHistTh, width: 30 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {diagHistory.map((d) => (
                    <tr key={d.id}>
                      <td style={styles.diagHistTd}>{formatDateShort(d.date)}</td>
                      <td style={styles.diagHistTd}>{d.note}</td>
                      <td style={styles.diagHistTd}>
                        {d.suggestion}
                        {d.confidence_reason && (
                          <div style={{ fontSize: 10.5, color: "var(--brand-text-muted)", marginTop: 4, fontStyle: "italic" }}>
                            {d.confidence_reason}
                          </div>
                        )}
                      </td>
                      <td style={styles.diagHistTd}>
                        <span style={{ fontSize: 13, letterSpacing: 1, whiteSpace: "nowrap" }}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} style={{ color: i < d.confidence ? "#f59e0b" : "#d1d5db" }}>★</span>
                          ))}
                        </span>
                      </td>
                      <td style={styles.diagHistTd}>
                        <button
                          onClick={() => { if (window.confirm(t("diag_history_confirm_delete"))) deleteDiagEntry(d.id); }}
                          style={{ background: "none", border: "none", padding: 4, cursor: "pointer" }}
                          aria-label={t("diag_history_delete")}
                        >
                          <Trash2 size={14} color="#c0392b" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// v1.63.0 — Ligne compacte pour une application manuelle hors plan (ex.
// entretien périodique), affichée dans le même journal que les mesures.
function ManualApplicationRow({ app, lang }) {
  const t = useT(lang || "fr");
  return (
    <div style={{ ...styles.productRow, cursor: "default" }}>
      <div style={{ ...styles.productThumbPlaceholder, background: "#fff7f2" }}>
        <Beaker size={16} color="#c4502f" />
      </div>
      <div style={{ flex: 1, textAlign: "left" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: "#c4502f", background: "#fff0e8", border: "1px solid #f3d9c8", borderRadius: 99, padding: "2px 8px" }}>
            🔧 {t("reason_manual_maintenance")}
          </span>
          <span style={{ fontSize: 11.5, color: "var(--brand-text-muted)" }}>
            {formatDate(app.appliedAt)} · {new Date(app.appliedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--brand-text-strong)", marginTop: 4 }}>
          {app.productName} — {formatDose(app.appliedAmount, app.doseUnit || "g")}
        </div>
      </div>
    </div>
  );
}

function MeasureRow({ measure, onDelete, onEdit, onValidateApplication, application, isPremium, manageStock, lang, activePlan, authUid }) {
  const t = useT(lang || "fr");
  const [open, setOpen] = useState(false);
  // v1.39.0 — Les photos ne sont plus inline sur measure (voir FB.saveMeasure) :
  // elles vivent dans la sous-collection users/{uid}/measures/{id}/photos et
  // sont chargées à la demande, seulement quand la ligne est dépliée. Une
  // mesure tout juste ajoutée dans cette session garde encore measure.photos
  // en mémoire locale (pas encore écrasé par le snapshot cloud) : dans ce cas
  // pas besoin de fetch, on les utilise directement.
  const [loadedPhotos, setLoadedPhotos] = useState(null);
  const [loadedPoolPhotos, setLoadedPoolPhotos] = useState(null);
  const [photosLoading, setPhotosLoading] = useState(false);
  const hasAnyPhotos = !!(measure.photoCount || measure.poolPhotoCount || measure.photo || measure.photos?.length || measure.poolPhotos?.length);
  // v1.39.0 — thumbnail (miniature persistée, quelques Ko) prioritaire pour
  // l'aperçu replié : contrairement à measure.photo, elle survit à l'écrasement
  // par le listener temps réel (voir FB.saveMeasure / saveMeasureWithThumbnail).
  const headerPreview = measure.thumbnail || measure.photo || null;

  useEffect(() => {
    if (!open || loadedPhotos !== null || !hasAnyPhotos) return;
    if (measure.photos?.length || measure.photo || measure.poolPhotos?.length) {
      setLoadedPhotos(measure.photos?.length ? measure.photos : (measure.photo ? [measure.photo] : []));
      setLoadedPoolPhotos(measure.poolPhotos || []);
      return;
    }
    if (!authUid) return;
    setPhotosLoading(true);
    FB.getMeasurePhotos(authUid, measure.id)
      .then(({ photos, poolPhotos }) => {
        setLoadedPhotos(photos);
        setLoadedPoolPhotos(poolPhotos);
      })
      .catch(() => {
        setLoadedPhotos([]);
        setLoadedPoolPhotos([]);
      })
      .finally(() => setPhotosLoading(false));
  }, [open, authUid, measure.id]);

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
          {headerPreview && (
            <img
              src={headerPreview}
              alt=""
              style={{ ...styles.measureThumb, cursor: "zoom-in" }}
              onClick={(e) => { e.stopPropagation(); window._openLightbox?.(measure.photo || headerPreview); }}
            />
          )}
          <span style={styles.measureDate}>{formatDate(measure.date)}</span>
        </div>
        <ChevronRight
          size={16}
          color="var(--brand-text-muted)"
          style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform .15s" }}
        />
      </button>
      {open && (
        <div style={styles.measureDetails}>
          {photosLoading && (
            <div style={{ fontSize: 12, color: "var(--brand-text-muted)", marginBottom: 8 }}>{t("loading")}</div>
          )}
          {/* Photos d'analyse (photomètre/bandelette) */}
          {loadedPhotos?.length > 0 && (
            <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 10 }}>
              {loadedPhotos.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt=""
                  style={{ height: 110, borderRadius: 8, objectFit: "cover", flexShrink: 0, border: "1px solid #d0e4f5", cursor: "zoom-in" }}
                  onClick={() => window._openLightbox?.(src)}
                />
              ))}
            </div>
          )}
          {/* Photos bassin */}
          {loadedPoolPhotos?.length > 0 && (
            <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 10 }}>
              {loadedPoolPhotos.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt=""
                  style={{ height: 110, borderRadius: 8, objectFit: "cover", flexShrink: 0, border: "1px solid #d0e4f5", cursor: "zoom-in" }}
                  onClick={() => window._openLightbox?.(src)}
                />
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
            <div style={{ marginTop: 8 }}>
              {(application.steps || []).map((s, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 0",
                  borderBottom: i < application.steps.length - 1 ? "1px solid #eaf4fb" : "none",
                }}>
                  <div style={{ marginTop: 2 }}>
                    {s.skipped
                      ? <span style={{ fontSize: 11, color: "#9ab0c4" }}>⊘</span>
                      : <CheckCircle2 size={14} color="#1a8fd1" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: s.skipped ? "#9ab0c4" : "var(--brand-text-strong)" }}>
                      {s.productName || s.title}
                      {s.appliedAmount && !s.skipped && (
                        <span style={{ fontWeight: 400, color: "var(--brand-text-secondary)", marginLeft: 6 }}>
                          — {s.appliedAmount >= 1000 ? `${(s.appliedAmount/1000).toFixed(2)} ${s.doseUnit === "g" ? "kg" : "L"}` : `${s.appliedAmount} ${s.doseUnit || "g"}`}
                        </span>
                      )}
                    </div>
                    {s.appliedAt && (
                      <div style={{ fontSize: 11, color: s.skipped ? "#b0c4d4" : "#4a8fd1", marginTop: 1 }}>
                        {s.skipped ? t("treatment_skipped") : t("treatment_at")} {new Date(s.appliedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div style={{ fontSize: 11, color: "var(--brand-text-muted)", marginTop: 4 }}>
                {application.allApplied ? t("wizard_completed") : t("wizard_partial")}
              </div>
            </div>
          ) : (
            !measure.importedFromPdf && (
              activePlan && activePlan.measureId === measure.id ? (
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--brand-primary)", fontWeight: 600, padding: "6px 0" }}>
                  <Clock size={14} color="var(--brand-primary)" />
                  {t("plan_in_progress")}
                </div>
              ) : (
                <button
                  style={{
                    ...styles.validateApplyBtnSmall,
                    ...(!manageStock ? { background: "#c3d6e6", color: "#f0f5fa" } : {}),
                  }}
                  onClick={onValidateApplication}
                >
                  <CheckCircle2 size={14} /> {t("wizard_start")}
                  {!manageStock && <Lock size={12} style={{ marginLeft: 2 }} />}
                </button>
              )
            )
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
function AddMeasureModal({ measure, application, products, manageStock, onSaveApplication, onClose, onSave, isPremium, onWantPremium, apiKey, apiProvider, activeParamKeys, lang, onRequestPhotoAccess, authUid, measureDevice, stripProducts, calibrationContribution }) {
  const t = useT(lang || "fr");
  const isPrefilled = !!measure?.__prefilled;
  const isEditing = !!measure && !isPrefilled;

  // v1.66.0 — Édition du traitement appliqué (produit/quantité/heure) en
  // même temps que la mesure. N'a de sens qu'en édition d'une mesure ayant
  // une application enregistrée avec au moins une étape non ignorée.
  function findAnyProdForEdit(name) {
    return (products || []).find((p) => p.name === name) || DEFAULT_PRODUCTS.find((p) => p.name === name) || null;
  }
  function toDispUnitForEdit(amount, unit, product) {
    if (product?.packagingType === "galets" && product?.unitWeight > 0 && unit === "g") {
      const v = amount != null ? Math.round(amount / product.unitWeight) : "";
      return { value: v, unit: t("unit_galets") };
    }
    if (unit === "g") {
      const v = amount != null ? parseFloat((amount / 1000).toFixed(3)) : "";
      return { value: v, unit: "kg" };
    }
    if (unit === "mL") {
      const v = amount != null ? parseFloat((amount / 1000).toFixed(3)) : "";
      return { value: v, unit: "L" };
    }
    return { value: amount ?? "", unit };
  }
  function toBaseAmtForEdit(value, dispUnit, baseUnit, product) {
    const v = parseFloat(value);
    if (isNaN(v)) return null;
    if (product?.packagingType === "galets" && product?.unitWeight > 0 && baseUnit === "g") {
      return Math.round(v) * product.unitWeight;
    }
    if (baseUnit === "g") return v * 1000;
    if (baseUnit === "mL") return v * 1000;
    return v;
  }
  function candidatesForEditAction(action, currentName) {
    const rel = action === "chlore" ? ["chlore", "chlore-stabilise"] : [action];
    const real = (products || []).filter((p) => rel.includes(p.action) && (p.stockPercent ?? 100) > 0);
    const generic = DEFAULT_PRODUCTS.filter((p) => rel.includes(p.action));
    const list = [...real, ...generic];
    if (currentName && !list.some((p) => p.name === currentName)) {
      list.unshift(findAnyProdForEdit(currentName) || { name: currentName });
    }
    return list;
  }
  const applicationSteps = application?.steps || [];
  const [treatmentEdits, setTreatmentEdits] = useState(() => {
    const map = {};
    applicationSteps.forEach((s, i) => {
      if (s.skipped || !s.appliedAt) return;
      const prod = findAnyProdForEdit(s.productName);
      const { value, unit } = toDispUnitForEdit(s.appliedAmount, s.doseUnit || "g", prod);
      const d = new Date(s.appliedAt);
      map[i] = {
        productName: s.productName,
        dispValue: value === "" || value == null ? "" : String(value),
        dispUnit: unit,
        time: `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`,
      };
    });
    return map;
  });
  function buildUpdatedApplicationSteps() {
    return applicationSteps.map((s, i) => {
      const ev = treatmentEdits[i];
      if (!ev) return s;
      const baseUnit = s.doseUnit || "g";
      const prod = findAnyProdForEdit(ev.productName);
      const amount = toBaseAmtForEdit(ev.dispValue, ev.dispUnit, baseUnit, prod);
      let appliedAt = s.appliedAt;
      if (ev.time) {
        const [h, m] = ev.time.split(":").map(Number);
        const d = new Date(s.appliedAt);
        d.setHours(h, m, 0, 0);
        appliedAt = d.toISOString();
      }
      return { ...s, productName: ev.productName, appliedAmount: amount, appliedAt };
    });
  }
  const [date, setDate] = useState(
    measure ? new Date(measure.date).toISOString().slice(0, 16) : todayLocalDatetime()
  );
  // v1.35.0 — Lot B (calibration) : identifie quel produit "outil-mesure" du
  // stock a servi pour la lecture bandelette. Pas de liste fermée de marques —
  // on réutilise directement le nom du produit déjà saisi par l'utilisateur
  // dans son stock. Auto-sélectionné s'il n'y en a qu'un, à choisir sinon.
  const [stripModel, setStripModel] = useState(
    measure?.stripModel || (stripProducts?.length === 1 ? stripProducts[0].name : "")
  );
  // v1.33.0 — Fix : ce champ n'était jamais mis à jour (setMethod jamais
  // appelé nulle part), donc TOUTES les mesures étaient enregistrées avec
  // method: "photometre" même prises à la bandelette. Désormais initialisé
  // depuis le réglage du bassin (measureDevice) quand il est tranché, et
  // recalculé après analyse IA à partir du "device" détecté sur les photos.
  const [method, setMethod] = useState(
    measure?.method || (measureDevice && measureDevice !== "both" ? measureDevice : "photometre")
  ); // photometre | bandelette
  const [pH, setPH] = useState(measure?.pH ?? "");
  const [fCl, setFCl] = useState(measure?.fCl ?? "");
  const [tCl, setTCl] = useState(measure?.tCl ?? "");
  const [tac, setTac] = useState(measure?.tac ?? "");
  const [cya, setCya] = useState(measure?.cya ?? "");
  const [temp, setTemp] = useState(measure?.temp ?? "");
  const [sel, setSel] = useState(measure?.sel ?? "");
  const [brome, setBrome] = useState(measure?.brome ?? "");
  const [o2, setO2] = useState(measure?.o2 ?? "");
  const [ccl, setCcl] = useState(measure?.ccl ?? "");
  const [hard, setHard] = useState(measure?.hard ?? "");
  const [phos, setPhos] = useState(measure?.phos ?? "");
  const [copper, setCopper] = useState(measure?.copper ?? "");
  const [iron, setIron] = useState(measure?.iron ?? "");
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
  const [analyzeTimer, setAnalyzeTimer] = useState(null); // secondes écoulées | null
  const [analyzeReliability, setAnalyzeReliability] = useState(null); // { score: 1-5, reason: string }
  const analyzeTimerRef = React.useRef(null);
  const [confirmAnalyze, setConfirmAnalyze] = useState(false);
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const poolFileInputRef = useRef(null);

  // v1.39.0 — En édition, measure.photos/poolPhotos n'existent plus une fois
  // la mesure synchronisée sur Firestore (voir FB.saveMeasure) : on les
  // recharge depuis la sous-collection dédiée si le state local (initialisé
  // ci-dessus depuis measure.photo/photos) est vide alors que la mesure en
  // a réellement (photoCount/poolPhotoCount > 0).
  useEffect(() => {
    if (!isEditing || !measure?.id || !authUid) return;
    if (photos.length || poolPhotos.length) return;
    if (!measure.photoCount && !measure.poolPhotoCount) return;
    let cancelled = false;
    FB.getMeasurePhotos(authUid, measure.id)
      .then(({ photos: p, poolPhotos: pp }) => {
        if (cancelled) return;
        if (p.length) setPhotos(p);
        if (pp.length) setPoolPhotos(pp);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isEditing, measure?.id, authUid]);
  const poolGalleryInputRef = useRef(null);

  async function handlePoolPhotoChange(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setPoolPhotoBusy(true);
    try {
      // v1.39.0 — Fix : ces photos n'étaient jamais compressées (contrairement
      // aux photos d'analyse via compressImageDataUrl), donc stockées à leur
      // taille brute smartphone (3-8 Mo pièce) — un facteur aggravant du
      // dépassement de la limite Firestore de 1 Mio par document.
      const dataUrls = await Promise.all(
        files.map(async (f) => compressImageDataUrl(await fileToDataUrl(f)))
      );
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
      const dataUrls = await Promise.all(
        files.map(async (f) => compressImageDataUrl(await fileToDataUrl(f)))
      );
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
    setAnalyzeReliability(null);
    // Démarrer le timer
    setAnalyzeTimer(0);
    let elapsed = 0;
    analyzeTimerRef.current = setInterval(() => {
      elapsed += 1;
      setAnalyzeTimer(elapsed);
    }, 1000);
    try {
      // Analyse chaque photo et consolide les résultats en prenant la valeur la plus fiable par paramètre
      const allResults = [];
      const notes = [];
      for (const dataUrl of photos) {
        const result = await analyzeStripPhoto({ apiKey, apiProvider, dataUrl, uid: authUid });
        allResults.push(result);
        if (result.note) notes.push(result.note);
      }

      // v1.33.0 — Fix : method n'était jamais recalculé après analyse (toujours
      // "photometre" par défaut). On le déduit maintenant des "device" détectés
      // par l'IA sur les photos réellement fournies, avec la même priorité
      // photomètre > bandelette qu'ailleurs dans cette fonction.
      const detectedDevices = allResults.map(r => r.device).filter(Boolean);
      if (detectedDevices.length) {
        setMethod(detectedDevices.includes("photometre") ? "photometre" : "bandelette");
      }

      // v1.31.0 — Priorité stricte au photomètre : quand une photo photomètre et une
      // photo bandelette sont fournies pour la même mesure, la valeur du photomètre est
      // retenue systématiquement pour chaque paramètre qu'il couvre, quelle que soit la
      // confiance de la lecture bandelette sur ce même paramètre. La bandelette ne sert
      // qu'à compléter les paramètres que le photomètre ne couvre pas.
      // v1.33.0 — Fin de la moyenne entre candidats à égalité de score. Avec plusieurs
      // photos bandelette (tube tourné), chaque tampon doit être évalué indépendamment :
      // on prend, PAR PARAMÈTRE, la valeur dont la fiabilité de CE tampon précis
      // (reliability_by_param) est la meilleure — jamais une moyenne entre deux lectures
      // différentes, qui masquerait l'info que l'une des deux est plus fiable. En cas
      // d'égalité stricte de score, on garde la première photo dans l'ordre de capture
      // (déterministe, pas de calcul supplémentaire).
      const CCL_TOLERANCE = 0.05; // même seuil que la validation de saisie manuelle (handleSave)
      const confidenceScore = { "haute": 3, "high": 3, "medio": 2, "moyenne": 2, "medium": 2, "bassa": 1, "basse": 1, "low": 1 };
      const numericKeys = ["pH","fCl","tCl","ccl","tac","cya","hard","phos","copper","iron","temp","brome","o2","sel"];
      const merged = {};
      // v1.36.0 — Lot B : candidats de calibration collectés en même temps que
      // la fusion, un par paramètre où on a À LA FOIS une valeur photomètre
      // (trueValue fiable) ET une lecture bandelette avec sample_points
      // exploitables sur CETTE mesure. Écrits dans Firestore après la fusion,
      // seulement si l'utilisateur contribue et a un modèle de bandelette
      // renseigné (cf. state stripModel plus haut).
      const calibrationCandidates = [];
      // v1.38.0 — Lot B : paramètres lus uniquement à la bandelette (pas de
      // valeur photomètre en parallèle) — candidats à une correction par
      // modèle de calibration communautaire une fois la boucle terminée.
      const bandeletteOnlyCandidates = [];

      numericKeys.forEach(k => {
        // Score par tampon : priorité à reliability_by_param[k] (1-5, spécifique à ce
        // paramètre) ; à défaut (ancien format IA sans ce champ, ou clé absente),
        // repli sur reliability globale de la photo, puis sur confidence.
        const candidates = allResults
          .map((r, idx) => ({ r, idx }))
          .filter(({ r }) => r[k] !== null && r[k] !== undefined)
          .map(({ r, idx }) => ({
            value: r[k],
            score: r.reliability_by_param?.[k] ?? r.reliability ?? confidenceScore[r.confidence] ?? 1,
            device: r.device,
            samplePoints: r.sample_points?.[k] || null,
            photoIdx: idx,
          }));
        if (candidates.length === 0) return;
        const photometerCandidates = candidates.filter(c => c.device === "photometre");
        const pool = photometerCandidates.length ? photometerCandidates : candidates;
        // Meilleur score du groupe retenu (photomètre si disponible, sinon bandelette) ;
        // première occurrence en cas d'égalité, jamais de moyenne.
        const maxScore = Math.max(...pool.map(c => c.score));
        const best = pool.find(c => c.score === maxScore);
        merged[k] = Math.round(best.value * 100) / 100;

        // Point de calibration : seulement si trueValue vient du photomètre (sinon
        // ce n'est qu'une estimation, pas une référence), et qu'une lecture
        // bandelette avec coordonnées exploitables existe pour ce même paramètre.
        if (best.device === "photometre") {
          const bandeletteCandidates = candidates.filter(c => c.device === "bandelette" && c.samplePoints?.pad && c.samplePoints?.reference);
          if (bandeletteCandidates.length) {
            const bMaxScore = Math.max(...bandeletteCandidates.map(c => c.score));
            const bBest = bandeletteCandidates.find(c => c.score === bMaxScore);
            calibrationCandidates.push({ param: k, trueValue: merged[k], photoIdx: bBest.photoIdx, samplePoints: bBest.samplePoints });
          }
        } else if (best.device === "bandelette" && best.samplePoints?.pad) {
          // v1.38.0 — Lot B : aucune valeur photomètre disponible pour ce
          // paramètre — candidat à une correction par modèle de calibration
          // communautaire (cf. bloc après la boucle).
          bandeletteOnlyCandidates.push({ param: k, photoIdx: best.photoIdx, samplePoints: best.samplePoints });
        }
      });

      // v1.38.0 — Lot B : correction des lectures bandelette seules (aucune
      // valeur photomètre disponible pour ce paramètre sur cette mesure) via
      // le modèle de calibration communautaire (calibrationModels), quand il
      // existe pour ce modèle de bandelette + paramètre. Le modèle n'existe
      // que si le Worker a jugé qu'il y avait assez de points de qualité
      // suffisante (cf. aggregateCalibrationModels côté Worker) — sa seule
      // présence en base vaut donc validation du seuil. Best-effort et
      // silencieux : un échec (pas de modèle, image illisible...) laisse
      // simplement l'estimation visuelle de l'IA inchangée dans merged[k].
      if (stripModel && bandeletteOnlyCandidates.length) {
        const normalizedModelForCorrection = normalizeStripModel(stripModel);
        for (const bc of bandeletteOnlyCandidates) {
          try {
            const model = await FB.getCalibrationModel(normalizedModelForCorrection, bc.param);
            if (!model?.coefficients) continue;
            const photoDataUrl = photos[bc.photoIdx];
            const { color } = await sampleColorAndQuality(photoDataUrl, bc.samplePoints.pad[0], bc.samplePoints.pad[1]);
            const { a, b, c: coefC, d } = model.coefficients;
            const predicted = a * color.r + b * color.g + coefC * color.b + d;
            merged[bc.param] = Math.max(0, Math.round(predicted * 100) / 100);
          } catch (e) {
            // silencieux — correction best-effort, l'estimation IA reste valable
          }
        }
      }

      if (merged.pH     !== undefined) setPH(String(merged.pH));
      if (merged.fCl    !== undefined) setFCl(String(merged.fCl));
      if (merged.tCl    !== undefined) setTCl(String(merged.tCl));
      // CCL — la formule TCL - FCL = CCL est impérative. Si l'IA a interprété un CCL qui
      // ne la respecte pas (tolérance 0.05 mg/L), cette valeur est ignorée et CCL est
      // recalculé à partir de TCL et FCL plutôt que conservé tel quel.
      if (merged.ccl !== undefined && merged.fCl !== undefined && merged.tCl !== undefined) {
        const expectedCcl = merged.tCl - merged.fCl;
        if (Math.abs(expectedCcl - merged.ccl) > CCL_TOLERANCE) {
          setCcl(String(Math.max(0, Math.round(expectedCcl * 100) / 100)));
        } else {
          setCcl(String(merged.ccl));
        }
      } else if (merged.ccl !== undefined) {
        setCcl(String(merged.ccl));
      } else if (merged.fCl !== undefined && merged.tCl !== undefined) {
        const autoCcl = Math.max(0, Math.round((merged.tCl - merged.fCl) * 100) / 100);
        setCcl(String(autoCcl));
      }
      if (merged.tac    !== undefined) setTac(String(merged.tac));
      if (merged.cya    !== undefined) setCya(String(merged.cya));
      if (merged.hard   !== undefined) setHard(String(merged.hard));
      if (merged.phos   !== undefined) setPhos(String(merged.phos));
      if (merged.copper !== undefined) setCopper(String(merged.copper));
      if (merged.iron   !== undefined) setIron(String(merged.iron));
      if (merged.temp   !== undefined) setTemp(String(merged.temp));
      if (merged.brome  !== undefined) setBrome(String(merged.brome));
      if (merged.o2     !== undefined) setO2(String(merged.o2));
      if (merged.sel    !== undefined) setSel(String(merged.sel));

      // v1.36.0 — Lot B : écriture des points de calibration collectés pendant
      // la fusion. Best-effort et silencieux — un échec d'échantillonnage
      // couleur (image illisible, coordonnées hors cadre...) ne doit jamais
      // faire échouer l'analyse principale de la mesure.
      if (calibrationContribution && stripModel && calibrationCandidates.length) {
        const normalizedModel = normalizeStripModel(stripModel);
        for (const c of calibrationCandidates) {
          try {
            const photoDataUrl = photos[c.photoIdx];
            const [padSample, referenceColor] = await Promise.all([
              sampleColorAndQuality(photoDataUrl, c.samplePoints.pad[0], c.samplePoints.pad[1]),
              sampleColorAt(photoDataUrl, c.samplePoints.reference[0], c.samplePoints.reference[1]),
            ]);
            // padCoverageRatio : approximation de l'aire du tampon dans l'image,
            // à partir de padSizeFraction (largeur estimée par l'IA, fraction de
            // la largeur totale). Aire ≈ côté² (approximation carrée, suffisante
            // pour un indicateur de qualité relatif). null si l'IA n'a pas pu
            // estimer la taille du tampon sur cette photo.
            const padSizeFraction = c.samplePoints.padSizeFraction;
            const padCoverageRatio = (typeof padSizeFraction === "number" && padSizeFraction > 0)
              ? Math.round(padSizeFraction * padSizeFraction * 10000) / 10000
              : null;
            await FB.addCalibrationPoint({
              stripModel: normalizedModel,
              param: c.param,
              sampledColor: padSample.color,
              referenceColor,
              trueValue: c.trueValue,
              capturedAt: new Date().toISOString(),
              sharpness: padSample.sharpness,
              exposure: padSample.exposure,
              exposureClipped: padSample.exposureClipped,
              padCoverageRatio,
            });
          } catch (e) {
            // silencieux — contribution best-effort, jamais bloquante pour l'utilisateur
          }
        }
      }

      // Calculer la note de fiabilité consolidée (moyenne des notes de chaque photo)
      const reliabilityScores = allResults.filter(r => r.reliability != null).map(r => Number(r.reliability));
      const avgReliability = reliabilityScores.length
        ? Math.round(reliabilityScores.reduce((a, b) => a + b, 0) / reliabilityScores.length)
        : null;
      // Prendre la raison de la photo avec la meilleure fiabilité
      const bestResult = allResults.reduce((best, r) => (!best || (r.reliability > (best.reliability || 0))) ? r : best, null);
      if (avgReliability !== null) {
        setAnalyzeReliability({ score: avgReliability, reason: bestResult?.reliability_reason || "" });
      }

      // Vérifier si au moins une valeur numérique a été extraite
      const hasValues = numericKeys.some(k => merged[k] !== undefined && merged[k] !== null);
      if (!hasValues) {
        setAnalyzeError(t("ai_no_values"));
      } else {
        setAnalyzeNote(
          `${photos.length} photo(s) — ${notes.join(" / ") || t("verify_connection")}`
        );
      }
    } catch (err) {
      setAnalyzeError(t("error_analyze") + " : " + (err?.message || t("verify_connection")));
    } finally {
      // Arrêter le timer mais garder la valeur affichée
      if (analyzeTimerRef.current) {
        clearInterval(analyzeTimerRef.current);
        analyzeTimerRef.current = null;
      }
      setAnalyzing(false);
    }
  }

  const [cclError, setCclError] = useState(null);
  const [tclForcedInfo, setTclForcedInfo] = useState(null);

  function handleSave() {
    const fClNum = fCl !== "" ? parseFloat(fCl) : null;
    let tClNum = tCl !== "" ? parseFloat(tCl) : null;
    let tClFinal = tCl;

    // v1.56.0 — TCL (chlore total) ne peut physiquement pas être inférieur à
    // FCL (chlore libre), puisque TCL = FCL + CCL. Cas rencontré en pratique
    // avec une interférence métaux (Mn/Fe) faussant la lecture FCL. Plutôt que
    // de bloquer l'enregistrement (ancien comportement), on force TCL = FCL
    // et on informe l'utilisateur sans l'empêcher de sauvegarder sa mesure.
    if (fClNum != null && tClNum != null && tClNum < fClNum) {
      tClNum = fClNum;
      tClFinal = String(fClNum);
      setTCl(tClFinal);
      setTclForcedInfo(t("tcl_forced_to_fcl_info", { val: fClNum }));
      // On affiche la correction avant d'enregistrer plutôt que de l'appliquer
      // silencieusement en arrière-plan pendant que la fenêtre se referme —
      // l'utilisateur reclique "Enregistrer" une fois la valeur corrigée vue.
      return;
    } else {
      setTclForcedInfo(null);
    }

    // CCL auto-calculé si non saisi et fCl + tCl disponibles
    let cclFinal = ccl;
    if ((ccl === "" || ccl == null) && fClNum != null && tClNum != null) {
      cclFinal = String(Math.max(0, Math.round((tClNum - fClNum) * 100) / 100));
      setCcl(cclFinal);
    }

    // Validation : FCL + CCL <= TCL (tolérance 0.05), sur les valeurs corrigées
    const cclNum = cclFinal !== "" ? parseFloat(cclFinal) : null;
    if (fClNum != null && cclNum != null && tClNum != null) {
      if (fClNum + cclNum > tClNum + 0.05) {
        setCclError(t("ccl_fcl_tcl_error"));
        return;
      }
    }
    setCclError(null);

    // v1.66.0 — Mise à jour du traitement appliqué (produit/quantité/heure),
    // en plus de la mesure elle-même, si une application existe pour cette
    // mesure. Corrige le stock en delta côté parent (editHistoricalApplication).
    if (application && onSaveApplication) {
      onSaveApplication(application.id, buildUpdatedApplicationSteps());
    }

    onSave({
      ...(isEditing ? { id: measure.id } : {}),
      ...(isPrefilled && measure?.importedFromPdf ? { importedFromPdf: true } : {}),
      date: new Date(date).toISOString(),
      method,
      // v1.35.0 — Lot B : clé normalisée du produit "outil-mesure" utilisé,
      // pour un futur regroupement dans calibrationPoints. null si method
      // n'est pas "bandelette" ou si l'utilisateur n'a rien précisé.
      stripModel: method === "bandelette" && stripModel ? normalizeStripModel(stripModel) : null,
      pH,
      fCl,
      tCl: tClFinal,
      ccl: cclFinal,
      tac,
      cya,
      hard,
      phos,
      copper,
      iron,
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
    { key: "pH",    abbr: "pH",   label: `pH - ${t("param_ph")}`,           value: pH,     set: setPH,     step: "0.01", placeholder: "7.40" },
    { key: "fCl",  abbr: "FCL",  label: `FCL - ${t("param_fcl_long")}`,    value: fCl,    set: setFCl,    step: "0.01", placeholder: "1.20" },
    { key: "tCl",  abbr: "TCL",  label: `TCL - ${t("param_tcl_long")}`,    value: tCl,    set: setTCl,    step: "0.01", placeholder: "1.30" },
    { key: "ccl",  abbr: "CCL",  label: `CCL - ${t("param_ccl_long")}`,    value: ccl,    set: setCcl,    step: "0.01", placeholder: "0.00" },
    { key: "tac",  abbr: "TAC",  label: `TAC - ${t("param_tac_long")}`,    value: tac,    set: setTac,    step: "1",    placeholder: "100" },
    { key: "cya",  abbr: "CYA",  label: `CYA - ${t("param_cya_long")}`,    value: cya,    set: setCya,    step: "1",    placeholder: "40" },
    { key: "temp", abbr: "°C",   label: `°C - ${t("param_temp_long")}`,    value: temp,   set: setTemp,   step: "0.1",  placeholder: "27" },
    { key: "hard", abbr: "TH",   label: `TH - ${t("param_th_long")}`,      value: hard,   set: setHard,   step: "1",    placeholder: "250" },
    { key: "phos", abbr: "Phos", label: `Phos - ${t("param_phos_long")}`,  value: phos,   set: setPhos,   step: "1",    placeholder: "100" },
    { key: "copper",abbr: "Cu",  label: `Cu - ${t("param_cu_long")}`,      value: copper, set: setCopper, step: "0.01", placeholder: "0.10" },
    { key: "iron", abbr: "Fe",   label: `Fe - ${t("param_fe_long")}`,      value: iron,   set: setIron,   step: "0.01", placeholder: "0.00" },
    { key: "sel",  abbr: "Sel",  label: `Sel - ${t("param_sel")}`,         value: sel,    set: setSel,    step: "10",   placeholder: "4000" },
    { key: "brome",abbr: "Br",   label: `Br - ${t("param_brome")}`,        value: brome,  set: setBrome,  step: "0.1",  placeholder: "3.0" },
    { key: "o2",   abbr: "O2",   label: `O2 - ${t("param_o2")}`,           value: o2,     set: setO2,     step: "0.5",  placeholder: "20" },
  ];
  const fields = activeParamKeys
    ? ALL_FIELDS.filter((f) => activeParamKeys.includes(f.key))
    : ALL_FIELDS.filter((f) => ["pH","fCl","tCl","tac","cya","temp"].includes(f.key));

  return (
    <ModalShell onClose={onClose} title={isEditing ? t("edit_measure_title") : isPrefilled ? t("import_pdf_prefill_title") : t("new_measure_title")}>
      <label style={styles.fieldLabel}>{t("date_time")}</label>
      <input
        type="datetime-local"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        style={{ ...styles.input, fontWeight: 600, color: "var(--brand-primary)" }}
      />

      {isPremium ? (
        <div style={styles.photoHintBox}>
          <Camera size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{measureDevice === "bandelette" ? t("photo_hint_bandelette") : t("photo_hint")}</span>
        </div>
      ) : null}

      {method === "bandelette" && stripProducts && stripProducts.length > 1 && (
        <>
          <label style={styles.fieldLabel}>{t("strip_model_label")}</label>
          <select style={styles.input} value={stripModel} onChange={(e) => setStripModel(e.target.value)}>
            <option value="">{t("strip_model_none")}</option>
            {stripProducts.map((p) => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
          </select>
        </>
      )}

      <label style={styles.fieldLabel}>{t("photos_label")}</label>
      {isPremium ? (
        <div>
          {/* Grille de miniatures */}
          {photos.length > 0 && (
            <div style={styles.photoGrid}>
              {photos.map((src, idx) => (
                <div key={idx} style={styles.photoThumbWrap}>
                  <img
                    src={src}
                    alt={`Photo ${idx + 1}`}
                    style={{ ...styles.photoThumb, cursor: "zoom-in" }}
                    onClick={() => window._openLightbox?.(src)}
                  />
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
              onClick={() => {
                if (onRequestPhotoAccess) onRequestPhotoAccess(() => fileInputRef.current?.click());
                else fileInputRef.current?.click();
              }}
            >
              <Camera size={17} />
              {photoBusy ? t("loading") : photos.length ? t("other_photo") : t("camera_btn")}
            </button>
            <button
              type="button"
              style={styles.photoCaptureBtnHalf}
              onClick={() => {
                if (onRequestPhotoAccess) onRequestPhotoAccess(() => galleryInputRef.current?.click());
                else galleryInputRef.current?.click();
              }}
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
                  style={{ ...styles.aiAnalyzeBtn, ...(analyzing ? styles.aiAnalyzeBtnLoading : {}) }}
                  onClick={() => setConfirmAnalyze(true)}
                  disabled={analyzing}
                >
                  <Sparkles size={15} />
                  {t("ai_analyze_btn")} {photos.length > 1 ? `(${photos.length})` : ""}
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

          {/* Hint 30 secondes + compteur */}
          {!analyzing && analyzeTimer === null && (
            <div style={{ fontSize: 11, color: "var(--brand-text-muted)", marginTop: 6, textAlign: "center", fontStyle: "italic" }}>
              {t("ai_timer_hint")}
            </div>
          )}
          {analyzing && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 8, fontSize: 13, color: "var(--brand-primary)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
              <Loader2 size={14} className="spin" />
              {analyzeTimer}s
            </div>
          )}
          {!analyzing && analyzeTimer !== null && (
            <div style={{ fontSize: 12, color: "var(--brand-text-muted)", marginTop: 6, textAlign: "center" }}>
              ⏱ {analyzeTimer}s
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

      {/* Note de fiabilité étoiles — affichée même si les photos ont été retirées */}
      {analyzeReliability && (
        <div style={{ marginTop: 10, padding: "10px 12px", background: "#f5f8fc", borderRadius: 10, border: "1px solid #d0e4f5" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--brand-text-strong)" }}>{t("ai_reliability")} :</span>
            <span style={{ fontSize: 16, letterSpacing: 2 }}>
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} style={{ color: i < analyzeReliability.score ? "#f5a623" : "#d0d8e0" }}>★</span>
              ))}
            </span>
            <span style={{ fontSize: 11, color: "var(--brand-text-muted)" }}>{analyzeReliability.score}/5</span>
          </div>
          {analyzeReliability.reason && (
            <div style={{ fontSize: 11, color: "var(--brand-text-secondary)", lineHeight: 1.5 }}>{analyzeReliability.reason}</div>
          )}
        </div>
      )}

      {/* v1.31.0 — Couleur plus claire pour les placeholders (valeurs fictives d'exemple),
          pour mieux les distinguer des valeurs réellement saisies ou interprétées. Le
          rendu par défaut du navigateur varie trop d'un appareil à l'autre. */}
      <style>{`.measureFieldInput::placeholder { color: #b7c2cc; opacity: 1; }`}</style>
      <div style={styles.fieldGrid}>
        {fields.map((f) => {
          const isErrorField = cclError && ["fCl","ccl","tCl"].includes(f.key);
          return (
            <div key={f.key}>
              <label style={isErrorField ? { ...styles.fieldLabel, color: "#c0392b" } : styles.fieldLabel}>{f.label}</label>
              <input
                type="number"
                step={f.step}
                inputMode="decimal"
                placeholder={f.placeholder}
                className="measureFieldInput"
                value={f.value}
                onChange={(e) => { f.set(e.target.value); setCclError(null); setTclForcedInfo(null); }}
                style={isErrorField ? { ...styles.input, border: "1.5px solid #e74c3c", background: "#fdf5f5" } : styles.input}
              />
            </div>
          );
        })}
      </div>

      {tclForcedInfo && (
        <div style={{ marginTop: 8, padding: "8px 12px", background: "#eaf4fb", border: "1px solid #b0d8f0", borderRadius: 8, fontSize: 12, color: "var(--brand-primary)", display: "flex", alignItems: "center", gap: 6 }}>
          <AlertTriangle size={14} /> {tclForcedInfo}
        </div>
      )}

      {cclError && (
        <div style={{ marginTop: 8, padding: "8px 12px", background: "#fdf0ef", border: "1px solid #f5c6c2", borderRadius: 8, fontSize: 12, color: "#c0392b", display: "flex", alignItems: "center", gap: 6 }}>
          <AlertTriangle size={14} /> {cclError}
        </div>
      )}

      <label style={styles.fieldLabel}>{t("note_optional")}</label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={t("note_placeholder")}
        style={{ ...styles.input, minHeight: 88, resize: "vertical" }}
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

      {/* v1.66.0 — Édition du traitement appliqué (produit/quantité/heure),
          en plus de la mesure. Uniquement en édition d'une mesure ayant une
          application avec au moins une étape non ignorée. */}
      {isEditing && applicationSteps.length > 0 && (
        <div style={{ marginTop: 4, marginBottom: 4 }}>
          <label style={styles.fieldLabel}>{t("edit_treatment_section_title")}</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {applicationSteps.map((s, i) => {
              const ev = treatmentEdits[i];
              if (!ev) {
                // Étape ignorée ou non appliquée : lecture seule, non modifiable.
                return (
                  <div key={i} style={{ fontSize: 12.5, color: "#9ab0c4", padding: "4px 0" }}>
                    {s.productName || s.title} — {t("treatment_skipped")}
                  </div>
                );
              }
              const candidates = candidatesForEditAction(s.action, ev.productName);
              return (
                <div key={i} style={{ border: "1.5px solid #d0e4f5", borderRadius: 10, padding: 10 }}>
                  <select
                    value={ev.productName}
                    onChange={(e) => {
                      const newName = e.target.value;
                      const oldProd = findAnyProdForEdit(ev.productName);
                      const newProd = findAnyProdForEdit(newName);
                      const baseUnit = s.doseUnit || "g";
                      const baseAmount = toBaseAmtForEdit(ev.dispValue, ev.dispUnit, baseUnit, oldProd);
                      const { value, unit } = toDispUnitForEdit(baseAmount, baseUnit, newProd);
                      setTreatmentEdits((prev) => ({
                        ...prev,
                        [i]: { ...prev[i], productName: newName, dispValue: value === "" || value == null ? "" : String(value), dispUnit: unit },
                      }));
                    }}
                    style={{ width: "100%", boxSizing: "border-box", fontSize: 14, fontWeight: 600, color: "var(--brand-text-strong)", border: "2px solid #d0e4f5", borderRadius: 10, padding: "10px 12px", outline: "none", background: "#fff", marginBottom: 8 }}
                  >
                    {candidates.map((p) => (
                      <option key={p.id || p.name} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="number"
                      value={ev.dispValue}
                      onChange={(e) => setTreatmentEdits((prev) => ({ ...prev, [i]: { ...prev[i], dispValue: e.target.value } }))}
                      style={{ flex: 1, fontSize: 18, fontWeight: 700, color: "var(--brand-text-strong)", border: "2px solid #d0e4f5", borderRadius: 10, padding: "8px 10px", textAlign: "center", outline: "none" }}
                      step={ev.dispUnit === t("unit_galets") ? "1" : "0.01"}
                    />
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--brand-text-secondary)", minWidth: 32 }}>{ev.dispUnit}</div>
                    <input
                      type="time"
                      value={ev.time}
                      onChange={(e) => setTreatmentEdits((prev) => ({ ...prev, [i]: { ...prev[i], time: e.target.value } }))}
                      style={{ fontSize: 14, fontWeight: 700, color: "var(--brand-primary)", border: "2px solid #d0e4f5", borderRadius: 10, padding: "8px 10px", outline: "none" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button style={styles.primaryBtn} onClick={handleSave}>
        {isEditing ? t("save_changes") : t("save_measure")}
      </button>
    </ModalShell>
  );
}

// ---------- Validation des conseils appliqués ----------

// ---------- PlanStatusCard : countdown du plan en cours ----------
function PlanStatusCard({ plan, onResume, lang }) {
  const t = useT(lang);
  const [now, setNow] = React.useState(Date.now());

  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);

  if (!plan) return null;
  const currentStep = plan.currentStepIdx >= 0 ? plan.steps[plan.currentStepIdx] : null;
  const doneSteps = plan.steps.filter((s) => s.appliedAt && !s.skipped).length;
  const totalSteps = plan.steps.length;

  function formatCountdown(ms) {
    if (ms <= 0) return t("countdown_done");
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    if (h > 0) return `${h}h ${m.toString().padStart(2,"0")}min`;
    if (m > 0) return `${m}min ${s.toString().padStart(2,"0")}s`;
    return `${s}s`;
  }

  const scheduled = currentStep?.scheduledAt ? new Date(currentStep.scheduledAt).getTime() : null;
  const remaining = scheduled ? scheduled - now : null;
  const isReady = remaining !== null && remaining <= 0;

  return (
    <div style={{
      background: isReady ? "#e8f8f0" : "#eaf4fb",
      border: `1.5px solid ${isReady ? "#1a8fd1" : "#b0d8f0"}`,
      borderRadius: 12, padding: "12px 14px", marginTop: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--brand-text-strong)" }}>
          {t("wizard_partial")} — {doneSteps}/{totalSteps}
        </span>
        <button
          style={{ background: "var(--brand-primary)", color: "#fff", border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
          onClick={onResume}
        >
          {t("wizard_resume")}
        </button>
      </div>
      {currentStep && (
        <div style={{ fontSize: 13, color: "var(--brand-text-strong)" }}>
          <span style={{ fontWeight: 600 }}>{t("wizard_next_step")} : {currentStep.productName || currentStep.title}</span>
          <div style={{ fontSize: 12, color: isReady ? "#1a8fd1" : "var(--brand-text-secondary)", marginTop: 2, fontWeight: isReady ? 700 : 400 }}>
            {remaining !== null
              ? isReady
                ? t("countdown_done")
                : `${t("wizard_in")} ${formatCountdown(remaining)} — ${t("wizard_at")} ${new Date(currentStep.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
              : t("wizard_now")}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- TreatmentWizard : wizard pas-à-pas ----------
function TreatmentWizard({ plan, products, manageStock, lang, onApplyStep, onSkipStep, onClose, onCancel, onWantAddProduct, onEditPrevStep }) {
  const t = useT(lang);
  const [now, setNow] = React.useState(Date.now());
  const [editAmount, setEditAmount] = React.useState(null);
  const [editTime, setEditTime] = React.useState("");
  const [editingPrev, setEditingPrev] = React.useState(false);
  const [prevAmount, setPrevAmount] = React.useState("");
  const [prevTime, setPrevTime] = React.useState("");
  const [selectedProduct, setSelectedProduct] = React.useState(null);
  // v1.61.0 — Quand aucun produit n'est en stock dans la catégorie : saisie
  // libre, avec un choix d'unité (kg ou unités) non lié à une fiche produit.
  const [freeUnitMode, setFreeUnitMode] = React.useState("kg");

  // v1.61.0 — Produits candidats pour l'action d'un step (ou action liée,
  // ex. "chlore"/"chlore-stabilise" servent tous deux à remonter le chlore
  // libre), filtrés sur le stock réel et triés : le plus entamé puis le
  // plus ancien en premier (on privilégie de terminer un produit avant
  // d'en entamer un nouveau).
  function getSortedCandidates(stepAction) {
    if (!manageStock || !products) return [];
    const relatedActions = stepAction === "chlore" ? ["chlore", "chlore-stabilise"] : [stepAction];
    const candidates = products.filter((p) => relatedActions.includes(p.action) && (p.stockPercent ?? 100) > 0);
    return [...candidates].sort((a, b) => {
      const stockDiff = (a.stockPercent ?? 100) - (b.stockPercent ?? 100);
      if (stockDiff !== 0) return stockDiff;
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return aDate - bDate;
    });
  }

  // v1.63.2 — Quand aucun produit de l'utilisateur n'est en stock pour cette
  // action, on propose les produits génériques (DEFAULT_PRODUCTS, catalogue
  // de référence utilisé par ailleurs pour les calculs de dose de repli) au
  // lieu d'une saisie libre sans nom. Non liés au stock réel : jamais
  // décomptés (saveApplication ne décrémente que les produits présents dans
  // "products", donc un nom générique n'y matche jamais).
  function getGenericCandidates(stepAction) {
    const relatedActions = stepAction === "chlore" ? ["chlore", "chlore-stabilise"] : [stepAction];
    return DEFAULT_PRODUCTS.filter((p) => relatedActions.includes(p.action));
  }

  // Résout un nom de produit en objet, en cherchant d'abord dans les produits
  // réels de l'utilisateur, puis dans le catalogue générique (fallback).
  function findAnyProduct(name) {
    return (products || []).find((p) => p.name === name) || DEFAULT_PRODUCTS.find((p) => p.name === name) || null;
  }

  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (plan && plan.currentStepIdx >= 0) {
      const step = plan.steps[plan.currentStepIdx];
      if (step) {
        const amount = step.computedDoseAmount ?? step.appliedAmount;
        const unit = step.doseUnit || "g";
        // v1.61.0 — Pré-sélection du produit à utiliser : le plus entamé
        // puis le plus ancien parmi les produits en stock de l'action (ou
        // action liée). Si aucun candidat réel, on retombe sur le premier
        // produit générique correspondant (v1.63.2), puis sur le
        // productName du step (produit par défaut / conseillé par l'algorithme).
        const sorted = getSortedCandidates(step.action);
        const generic = getGenericCandidates(step.action);
        const defaultProductName = sorted.length > 0 ? sorted[0].name
          : generic.length > 0 ? generic[0].name
          : step.productName;
        const defaultProductObj = sorted.length > 0 ? sorted[0]
          : generic.length > 0 ? generic[0]
          : products?.find((p) => p.name === step.productName);
        const { value } = toDisplayUnit(amount, unit, defaultProductObj);
        setEditAmount(value != null && value !== "" ? String(value) : "");
        // Heure par défaut = maintenant en format HH:MM
        const d = new Date();
        setEditTime(`${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`);
        setSelectedProduct(defaultProductName);
        setFreeUnitMode("kg");
        setEditingPrev(false);
      }
    }
  }, [plan?.currentStepIdx]);

  function toDisplayUnit(amount, unit, product) {
    // v1.61.0 — Produit conditionné en galets/sticks : affichage en nombre
    // d'unités (arrondi), converti depuis la dose calculée en grammes.
    if (product?.packagingType === "galets" && product?.unitWeight > 0 && unit === "g") {
      const v = amount != null ? Math.round(amount / product.unitWeight) : "";
      return { value: v, displayUnit: t("unit_galets") };
    }
    // Toujours afficher en kg ou L (jamais g ou mL)
    if (unit === "g") {
      const v = amount != null ? parseFloat((amount / 1000).toFixed(3)) : "";
      return { value: v, displayUnit: "kg" };
    }
    if (unit === "mL") {
      const v = amount != null ? parseFloat((amount / 1000).toFixed(3)) : "";
      return { value: v, displayUnit: "L" };
    }
    return { value: amount ?? "", displayUnit: unit };
  }

  function toBaseUnit(value, displayUnit, baseUnit, product) {
    const v = parseFloat(value);
    if (isNaN(v)) return null;
    // v1.61.0 — Conversion inverse nombre de galets → grammes.
    if (product?.packagingType === "galets" && product?.unitWeight > 0 && baseUnit === "g") {
      return Math.round(v) * product.unitWeight;
    }
    // displayUnit est toujours kg ou L (jamais g ou mL)
    if (baseUnit === "g") return v * 1000; // kg → g
    if (baseUnit === "mL") return v * 1000; // L → mL
    return v;
  }

  function formatCountdown(ms) {
    if (ms <= 0) return t("countdown_done");
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    if (h > 0) return `${h}h ${m.toString().padStart(2,"0")}min`;
    if (m > 0) return `${m}min ${s.toString().padStart(2,"0")}s`;
    return `${s}s`;
  }

  if (!plan || plan.currentStepIdx < 0) return null;
  const currentIdx = plan.currentStepIdx;
  const step = plan.steps[currentIdx];
  if (!step) return null;

  const totalSteps = plan.steps.length;
  const doneCount = plan.steps.filter((s) => s.appliedAt || s.skipped).length;
  const isMaintenance = step.mode === "entretien";
  const baseUnit = step.doseUnit || "g";
  // v1.61.0 — Candidats produits pour cette étape (triés, filtrés sur stock
  // réel) et produit effectivement sélectionné (dropdown ou défaut trié).
  const sortedCandidates = getSortedCandidates(step.action);
  const genericCandidates = getGenericCandidates(step.action);
  const selectedProductObj = findAnyProduct(selectedProduct || step.productName);
  const { displayUnit } = toDisplayUnit(step.computedDoseAmount || step.appliedAmount, baseUnit, selectedProductObj);
  const scheduled = step.scheduledAt ? new Date(step.scheduledAt).getTime() : null;
  const remaining = scheduled ? scheduled - now : null;
  const isReady = remaining === null || remaining <= 0;
  const prod = products?.find((p) => p.name === step.productName);
  const stockEmpty = !isMaintenance && manageStock && prod && (prod.stockPercent ?? 100) <= 0;

  function handleApply() {
    if (isMaintenance) {
      // Carte informative : rien à saisir, ferme et termine le plan.
      onApplyStep(currentIdx, null, new Date().toISOString(), null);
      return;
    }
    if (manageStock && sortedCandidates.length === 0 && genericCandidates.length === 0) {
      // v1.61.0 — Aucun produit en stock ni générique pour cette action :
      // dernier repli, saisie libre kg/unités, sans conversion ni lien à
      // une fiche produit.
      const v = parseFloat(editAmount);
      const amount = isNaN(v) ? null : (freeUnitMode === "kg" ? v * 1000 : v);
      let appliedAt = new Date().toISOString();
      if (editTime) {
        const [h, m] = editTime.split(":").map(Number);
        const d = new Date();
        d.setHours(h, m, 0, 0);
        appliedAt = d.toISOString();
      }
      onApplyStep(currentIdx, amount, appliedAt, null);
      return;
    }
    // Utiliser l'unité du produit sélectionné si différent du produit conseillé
    const actualProd = selectedProduct && selectedProduct !== step.productName
      ? findAnyProduct(selectedProduct)
      : selectedProductObj;
    const actualBaseUnit = actualProd?.doseUnit || baseUnit;
    const { displayUnit: actualDisplayUnit } = toDisplayUnit(null, actualBaseUnit, actualProd);
    const amount = toBaseUnit(editAmount, actualProd ? actualDisplayUnit : displayUnit, actualBaseUnit, actualProd);
    let appliedAt = new Date().toISOString();
    if (editTime) {
      const [h, m] = editTime.split(":").map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      appliedAt = d.toISOString();
    }
    onApplyStep(currentIdx, amount, appliedAt, selectedProduct);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 400,
      background: "rgba(10,30,60,0.55)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div style={{
        background: isMaintenance ? "#fff" : "#fff7f2",
        borderTop: isMaintenance ? "5px solid var(--brand-primary)" : "5px solid #c4502f",
        borderRadius: "20px 20px 0 0",
        width: "100%", maxWidth: 480,
        padding: "20px 18px 32px", boxSizing: "border-box",
        maxHeight: "92dvh", overflowY: "auto",
      }}>
        {/* En-tête */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontSize: 11, color: "var(--brand-text-muted)", fontWeight: 600 }}>
            {t("wizard_step")} {currentIdx + 1} {t("wizard_of")} {totalSteps}
          </span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--brand-text-muted)", padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        {/* Barre de progression */}
        <div style={{ display: "flex", gap: 4, marginBottom: 18 }}>
          {plan.steps.map((s, i) => (
            <div key={i} style={{
              flex: 1, height: 4, borderRadius: 4,
              background: s.appliedAt && !s.skipped ? "#1a8fd1"
                : s.skipped ? "#d0e4f5"
                : i === currentIdx ? "var(--brand-primary)"
                : "#e0ecf5",
            }} />
          ))}
        </div>

        {/* Titre étape */}
        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--brand-text-strong)", marginBottom: 4 }}>
          {step.productName || step.title}
        </div>
        {step.title && step.productName && step.title !== step.productName && (
          <div style={{ fontSize: 13, color: "var(--brand-text-secondary)", marginBottom: 8 }}>{step.title}</div>
        )}

        {/* Countdown / horaire */}
        {!isReady && remaining !== null && (
          <div style={{
            background: "#eaf4fb", borderRadius: 10, padding: "10px 14px",
            marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--brand-text-muted)", fontWeight: 600 }}>
                {t(step.action === "chlore" ? "wizard_earliest" : "wizard_scheduled")}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--brand-primary)", fontVariantNumeric: "tabular-nums" }}>
                {formatCountdown(remaining)}
              </div>
            </div>
            <div style={{ textAlign: "right", fontSize: 12, color: "var(--brand-text-secondary)" }}>
              {t("wizard_at")} {new Date(step.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        )}
        {isReady && (
          <div style={{
            background: "#e8f8f0", borderRadius: 10, padding: "8px 14px",
            marginBottom: 14, fontSize: 13, fontWeight: 700, color: "#1a8fd1",
          }}>
            ✓ {t("countdown_done")}
          </div>
        )}
        {step.timingTip && (
          <div style={{ background: "#eef6fc", borderRadius: 8, padding: "8px 14px", marginBottom: 12, fontSize: 12.5, color: "#3a5a78" }}>
            🌙 {step.timingTip}
          </div>
        )}

        {/* Note produit */}
        {step.note && (
          <div style={{ background: "#fff8e8", border: "1.5px solid #e6a817", borderRadius: 8, padding: "10px 14px", marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#7a5800", lineHeight: 1.4 }}>{step.note}</div>
          </div>
        )}

        {/* Stock vide */}
        {stockEmpty && (
          <div style={{ background: "#fdf0ef", border: "1px solid #f5c6c2", borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 12, color: "#c0392b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span><AlertTriangle size={12} style={{ marginRight: 4 }} />{t("stock_empty")}</span>
            <button type="button" onClick={onWantAddProduct} style={{ background: "none", border: "none", color: "#c0392b", fontWeight: 700, fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>
              {t("add_arrow")}
            </button>
          </div>
        )}

        {/* Sélecteur de produit alternatif (si gestion stock activée).
            v1.61.0 — Filtré sur le stock réel (>0%) et trié : le plus entamé
            puis le plus ancien en premier (proposé par défaut). Le
            sélecteur ne s'affiche que s'il y a un choix réel à faire (2+
            produits en stock) ; avec 0 ou 1 candidat, pas de sélecteur. */}
        {!isMaintenance && manageStock && products && sortedCandidates.length > 1 && (() => {
          const currentValue = selectedProduct || step.productName;
          const selectValue = sortedCandidates.some(p => p.name === currentValue)
            ? currentValue
            : sortedCandidates[0].name;
          return (
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--brand-text-secondary)", display: "block", marginBottom: 6 }}>
                {t("product_col")}
              </label>
              <select
                value={selectValue}
                onChange={(e) => {
                  const newProd = e.target.value;
                  setSelectedProduct(newProd);
                  const newProdObj = products.find(p => p.name === newProd);
                  const amount = step.computedDoseAmount ?? step.appliedAmount;
                  const { value } = toDisplayUnit(amount, step.doseUnit || "g", newProdObj);
                  setEditAmount(value != null && value !== "" ? String(value) : "");
                }}
                style={{ width: "100%", boxSizing: "border-box", fontSize: 14, fontWeight: 600, color: "var(--brand-text-strong)", border: "2px solid #d0e4f5", borderRadius: 10, padding: "10px 12px", outline: "none", background: "#fff" }}
              >
                {sortedCandidates.map(p => (
                  <option key={p.id || p.name} value={p.name}>
                    {p.name}{p.name === sortedCandidates[0].name ? " ✓" : ""}
                  </option>
                ))}
              </select>
            </div>
          );
        })()}

        {/* v1.63.2 — Sélecteur de produit générique (DEFAULT_PRODUCTS), quand
            l'utilisateur n'a aucun produit réel en stock pour cette action.
            Remplace l'ancienne saisie libre sans nom : le nom générique est
            enregistré dans l'historique/le rapport, sans jamais décompter de
            stock (aucun produit "products" ne porte ce nom). */}
        {!isMaintenance && manageStock && sortedCandidates.length === 0 && genericCandidates.length > 0 && (() => {
          const currentValue = selectedProduct || step.productName;
          const selectValue = genericCandidates.some(p => p.name === currentValue)
            ? currentValue
            : genericCandidates[0].name;
          return (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "#c0392b", marginBottom: 8 }}>{t("no_stock_generic_hint")}</div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--brand-text-secondary)", display: "block", marginBottom: 6 }}>
                {t("product_col")}
              </label>
              <select
                value={selectValue}
                onChange={(e) => {
                  const newProd = e.target.value;
                  setSelectedProduct(newProd);
                  const newProdObj = findAnyProduct(newProd);
                  const amount = step.computedDoseAmount ?? step.appliedAmount;
                  const { value } = toDisplayUnit(amount, step.doseUnit || "g", newProdObj);
                  setEditAmount(value != null && value !== "" ? String(value) : "");
                }}
                style={{ width: "100%", boxSizing: "border-box", fontSize: 14, fontWeight: 600, color: "var(--brand-text-strong)", border: "2px solid #d0e4f5", borderRadius: 10, padding: "10px 12px", outline: "none", background: "#fff" }}
              >
                {genericCandidates.map(p => (
                  <option key={p.id || p.name} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
          );
        })()}

        {/* Quantité — masquée pour la carte entretien (rien à saisir).
            Dernier repli : aucun produit réel NI générique pour cette action
            (cas très rare, catalogue générique ne couvre pas l'action). */}
        {!isMaintenance && manageStock && sortedCandidates.length === 0 && genericCandidates.length === 0 && (
          <div style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 12, color: "#c0392b", marginBottom: 8 }}>{t("no_stock_category_hint")}</div>
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              {["kg", "unites"].map((m) => (
                <button key={m} type="button" onClick={() => setFreeUnitMode(m)}
                  style={{
                    flex: 1, padding: "6px 0", borderRadius: 8, cursor: "pointer",
                    border: freeUnitMode === m ? "2px solid var(--brand-primary)" : "1.5px solid #d0e4f5",
                    background: freeUnitMode === m ? "#eaf4fb" : "#fff",
                    color: "var(--brand-text-strong)", fontWeight: 700, fontSize: 13,
                  }}>
                  {t(m === "kg" ? "quantity_unit_mode_kg" : "quantity_unit_mode_units")}
                </button>
              ))}
            </div>
          </div>
        )}
        {!isMaintenance && baseUnit && (
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--brand-text-secondary)", display: "block", marginBottom: 6 }}>
              {t("quantity_applied")}
            </label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="number"
                value={editAmount ?? ""}
                onChange={(e) => setEditAmount(e.target.value)}
                style={{ flex: 1, fontSize: 22, fontWeight: 700, color: "var(--brand-text-strong)", border: "2px solid #d0e4f5", borderRadius: 10, padding: "10px 12px", textAlign: "center", outline: "none" }}
                step={(manageStock && sortedCandidates.length === 0 && genericCandidates.length === 0 && freeUnitMode === "unites") || selectedProductObj?.packagingType === "galets" ? "1" : "0.01"}
              />
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--brand-text-secondary)", minWidth: 32 }}>
                {manageStock && sortedCandidates.length === 0 && genericCandidates.length === 0
                  ? t(freeUnitMode === "kg" ? "quantity_unit_mode_kg" : "quantity_unit_mode_units")
                  : displayUnit}
              </div>
            </div>
          </div>
        )}
        {isMaintenance && step.doseText && (
          <div style={{ background: "#eaf4fb", borderRadius: 10, padding: "12px 14px", marginBottom: 12, fontSize: 14, fontWeight: 700, color: "var(--brand-primary)" }}>
            {step.doseText}
          </div>
        )}

        {/* Heure d'application */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--brand-text-secondary)", display: "block", marginBottom: 6 }}>
            {t("wizard_apply_time")}
          </label>
          <input
            type="time"
            value={editTime}
            onChange={(e) => setEditTime(e.target.value)}
            style={{ width: "100%", boxSizing: "border-box", fontSize: 18, fontWeight: 700, color: "var(--brand-primary)", border: "2px solid #d0e4f5", borderRadius: 10, padding: "10px 12px", outline: "none" }}
          />
        </div>

        {/* Boutons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8,width:"100%",padding:"14px 0",borderRadius:12,border:"none",background:"var(--brand-primary)",color:"#fff",fontWeight:700,fontSize:16,cursor:"pointer" }}
            onClick={handleApply}
          >
            <CheckCircle2 size={18} /> {t("wizard_done")}
          </button>

          <button
            style={{ background: "none", border: "none", color: "#9ab0c4", fontSize: 13, cursor: "pointer", padding: "8px 0" }}
            onClick={() => onSkipStep(currentIdx)}
          >
            {t("wizard_skip")}
          </button>

          {/* Modifier l'étape précédente */}
          {currentIdx > 0 && plan.steps[currentIdx - 1]?.appliedAt && !editingPrev && (
            <button
              style={{ background: "none", border: "1px solid #d0e4f5", borderRadius: 8, color: "var(--brand-text-secondary)", fontSize: 12, cursor: "pointer", padding: "7px 12px", display: "flex", alignItems: "center", gap: 5 }}
              onClick={() => {
                const prev = plan.steps[currentIdx - 1];
                const prevUnit = prev.doseUnit || "g";
                const { value, displayUnit: du } = toDisplayUnit(prev.appliedAmount, prevUnit);
                setPrevAmount(String(value ?? ""));
                const d = new Date(prev.appliedAt);
                setPrevTime(`${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`);
                setEditingPrev(true);
              }}
            >
              ← {t("wizard_edit_prev")}
            </button>
          )}
        </div>

        {/* Panneau édition étape précédente */}
        {editingPrev && (() => {
          const prev = plan.steps[currentIdx - 1];
          const prevUnit = prev.doseUnit || "g";
          const { displayUnit: du } = toDisplayUnit(prev.appliedAmount, prevUnit);
          return (
            <div style={{ marginTop: 14, padding: "12px 14px", background: "var(--brand-bg-tint)", borderRadius: 12, border: "1px solid #d0e4f5" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--brand-text-strong)", marginBottom: 10 }}>
                ← {prev.productName || prev.title}
              </div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--brand-text-secondary)", display: "block", marginBottom: 4 }}>{t("quantity_applied")}</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                <input
                  type="number"
                  value={prevAmount}
                  onChange={(e) => setPrevAmount(e.target.value)}
                  style={{ flex: 1, fontSize: 18, fontWeight: 700, color: "var(--brand-text-strong)", border: "1.5px solid #d0e4f5", borderRadius: 8, padding: "8px 10px", textAlign: "center", outline: "none" }}
                  step="0.01"
                />
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--brand-text-secondary)" }}>{du}</span>
              </div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--brand-text-secondary)", display: "block", marginBottom: 4 }}>{t("wizard_apply_time")}</label>
              <input
                type="time"
                value={prevTime}
                onChange={(e) => setPrevTime(e.target.value)}
                style={{ width: "100%", boxSizing: "border-box", fontSize: 16, fontWeight: 700, color: "var(--brand-primary)", border: "1.5px solid #d0e4f5", borderRadius: 8, padding: "8px 10px", outline: "none", marginBottom: 10 }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: "none", background: "var(--brand-primary)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                  onClick={() => {
                    const baseU = prev.doseUnit || "g";
                    const { displayUnit: du2 } = toDisplayUnit(prev.appliedAmount, baseU);
                    const newAmount = toBaseUnit(prevAmount, du2, baseU);
                    let newAppliedAt = prev.appliedAt;
                    if (prevTime) {
                      const [h, m] = prevTime.split(":").map(Number);
                      const d = new Date(prev.appliedAt || new Date());
                      d.setHours(h, m, 0, 0);
                      newAppliedAt = d.toISOString();
                    }
                    onEditPrevStep(currentIdx - 1, newAmount, newAppliedAt);
                    setEditingPrev(false);
                  }}
                >
                  {t("save")}
                </button>
                <button
                  style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: "1px solid #d0e4f5", background: "#fff", color: "var(--brand-text-secondary)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                  onClick={() => setEditingPrev(false)}
                >
                  {t("cancel")}
                </button>
              </div>
            </div>
          );
        })()}

        {/* Aperçu des étapes suivantes */}
        {plan.steps.slice(currentIdx + 1).some((s) => !s.skipped && !s.appliedAt) && (
          <div style={{ marginTop: 16, borderTop: "1px solid #eaf4fb", paddingTop: 12 }}>
            <div style={{ fontSize: 11, color: "var(--brand-text-muted)", fontWeight: 600, marginBottom: 8 }}>ÉTAPES SUIVANTES</div>
            {plan.steps.slice(currentIdx + 1).filter((s) => !s.skipped && !s.appliedAt).map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid var(--brand-bg-tint)" }}>
                <Clock size={13} color="#b0c8e0" />
                <span style={{ fontSize: 12, color: "var(--brand-text-secondary)", flex: 1 }}>{s.productName || s.title}</span>
                <span style={{ fontSize: 11, color: "var(--brand-text-muted)" }}>
                  {s.scheduledAt ? new Date(s.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// v1.63.0 — Application manuelle d'un produit hors plan de traitement (ex.
// entretien périodique au galet). Tous les produits en stock sont proposés,
// sans filtre par action. Champ quantité adaptatif kg/galets comme le Wizard.
function ManualApplyModal({ products, onClose, onSave, lang }) {
  const t = useT(lang || "fr");
  const realCandidates = (products || [])
    .filter((p) => p.action !== "outil-mesure" && (p.stockPercent ?? 100) > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
  // v1.64.0 — Aucun produit réel en stock : on propose le catalogue générique
  // (DEFAULT_PRODUCTS), comme dans le wizard de plan de traitement. Jamais
  // décompté du stock réel (saveManualApplication ne matche que par id, un
  // produit générique n'en partage aucun avec "products").
  const isGeneric = realCandidates.length === 0;
  const candidates = isGeneric
    ? DEFAULT_PRODUCTS.filter((p) => p.action !== "outil-mesure").sort((a, b) => a.name.localeCompare(b.name))
    : realCandidates;

  const [selectedName, setSelectedName] = useState(candidates[0]?.name || "");
  const selected = candidates.find((p) => p.name === selectedName) || null;
  const isGalets = selected?.packagingType === "galets" && selected?.unitWeight > 0;
  const [amount, setAmount] = useState("");
  const [time, setTime] = useState(() => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  });

  function handleSubmit() {
    if (!selected) return;
    const v = parseFloat(amount);
    if (isNaN(v) || v <= 0) return;
    const doseUnit = selected.doseUnit || "g";
    const finalAmount = isGalets ? Math.round(v) * selected.unitWeight : v * 1000;
    let appliedAt = new Date().toISOString();
    if (time) {
      const [h, m] = time.split(":").map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      appliedAt = d.toISOString();
    }
    onSave(selected, finalAmount, doseUnit, appliedAt);
  }

  return (
    <ModalShell onClose={onClose} title={t("apply_product_manual")}>
      {candidates.length === 0 ? (
        <p style={styles.helpText}>{t("no_stock_category_hint")}</p>
      ) : (
        <>
          {isGeneric && (
            <div style={{ fontSize: 12, color: "#c0392b", marginBottom: 8 }}>{t("no_stock_generic_hint")}</div>
          )}
          <label style={styles.fieldLabel}>{t("product_col")}</label>
          <select
            value={selectedName}
            onChange={(e) => { setSelectedName(e.target.value); setAmount(""); }}
            style={{ width: "100%", boxSizing: "border-box", fontSize: 14, fontWeight: 600, color: "var(--brand-text-strong)", border: "2px solid #d0e4f5", borderRadius: 10, padding: "10px 12px", outline: "none", background: "#fff", marginBottom: 14 }}
          >
            {candidates.map((p) => (
              <option key={p.id || p.name} value={p.name}>{p.name}</option>
            ))}
          </select>

          <label style={styles.fieldLabel}>{t("quantity_applied")}</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14 }}>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ flex: 1, fontSize: 22, fontWeight: 700, color: "var(--brand-text-strong)", border: "2px solid #d0e4f5", borderRadius: 10, padding: "10px 12px", textAlign: "center", outline: "none" }}
              step={isGalets ? "1" : "0.01"}
            />
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--brand-text-secondary)", minWidth: 32 }}>
              {isGalets ? t("unit_galets") : "kg"}
            </div>
          </div>

          <label style={styles.fieldLabel}>{t("wizard_apply_time")}</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            style={{ width: "100%", boxSizing: "border-box", fontSize: 18, fontWeight: 700, color: "var(--brand-primary)", border: "2px solid #d0e4f5", borderRadius: 10, padding: "10px 12px", outline: "none", marginBottom: 16 }}
          />

          <button
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "14px 0", borderRadius: 12, border: "none", background: "var(--brand-primary)", color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer" }}
            onClick={handleSubmit}
          >
            <CheckCircle2 size={18} /> {t("wizard_done")}
          </button>
        </>
      )}
    </ModalShell>
  );
}

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
                border: selected[i] ? "2px solid var(--brand-primary)" : "1.5px solid #d0e4f5",
                background: selected[i] ? "#e8f4fd" : "#f8fafd",
                textAlign: "left",
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                border: selected[i] ? "2px solid var(--brand-primary)" : "2px solid #b0c4d8",
                background: selected[i] ? "var(--brand-primary)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {selected[i] && <CheckCircle2 size={14} color="#fff" />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={styles.applyStepTitle}>{r.title}</div>
                <div style={styles.applyStepProduct}>{r.productName}</div>
                {(r.doseText || r.missingTip) && <div style={{ fontSize: 12, color: "var(--brand-text-secondary)", marginTop: 2 }}>{r.doseText || r.missingTip}</div>}
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
                <p style={styles.helpTextSmall}>{r.doseText || r.missingTip}</p>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
        <button style={styles.primaryBtn} onClick={handleSave}>
          {t("validate_btn")}
        </button>
        <button style={{ ...styles.primaryBtn, background: "var(--brand-bg-tint)", color: "var(--brand-primary)", border: "1px solid #d0e4f5" }}
          onClick={() => setStep("select")}>
          {t("back_btn")}
        </button>
      </div>
    </ModalShell>
  );
}

// ---------- Produits ----------
function ProductsView({ products, onEdit, onAddNew, onDelete, onResetAll, isPremium, onWantPremium, onWantSettings, onWantProductsToBuy, poolName, manageStock, lang }) {
  const t = useT(lang);

  // Version gratuite : écran paywall uniquement
  if (!isPremium) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 24px", gap: 16, textAlign: "center" }}>
        {/* v1.71.0 — Écran de vente Premium : reste en bleu, non thémé, même en mode gratuit (aperçu de ce qu'on achète) */}
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "#f0f6fb", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Lock size={26} color="#1ca7d1" />
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#0d2b4e" }}>{t("my_products")}</div>
        <div style={{ fontSize: 14, color: "#4a6480", lineHeight: 1.5, maxWidth: 300 }}>{t("products_locked")}</div>
        <button
          style={{ marginTop: 8, padding: "13px 28px", borderRadius: 12, border: "none", background: "#1ca7d1", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
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

          <button
            type="button"
            onClick={onWantProductsToBuy}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              width: "100%", boxSizing: "border-box", background: "#fff7f2",
              border: "1px solid #f3d9c8", borderRadius: 12, padding: "12px 14px",
              marginBottom: 14, cursor: "pointer", textAlign: "left",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "#c4502f" }}>
              <AlertTriangle size={16} />
              {t("products_to_buy")}
            </span>
            <ChevronRight size={16} color="#c4502f" />
          </button>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {products
              .filter((p) => !(p.isDefault && (p.stockPercent ?? 100) <= 0))
              .map((p) => (
              <button key={p.id} style={styles.productRow} onClick={() => onEdit(p)}>
                {p.photo ? (
                  <img src={p.photo} alt="" style={styles.productThumb} />
                ) : (
                  <div style={styles.productThumbPlaceholder}>
                    <Beaker size={16} color="var(--brand-icon-light)" />
                  </div>
                )}
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={styles.productName}>{p.name}</div>
                  <div style={styles.productMeta}>
                    {/* v1.50.0 — outil-mesure et sel n'ont pas de ratio dose/effet
                        pertinent à afficher (bandelette : pas de dose ; sel :
                        dose calculée par physique, pas par le produit). */}
                    {(p.action === "outil-mesure" || PHYSICS_DOSE_ACTIONS.has(p.action))
                      ? getProductActions(lang).find((a) => a.value === p.action)?.label
                      : FIXED_DOSE_ACTIONS.has(p.action)
                      ? (
                        <>
                          {p.doseAmount} {p.doseUnit} / {p.effectPer} m³ ·{" "}
                          {getProductActions(lang).find((a) => a.value === p.action)?.label}
                          {!!p.waitHours && ` · ${p.waitHours}h`}
                        </>
                      )
                      : (
                        <>
                          {p.doseAmount} {p.doseUnit} → {p.effectAmount} / {p.effectPer} m³ ·{" "}
                          {getProductActions(lang).find((a) => a.value === p.action)?.label}
                          {!!p.waitHours && ` · ${p.waitHours}h`}
                        </>
                      )}
                  </div>
                  {p.action !== "outil-mesure" && (() => {
                    const pct = p.stockPercent ?? 100;
                    const low = pct <= 20;
                    const container = p.containerAmount || 1;
                    const cUnit = p.containerUnit || "kg";
                    const remaining = (container * pct / 100);
                    const displayVal = Number.isInteger(remaining) ? remaining : remaining.toFixed(2).replace(/\.?0+$/, "");
                    return (
                      <div style={{ marginTop: 6 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                          <span style={{ fontSize: 11, color: low ? "#c0392b" : "var(--brand-text-secondary)", fontWeight: 600 }}>
                            {t("stock_label")} {pct} %
                          </span>
                          <span style={{ fontSize: 11, color: low ? "#c0392b" : "var(--brand-text-muted)" }}>
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
                <ChevronRight size={16} color="var(--brand-text-muted)" />
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

// v1.62.0 — "Mes produits à acheter" : agrège deux critères indépendants
// (stock bas, et stock insuffisant pour couvrir le plan de traitement en
// cours ou les recommandations calculées sur la dernière mesure) sur le
// bassin actuellement affiché. Entièrement recalculé à l'ouverture, pas de
// données stockées séparément.
function remainingInDoseUnit(prod, doseUnit) {
  if (!prod?.containerAmount) return null;
  const cUnit = prod.containerUnit || "kg";
  let remaining = prod.containerAmount * ((prod.stockPercent ?? 100) / 100); // en containerUnit
  if (cUnit === "kg" && doseUnit === "g") remaining *= 1000;
  if (cUnit === "L" && doseUnit === "mL") remaining *= 1000;
  return remaining;
}

function ProductsToBuyView({ products, plan, latest, volume, effectiveTargets, activeParamKeys, lang, manageStock, poolName, treatmentType, onBack, onEditProduct, onQuickAddProduct }) {
  const t = useT(lang || "fr");
  const [addedIds, setAddedIds] = useState([]);

  // v1.68.0 — Produits génériques (DEFAULT_PRODUCTS) pertinents pour le type
  // de traitement du bassin, et absents de la liste de produits réels de
  // l'utilisateur (aucun produit existant ne couvre déjà cette action).
  const genericRows = useMemo(() => {
    const relevantActions = getRelevantActionsForTreatment(treatmentType);
    const ownedActions = new Set((products || []).map((p) => p.action));
    return DEFAULT_PRODUCTS.filter(
      (dp) => relevantActions.includes(dp.action) && !ownedActions.has(dp.action) && !addedIds.includes(dp.id)
    );
  }, [products, treatmentType, addedIds]);

  function handleQuickAdd(dp) {
    onQuickAddProduct(dp);
    setAddedIds((prev) => [...prev, dp.id]);
  }

  const rows = useMemo(() => {
    if (!manageStock || !products) return [];
    const reasonsByProduct = new Map(); // id -> Set(reason)
    const addReason = (prod, reason) => {
      if (!prod) return;
      const set = reasonsByProduct.get(prod.id) || new Set();
      set.add(reason);
      reasonsByProduct.set(prod.id, set);
    };

    // Critère 1 : stock bas (≤10%) — couvre correctif ET entretien, pas de
    // calcul séparé sur unitWeight (sans portée pour un produit d'entretien).
    products.forEach((p) => {
      if (p.action !== "outil-mesure" && (p.stockPercent ?? 100) <= 10) {
        addReason(p, "low_stock");
      }
    });

    // Critère 2 : insuffisant pour couvrir le plan en cours (ou, à défaut,
    // les recommandations calculées sur la dernière mesure sans plan démarré).
    let pendingSteps = [];
    if (plan) {
      pendingSteps = plan.steps.filter((s) => !s.appliedAt && !s.skipped && s.mode !== "entretien");
    } else if (latest) {
      pendingSteps = computeRecommendations(latest, volume, products, effectiveTargets, activeParamKeys, null);
    }
    pendingSteps.forEach((step) => {
      if (!step.productName || step.computedDoseAmount == null || !step.doseUnit) return;
      const prod = products.find((p) => p.name === step.productName);
      if (!prod) return;
      const remaining = remainingInDoseUnit(prod, step.doseUnit);
      if (remaining != null && remaining < step.computedDoseAmount) {
        addReason(prod, "insufficient_plan");
      }
    });

    return [...reasonsByProduct.entries()]
      .map(([id, reasons]) => ({ product: products.find((p) => p.id === id), reasons: [...reasons] }))
      .filter((r) => !!r.product)
      .sort((a, b) => (a.product.stockPercent ?? 100) - (b.product.stockPercent ?? 100));
  }, [products, plan, latest, volume, effectiveTargets, activeParamKeys, manageStock]);

  return (
    <div>
      {poolName && <div style={styles.poolNameTag}>{poolName}</div>}
      <div style={styles.sectionRow}>
        <button
          type="button"
          onClick={onBack}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--brand-primary)", fontWeight: 700, fontSize: 13, padding: 0, display: "flex", alignItems: "center", gap: 4 }}
        >
          {t("back_btn")}
        </button>
      </div>
      <div style={styles.sectionRow}>
        <span style={styles.sectionLabel}>{t("products_to_buy")}</span>
      </div>

      {!manageStock ? (
        <div style={styles.stockNotManagedBox}>
          <span>{t("stock_not_managed")}</span>
        </div>
      ) : (
        <>
          {rows.length === 0 ? (
            <p style={styles.emptyText}>{t("products_to_buy_empty")}</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {rows.map(({ product: p, reasons }) => (
                <button key={p.id} style={styles.productRow} onClick={() => onEditProduct(p)}>
                  {p.photo ? (
                    <img src={p.photo} alt="" style={styles.productThumb} />
                  ) : (
                    <div style={styles.productThumbPlaceholder}>
                      <Beaker size={16} color="var(--brand-icon-light)" />
                    </div>
                  )}
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div style={styles.productName}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "#c0392b", fontWeight: 600, marginTop: 3 }}>
                      {t("stock_label")} {p.stockPercent ?? 100} %
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                      {reasons.map((r) => (
                        <span key={r} style={{ fontSize: 10.5, fontWeight: 700, color: "#c4502f", background: "#fff0e8", border: "1px solid #f3d9c8", borderRadius: 99, padding: "3px 8px" }}>
                          {t(r === "low_stock" ? "reason_low_stock" : "reason_insufficient_plan")}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ChevronRight size={16} color="var(--brand-text-muted)" />
                </button>
              ))}
            </div>
          )}

          {/* v1.68.0 — Produits génériques recommandés pour le type de
              traitement du bassin, absents de la liste de l'utilisateur. */}
          {genericRows.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={styles.sectionRow}>
                <span style={styles.sectionLabel}>{t("generic_products_section")}</span>
              </div>
              <p style={styles.helpTextSmall}>{t("generic_products_hint")}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {genericRows.map((dp) => (
                  <div key={dp.id} style={{ ...styles.productRow, cursor: "default" }}>
                    <div style={styles.productThumbPlaceholder}>
                      <Beaker size={16} color="var(--brand-icon-light)" />
                    </div>
                    <div style={{ flex: 1, textAlign: "left" }}>
                      <div style={styles.productName}>{dp.nameKey ? t(dp.nameKey) : dp.name}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQuickAdd(dp)}
                      style={{ display: "flex", alignItems: "center", gap: 4, background: "var(--brand-primary)", color: "#fff", border: "none", borderRadius: 8, padding: "7px 12px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}
                    >
                      <Plus size={14} /> {t("add_generic_product")}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ProductModal({ product, onClose, onSave, isPremium, onWantPremium, applications, manageStock, onWantManageStock, lang, aiEnabled, apiKey, apiProvider, authUid }) {
  const t = useT(lang || "fr");
  const [name, setName] = useState(product?.name || "");
  const [action, setAction] = useState(product?.action || "ph-");
  const [doseAmount, setDoseAmount] = useState(product?.doseAmount ?? "");
  const [doseUnit, setDoseUnit] = useState(product?.doseUnit || "g");
  const [effectAmount, setEffectAmount] = useState(product?.effectAmount ?? "");
  const [effectPer, setEffectPer] = useState(product?.effectPer ?? "");
  const [waitHours, setWaitHours] = useState(product?.waitHours ?? DEFAULT_WAIT_HOURS[product?.action || "ph-"] ?? 2);
  // v1.50.0 — Catégories de dosage sans effet mesuré à faire varier (voir
  // FIXED_DOSE_ACTIONS/PHYSICS_DOSE_ACTIONS) : dérivées de `action`, donc
  // valables que le produit vienne d'une analyse IA ou d'une saisie 100%
  // manuelle — le masquage de champs ne dépend que de l'action choisie.
  const isFixedDose = FIXED_DOSE_ACTIONS.has(action);
  const isPhysicsDose = PHYSICS_DOSE_ACTIONS.has(action);
  const [note, setNote] = useState(product?.note || "");
  // v1.49.0 — Remplace l'ancien état "photo" unique par un tableau : capture
  // multi-photos (face / code-barre / notice), un seul bouton, envoyées
  // ensemble à l'IA pour croiser les infos. Seule la première photo du
  // tableau est sauvegardée comme photo principale du produit (option A du
  // 260706 — les photos supplémentaires ne servent qu'à l'analyse, pas
  // stockées, pas de changement de schéma Firestore productPhotos).
  const [analysisPhotos, setAnalysisPhotos] = useState(product?.photo ? [product.photo] : []);
  const photo = analysisPhotos[0] || null;
  const [stockPercent, setStockPercent] = useState(product?.stockPercent ?? null);
  const [containerAmount, setContainerAmount] = useState(product?.containerAmount ?? 1);
  const [containerUnit, setContainerUnit] = useState(product?.containerUnit ?? "kg");
  // v1.61.0 — Conditionnement galets/sticks : poids unitaire (pour convertir
  // la dose calculée en nombre d'unités dans le Wizard) et ratio d'entretien
  // continu du fabricant (informatif, distinct de la dose de traitement).
  const [packagingType, setPackagingType] = useState(product?.packagingType || "vrac");
  const [unitWeight, setUnitWeight] = useState(product?.unitWeight ?? "");
  const [maintenanceUnits, setMaintenanceUnits] = useState(product?.maintenanceRatio?.units ?? "");
  const [maintenanceVolumePer, setMaintenanceVolumePer] = useState(product?.maintenanceRatio?.volumePer ?? "");
  const [maintenanceDays, setMaintenanceDays] = useState(product?.maintenanceRatio?.days ?? "");
  const [photoBusy, setPhotoBusy] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiNote, setAiNote] = useState(null);
  // v1.46.0 — Valeurs lues par l'IA sur l'étiquette, jamais injectées
  // directement dans les champs de dosage : un chiffre mal lu et accepté
  // silencieusement a déjà causé un surdosage x19 sur un produit réel
  // (CTX-120). Affichées uniquement en placeholder gris ; l'utilisateur doit
  // retaper la valeur lui-même pour la valider.
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [formError, setFormError] = useState(null);
  // v1.48.0 — Résultat du lookup base commune (voir lookupCommonProduct) :
  // { matchType: "alias" | "fuzzy_pending_merge" | "fuzzy_candidates" | "none", productId }
  // Ne préremplit jamais les champs de dosage — sert uniquement à décider,
  // à la sauvegarde, s'il faut incrémenter une fiche existante (markCommonProductUsed)
  // ou en créer une nouvelle (createCommonProduct).
  const [commonMatch, setCommonMatch] = useState(null);
  const [detectedBarcode, setDetectedBarcode] = useState(null);
  const [detectedSubstance, setDetectedSubstance] = useState(null);
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const formErrorRef = useRef(null);

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoBusy(true);
    setAiError(null);
    setAiNote(null);
    try {
      const dataUrl = await fileToDataUrl(file);
      // v1.29.9 — Fix : config/main (pools + products + réglages, tout dans le
      // même document Firestore) a une limite de 1 Mo. Chaque photo produit,
      // compressée à 1280px/qualité 0.72 par défaut, pèse encore plusieurs
      // centaines de Ko — après 3-4 produits photographiés, le document dépasse
      // la limite et TOUTE synchro échoue (pas seulement les photos). La
      // miniature produit ne fait que 40x40px à l'affichage : 300px/qualité 0.5
      // suffit largement et réduit le poids d'un facteur ~10.
      const compressed = await compressImageDataUrl(dataUrl, 300, 0.5);
      // v1.49.0 — Ajoute au tableau (multi-photos), plafonné à 4 pour éviter
      // un payload IA disproportionné et un coût par appel qui grimpe.
      setAnalysisPhotos((prev) => (prev.length >= 4 ? prev : [...prev, compressed]));
    } catch (err) {
      // silencieux
    } finally {
      setPhotoBusy(false);
    }
    e.target.value = ""; // permet de reprendre la même source (ex: caméra) plusieurs fois de suite
  }

  function removeAnalysisPhoto(idx) {
    setAnalysisPhotos((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleAnalyzePhoto() {
    if (analysisPhotos.length === 0 || !apiKey) return;
    setAiAnalyzing(true);
    setAiError(null);
    setAiNote(null);
    setAiSuggestion(null);
    try {
      const result = await analyzeProductPhoto({ apiKey, apiProvider, dataUrls: analysisPhotos, uid: authUid });
      if (result.name) setName(result.name);
      if (result.action) setAction(result.action);
      // v1.46.0 — Normalisation : la dose de traitement ne s'exprime jamais en
      // kg/L (réservés à la taille du contenant), toujours en g/mL. Si l'IA
      // renvoie kg ou L pour la dose, on convertit avant de suggérer.
      let suggDoseAmount = result.doseAmount ?? null;
      let suggDoseUnit = result.doseUnit ?? null;
      if (suggDoseAmount != null && suggDoseUnit === "kg") { suggDoseAmount *= 1000; suggDoseUnit = "g"; }
      if (suggDoseAmount != null && suggDoseUnit === "L") { suggDoseAmount *= 1000; suggDoseUnit = "mL"; }
      if (suggDoseUnit) setDoseUnit(suggDoseUnit);
      // v1.61.2 — Sur demande explicite d'Arnaud : les 3 champs de dosage
      // sont désormais pré-remplis directement par l'IA (plus seulement en
      // placeholder à retaper — règle v1.46.0 assouplie en connaissance de
      // cause). Restent entièrement modifiables par l'utilisateur avant
      // enregistrement.
      if (suggDoseAmount != null) setDoseAmount(suggDoseAmount);
      if (result.effectAmount != null) setEffectAmount(result.effectAmount);
      if (result.effectPer != null) setEffectPer(result.effectPer);
      if (result.waitHours != null) setWaitHours(result.waitHours);
      setAiSuggestion({
        doseAmount: suggDoseAmount,
        effectAmount: result.effectAmount ?? null,
        effectPer: result.effectPer ?? null,
        waitHours: result.waitHours ?? null,
        containerAmount: result.containerAmount ?? null,
        containerUnit: result.containerUnit ?? null,
        source: result.source || null,
        productImageUrl: result.productImageUrl || null,
      });
      if (result.containerUnit) setContainerUnit(result.containerUnit);
      // v1.61.0 — Conditionnement/poids unitaire/ratio d'entretien : ce sont
      // des informations d'emballage (comme containerUnit ci-dessus), pas
      // des valeurs de dosage — appliquées directement, pas en simple
      // suggestion à retaper (la règle anti-surdosage v1.46.0 ne concerne
      // que doseAmount/effectAmount/effectPer).
      if (result.packagingType) setPackagingType(result.packagingType);
      if (result.unitWeight != null) setUnitWeight(result.unitWeight);
      if (result.maintenanceUnits != null) setMaintenanceUnits(result.maintenanceUnits);
      if (result.maintenanceVolumePer != null) setMaintenanceVolumePer(result.maintenanceVolumePer);
      if (result.maintenanceDays != null) setMaintenanceDays(result.maintenanceDays);
      if (result.note) setAiNote(result.note);
      setDetectedBarcode(result.barcode || null);
      setDetectedSubstance(result.activeSubstance || null);

      // v1.48.0 — Lookup base commune (indépendant du résultat photo/web
      // ci-dessus, qui reste la source de vérité pour les valeurs affichées
      // en placeholder). Sert uniquement à savoir, à la sauvegarde, s'il faut
      // relier ce produit à une fiche partagée existante ou en créer une
      // nouvelle. Aucun champ du formulaire n'est modifié ici.
      try {
        if (window._fbAuth?.currentUser && (result.barcode || result.name)) {
          const idToken = await window._fbAuth.currentUser.getIdToken();
          const lookup = await lookupCommonProduct({
            idToken,
            barcode: result.barcode || null,
            name: result.name || "",
            activeSubstance: result.activeSubstance || "",
          });
          setCommonMatch(lookup);
        }
      } catch (e) {
        // Non bloquant : la base commune est un plus, pas une dépendance dure
        // pour enregistrer un produit.
        console.warn("Lookup base commune échoué :", e.message);
      }
    } catch (err) {
      setAiError(t("error_analyze") + " : " + (err?.message || t("verify_connection")));
    } finally {
      setAiAnalyzing(false);
    }
  }

  function handleSave() {
    setFormError(null);
    if (!name.trim()) return;
    const isTool = action === "outil-mesure";
    // v1.46.0 — Les trois champs qui servent au calcul de dose ne doivent
    // jamais être enregistrés vides ou par défaut silencieux : c'est
    // exactement ce qui a produit un surdosage x19 sur un produit réel
    // (valeurs par défaut 30/0.1/10 jamais modifiées par l'utilisateur).
    if (!isTool && !isPhysicsDose) {
      const missing = [];
      if (doseAmount === "" || doseAmount === null || Number.isNaN(parseFloat(doseAmount))) missing.push(t("quantity"));
      if (!isFixedDose && (effectAmount === "" || effectAmount === null || Number.isNaN(parseFloat(effectAmount)))) missing.push(t("effect_variation"));
      if (effectPer === "" || effectPer === null || Number.isNaN(parseFloat(effectPer))) missing.push(t("for_x_m3"));
      if (missing.length > 0) {
        setFormError(t("product_missing_values", { fields: missing.join(", ") }));
        // v1.49.0 — Fix bug remonté le 260706 : le message d'erreur
        // s'affichait au milieu d'un formulaire long, invisible depuis le
        // bouton "Enregistrer" tout en bas — donnant l'impression que
        // l'enregistrement échouait silencieusement. Scroll explicite vers
        // le message dès qu'il apparaît.
        requestAnimationFrame(() => {
          formErrorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        });
        return;
      }
    }
    const newStock = stockPercent ?? 100;
    // v1.29.9 — Même logique que la baisse de stock automatique après un plan
    // de traitement : si l'utilisateur descend lui-même le curseur à 0% sur un
    // produit qu'il a saisi (pas un produit standard), on propose la
    // suppression plutôt que de sauvegarder silencieusement à 0%.
    if (product && !product.isDefault && (product.stockPercent ?? 100) > 0 && newStock <= 0) {
      const ok = window.confirm(t("product_empty_delete_confirm", { name: name.trim() }));
      if (ok) {
        onSave({ ...product, __delete: true });
        return;
      }
    }
    onSave({
      id: product?.id,
      name: name.trim(),
      action,
      doseAmount: (isTool || isPhysicsDose) ? 0 : parseFloat(doseAmount),
      doseUnit,
      effectAmount: (isTool || isFixedDose || isPhysicsDose) ? 0 : parseFloat(effectAmount),
      effectPer: (isTool || isPhysicsDose) ? 0 : parseFloat(effectPer),
      waitHours: isTool ? 0 : (parseFloat(waitHours) || 0),
      note,
      photo,
      // v1.40.0 — Un outil de mesure (bandelettes, etc.) n'a pas de contenant
      // en L/kg ni de stock consommable au sens des produits chimiques : pas
      // de valeurs par défaut trompeuses (avant : 1 kg par défaut même pour
      // une boîte de bandelettes).
      stockPercent: isTool ? null : newStock,
      containerAmount: isTool ? null : (parseFloat(containerAmount) || 1),
      containerUnit: isTool ? null : (containerUnit || "kg"),
      // v1.61.0 — Conditionnement galets/sticks. maintenanceRatio reste null
      // tant que les 3 valeurs (nb unités / volume / jours) ne sont pas
      // toutes renseignées — un ratio partiel n'est pas exploitable pour
      // afficher la carte "entretien continu".
      packagingType: isTool ? null : packagingType,
      unitWeight: (isTool || packagingType !== "galets") ? null : (parseFloat(unitWeight) || null),
      maintenanceRatio: (isTool || packagingType !== "galets" || !maintenanceUnits || !maintenanceVolumePer)
        ? null
        : { units: parseFloat(maintenanceUnits), volumePer: parseFloat(maintenanceVolumePer), days: parseFloat(maintenanceDays) || null },
      createdAt: product?.createdAt || new Date().toISOString(),
    });

    // v1.48.0 — Écriture base commune, en tâche de fond (fire-and-forget) :
    // ne bloque jamais la sauvegarde locale, qui reste l'action prioritaire.
    // N'utilise QUE les valeurs confirmées par l'utilisateur dans le
    // formulaire (name, doseAmount, etc.), jamais les valeurs brutes de
    // aiSuggestion — cohérent avec la règle v1.46.0 anti-surdosage : une
    // fiche partagée entre utilisateurs ne doit jamais recevoir un chiffre
    // qui n'a pas été validé par un humain.
    if (!isTool && window._fbAuth?.currentUser) {
      (async () => {
        try {
          const idToken = await window._fbAuth.currentUser.getIdToken();
          let sharedProductId = null;
          if (commonMatch?.matchType === "alias" || commonMatch?.matchType === "fuzzy_pending_merge") {
            await markCommonProductUsed({ idToken, productId: commonMatch.productId });
            sharedProductId = commonMatch.productId;
          } else if (!commonMatch || commonMatch.matchType === "none") {
            const created = await createCommonProduct({
              idToken,
              payload: {
                barcode: detectedBarcode || null,
                normalizedName: name.trim(),
                displayName: name.trim(),
                activeSubstance: detectedSubstance || null,
                action,
                quantity: parseFloat(doseAmount),
                effect: parseFloat(effectAmount),
                forXm3: parseFloat(effectPer),
                delay: parseFloat(waitHours) || null,
                container: `${containerAmount}${containerUnit}`,
                // v1.49.0 — URL de la photo officielle trouvée par l'IA
                // pendant sa recherche web, si disponible.
                photoUrl: aiSuggestion?.productImageUrl || null,
                source: aiSuggestion?.source || "etiquette",
              },
            });
            sharedProductId = created?.productId || null;
          }
          // v1.51.0 — Upload de la photo utilisateur vers R2 (route Worker
          // /product-photo-upload), uniquement si l'utilisateur a pris une
          // photo. Pas de vérification côté client d'une photo déjà
          // existante : le Worker déduplique lui-même (ne remplace jamais
          // un photoUrl déjà présent sur la fiche partagée), donc premier
          // arrivé, premier servi, sans risque d'écrasement concurrent.
          if (sharedProductId && photo) {
            try {
              const base64 = photo.split(",")[1] || photo;
              await uploadCommonProductPhoto({ idToken, productId: sharedProductId, photoBase64: base64 });
            } catch (e) {
              console.warn("Upload photo base commune échoué :", e.message);
            }
          }
          // v1.49.0 — Point 4 : matchType "fuzzy_candidates" non résolu par
          // l'utilisateur (aucun bouton Oui/Non cliqué) : on n'écrit rien
          // dans la base commune plutôt que de créer un doublon silencieux.
        } catch (e) {
          console.warn("Écriture base commune échouée :", e.message);
        }
      })();
    }
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
          {/* v1.49.0 — Texte d'aide toujours visible : explique l'intérêt de
              photographier chaque élément séparément pour une reconnaissance
              plus fiable (nom + code-barre + dose/effet croisés par l'IA). */}
          <div style={styles.photoHintBox}>
            <Sparkles size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{t("product_photo_hint")}</span>
          </div>

          {analysisPhotos.length > 0 && (
            <div style={styles.photoGrid}>
              {analysisPhotos.map((src, idx) => (
                <div key={idx} style={styles.photoThumbWrap}>
                  <img
                    src={src}
                    alt={`Photo ${idx + 1}`}
                    style={{ ...styles.photoThumb, cursor: "zoom-in" }}
                    onClick={() => window._openLightbox?.(src)}
                  />
                  <button style={styles.photoThumbRemove} onClick={() => removeAnalysisPhoto(idx)}>
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {analysisPhotos.length < 4 && (
            <div style={{ ...styles.photoCaptureBtnRow, marginTop: analysisPhotos.length ? 8 : 0 }}>
              <button
                type="button"
                style={styles.photoCaptureBtnHalf}
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={17} />
                {photoBusy ? t("loading") : analysisPhotos.length ? t("other_photo") : t("camera_btn")}
              </button>
              <button
                type="button"
                style={styles.photoCaptureBtnHalf}
                onClick={() => galleryInputRef.current?.click()}
              >
                <ImageOff size={17} />
                {photoBusy ? t("loading") : analysisPhotos.length ? t("other_gallery") : t("gallery_btn")}
              </button>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} style={styles.hiddenFileInput} />
          <input ref={galleryInputRef} type="file" accept="image/*" onChange={handlePhotoChange} style={styles.hiddenFileInput} />

          {analysisPhotos.length > 0 && aiEnabled && apiKey && (
            <button
              type="button"
              style={{ ...styles.aiAnalyzeBtn, ...(aiAnalyzing ? styles.aiAnalyzeBtnLoading : {}), marginTop: 8 }}
              onClick={handleAnalyzePhoto}
              disabled={aiAnalyzing}
            >
              <Sparkles size={15} className={aiAnalyzing ? "spin" : undefined} />
              {aiAnalyzing ? t("ai_analyzing") : t("ai_analyze_btn")}
            </button>
          )}
          {analysisPhotos.length > 0 && !aiEnabled && (
            <div style={{ fontSize: 11.5, color: "var(--brand-text-muted)", marginTop: 8, lineHeight: 1.5 }}>
              {t("product_ai_hint")}
            </div>
          )}
          {aiNote && <div style={{ ...styles.analyzeNoteOk, marginTop: 8 }}>{aiNote}</div>}
          {aiError && <div style={{ ...styles.analyzeNoteError, marginTop: 8 }}>{aiError}</div>}

          {/* v1.49.0 — Point 4 : plusieurs candidats flous trouvés dans la base
              commune, aucun ne dépasse le seuil de fusion automatique (pas de
              code-barre ou score insuffisant). Choix explicite demandé plutôt
              que de créer un doublon silencieusement à la sauvegarde. */}
          {commonMatch?.matchType === "fuzzy_candidates" && commonMatch.candidates?.length > 0 && (
            <div style={{ ...styles.photoHintBox, background: "#fff8ea", border: "1px solid #f0c96a", marginTop: 8 }}>
              <div style={{ width: "100%" }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>{t("common_product_candidate_title")}</div>
                {commonMatch.candidates.map((c) => (
                  <div key={c.productId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 13 }}>{c.product.displayName || c.product.normalizedName}</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        type="button"
                        style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid var(--brand-primary)", background: "var(--brand-primary)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                        onClick={() => setCommonMatch({ matchType: "alias", productId: c.productId })}
                      >
                        {t("common_product_same")}
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid #90c4e8", background: "transparent", color: "var(--brand-primary)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                  onClick={() => setCommonMatch({ matchType: "none" })}
                >
                  {t("common_product_different")}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button style={styles.photoLockedBtn} onClick={onWantPremium}>
          <Lock size={16} />
          <span>{t("analyze_locked")}</span>
        </button>
      )}

      <FieldLabel required>{t("product_name")}</FieldLabel>
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

      {action !== "outil-mesure" && (
        <>
          {/* v1.50.0 — Sel : ni Quantité, ni Effet, ni Pour X m³ ne servent au
              calcul (ratio physique fixe indépendant du produit) — seuls le
              nom et le stock/contenant plus bas restent pertinents. */}
          {!isPhysicsDose && (
            <div style={styles.fieldGrid}>
              <div>
                <label style={styles.fieldLabel}>{t("quantity")}</label>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input
                    type="number"
                    style={{ ...styles.input, flex: 1 }}
                    value={doseAmount}
                    onChange={(e) => setDoseAmount(e.target.value)}
                    placeholder={aiSuggestion?.doseAmount != null ? String(aiSuggestion.doseAmount) : ""}
                  />
                  <span style={{ fontSize: 13, color: "var(--brand-text-muted)", minWidth: 20 }}>{doseUnit}</span>
                </div>
              </div>
              {/* v1.50.0 — Séquestrant/floculant : dose fixe recommandée par
                  le fabricant, pas de delta mesuré à atteindre — le champ
                  Effet ne sert à rien dans le calcul (voir DEFAULT_PRODUCTS
                  / computeRecommendations), on ne le demande donc plus. */}
              {!isFixedDose && (
                <div>
                  <label style={styles.fieldLabel}>{t("effect_variation")}</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <input
                      type="number"
                      style={{ ...styles.input, flex: 1 }}
                      value={effectAmount}
                      onChange={(e) => setEffectAmount(e.target.value)}
                      placeholder={aiSuggestion?.effectAmount != null ? String(aiSuggestion.effectAmount) : ""}
                    />
                    <span style={{ fontSize: 13, color: "var(--brand-text-muted)", minWidth: 30 }}>
                      {action === "ph-" || action === "ph+" ? "pH" : "mg/L"}
                    </span>
                  </div>
                </div>
              )}
              <div>
                <label style={styles.fieldLabel}>{t("for_x_m3")}</label>
                <input
                  type="number"
                  style={styles.input}
                  value={effectPer}
                  onChange={(e) => setEffectPer(e.target.value)}
                  placeholder={aiSuggestion?.effectPer != null ? String(aiSuggestion.effectPer) : ""}
                />
              </div>
            </div>
          )}
          {formError && <div ref={formErrorRef} style={{ ...styles.analyzeNoteError, marginTop: 8 }}>{formError}</div>}

          <label style={styles.fieldLabel}>{t("wait_hours")}</label>
          <input type="number" style={styles.input} value={waitHours} onChange={(e) => setWaitHours(e.target.value)}
            placeholder={aiSuggestion?.waitHours != null ? String(aiSuggestion.waitHours) : "2"} />
        </>
      )}

      {action === "outil-mesure" ? null : !isPremium ? (
        <button style={styles.photoLockedBtn} onClick={() => onWantPremium("stock")}>
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
            onChange={(e) => setContainerAmount(e.target.value)}
            placeholder={aiSuggestion?.containerAmount != null ? String(aiSuggestion.containerAmount) : "1"} min="0.01" step="0.1" />

          {/* v1.61.0 — Conditionnement : vrac/granulés (comportement historique,
              quantité en kg) ou galets/sticks (quantité comptée en unités dans
              le Wizard, via le poids unitaire ci-dessous). */}
          {!isFixedDose && !isPhysicsDose && (
            <>
              <label style={styles.fieldLabel}>{t("packaging_type")}</label>
              <div style={styles.segmentedControl}>
                {["vrac", "galets"].map((pt) => (
                  <button key={pt} type="button" onClick={() => setPackagingType(pt)}
                    style={{ ...styles.segmentedBtn, ...(packagingType === pt ? styles.segmentedBtnActive : {}) }}>
                    {t(pt === "vrac" ? "packaging_vrac" : "packaging_galets")}
                  </button>
                ))}
              </div>

              {packagingType === "galets" && (
                <>
                  <label style={styles.fieldLabel}>{t("unit_weight_label")}</label>
                  <input type="number" style={styles.input} value={unitWeight}
                    onChange={(e) => setUnitWeight(e.target.value)}
                    placeholder="250" min="1" step="1" />

                  <label style={styles.fieldLabel}>{t("maintenance_ratio_label")}</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input type="number" style={{ ...styles.input, flex: 1 }} value={maintenanceUnits}
                      onChange={(e) => setMaintenanceUnits(e.target.value)}
                      placeholder={t("maintenance_units_label")} min="0" step="1" />
                    <input type="number" style={{ ...styles.input, flex: 1 }} value={maintenanceVolumePer}
                      onChange={(e) => setMaintenanceVolumePer(e.target.value)}
                      placeholder={t("maintenance_volume_label")} min="0" step="1" />
                    <input type="number" style={{ ...styles.input, flex: 1 }} value={maintenanceDays}
                      onChange={(e) => setMaintenanceDays(e.target.value)}
                      placeholder={t("maintenance_days_label")} min="0" step="1" />
                  </div>
                </>
              )}
            </>
          )}

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
              <span style={{ ...styles.stockPercentLabel, color: stockPercent <= 20 ? "#c0392b" : "var(--brand-text-strong)", fontWeight: 700 }}>
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
// ---------- Écran de demande de récupération/suppression des données (compte supprimé) ----------
function AccountDataRequestScreen({ lang, authUser, onClose, onSubmit }) {
  const t = useT(lang);
  const [action, setAction] = useState("erase");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  const options = [
    { value: "erase", label: t("data_request_option_erase") },
    { value: "recover", label: t("data_request_option_recover") },
    { value: "recover_and_erase", label: t("data_request_option_recover_erase") },
  ];

  async function handleSubmit() {
    setStatus("sending");
    try {
      await onSubmit(action);
      setStatus("sent");
    } catch (e) {
      setStatus("error");
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 3150, background: "rgba(60,20,20,0.94)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 28, maxWidth: 380, width: "100%", boxShadow: "0 8px 32px #00000033" }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: "var(--brand-text-strong)", marginBottom: 8, textAlign: "center" }}>{t("data_request_title")}</div>
        <div style={{ fontSize: 13, color: "var(--brand-text-secondary)", marginBottom: 18, lineHeight: 1.5, textAlign: "center" }}>{t("data_request_desc")}</div>

        {status !== "sent" && (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {options.map((opt) => (
                <label
                  key={opt.value}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
                    borderRadius: 12, border: action === opt.value ? "1.5px solid var(--brand-primary)" : "1.5px solid #e6ebe9",
                    background: action === opt.value ? "#eaf4fc" : "#fff", cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="account_data_request_action"
                    value={opt.value}
                    checked={action === opt.value}
                    onChange={() => setAction(opt.value)}
                  />
                  <span style={{ fontSize: 13.5, color: "var(--brand-text-strong)", fontWeight: 600 }}>{opt.label}</span>
                </label>
              ))}
            </div>

            {status === "error" && (
              <div style={{ fontSize: 12.5, color: "#c0392b", marginBottom: 14, textAlign: "center" }}>{t("data_request_error")}</div>
            )}

            <button
              onClick={handleSubmit}
              disabled={status === "sending"}
              style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: "var(--brand-primary)", color: "#fff", fontWeight: 700, fontSize: 14.5, cursor: status === "sending" ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}
            >
              {status === "sending" ? <Loader2 size={16} className="spin" /> : null}
              {status === "sending" ? t("data_request_sending") : t("data_request_submit")}
            </button>
            <button
              onClick={onClose}
              disabled={status === "sending"}
              style={{ width: "100%", padding: "11px 0", borderRadius: 12, border: "none", background: "none", color: "var(--brand-text-muted)", fontWeight: 600, fontSize: 13.5, cursor: "pointer" }}
            >
              {t("cancel")}
            </button>
          </>
        )}

        {status === "sent" && (
          <>
            <div style={{ fontSize: 13.5, color: "var(--brand-text-strong)", marginBottom: 20, textAlign: "center", lineHeight: 1.5 }}>{t("data_request_sent")}</div>
            <button
              onClick={onClose}
              style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "1.5px solid var(--brand-primary)", background: "#fff", color: "var(--brand-primary)", fontWeight: 700, fontSize: 14.5, cursor: "pointer" }}
            >
              {t("close")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function SettingsView({ pools, activePoolId, onUpdatePool, onDeletePool, onSwitchPool, onWantAddPool, viewContext, onDeleteAllMeasures: onDeleteAllMeasuresRaw, orphanedCount, onRepairOrphanedData, poolMeasureCount, onGenerateReport, onWantPremiumForReport, onWantPremium, isPremium, setIsPremium, onWantManageSubscription, portalBusy, portalError, onReplayOnboarding, aiEnabled, setAiEnabled, calibrationContribution, setCalibrationContribution, lang, setLang, authUser, onSignOut, onSignIn, onDeleteAccount, dataConsent, onRevokeDataConsent, cguAcceptedDate, myPseudo }) {
  const [editingPool, setEditingPool] = useState(null);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [pendingLang, setPendingLang] = useState(lang);
  const treatmentTypes = getTreatmentTypes(lang);
  const filtrationTypes = getFiltrationTypes(lang);
  const activePool = pools.find((p) => p.id === activePoolId) || pools[0];
  const [repairing, setRepairing] = useState(false);
  // v1.60.0 — Pseudo déplacé ici depuis SecondaryUsersSection (désormais
  // DelegationSection) : demande explicite de le regrouper dans "Mon compte".
  const [pseudoInput, setPseudoInput] = useState(myPseudo || "");
  const [pseudoBusy, setPseudoBusy] = useState(false);
  const [pseudoMsg, setPseudoMsg] = useState(null);
  const t = useT(lang);

  useEffect(() => { setPseudoInput(myPseudo || ""); }, [myPseudo]);

  async function handleSavePseudo() {
    if (!authUser || !pseudoInput.trim()) return;
    setPseudoBusy(true);
    setPseudoMsg(null);
    try {
      const idToken = await authUser.getIdToken();
      const res = await fetch(`${PROXY_BASE_URL}/set-pseudo`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ pseudo: pseudoInput.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409) {
        setPseudoMsg({ type: "error", text: t("pseudo_taken_suggestion", { suggestion: data.suggestion || "?" }) });
        return;
      }
      if (!res.ok) {
        setPseudoMsg({ type: "error", text: data.error || t("pseudo_error") });
        return;
      }
      setPseudoMsg({ type: "ok", text: t("pseudo_saved") });
    } catch (e) {
      setPseudoMsg({ type: "error", text: t("pseudo_error") });
    } finally {
      setPseudoBusy(false);
    }
  }

  async function handleRepair() {
    const ok = window.confirm(t("repair_orphaned_confirm", { count: orphanedCount }));
    if (!ok) return;
    setRepairing(true);
    try {
      await onRepairOrphanedData();
    } finally {
      setRepairing(false);
    }
  }

  // v1.59.1 — La zone sensible (suppression mesures/compte) a été déplacée
  // dans DangerZoneSection, rendue en bas de page après SecondaryUsersSection.

  return (
    <div>
      {orphanedCount > 0 && (
        <div style={{ background: "#fff4e5", border: "1.5px solid #f0c36d", borderRadius: 12, padding: "12px 14px", marginBottom: 14 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "#8a5a00", marginBottom: 4 }}>
            {t("repair_orphaned_title", { count: orphanedCount })}
          </div>
          <div style={{ fontSize: 12, color: "#8a5a00", marginBottom: 10, lineHeight: 1.5 }}>
            {t("repair_orphaned_desc")}
          </div>
          <button
            type="button"
            onClick={handleRepair}
            disabled={repairing}
            style={{ background: "#8a5a00", color: "#fff", border: "none", borderRadius: 10, padding: "9px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
          >
            {repairing ? "..." : t("repair_orphaned_btn")}
          </button>
        </div>
      )}
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
                    color: pendingLang === opt.value ? "var(--brand-primary)" : "var(--brand-text-strong)",
                    fontWeight: pendingLang === opt.value ? 700 : 500,
                  }}
                  onClick={() => setPendingLang(opt.value)}
                >
                  <span>{opt.label}</span>
                  {pendingLang === opt.value && (
                    <CheckCircle2 size={18} color="var(--brand-primary)" />
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

      {/* --- Section Aide (v1.72.0) --- */}
      <div style={styles.sectionRow}>
        <span style={styles.sectionLabel}>{t("help_section")}</span>
      </div>
      <button
        type="button"
        onClick={onReplayOnboarding}
        style={{
          display: "flex", alignItems: "center", gap: 8, width: "100%",
          padding: "12px 14px", borderRadius: 12, border: "1px solid var(--border, #e2e8ef)",
          background: "#fff", color: "var(--brand-primary)", fontWeight: 600, fontSize: 13.5,
          cursor: "pointer", marginBottom: 14,
        }}
      >
        <Sparkles size={16} />
        {t("settings_replay_onboarding")}
      </button>

      {/* --- Section Compte --- */}
      <div style={styles.sectionRow}>
        <span style={styles.sectionLabel}>{t("account_section")}</span>
      </div>
      {authUser ? (
        <div style={{ background: "var(--brand-bg-tint)", borderRadius: 12, padding: "14px", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--brand-text-strong)" }}>{authUser.displayName || authUser.email}</div>
              {authUser.displayName && <div style={{ fontSize: 11.5, color: "var(--brand-text-muted)", marginTop: 2 }}>{authUser.email}</div>}
            </div>
            <button
              style={{ padding: "8px 14px", borderRadius: 10, border: "1.5px solid #d0e4f5", background: "#fff", color: "#c0392b", fontWeight: 600, fontSize: 12, cursor: "pointer", flexShrink: 0 }}
              onClick={onSignOut}
            >
              {t("sign_out")}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ background: "var(--brand-bg-tint)", borderRadius: 12, padding: "12px 14px", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ fontSize: 13, color: "var(--brand-text-muted)" }}>{t("not_signed_in")}</div>
          <button
            style={{ padding: "8px 14px", borderRadius: 10, border: "none", background: "var(--brand-primary)", color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" }}
            onClick={onSignIn}
          >
            {t("sign_in")}
          </button>
        </div>
      )}

      {authUser && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--brand-text-strong)", marginBottom: 8 }}>{t("pseudo_label")}</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
            <input
              type="text"
              style={{ ...styles.input, flex: 1 }}
              value={pseudoInput}
              onChange={(e) => setPseudoInput(e.target.value)}
              placeholder={t("pseudo_placeholder")}
              maxLength={24}
            />
            <button
              style={{ padding: "0 16px", borderRadius: 10, border: "none", background: "var(--brand-primary)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", flexShrink: 0 }}
              onClick={handleSavePseudo}
              disabled={pseudoBusy || !pseudoInput.trim()}
            >
              {pseudoBusy ? "..." : t("pseudo_save")}
            </button>
          </div>
          <div style={{ fontSize: 11, color: "#8a9aa8", marginBottom: pseudoMsg ? 4 : 0 }}>{t("pseudo_invalid")}</div>
          {pseudoMsg && (
            <div style={{ fontSize: 12, color: pseudoMsg.type === "error" ? "#c0392b" : "#1a7a4a", marginTop: 2 }}>
              {pseudoMsg.text}
            </div>
          )}
        </div>
      )}

      <div style={styles.sectionRow}>
        <span style={styles.sectionLabel}>{t("subscription")}</span>
      </div>

      <div style={styles.testPremiumCard}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Crown size={18} color={isPremium ? "#a8721a" : "var(--brand-primary)"} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: "var(--brand-text-strong)" }}>
              {isPremium ? t("unlimited_active") : t("free_mode")}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--brand-text-muted)" }}>
              {t("premium_test")}
            </div>
          </div>
        </div>
        {/* v1.90.0 — L'annulation réelle d'un abonnement Stripe se fait dans le
            portail Stripe (bouton "Gérer mon abonnement"), plus via un toggle
            local qui ne coupait qu'un champ Firestore côté client. */}
        {isPremium ? (
          <button
            type="button"
            onClick={onWantManageSubscription}
            disabled={portalBusy}
            style={{ padding: "8px 14px", borderRadius: 10, border: "1.5px solid var(--brand-primary)", background: "#fff", color: "var(--brand-primary)", fontWeight: 600, fontSize: 12.5, cursor: portalBusy ? "default" : "pointer", whiteSpace: "nowrap", opacity: portalBusy ? 0.6 : 1 }}
          >
            {portalBusy ? "…" : t("manage_subscription_btn")}
          </button>
        ) : (
          <ToggleSwitch checked={false} onChange={() => onWantPremium()} />
        )}
      </div>
      {portalError && (
        <div style={{ fontSize: 12, color: "#c0392b", marginTop: -8, marginBottom: 10 }}>{portalError}</div>
      )}

      <p style={styles.helpText}>
{t("premium_desc")}
      </p>

      <div style={styles.sectionRow}>
        <span style={styles.sectionLabel}>{t("my_pools")}</span>
        {!viewContext && (
          <button style={styles.smallAddBtn} onClick={onWantAddPool}>
            <Plus size={16} />
          </button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
        {pools.map((p) => (
          <div
            key={p.id}
            style={{
              ...styles.poolListRow,
              borderColor: p.id === activePoolId ? "var(--brand-primary)" : "#e6ebe9",
            }}
          >
            <button style={styles.poolListMain} onClick={() => onSwitchPool(p.id)}>
              {p.photo ? (
                <img src={p.photo} alt="" style={styles.poolSwitcherThumb} />
              ) : (
                <Droplets size={16} color={p.id === activePoolId ? "var(--brand-primary)" : "var(--brand-icon-light)"} />
              )}
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: "var(--brand-text-strong)" }}>{p.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--brand-text-muted)" }}>{p.location} · {p.volume} m³</div>
              </div>
              {p.id === activePoolId && <CheckCircle2 size={16} color="#1a8fd1" />}
            </button>
            {!viewContext && (
              <button
                style={{ background: "none", border: "none", color: "var(--brand-primary)", fontSize: 12, fontWeight: 600, cursor: "pointer", padding: "0 8px", flexShrink: 0 }}
                onClick={() => setEditingPool(p)}
              >
                <Settings2 size={14} />
              </button>
            )}
            {!viewContext && (
              <button style={styles.poolListDeleteBtn} onClick={() => onDeletePool(p.id)}>
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      {isPremium && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--brand-bg-tint)", borderRadius: 12, padding: "12px 14px", marginBottom: 8, marginTop: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--brand-text-strong)" }}>{t("manage_stock_label")}</div>
            <div style={{ fontSize: 11, color: "var(--brand-text-muted)", marginTop: 2 }}>{t("manage_stock_desc")}</div>
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

      {/* Toggle activer l'analyse IA — réservé premium */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--brand-bg-tint)", borderRadius: 12, padding: "12px 14px", marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--brand-text-strong)" }}>{t("ai_toggle_label")}</div>
          <div style={{ fontSize: 11, color: "var(--brand-text-muted)", marginTop: 2 }}>
            {isPremium ? t("ai_toggle_desc") : t("analyze_locked")}
          </div>
        </div>
        {isPremium ? (
          <ToggleSwitch
            checked={aiEnabled}
            onChange={(val) => setAiEnabled(val)}
          />
        ) : (
          <button
            type="button"
            onClick={onWantPremium}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#8a9bb0", display: "flex", alignItems: "center", padding: 4 }}
            title={t("analyze_locked")}
          >
            <Lock size={18} />
          </button>
        )}
      </div>

      {/* v1.36.0 — Lot B : opt-out contribution calibration (CGU clause 11) */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--brand-bg-tint)", borderRadius: 12, padding: "12px 14px", marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--brand-text-strong)" }}>{t("calibration_toggle_label")}</div>
          <div style={{ fontSize: 11, color: "var(--brand-text-muted)", marginTop: 2 }}>{t("calibration_toggle_desc")}</div>
        </div>
        <ToggleSwitch
          checked={calibrationContribution}
          onChange={(val) => setCalibrationContribution(val)}
        />
      </div>

      {/* v1.53.0 — Le bouton "Configurer" (choix fournisseur + clé API) a été
          retiré : l'IA est fournie par l'app dans le cadre de l'abonnement,
          aucune décision à prendre côté utilisateur. Le fournisseur (pour
          l'instant Anthropic) ne se change que côté code, jamais via un
          réglage visible. Voir nettoyage CGU/clause 5 du 260706. */}



      {/* v1.60.0 — Bloc CGU/Mentions légales déplacé dans DangerZoneSection,
          juste au-dessus de la zone sensible (demande explicite). */}

      {/* Révocation consentement données */}
      {dataConsent && (
        <div style={{ marginBottom: 16 }}>
          <div style={styles.sectionRow}>
            <span style={styles.sectionLabel}>{t("disclaimer_title")}</span>
          </div>
          <button
            style={{ width: "100%", padding: "11px 0", borderRadius: 10, border: "1.5px solid #f5c6c2", background: "#fdf0ef", color: "#c0392b", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
            onClick={() => { if (window.confirm(t("revoke_data_confirm"))) onRevokeDataConsent(); }}
          >
            {t("revoke_data_consent")}
          </button>
        </div>
      )}

      {/* v1.59.1 — Zone sensible (suppression mesures/compte) déplacée dans
          DangerZoneSection, rendue en bas de page après SecondaryUsersSection. */}

      {editingPool && (
        <AddPoolModal
          onClose={() => setEditingPool(null)}
          onSave={(updated) => { onUpdatePool(updated.id, updated); setEditingPool(null); }}
          lang={lang}
          existingPool={editingPool}
        />
      )}
    </div>
  );
}

// v1.59.1 — Zone sensible (suppression mesures/compte) extraite de SettingsView
// pour être rendue après SecondaryUsersSection : demande explicite de la
// positionner tout en bas de la page Réglages (loin des actions courantes).
// v1.85.0 — Extrait de DangerZoneSection pour être réutilisable depuis l'écran
// de validation CGU obligatoire (needsCguAcceptance) : jusqu'ici ce texte
// n'était consultable que depuis Réglages, donc invisible au moment où on
// demandait justement de l'accepter.
function CguLegalContent({ lang }) {
  const t = useT(lang);
  return (
    <>
      <div style={{ fontWeight: 700, color: "var(--brand-text-strong)", marginBottom: 2 }}>{t("lcen_editor")}</div>
      <div style={{ marginBottom: 12 }}>{t("lcen_editor_val")}</div>
      <div style={{ fontWeight: 700, color: "var(--brand-text-strong)", marginBottom: 2 }}>{t("lcen_contact")}</div>
      <div style={{ marginBottom: 12 }}><a href={`mailto:${t("lcen_contact_val")}`} style={{ color: "var(--brand-primary)" }}>{t("lcen_contact_val")}</a></div>
      <div style={{ fontWeight: 700, color: "var(--brand-text-strong)", marginBottom: 2 }}>{t("lcen_host")}</div>
      <div style={{ whiteSpace: "pre-wrap", marginBottom: 12 }}>{t("lcen_host_val")}</div>
      <div style={{ fontWeight: 700, color: "var(--brand-text-strong)", marginTop: 8, marginBottom: 4 }}>{t("lcen_cgu_title")} — CGU {CGU_VERSION}</div>
      <div style={{ marginBottom: 10, fontSize: 11, color: "var(--brand-text-secondary)" }}>
        {[
          { title: t("lcen_ai_title"), body: t("lcen_ai_val") },
          { title: t("lcen_photos_title"), body: t("lcen_photos_val") },
          { title: t("lcen_gdpr"), body: t("lcen_gdpr_val") },
          { title: t("lcen_calibration_title"), body: t("lcen_calibration_val") },
          { title: t("lcen_photocontrib_title"), body: t("lcen_photocontrib_val") },
        ].map((s, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 700, color: "var(--brand-text-strong)", marginBottom: 2 }}>{i+1}. {s.title}</div>
            <div style={{ lineHeight: 1.6 }}>{s.body}</div>
          </div>
        ))}
      </div>
    </>
  );
}

function DangerZoneSection({ lang, activePoolName, poolMeasureCount, onDeleteAllMeasures, authUser, onDeleteAccount, cguAcceptedDate }) {
  const t = useT(lang);
  const [showLegalModal, setShowLegalModal] = useState(false);

  function handleDeleteAllMeasures() {
    if (!poolMeasureCount) return;
    const ok = window.confirm(`${t("delete_measures")} "${activePoolName}" ?`);
    if (ok) onDeleteAllMeasures();
  }

  return (
    <div style={{ marginTop: 24 }}>
      {/* v1.60.0 — CGU/Mentions légales, déplacées ici juste au-dessus de la
          zone sensible (demande explicite : regrouper les infos "sérieuses"). */}
      <div style={styles.sectionRow}>
        <span style={styles.sectionLabel}>{t("legal_notices")}</span>
      </div>
      <div style={{ background: "#f5f8fc", borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontSize: 12, color: "var(--brand-text-secondary)" }}>
        <div>{t("cgu_version_label")} : <strong>CGU {CGU_VERSION}</strong></div>
        {cguAcceptedDate && <div>{t("cgu_accepted_on")} : {new Date(cguAcceptedDate).toLocaleDateString()}</div>}
      </div>
      <button
        style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "none", background: "var(--brand-primary)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", marginBottom: 20 }}
        onClick={() => setShowLegalModal(true)}
      >
        {t("legal_notices")}
      </button>

      {showLegalModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(10,30,60,0.55)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 480, padding: "20px 18px 32px", boxSizing: "border-box", maxHeight: "90dvh", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: "var(--brand-text-strong)" }}>{t("legal_notices")} — CGU {CGU_VERSION}</span>
              <button onClick={() => setShowLegalModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", fontSize: 12, color: "#2d4a6e", lineHeight: 1.7, background: "#f5f8fc", borderRadius: 10, padding: "12px 14px" }}>
              <CguLegalContent lang={lang} />
            </div>
          </div>
        </div>
      )}

      <div style={styles.sectionRow}>
        <span style={styles.sectionLabel}>{t("sensitive_zone")}</span>
      </div>
      <button style={styles.dangerLinkBtn} onClick={handleDeleteAllMeasures}>
        <Trash2 size={14} /> {t("delete_measures")}
      </button>

      {authUser && (
        <button
          style={{ ...styles.dangerLinkBtn, marginTop: 8 }}
          onClick={() => {
            if (window.confirm(t("delete_account_confirm"))) {
              onDeleteAccount();
            }
          }}
        >
          <Trash2 size={14} /> {t("delete_account")}
        </button>
      )}
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
        background: checked ? "var(--brand-primary)" : "#d8e2df",
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
function DeleteReauthModal({ onClose, onConfirm, busy, error, lang }) {
  const t = useT(lang || "fr");
  const [password, setPassword] = useState("");
  return (
    <ModalShell onClose={onClose} title={t("delete_account")}>
      <p style={{ fontSize: 13, color: "var(--brand-text-secondary)", lineHeight: 1.5, marginTop: 0 }}>
        {t("reauth_required")}
      </p>
      <FieldLabel required>{t("password")}</FieldLabel>
      <input
        type="password"
        style={styles.input}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        autoFocus
        onKeyDown={(e) => e.key === "Enter" && password && !busy && onConfirm(password)}
      />
      {error && (
        <div style={{ marginTop: 8, fontSize: 12.5, color: "#c0392b" }}>{error}</div>
      )}
      <button
        style={{ ...styles.primaryBtn, background: "#c0392b", marginTop: 14 }}
        disabled={!password || busy}
        onClick={() => onConfirm(password)}
      >
        {busy ? "..." : t("delete_account")}
      </button>
      <button
        type="button"
        style={{ width: "100%", padding: "11px 0", background: "none", border: "none", color: "var(--brand-text-muted)", fontSize: 13, cursor: "pointer", marginTop: 8 }}
        onClick={onClose}
      >
        {t("cancel")}
      </button>
    </ModalShell>
  );
}

// v1.93.0 — Wizard d'accueil, affiché une seule fois après la création du
// premier bassin (et rejouable depuis Réglages via "Revoir la présentation").
// Depuis v1.93.0 : carrousel avec les vraies captures d'écran de l'app (issues
// du dossier screenshots/ utilisé aussi par le manifest PWA) au lieu d'icônes
// stylisées — 1 écran de bienvenue + 6 captures, une par fonctionnalité clé.
// "Passer" est disponible à chaque étape ; les deux issues (Passer / dernière
// étape) appellent onDone, qui marque l'onboarding comme vu côté appelant.
function OnboardingWizard({ onDone, lang }) {
  const t = useT(lang || "fr");
  const [step, setStep] = useState(0);
  const steps = [
    { title: t("onboarding_step1_title"), text: t("onboarding_step1_text"), dark: true },
    { img: "screenshots/screenshot-analyse-ia-narrow.png",
      title: t("onboarding_step2_title"), text: t("onboarding_step2_text") },
    { img: "screenshots/screenshot-dashboard-narrow.png",
      title: t("onboarding_step3_title"), text: t("onboarding_step3_text") },
    { img: "screenshots/screenshot-diagnostic-plan-narrow.png",
      title: t("onboarding_step4_title"), text: t("onboarding_step4_text") },
    { img: "screenshots/screenshot-etape-traitement-narrow.png",
      title: t("onboarding_step5_title"), text: t("onboarding_step5_text") },
    { img: "screenshots/screenshot-historique-narrow.png",
      title: t("onboarding_step6_title"), text: t("onboarding_step6_text") },
    { img: "screenshots/screenshot-produits-narrow.png",
      title: t("onboarding_step7_title"), text: t("onboarding_step7_text"), last: true },
  ];
  const s = steps[step];
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1900, background: "rgba(13,43,78,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 360, background: "#fff", borderRadius: 20, overflow: "hidden" }}>
        {s.dark ? (
          <div style={{
            padding: "32px 24px 28px",
            textAlign: "center",
            background: "linear-gradient(135deg, var(--brand-primary), var(--brand-primary-dark))",
            color: "#fff",
          }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Droplets size={28} color="#fff" />
            </div>
            <div style={{ fontWeight: 700, fontSize: 19, marginBottom: 8 }}>{s.title}</div>
            <div style={{ fontSize: 13.5, opacity: 0.85, lineHeight: 1.5, whiteSpace: "pre-line" }}>{s.text}</div>
          </div>
        ) : (
          <>
            <div style={{ background: "#eef2f6", padding: 12 }}>
              <img
                src={s.img}
                alt={s.title}
                style={{ display: "block", width: "100%", maxHeight: 380, objectFit: "contain", borderRadius: 12 }}
              />
            </div>
            <div style={{ padding: "20px 24px 4px", textAlign: "center" }}>
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8, color: "#0d2b4e" }}>{s.title}</div>
              <div style={{ fontSize: 13.5, color: "#4a6480", lineHeight: 1.5, whiteSpace: "pre-line" }}>{s.text}</div>
            </div>
          </>
        )}
        <div style={{ padding: "20px 24px 24px" }}>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 20, flexWrap: "wrap" }}>
            {steps.map((_, i) => (
              <div key={i} style={{ width: 16, height: 4, borderRadius: 2, background: i === step ? "var(--brand-primary)" : "#e2e8ef" }} />
            ))}
          </div>
          <button
            style={styles.primaryBtn}
            onClick={() => (s.last ? onDone() : setStep((v) => v + 1))}
          >
            {s.last ? t("onboarding_start") : t("onboarding_next")}
          </button>
          {!s.last && (
            <button
              style={{ width: "100%", padding: "10px 0", marginTop: 4, border: "none", background: "transparent", color: "#6a7d90", fontSize: 13, cursor: "pointer" }}
              onClick={onDone}
            >
              {t("onboarding_skip")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PaywallModal({ onClose, onActivate, lang, source, busy, error }) {
  const t = useT(lang || "fr");
  const [plan, setPlan] = useState("monthly"); // v1.90.0 — mensuel présélectionné
  const perks = [
    t("paywall_perk1"),
    t("paywall_perk2"),
    t("paywall_perk3"),
    t("paywall_perk4"),
    t("paywall_perk5"),
    t("paywall_perk6"),
    t("paywall_perk7"),
  ];
  // v1.42.0 — Sous-titre contextuel selon ce qui a déclenché le paywall
  // (mesure du jour atteinte, plan de traitement, rapport PDF, produits,
  // photos IA, gestion du stock) au lieu du même mur générique à chaque fois.
  // Les clés paywall_context_* existaient déjà dans les traductions mais
  // n'étaient jamais lues nulle part avant ce fix.
  const contextKey = source ? `paywall_context_${source}` : null;
  const contextText = contextKey ? t(contextKey) : null;
  const hasContext = contextText && contextText !== contextKey;
  return (
    <ModalShell onClose={onClose} title={t("paywall_title")}>
      {hasContext && (
        // v1.71.0 — Reste en bleu littéral : le mur Premium n'est jamais thémé
        // en vert, même consulté depuis le mode gratuit (aperçu de l'achat).
        <p style={{ fontSize: 13.5, color: "#4a6480", margin: "0 0 4px", lineHeight: 1.4 }}>
          {contextText}
        </p>
      )}
      <div style={styles.paywallHero}>
        <Crown size={30} color="#a8721a" />
        <div style={styles.paywallPrice}>
          {plan === "yearly" ? t("paywall_price_yearly") : t("paywall_price_monthly")}
        </div>
        {plan === "monthly" && (
          <div style={styles.paywallPriceSub}>{t("paywall_price_yearly_hint")}</div>
        )}
      </div>
      {/* v1.90.0 — Sélecteur mensuel/annuel : détermine le price ID envoyé à
          /stripe/create-checkout-session (voir handleStartCheckout). */}
      <div style={styles.segmentedControl}>
        {["monthly", "yearly"].map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPlan(p)}
            disabled={busy}
            style={{ ...styles.segmentedBtn, ...(plan === p ? styles.segmentedBtnActive : {}) }}
          >
            {t(p === "monthly" ? "paywall_plan_monthly" : "paywall_plan_yearly")}
            {p === "yearly" && <span style={{ marginLeft: 5, opacity: 0.8 }}>{t("paywall_plan_yearly_badge")}</span>}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, margin: "16px 2px" }}>
        {perks.map((perk, i) => (
          <div key={i} style={styles.paywallPerk}>
            <CheckCircle2 size={16} color="#1a8fd1" />
            <span>{perk}</span>
          </div>
        ))}
      </div>
      {error && (
        <div style={{ fontSize: 12.5, color: "#c0392b", background: "#fdf0ef", border: "1px solid #f3c9c4", borderRadius: 10, padding: "8px 12px", marginBottom: 12, textAlign: "left" }}>
          {error}
        </div>
      )}
      <button
        style={{ ...styles.primaryBtn, background: "#1ca7d1", opacity: busy ? 0.7 : 1, cursor: busy ? "default" : "pointer" }}
        onClick={() => !busy && onActivate(plan)}
        disabled={busy}
      >
        {busy ? "…" : t("paywall_btn")}
      </button>
      <p style={{ ...styles.helpText, textAlign: "center" }}>
        {t("paywall_test_note")}
      </p>
    </ModalShell>
  );
}

// v1.70.0 — Confirmation avant désactivation du Premium : rappelle ce que
// l'utilisateur perd (mêmes 7 points que le mur Premium, pour rester
// cohérent) avant de valider. "Annuler" reste l'option la plus visible
// (bouton principal), la désactivation est un bouton secondaire — on ne
// pousse pas vers la sortie.
function PremiumDowngradeConfirmModal({ onClose, onConfirm, lang }) {
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
    <ModalShell onClose={onClose} title={t("premium_downgrade_confirm_title")}>
      <p style={{ fontSize: 13.5, color: "var(--brand-text-secondary)", margin: "0 0 12px", lineHeight: 1.4 }}>
        {t("premium_downgrade_confirm_desc")}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, margin: "0 2px 20px" }}>
        {perks.map((perk, i) => (
          <div key={i} style={styles.paywallPerk}>
            <Lock size={14} color="#8095a8" />
            <span>{perk}</span>
          </div>
        ))}
      </div>
      <button style={styles.primaryBtn} onClick={onClose}>
        {t("premium_downgrade_cancel_btn")}
      </button>
      <button
        style={{
          width: "100%", padding: "13px 0", marginTop: 10, borderRadius: 12,
          border: "1.5px solid #d6dde3", background: "#fff", color: "#3f5a73",
          fontWeight: 600, fontSize: 13.5, cursor: "pointer",
        }}
        onClick={onConfirm}
      >
        {t("premium_downgrade_confirm_btn")}
      </button>
    </ModalShell>
  );
}

// v1.69.0 — Écran plein cadre joué à l'activation du Premium : bulles
// montantes qui révèlent l'écran "Premium activé" (1,5s), puis un reflet
// lumineux qui redescend pour sceller la transition (1,5s). L'activation
// réelle (isPremium, stock, etc.) est déjà faite avant l'affichage de cet
// overlay — il ne fait que masquer/habiller la transition visuellement.
// v1.70.0 — Fix : le clip-path qui révélait le fond masquait aussi les
// bulles pendant l'essentiel de l'animation (seule la portion déjà "révélée"
// du cadre était visible), donnant l'impression d'une simple barre qui
// montait et redescendait au lieu de bulles distinctes. Le fond est
// désormais visible dès le départ (fondu rapide en 220ms) et les bulles
// montent librement sur toute la durée de l'overlay (3s au total, inchangé).
// v1.70.0 — variant "downgrade" : même effet, rejoué à la désactivation du
// v1.71.0 — Palette gratuit/verrouillé et gratuit/downgrade suivent
// désormais le thème global (var CSS pilotées par effectiveIsPremium),
// remplacé par du vert à la demande d'Arnaud (cf v1.71.0).
function PremiumRevealOverlay({ onDone, lang, variant = "activate" }) {
  const t = useT(lang || "fr");
  const reduceMotion = typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
  const [phase, setPhase] = useState("enter"); // "enter" -> "rise" -> "shimmer"

  const bubbles = useMemo(() => {
    if (reduceMotion) return [];
    return Array.from({ length: 26 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 8 + Math.random() * 22,
      delay: Math.random() * 900,
      duration: 1050 + Math.random() * 750,
    }));
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion) {
      const doneTimer = setTimeout(onDone, 500);
      return () => clearTimeout(doneTimer);
    }
    // Un tick après le montage pour que le fondu d'entrée (opacity 0 -> 1)
    // soit bien animé par le navigateur plutôt qu'appliqué instantanément.
    const enterTimer = setTimeout(() => setPhase("rise"), 20);
    const shimmerTimer = setTimeout(() => setPhase("shimmer"), 1500);
    const doneTimer = setTimeout(onDone, 3000);
    return () => { clearTimeout(enterTimer); clearTimeout(shimmerTimer); clearTimeout(doneTimer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // v1.74.0 — 4 variants possibles désormais : "activate"/"downgrade" (mon
  // propre abonnement) et "context-premium"/"context-free" (changement de
  // bassin qui bascule le contexte effectif, ex. bassin délégué Premium).
  // toPremium détermine à lui seul le sens de la transition (couleur de
  // départ = couleur du contexte quitté, couleur d'arrivée = celle rejointe).
  const toPremium = variant === "activate" || variant === "context-premium";
  const BLUE_GRADIENT = "linear-gradient(135deg, #1ca7d1, #0c7a9e)";
  const GREEN_GRADIENT = "linear-gradient(135deg, #4a9b82, #2a6553)";
  const fromGradient = toPremium ? GREEN_GRADIENT : BLUE_GRADIENT;
  const toGradient = toPremium ? BLUE_GRADIENT : GREEN_GRADIENT;
  const titleKeys = {
    activate: "premium_reveal_title",
    downgrade: "premium_downgrade_title",
    "context-premium": "context_switch_premium_title",
    "context-free": "context_switch_free_title",
  };
  const subKeys = {
    activate: "premium_reveal_sub",
    downgrade: "premium_downgrade_sub",
    "context-premium": "context_switch_premium_sub",
    "context-free": "context_switch_free_sub",
  };
  const titleKey = titleKeys[variant] || titleKeys.activate;
  const subKey = subKeys[variant] || subKeys.activate;

  return (
    <div
      onClick={onDone}
      style={{
        position: "fixed", inset: 0, zIndex: 2000, overflow: "hidden",
        background: fromGradient,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
        opacity: reduceMotion ? 1 : (phase === "enter" ? 0 : 1),
        transition: reduceMotion ? "none" : "opacity 220ms ease-out",
      }}
    >
      {/* v1.73.0 — Calque de la couleur d'arrivée, fondu au-dessus du calque
          de départ sur la quasi-totalité des 3s, pour un vrai morph visible
          plutôt qu'un changement de couleur instantané. */}
      <div
        style={{
          position: "absolute", inset: 0,
          background: toGradient,
          opacity: reduceMotion ? 1 : (phase === "enter" ? 0 : 1),
          transition: reduceMotion ? "none" : "opacity 2600ms ease-in-out",
          pointerEvents: "none",
        }}
      />
      <style>{`
        @keyframes premiumBubbleRise {
          0% { transform: translateY(0) scale(1); opacity: 0.9; }
          100% { transform: translateY(-110vh) scale(1.15); opacity: 0; }
        }
        @keyframes premiumShimmerSweep {
          0% { top: -80px; opacity: 1; }
          85% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>

      {!reduceMotion && bubbles.map((b) => (
        <div
          key={b.id}
          style={{
            position: "absolute", bottom: -20, left: `${b.left}%`,
            width: b.size, height: b.size, borderRadius: "50%",
            background: "rgba(255,255,255,0.55)",
            boxShadow: "inset -2px -2px 4px rgba(0,0,0,0.08), inset 2px 2px 3px rgba(255,255,255,0.6)",
            animation: `premiumBubbleRise ${b.duration}ms cubic-bezier(.3,.6,.4,1) ${b.delay}ms forwards`,
            pointerEvents: "none",
          }}
        />
      ))}

      {!reduceMotion && phase === "shimmer" && (
        <div
          style={{
            position: "absolute", left: 0, right: 0, height: 70,
            background: "linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0))",
            animation: "premiumShimmerSweep 1500ms ease-in-out forwards",
            pointerEvents: "none",
          }}
        />
      )}

      <div style={{ position: "relative", textAlign: "center", color: "#fff", padding: 24 }}>
        <Crown size={48} color={toPremium ? "#f5d999" : "#e4ebf1"} style={{ marginBottom: 14 }} />
        <div style={{ fontSize: 21, fontWeight: 800, marginBottom: 6 }}>{t(titleKey)}</div>
        <div style={{ fontSize: 13.5, opacity: 0.85 }}>{t(subKey)}</div>
      </div>
    </div>
  );
}

// ---------- Autocomplétion localisation (Nominatim + GPS) ----------
function LocationAutocomplete({ value, onChange, lang, placeholder }) {
  const t = useT(lang || "fr");
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(false);
  const debounceRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => { setQuery(value || ""); }, [value]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.trim().length < 3 || query === value) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearchError(false);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await nominatimSearch(query, lang);
        setResults(r);
      } catch (e) {
        setSearchError(true);
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 450);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(item) {
    onChange(item.label);
    setQuery(item.label);
    setResults([]);
    setOpen(false);
  }

  function handleInputChange(e) {
    const v = e.target.value;
    setQuery(v);
    setOpen(true);
    if (v !== value) onChange("");
  }

  function handleGeoloc() {
    if (!navigator.geolocation) { setGpsError(true); return; }
    setGpsLoading(true);
    setGpsError(false);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const label = await nominatimReverse(pos.coords.latitude, pos.coords.longitude, lang);
          if (label) {
            onChange(label);
            setQuery(label);
            setResults([]);
            setOpen(false);
          } else {
            setGpsError(true);
          }
        } catch (e) {
          setGpsError(true);
        } finally {
          setGpsLoading(false);
        }
      },
      () => { setGpsError(true); setGpsLoading(false); },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }

  const showDropdown = open && query.trim().length >= 3 && query !== value;

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          style={{ ...styles.input, flex: 1 }}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={handleGeoloc}
          disabled={gpsLoading}
          title={t("location_use_gps")}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 44, borderRadius: 11, border: "1.5px solid #d0e4f5",
            background: "#fafcfb", color: "var(--brand-primary)", cursor: gpsLoading ? "default" : "pointer",
            flexShrink: 0,
          }}
        >
          {gpsLoading ? <Loader2 size={17} className="spin" /> : <LocateFixed size={17} />}
        </button>
      </div>
      {showDropdown && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 52,
          background: "#fff", border: "1.5px solid #d0e4f5", borderRadius: 11,
          boxShadow: "0 6px 18px rgba(10,50,90,0.14)", zIndex: 50, overflow: "hidden",
        }}>
          {searching && (
            <div style={{ padding: "10px 12px", fontSize: 12.5, color: "var(--brand-text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
              <Loader2 size={13} className="spin" /> {t("location_searching")}
            </div>
          )}
          {!searching && searchError && (
            <div style={{ padding: "10px 12px", fontSize: 12.5, color: "#b23b3b" }}>{t("location_search_error")}</div>
          )}
          {!searching && !searchError && results.length === 0 && (
            <div style={{ padding: "10px 12px", fontSize: 12.5, color: "var(--brand-text-muted)" }}>{t("location_no_results")}</div>
          )}
          {!searching && results.map((r, i) => (
            <div
              key={i}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(r)}
              style={{
                padding: "10px 12px", fontSize: 13.5, color: "var(--brand-text-strong)", cursor: "pointer",
                borderTop: i > 0 ? "1px solid #eef3f6" : "none",
                display: "flex", alignItems: "center", gap: 7,
              }}
            >
              <MapPin size={13} color="var(--brand-primary)" />
              {r.label}
            </div>
          ))}
        </div>
      )}
      {gpsError && (
        <div style={{ fontSize: 11.5, color: "#b23b3b", marginTop: 4 }}>{t("location_gps_error")}</div>
      )}
    </div>
  );
}

// ---------- Ajout d'un bassin ----------
function AddPoolModal({ onClose, onSave, lang, existingPool, forced }) {
  const t = useT(lang || "fr");
  const isEdit = !!existingPool;
  const [name, setName] = useState(existingPool?.name || "");
  const [location, setLocation] = useState(existingPool?.location || "");
  const [volume, setVolume] = useState(existingPool?.volume || 50);
  // Lot B (v1.33.0) — méthode de mesure préférée du bassin. Détermine la
  // méthode par défaut proposée dans AddMeasureModal ; "both" laisse le choix
  // ouvert à chaque mesure (comportement historique, valeur par défaut pour
  // ne pas changer le comportement des bassins existants).
  const [measureDevice, setMeasureDevice] = useState(existingPool?.measureDevice || "both");
  const [treatmentType, setTreatmentType] = useState(existingPool?.treatmentType || "chlore");
  const [filtration, setFiltration] = useState(existingPool?.filtration || "sable");
  const [manageStock, setManageStock] = useState(existingPool?.manageStock || false);
  const [reportEmail, setReportEmail] = useState(existingPool?.reportEmail || "");
  const [photo, setPhoto] = useState(existingPool?.photo || null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoBusy(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      // v1.29.9 — Même fix que pour les photos produit : icône de bassin
      // affichée en 38x38px, 1280px par défaut était surdimensionné et
      // contribuait au dépassement de la limite 1 Mo de config/main.
      const compressed = await compressImageDataUrl(dataUrl, 300, 0.5);
      setPhoto(compressed);
    } catch (err) {}
    finally { setPhotoBusy(false); }
  }

  function handleSave() {
    if (!name.trim()) return;
    onSave({
      ...(existingPool || {}),
      name: name.trim(),
      location: location.trim(),
      volume: parseFloat(volume) || 0,
      measureDevice,
      treatmentType,
      filtration,
      manageStock,
      reportEmail: reportEmail.trim(),
      photo,
    });
  }

  const treatmentOptions = [
    { value: "chlore", label: t("treatment_chlore") },
    { value: "sel", label: t("treatment_sel") },
    { value: "brome", label: t("treatment_brome") },
    { value: "o2", label: t("treatment_o2") },
    { value: "autre", label: t("treatment_autre") },
  ];
  const filtrationTypes = getFiltrationTypes(lang || "fr");
  const filtrationOptions = filtrationTypes.map(ft => ({ value: ft.value, label: ft.label }));

  return (
    <ModalShell
      onClose={onClose}
      title={isEdit ? t("edit_pool") : forced ? t("first_pool_title") : t("add_pool_title")}
      forced={forced}
      footer={
        <button style={styles.primaryBtn} onClick={handleSave}>
          {isEdit ? t("save") : t("create_pool")}
        </button>
      }
    >
      {forced && (
        <div style={{ fontSize: 13, color: "var(--brand-text-secondary)", marginBottom: 16, lineHeight: 1.5 }}>
          {t("first_pool_intro")}
        </div>
      )}
      {/* Photo */}
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
            <button type="button" style={styles.photoCaptureBtnHalf} onClick={() => fileInputRef.current?.click()}>
              <Camera size={17} />{photoBusy ? "..." : t("camera_btn")}
            </button>
            <button type="button" style={styles.photoCaptureBtnHalf} onClick={() => galleryInputRef.current?.click()}>
              <ImageOff size={17} />{photoBusy ? "..." : t("gallery_btn")}
            </button>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} style={styles.hiddenFileInput} />
        <input ref={galleryInputRef} type="file" accept="image/*" onChange={handlePhotoChange} style={styles.hiddenFileInput} />
      </div>

      {/* Nom */}
      <FieldLabel required>{t("pool_name")}</FieldLabel>
      <input
        style={styles.input}
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder={t("pool_name_placeholder")}
        name="poolgenai-pool-name"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />

      {/* Localisation */}
      <label style={styles.fieldLabel}>{t("location")}</label>
      <LocationAutocomplete value={location} onChange={setLocation} lang={lang || "fr"} placeholder={t("pool_location_placeholder")} />

      {/* Volume */}
      <label style={styles.fieldLabel}>{t("volume")}</label>
      <input type="number" style={styles.input} value={volume} onChange={e => setVolume(e.target.value)} />

      {/* Lot B (v1.33.0) — Méthode de mesure préférée */}
      <label style={styles.fieldLabel}>{t("measure_device_label")}</label>
      <select style={styles.input} value={measureDevice} onChange={e => setMeasureDevice(e.target.value)}>
        <option value="both">{t("measure_device_both")}</option>
        <option value="photometre">{t("measure_device_photometre")}</option>
        <option value="bandelette">{t("measure_device_bandelette")}</option>
      </select>

      {/* Type de traitement */}
      <label style={styles.fieldLabel}>{t("treatment_type")}</label>
      <select style={styles.input} value={treatmentType} onChange={e => setTreatmentType(e.target.value)}>
        {treatmentOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      {/* Filtration */}
      <label style={styles.fieldLabel}>{t("filtration")}</label>
      <select style={styles.input} value={filtration} onChange={e => setFiltration(e.target.value)}>
        {filtrationOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      {/* Email rapport PDF */}
      <label style={styles.fieldLabel}>{t("pool_email")}</label>
      <input
        type="email"
        style={styles.input}
        value={reportEmail}
        onChange={e => setReportEmail(e.target.value)}
        placeholder={t("pool_email_placeholder")}
      />
    </ModalShell>
  );
}

// ---------- Rapport ----------
function ReportView({ pool, measures, applications, products, onClose, manageStock, lang, authUid, isPremium }) {
  const t = useT(lang);
  const [showValues, setShowValues] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const [diagHistory, setDiagHistory] = useState([]);

  useEffect(() => {
    if (!authUid || !isPremium) { setDiagHistory([]); return; }
    let cancelled = false;
    FB.getDiagnostics(authUid).then((list) => {
      if (cancelled) return;
      setDiagHistory([...list].sort((a, b) => new Date(b.date) - new Date(a.date)));
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [authUid, isPremium]);

  // Inject print CSS (kept for browser print fallback)
  useEffect(() => {
    const id = "poolgenai-print-css";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @media print {
        body > * { display: none !important; }
        .report-print-root { display: block !important; position: static !important; overflow: visible !important; }
        .no-print { display: none !important; }
        #report-printable { max-width: 100% !important; padding: 12px !important; }
        .report-chart-wrap { width: 100% !important; page-break-inside: avoid; }
      }
    `;
    document.head.appendChild(style);
    return () => { const el = document.getElementById(id); if (el) el.remove(); };
  }, []);

  const sortedMeasures = useMemo(
    () => [...measures].sort((a, b) => new Date(a.date) - new Date(b.date)),
    [measures]
  );

  const chartData = useMemo(
    () =>
      sortedMeasures.map((m) => ({
        date: formatDateShort(m.date),
        timestamp: new Date(m.date).getTime(),
        pH:     m.pH     !== undefined && m.pH     !== "" ? parseFloat(m.pH)     : null,
        fCl:    m.fCl    !== undefined && m.fCl    !== "" ? parseFloat(m.fCl)    : null,
        tCl:    m.tCl    !== undefined && m.tCl    !== "" ? parseFloat(m.tCl)    : null,
        ccl:    m.ccl    !== undefined && m.ccl    !== "" ? parseFloat(m.ccl)    : null,
        tac:    m.tac    !== undefined && m.tac    !== "" ? parseFloat(m.tac)    : null,
        cya:    m.cya    !== undefined && m.cya    !== "" ? parseFloat(m.cya)    : null,
        hard:   m.hard   !== undefined && m.hard   !== "" ? parseFloat(m.hard)   : null,
        phos:   m.phos   !== undefined && m.phos   !== "" ? parseFloat(m.phos)   : null,
        copper: m.copper !== undefined && m.copper !== "" ? parseFloat(m.copper) : null,
        iron:   m.iron   !== undefined && m.iron   !== "" ? parseFloat(m.iron)   : null,
        temp:   m.temp   !== undefined && m.temp   !== "" ? parseFloat(m.temp)   : null,
      })),
    [sortedMeasures]
  );

  const chartParams = [
    { key: "pH",     color: "#1a8fd1", label: "pH",                                          axis: "left"  },
    { key: "fCl",    color: "#2b7fd9", label: "FCL",                                         axis: "left"  },
    { key: "tCl",    color: "#8a6fd1", label: "TCL",                                         axis: "left"  },
    { key: "ccl",    color: "#5b3fa0", label: "CCL",                                         axis: "left"  },
    { key: "tac",    color: "#d98c2b", label: t("tac_col"),                                  axis: "right" },
    { key: "cya",    color: "#c4502f", label: t("cya_col"),                                  axis: "right" },
    { key: "hard",   color: "#2e8b57", label: t("hard_col"),                                 axis: "right" },
    { key: "phos",   color: "#9b59b6", label: t("phos_col"),                                 axis: "right" },
    { key: "copper", color: "#b5651d", label: t("copper_col"),                               axis: "right" },
    { key: "iron",   color: "#c0392b", label: t("iron_col"),                                 axis: "right" },
    { key: "temp",   color: "#e0578a", label: t("temp_col"),                                 axis: "right" },
  ];

  // v1.66.2 — Sélection des paramètres affichés sur le graphique du rapport
  // (aperçu HTML et PDF), même mécanisme de puces que le graphique de
  // l'onglet Historique. Tous actifs par défaut.
  const [activeReportParams, setActiveReportParams] = useState(() => chartParams.map((cp) => cp.key));
  const allReportKeys = chartParams.map((cp) => cp.key);
  const allReportActive = allReportKeys.every((k) => activeReportParams.includes(k));
  function toggleReportParam(key) {
    setActiveReportParams((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }
  function toggleAllReportParams() {
    setActiveReportParams(allReportActive ? [] : allReportKeys);
  }

  const rows = useMemo(() => {
    const repTargets = getEffectiveTargets(pool?.treatmentType || "chlore");
    const repParams = getActiveParams(pool?.treatmentType || "chlore");
    return sortedMeasures.map((m) => {
      const recs = computeRecommendations(m, pool?.volume || 0, products, repTargets, repParams, t);
      const application = applications.find((a) => a.measureId === m.id) || null;
      return { measure: m, recs, application };
    });
  }, [sortedMeasures, pool, products, applications]);

  // v1.63.0 — Journal fusionné pour le tableau détaillé du rapport : mesures
  // (rows, inchangé — toujours utilisé pour le graphique et les photos) +
  // applications manuelles hors plan.
  // v1.63.1 — Tri décroissant (le plus récent en premier), sur demande d'Arnaud.
  const journalRows = useMemo(() => {
    const manualItems = (applications || [])
      .filter((a) => a.type === "manual")
      .map((a) => ({ manual: true, app: a }));
    const measureItems = rows.map((r) => ({ manual: false, ...r }));
    return [...measureItems, ...manualItems].sort((a, b) => {
      const da = a.manual ? new Date(a.app.appliedAt) : new Date(a.measure.date);
      const db = b.manual ? new Date(b.app.appliedAt) : new Date(b.measure.date);
      return db - da;
    });
  }, [rows, applications]);

  // v1.40.0 — Fix : la section photos du rapport n'affichait plus rien pour les
  // mesures synchronisées cloud, car measure.photos/poolPhotos sont vides
  // depuis leur migration vers la sous-collection measures/{id}/photos (voir
  // FB.saveMeasure). On les recharge ici à l'ouverture du rapport, pour les
  // seules mesures qui en ont (photoCount/poolPhotoCount) et qui n'ont pas
  // déjà les photos en mémoire locale (mesure ajoutée dans la session en cours).
  const [fetchedPhotosByMeasureId, setFetchedPhotosByMeasureId] = useState({});
  useEffect(() => {
    if (!authUid) return;
    const toFetch = rows
      .map(({ measure: m }) => m)
      .filter((m) => {
        if (m.photos?.length || m.photo || m.poolPhotos?.length) return false; // déjà en mémoire
        return !!(m.photoCount || m.poolPhotoCount);
      });
    if (!toFetch.length) return;
    let cancelled = false;
    Promise.all(
      toFetch.map((m) =>
        FB.getMeasurePhotos(authUid, m.id)
          .then(({ photos, poolPhotos }) => [m.id, { photos, poolPhotos }])
          .catch(() => [m.id, { photos: [], poolPhotos: [] }])
      )
    ).then((entries) => {
      if (cancelled) return;
      setFetchedPhotosByMeasureId((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
    });
    return () => { cancelled = true; };
  }, [rows, authUid]);

  const localeMap = { fr: "fr-FR", en: "en-GB", de: "de-DE", it: "it-IT", es: "es-ES", pt: "pt-PT" };
  const generatedAt = new Date().toLocaleString(localeMap[lang] || "fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  });

  // ── Génération PDF programmatique ──────────────────────────────────────
  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return [r, g, b];
  }

  async function generatePdfBlob() {
    if (!window.jspdf) throw new Error("jsPDF non chargé");
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const mL = 10, mR = 10, mT = 12, mB = 12;
    const cW = pageW - mL - mR;
    let y = mT;

    const poolName = pool?.name || "piscine";
    const genAt = new Date().toLocaleString(localeMap[lang] || "fr-FR", { dateStyle: "long", timeStyle: "short" });
    const hdrH = pool?.photo ? 22 : 16;

    // ── En-tête bleu ──
    pdf.setFillColor(10, 74, 138);
    pdf.roundedRect(mL, y, cW, hdrH, 2, 2, "F");
    pdf.setTextColor(255,255,255);
    pdf.setFontSize(11); pdf.setFont("helvetica","bold");
    const textMaxW = pool?.photo ? cW - 22 : cW - 4;
    pdf.text(`${t("report_title")} — ${poolName}`, mL+3, y+7, { maxWidth: textMaxW });
    pdf.setFontSize(7.5); pdf.setFont("helvetica","normal");
    pdf.text(`${pool?.location||""} · ${pool?.volume||""} m³ · ${t("generated_on")} ${genAt}`, mL+3, y+14, { maxWidth: textMaxW });

    // Photo du bassin dans le bandeau
    if (pool?.photo) {
      try {
        const photoSize = hdrH - 3;
        pdf.addImage(pool.photo, "JPEG", mL + cW - photoSize - 1, y + 1.5, photoSize, photoSize, undefined, "FAST");
      } catch(e) { /* photo invalide, on ignore */ }
    }

    pdf.setTextColor(0,0,0);
    y += hdrH + 4;

    function checkPage(need) {
      if (y + need > pageH - mB) { pdf.addPage(); y = mT; }
    }

    function sectionTitle(label) {
      checkPage(8);
      pdf.setFontSize(8); pdf.setFont("helvetica","bold");
      pdf.setTextColor(10,110,189);
      pdf.text(label.toUpperCase(), mL, y);
      pdf.setDrawColor(10,110,189); pdf.setLineWidth(0.25);
      pdf.line(mL, y+1.2, mL+cW, y+1.2);
      pdf.setTextColor(0,0,0);
      y += 5.5;
    }

    // ── Graphique simplifié ──
    if (chartData.length >= 2) {
      sectionTitle(t("params_evolution"));
      const gH = 45;
      const gAxisW = 9; // v1.66.2 — marge réservée aux libellés d'échelle gauche/droite
      const topPad = showValues ? 4 : 0; // v1.68.0 — place pour les valeurs au-dessus des points
      const gW = cW - gAxisW * 2;
      const gX = mL + gAxisW, gY = y + topPad;
      const leftAxisMax = 10, rightAxisMax = 110;

      // Fond graphique
      pdf.setFillColor(250,252,251);
      pdf.rect(gX, gY, gW, gH, "F");
      pdf.setDrawColor(200,210,220); pdf.setLineWidth(0.15);
      pdf.rect(gX, gY, gW, gH);

      // Grille horizontale (5 lignes) + libellés d'échelle gauche/droite
      pdf.setDrawColor(220,228,234); pdf.setLineWidth(0.1);
      for (let i = 1; i <= 4; i++) {
        const gy = gY + (gH / 5) * i;
        pdf.line(gX, gy, gX + gW, gy);
      }
      pdf.setFontSize(6); pdf.setFont("helvetica", "normal"); pdf.setTextColor(100,112,124);
      for (let i = 0; i <= 5; i++) {
        const ty = gY + (gH / 5) * i;
        const leftVal = Math.round(leftAxisMax - (leftAxisMax / 5) * i);
        const rightVal = Math.round(rightAxisMax - (rightAxisMax / 5) * i);
        pdf.text(String(leftVal), gX - 1.5, ty + 1, { align: "right" });
        pdf.text(String(rightVal), gX + gW + 1.5, ty + 1, { align: "left" });
      }
      pdf.setTextColor(0,0,0);

      const timestamps = chartData.map(d => d.timestamp);
      const tMin = Math.min(...timestamps), tMax = Math.max(...timestamps);
      const tRange = tMax - tMin || 1;

      // Dessiner chaque paramètre
      chartParams.filter((cp) => activeReportParams.includes(cp.key)).forEach(cp => {
        const pts = chartData.map((d, i) => {
          const v = d[cp.key];
          return v == null ? null : { x: i, t: d.timestamp, v };
        }).filter(Boolean);
        if (pts.length < 1) return;

        // Normalise selon axe (left: 0-10, right: 0-110)
        const vMax = cp.axis === "left" ? leftAxisMax : rightAxisMax;
        const [r,g,b] = hexToRgb(cp.color);
        pdf.setDrawColor(r,g,b); pdf.setLineWidth(0.5);

        let prev = null;
        pts.forEach(pt => {
          const px = gX + ((pt.t - tMin) / tRange) * gW;
          const py = gY + gH - (pt.v / vMax) * gH;
          const clampedPy = Math.max(gY, Math.min(gY+gH, py));
          if (prev) pdf.line(prev.px, prev.py, px, clampedPy);
          // Point
          pdf.setFillColor(r,g,b);
          pdf.circle(px, clampedPy, 0.8, "F");
          // v1.68.0 — Valeur au-dessus du point, si "Afficher les valeurs" est coché.
          if (showValues) {
            pdf.setFontSize(5);
            pdf.setTextColor(r, g, b);
            const labelY = Math.max(clampedPy - 1.4, gY - topPad + 2.5);
            pdf.text(String(pt.v), px, labelY, { align: "center" });
          }
          prev = { px, py: clampedPy };
        });
      });
      pdf.setTextColor(0,0,0);

      // Légende
      y = gY + gH + 2;
      let lx = mL;
      pdf.setFontSize(6.5); pdf.setFont("helvetica","normal");
      chartParams.filter((cp) => activeReportParams.includes(cp.key)).forEach(cp => {
        const hasData = chartData.some(d => d[cp.key] != null);
        if (!hasData) return;
        const [r,g,b] = hexToRgb(cp.color);
        pdf.setFillColor(r,g,b);
        pdf.rect(lx, y+0.5, 6, 1.5, "F");
        pdf.setTextColor(30,30,30);
        pdf.text(cp.label, lx+7, y+1.8);
        lx += 7 + pdf.getTextWidth(cp.label) + 4;
        if (lx > mL + cW - 20) { lx = mL; y += 4; }
      });
      pdf.setTextColor(0,0,0);
      y += 7;
    }

    // ── Tableau complet ──
    sectionTitle(t("detailed_history"));

    // Toutes les colonnes de paramètres + produit
    const allCols = [
      { key: "date",    label: t("date_col"),       w: 16 },
      { key: "pH",      label: "pH",                w: 7  },
      { key: "fCl",     label: "FCL",               w: 8  },
      { key: "tCl",     label: "TCL",               w: 8  },
      { key: "ccl",     label: "CCL",               w: 8  },
      { key: "tac",     label: "TAC",               w: 8  },
      { key: "cya",     label: "CYA",               w: 8  },
      { key: "hard",    label: "TH",                w: 7  },
      { key: "phos",    label: "Phos",              w: 7  },
      { key: "copper",  label: "Cu",                w: 7  },
      { key: "iron",    label: "Fe",                w: 7  },
      { key: "temp",    label: "°C",                w: 7  },
      { key: "prod",    label: t("product_col"),    w: 40 },
      { key: "advised", label: t("advised_col"),    w: 13 },
      { key: "qty",     label: t("applied_col"),    w: 13 },
      ...(manageStock ? [{ key: "stock", label: t("stock_col"), w: 12 }] : []),
    ];

    const totalRawW = allCols.reduce((s,c)=>s+c.w, 0);
    const sc = cW / totalRawW;
    const cols = allCols.map(c => ({ ...c, w: c.w * sc }));
    const rowH = 5.5, tblHdrH = 6.5;

    // Header
    checkPage(tblHdrH + rowH);
    pdf.setFillColor(220,235,250);
    pdf.rect(mL, y, cW, tblHdrH, "F");
    pdf.setFontSize(6); pdf.setFont("helvetica","bold"); pdf.setTextColor(13,43,78);
    let x = mL;
    cols.forEach(c => {
      pdf.text(c.label, x+0.8, y+4.2, { maxWidth: c.w-1.2 });
      x += c.w;
    });
    pdf.setDrawColor(180,200,220); pdf.setLineWidth(0.2);
    pdf.line(mL, y+tblHdrH, mL+cW, y+tblHdrH);
    y += tblHdrH;

    // Lignes données — une ligne par step (produit), rowspan simulé pour les valeurs mesure
    pdf.setFont("helvetica","normal"); pdf.setFontSize(6);

    // Colonnes paramètres mesure (fixes)
    const paramCols = cols.filter(c => !["prod","advised","qty","stock"].includes(c.key));
    const prodCols  = cols.filter(c => ["prod","advised","qty","stock"].includes(c.key));
    const paramStartX = mL;
    const prodStartX  = paramCols.reduce((s,c) => s + c.w, mL);

    // v1.63.1 — Journal fusionné (mesures + entretiens manuels), trié
    // décroissant (le plus récent en premier) — même logique que journalRows
    // côté aperçu écran, reconstruite ici car generatePdfBlob n'a pas accès
    // au useMemo du composant.
    const manualEntries = (applications || [])
      .filter((a) => a.type === "manual")
      .map((a) => ({ manual: true, app: a }));
    const measureEntries = sortedMeasures.map((m) => ({ manual: false, m }));
    const journalEntries = [...measureEntries, ...manualEntries].sort((a, b) => {
      const da = a.manual ? new Date(a.app.appliedAt) : new Date(a.m.date);
      const db = b.manual ? new Date(b.app.appliedAt) : new Date(b.m.date);
      return db - da;
    });

    journalEntries.forEach((entry, i) => {
      if (entry.manual) {
        const a = entry.app;
        const prod = products.find(p => p.name === a.productName);
        const blockH = rowH;

        checkPage(blockH);
        if (i % 2 === 0) { pdf.setFillColor(247,250,254); pdf.rect(mL, y, cW, blockH, "F"); }

        const d = new Date(a.appliedAt);
        const dateStr = `${d.getDate().toString().padStart(2,"0")}/${(d.getMonth()+1).toString().padStart(2,"0")} ${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;

        // Cellule fusionnée (paramCols) : date + libellé entretien manuel
        pdf.setTextColor(30,30,30);
        pdf.text(`${dateStr} · 🔧 ${t("reason_manual_maintenance")}`, paramStartX + 0.8, y + 3.8, { maxWidth: (prodStartX - paramStartX) - 1.5 });

        const stockVal = (() => {
          if (!manageStock || !prod) return "—";
          const qty = Math.round((prod.stockPercent ?? 100) / 100 * (prod.containerAmount ?? 1) * 10) / 10;
          return formatDose(qty, prod.containerUnit || "kg");
        })();

        const prodVals = {
          prod:    a.productName || "—",
          advised: "—",
          qty:     formatDose(a.appliedAmount, a.doseUnit || "g"),
          stock:   stockVal,
        };

        x = prodStartX;
        prodCols.forEach(c => {
          pdf.text(String(prodVals[c.key] ?? '—'), x+0.8, y + 3.8, { maxWidth: c.w - 1.5 });
          x += c.w;
        });

        pdf.setDrawColor(200,212,228); pdf.setLineWidth(0.15);
        pdf.line(mL, y+blockH, mL+cW, y+blockH);
        y += blockH;
        return;
      }

      const m = entry.m;
      const app   = applications.find(a => a.measureId === m.id);
      const appliedSteps = app?.steps?.filter(s => !s.skipped) || [];
      const repTargets = getEffectiveTargets(pool?.treatmentType || "chlore");
      const repParams  = getActiveParams(pool?.treatmentType || "chlore");
      const mRecs = computeRecommendations(m, pool?.volume || 0, products, repTargets, repParams, t);

      const useSteps = appliedSteps.length > 0;
      const items = useSteps ? appliedSteps : mRecs;
      const rowCount = Math.max(1, items.length);
      const blockH = rowH * rowCount;

      checkPage(blockH);
      if (i % 2 === 0) { pdf.setFillColor(247,250,254); pdf.rect(mL, y, cW, blockH, "F"); }

      const d = new Date(m.date);
      const dateStr = `${d.getDate().toString().padStart(2,"0")}/${(d.getMonth()+1).toString().padStart(2,"0")} ${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;

      const paramVals = {
        date:   dateStr,
        pH:     m.pH     != null && m.pH     !== "" ? String(m.pH)     : "—",
        fCl:    m.fCl    != null && m.fCl    !== "" ? String(m.fCl)    : "—",
        tCl:    m.tCl    != null && m.tCl    !== "" ? String(m.tCl)    : "—",
        ccl:    m.ccl    != null && m.ccl    !== "" ? String(m.ccl)    : "—",
        tac:    m.tac    != null && m.tac    !== "" ? String(m.tac)    : "—",
        cya:    m.cya    != null && m.cya    !== "" ? String(m.cya)    : "—",
        hard:   m.hard   != null && m.hard   !== "" ? String(m.hard)   : "—",
        phos:   m.phos   != null && m.phos   !== "" ? String(m.phos)   : "—",
        copper: m.copper != null && m.copper !== "" ? String(m.copper) : "—",
        iron:   m.iron   != null && m.iron   !== "" ? String(m.iron)   : "—",
        temp:   m.temp   != null && m.temp   !== "" ? String(m.temp)   : "—",
      };

      // Paramètres mesure — centrés verticalement dans le bloc
      pdf.setTextColor(30,30,30);
      const paramTextY = y + blockH / 2;
      x = paramStartX;
      paramCols.forEach(c => {
        pdf.text(String(paramVals[c.key]??'—'), x+0.8, paramTextY, { maxWidth: c.w-1.5 });
        x += c.w;
      });

      // Une ligne par item (step ou rec)
      const itemsToRender = items.length > 0 ? items : [null];
      itemsToRender.forEach((item, j) => {
        const rowY = y + j * rowH;
        const isStep = useSteps;
        const step = isStep ? item : null;
        const rec  = !isStep ? item : null;
        const prod = step ? products.find(p => p.name === step.productName) : null;

        const stockVal = (() => {
          if (!manageStock || !prod) return "—";
          const qty = Math.round((prod.stockPercent ?? 100) / 100 * (prod.containerAmount ?? 1) * 10) / 10;
          return formatDose(qty, prod.containerUnit || "kg");
        })();

        const prodVals = {
          prod:    step ? step.productName : rec ? rec.productName : "—",
          advised: step ? (step.computedDoseAmount != null ? formatDose(step.computedDoseAmount, step.doseUnit||"g") : "—")
                        : rec ? formatDose(rec.computedDoseAmount, rec.doseUnit||"g") : "—",
          qty:     step ? formatDose(step.appliedAmount, step.doseUnit||"g") : "—",
          stock:   stockVal,
        };

        x = prodStartX;
        prodCols.forEach(c => {
          pdf.text(String(prodVals[c.key]??'—'), x+0.8, rowY+3.8, { maxWidth: c.w-1.5 });
          x += c.w;
        });

        // Ligne de séparation entre items (fine)
        if (j < itemsToRender.length - 1) {
          pdf.setDrawColor(210,220,235); pdf.setLineWidth(0.08);
          pdf.line(prodStartX, rowY+rowH, mL+cW, rowY+rowH);
        }
      });

      // Bordure basse du bloc
      pdf.setDrawColor(200,212,228); pdf.setLineWidth(0.15);
      pdf.line(mL, y+blockH, mL+cW, y+blockH);
      y += blockH;

      // Ligne note si présente
      if (m.note) {
        checkPage(rowH + 1);
        pdf.setFillColor(240, 246, 251);
        pdf.rect(prodStartX, y, cW - (prodStartX - mL), rowH, "F");
        pdf.setFontSize(5.5); pdf.setFont("helvetica","italic"); pdf.setTextColor(74,100,128);
        pdf.text(`📝 ${m.note}`, prodStartX + 1, y + 3.8, { maxWidth: cW - (prodStartX - mL) - 2 });
        pdf.setFont("helvetica","normal"); pdf.setTextColor(30,30,30);
        pdf.setDrawColor(200,212,228); pdf.setLineWidth(0.1);
        pdf.line(mL, y+rowH, mL+cW, y+rowH);
        y += rowH;
      }
    });

    // ── Légende des abréviations et cibles ──
    y += 4;
    checkPage(32);
    pdf.setFontSize(7.5); pdf.setFont("helvetica","bold"); pdf.setTextColor(13,43,78);
    pdf.text(t("legend_title").toUpperCase(), mL, y);
    pdf.setDrawColor(13,43,78); pdf.setLineWidth(0.2);
    pdf.line(mL, y+1.2, mL+cW, y+1.2);
    y += 5;

    const legendItems = [
      { abbr: "pH",   label: t("param_ph_long"),   target: "7.2 – 7.4",    unit: "" },
      { abbr: "FCL",  label: t("param_fcl_long"),  target: "1 – 3",         unit: "mg/L" },
      { abbr: "TCL",  label: t("param_tcl_long"),  target: "1 – 3",         unit: "mg/L" },
      { abbr: "CCL",  label: t("param_ccl_long"),  target: "0 – 0.5",       unit: "mg/L" },
      { abbr: "TAC",  label: t("param_tac_long"),  target: "80 – 120",      unit: "mg/L" },
      { abbr: "CYA",  label: t("param_cya_long"),  target: "30 – 50",       unit: "mg/L" },
      { abbr: "TH",   label: t("param_th_long"),   target: "200 – 400",     unit: "mg/L" },
      { abbr: "Phos", label: t("param_phos_long"), target: "0 – 100",       unit: "µg/L" },
      { abbr: "Cu",   label: t("param_cu_long"),   target: "0 – 0.2",       unit: "mg/L" },
      { abbr: "Fe",   label: t("param_fe_long"),   target: "0 – 0.1",       unit: "mg/L" },
      { abbr: "°C",   label: t("param_temp_long"), target: "24 – 30",       unit: "°C" },
    ];

    // 2 colonnes
    const colW2 = cW / 2;
    pdf.setFontSize(6); pdf.setFont("helvetica","normal"); pdf.setTextColor(50,50,50);
    legendItems.forEach((item, i) => {
      checkPage(5);
      const cx = mL + (i % 2 === 0 ? 0 : colW2);
      if (i % 2 === 0 && i > 0) y += 4.5;
      pdf.setFont("helvetica","bold"); pdf.setTextColor(10,110,189);
      pdf.text(item.abbr, cx, y);
      pdf.setFont("helvetica","normal"); pdf.setTextColor(50,50,50);
      const detail = ` = ${item.label} · cible : ${item.target}${item.unit ? " " + item.unit : ""}`;
      pdf.text(detail, cx + pdf.getTextWidth(item.abbr), y, { maxWidth: colW2 - pdf.getTextWidth(item.abbr) - 2 });
    });
    y += 6;

    // ── Historique diagnostics IA ──
    if (diagHistory.length > 0) {
      sectionTitle(t("diag_history_title"));

      const dColW = { date: 16, note: 42, confidence: 14 };
      dColW.response = cW - dColW.date - dColW.note - dColW.confidence;
      const dX = {
        date: mL,
        note: mL + dColW.date,
        response: mL + dColW.date + dColW.note,
        confidence: mL + dColW.date + dColW.note + dColW.response,
      };

      checkPage(6.5);
      pdf.setFillColor(237, 231, 246);
      pdf.rect(mL, y, cW, 6, "F");
      pdf.setFontSize(6); pdf.setFont("helvetica","bold"); pdf.setTextColor(80,50,140);
      pdf.text(t("diag_history_date"), dX.date+0.8, y+4, { maxWidth: dColW.date-1.2 });
      pdf.text(t("diag_history_note"), dX.note+0.8, y+4, { maxWidth: dColW.note-1.2 });
      pdf.text(t("diag_history_response"), dX.response+0.8, y+4, { maxWidth: dColW.response-1.2 });
      pdf.text(t("diag_history_confidence"), dX.confidence+0.8, y+4, { maxWidth: dColW.confidence-1.2 });
      pdf.setTextColor(0,0,0);
      y += 6;

      const sortedDiag = [...diagHistory].sort((a,b) => new Date(b.date) - new Date(a.date));
      sortedDiag.forEach((d, i) => {
        pdf.setFontSize(6); pdf.setFont("helvetica","normal");
        const dateStr = new Date(d.date).toLocaleDateString(localeMap[lang] || "fr-FR");
        const noteLines = pdf.splitTextToSize(d.note || "—", dColW.note - 1.6);
        const respLines = pdf.splitTextToSize(d.suggestion || "—", dColW.response - 1.6);
        const lh = 3.1;
        const lineCount = Math.max(1, noteLines.length, respLines.length);
        const blockH = lineCount * lh + 1.8;

        checkPage(blockH);
        if (i % 2 === 0) { pdf.setFillColor(250, 247, 253); pdf.rect(mL, y, cW, blockH, "F"); }

        pdf.setTextColor(30,30,30);
        pdf.text(dateStr, dX.date+0.8, y+3.1, { maxWidth: dColW.date-1.6 });
        pdf.text(noteLines, dX.note+0.8, y+3.1);
        pdf.text(respLines, dX.response+0.8, y+3.1);
        pdf.text(`${d.confidence || 0}/5`, dX.confidence+0.8, y+3.1);

        y += blockH;
        pdf.setDrawColor(225,215,240); pdf.setLineWidth(0.1);
        pdf.line(mL, y, mL+cW, y);
      });
      y += 5;
    }

    // ── Photos des mesures ── (v1.68.0, triées par date décroissante)
    const photoRows = [...rows].reverse();
    const hasAnyReportPhotos = photoRows.some(({ measure }) => {
      const fetched = fetchedPhotosByMeasureId[measure.id];
      const analysisPhotos = measure.photos?.length ? measure.photos : (measure.photo ? [measure.photo] : (fetched?.photos || []));
      const poolPhotos = measure.poolPhotos?.length ? measure.poolPhotos : (fetched?.poolPhotos || []);
      return (analysisPhotos.length + poolPhotos.length) > 0;
    });

    if (hasAnyReportPhotos) {
      sectionTitle(t("photos_section"));
      const thumbSize = 24, gap = 3;
      const perRow = Math.max(1, Math.floor((cW + gap) / (thumbSize + gap)));

      photoRows.forEach(({ measure }) => {
        const fetched = fetchedPhotosByMeasureId[measure.id];
        const analysisPhotos = measure.photos?.length ? measure.photos : (measure.photo ? [measure.photo] : (fetched?.photos || []));
        const poolPhotos = measure.poolPhotos?.length ? measure.poolPhotos : (fetched?.poolPhotos || []);
        const allPhotos = [...analysisPhotos, ...poolPhotos];
        if (!allPhotos.length) return;

        const rowsNeeded = Math.ceil(allPhotos.length / perRow);
        const blockH = 5 + rowsNeeded * (thumbSize + gap);
        checkPage(blockH);

        pdf.setFontSize(7.5); pdf.setFont("helvetica","bold"); pdf.setTextColor(45,74,110);
        pdf.text(formatDate(measure.date), mL, y + 3);
        pdf.setTextColor(0,0,0);
        y += 5;

        let px = mL, col = 0;
        allPhotos.forEach((src) => {
          try {
            pdf.addImage(src, "JPEG", px, y, thumbSize, thumbSize, undefined, "FAST");
          } catch(e) { /* photo invalide, on ignore */ }
          pdf.setDrawColor(208,228,245); pdf.setLineWidth(0.15);
          pdf.rect(px, y, thumbSize, thumbSize);
          col++;
          if (col >= perRow) { col = 0; px = mL; y += thumbSize + gap; }
          else { px += thumbSize + gap; }
        });
        if (col !== 0) y += thumbSize + gap;
        y += 3;
      });
    }

    // Footer toutes pages
    const pageCount = pdf.internal.getNumberOfPages();
    for (let p = 1; p <= pageCount; p++) {
      pdf.setPage(p);
      pdf.setFontSize(6.5); pdf.setFont("helvetica","normal"); pdf.setTextColor(160,160,160);
      pdf.text(`PoolGenAI v${APP_VERSION} · ${poolName}`, mL, pageH-5);
      pdf.text(`${p} / ${pageCount}`, pageW-mR, pageH-5, { align: "right" });
    }

    return pdf.output("blob");
  }

  async function handleSharePdf() {
    setPdfLoading(true); setPdfError(null);
    try {
      const poolName = pool?.name || "piscine";
      const fileName = `rapport-poolgenai-${poolName.toLowerCase().replace(/[^a-z0-9]/g,"-")}.pdf`;
      const pdfBlob = await generatePdfBlob();
      const pdfFile = new File([pdfBlob], fileName, { type: "application/pdf" });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({ title: `Rapport PoolGenAI — ${poolName}`, files: [pdfFile] });
      } else {
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement("a");
        a.href = url; a.download = fileName;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      }
    } catch(e) {
      if (e.name !== "AbortError") { console.error("PDF share error", e); setPdfError(e.message||"Erreur PDF"); }
    } finally { setPdfLoading(false); }
  }

  async function handleDownloadPdf() {
    setPdfLoading(true); setPdfError(null);
    try {
      const poolName = pool?.name || "piscine";
      const fileName = `rapport-poolgenai-${poolName.toLowerCase().replace(/[^a-z0-9]/g,"-")}.pdf`;
      const pdfBlob = await generatePdfBlob();
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url; a.download = fileName;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch(e) {
      console.error("PDF download error", e); setPdfError(e.message||"Erreur PDF");
    } finally { setPdfLoading(false); }
  }

  return (
    <div style={styles.reportOverlay} className="report-print-root">
      <div style={styles.reportToolbar} className="no-print">
        <button style={styles.reportCloseBtn} onClick={onClose}>
          <X size={18} /> {t("close")}
        </button>
        <button
          style={{ ...styles.reportPrintBtn, opacity: pdfLoading ? 0.7 : 1 }}
          onClick={handleDownloadPdf}
          disabled={pdfLoading}
        >
          {pdfLoading ? <Loader2 size={16} className="spin" /> : <Download size={16} />}
          {t("report_print_btn")}
        </button>
        <button
          className="no-print"
          style={{ ...styles.reportPrintBtn, background: pdfLoading ? "var(--brand-text-muted)" : "#0d7a3e", opacity: pdfLoading ? 0.7 : 1 }}
          onClick={handleSharePdf}
          disabled={pdfLoading}
        >
          {pdfLoading ? <Loader2 size={16} className="spin" /> : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>}
          {t("share_report")}
        </button>
        {pdfError && (
          <div className="no-print" style={{ fontSize: 11, color: "#c0392b", padding: "4px 8px", background: "#fdf0ef", borderRadius: 6 }}>
            {pdfError}
          </div>
        )}
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
        <div className="no-print" style={styles.chipsRow}>
          <button
            onClick={toggleAllReportParams}
            style={{
              ...styles.chip,
              ...styles.chipAll,
              background: allReportActive ? "var(--brand-primary)" : "#f1f4f3",
              borderColor: allReportActive ? "var(--brand-primary)" : "#d0e4f5",
              color: allReportActive ? "#ffffff" : "#2d4a6e",
            }}
          >
            {allReportActive ? t("hide_all_params") : t("show_all_params")}
          </button>
          {chartParams.map((cp) => (
            <button
              key={cp.key}
              onClick={() => toggleReportParam(cp.key)}
              style={{
                ...styles.chip,
                background: activeReportParams.includes(cp.key) ? cp.color + "22" : "#f1f4f3",
                borderColor: activeReportParams.includes(cp.key) ? cp.color : "#d0e4f5",
                color: activeReportParams.includes(cp.key) ? cp.color : "var(--brand-text-muted)",
              }}
            >
              {cp.label}
              <span style={styles.chipAxisTag}>{cp.axis === "left" ? "ᴜ" : "ᴅ"}</span>
            </button>
          ))}
        </div>
        <p className="no-print" style={styles.axisLegend}>
          <span style={styles.axisLegendItem}>{t("axis_legend_u")}</span>
          <span style={styles.axisLegendItem}>{t("axis_legend_d")}</span>
        </p>
        <label className="no-print" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--brand-text-secondary)", marginBottom: 8, cursor: "pointer", userSelect: "none" }}>
          <input type="checkbox" checked={showValues} onChange={(e) => setShowValues(e.target.checked)} />
          <span>{t("show_values")}</span>
        </label>
        {chartData.length > 0 ? (() => {
          const timestamps = chartData.map((d) => d.timestamp);
          const spanMs = timestamps.length > 1 ? Math.max(...timestamps) - Math.min(...timestamps) : 0;
          const showTime = spanMs < 86400000 * 2;
          return (
          <React.Fragment>
          <div style={styles.reportChartWrap} className="report-chart-wrap">
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
              {chartParams.filter((cp) => activeReportParams.includes(cp.key)).map((cp) => (
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
            {chartParams.filter(cp => activeReportParams.includes(cp.key) && chartData.some(d => d[cp.key] != null)).map((cp) => (
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
        {journalRows.length === 0 ? (
          <p style={styles.helpTextSmall}>{t("no_measures_report")}</p>
        ) : (
          <table style={{ ...styles.reportTable, fontSize: 11 }}>
            <thead>
              <tr>
                <th style={styles.reportThCell}>{t("date_col")}</th>
                <th style={styles.reportThCell}>pH</th>
                <th style={styles.reportThCell}>{t("cl_libre_col")}</th>
                <th style={styles.reportThCell}>{t("cl_total_col")}</th>
                <th style={styles.reportThCell}>{t("ccl_col")}</th>
                <th style={styles.reportThCell}>{t("tac_col")}</th>
                <th style={styles.reportThCell}>{t("cya_col")}</th>
                <th style={styles.reportThCell}>{t("hard_col")}</th>
                <th style={styles.reportThCell}>{t("phos_col")}</th>
                <th style={styles.reportThCell}>{t("copper_col")}</th>
                <th style={styles.reportThCell}>{t("iron_col")}</th>
                <th style={styles.reportThCell}>{t("temp_col")}</th>
                <th style={styles.reportThCell}>{t("product_col")}</th>
                <th style={styles.reportThCell}>{t("advised_col")}</th>
                <th style={styles.reportThCell}>{t("applied_col")}</th>
                <th style={styles.reportThCell}>{t("time_col")}</th>
                {manageStock && <th style={styles.reportThCell}>{t("stock_col")}</th>}
              </tr>
            </thead>
            <tbody>
              {journalRows.flatMap((item, i) => {
                // v1.63.0 — Ligne d'entretien manuel : une seule ligne, les
                // colonnes de mesure (Date + 11 paramètres) sont fusionnées
                // en une seule cellule (même principe que la ligne "note"
                // plus bas), le reste (produit/dose/heure) rempli normalement.
                if (item.manual) {
                  const a = item.app;
                  const prod = products.find((p) => p.name === a.productName);
                  return [(
                    <tr key={`manual-${a.id}`} style={{ background: i % 2 === 0 ? "#f8fafd" : "#ffffff" }}>
                      <td colSpan={12} style={{ ...styles.reportTdCell, fontWeight: 600, color: "var(--brand-text-strong)" }}>
                        {formatDate(a.appliedAt)} · <span style={{ fontStyle: "italic", color: "#c4502f" }}>🔧 {t("reason_manual_maintenance")}</span>
                      </td>
                      <td style={styles.reportTdCell}>{a.productName}</td>
                      <td style={{ ...styles.reportTdCell, color: "var(--brand-text-secondary)" }}>—</td>
                      <td style={{ ...styles.reportTdCell, fontWeight: 700, color: "var(--brand-primary)" }}>{formatDose(a.appliedAmount, a.doseUnit || "g")}</td>
                      <td style={{ ...styles.reportTdCell, color: "var(--brand-text-secondary)" }}>
                        {new Date(a.appliedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      {manageStock && <td style={{ ...styles.reportTdCell, color: prod && (prod.stockPercent ?? 100) <= 20 ? "#c0392b" : "var(--brand-text-secondary)", fontWeight: 600 }}>
                        {prod ? formatDose(Math.round((prod.stockPercent ?? 100) / 100 * (prod.containerAmount ?? 1) * 10) / 10, prod.containerUnit || "kg") : "—"}
                      </td>}
                    </tr>
                  )];
                }
                const { measure, recs, application } = item;
                const applied = application?.steps?.filter(s => !s.skipped) || [];
                const useSteps = applied.length > 0;
                const rowCount = useSteps ? Math.max(1, applied.length) : Math.max(1, recs.length);
                const hasNote = !!measure.note;
                const totalRowSpan = rowCount + (hasNote ? 1 : 0);
                const prodColSpan = manageStock ? 5 : 4;

                const measureRows = Array.from({ length: rowCount }).map((_, j) => {
                  const step = useSteps ? (applied[j] || null) : null;
                  const rec  = !useSteps ? (recs[j] || null) : null;
                  const prod = step ? products.find((p) => p.name === step.productName) : null;
                  return (
                    <tr key={`${i}-${j}`} style={{ background: i % 2 === 0 ? "#f8fafd" : "#ffffff" }}>
                      {j === 0 && (
                        <>
                          <td style={{ ...styles.reportTdCell, fontWeight: 600, color: "var(--brand-text-strong)" }} rowSpan={totalRowSpan}>{formatDate(measure.date)}</td>
                          <td style={styles.reportTdCell} rowSpan={totalRowSpan}>{measure.pH ?? "—"}</td>
                          <td style={styles.reportTdCell} rowSpan={totalRowSpan}>{measure.fCl != null && measure.fCl !== "" ? `${measure.fCl}` : "—"}</td>
                          <td style={styles.reportTdCell} rowSpan={totalRowSpan}>{measure.tCl != null && measure.tCl !== "" ? `${measure.tCl}` : "—"}</td>
                          <td style={styles.reportTdCell} rowSpan={totalRowSpan}>{measure.ccl != null && measure.ccl !== "" ? `${measure.ccl}` : "—"}</td>
                          <td style={styles.reportTdCell} rowSpan={totalRowSpan}>{measure.tac != null && measure.tac !== "" ? `${measure.tac}` : "—"}</td>
                          <td style={styles.reportTdCell} rowSpan={totalRowSpan}>{measure.cya != null && measure.cya !== "" ? `${measure.cya}` : "—"}</td>
                          <td style={styles.reportTdCell} rowSpan={totalRowSpan}>{measure.hard != null && measure.hard !== "" ? `${measure.hard}` : "—"}</td>
                          <td style={styles.reportTdCell} rowSpan={totalRowSpan}>{measure.phos != null && measure.phos !== "" ? `${measure.phos}` : "—"}</td>
                          <td style={styles.reportTdCell} rowSpan={totalRowSpan}>{measure.copper != null && measure.copper !== "" ? `${measure.copper}` : "—"}</td>
                          <td style={styles.reportTdCell} rowSpan={totalRowSpan}>{measure.iron != null && measure.iron !== "" ? `${measure.iron}` : "—"}</td>
                          <td style={styles.reportTdCell} rowSpan={totalRowSpan}>{measure.temp != null && measure.temp !== "" ? `${measure.temp}` : "—"}</td>
                        </>
                      )}
                      <td style={styles.reportTdCell}>
                        {step ? (step.skipped ? <span style={{ color: "#9ab0c4" }}>⊘ {step.productName}</span> : step.productName)
                          : rec ? <span style={{ color: "var(--brand-text-muted)", fontStyle: "italic" }}>{rec.productName}</span>
                          : "—"}
                      </td>
                      <td style={{ ...styles.reportTdCell, color: "var(--brand-text-secondary)" }}>
                        {step && !step.skipped ? formatDose(step.computedDoseAmount ?? step.appliedAmount, step.doseUnit || "g")
                          : rec ? formatDose(rec.computedDoseAmount, rec.doseUnit || "g")
                          : "—"}
                      </td>
                      <td style={{ ...styles.reportTdCell, fontWeight: 700, color: step?.skipped ? "#9ab0c4" : "var(--brand-primary)" }}>
                        {step && !step.skipped ? formatDose(step.appliedAmount, step.doseUnit || "g") : "—"}
                      </td>
                      <td style={{ ...styles.reportTdCell, color: "var(--brand-text-secondary)" }}>
                        {step?.appliedAt ? new Date(step.appliedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                      {manageStock && <td style={{ ...styles.reportTdCell, color: prod && (prod.stockPercent ?? 100) <= 20 ? "#c0392b" : "var(--brand-text-secondary)", fontWeight: 600 }}>
                        {prod ? formatDose(Math.round((prod.stockPercent ?? 100) / 100 * (prod.containerAmount ?? 1) * 10) / 10, prod.containerUnit || "kg") : "—"}
                      </td>}
                    </tr>
                  );
                });

                // Ligne note fusionnée
                const noteRow = hasNote ? (
                  <tr key={`${i}-note`} style={{ background: i % 2 === 0 ? "var(--brand-bg-tint)" : "#f8fafd" }}>
                    <td colSpan={prodColSpan} style={{ ...styles.reportTdCell, fontStyle: "italic", color: "var(--brand-text-secondary)", fontSize: 11, paddingLeft: 10 }}>
                      📝 {measure.note}
                    </td>
                  </tr>
                ) : null;

                return noteRow ? [...measureRows, noteRow] : measureRows;
              })}
            </tbody>
          </table>
        )}

        {/* Légende des abréviations et cibles */}
        <div style={{ marginTop: 16, padding: "10px 14px", background: "var(--brand-bg-tint)", borderRadius: 10, border: "1px solid #d0e4f5" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--brand-text-strong)", marginBottom: 6 }}>{t("legend_title")}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
            {[
              { abbr: "pH",   label: t("param_ph_long"),   target: "7.2 – 7.4",       unit: "" },
              { abbr: "FCL",  label: t("param_fcl_long"),  target: "1 – 3",            unit: "mg/L" },
              { abbr: "TCL",  label: t("param_tcl_long"),  target: "1 – 3",            unit: "mg/L" },
              { abbr: "CCL",  label: t("param_ccl_long"),  target: "0 – 0.5",          unit: "mg/L" },
              { abbr: "TAC",  label: t("param_tac_long"),  target: "80 – 120",         unit: "mg/L" },
              { abbr: "CYA",  label: t("param_cya_long"),  target: "30 – 50",          unit: "mg/L" },
              { abbr: "TH",   label: t("param_th_long"),   target: "200 – 400",        unit: "mg/L" },
              { abbr: "Phos", label: t("param_phos_long"), target: "0 – 100",          unit: "µg/L" },
              { abbr: "Cu",   label: t("param_cu_long"),   target: "0 – 0.2",          unit: "mg/L" },
              { abbr: "Fe",   label: t("param_fe_long"),   target: "0 – 0.1",          unit: "mg/L" },
              { abbr: "°C",   label: t("param_temp_long"), target: "24 – 30",          unit: "°C" },
            ].map(({ abbr, label, target, unit }) => (
              <div key={abbr} style={{ fontSize: 10, color: "var(--brand-text-secondary)", minWidth: 180 }}>
                <span style={{ fontWeight: 700, color: "var(--brand-primary)" }}>{abbr}</span>
                {" = "}{label}
                <span style={{ color: "var(--brand-text-muted)" }}> · cible : {target}{unit ? " " + unit : ""}</span>
              </div>
            ))}
          </div>
        </div>

        {diagHistory.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={styles.reportSectionTitle}>{t("diag_history_title")}</div>
            <div style={{ overflowX: "auto" }}>
              <table style={styles.diagHistTable}>
                <thead>
                  <tr>
                    <th style={{ ...styles.diagHistTh, width: 62 }}>{t("diag_history_date")}</th>
                    <th style={styles.diagHistTh}>{t("diag_history_note")}</th>
                    <th style={styles.diagHistTh}>{t("diag_history_response")}</th>
                    <th style={{ ...styles.diagHistTh, width: 54 }}>{t("diag_history_confidence")}</th>
                  </tr>
                </thead>
                <tbody>
                  {diagHistory.map((d) => (
                    <tr key={d.id}>
                      <td style={styles.diagHistTd}>{formatDateShort(d.date)}</td>
                      <td style={styles.diagHistTd}>{d.note}</td>
                      <td style={styles.diagHistTd}>
                        {d.suggestion}
                        {d.confidence_reason && (
                          <div style={{ fontSize: 10.5, color: "var(--brand-text-muted)", marginTop: 4, fontStyle: "italic" }}>
                            {d.confidence_reason}
                          </div>
                        )}
                      </td>
                      <td style={styles.diagHistTd}>{d.confidence || 0}/5</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {rows.some(({ measure }) => (measure.photoCount || measure.poolPhotoCount || measure.photos?.length || measure.photo || measure.poolPhotos?.length)) && (
          <div style={{ marginTop: 24 }}>
            <div style={styles.reportSectionTitle}>{t("photos_section")}</div>
            {/* v1.68.0 — Photos triées par date décroissante (le plus récent
                en premier), sur demande d'Arnaud. "rows" reste croissant
                (utilisé pour le graphique) : on inverse juste ici, en copie. */}
            {[...rows].reverse().map(({ measure }, i) => {
              const fetched = fetchedPhotosByMeasureId[measure.id];
              const analysisPhotos = measure.photos?.length ? measure.photos : (measure.photo ? [measure.photo] : (fetched?.photos || []));
              const poolPhotos = measure.poolPhotos?.length ? measure.poolPhotos : (fetched?.poolPhotos || []);
              const allPhotos = [...analysisPhotos, ...poolPhotos];
              if (!allPhotos.length) return null;
              return (
                <div key={i} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--brand-text-secondary)", marginBottom: 6 }}>
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

// ---------- Label de champ avec astérisque rouge si obligatoire ----------
function FieldLabel({ children, required, style }) {
  return (
    <label style={style || styles.fieldLabel}>
      {children}
      {required && <span style={{ color: "#c0392b" }}> *</span>}
    </label>
  );
}

// ---------- Modal shell ----------
function ModalShell({ children, onClose, title, rightAction, forced, footer }) {
  return (
    <div style={styles.modalOverlay} onClick={forced ? undefined : onClose}>
      <div style={styles.modalSheet} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <span style={styles.modalTitle}>{title}</span>
          <div style={{ display: "flex", gap: 8 }}>
            {rightAction}
            {!forced && (
              <button style={styles.modalCloseBtn} onClick={onClose}>
                <X size={18} />
              </button>
            )}
          </div>
        </div>
        <div style={styles.modalBody}>{children}</div>
        {/* v1.81.0 — Footer collant optionnel : reste visible en bas de la
            fenêtre modale même si le contenu dépasse la hauteur de l'écran,
            au lieu de compter sur un défilement sans indication visuelle
            (le bouton "Enregistrer" pouvait passer inaperçu, hors champ). */}
        {footer && <div style={styles.modalStickyFooter}>{footer}</div>}
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
    background: "var(--brand-primary-dark)",
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
    color: "var(--brand-text-strong)",
  },
  reportHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    paddingBottom: 16,
    marginBottom: 18,
    borderBottom: "2px solid var(--brand-primary)",
  },
  reportHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    background: "var(--brand-primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  reportTitle: { fontSize: 18, fontWeight: 800, color: "var(--brand-text-strong)" },
  reportSubtitle: { fontSize: 12.5, color: "var(--brand-text-muted)", marginTop: 2 },
  reportSectionTitle: {
    fontSize: 14,
    fontWeight: 800,
    color: "var(--brand-primary)",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginTop: 26,
    marginBottom: 12,
  },
  reportChartWrap: {
    background: "#fafcfb",
    borderRadius: 12,
    padding: 8,
    width: "100%",
    boxSizing: "border-box",
  },
  reportRow: { marginBottom: 18 },
  reportRowDate: { fontSize: 14, fontWeight: 700, color: "var(--brand-text-strong)", marginBottom: 8 },
  reportTable: { width: "100%", borderCollapse: "collapse", marginBottom: 10 },
  diagHistTable: { width: "100%", borderCollapse: "collapse", marginTop: 10, tableLayout: "fixed" },
  diagHistTh: {
    padding: "6px 6px",
    textAlign: "left",
    fontSize: 10,
    fontWeight: 700,
    color: "var(--brand-text-muted)",
    textTransform: "uppercase",
    borderBottom: "2px solid #e2d9f3",
  },
  diagHistTd: {
    padding: "8px 6px",
    fontSize: 12,
    color: "#2d1b69",
    borderBottom: "1px solid #f0eaf8",
    verticalAlign: "top",
    wordBreak: "break-word",
  },
  reportThCell: {
    padding: "6px 8px",
    textAlign: "left",
    fontSize: 10,
    fontWeight: 700,
    color: "var(--brand-text-muted)",
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
  reportTableCellLabel: { fontSize: 10.5, color: "var(--brand-text-muted)", textTransform: "uppercase" },
  reportTableCellValue: { fontSize: 13, fontWeight: 700, color: "var(--brand-text-strong)", marginTop: 1 },
  reportSubLabel: {
    fontSize: 11.5,
    fontWeight: 700,
    color: "var(--brand-text-muted)",
    textTransform: "uppercase",
    marginBottom: 5,
  },
  reportConseilText: { fontSize: 12.5, color: "var(--brand-text-muted)", fontStyle: "italic" },
  reportConseilList: { margin: 0, paddingLeft: 18 },
  reportConseilItem: { fontSize: 12.5, color: "#2d4a6e", lineHeight: 1.6 },
  reportAppliedTag: { color: "#1a8fd1", fontWeight: 600 },
  reportNotAppliedTag: { color: "#a8721a", fontStyle: "italic" },
  reportDivider: { height: 1, background: "#d0e4f5", marginTop: 16 },
  app: {
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    background: "var(--brand-bg-tint)",
    maxWidth: "100vw",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    color: "var(--brand-text-strong)",
    height: "100dvh",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "20px 18px 16px",
    background: "linear-gradient(135deg, var(--brand-primary), var(--brand-primary-dark))",
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
  headerSub: { color: "var(--brand-header-sub)", fontSize: 12.5, marginTop: 1 },
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
    color: "var(--brand-text-muted)",
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
  poolSwitcherThumbInline: {
    width: 20,
    height: 20,
    borderRadius: 6,
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
    border: "none",
    background: "var(--brand-primary)",
    color: "#fff",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
  },
  poolNameTag: {
    display: "inline-block",
    fontSize: 11.5,
    fontWeight: 700,
    color: "var(--brand-primary)",
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
  main: { flex: 1, padding: "16px 16px 24px", overflowY: "auto", WebkitOverflowScrolling: "touch", maxWidth: 768, width: "100%", alignSelf: "center", boxSizing: "border-box" },
  sectionRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    margin: "4px 2px 10px",
  },
  sectionLabel: { fontSize: 13, fontWeight: 700, color: "#2d4a6e", textTransform: "uppercase", letterSpacing: 0.4 },
  sectionDate: { fontSize: 12.5, color: "var(--brand-text-muted)" },
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
  paramValue: { fontSize: 24, fontWeight: 800, marginTop: 4, color: "var(--brand-text-strong)" },
  paramUnit: { fontSize: 12, fontWeight: 600, color: "var(--brand-text-muted)", marginLeft: 3 },
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
    border: "none",
    background: "var(--brand-primary)",
    color: "#fff",
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
    // v1.71.0 — Suit désormais le thème gratuit/premium global (var CSS)
    // au lieu d'une palette fixe, pour rester cohérent avec le reste de
    // l'app quand la teinte change.
    border: "1.5px solid var(--brand-bg-tint)",
    background: "var(--brand-bg-tint)",
    color: "var(--brand-text-secondary)",
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
    border: "none",
    background: "var(--brand-primary)",
    color: "#fff",
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
    border: "none",
    background: "var(--brand-primary)",
    color: "#fff",
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
    color: "var(--brand-primary)",
    fontWeight: 600,
    marginTop: 4,
  },
  recoCard: {
    background: "#fff7f2",
    border: "1px solid #f3d9c8",
    borderRadius: 14,
    padding: "13px 14px",
  },
  // v1.66.1 — Variante neutre pour les cartes purement informatives (rien à
  // appliquer, ex. chlore/dureté trop haut) : évite le style "à traiter"
  // rouge/orange qui suggère à tort une action en attente.
  recoCardInfo: {
    background: "#eaf4fb",
    border: "1px solid #c8e0f5",
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
  recoStepBadgeInfo: {
    width: 20,
    height: 20,
    borderRadius: 99,
    background: "#5a8bb0",
    color: "#ffffff",
    fontSize: 11,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  recoParamInfo: { fontSize: 13.5, fontWeight: 700, color: "var(--brand-text-strong)" },
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
    color: "var(--brand-text-strong)",
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
    color: "var(--brand-primary)",
    marginTop: 7,
  },
  // v1.66.1 — Ligne "recontrôle recommandé" des cartes informatives, en
  // remplacement du badge "À débuter après" (non pertinent sans action).
  recoInfoTiming: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontSize: 11.5,
    fontWeight: 700,
    color: "#2d6a9a",
    background: "#dcedf9",
    border: "1px solid #b8d8ef",
    borderRadius: 8,
    padding: "5px 8px",
    marginTop: 7,
  },
  recoNote: { fontSize: 11.5, color: "var(--brand-text-muted)", marginTop: 6, lineHeight: 1.4 },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "60px 24px",
    gap: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: 700, marginTop: 6 },
  emptyText: { fontSize: 13.5, color: "var(--brand-text-muted)", lineHeight: 1.5, maxWidth: 280 },
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
    background: "var(--brand-bg-tint)",
    color: "var(--brand-text-strong)",
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
    color: "var(--brand-text-strong)",
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
    background: "var(--brand-primary)",
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
    background: "var(--brand-primary)",
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
  measureDate: { fontSize: 13.5, fontWeight: 600, color: "var(--brand-text-strong)" },
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
  measureNote: { fontSize: 12, color: "var(--brand-text-muted)", marginBottom: 8, fontStyle: "italic" },
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
    color: "var(--brand-primary)",
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
    color: "var(--brand-primary)",
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
  },
  helpText: { fontSize: 12, color: "var(--brand-text-muted)", lineHeight: 1.5, margin: "4px 2px 14px" },
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
  productName: { fontSize: 14, fontWeight: 700, color: "var(--brand-text-strong)" },
  productMeta: { fontSize: 11.5, color: "var(--brand-text-muted)", marginTop: 2 },
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
    background: "var(--brand-bg-tint)",
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
  modalTitle: { fontSize: 16, fontWeight: 800, color: "var(--brand-text-strong)" },
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
  modalStickyFooter: {
    position: "sticky",
    bottom: 0,
    background: "#ffffff",
    padding: "12px 18px 18px",
    borderTop: "1px solid #eef1f0",
    marginTop: 12,
  },
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
  applyStepTitle: { fontSize: 13.5, fontWeight: 700, color: "var(--brand-text-strong)", marginBottom: 2 },
  applyStepProduct: { fontSize: 12.5, color: "var(--brand-text-muted)", marginBottom: 8 },
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
    color: "var(--brand-text-strong)",
    fontWeight: 500,
  },
  helpTextSmall: { fontSize: 12.5, color: "var(--brand-text-muted)", lineHeight: 1.5 },
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
    color: "var(--brand-text-secondary)",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all .15s",
  },
  segmentedBtnActive: {
    background: "#ffffff",
    color: "var(--brand-primary)",
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
    background: "var(--brand-bg-tint)",
    color: "var(--brand-text-secondary)",
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
    color: "var(--brand-text-strong)",
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
    border: "1.5px solid var(--brand-primary)",
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
    color: "var(--brand-text-strong)",
  },
  treatmentOptionDesc: {
    fontSize: 12,
    color: "var(--brand-text-muted)",
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
    color: "var(--brand-text-secondary)",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    textAlign: "center",
  },
  filtrationOptionActive: {
    border: "1.5px solid var(--brand-primary)",
    background: "#eaf5fd",
    color: "var(--brand-primary)",
  },
  stripHint: {
    fontSize: 12.5,
    color: "var(--brand-text-muted)",
    lineHeight: 1.5,
    padding: "8px 12px",
    background: "var(--brand-bg-tint)",
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
    color: "var(--brand-text-strong)",
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
    background: "var(--brand-bg-tint)",
    color: "var(--brand-primary)",
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
    color: "var(--brand-primary)",
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
    color: "var(--brand-primary)",
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
    color: "var(--brand-text-strong)",
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
    color: "var(--brand-text-strong)",
  },
  confirmYesBtn: {
    flex: 1,
    padding: "9px 0",
    borderRadius: 9,
    border: "none",
    background: "var(--brand-primary)",
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
    color: "var(--brand-primary)",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
  },
  latestNoteBox: {
    marginBottom: 10,
    padding: "9px 13px",
    borderRadius: 10,
    background: "var(--brand-bg-tint)",
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
    background: "var(--brand-bg-tint)",
    color: "var(--brand-primary)",
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
    background: "var(--brand-bg-tint)",
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
    color: "var(--brand-primary)",
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
    background: "var(--brand-bg-tint)",
    border: "1px solid #d0e4f5",
  },
  consumptionDate: {
    fontSize: 12,
    color: "var(--brand-text-secondary)",
  },
  consumptionAmt: {
    fontSize: 12,
    fontWeight: 700,
    color: "var(--brand-primary)",
  },
  photoLockedBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    padding: "13px 0",
    borderRadius: 12,
    // v1.71.0 — Suit désormais le thème gratuit/premium global (var CSS).
    border: "1.5px solid var(--brand-bg-tint)",
    background: "var(--brand-bg-tint)",
    color: "var(--brand-text-secondary)",
    fontWeight: 600,
    fontSize: 13.5,
    cursor: "pointer",
    boxSizing: "border-box",
  },
  photoPreviewWrap: { position: "relative" },
  photoPreview: {
    width: "100%",
    maxHeight: 200,
    objectFit: "contain",
    borderRadius: 12,
    border: "1px solid #d0e4f5",
    background: "#f0f4f8",
    cursor: "zoom-in",
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
  paywallPrice: { fontSize: 22, fontWeight: 800, color: "#0d2b4e", marginTop: 6 }, // v1.71.0 — usage exclusif PaywallModal : reste bleu, non thémé
  paywallPriceSub: { fontSize: 12.5, color: "#6a7d90" }, // v1.71.0 — idem
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
        <stop offset="100%" stop-color="var(--brand-primary-dark)"/>
      </linearGradient>
      <clipPath id="rnd"><rect width="512" height="512" rx="115"/></clipPath>
    </defs>
    <!-- fond dégradé bleu -->
    <rect width="512" height="512" rx="115" fill="url(#bg)"/>
    <!-- vague de fond -->
    <path d="M0 340 Q128 290 256 330 Q384 370 512 310 L512 512 L0 512Z" fill="var(--brand-primary)" opacity="0.55" clip-path="url(#rnd)"/>
    <path d="M0 380 Q128 340 256 375 Q384 410 512 360 L512 512 L0 512Z" fill="var(--brand-primary-dark)" opacity="0.6" clip-path="url(#rnd)"/>
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
  meta.content = "var(--brand-primary-dark)";
  if (!meta.parentNode) document.head.appendChild(meta);
})();

const __root = ReactDOM.createRoot(document.getElementById("root"));
__root.render(React.createElement(PoolGenAIApp));
const __loader = document.getElementById("boot-loader");
if (__loader) __loader.remove();
