export type SiteMode = "static" | "collab"

export interface SiteFeatures {
  auth: boolean
  comments: boolean
  annotations: boolean
  reservations: boolean
}

export interface SiteFeatureConfig {
  mode: SiteMode
  features: SiteFeatures
}

const presets: Record<SiteMode, SiteFeatures> = {
  static: {
    auth: false,
    comments: false,
    annotations: false,
    reservations: false,
  },
  collab: {
    auth: true,
    comments: true,
    annotations: true,
    reservations: true,
  },
}

export function validateSiteFeatureConfig(config: SiteFeatureConfig): SiteFeatureConfig {
  const needsSupabase =
    config.features.comments || config.features.annotations || config.features.reservations
  if (needsSupabase && !config.features.auth) {
    throw new Error(
      "Supabase-backed comments, annotations, and reservations currently require auth to bootstrap the client",
    )
  }
  return config
}

// The branded showcase is intentionally backend-free. Collaboration remains a
// capability of the public template, not of this independently deployed site.
const selectedMode: SiteMode = "static"

export const siteFeatureConfig: SiteFeatureConfig = validateSiteFeatureConfig({
  mode: selectedMode,
  features: presets[selectedMode],
})

export function isFeatureEnabled(feature: keyof SiteFeatures): boolean {
  return siteFeatureConfig.features[feature]
}
