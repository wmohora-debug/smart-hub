export const siteConfig = {
  name: "Smart Menu",
  description: "Enterprise Digital Menu Platform by Smart Tech Namchi",
  organization: "Smart Tech Namchi",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
};

export type SiteConfig = typeof siteConfig;
