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
const APP_VERSION = "1.29.10";
const CGU_VERSION = "1.1"; // v1.4 : clause IA, avertissement photos, mentions LCEN, limitation responsabilité révisée

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
    action_hard_plus: "Monte la dureté (TH)",
    action_phos_minus: "Réduit les phosphates",
    action_sequestrant: "Séquestrant métaux (cuivre/fer)",
    legal_notices: "Mentions légales",
    lcen_title: "Mentions légales (LCEN)",
    lcen_editor: "Éditeur",
    lcen_editor_val: "Arnaud Goumain — Particulier",
    lcen_host: "Hébergement",
    lcen_host_val: "GitHub Inc. / Microsoft Corporation\n88 Colin P Kelly Jr St\nSan Francisco, CA 94107, USA",
    lcen_contact: "Contact",
    lcen_contact_val: "support.poolgenai@gmail.com",
    lcen_cgu_title: "Conditions générales d'utilisation",
    lcen_ai_title: "Intelligence artificielle",
    lcen_ai_val: "Lorsque vous utilisez l'analyse IA, vos données sont transmises directement à Anthropic ou OpenAI via votre clé API personnelle. L'éditeur ne stocke pas vos clés et n'a pas accès aux échanges. Consultez les CGU de votre fournisseur IA avant activation.",
    lcen_photos_title: "Photos",
    lcen_photos_val: "Ne soumettez que des photos de matériel de mesure ou d'eau du bassin. Sont exclus : personnes identifiables, éléments de localisation du domicile, données personnelles visibles.",
    lcen_gdpr: "Données personnelles",
    lcen_gdpr_val: "Conformément au RGPD et à la loi Informatique et Libertés, vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité de vos données. Pour exercer ces droits, contactez-nous à l'adresse ci-dessus. Vous pouvez également déposer une réclamation auprès de la CNIL : www.cnil.fr",
    photo_warning_title: "Attention avant de photographier",
    photo_warning_body: "Assurez-vous que la photo ne contient pas :\n• de personnes identifiables\n• d'éléments permettant de localiser votre domicile\n• de données personnelles visibles\n\nNous recommandons de désactiver la géolocalisation dans les paramètres de votre appareil photo.",
    photo_warning_confirm: "J'ai compris, continuer",
    ai_clause_title: "Analyse par intelligence artificielle",
    ai_clause_body: "Lorsque vous activez l'analyse IA, vos données (mesures et photos) sont transmises directement à Anthropic ou OpenAI via votre clé API personnelle. PoolGenAI ne stocke pas votre clé et n'a pas accès aux échanges. Consultez les CGU de votre fournisseur d'IA avant utilisation.",
    cgu_update_title: "Conditions mises à jour",
    cgu_update_body: "Les conditions d'utilisation ont été mises à jour (v{version}). Merci de les relire et de les accepter pour continuer.",
    cgu_update_accept: "Lire et accepter",
    cgu_version_label: "CGU version",
    cgu_accepted_on: "Acceptées le",
    cgu_updated_title: "Mise à jour des conditions",
    cgu_updated_body: "Les conditions d'utilisation ont été mises à jour. Merci de les relire et de les accepter pour continuer.",
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
    report_locked: "Rapport PDF réservé à la version illimitée",
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
    diag_history_locked: "Historique des diagnostics IA réservé à la version illimitée",
    diag_history_confirm_delete: "Supprimer ce diagnostic ?",
    update_required_title: "Nouvelle version disponible",
    update_required_desc: "Une nouvelle version de PoolGenAI a été déployée. Mets à jour l'application pour continuer.",
    update_required_btn: "Mettre à jour maintenant",
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
    param_ph_long: "Potentiel Hydrogène", param_fcl_long: "Chlore libre", param_tcl_long: "Chlore total",
    param_ccl_long: "Chlore combiné (chloramines)", param_tac_long: "Titre Alcalimétrique Complet",
    param_cya_long: "Acide cyanurique (stabilisant)", param_th_long: "Titre Hydrotimétrique (dureté)",
    param_phos_long: "Phosphates", param_cu_long: "Cuivre", param_fe_long: "Fer", param_temp_long: "Température de l'eau",
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
    data_request_error: "Échec de l'envoi. Réessaie ou écris directement à support.poolgenai@gmail.com.",
    note_optional: "Note (optionnel)",
    note_placeholder: "Eau trouble, fort ensoleillement, baignade prévue...",
    save_measure: "Enregistrer la mesure",
    save: "Enregistrer",
    cancel: "Annuler",
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
    // Wizard traitement
    wizard_title: "Plan de traitement",
    wizard_step: "Étape",
    wizard_of: "sur",
    wizard_now: "Maintenant",
    wizard_in: "Dans",
    wizard_at: "à",
    wizard_scheduled: "Prévu",
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
    treatment_skipped: "Étape passée",
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
    paywall_title: "Passer à la version illimitée",
    paywall_desc: "Mesures sans limite · Analyse IA des bandelettes · Rapport PDF · Gestion du stock",
    paywall_btn: "Activer la version illimitée",
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
    pool_photo_locked: "Photos du bassin réservées à la version illimitée",
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
    user_not_found: "Aucun compte avec cet email. Si tu penses que c'est une erreur, contacte support.poolgenai@gmail.com",
    account_disabled: "Ce compte a été désactivé. Contacte support.poolgenai@gmail.com pour plus d'informations.",
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
    prod_name_tac_plus: "Produit TAC+ (bicarbonate de sodium)",
    prod_name_calcium: "Chlorure de calcium (dureté +)",
    prod_name_anti_phos: "Anti-phosphates (PHOSfree type)",
    prod_name_sequestrant: "Séquestrant métaux (Metal Free type)",
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
    reco_no_product_note: "Aucun produit configuré pour cette action. Ajoute-en un dans l'onglet Produits.",
    product_empty_delete_confirm: "{name} est à 0% de stock. Le supprimer de la liste ?",
    reco_note_ph_before_tac: "pH corrigé avant le TAC : à ce pH le chlore serait peu efficace, et le TAC n'est pas assez bas pour être urgent.",
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
    unlimited_version: "Illimité",
    active_pool: "Bassin actif",
    pool_volume: "Volume du bassin (m³)",
    treatment_params: "Paramètres :",
    treatment_desc: "Le traitement détermine quels paramètres sont mesurés et les cibles recommandées. Le volume est utilisé pour calculer les doses de produits.",
    subscription: "Abonnement",
    unlimited_active: "Mode illimité actif",
    free_mode: "Version gratuite",
    api_section: "Clé API (analyse IA)",
    ai_toggle_label: "Activer l'analyse IA",
    ai_toggle_desc: "Permet d'analyser les photos de mesure par intelligence artificielle.",
    ai_password_title: "Accès configuration IA",
    ai_password_prompt: "Saisir le mot de passe pour activer l'analyse IA",
    ai_password_error: "Mot de passe incorrect",
    ai_configure_btn: "Configurer la clé API",
    ai_config_title: "Configuration IA",
    ai_config_back: "Retour aux réglages",
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
    action_hard_plus: "Increase hardness (TH)",
    action_phos_minus: "Reduce phosphates",
    action_sequestrant: "Metal sequestrant (copper/iron)",
    legal_notices: "Legal notices",
    lcen_title: "Legal notices",
    lcen_editor: "Publisher",
    lcen_editor_val: "Arnaud Goumain — Private individual",
    lcen_host: "Hosting",
    lcen_host_val: "GitHub Inc. / Microsoft Corporation\n88 Colin P Kelly Jr St\nSan Francisco, CA 94107, USA",
    lcen_contact: "Contact",
    lcen_contact_val: "support.poolgenai@gmail.com",
    lcen_cgu_title: "Terms of use",
    lcen_ai_title: "Artificial intelligence",
    lcen_ai_val: "When using AI analysis, your data is transmitted directly to Anthropic or OpenAI via your personal API key. The publisher does not store your keys and has no access to exchanges. Consult your AI provider's terms before activating.",
    lcen_photos_title: "Photos",
    lcen_photos_val: "Only submit photos of measuring equipment or pool water. Excluded: identifiable persons, home location elements, visible personal data.",
    lcen_gdpr: "Personal data",
    lcen_gdpr_val: "Under GDPR and applicable data protection law, you have the right to access, rectify, erase and port your data. To exercise these rights, contact us at the address above. You may also file a complaint with your national data protection authority.",
    photo_warning_title: "Warning before taking photos",
    photo_warning_body: "Make sure the photo does not contain:\n• identifiable persons\n• elements that could locate your home\n• visible personal data\n\nWe recommend disabling geotagging in your camera settings.",
    photo_warning_confirm: "I understand, continue",
    ai_clause_title: "AI analysis",
    ai_clause_body: "When you enable AI analysis, your data (measurements and photos) are sent directly to Anthropic or OpenAI via your personal API key. PoolGenAI does not store your key and has no access to the exchanges. Please review your AI provider's terms before use.",
    cgu_update_title: "Terms updated",
    cgu_update_body: "The terms of use have been updated (v{version}). Please read and accept them to continue.",
    cgu_update_accept: "Read and accept",
    cgu_version_label: "Terms version",
    cgu_accepted_on: "Accepted on",
    cgu_updated_title: "Terms updated",
    cgu_updated_body: "The terms of use have been updated. Please read and accept them to continue.",
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
    report_locked: "PDF report reserved for unlimited version",
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
    diag_history_locked: "AI diagnostics history reserved for the unlimited version",
    diag_history_confirm_delete: "Delete this diagnostic?",
    update_required_title: "New version available",
    update_required_desc: "A new version of PoolGenAI has been released. Update the app to continue.",
    update_required_btn: "Update now",
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
    param_ph_long: "Hydrogen Potential", param_fcl_long: "Free chlorine", param_tcl_long: "Total chlorine",
    param_ccl_long: "Combined chlorine (chloramines)", param_tac_long: "Total Alkalinity",
    param_cya_long: "Cyanuric acid (stabiliser)", param_th_long: "Total Hardness",
    param_phos_long: "Phosphates", param_cu_long: "Copper", param_fe_long: "Iron", param_temp_long: "Water temperature",
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
    data_request_error: "Failed to send. Try again or email support.poolgenai@gmail.com directly.",
    note_optional: "Note (optional)",
    note_placeholder: "Cloudy water, strong sun, swimming planned...",
    save_measure: "Save reading",
    save: "Save",
    cancel: "Cancel",
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
    // Wizard traitement
    wizard_title: "Treatment plan",
    wizard_step: "Step",
    wizard_of: "of",
    wizard_now: "Now",
    wizard_in: "In",
    wizard_at: "at",
    wizard_scheduled: "Scheduled",
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
    treatment_skipped: "Step skipped",
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
    paywall_title: "Go unlimited",
    paywall_desc: "Unlimited readings · AI strip analysis · PDF report · Stock management",
    paywall_btn: "Activate unlimited version",
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
    pool_photo_locked: "Pool photos reserved for unlimited version",
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
    user_not_found: "No account with this email. If you think this is a mistake, contact support.poolgenai@gmail.com",
    account_disabled: "This account has been disabled. Contact support.poolgenai@gmail.com for more information.",
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
    prod_name_tac_plus: "TAC+ product (sodium bicarbonate)",
    prod_name_calcium: "Calcium chloride (hardness +)",
    prod_name_anti_phos: "Anti-phosphates (PHOSfree type)",
    prod_name_sequestrant: "Metal sequestrant (Metal Free type)",
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
    reco_no_product_note: "No product configured for this action. Add one in the Products tab.",
    product_empty_delete_confirm: "{name} is at 0% stock. Remove it from the list?",
    reco_note_ph_before_tac: "pH corrected before TAC: chlorine would be inefficient at this pH, and TAC isn't low enough to be urgent.",
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
    unlimited_version: "Unlimited",
    active_pool: "Active pool",
    pool_volume: "Pool volume (m³)",
    treatment_params: "Parameters:",
    treatment_desc: "The treatment determines which parameters are measured and the recommended targets. Volume is used to calculate product doses.",
    subscription: "Subscription",
    unlimited_active: "Unlimited mode active",
    free_mode: "Free version",
    api_section: "API Key (AI analysis)",
    ai_toggle_label: "Enable AI analysis",
    ai_toggle_desc: "Allows analyzing measurement photos using artificial intelligence.",
    ai_password_title: "AI configuration access",
    ai_password_prompt: "Enter password to enable AI analysis",
    ai_password_error: "Incorrect password",
    ai_configure_btn: "Configure API key",
    ai_config_title: "AI Configuration",
    ai_config_back: "Back to settings",
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
    action_hard_plus: "Härte erhöhen (TH)",
    action_phos_minus: "Phosphate reduzieren",
    action_sequestrant: "Metallsequestriermittel (Kupfer/Eisen)",
    legal_notices: "Rechtliche Hinweise",
    lcen_title: "Rechtliche Hinweise",
    lcen_editor: "Herausgeber",
    lcen_editor_val: "Arnaud Goumain — Privatperson",
    lcen_host: "Hosting",
    lcen_host_val: "GitHub Inc. / Microsoft Corporation\n88 Colin P Kelly Jr St\nSan Francisco, CA 94107, USA",
    lcen_contact: "Kontakt",
    lcen_contact_val: "support.poolgenai@gmail.com",
    lcen_cgu_title: "Nutzungsbedingungen",
    lcen_ai_title: "Künstliche Intelligenz",
    lcen_ai_val: "Bei der KI-Analyse werden Ihre Daten direkt über Ihren persönlichen API-Schlüssel an Anthropic oder OpenAI übertragen. Der Herausgeber speichert keine Schlüssel und hat keinen Zugang zu den Austauschen.",
    lcen_photos_title: "Fotos",
    lcen_photos_val: "Senden Sie nur Fotos von Messgeräten oder Poolwasser. Ausgeschlossen: identifizierbare Personen, Standortelemente, sichtbare persönliche Daten.",
    lcen_gdpr: "Personenbezogene Daten",
    lcen_gdpr_val: "Gemäß DSGVO haben Sie das Recht auf Zugang, Berichtigung, Löschung und Übertragbarkeit Ihrer Daten. Wenden Sie sich an uns unter der oben genannten Adresse oder reichen Sie eine Beschwerde bei Ihrer Datenschutzbehörde ein.",
    photo_warning_title: "Warnung vor dem Fotografieren",
    photo_warning_body: "Stellen Sie sicher, dass das Foto nicht enthält:\n• erkennbare Personen\n• Elemente, die Ihren Wohnort identifizieren könnten\n• sichtbare personenbezogene Daten\n\nWir empfehlen, die Geolokalisierung in den Kameraeinstellungen zu deaktivieren.",
    photo_warning_confirm: "Verstanden, weiter",
    ai_clause_title: "KI-Analyse",
    ai_clause_body: "Wenn Sie die KI-Analyse aktivieren, werden Ihre Daten direkt über Ihren persönlichen API-Schlüssel an Anthropic oder OpenAI übermittelt. PoolGenAI speichert Ihren Schlüssel nicht.",
    cgu_update_title: "AGB aktualisiert",
    cgu_update_body: "Die Nutzungsbedingungen wurden aktualisiert (v{version}). Bitte lesen und akzeptieren Sie sie.",
    cgu_update_accept: "Lesen und akzeptieren",
    cgu_version_label: "AGB-Version",
    cgu_accepted_on: "Akzeptiert am",
    cgu_updated_title: "AGB aktualisiert",
    cgu_updated_body: "Die Nutzungsbedingungen wurden aktualisiert. Bitte lesen und akzeptieren Sie sie.",
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
    report_locked: "PDF-Bericht nur in der unbegrenzten Version",
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
    diag_history_locked: "KI-Diagnoseverlauf nur in der unbegrenzten Version",
    diag_history_confirm_delete: "Diese Diagnose löschen?",
    update_required_title: "Neue Version verfügbar",
    update_required_desc: "Eine neue Version von PoolGenAI wurde veröffentlicht. Aktualisiere die App, um fortzufahren.",
    update_required_btn: "Jetzt aktualisieren",
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
    param_ph_long: "Wasserstoffpotenzial", param_fcl_long: "Freies Chlor", param_tcl_long: "Gesamtchlor",
    param_ccl_long: "Gebundenes Chlor (Chloramine)", param_tac_long: "Gesamtalkalinität",
    param_cya_long: "Cyanursäure (Stabilisator)", param_th_long: "Gesamthärte",
    param_phos_long: "Phosphate", param_cu_long: "Kupfer", param_fe_long: "Eisen", param_temp_long: "Wassertemperatur",
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
    data_request_error: "Senden fehlgeschlagen. Versuche es erneut oder schreibe direkt an support.poolgenai@gmail.com.",
    note_optional: "Notiz (optional)",
    note_placeholder: "Trübes Wasser, starke Sonne, Schwimmen geplant...",
    save_measure: "Messung speichern",
    save: "Speichern",
    cancel: "Abbrechen",
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
    wizard_title: "Behandlungsplan",
    wizard_step: "Schritt",
    wizard_of: "von",
    wizard_now: "Jetzt",
    wizard_in: "In",
    wizard_at: "um",
    wizard_scheduled: "Geplant",
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
    treatment_skipped: "Schritt übersprungen",
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
    paywall_title: "Auf unbegrenzt wechseln",
    paywall_desc: "Unbegrenzte Messungen · KI-Streifenanalyse · PDF-Bericht · Lagerverwaltung",
    paywall_btn: "Unbegrenzte Version aktivieren",
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
    pool_photo_locked: "Beckenfotos nur in unbegrenzter Version",
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
    user_not_found: "Kein Konto mit dieser E-Mail. Falls das ein Irrtum ist, kontaktiere support.poolgenai@gmail.com",
    account_disabled: "Dieses Konto wurde gesperrt. Kontaktiere support.poolgenai@gmail.com für weitere Informationen.",
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
    prod_name_tac_plus: "KH+-Produkt (Natriumbicarbonat)",
    prod_name_calcium: "Calciumchlorid (Härte +)",
    prod_name_anti_phos: "Anti-Phosphat (PHOSfree Typ)",
    prod_name_sequestrant: "Metallsequestriermittel (Metal Free Typ)",
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
    reco_no_product_note: "Kein Produkt für diese Aktion konfiguriert. Füge eines im Tab Produkte hinzu.",
    product_empty_delete_confirm: "{name} hat 0% Bestand. Aus der Liste entfernen?",
    reco_note_ph_before_tac: "pH vor KH korrigiert: Chlor wäre bei diesem pH-Wert wenig wirksam, und der KH ist nicht niedrig genug, um dringend zu sein.",
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
    unlimited_version: "Unbegrenzt",
    active_pool: "Aktives Becken",
    pool_volume: "Beckenvolumen (m³)",
    treatment_params: "Parameter:",
    treatment_desc: "Die Behandlung bestimmt, welche Parameter gemessen werden und die empfohlenen Ziele. Das Volumen wird zur Berechnung der Produktdosen verwendet.",
    subscription: "Abonnement",
    unlimited_active: "Unbegrenzter Modus aktiv",
    free_mode: "Kostenlose Version",
    api_section: "API-Schlüssel (KI-Analyse)",
    ai_toggle_label: "KI-Analyse aktivieren",
    ai_toggle_desc: "Ermöglicht die Analyse von Messfotos mit künstlicher Intelligenz.",
    ai_password_title: "KI-Konfigurationszugang",
    ai_password_prompt: "Passwort eingeben, um KI-Analyse zu aktivieren",
    ai_password_error: "Falsches Passwort",
    ai_configure_btn: "API-Schlüssel konfigurieren",
    ai_config_title: "KI-Konfiguration",
    ai_config_back: "Zurück zu den Einstellungen",
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
    action_hard_plus: "Aumenta la durezza (TH)",
    action_phos_minus: "Riduce i fosfati",
    action_sequestrant: "Sequestrante metalli (rame/ferro)",
    legal_notices: "Note legali",
    lcen_title: "Note legali",
    lcen_editor: "Editore",
    lcen_editor_val: "Arnaud Goumain — Privato",
    lcen_host: "Hosting",
    lcen_host_val: "GitHub Inc. / Microsoft Corporation\n88 Colin P Kelly Jr St\nSan Francisco, CA 94107, USA",
    lcen_contact: "Contatto",
    lcen_contact_val: "support.poolgenai@gmail.com",
    lcen_cgu_title: "Termini di utilizzo",
    lcen_ai_title: "Intelligenza artificiale",
    lcen_ai_val: "Quando si utilizza l'analisi IA, i dati vengono trasmessi direttamente ad Anthropic o OpenAI tramite la chiave API personale dell'utente. L'editore non memorizza le chiavi e non ha accesso agli scambi.",
    lcen_photos_title: "Foto",
    lcen_photos_val: "Inviare solo foto di apparecchiature di misurazione o acqua della piscina. Esclusi: persone identificabili, elementi di localizzazione, dati personali visibili.",
    lcen_gdpr: "Dati personali",
    lcen_gdpr_val: "Ai sensi del RGPD, hai il diritto di accedere, rettificare, cancellare e trasferire i tuoi dati. Contattaci all'indirizzo sopra o presenta un reclamo all'autorità di protezione dei dati.",
    photo_warning_title: "Attenzione prima di fotografare",
    photo_warning_body: "Assicurati che la foto non contenga:\n• persone identificabili\n• elementi che possano localizzare la tua abitazione\n• dati personali visibili\n\nTi consigliamo di disattivare la geolocalizzazione nelle impostazioni della fotocamera.",
    photo_warning_confirm: "Ho capito, continua",
    ai_clause_title: "Analisi IA",
    ai_clause_body: "Quando attivi l'analisi IA, i tuoi dati vengono trasmessi direttamente ad Anthropic o OpenAI tramite la tua chiave API personale. PoolGenAI non memorizza la tua chiave.",
    cgu_update_title: "Termini aggiornati",
    cgu_update_body: "I termini di utilizzo sono stati aggiornati (v{version}). Per favore leggili e accettali per continuare.",
    cgu_update_accept: "Leggi e accetta",
    cgu_version_label: "Versione termini",
    cgu_accepted_on: "Accettato il",
    cgu_updated_title: "Termini aggiornati",
    cgu_updated_body: "I termini di utilizzo sono stati aggiornati. Si prega di rileggerli e accettarli.",
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
    report_locked: "Rapporto PDF riservato alla versione illimitata",
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
    diag_history_locked: "Storico diagnosi IA riservato alla versione illimitata",
    diag_history_confirm_delete: "Eliminare questa diagnosi?",
    update_required_title: "Nuova versione disponibile",
    update_required_desc: "È stata rilasciata una nuova versione di PoolGenAI. Aggiorna l'app per continuare.",
    update_required_btn: "Aggiorna ora",
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
    param_ph_long: "Potenziale di idrogeno", param_fcl_long: "Cloro libero", param_tcl_long: "Cloro totale",
    param_ccl_long: "Cloro combinato (cloroammine)", param_tac_long: "Alcalinità totale",
    param_cya_long: "Acido cianurico (stabilizzante)", param_th_long: "Durezza totale",
    param_phos_long: "Fosfati", param_cu_long: "Rame", param_fe_long: "Ferro", param_temp_long: "Temperatura acqua",
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
    data_request_error: "Invio non riuscito. Riprova o scrivi direttamente a support.poolgenai@gmail.com.",
    note_optional: "Nota (opzionale)",
    note_placeholder: "Acqua torbida, sole forte, nuoto previsto...",
    save_measure: "Salva misurazione",
    save: "Salva",
    cancel: "Annulla",
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
    wizard_title: "Piano di trattamento",
    wizard_step: "Passo",
    wizard_of: "di",
    wizard_now: "Adesso",
    wizard_in: "Tra",
    wizard_at: "alle",
    wizard_scheduled: "Previsto",
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
    treatment_skipped: "Passo saltato",
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
    paywall_title: "Passa all'illimitato",
    paywall_desc: "Misurazioni illimitate · Analisi IA strisce · Rapporto PDF · Gestione stock",
    ai_timer_hint: "El análisis puede tardar hasta 30 segundos.",
    ai_reliability: "Fiabilidad del análisis",
    ai_no_values: "Ningún valor legible en esta foto. Verifica la calidad y orientación de la imagen.",
    paywall_btn: "Attiva versione illimitata",
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
    pool_photo_locked: "Foto vasca riservate alla versione illimitata",
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
    user_not_found: "Nessun account con questa email. Se pensi sia un errore, contatta support.poolgenai@gmail.com",
    account_disabled: "Questo account è stato disattivato. Contatta support.poolgenai@gmail.com per maggiori informazioni.",
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
    prod_name_tac_plus: "Prodotto TAC+ (bicarbonato di sodio)",
    prod_name_calcium: "Cloruro di calcio (durezza +)",
    prod_name_anti_phos: "Anti-fosfati (tipo PHOSfree)",
    prod_name_sequestrant: "Sequestrante metalli (tipo Metal Free)",
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
    reco_no_product_note: "Nessun prodotto configurato per questa azione. Aggiungine uno nella scheda Prodotti.",
    product_empty_delete_confirm: "{name} è allo 0% di scorta. Rimuoverlo dalla lista?",
    reco_note_ph_before_tac: "pH corretto prima del TAC: a questo pH il cloro sarebbe poco efficace, e il TAC non è abbastanza basso da essere urgente.",
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
    unlimited_version: "Illimitato",
    active_pool: "Vasca attiva",
    pool_volume: "Volume vasca (m³)",
    treatment_params: "Parametri:",
    treatment_desc: "Il trattamento determina quali parametri vengono misurati e gli obiettivi raccomandati. Il volume viene usato per calcolare le dosi di prodotto.",
    subscription: "Abbonamento",
    unlimited_active: "Modalità illimitata attiva",
    free_mode: "Versione gratuita",
    api_section: "Chiave API (analisi IA)",
    ai_toggle_label: "Attiva analisi IA",
    ai_toggle_desc: "Permette di analizzare le foto di misura con intelligenza artificiale.",
    ai_password_title: "Accesso configurazione IA",
    ai_password_prompt: "Inserire la password per attivare l'analisi IA",
    ai_password_error: "Password errata",
    ai_configure_btn: "Configura chiave API",
    ai_config_title: "Configurazione IA",
    ai_config_back: "Torna alle impostazioni",
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
    action_hard_plus: "Aumentar dureza (TH)",
    action_phos_minus: "Reducir fosfatos",
    action_sequestrant: "Secuestrante de metales (cobre/hierro)",
    legal_notices: "Avisos legales",
    lcen_title: "Avisos legales",
    lcen_editor: "Editor",
    lcen_editor_val: "Arnaud Goumain — Particular",
    lcen_host: "Alojamiento",
    lcen_host_val: "GitHub Inc. / Microsoft Corporation\n88 Colin P Kelly Jr St\nSan Francisco, CA 94107, USA",
    lcen_contact: "Contacto",
    lcen_contact_val: "support.poolgenai@gmail.com",
    lcen_cgu_title: "Condiciones de uso",
    lcen_ai_title: "Inteligencia artificial",
    lcen_ai_val: "Al usar el análisis de IA, sus datos se transmiten directamente a Anthropic u OpenAI a través de su clave API personal. El editor no almacena las claves y no tiene acceso a los intercambios.",
    lcen_photos_title: "Fotos",
    lcen_photos_val: "Solo envíe fotos de equipos de medición o agua de la piscina. Excluidos: personas identificables, elementos de localización, datos personales visibles.",
    lcen_gdpr: "Datos personales",
    lcen_gdpr_val: "De acuerdo con el RGPD, tiene derecho a acceder, rectificar, suprimir y portar sus datos. Contáctenos en la dirección anterior o presente una reclamación ante la autoridad de protección de datos.",
    photo_warning_title: "Atención antes de fotografiar",
    photo_warning_body: "Asegúrese de que la foto no contenga:\n• personas identificables\n• elementos que puedan localizar su domicilio\n• datos personales visibles\n\nRecomendamos desactivar la geolocalización en los ajustes de la cámara.",
    photo_warning_confirm: "Entendido, continuar",
    ai_clause_title: "Análisis IA",
    ai_clause_body: "Al activar el análisis IA, sus datos se transmiten directamente a Anthropic u OpenAI a través de su clave API personal. PoolGenAI no almacena su clave.",
    cgu_update_title: "Términos actualizados",
    cgu_update_body: "Los términos de uso han sido actualizados (v{version}). Por favor léalos y acéptelos para continuar.",
    cgu_update_accept: "Leer y aceptar",
    cgu_version_label: "Versión términos",
    cgu_accepted_on: "Aceptado el",
    cgu_updated_title: "Términos actualizados",
    cgu_updated_body: "Los términos de uso han sido actualizados. Por favor léalos y acéptelos.",
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
    report_locked: "Informe PDF reservado para versión ilimitada",
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
    diag_history_locked: "Historial de diagnósticos IA reservado para la versión ilimitada",
    diag_history_confirm_delete: "¿Eliminar este diagnóstico?",
    update_required_title: "Nueva versión disponible",
    update_required_desc: "Se ha publicado una nueva versión de PoolGenAI. Actualiza la aplicación para continuar.",
    update_required_btn: "Actualizar ahora",
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
    param_ph_long: "Potencial de hidrógeno", param_fcl_long: "Cloro libre", param_tcl_long: "Cloro total",
    param_ccl_long: "Cloro combinado (cloraminas)", param_tac_long: "Alcalinidad total",
    param_cya_long: "Ácido cianúrico (estabilizador)", param_th_long: "Dureza total",
    param_phos_long: "Fosfatos", param_cu_long: "Cobre", param_fe_long: "Hierro", param_temp_long: "Temperatura del agua",
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
    data_request_error: "Error al enviar. Inténtalo de nuevo o escribe directamente a support.poolgenai@gmail.com.",
    note_optional: "Nota (opcional)",
    note_placeholder: "Agua turbia, sol fuerte, natación prevista...",
    save_measure: "Guardar medición",
    save: "Guardar",
    cancel: "Cancelar",
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
    wizard_title: "Plan de tratamiento",
    wizard_step: "Paso",
    wizard_of: "de",
    wizard_now: "Ahora",
    wizard_in: "En",
    wizard_at: "a las",
    wizard_scheduled: "Programado",
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
    treatment_skipped: "Paso omitido",
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
    paywall_title: "Pasar a ilimitado",
    ai_timer_hint: "A análise pode levar até 30 segundos.",
    ai_reliability: "Confiabilidade da análise",
    ai_no_values: "Nenhum valor legível nesta foto. Verifique a qualidade e orientação da imagem.",
    paywall_desc: "Mediciones ilimitadas · Análisis IA de tiras · Informe PDF · Gestión de stock",
    paywall_btn: "Activar versión ilimitada",
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
    pool_photo_locked: "Fotos de piscina reservadas para versión ilimitada",
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
    user_not_found: "No hay cuenta con este email. Si crees que es un error, contacta con support.poolgenai@gmail.com",
    account_disabled: "Esta cuenta ha sido desactivada. Contacta con support.poolgenai@gmail.com para más información.",
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
    prod_name_tac_plus: "Producto TAC+ (bicarbonato de sodio)",
    prod_name_calcium: "Cloruro de calcio (dureza +)",
    prod_name_anti_phos: "Anti-fosfatos (tipo PHOSfree)",
    prod_name_sequestrant: "Secuestrante de metales (tipo Metal Free)",
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
    reco_no_product_note: "No hay ningún producto configurado para esta acción. Añade uno en la pestaña Productos.",
    product_empty_delete_confirm: "{name} está al 0% de stock. ¿Eliminarlo de la lista?",
    reco_note_ph_before_tac: "pH corregido antes que el TAC: a este pH el cloro sería poco eficaz, y el TAC no está lo bastante bajo para ser urgente.",
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
    unlimited_version: "Ilimitado",
    active_pool: "Piscina activa",
    pool_volume: "Volumen piscina (m³)",
    treatment_params: "Parámetros:",
    treatment_desc: "El tratamiento determina qué parámetros se miden y los objetivos recomendados. El volumen se usa para calcular las dosis de producto.",
    subscription: "Suscripción",
    unlimited_active: "Modo ilimitado activo",
    free_mode: "Versión gratuita",
    api_section: "Clave API (análisis IA)",
    ai_toggle_label: "Activar análisis IA",
    ai_toggle_desc: "Permite analizar fotos de medición con inteligencia artificial.",
    ai_password_title: "Acceso configuración IA",
    ai_password_prompt: "Introducir contraseña para activar el análisis IA",
    ai_password_error: "Contraseña incorrecta",
    ai_configure_btn: "Configurar clave API",
    ai_config_title: "Configuración IA",
    ai_config_back: "Volver a ajustes",
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
    action_hard_plus: "Aumentar dureza (TH)",
    action_phos_minus: "Reduzir fosfatos",
    action_sequestrant: "Sequestrante de metais (cobre/ferro)",
    legal_notices: "Avisos legais",
    lcen_title: "Avisos legais",
    lcen_editor: "Editor",
    lcen_editor_val: "Arnaud Goumain — Particular",
    lcen_host: "Hospedagem",
    lcen_host_val: "GitHub Inc. / Microsoft Corporation\n88 Colin P Kelly Jr St\nSan Francisco, CA 94107, USA",
    lcen_contact: "Contato",
    lcen_contact_val: "support.poolgenai@gmail.com",
    lcen_cgu_title: "Termos de uso",
    lcen_ai_title: "Inteligência artificial",
    lcen_ai_val: "Ao usar a análise de IA, seus dados são transmitidos diretamente para Anthropic ou OpenAI através de sua chave API pessoal. O editor não armazena chaves e não tem acesso às trocas.",
    lcen_photos_title: "Fotos",
    lcen_photos_val: "Envie apenas fotos de equipamentos de medição ou água da piscina. Excluídos: pessoas identificáveis, elementos de localização, dados pessoais visíveis.",
    lcen_gdpr: "Dados pessoais",
    lcen_gdpr_val: "De acordo com o RGPD, você tem o direito de acessar, retificar, apagar e portar seus dados. Entre em contato conosco no endereço acima ou apresente uma reclamação à autoridade de proteção de dados.",
    photo_warning_title: "Atenção antes de fotografar",
    photo_warning_body: "Certifique-se de que a foto não contenha:\n• pessoas identificáveis\n• elementos que possam localizar sua residência\n• dados pessoais visíveis\n\nRecomendamos desativar a geolocalização nas configurações da câmera.",
    photo_warning_confirm: "Entendi, continuar",
    ai_clause_title: "Análise IA",
    ai_clause_body: "Ao ativar a análise IA, seus dados são transmitidos diretamente à Anthropic ou OpenAI via sua chave API pessoal. O PoolGenAI não armazena sua chave.",
    cgu_update_title: "Termos atualizados",
    cgu_update_body: "Os termos de uso foram atualizados (v{version}). Por favor leia e aceite-os para continuar.",
    cgu_update_accept: "Ler e aceitar",
    cgu_version_label: "Versão termos",
    cgu_accepted_on: "Aceito em",
    cgu_updated_title: "Termos atualizados",
    cgu_updated_body: "Os termos de uso foram atualizados. Por favor leia e aceite-os.",
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
    report_locked: "Relatório PDF reservado para versão ilimitada",
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
    diag_history_locked: "Histórico de diagnósticos IA reservado para a versão ilimitada",
    diag_history_confirm_delete: "Excluir este diagnóstico?",
    update_required_title: "Nova versão disponível",
    update_required_desc: "Uma nova versão do PoolGenAI foi lançada. Atualize o aplicativo para continuar.",
    update_required_btn: "Atualizar agora",
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
    param_ph_long: "Potencial de hidrogénio", param_fcl_long: "Cloro livre", param_tcl_long: "Cloro total",
    param_ccl_long: "Cloro combinado (cloraminas)", param_tac_long: "Alcalinidade total",
    param_cya_long: "Ácido cianúrico (estabilizador)", param_th_long: "Dureza total",
    param_phos_long: "Fosfatos", param_cu_long: "Cobre", param_fe_long: "Ferro", param_temp_long: "Temperatura da água",
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
    data_request_error: "Falha ao enviar. Tenta novamente ou escreve diretamente para support.poolgenai@gmail.com.",
    note_optional: "Nota (opcional)",
    note_placeholder: "Água turva, sol forte, natação prevista...",
    save_measure: "Salvar medição",
    save: "Guardar",
    cancel: "Cancelar",
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
    wizard_title: "Plano de tratamento",
    wizard_step: "Passo",
    wizard_of: "de",
    wizard_now: "Agora",
    wizard_in: "Em",
    wizard_at: "às",
    wizard_scheduled: "Previsto",
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
    treatment_skipped: "Passo ignorado",
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
    paywall_title: "Passar para ilimitado",
    paywall_desc: "Medições ilimitadas · Análise IA de tiras · Relatório PDF · Gestão de estoque",
    paywall_btn: "Ativar versão ilimitada",
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
    pool_photo_locked: "Fotos da piscina reservadas para versão ilimitada",
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
    user_not_found: "Nenhuma conta com este email. Se achas que é um erro, contacta support.poolgenai@gmail.com",
    account_disabled: "Esta conta foi desativada. Contacta support.poolgenai@gmail.com para mais informações.",
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
    prod_name_tac_plus: "Produto TAC+ (bicarbonato de sódio)",
    prod_name_calcium: "Cloreto de cálcio (dureza +)",
    prod_name_anti_phos: "Anti-fosfatos (tipo PHOSfree)",
    prod_name_sequestrant: "Sequestrador de metais (tipo Metal Free)",
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
    reco_no_product_note: "Nenhum produto configurado para esta ação. Adiciona um no separador Produtos.",
    product_empty_delete_confirm: "{name} está a 0% de stock. Remover da lista?",
    reco_note_ph_before_tac: "pH corrigido antes do TAC: a este pH o cloro seria pouco eficaz, e o TAC não está baixo o suficiente para ser urgente.",
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
    unlimited_version: "Ilimitado",
    active_pool: "Piscina ativa",
    pool_volume: "Volume piscina (m³)",
    treatment_params: "Parâmetros:",
    treatment_desc: "O tratamento determina quais parâmetros são medidos e os alvos recomendados. O volume é usado para calcular as doses de produto.",
    subscription: "Assinatura",
    unlimited_active: "Modo ilimitado ativo",
    free_mode: "Versão gratuita",
    api_section: "Chave API (análise IA)",
    ai_toggle_label: "Ativar análise IA",
    ai_toggle_desc: "Permite analisar fotos de medição com inteligência artificial.",
    ai_password_title: "Acesso configuração IA",
    ai_password_prompt: "Digite a senha para ativar a análise IA",
    ai_password_error: "Senha incorreta",
    ai_configure_btn: "Configurar chave API",
    ai_config_title: "Configuração IA",
    ai_config_back: "Voltar às configurações",
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
    { value: "hard+",            label: dict.action_hard_plus || "Monte la dureté (TH)" },
    { value: "phos-",            label: dict.action_phos_minus || "Réduit les phosphates" },
    { value: "sequestrant",      label: dict.action_sequestrant || "Séquestrant métaux (cuivre/fer)" },
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
  "hard+": 4,
  "phos-": 24,
  "sequestrant": 12,
};

// Ordre de base (utilisé quand aucune règle contextuelle ne s'applique)
const ACTION_PRIORITY = {
  "tac+": 1,
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
  const { tac, phVal, phTargetMax, combined } = ctx || {};
  const tacCritical = tac != null && !Number.isNaN(tac) && tac < 60;
  const needsPhMinus = phVal != null && phTargetMax != null && phVal > phTargetMax;
  const contaminationUrgent = combined != null && combined > 0.5;

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

// Redimensionne et recompresse une photo (dataURL) pour rester léger en stockage
// Firestore (documents limités à 1 Mo) tout en gardant assez de résolution pour
// la lecture (étiquette produit, bandelette...) et l'analyse IA.
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

async function callAIWithImage({ apiKey, apiProvider, prompt, imageDataUrl, uid: callerUid }) {
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
      ? await getFirebaseAuthHeader()
      : { "x-api-key": apiKey, "anthropic-dangerous-direct-browser-access": "true" };
    const uidHeaders = (apiKey.startsWith("http") && callerUid) ? { "x-uid": callerUid } : {};

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

async function callAIText({ apiKey, apiProvider, prompt, uid: callerUid }) {
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
      ? await getFirebaseAuthHeader()
      : { "x-api-key": apiKey, "anthropic-dangerous-direct-browser-access": "true" };
    const uidHeaders = (isProxy && callerUid) ? { "x-uid": callerUid } : {};

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
      throw new Error(err?.error?.message || `Erreur Anthropic ${response.status}`);
    }
    const data = await response.json();
    return (data.content || []).find((b) => b.type === "text")?.text || "";
  }
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
{"pH": nombre ou null, "fCl": nombre ou null, "tCl": nombre ou null, "ccl": nombre ou null, "tac": nombre ou null, "cya": nombre ou null, "hard": nombre ou null, "phos": nombre ou null, "copper": nombre ou null, "iron": nombre ou null, "temp": nombre ou null, "brome": nombre ou null, "o2": nombre ou null, "sel": nombre ou null, "confidence": "haute" ou "moyenne" ou "basse", "reliability": entier de 1 à 5 (1=très peu fiable, 5=très fiable), "reliability_reason": "une phrase en français expliquant la note de fiabilité (qualité image, lisibilité échelle, etc.)", "note": "une phrase en français sur la lisibilité et la méthode utilisée"}

Règles strictes :
- Pour un PHOTOMÈTRE : retourne les valeurs numériques exactes affichées à l'écran
- Pour une BANDELETTE : retourne une ESTIMATION de la valeur basée sur la comparaison des couleurs avec l'échelle du tube — une valeur approchée est préférable à null
- Les valeurs doivent être des nombres (pas des chaînes)
- null uniquement si le paramètre est vraiment impossible à lire ou absent de la bandelette
- JSON pur, rien d'autre`;

  const text = await callAIWithImage({ apiKey, apiProvider, prompt, imageDataUrl: dataUrl, uid: callerUid });
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Réponse IA non parseable : " + text.slice(0, 200));
  return JSON.parse(match[0]);
}

async function analyzeProductPhoto({ apiKey, apiProvider, dataUrl, uid: callerUid }) {
  const prompt = `Tu es un expert en chimie de l'eau de piscine. Analyse cette photo d'étiquette ou d'emballage d'un produit de traitement piscine (chlore, pH, sel, algicide, floculant, etc.).

Identifie sur l'étiquette :
- Le nom commercial du produit
- Son action principale (une seule valeur parmi : "ph-", "ph+", "chlore", "chlore-stabilise", "tac+", "brome", "o2", "sel", "hard+", "phos-", "sequestrant")
  - "chlore" = chlore choc/non stabilisé, "chlore-stabilise" = galets/pastilles au chlore stabilisé (contient de l'acide cyanurique/CYA)
- La dose conseillée par le fabricant et son unité (g, kg, ml ou L)
- L'effet annoncé sur le paramètre concerné pour un volume d'eau donné (ex : "20g augmente le pH de 0,1 pour 10m³") si l'information est visible
- Le délai d'attente avant baignade recommandé en heures, si indiqué
- La taille TOTALE du contenant/emballage tel que vendu (le poids ou volume net indiqué sur l'étiquette, ex : "5 kg", "25 kg", "1 L", "20 L") — c'est différent de la dose par traitement, c'est la quantité totale achetée

Réponds UNIQUEMENT en JSON valide, sans texte avant ou après, sans markdown :
{"name": "nom du produit ou null", "action": "une des valeurs listées ci-dessus ou null", "doseAmount": nombre ou null, "doseUnit": "g" ou "kg" ou "ml" ou "L" ou null, "effectAmount": nombre ou null, "effectPer": nombre de m³ ou null, "waitHours": nombre ou null, "containerAmount": nombre ou null, "containerUnit": "g" ou "kg" ou "ml" ou "L" ou null, "confidence": "haute" ou "moyenne" ou "basse", "note": "une phrase en français sur ce qui a été lu ou non sur l'étiquette"}

Règles strictes :
- null pour toute information absente ou illisible sur l'étiquette, ne devine jamais une valeur non présente
- Les nombres sont des nombres, jamais des chaînes
- JSON pur, rien d'autre`;

  const text = await callAIWithImage({ apiKey, apiProvider, prompt, imageDataUrl: dataUrl, uid: callerUid });
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
    const res = await fetch("https://poolgenai-proxy.support-poolgenai.workers.dev/send-verification-email", {
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
  saveMeasure: async (uid, measure) => {
    if (!window._fbDb || !window._fbSetDoc) return;
    const ref = window._fbDoc(window._fbDb, "users", uid, "measures", measure.id);
    await window._fbSetDoc(ref, measure);
  },
  deleteMeasure: async (uid, measureId) => {
    if (!window._fbDb || !window._fbDeleteDoc) return;
    const ref = window._fbDoc(window._fbDb, "users", uid, "measures", measureId);
    await window._fbDeleteDoc(ref);
  },
  getMeasures: async (uid) => {
    if (!window._fbDb || !window._fbGetDocs) return [];
    const col = window._fbCollection(window._fbDb, "users", uid, "measures");
    const snap = await window._fbGetDocs(col);
    return snap.docs.map(d => d.data());
  },
  onMeasures: (uid, cb) => {
    if (!window._fbDb || !window._fbOnSnapshot) return () => {};
    const col = window._fbCollection(window._fbDb, "users", uid, "measures");
    return window._fbOnSnapshot(col, (snap) => {
      cb(snap.docs.map(d => d.data()));
    });
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
  onApplications: (uid, cb) => {
    if (!window._fbDb || !window._fbOnSnapshot) return () => {};
    const col = window._fbCollection(window._fbDb, "users", uid, "applications");
    return window._fbOnSnapshot(col, (snap) => {
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
    const res = await fetch("https://poolgenai-proxy.support-poolgenai.workers.dev/account-data-request", {
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
  onConfig: (uid, cb) => {
    if (!window._fbDb || !window._fbOnSnapshot) return () => {};
    const ref = window._fbDoc(window._fbDb, "users", uid, "config", "main");
    return window._fbOnSnapshot(ref, (snap) => {
      if (snap.exists()) cb(snap.data());
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
        // onAuthStateChanged se déclenchera et appellera onSuccess via PoolApp
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
      fr: `CONDITIONS GÉNÉRALES D'UTILISATION — POOLGENAI CGU v1.1
Éditeur : Arnaud Goumain — Particulier
Contact : support.poolgenai@gmail.com
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
Lorsque l'utilisateur active la fonctionnalité d'analyse par intelligence artificielle, les données saisies (valeurs de mesure et photos) sont transmises directement au fournisseur d'IA dont l'utilisateur a fourni la clé API personnelle (Anthropic ou OpenAI). Cette transmission s'effectue de façon directe entre l'appareil de l'utilisateur et le serveur du fournisseur, sous la seule responsabilité de l'utilisateur. L'éditeur de PoolGenAI ne stocke pas les clés API et n'a pas accès aux échanges entre l'utilisateur et le fournisseur d'IA. L'utilisateur est invité à consulter les conditions d'utilisation de son fournisseur d'IA avant d'activer cette fonctionnalité.

6. PHOTOS ET DONNÉES PERSONNELLES
L'utilisateur s'engage à ne soumettre à l'analyse par intelligence artificielle que des photos du matériel de mesure (photomètre, bandelettes) ou de l'eau du bassin. Sont strictement exclus : toute image permettant d'identifier des personnes, de localiser un domicile (façade, plaque d'immatriculation, rue visible) ou contenant des données personnelles visibles. L'éditeur décline toute responsabilité quant au contenu des photos soumises par l'utilisateur.

7. USAGE RÉSERVÉ
L'utilisation de PoolGenAI est réservée aux traitements d'eau de bassins de type piscine ou spa. Tout autre usage est exclu de la présente licence.

8. PROFESSIONNELS
Les professionnels utilisant PoolGenAI pour des prestations réalisées pour le compte de tiers sont tenus d'informer les propriétaires des bassins traités des conditions du présent document et d'obtenir leur accord exprès avant toute collecte de données les concernant.

9. DONNÉES PERSONNELLES ET RGPD
Conformément au RGPD et à la loi Informatique et Libertés, l'utilisateur dispose d'un droit d'accès, de rectification, d'effacement et de portabilité de ses données. Pour exercer ces droits ou déposer une réclamation, l'utilisateur peut contacter l'éditeur à support.poolgenai@gmail.com ou s'adresser à la CNIL : www.cnil.fr

10. ABSENCE DE GARANTIE
L'application est fournie "en l'état", sans garantie d'aucune sorte, expresse ou implicite, quant à son exactitude, sa fiabilité ou son adéquation à un usage particulier.

En créant un compte, l'utilisateur reconnaît avoir pris connaissance de l'intégralité du présent document (CGU v1.1) et en accepte les termes.`,
      en: `TERMS OF USE — POOLGENAI CGU v1.1
Publisher: Arnaud Goumain — Private individual
Contact: [see Settings > Legal notices]
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
When the user activates the artificial intelligence analysis feature, the data entered (measurement values and photos) are transmitted directly to the AI provider whose personal API key the user has provided (Anthropic or OpenAI). This transmission occurs directly between the user's device and the provider's server, under the user's sole responsibility. The PoolGenAI publisher does not store API keys and has no access to exchanges between the user and the AI provider. The user is invited to consult their AI provider's terms of use before activating this feature.

6. PHOTOS AND PERSONAL DATA
The user undertakes to submit to AI analysis only photos of measuring equipment (photometer, test strips) or pool water. Strictly excluded are: any image that could identify persons, locate a residence (facade, license plate, visible street) or contain visible personal data. The publisher accepts no liability for the content of photos submitted by the user.

7. PERMITTED USE
Use of PoolGenAI is reserved for water treatment of pool or spa type basins. Any other use is excluded from this licence.

8. PROFESSIONALS
Professionals using PoolGenAI for services performed on behalf of third parties must inform the owners of treated pools of the terms of this document and obtain their express agreement before any collection of data concerning them.

9. PERSONAL DATA AND GDPR
In accordance with the GDPR and the French Data Protection Act, users have the right to access, rectify, erase and port their data. To exercise these rights or lodge a complaint, users may contact the publisher via Settings > Legal notices, or contact the CNIL: www.cnil.fr

10. NO WARRANTY
The application is provided "as is" without warranty of any kind, express or implied, as to its accuracy, reliability or fitness for a particular purpose.

By creating an account, the user acknowledges having read this document in full (Terms v1.1) and accepts its terms.`,
    };
    const text = disclaimerText[detectedLang || lang] || disclaimerText.en;
    return (
      <div style={{ minHeight: "100vh", background: "#eaf4fb", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div style={{ width: "100%", maxWidth: 480, background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 4px 24px #0a6ebd18", maxHeight: "90dvh", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#0d2b4e" }}>{tDisc("disclaimer_title")}</div>
            <button onClick={() => setMode("signup")} style={{ background: "none", border: "none", cursor: "pointer", color: "#6a7d90" }}><X size={20} /></button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", fontSize: 12, color: "#2d4a6e", lineHeight: 1.7, whiteSpace: "pre-wrap", background: "#f5f8fc", borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
            {text}
          </div>
          <button
            style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: "#0a6ebd", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
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
        <div style={{ width: "100%", maxWidth: 380, background: "#fff", borderRadius: 20, padding: 32, boxShadow: "0 4px 24px #0a6ebd18", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#e8f8ef", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <CheckCircle2 size={28} color="#1a8fd1" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#0d2b4e", marginBottom: 8 }}>{t("account_created")}</div>
          <div style={{ fontSize: 13, color: "#6a7d90", marginBottom: 12 }}>{t("account_created_sub")}</div>
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
              style={{ width: "100%", padding: "11px 0", borderRadius: 12, border: "1.5px solid #0a6ebd", background: "#fff", color: "#0a6ebd", fontWeight: 600, fontSize: 13.5, cursor: resendBusy ? "default" : "pointer", marginBottom: 14 }}
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
          <div style={{ fontSize: 22, fontWeight: 800, color: "#0d2b4e" }}>PoolGenAI</div>
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
            <FieldLabel required style={{ fontSize: 12, fontWeight: 600, color: "#4a6480", display: "block", marginBottom: 4 }}>Email</FieldLabel>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #d0e4f5", fontSize: 14, marginBottom: 10, boxSizing: "border-box" }}
              placeholder="votre@email.com"
              onKeyDown={e => e.key === "Enter" && mode !== "signup" && handleSubmit()}
            />

            {mode !== "reset" && (
              <>
                <FieldLabel required style={{ fontSize: 12, fontWeight: 600, color: "#4a6480", display: "block", marginBottom: 4 }}>{t("password")}</FieldLabel>
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
                <FieldLabel required style={{ fontSize: 12, fontWeight: 600, color: "#4a6480", display: "block", marginBottom: 4 }}>{t("confirm_password")}</FieldLabel>
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
                    style={{ marginTop: 2, accentColor: "#0a6ebd", width: 16, height: 16, flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 12, color: "#0d2b4e", lineHeight: 1.5 }}>
                    <strong>{t("disclaimer_cgu")}</strong>
                    {" "}<span
                      style={{ color: "#0a6ebd", textDecoration: "underline", cursor: "pointer" }}
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
                    style={{ marginTop: 2, accentColor: "#0a6ebd", width: 16, height: 16, flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 12, color: "#4a6480", lineHeight: 1.5 }}>
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
                    style={{ marginTop: 6, background: "none", border: "none", color: "#0a6ebd", fontSize: 12.5, fontWeight: 600, cursor: "pointer", padding: 0, textDecoration: "underline" }}
                  >
                    {t("create_account_hint")}
                  </button>
                )}
                {showResetHint && (
                  <button
                    type="button"
                    onClick={() => { setMode("reset"); setError(""); setShowResetHint(false); }}
                    style={{ marginTop: 6, background: "none", border: "none", color: "#0a6ebd", fontSize: 12.5, fontWeight: 600, cursor: "pointer", padding: 0, textDecoration: "underline" }}
                  >
                    {t("reset_password_hint")}
                  </button>
                )}
              </div>
            )}
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

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "#d0d8e0" }}>v{APP_VERSION}</div>
        </div>
      </div>
    </div>
  );
}


function PoolApp() {
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
    fetch("https://poolgenai-proxy.support-poolgenai.workers.dev/verify-email", {
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
  const [activePlan, setActivePlan] = useState(null); // { measureId, steps: [{...rec, appliedAt, skipped, scheduledAt}], currentStepIdx }
  const [showWizard, setShowWizard] = useState(false);
  const [showPhotoWarning, setShowPhotoWarning] = useState(false);
  const [photoWarningCallback, setPhotoWarningCallback] = useState(null);
  const [gdprConsent, setGdprConsent] = useState(false);
  const [dataConsent, setDataConsent] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [acceptedCguVersion, setAcceptedCguVersion] = useState(null);
  const [cguAcceptedDate, setCguAcceptedDate] = useState(null);
  const [showCguUpdate, setShowCguUpdate] = useState(false);
  const detectedLang = (() => {
    const nav = (navigator.language || navigator.userLanguage || "fr").toLowerCase().slice(0, 2);
    return ["fr","en","de","it","es","pt"].includes(nav) ? nav : "fr";
  })();
  const [validatingSelectedRecs, setValidatingSelectedRecs] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [apiKey, setApiKey] = useState("https://poolgenai-proxy.support-poolgenai.workers.dev");
  const [apiProvider, setApiProvider] = useState("anthropic"); // "anthropic" | "openai"
  const [aiEnabled, setAiEnabled] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);
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
    const [ms, apps, diags] = await Promise.all([
      FB.getMeasures(uid).catch(() => []),
      FB.getApplications(uid).catch(() => []),
      FB.getDiagnostics(uid).catch(() => []),
    ]);
    await Promise.all([
      ...ms.map((m) => FB.deleteMeasure(uid, m.id).catch(() => {})),
      ...apps.map((a) => FB.deleteApplication(uid, a.measureId).catch(() => {})),
      ...diags.map((d) => FB.deleteDiagnostic(uid, d.id).catch(() => {})),
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
    setActivePlan(null);
    setIsPremium(false);
    setAiEnabled(false);
    setGdprConsent(false);
    setDataConsent(false);
    setAcceptedCguVersion(null);
    setCguAcceptedDate(null);
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
      setActivePlan(null);
      await FB.saveConfig(uid, { pools: resetPools, isPremium: false, activePlan: null });
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
  function syncConfig(partial, errorKey) {
    if (!authUser?.uid || !FB.ready() || teardownRef.current) return;
    syncPendingRef.current = { ...syncPendingRef.current, ...partial };
    if (syncDebounceRef.current) clearTimeout(syncDebounceRef.current);
    syncDebounceRef.current = setTimeout(() => {
      const toSend = syncPendingRef.current;
      syncPendingRef.current = {};
      syncDebounceRef.current = null;
      FB.saveConfig(authUser.uid, toSend).catch((e) => {
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
  const firestoreUnsubRef = useRef(null);
  const cloudConfigReceivedRef = useRef(false);
  const [cloudConfigReceived, setCloudConfigReceived] = useState(false);
  useEffect(() => {
    if (!authUser?.uid || !FB.ready() || !window._fbOnSnapshot) return;
    const uid = authUser.uid;
    cloudConfigReceivedRef.current = false;
    setCloudConfigReceived(false);

    // Nettoyage abonnements précédents
    if (firestoreUnsubRef.current) {
      firestoreUnsubRef.current.forEach(fn => fn());
    }

    const unsubMeasures = FB.onMeasures(uid, (cloudMeasures) => {
      if (cloudMeasures.length > 0) {
        setMeasures((prev) => (deepEqual(prev, cloudMeasures) ? prev : cloudMeasures));
        window.storage.set(STORAGE_KEYS.measures, JSON.stringify(cloudMeasures)).catch(() => {});
      }
    });

    const unsubApplications = FB.onApplications(uid, (cloudApps) => {
      if (cloudApps.length > 0) {
        setApplications((prev) => (deepEqual(prev, cloudApps) ? prev : cloudApps));
        window.storage.set(STORAGE_KEYS.applications, JSON.stringify(cloudApps)).catch(() => {});
      }
    });

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
        setProducts((prev) => (deepEqual(prev, config.products) ? prev : config.products));
        window.storage.set(STORAGE_KEYS.products, JSON.stringify(config.products)).catch(() => {});
      }
      if (config.activePlan !== undefined) {
        setActivePlan((prev) => (deepEqual(prev, config.activePlan) ? prev : config.activePlan));
        window.storage.set(STORAGE_KEYS.activePlan, JSON.stringify(config.activePlan)).catch(() => {});
      }
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
      if (config.apiProvider) {
        setApiProvider((prev) => (prev === config.apiProvider ? prev : config.apiProvider));
        window.storage.set(STORAGE_KEYS.apiProvider, JSON.stringify(config.apiProvider)).catch(() => {});
      }
    });

    firestoreUnsubRef.current = [unsubMeasures, unsubApplications, unsubConfig];
    return () => {
      unsubMeasures();
      unsubApplications();
      unsubConfig();
    };
  }, [authUser?.uid]);

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
        loadedMeasures.forEach(m => FB.saveMeasure(authUser.uid, m).catch(() => {}));
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
        if (pl2?.value) { try { setActivePlan(JSON.parse(pl2.value)); } catch(e){} }
        const gc = await window.storage.get(STORAGE_KEYS.gdprConsent);
        if (gc?.value === "true") setGdprConsent(true);
        const dc = await window.storage.get(STORAGE_KEYS.dataConsent);
        if (dc?.value === "true") setDataConsent(true);
        const cv = await window.storage.get(STORAGE_KEYS.cguVersion);
        if (cv?.value) {
          setAcceptedCguVersion(cv.value);
          if (cv.value < CGU_VERSION) setShowCguUpdate(true);
        }
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
        // Toujours forcer l'URL proxy officielle — ignore toute valeur stockée en IndexedDB
        const FORCED_PROXY = "https://poolgenai-proxy.support-poolgenai.workers.dev";
        setApiKey(FORCED_PROXY);
        window.storage.set(STORAGE_KEYS.apiKey, JSON.stringify(FORCED_PROXY)).catch(() => {});
        const aie = await window.storage.get(STORAGE_KEYS.aiEnabled);
        if (aie?.value === "true") setAiEnabled(true);
      } catch (e) {}
      try {
        const aprov = await window.storage.get(STORAGE_KEYS.apiProvider);
        if (aprov?.value) setApiProvider(JSON.parse(aprov.value));
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
            FB.saveConfig(authUser.uid, {
              pools: loadedPools,
              products: loadedProducts || [],
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
    window.storage.set(STORAGE_KEYS.activePlan, JSON.stringify(activePlan)).catch(() => {});
  }, [activePlan, loaded]);

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
  const activePools = useMemo(() => pools.filter((p) => !p.disabled), [pools]);

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
  const blockedByLimit = !isPremium && hasMeasureToday(visibleMeasuresForLimit);

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

  function addMeasure(entry) {
    if (entry.id) {
      setMeasures((prev) => {
        const updated = prev.map((m) => (m.id === entry.id ? { ...m, ...entry } : m));
        if (authUser?.uid) updated.forEach(m => { if (m.id === entry.id) FB.saveMeasure(authUser.uid, m).catch(() => {}); });
        return updated;
      });
      track("measure_edit");
    } else {
      const newMeasure = { id: uid(), poolId: activePoolId, ...entry };
      setMeasures((prev) => [...prev, newMeasure]);
      if (authUser?.uid) FB.saveMeasure(authUser.uid, newMeasure).catch(() => {});
      track("measure_add", { has_photos: !!(entry.photos?.length || entry.photo), has_pool_photos: !!(entry.poolPhotos?.length) });
    }
    setShowAddMeasure(false);
    setEditingMeasure(null);
  }

  function deleteMeasure(id) {
    setMeasures((prev) => prev.filter((m) => m.id !== id));
    if (authUser?.uid) FB.deleteMeasure(authUser.uid, id).catch(() => {});
  }

  function deleteAllMeasuresForActivePool() {
    setMeasures((prev) => prev.filter((m) => (m.poolId || "default") !== activePoolId));
  }

  // Détecte les mesures/applications/produits dont le poolId ne correspond à
  // aucun bassin existant (ex: après un bug de synchro ayant fait perdre l'ID
  // d'origine du bassin — voir v1.25.1).
  const orphanedCount = useMemo(() => {
    if (!pools.length) return 0;
    const poolIds = new Set(pools.map((p) => p.id));
    const orphanMeasures = measures.filter((m) => !poolIds.has(m.poolId || "default")).length;
    const orphanApps = applications.filter((a) => !poolIds.has(a.poolId || "default")).length;
    const orphanProducts = products.filter((p) => !poolIds.has(p.poolId || "default")).length;
    return orphanMeasures + orphanApps + orphanProducts;
  }, [pools, measures, applications, products]);

  async function repairOrphanedData() {
    if (!pools.length) return;
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
      };
      if (authUser?.uid) FB.saveApplication(authUser.uid, newApp).catch(() => {});
      return [...withoutThisMeasure, newApp];
    });
    setValidatingMeasure(null);
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
    const recalcSteps = newSteps.map((s, i) => {
      if (i < stepIdx) return s;
      if (i === stepIdx) { lastApplied = new Date(now); return s; }
      const scheduled = new Date(lastApplied.getTime() + (newSteps[i-1]?.waitHours || 0) * 3600 * 1000);
      lastApplied = scheduled;
      return { ...s, scheduledAt: scheduled.toISOString() };
    });
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

  // v1.29.6 — Le démarrage du plan exige maintenant isPremium ET manageStock
  // activé (pas seulement isPremium). Un utilisateur premium qui n'a pas activé
  // la gestion de stock retombe aussi sur le paywall.
  function handleValidateApplication(m, recsOverride, selectedRecsOverride, adjustMode) {
    if (!isPremium || !activePool?.manageStock) {
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
    if (!loaded || !authUser?.uid) return;
    if (pools.length === 0 && !cloudConfigReceivedRef.current) return;
    syncConfig({ pools });
  }, [pools]);

  useEffect(() => {
    if (!loaded || !authUser?.uid) return;
    if (!FB.ready()) return;
    if (products.length === 0 && !cloudConfigReceivedRef.current) return;
    syncConfig({ products }, "product_sync_error");
  }, [products]);

  useEffect(() => {
    if (!loaded || !authUser?.uid) return;
    syncConfig({ activePlan });
  }, [activePlan]);

  useEffect(() => {
    if (!loaded || !authUser?.uid) return;
    syncConfig({ isPremium });
  }, [isPremium]);

  useEffect(() => {
    if (!loaded || !authUser?.uid) return;
    syncConfig({ lang });
  }, [lang]);

  useEffect(() => {
    if (!loaded || !authUser?.uid) return;
    syncConfig({ aiEnabled });
  }, [aiEnabled]);

  useEffect(() => {
    if (!loaded || !authUser?.uid) return;
    syncConfig({ apiProvider });
  }, [apiProvider]);

  // v1.29.3 — Fix : le plan de traitement n'affichait plus les quantités.
  // Cause : quand aucun bassin actif valide n'existe au moment de la création
  // (écran forcé après réactivation de compte ou désactivation du dernier
  // bassin, activePoolId vide), le nouveau bassin ne récupérait aucun produit
  // par duplication. computeRecommendations ne trouvait alors jamais de
  // produit correspondant et retombait sur "produit manquant" au lieu de la
  // quantité — quel que soit le statut premium ou la gestion de stock.
  function addPool(pool) {
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

  function updatePool(id, updates) {
    setPools((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }

  // v1.28.0 — Soft delete : le bassin n'est plus retiré, il est marqué désactivé.
  // Measures/applications/products restent rattachées à son poolId, intactes en
  // base (exploitables pour des stats), et ne redeviennent jamais orphelines
  // puisque l'id du bassin reste présent dans `pools`. Seul l'affichage (via
  // `activePools`) le masque à l'utilisateur. Si c'était le dernier bassin actif,
  // aucune recréation automatique : l'écran "créer un bassin" (forced) prend le relais.
  function deletePool(id) {
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
    setShowAddPool(true);
  }

  return (
    <>
    {verifyLinkStatus && (
      <div style={{ position: "fixed", inset: 0, zIndex: 3200, background: "rgba(10,30,60,0.94)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: 28, maxWidth: 380, width: "100%", textAlign: "center", boxShadow: "0 8px 32px #0a6ebd33" }}>
          {verifyLinkStatus === "verifying" ? (
            <>
              <Loader2 size={34} className="spin" style={{ marginBottom: 10, color: "#0a6ebd" }} />
              <div style={{ fontSize: 14, color: "#4a6480" }}>{t("verify_link_checking")}</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 34, marginBottom: 10 }}>
                {verifyLinkStatus === "verified" || verifyLinkStatus === "already_verified" ? "✅" : "⚠️"}
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#0d2b4e", marginBottom: 8 }}>
                {t(`verify_link_${verifyLinkStatus}_title`)}
              </div>
              <div style={{ fontSize: 13.5, color: "#4a6480", marginBottom: 18, lineHeight: 1.5 }}>
                {t(`verify_link_${verifyLinkStatus}_desc`)}
              </div>
              <button
                onClick={() => setVerifyLinkStatus(null)}
                style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: "#0a6ebd", color: "#fff", fontWeight: 700, fontSize: 14.5, cursor: "pointer" }}
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
        <div style={{ background: "#fff", borderRadius: 20, padding: 28, maxWidth: 380, width: "100%", textAlign: "center", boxShadow: "0 8px 32px #0a6ebd33" }}>
          <div style={{ fontSize: 34, marginBottom: 10 }}>🔄</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "#0d2b4e", marginBottom: 8 }}>{t("update_required_title")}</div>
          <div style={{ fontSize: 13.5, color: "#4a6480", marginBottom: 20, lineHeight: 1.5 }}>{t("update_required_desc")}</div>
          <button
            onClick={forceReloadApp}
            style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: "#0a6ebd", color: "#fff", fontWeight: 700, fontSize: 14.5, cursor: "pointer" }}
          >
            {t("update_required_btn")}
          </button>
        </div>
      </div>
    )}
    {needsEmailVerification && !forceUpdate && (
      <div style={{ position: "fixed", inset: 0, zIndex: 3050, background: "rgba(10,60,50,0.94)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: 28, maxWidth: 380, width: "100%", textAlign: "center", boxShadow: "0 8px 32px #00000033" }}>
          <div style={{ fontSize: 34, marginBottom: 10 }}>📧</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "#0d2b4e", marginBottom: 8 }}>{t("verify_gate_title")}</div>
          <div style={{ fontSize: 13.5, color: "#4a6480", marginBottom: 18, lineHeight: 1.5 }}>
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
            style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: "#0a6ebd", color: "#fff", fontWeight: 700, fontSize: 14.5, cursor: verifyChecking ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}
          >
            {verifyChecking ? <Loader2 size={16} className="spin" /> : null}
            {verifyChecking ? t("verify_gate_checking") : t("verify_gate_check_btn")}
          </button>
          <button
            onClick={handleResendVerification}
            disabled={verifySending}
            style={{ width: "100%", padding: "11px 0", borderRadius: 12, border: "1.5px solid #d0e4f5", background: "#fff", color: "#0a6ebd", fontWeight: 600, fontSize: 13.5, cursor: verifySending ? "default" : "pointer", marginBottom: 14 }}
          >
            {verifySending ? "..." : t("verify_gate_resend_btn")}
          </button>
          <button
            onClick={handleSignOutFromVerification}
            style={{ background: "none", border: "none", color: "#6a7d90", fontSize: 12.5, cursor: "pointer" }}
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
          <div style={{ fontSize: 17, fontWeight: 800, color: "#0d2b4e", marginBottom: 8 }}>{t("suspended_title")}</div>
          <div style={{ fontSize: 13.5, color: "#4a6480", marginBottom: suspendReason ? 8 : 20, lineHeight: 1.5 }}>{t("suspended_desc")}</div>
          {suspendReason && (
            <div style={{ fontSize: 12.5, color: "#6a7d90", marginBottom: 20, fontStyle: "italic", background: "#f5f7fa", borderRadius: 8, padding: "8px 10px" }}>
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
          <div style={{ fontSize: 17, fontWeight: 800, color: "#0d2b4e", marginBottom: 8 }}>{t("account_deleted_title")}</div>
          <div style={{ fontSize: 13.5, color: "#4a6480", marginBottom: 20, lineHeight: 1.5 }}>{t("account_deleted_desc")}</div>
          <button
            onClick={() => {
              if (window.confirm(t("reactivate_confirm"))) reactivateAccount();
            }}
            disabled={reactivating}
            style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: reactivating ? "#7ab8e8" : "#0a6ebd", color: "#fff", fontWeight: 700, fontSize: 14.5, cursor: reactivating ? "default" : "pointer", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            {reactivating ? <Loader2 size={16} className="spin" /> : null}
            {t("reactivate_btn")}
          </button>
          <button
            onClick={() => setShowDataRequestScreen(true)}
            style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "1.5px solid #0a6ebd", background: "#fff", color: "#0a6ebd", fontWeight: 700, fontSize: 14.5, cursor: "pointer", marginBottom: 14 }}
          >
            {t("account_deleted_request_btn")}
          </button>
          <button
            onClick={handleSignOut}
            style={{ background: "none", border: "none", color: "#6a7d90", fontWeight: 600, fontSize: 13, cursor: "pointer", textDecoration: "underline" }}
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
    {loaded && authUser && !suspended && !accountDeleted && !forceUpdate && !needsEmailVerification && activePools.length === 0 && cloudConfigReceived && (
      <AddPoolModal forced onSave={addPool} lang={lang} />
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
    <div style={styles.app} className="app">
      <Header
        poolName={activePool?.name}
        location={activePool?.location}
        poolPhoto={activePool?.photo}
        isPremium={isPremium}
        pools={activePools}
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
            apiKey={aiEnabled && isPremium ? apiKey : ""}
            apiProvider={apiProvider}
            recentMeasures={sortedMeasures}
            effectiveTargets={effectiveTargets}
            activeParamKeys={activeParamKeys}
            activePlan={activePlan}
            onResumePlan={() => setShowWizard(true)}
            authUid={authUser?.uid}
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
              setShowAddMeasure(true);
            }}
            onValidateApplication={handleValidateApplication}
            applications={poolApplications}
            isPremium={isPremium}
            poolName={activePool?.name}
            onGenerateReport={() => setShowReport(true)}
            onWantPremiumForReport={() => openPaywall()}
            lang={lang}
            apiKey={aiEnabled && isPremium ? apiKey : ""}
            apiProvider={apiProvider}
            authUid={authUser?.uid}
            pool={activePool}
            activePlan={activePlan}
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
            pools={activePools}
            activePoolId={activePoolId}
            onUpdatePool={updatePool}
            onDeletePool={deletePool}
            onSwitchPool={setActivePoolId}
            onWantAddPool={handleWantAddPool}
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
            onWantPremiumForReport={() => openPaywall()}
            onWantPremium={() => openPaywall()}
            isPremium={isPremium}
            setIsPremium={setIsPremium}
            apiKey={apiKey}
            setApiKey={setApiKey}
            apiProvider={apiProvider}
            setApiProvider={setApiProvider}
            aiEnabled={aiEnabled}
            setAiEnabled={setAiEnabled}
            lang={lang}
            setLang={setLang}
            cguAcceptedDate={cguAcceptedDate}
            dataConsent={dataConsent}
            onRevokeDataConsent={() => {
              setDataConsent(false);
              if (authUser?.uid) {
                FB.saveUser(authUser.uid, { dataConsent: false, dataConsentDate: null }).catch(() => {});
              }
            }}
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
          onRequestPhotoAccess={(cb) => {
            setPhotoWarningCallback(() => cb);
            setShowPhotoWarning(true);
          }}
          onWantPremium={() => {
            setShowAddMeasure(false);
            setEditingMeasure(null);
            openPaywall();
          }}
          apiKey={aiEnabled && isPremium ? apiKey : ""}
          apiProvider={apiProvider}
          activeParamKeys={activeParamKeys}
          lang={lang}
          authUid={authUser?.uid}
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
          aiEnabled={aiEnabled}
          apiKey={aiEnabled && isPremium ? apiKey : ""}
          apiProvider={apiProvider}
          authUid={authUser?.uid}
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
            setApiKey("https://poolgenai-proxy.support-poolgenai.workers.dev");
            // v1.29.7 — À l'activation du mode illimité (test), la gestion de stock
            // s'active par défaut sur le bassin actif, mais la liste des produits EN
            // STOCK part vide : on garde les produits (nom, dosage — nécessaires au
            // calcul des quantités du plan de traitement), on remet juste leur
            // pourcentage de stock à 0. Force une saisie réelle du stock au lieu de
            // partir sur les 100% par défaut des produits pré-remplis.
            if (activePool) {
              updatePool(activePool.id, { manageStock: true });
              setProducts((prev) =>
                prev.map((p) =>
                  (p.poolId || "default") === activePool.id ? { ...p, stockPercent: 0 } : p
                )
              );
            }
            setShowPaywall(false);
          }}
        />
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
          <div style={{ background: "#fff", borderRadius: 20, padding: 24, maxWidth: 420, width: "100%", boxShadow: "0 8px 32px #0a6ebd22" }}>
            <div style={{ fontSize: 28, textAlign: "center", marginBottom: 8 }}>📸</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#0d2b4e", textAlign: "center", marginBottom: 12 }}>
              {tFn("photo_warning_title")}
            </div>
            <div style={{ fontSize: 13, color: "#4a6480", lineHeight: 1.7, background: "#f5f8fc", borderRadius: 10, padding: "12px 14px", marginBottom: 16, whiteSpace: "pre-line" }}>
              {tFn("photo_warning_body")}
            </div>
            <button
              style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: "#0a6ebd", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
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

      {/* Modale re-acceptation CGU si nouvelle version */}
      {showCguUpdate && !showLogin && (
        <div style={{ position: "fixed", inset: 0, zIndex: 900, background: "rgba(10,30,60,0.8)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 24, maxWidth: 440, width: "100%", boxShadow: "0 8px 32px #0a6ebd22" }}>
            <div style={{ fontSize: 24, textAlign: "center", marginBottom: 8 }}>📋</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#0d2b4e", textAlign: "center", marginBottom: 8 }}>
              {tFn("cgu_updated_title")}
            </div>
            <div style={{ fontSize: 13, color: "#4a6480", lineHeight: 1.6, marginBottom: 16, textAlign: "center" }}>
              {tFn("cgu_updated_body")}
            </div>
            <div style={{ fontSize: 11, color: "#9ab0c4", textAlign: "center", marginBottom: 16 }}>
              CGU {CGU_VERSION}
            </div>
            <button
              style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: "#0a6ebd", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
              onClick={() => {
                setAcceptedCguVersion(CGU_VERSION);
                setCguAcceptedDate(new Date().toISOString());
                setShowCguUpdate(false);
                if (authUser?.uid) {
                  FB.saveUser(authUser.uid, { cguVersion: CGU_VERSION, cguAcceptedDate: new Date().toISOString() }).catch(() => {});
                }
              }}
            >
              {tFn("disclaimer_cgu")}
            </button>
          </div>
        </div>
      )}

      {showWizard && activePlan && isPremium && (
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

      {showReport && isPremium && (
        <ReportView
          pool={activePool}
          measures={poolMeasures}
          applications={poolApplications}
          products={poolProducts}
          onClose={() => setShowReport(false)}
          manageStock={!!activePool?.manageStock}
          lang={lang}
          authUid={authUser?.uid}
          isPremium={isPremium}
        />
      )}

      {lightboxSrc && (
        <PhotoLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}
    </div>
    </>
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
    <div style={{ width: "100%", flexShrink: 0 }}>
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
    </div>
  );
}

// ---------- Dashboard ----------
function Dashboard({ latest, volume, products, manageStock, onAddMeasure, onEditMeasure, onValidateApplication, applicationForLatest, blockedByLimit, isPremium, onWantPremium, apiKey, apiProvider, recentMeasures, effectiveTargets, activeParamKeys, lang, activePlan, onResumePlan, authUid }) {
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
          <img
            src={latest.photo}
            alt="Photo de la mesure"
            style={{ ...styles.measurePhoto, cursor: "zoom-in" }}
            onClick={() => window._openLightbox?.(latest.photo)}
          />
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
          {recs.map((r, i) => {
            const planForLatest = activePlan && latest && activePlan.measureId === latest.id ? activePlan : null;
            return (
              <RecoCard
                key={i}
                reco={r}
                isLast={i === recs.length - 1}
                selectable={!applicationForLatest && !planForLatest}
                selected={!!selectedRecs[i]}
                onToggle={() => setSelectedRecs((prev) => ({ ...prev, [i]: !prev[i] }))}
                manageStock={manageStock}
                products={products}
                lang={lang}
              />
            );
          })}

          {(() => {
            const planForLatest = activePlan && latest && activePlan.measureId === latest.id ? activePlan : null;
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
  const tac = parseFloat(latestLower.tac);
  if (has("tac") && !Number.isNaN(tac) && targetsLower.tac && tac < targetsLower.tac.min) {
    const prod = findProduct("tac+");
    steps.push({
      action: "tac+",
      title: _("reco_tac_low", { val: tac }),
      productName: prodName(prod, "reco_fallback_tac"),
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
      const prod = findProduct("ph-");
      const computedDose = prod ? Math.round(prod.doseAmount * (volume / prod.effectPer) * (diff / prod.effectAmount)) : null;
      steps.push({
        action: "ph-",
        title: _("reco_ph_high", { val: phVal }),
        productName: prodName(prod, "reco_fallback_ph_minus"),
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
      const prod = findProduct("ph+");
      const computedDose = prod ? Math.round(prod.doseAmount * (volume / prod.effectPer) * (diff / prod.effectAmount)) : null;
      steps.push({
        action: "ph+",
        title: _("reco_ph_low", { val: phVal }),
        productName: prodName(prod, "reco_fallback_ph_plus"),
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
      const prod = findProduct("chlore");
      const computedDose = prod ? Math.round(prod.doseAmount * (volume / prod.effectPer) * (targetFcl / prod.effectAmount)) : null;
      steps.push({
        action: "chlore",
        title: _("reco_cl_combined", { val: combined.toFixed(2) }),
        productName: prodName(prod, "reco_fallback_chlore"),
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
      const prod = findProduct("chlore");
      const computedDose = prod ? Math.round(prod.doseAmount * (volume / prod.effectPer) * (diff / prod.effectAmount)) : null;
      steps.push({
        action: "chlore",
        title: _("reco_cl_low", { val: fCl }),
        productName: prodName(prod, "reco_fallback_chlore"),
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
      const prod = findProduct("brome");
      const diff = ((brT.min + brT.max) / 2) - bromeVal;
      const computedDose = prod ? Math.round(prod.doseAmount * (volume / prod.effectPer) * (diff / prod.effectAmount)) : null;
      steps.push({
        action: "brome",
        title: _("reco_brome_low", { val: bromeVal }),
        productName: prodName(prod, "reco_fallback_brome"),
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
      const prod = findProduct("o2");
      const diff = ((o2T.min + o2T.max) / 2) - o2Val;
      const computedDose = prod ? Math.round(prod.doseAmount * (volume / prod.effectPer) * (diff / prod.effectAmount)) : null;
      steps.push({
        action: "o2",
        title: _("reco_o2_low", { val: o2Val }),
        productName: prodName(prod, "reco_fallback_o2"),
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

  // Dureté (TH / HARD)
  const hardVal = parseFloat(latestLower.hard);
  if (has("hard") && !Number.isNaN(hardVal) && targetsLower.hard) {
    const hardT = targetsLower.hard;
    if (hardVal < hardT.min) {
      const diff = ((hardT.min + hardT.max) / 2) - hardVal;
      const prod = findProduct("hard+");
      const computedDose = prod ? Math.round(prod.doseAmount * (volume / prod.effectPer) * (diff / prod.effectAmount)) : Math.round(160 * (volume / 10) * (diff / 10));
      steps.push({
        action: "hard+",
        title: _("reco_hard_low", { val: hardVal }),
        productName: prodName(prod, "reco_fallback_hard"),
        productAvailable: !!prod,
        productPhoto: prod?.photo || null,
        doseText: prod ? `${_("reco_dose_prefix")} ${formatDose(computedDose, prod.doseUnit)}` : _("missing_product_tip", { action: "hard+" }),
        computedDoseAmount: computedDose,
        doseUnit: prod?.doseUnit || "g",
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
      });
    }
  }

  // Phosphates
  const phosVal = parseFloat(latestLower.phos);
  if (has("phos") && !Number.isNaN(phosVal) && targetsLower.phos && phosVal > targetsLower.phos.max) {
    const prod = findProduct("phos-");
    const computedDose = prod ? Math.round(prod.doseAmount * (volume / prod.effectPer) * (phosVal / prod.effectAmount)) : Math.round(50 * (volume / 10) * (phosVal / 100));
    steps.push({
      action: "phos-",
      title: _("reco_phos_high", { val: phosVal }),
      productName: prodName(prod, "reco_fallback_phos"),
      productAvailable: !!prod,
      productPhoto: prod?.photo || null,
      doseText: prod ? `${_("reco_dose_prefix")} ${formatDose(computedDose, prod.doseUnit)}` : _("missing_product_tip", { action: "phos-" }),
      computedDoseAmount: computedDose,
      doseUnit: prod?.doseUnit || "mL",
      note: prodNote(prod, "note_anti_phos"),
      waitHours: prod?.waitHours ?? DEFAULT_WAIT_HOURS["phos-"],
    });
  }

  // Cuivre (informatif + séquestrant)
  const copperVal = parseFloat(latestLower.copper);
  if (has("copper") && !Number.isNaN(copperVal) && targetsLower.copper && copperVal > targetsLower.copper.max) {
    const prod = findProduct("sequestrant");
    const computedDose = prod ? Math.round(prod.doseAmount * (volume / prod.effectPer)) : Math.round(100 * (volume / 10));
    steps.push({
      action: "sequestrant",
      title: _("reco_copper_high", { val: copperVal }),
      productName: prodName(prod, "reco_fallback_sequestrant"),
      productAvailable: !!prod,
      productPhoto: prod?.photo || null,
      doseText: prod ? `${_("reco_dose_prefix")} ${formatDose(computedDose, prod.doseUnit)}` : _("missing_product_tip", { action: "sequestrant" }),
      computedDoseAmount: computedDose,
      doseUnit: prod?.doseUnit || "mL",
      note: prodNote(prod, "note_sequestrant"),
      waitHours: prod?.waitHours ?? DEFAULT_WAIT_HOURS["sequestrant"],
    });
  }

  // Fer (informatif + séquestrant)
  const ironVal = parseFloat(latestLower.iron);
  if (has("iron") && !Number.isNaN(ironVal) && targetsLower.iron && ironVal > targetsLower.iron.max) {
    const prod = findProduct("sequestrant");
    const computedDose = prod ? Math.round(prod.doseAmount * (volume / prod.effectPer)) : Math.round(100 * (volume / 10));
    steps.push({
      action: "sequestrant",
      title: _("reco_iron_high", { val: ironVal }),
      productName: prodName(prod, "reco_fallback_sequestrant"),
      productAvailable: !!prod,
      productPhoto: prod?.photo || null,
      doseText: prod ? `${_("reco_dose_prefix")} ${formatDose(computedDose, prod.doseUnit)}` : _("missing_product_tip", { action: "sequestrant" }),
      computedDoseAmount: computedDose,
      doseUnit: prod?.doseUnit || "mL",
      note: prodNote(prod, "note_sequestrant"),
      waitHours: prod?.waitHours ?? DEFAULT_WAIT_HOURS["sequestrant"],
    });
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

  const stepPriorityCtx = {
    tac: Number.isNaN(tac) ? null : tac,
    phVal: Number.isNaN(phVal) ? null : phVal,
    phTargetMax: targetsLower.ph ? targetsLower.ph.max : null,
    combined,
  };
  const tacNotCritical = stepPriorityCtx.tac == null || stepPriorityCtx.tac >= 60;
  const phTooHigh = stepPriorityCtx.phVal != null && stepPriorityCtx.phTargetMax != null && stepPriorityCtx.phVal > stepPriorityCtx.phTargetMax;
  if (phTooHigh && tacNotCritical) {
    const phStep = steps.find((s) => s.action === "ph-");
    if (phStep) phStep.note = _("reco_note_ph_before_tac");
  }

  steps.sort((a, b) => computeStepPriority(a, stepPriorityCtx) - computeStepPriority(b, stepPriorityCtx));
  let cumulativeHours = 0;
  return steps.map((step, i) => {
    const startsAfter = cumulativeHours;
    cumulativeHours += step.waitHours || 0;
    return { ...step, stepNumber: i + 1, startsAfterHours: startsAfter };
  });
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
        <History size={40} color="#7ab8e8" strokeWidth={1.5} />
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
              style={{ ...styles.validateApplyBtn, background: importLoading ? "#6a7d90" : "#0a6ebd", fontSize: 13, padding: "9px 14px", marginTop: 8 }}
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
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6a7d90", padding: "8px 12px", background: "#f0f6fb", borderRadius: 10, border: "1px solid #d0e4f5" }}>
            <Lock size={13} color="#6a7d90" />
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
            background: allActive ? "#0a6ebd" : "#f1f4f3",
            borderColor: allActive ? "#0a6ebd" : "#d0e4f5",
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
      </div>

      {/* Bouton import PDF */}
      <div style={{ marginBottom: 8 }}>
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
              style={{ ...styles.validateApplyBtn, background: importLoading ? "#6a7d90" : "#0a6ebd", fontSize: 13, padding: "9px 14px" }}
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
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6a7d90", padding: "8px 12px", background: "#f0f6fb", borderRadius: 10, border: "1px solid #d0e4f5" }}>
            <Lock size={13} color="#6a7d90" />
            <span>{t("import_pdf_needs_ai")}</span>
          </div>
        )}
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
            manageStock={!!pool?.manageStock}
            lang={lang}
            activePlan={activePlan}
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
            style={{ ...styles.validateApplyBtn, background: diagLoading ? "#6a7d90" : "#7c3aed", marginTop: 8 }}
            onClick={handleDiag}
            disabled={diagLoading || !diagText.trim()}
          >
            {diagLoading ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
            {diagLoading ? t("diag_analyzing") : t("diag_submit")}
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
                <span style={{ fontSize: 11, color: "#6a7d90", fontWeight: 600 }}>{t("diag_confidence")} :</span>
                <span style={{ fontSize: 16, letterSpacing: 2 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} style={{ color: i < diagResult.confidence ? "#f59e0b" : "#d1d5db" }}>★</span>
                  ))}
                </span>
                <span style={{ fontSize: 11, color: "#6a7d90" }}>({diagResult.confidence}/5)</span>
              </div>
              {diagResult.confidence_reason && (
                <div style={{ fontSize: 11, color: "#6a7d90", marginTop: 4, fontStyle: "italic" }}>
                  {diagResult.confidence_reason}
                </div>
              )}
            </div>
          )}

          <div style={{ ...styles.sectionRow, marginTop: 20 }}>
            <span style={styles.sectionLabel}>{t("diag_history_title")}</span>
          </div>
          {!isPremium ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6a7d90", padding: "8px 12px", background: "#f0f6fb", borderRadius: 10, border: "1px solid #d0e4f5" }}>
              <Lock size={13} color="#6a7d90" />
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
                          <div style={{ fontSize: 10.5, color: "#6a7d90", marginTop: 4, fontStyle: "italic" }}>
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

function MeasureRow({ measure, onDelete, onEdit, onValidateApplication, application, isPremium, manageStock, lang, activePlan }) {
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
            <img
              src={measure.photo}
              alt=""
              style={{ ...styles.measureThumb, cursor: "zoom-in" }}
              onClick={(e) => { e.stopPropagation(); window._openLightbox?.(measure.photo); }}
            />
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
                  <img
                    key={idx}
                    src={src}
                    alt=""
                    style={{ height: 110, borderRadius: 8, objectFit: "cover", flexShrink: 0, border: "1px solid #d0e4f5", cursor: "zoom-in" }}
                    onClick={() => window._openLightbox?.(src)}
                  />
                ))}
              </div>
            );
          })()}
          {/* Photos bassin */}
          {measure.poolPhotos?.length > 0 && (
            <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 10 }}>
              {measure.poolPhotos.map((src, idx) => (
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
                    <div style={{ fontSize: 13, fontWeight: 600, color: s.skipped ? "#9ab0c4" : "#0d2b4e" }}>
                      {s.productName || s.title}
                      {s.appliedAmount && !s.skipped && (
                        <span style={{ fontWeight: 400, color: "#4a6480", marginLeft: 6 }}>
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
              <div style={{ fontSize: 11, color: "#6a7d90", marginTop: 4 }}>
                {application.allApplied ? t("wizard_completed") : t("wizard_partial")}
              </div>
            </div>
          ) : (
            !measure.importedFromPdf && (
              activePlan && activePlan.measureId === measure.id ? (
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#0a6ebd", fontWeight: 600, padding: "6px 0" }}>
                  <Clock size={14} color="#0a6ebd" />
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
function AddMeasureModal({ measure, onClose, onSave, isPremium, onWantPremium, apiKey, apiProvider, activeParamKeys, lang, onRequestPhotoAccess, authUid }) {
  const t = useT(lang || "fr");
  const isPrefilled = !!measure?.__prefilled;
  const isEditing = !!measure && !isPrefilled;
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

      // Priorité de confiance : haute > moyenne > basse > undefined
      const confidenceScore = { "haute": 3, "high": 3, "medio": 2, "moyenne": 2, "medium": 2, "bassa": 1, "basse": 1, "low": 1 };
      const numericKeys = ["pH","fCl","tCl","ccl","tac","cya","hard","phos","copper","iron","temp","brome","o2","sel"];
      const merged = {};

      numericKeys.forEach(k => {
        // Collecter toutes les valeurs non-null pour ce paramètre avec leur score de confiance
        const candidates = allResults
          .filter(r => r[k] !== null && r[k] !== undefined)
          .map(r => ({ value: r[k], score: confidenceScore[r.confidence] || 1 }));
        if (candidates.length === 0) return;
        // Prendre la valeur avec le meilleur score de confiance
        // En cas d'égalité, faire la moyenne
        const maxScore = Math.max(...candidates.map(c => c.score));
        const best = candidates.filter(c => c.score === maxScore);
        merged[k] = Math.round((best.reduce((s, c) => s + c.value, 0) / best.length) * 100) / 100;
      });
      if (merged.pH     !== undefined) setPH(String(merged.pH));
      if (merged.fCl    !== undefined) setFCl(String(merged.fCl));
      if (merged.tCl    !== undefined) setTCl(String(merged.tCl));
      // CCL auto-calculé si non fourni par la photo mais fCl et tCl disponibles
      if (merged.ccl    !== undefined) {
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

  function handleSave() {
    // CCL auto-calculé si non saisi et fCl + tCl disponibles
    const fClNum = fCl !== "" ? parseFloat(fCl) : null;
    const tClNum = tCl !== "" ? parseFloat(tCl) : null;
    let cclFinal = ccl;
    if ((ccl === "" || ccl == null) && fClNum != null && tClNum != null) {
      cclFinal = String(Math.max(0, Math.round((tClNum - fClNum) * 100) / 100));
      setCcl(cclFinal);
    }

    // Validation : FCL + CCL <= TCL (tolérance 0.05)
    const cclNum = cclFinal !== "" ? parseFloat(cclFinal) : null;
    if (fClNum != null && cclNum != null && tClNum != null) {
      if (fClNum + cclNum > tClNum + 0.05) {
        setCclError(t("ccl_fcl_tcl_error"));
        return;
      }
    }
    setCclError(null);

    onSave({
      ...(isEditing ? { id: measure.id } : {}),
      ...(isPrefilled && measure?.importedFromPdf ? { importedFromPdf: true } : {}),
      date: new Date(date).toISOString(),
      method,
      pH,
      fCl,
      tCl,
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
        style={{ ...styles.input, fontWeight: 600, color: "#0a6ebd" }}
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

          {/* Hint 30 secondes + compteur */}
          {!analyzing && analyzeTimer === null && (
            <div style={{ fontSize: 11, color: "#6a7d90", marginTop: 6, textAlign: "center", fontStyle: "italic" }}>
              {t("ai_timer_hint")}
            </div>
          )}
          {analyzing && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 8, fontSize: 13, color: "#0a6ebd", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
              <Loader2 size={14} className="spin" />
              {analyzeTimer}s
            </div>
          )}
          {!analyzing && analyzeTimer !== null && (
            <div style={{ fontSize: 12, color: "#6a7d90", marginTop: 6, textAlign: "center" }}>
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
            <span style={{ fontSize: 12, fontWeight: 700, color: "#0d2b4e" }}>{t("ai_reliability")} :</span>
            <span style={{ fontSize: 16, letterSpacing: 2 }}>
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} style={{ color: i < analyzeReliability.score ? "#f5a623" : "#d0d8e0" }}>★</span>
              ))}
            </span>
            <span style={{ fontSize: 11, color: "#6a7d90" }}>{analyzeReliability.score}/5</span>
          </div>
          {analyzeReliability.reason && (
            <div style={{ fontSize: 11, color: "#4a6480", lineHeight: 1.5 }}>{analyzeReliability.reason}</div>
          )}
        </div>
      )}

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
                value={f.value}
                onChange={(e) => { f.set(e.target.value); setCclError(null); }}
                style={isErrorField ? { ...styles.input, border: "1.5px solid #e74c3c", background: "#fdf5f5" } : styles.input}
              />
            </div>
          );
        })}
      </div>

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
        <span style={{ fontSize: 13, fontWeight: 700, color: "#0d2b4e" }}>
          {t("wizard_partial")} — {doneSteps}/{totalSteps}
        </span>
        <button
          style={{ background: "#0a6ebd", color: "#fff", border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
          onClick={onResume}
        >
          {t("wizard_resume")}
        </button>
      </div>
      {currentStep && (
        <div style={{ fontSize: 13, color: "#0d2b4e" }}>
          <span style={{ fontWeight: 600 }}>{t("wizard_next_step")} : {currentStep.productName || currentStep.title}</span>
          <div style={{ fontSize: 12, color: isReady ? "#1a8fd1" : "#4a6480", marginTop: 2, fontWeight: isReady ? 700 : 400 }}>
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
        const { value } = toDisplayUnit(amount, unit);
        setEditAmount(value != null && value !== "" ? String(value) : "");
        // Heure par défaut = maintenant en format HH:MM
        const d = new Date();
        setEditTime(`${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`);
        setSelectedProduct(step.productName);
        setEditingPrev(false);
      }
    }
  }, [plan?.currentStepIdx]);

  function toDisplayUnit(amount, unit) {
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

  function toBaseUnit(value, displayUnit, baseUnit) {
    const v = parseFloat(value);
    if (isNaN(v)) return null;
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
  const baseUnit = step.doseUnit || "g";
  const { displayUnit } = toDisplayUnit(step.computedDoseAmount || step.appliedAmount, baseUnit);
  const scheduled = step.scheduledAt ? new Date(step.scheduledAt).getTime() : null;
  const remaining = scheduled ? scheduled - now : null;
  const isReady = remaining === null || remaining <= 0;
  const prod = products?.find((p) => p.name === step.productName);
  const stockEmpty = manageStock && prod && (prod.stockPercent ?? 100) <= 0;

  function handleApply() {
    // Utiliser l'unité du produit sélectionné si différent du produit conseillé
    const actualProd = selectedProduct && selectedProduct !== step.productName
      ? products?.find(p => p.name === selectedProduct)
      : null;
    const actualBaseUnit = actualProd?.doseUnit || baseUnit;
    const { displayUnit: actualDisplayUnit } = toDisplayUnit(null, actualBaseUnit);
    const amount = toBaseUnit(editAmount, actualProd ? actualDisplayUnit : displayUnit, actualBaseUnit);
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
        background: "#fff", borderRadius: "20px 20px 0 0",
        width: "100%", maxWidth: 480,
        padding: "20px 18px 32px", boxSizing: "border-box",
        maxHeight: "92dvh", overflowY: "auto",
      }}>
        {/* En-tête */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontSize: 11, color: "#6a7d90", fontWeight: 600 }}>
            {t("wizard_step")} {currentIdx + 1} {t("wizard_of")} {totalSteps}
          </span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#6a7d90", padding: 4 }}>
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
                : i === currentIdx ? "#0a6ebd"
                : "#e0ecf5",
            }} />
          ))}
        </div>

        {/* Titre étape */}
        <div style={{ fontSize: 18, fontWeight: 800, color: "#0d2b4e", marginBottom: 4 }}>
          {step.productName || step.title}
        </div>
        {step.title && step.productName && step.title !== step.productName && (
          <div style={{ fontSize: 13, color: "#4a6480", marginBottom: 8 }}>{step.title}</div>
        )}

        {/* Countdown / horaire */}
        {!isReady && remaining !== null && (
          <div style={{
            background: "#eaf4fb", borderRadius: 10, padding: "10px 14px",
            marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <div style={{ fontSize: 11, color: "#6a7d90", fontWeight: 600 }}>{t("wizard_scheduled")}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#0a6ebd", fontVariantNumeric: "tabular-nums" }}>
                {formatCountdown(remaining)}
              </div>
            </div>
            <div style={{ textAlign: "right", fontSize: 12, color: "#4a6480" }}>
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

        {/* Sélecteur de produit alternatif (si gestion stock activée) */}
        {manageStock && products && products.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#4a6480", display: "block", marginBottom: 6 }}>
              {t("product_col")}
            </label>
            <select
              value={selectedProduct || step.productName}
              onChange={(e) => {
                const newProd = e.target.value;
                setSelectedProduct(newProd);
                if (newProd !== step.productName) {
                  setEditAmount("");
                } else {
                  const amount = step.computedDoseAmount ?? step.appliedAmount;
                  const { value } = toDisplayUnit(amount, step.doseUnit || "g");
                  setEditAmount(value != null && value !== "" ? String(value) : "");
                }
              }}
              style={{ width: "100%", boxSizing: "border-box", fontSize: 14, fontWeight: 600, color: "#0d2b4e", border: "2px solid #d0e4f5", borderRadius: 10, padding: "10px 12px", outline: "none", background: "#fff" }}
            >
              {products.map(p => (
                <option key={p.id || p.name} value={p.name}>
                  {p.name}{p.name === step.productName ? " ✓" : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Quantité */}
        {baseUnit && (
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#4a6480", display: "block", marginBottom: 6 }}>
              {t("quantity_applied")}
            </label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="number"
                value={editAmount ?? ""}
                onChange={(e) => setEditAmount(e.target.value)}
                style={{ flex: 1, fontSize: 22, fontWeight: 700, color: "#0d2b4e", border: "2px solid #d0e4f5", borderRadius: 10, padding: "10px 12px", textAlign: "center", outline: "none" }}
                step="0.01"
              />
              <div style={{ fontSize: 16, fontWeight: 700, color: "#4a6480", minWidth: 32 }}>{displayUnit}</div>
            </div>
          </div>
        )}

        {/* Heure d'application */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#4a6480", display: "block", marginBottom: 6 }}>
            {t("wizard_apply_time")}
          </label>
          <input
            type="time"
            value={editTime}
            onChange={(e) => setEditTime(e.target.value)}
            style={{ width: "100%", boxSizing: "border-box", fontSize: 18, fontWeight: 700, color: "#0a6ebd", border: "2px solid #d0e4f5", borderRadius: 10, padding: "10px 12px", outline: "none" }}
          />
        </div>

        {/* Boutons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8,width:"100%",padding:"14px 0",borderRadius:12,border:"none",background:"#0a6ebd",color:"#fff",fontWeight:700,fontSize:16,cursor:"pointer" }}
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
              style={{ background: "none", border: "1px solid #d0e4f5", borderRadius: 8, color: "#4a6480", fontSize: 12, cursor: "pointer", padding: "7px 12px", display: "flex", alignItems: "center", gap: 5 }}
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
            <div style={{ marginTop: 14, padding: "12px 14px", background: "#f0f6fb", borderRadius: 12, border: "1px solid #d0e4f5" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0d2b4e", marginBottom: 10 }}>
                ← {prev.productName || prev.title}
              </div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#4a6480", display: "block", marginBottom: 4 }}>{t("quantity_applied")}</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                <input
                  type="number"
                  value={prevAmount}
                  onChange={(e) => setPrevAmount(e.target.value)}
                  style={{ flex: 1, fontSize: 18, fontWeight: 700, color: "#0d2b4e", border: "1.5px solid #d0e4f5", borderRadius: 8, padding: "8px 10px", textAlign: "center", outline: "none" }}
                  step="0.01"
                />
                <span style={{ fontSize: 14, fontWeight: 700, color: "#4a6480" }}>{du}</span>
              </div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#4a6480", display: "block", marginBottom: 4 }}>{t("wizard_apply_time")}</label>
              <input
                type="time"
                value={prevTime}
                onChange={(e) => setPrevTime(e.target.value)}
                style={{ width: "100%", boxSizing: "border-box", fontSize: 16, fontWeight: 700, color: "#0a6ebd", border: "1.5px solid #d0e4f5", borderRadius: 8, padding: "8px 10px", outline: "none", marginBottom: 10 }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: "none", background: "#0a6ebd", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
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
                  style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: "1px solid #d0e4f5", background: "#fff", color: "#4a6480", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
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
            <div style={{ fontSize: 11, color: "#6a7d90", fontWeight: 600, marginBottom: 8 }}>ÉTAPES SUIVANTES</div>
            {plan.steps.slice(currentIdx + 1).filter((s) => !s.skipped && !s.appliedAt).map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid #f0f6fb" }}>
                <Clock size={13} color="#b0c8e0" />
                <span style={{ fontSize: 12, color: "#4a6480", flex: 1 }}>{s.productName || s.title}</span>
                <span style={{ fontSize: 11, color: "#6a7d90" }}>
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
            {products
              .filter((p) => !(p.isDefault && (p.stockPercent ?? 100) <= 0))
              .map((p) => (
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

function ProductModal({ product, onClose, onSave, isPremium, onWantPremium, applications, manageStock, onWantManageStock, lang, aiEnabled, apiKey, apiProvider, authUid }) {
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
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiNote, setAiNote] = useState(null);
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);

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
      setPhoto(compressed);
    } catch (err) {
      // silencieux
    } finally {
      setPhotoBusy(false);
    }
  }

  async function handleAnalyzePhoto() {
    if (!photo || !apiKey) return;
    setAiAnalyzing(true);
    setAiError(null);
    setAiNote(null);
    try {
      const result = await analyzeProductPhoto({ apiKey, apiProvider, dataUrl: photo, uid: authUid });
      if (result.name) setName(result.name);
      if (result.action) setAction(result.action);
      if (result.doseAmount != null) setDoseAmount(result.doseAmount);
      if (result.doseUnit) setDoseUnit(result.doseUnit);
      if (result.effectAmount != null) setEffectAmount(result.effectAmount);
      if (result.effectPer != null) setEffectPer(result.effectPer);
      if (result.waitHours != null) setWaitHours(result.waitHours);
      if (result.containerAmount != null) setContainerAmount(result.containerAmount);
      if (result.containerUnit) setContainerUnit(result.containerUnit);
      if (result.note) setAiNote(result.note);
    } catch (err) {
      setAiError(t("error_analyze") + " : " + (err?.message || t("verify_connection")));
    } finally {
      setAiAnalyzing(false);
    }
  }

  function handleSave() {
    if (!name.trim()) return;
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
      doseAmount: parseFloat(doseAmount) || 0,
      doseUnit,
      effectAmount: parseFloat(effectAmount) || 1,
      effectPer: parseFloat(effectPer) || 1,
      waitHours: parseFloat(waitHours) || 0,
      note,
      photo,
      stockPercent: newStock,
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

          {photo && aiEnabled && apiKey && (
            <button
              type="button"
              style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "1.5px solid #b0d8f0", background: "#eaf4fb", color: "#0a6ebd", fontWeight: 700, fontSize: 13, cursor: "pointer", marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              onClick={handleAnalyzePhoto}
              disabled={aiAnalyzing}
            >
              <Sparkles size={15} className={aiAnalyzing ? "spin" : undefined} />
              {aiAnalyzing ? t("ai_analyzing") : t("ai_analyze_btn")}
            </button>
          )}
          {photo && !aiEnabled && (
            <div style={{ fontSize: 11.5, color: "#6a7d90", marginTop: 8, lineHeight: 1.5 }}>
              {t("product_ai_hint")}
            </div>
          )}
          {aiNote && <div style={{ ...styles.analyzeNoteOk, marginTop: 8 }}>{aiNote}</div>}
          {aiError && <div style={{ ...styles.analyzeNoteError, marginTop: 8 }}>{aiError}</div>}
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
        <div style={{ fontSize: 17, fontWeight: 800, color: "#0d2b4e", marginBottom: 8, textAlign: "center" }}>{t("data_request_title")}</div>
        <div style={{ fontSize: 13, color: "#4a6480", marginBottom: 18, lineHeight: 1.5, textAlign: "center" }}>{t("data_request_desc")}</div>

        {status !== "sent" && (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {options.map((opt) => (
                <label
                  key={opt.value}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
                    borderRadius: 12, border: action === opt.value ? "1.5px solid #0a6ebd" : "1.5px solid #e6ebe9",
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
                  <span style={{ fontSize: 13.5, color: "#0d2b4e", fontWeight: 600 }}>{opt.label}</span>
                </label>
              ))}
            </div>

            {status === "error" && (
              <div style={{ fontSize: 12.5, color: "#c0392b", marginBottom: 14, textAlign: "center" }}>{t("data_request_error")}</div>
            )}

            <button
              onClick={handleSubmit}
              disabled={status === "sending"}
              style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: "#0a6ebd", color: "#fff", fontWeight: 700, fontSize: 14.5, cursor: status === "sending" ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}
            >
              {status === "sending" ? <Loader2 size={16} className="spin" /> : null}
              {status === "sending" ? t("data_request_sending") : t("data_request_submit")}
            </button>
            <button
              onClick={onClose}
              disabled={status === "sending"}
              style={{ width: "100%", padding: "11px 0", borderRadius: 12, border: "none", background: "none", color: "#6a7d90", fontWeight: 600, fontSize: 13.5, cursor: "pointer" }}
            >
              {t("cancel")}
            </button>
          </>
        )}

        {status === "sent" && (
          <>
            <div style={{ fontSize: 13.5, color: "#0d2b4e", marginBottom: 20, textAlign: "center", lineHeight: 1.5 }}>{t("data_request_sent")}</div>
            <button
              onClick={onClose}
              style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "1.5px solid #0a6ebd", background: "#fff", color: "#0a6ebd", fontWeight: 700, fontSize: 14.5, cursor: "pointer" }}
            >
              {t("close")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function SettingsView({ pools, activePoolId, onUpdatePool, onDeletePool, onSwitchPool, onWantAddPool, onDeleteAllMeasures: onDeleteAllMeasuresRaw, orphanedCount, onRepairOrphanedData, poolMeasureCount, onGenerateReport, onWantPremiumForReport, onWantPremium, isPremium, setIsPremium, apiKey, setApiKey, apiProvider, setApiProvider, aiEnabled, setAiEnabled, lang, setLang, authUser, onSignOut, onSignIn, onDeleteAccount, dataConsent, onRevokeDataConsent, cguAcceptedDate }) {
  const [showAiConfig, setShowAiConfig] = useState(false);
  const [editingPool, setEditingPool] = useState(null);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const t = useT(lang);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [pendingLang, setPendingLang] = useState(lang);
  const treatmentTypes = getTreatmentTypes(lang);
  const filtrationTypes = getFiltrationTypes(lang);
  const activePool = pools.find((p) => p.id === activePoolId) || pools[0];
  const [showApiKey, setShowApiKey] = useState(false);
  const [repairing, setRepairing] = useState(false);

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

  function onDeleteAllMeasures() {
    if (!poolMeasureCount) return;
    const ok = window.confirm(
      `${t("delete_measures")} "${activePool?.name}" ?`
    );
    if (ok) onDeleteAllMeasuresRaw();
  }

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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
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
                <div style={{ fontSize: 11.5, color: "#6a7d90" }}>{p.location} · {p.volume} m³</div>
              </div>
              {p.id === activePoolId && <CheckCircle2 size={16} color="#1a8fd1" />}
            </button>
            <button
              style={{ background: "none", border: "none", color: "#0a6ebd", fontSize: 12, fontWeight: 600, cursor: "pointer", padding: "0 8px", flexShrink: 0 }}
              onClick={() => setEditingPool(p)}
            >
              <Settings2 size={14} />
            </button>
            <button style={styles.poolListDeleteBtn} onClick={() => onDeletePool(p.id)}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {isPremium && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f0f6fb", borderRadius: 12, padding: "12px 14px", marginBottom: 8, marginTop: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#0d2b4e" }}>{t("manage_stock_label")}</div>
            <div style={{ fontSize: 11, color: "#6a7d90", marginTop: 2 }}>{t("manage_stock_desc")}</div>
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f0f6fb", borderRadius: 12, padding: "12px 14px", marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#0d2b4e" }}>{t("ai_toggle_label")}</div>
          <div style={{ fontSize: 11, color: "#6a7d90", marginTop: 2 }}>
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

      {/* Bouton configurer — visible uniquement si IA activée (premium uniquement) */}
      {isPremium && aiEnabled && (
        <button
          style={{ width: "100%", padding: "11px 0", borderRadius: 10, border: "1.5px solid #b0d8f0", background: "#eaf4fb", color: "#0a6ebd", fontWeight: 700, fontSize: 13, cursor: "pointer", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          onClick={() => setShowAiConfig(true)}
        >
          <Settings2 size={15} /> {t("ai_configure_btn")}
          {apiKey ? <span style={{ fontSize: 11, color: "#1a8fd1", fontWeight: 400 }}>✓ {apiProvider === "openai" ? "OpenAI" : "Anthropic"}</span> : null}
        </button>
      )}

      {/* Page de configuration IA — overlay plein écran */}
      {showAiConfig && (
        <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "#f0f6fb", overflowY: "auto" }}>
          <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px 32px" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 0 20px", borderBottom: "1px solid #d0e4f5", marginBottom: 20 }}>
              <button
                onClick={() => setShowAiConfig(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#0a6ebd", display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 13, padding: 0 }}
              >
                ← {t("ai_config_back")}
              </button>
              <span style={{ flex: 1, textAlign: "center", fontSize: 15, fontWeight: 800, color: "#0d2b4e" }}>{t("ai_config_title")}</span>
              <div style={{ width: 80 }} />
            </div>

            {/* Provider */}
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
                  style={{ ...styles.segmentedBtn, ...(apiProvider === opt.value ? styles.segmentedBtnActive : {}) }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Clé API */}
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
            <p style={styles.helpTextSmall}>{t("api_key_desc")}</p>

            {/* Bouton sauvegarder */}
            <button
              style={{ ...styles.primaryBtn, marginTop: 16 }}
              onClick={() => setShowAiConfig(false)}
            >
              {t("save")}
            </button>
          </div>
        </div>
      )}

      {/* Mentions légales */}
      <div style={styles.sectionRow}>
        <span style={styles.sectionLabel}>{t("legal_notices")}</span>
      </div>
      <div style={{ background: "#f5f8fc", borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontSize: 12, color: "#4a6480" }}>
        <div>{t("cgu_version_label")} : <strong>CGU {CGU_VERSION}</strong></div>
        {cguAcceptedDate && <div>{t("cgu_accepted_on")} : {new Date(cguAcceptedDate).toLocaleDateString()}</div>}
      </div>
      <button
        style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "none", background: "#0a6ebd", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", marginBottom: 16 }}
        onClick={() => setShowLegalModal(true)}
      >
        {t("legal_notices")}
      </button>

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

      <div style={styles.sectionRow}>
        <span style={styles.sectionLabel}>{t("sensitive_zone")}</span>
      </div>
      <button style={styles.dangerLinkBtn} onClick={onDeleteAllMeasures}>
        <Trash2 size={14} /> {t("delete_measures")}
      </button>

      {/* Suppression de compte — déplacée ici (v1.29.4), loin de "Se déconnecter"
          dans le bloc Mon compte, pour limiter le risque de clic accidentel. */}
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


      {showLegalModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(10,30,60,0.55)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 480, padding: "20px 18px 32px", boxSizing: "border-box", maxHeight: "90dvh", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#0d2b4e" }}>{t("legal_notices")} — CGU {CGU_VERSION}</span>
              <button onClick={() => setShowLegalModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", fontSize: 12, color: "#2d4a6e", lineHeight: 1.7, background: "#f5f8fc", borderRadius: 10, padding: "12px 14px" }}>
              {/* Éditeur */}
              <div style={{ fontWeight: 700, color: "#0d2b4e", marginBottom: 2 }}>{t("lcen_editor")}</div>
              <div style={{ marginBottom: 12 }}>{t("lcen_editor_val")}</div>
              <div style={{ fontWeight: 700, color: "#0d2b4e", marginBottom: 2 }}>{t("lcen_contact")}</div>
              <div style={{ marginBottom: 12 }}><a href={`mailto:${t("lcen_contact_val")}`} style={{ color: "#0a6ebd" }}>{t("lcen_contact_val")}</a></div>
              {/* Hébergement */}
              <div style={{ fontWeight: 700, color: "#0d2b4e", marginBottom: 2 }}>{t("lcen_host")}</div>
              <div style={{ whiteSpace: "pre-wrap", marginBottom: 12 }}>{t("lcen_host_val")}</div>
              {/* CGU */}
              <div style={{ fontWeight: 700, color: "#0d2b4e", marginTop: 8, marginBottom: 4 }}>{t("lcen_cgu_title")} — CGU {CGU_VERSION}</div>
              <div style={{ marginBottom: 10, fontSize: 11, color: "#4a6480" }}>
                {[
                  { title: t("lcen_ai_title"), body: t("lcen_ai_val") },
                  { title: t("lcen_photos_title"), body: t("lcen_photos_val") },
                  { title: t("lcen_gdpr"), body: t("lcen_gdpr_val") },
                ].map((s, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ fontWeight: 700, color: "#0d2b4e", marginBottom: 2 }}>{i+1}. {s.title}</div>
                    <div style={{ lineHeight: 1.6 }}>{s.body}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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
function DeleteReauthModal({ onClose, onConfirm, busy, error, lang }) {
  const t = useT(lang || "fr");
  const [password, setPassword] = useState("");
  return (
    <ModalShell onClose={onClose} title={t("delete_account")}>
      <p style={{ fontSize: 13, color: "#4a6480", lineHeight: 1.5, marginTop: 0 }}>
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
        style={{ width: "100%", padding: "11px 0", background: "none", border: "none", color: "#6a7d90", fontSize: 13, cursor: "pointer", marginTop: 8 }}
        onClick={onClose}
      >
        {t("cancel")}
      </button>
    </ModalShell>
  );
}

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
            background: "#fafcfb", color: "#0a6ebd", cursor: gpsLoading ? "default" : "pointer",
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
            <div style={{ padding: "10px 12px", fontSize: 12.5, color: "#6a7d90", display: "flex", alignItems: "center", gap: 6 }}>
              <Loader2 size={13} className="spin" /> {t("location_searching")}
            </div>
          )}
          {!searching && searchError && (
            <div style={{ padding: "10px 12px", fontSize: 12.5, color: "#b23b3b" }}>{t("location_search_error")}</div>
          )}
          {!searching && !searchError && results.length === 0 && (
            <div style={{ padding: "10px 12px", fontSize: 12.5, color: "#6a7d90" }}>{t("location_no_results")}</div>
          )}
          {!searching && results.map((r, i) => (
            <div
              key={i}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(r)}
              style={{
                padding: "10px 12px", fontSize: 13.5, color: "#0d2b4e", cursor: "pointer",
                borderTop: i > 0 ? "1px solid #eef3f6" : "none",
                display: "flex", alignItems: "center", gap: 7,
              }}
            >
              <MapPin size={13} color="#0a6ebd" />
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
    <ModalShell onClose={onClose} title={isEdit ? t("edit_pool") : forced ? t("first_pool_title") : t("add_pool_title")} forced={forced}>
      {forced && (
        <div style={{ fontSize: 13, color: "#4a6480", marginBottom: 16, lineHeight: 1.5 }}>
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

      <button style={styles.primaryBtn} onClick={handleSave}>
        {isEdit ? t("save") : t("create_pool")}
      </button>
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
      const gH = 45, gW = cW;
      const gX = mL, gY = y;

      // Fond graphique
      pdf.setFillColor(250,252,251);
      pdf.rect(gX, gY, gW, gH, "F");
      pdf.setDrawColor(200,210,220); pdf.setLineWidth(0.15);
      pdf.rect(gX, gY, gW, gH);

      // Grille horizontale (5 lignes)
      pdf.setDrawColor(220,228,234); pdf.setLineWidth(0.1);
      for (let i = 1; i <= 4; i++) {
        const gy = gY + (gH / 5) * i;
        pdf.line(gX, gy, gX + gW, gy);
      }

      const timestamps = chartData.map(d => d.timestamp);
      const tMin = Math.min(...timestamps), tMax = Math.max(...timestamps);
      const tRange = tMax - tMin || 1;

      // Dessiner chaque paramètre
      chartParams.forEach(cp => {
        const pts = chartData.map((d, i) => {
          const v = d[cp.key];
          return v == null ? null : { x: i, t: d.timestamp, v };
        }).filter(Boolean);
        if (pts.length < 1) return;

        // Normalise selon axe (left: 0-8, right: 0-100)
        const vMax = cp.axis === "left" ? 10 : 110;
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
          prev = { px, py: clampedPy };
        });
      });

      // Légende
      y = gY + gH + 2;
      let lx = mL;
      pdf.setFontSize(6.5); pdf.setFont("helvetica","normal");
      chartParams.forEach(cp => {
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

    sortedMeasures.forEach((m, i) => {
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
          style={{ ...styles.reportPrintBtn, background: pdfLoading ? "#6a7d90" : "#0d7a3e", opacity: pdfLoading ? 0.7 : 1 }}
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
        <label className="no-print" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#4a6480", marginBottom: 8, cursor: "pointer", userSelect: "none" }}>
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
            {chartParams.filter(cp => chartData.some(d => d[cp.key] != null)).map((cp) => (
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
              {rows.flatMap(({ measure, recs, application }, i) => {
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
                          <td style={{ ...styles.reportTdCell, fontWeight: 600, color: "#0d2b4e" }} rowSpan={totalRowSpan}>{formatDate(measure.date)}</td>
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
                          : rec ? <span style={{ color: "#6a7d90", fontStyle: "italic" }}>{rec.productName}</span>
                          : "—"}
                      </td>
                      <td style={{ ...styles.reportTdCell, color: "#4a6480" }}>
                        {step && !step.skipped ? formatDose(step.computedDoseAmount ?? step.appliedAmount, step.doseUnit || "g")
                          : rec ? formatDose(rec.computedDoseAmount, rec.doseUnit || "g")
                          : "—"}
                      </td>
                      <td style={{ ...styles.reportTdCell, fontWeight: 700, color: step?.skipped ? "#9ab0c4" : "#0a6ebd" }}>
                        {step && !step.skipped ? formatDose(step.appliedAmount, step.doseUnit || "g") : "—"}
                      </td>
                      <td style={{ ...styles.reportTdCell, color: "#4a6480" }}>
                        {step?.appliedAt ? new Date(step.appliedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                      {manageStock && <td style={{ ...styles.reportTdCell, color: prod && (prod.stockPercent ?? 100) <= 20 ? "#c0392b" : "#4a6480", fontWeight: 600 }}>
                        {prod ? formatDose(Math.round((prod.stockPercent ?? 100) / 100 * (prod.containerAmount ?? 1) * 10) / 10, prod.containerUnit || "kg") : "—"}
                      </td>}
                    </tr>
                  );
                });

                // Ligne note fusionnée
                const noteRow = hasNote ? (
                  <tr key={`${i}-note`} style={{ background: i % 2 === 0 ? "#f0f6fb" : "#f8fafd" }}>
                    <td colSpan={prodColSpan} style={{ ...styles.reportTdCell, fontStyle: "italic", color: "#4a6480", fontSize: 11, paddingLeft: 10 }}>
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
        <div style={{ marginTop: 16, padding: "10px 14px", background: "#f0f6fb", borderRadius: 10, border: "1px solid #d0e4f5" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#0d2b4e", marginBottom: 6 }}>{t("legend_title")}</div>
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
              <div key={abbr} style={{ fontSize: 10, color: "#4a6480", minWidth: 180 }}>
                <span style={{ fontWeight: 700, color: "#0a6ebd" }}>{abbr}</span>
                {" = "}{label}
                <span style={{ color: "#6a7d90" }}> · cible : {target}{unit ? " " + unit : ""}</span>
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
                          <div style={{ fontSize: 10.5, color: "#6a7d90", marginTop: 4, fontStyle: "italic" }}>
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
function ModalShell({ children, onClose, title, rightAction, forced }) {
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
    width: "100%",
    boxSizing: "border-box",
  },
  reportRow: { marginBottom: 18 },
  reportRowDate: { fontSize: 14, fontWeight: 700, color: "#0d2b4e", marginBottom: 8 },
  reportTable: { width: "100%", borderCollapse: "collapse", marginBottom: 10 },
  diagHistTable: { width: "100%", borderCollapse: "collapse", marginTop: 10, tableLayout: "fixed" },
  diagHistTh: {
    padding: "6px 6px",
    textAlign: "left",
    fontSize: 10,
    fontWeight: 700,
    color: "#6a7d90",
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
    maxWidth: "100vw",
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
    border: "none",
    background: "#0a6ebd",
    color: "#fff",
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
  main: { flex: 1, padding: "16px 16px 24px", overflowY: "auto", WebkitOverflowScrolling: "touch", maxWidth: 768, width: "100%", alignSelf: "center", boxSizing: "border-box" },
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
    border: "none",
    background: "#0a6ebd",
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
    border: "none",
    background: "#0a6ebd",
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
    background: "#0a6ebd",
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
