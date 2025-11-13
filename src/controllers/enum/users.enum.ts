export enum CryptoTransactionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESSFUL = 'SUCCESSFUL',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum CryptoTransactionType {
  CRYPTO_TO_CASH = 'CRYPTO_TO_CASH',
  CASH_TO_CRYPTO = 'CASH_TO_CRYPTO',
}

export enum AssetType {
  COIN = 'COIN',
  TOKEN = 'TOKEN',
  STABLECOIN = 'STABLECOIN',
}

export enum KycLevel {
  UNVERIFIED = 0,
  BASIC = 1,
  FULL = 2,
}

export enum BvnStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  FAILED = 'failed',
}

export enum NotificationType {
  SYSTEM = 'SYSTEM',
  TRANSACTION = 'TRANSACTION',
  SECURITY = 'SECURITY',
  KYC = 'KYC',
  ADMIN = 'ADMIN',
}

export enum NotificationChannel {
  IN_APP = 'IN_APP',
  PUSH = 'PUSH',
  EMAIL = 'EMAIL',
  ALL = 'ALL',
}