// src/tontines/tontine-type.enum.ts
export enum TontineTypeEnum {
  FRIEND_CIRCLE = 'friends',
  FAMILY_FUND = 'family',
  SAVINGS_GROUP = 'savings',
  INVESTMENT_POOL = 'investment',
}

export const TontineTypeOptions = Object.values(TontineTypeEnum).map((value) => {
  switch (value) {
    case TontineTypeEnum.FRIEND_CIRCLE:
      return {
        label: 'Friend Circle',
        value,
        description: 'Casual savings with friends',
      };
    case TontineTypeEnum.FAMILY_FUND:
      return {
        label: 'Family Fund',
        value,
        description: 'Family-based financial support',
      };
    case TontineTypeEnum.SAVINGS_GROUP:
      return {
        label: 'Savings Group',
        value,
        description: 'Focused on collective savings goals',
      };
    case TontineTypeEnum.INVESTMENT_POOL:
      return {
        label: 'Investment Pool',
        value,
        description: 'Investment-focused collaboration',
      };
  }
});
