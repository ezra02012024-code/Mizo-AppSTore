export type AppCategory = 
  | 'all'
  | 'chanchinbu'    // News & Media
  | 'bible_hla'      // Bible & Hymns
  | 'dictionary'     // Education & Language
  | 'game'           // 2D & Casual Games
  | 'utility'        // Tools & Utilities
  | 'social';        // Community & Communication

export interface CategoryInfo {
  id: AppCategory;
  nameMizo: string;
  iconName: string;
  descriptionMizo: string;
}

export interface VersionRecord {
  versionName: string;
  versionCode: number;
  releaseDate: string;
  changelog: string;
  apkSize: number;
  isCriticalUpdate?: boolean;
}

export interface DeveloperInfo {
  id: string;
  name: string;
  email: string;
  organization?: string;
  avatarUrl?: string;
  verified: boolean;
}

export interface AppItem {
  id: string;
  name: string;
  packageName: string;
  category: AppCategory;
  shortDesc: string;
  fullDesc: string;
  iconUrl: string;
  bannerUrl?: string;
  screenshots: string[];
  versionName: string;
  versionCode: number;
  minSdkVersion: number;
  apkSize: number;
  apkFileName: string;
  apkDownloadUrl: string;
  downloadsCount: number;
  rating: number;
  ratingCount: number;
  developer: DeveloperInfo;
  updatedAt: string;
  createdAt: string;
  changelog: string;
  isFeatured?: boolean;
  versionHistory: VersionRecord[];
}

export interface UserSession {
  isAuthenticated: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
    isDeveloper: boolean;
  } | null;
}

export interface FcmNotificationPayload {
  topic: string;
  notification: {
    title: string;
    body: string;
  };
  data: {
    appId: string;
    appName: string;
    packageName: string;
    versionCode: string;
    versionName: string;
    changelog: string;
    apkUrl: string;
    isCritical: string;
    timestamp: string;
  };
}

export interface NewAppFormData {
  name: string;
  packageName: string;
  category: AppCategory;
  shortDesc: string;
  fullDesc: string;
  iconUrl: string;
  versionName: string;
  versionCode: number;
  minSdkVersion: number;
  apkSize: number;
  apkFileName: string;
  changelog: string;
  screenshots: string[];
}

export interface UpdateAppFormData {
  appId: string;
  versionName: string;
  versionCode: number;
  changelog: string;
  apkSize: number;
  apkFileName: string;
  isCriticalUpdate: boolean;
  sendFcmNotification: boolean;
}
