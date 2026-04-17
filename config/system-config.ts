/**
 * SYSTEM MASTER CONFIG - VALENTE CONECTA
 * Controle absoluto do Admin Master + Conta Pessoal separada
 */

export const SYSTEM_CONFIG = {
  
  // ================================
  // ADMIN MASTER (CENTRAL)
  // ================================
  adminMaster: {
    enabled: true,
    fullAccess: true,

    permissions: {
      users: "CRUD",
      companies: "CRUD",
      catalog: "CRUD",
      pricing: "FULL_CONTROL",
      searchEngine: "FULL_CONTROL",
      aiRanking: "FULL_CONTROL",
      notifications: "SEND_SEGMENTED",
      systemSettings: "FULL_CONTROL",
      billingPlans: "FULL_CONTROL",
      geoRules: "FULL_CONTROL"
    },

    realTimeMonitoring: {
      enabled: true,
      metrics: [
        "users_online",
        "search_volume",
        "conversion_rate",
        "revenue_flow",
        "fallback_usage",
        "error_logs"
      ]
    },

    aiControl: {
      searchPriority: "LOCAL_FIRST",
      fallbackLimit: 3,
      geoPreference: true,
      learningMode: true
    }
  },

  // ================================
  // CONTA PESSOAL (OWNER)
  // ================================
  personalAccount: {
    enabled: true,

    uiAccess: {
      position: "TOP_LEFT_HEADER",
      style: "minimal_icon_button",
      icon: "wallet"
    },

    features: {
      income: true,
      expense: true,
      transfers: true,
      reports: true,
      monthlyView: true
    },

    isolation: {
      separateFromSystem: true,
      noImpactOnBusinessLogic: true
    }
  },

  // ================================
  // BUSCA INTELIGENTE GLOBAL
  // ================================
  searchEngine: {
    priorityOrder: [
      "local_catalog",
      "admin_offers",
      "city_base_data",
      "price_da_hora",
      "google_fallback"
    ],

    rules: {
      maxExternalResults: 3,
      preferNearest: true,
      preferLowestPrice: true,
      enforceCityBaseFirst: true
    }
  },

  // ================================
  // DATA GOVERNANCE
  // ================================
  dataControl: {
    versioning: true,
    backupEvery: "6h",
    auditLog: true,
    realtimeSync: true,

    supabase: {
      mode: "mirror",
      productionSync: "controlled_deploy",
      localOverride: true
    }
  }
}
