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

export const siteFeatureConfig: SiteFeatureConfig = {
  mode: "static",
  features: presets.static,
}

export function isFeatureEnabled(feature: keyof SiteFeatures): boolean {
  return siteFeatureConfig.features[feature]
}
