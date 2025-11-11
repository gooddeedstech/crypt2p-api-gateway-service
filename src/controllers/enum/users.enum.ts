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
