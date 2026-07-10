/**
 * Constantes centralizadas para dados de apoio ao projeto
 */

export const SUPPORTER_PIX_KEY = 'contato@guitararchitect.com.br';
export const SUPPORTER_CONTACT_EMAIL = 'contato@guitararchitect.com.br';

export type WiseCurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'NZD' | 'SGD' | 'CNY';

export interface WiseAccountField {
  id: string;
  label: { pt: string; en: string };
  value: string;
}

export interface WiseCurrencyAccount {
  currency: WiseCurrencyCode;
  fields: WiseAccountField[];
}

const accountHolder: WiseAccountField = {
  id: 'accountHolder',
  label: { pt: 'Titular da conta', en: 'Account holder' },
  value: 'Dilio Procopio Dayrell D de Alvarenga',
};

export const SUPPORTER_WISE_ACCOUNTS: Record<WiseCurrencyCode, WiseCurrencyAccount> = {
  USD: {
    currency: 'USD',
    fields: [
      accountHolder,
      { id: 'accountType', label: { pt: 'Tipo da conta', en: 'Account type' }, value: 'Checking' },
      { id: 'routingNumber', label: { pt: 'Routing number', en: 'Routing number' }, value: '101019628' },
      { id: 'accountNumber', label: { pt: 'Número da conta', en: 'Account number' }, value: '218200302639' },
      {
        id: 'bankNameAddress',
        label: { pt: 'Nome e endereço do banco', en: 'Bank name and address' },
        value: 'Wise US Inc, 108 W 13th St, Wilmington, DE, 19801, United States',
      },
      { id: 'swiftBic', label: { pt: 'SWIFT/BIC', en: 'SWIFT/BIC' }, value: 'TRWIUS35XXX' },
    ],
  },
  EUR: {
    currency: 'EUR',
    fields: [
      accountHolder,
      { id: 'iban', label: { pt: 'IBAN', en: 'IBAN' }, value: 'BE23 9055 0460 2491' },
      { id: 'swiftBic', label: { pt: 'SWIFT/BIC', en: 'SWIFT/BIC' }, value: 'TRWIBEB1XXX' },
      {
        id: 'bankNameAddress',
        label: { pt: 'Nome e endereço do banco', en: 'Bank name and address' },
        value: 'Wise, Rue du Trône 100, 3rd floor, Brussels, 1050, Belgium',
      },
    ],
  },
  GBP: {
    currency: 'GBP',
    fields: [
      accountHolder,
      { id: 'accountNumber', label: { pt: 'Número da conta', en: 'Account number' }, value: '91576798' },
      { id: 'sortCode', label: { pt: 'Sort code', en: 'Sort code' }, value: '60-84-64' },
      { id: 'iban', label: { pt: 'IBAN', en: 'IBAN' }, value: 'GB59 TRWI 6084 6491 5767 98' },
      { id: 'swiftBic', label: { pt: 'SWIFT/BIC', en: 'SWIFT/BIC' }, value: 'TRWIGB2LXXX' },
      {
        id: 'bankNameAddress',
        label: { pt: 'Nome e endereço do banco', en: 'Bank name and address' },
        value: 'Wise Payments Limited, Worship Square, 65 Clifton Street, London, EC2A 4JE, United Kingdom',
      },
    ],
  },
  CAD: {
    currency: 'CAD',
    fields: [
      accountHolder,
      { id: 'accountNumber', label: { pt: 'Número da conta', en: 'Account number' }, value: '170156541' },
      { id: 'institutionNumber', label: { pt: 'Institution Number', en: 'Institution Number' }, value: '705' },
      { id: 'branchNumber', label: { pt: 'Número da agência', en: 'Branch number' }, value: '00001' },
      { id: 'swiftBic', label: { pt: 'SWIFT/BIC', en: 'SWIFT/BIC' }, value: 'TRWICAW1XXX' },
      {
        id: 'bankNameAddress',
        label: { pt: 'Nome e endereço do banco', en: 'Bank name and address' },
        value: 'Wise Payments Canada Inc., 99 Bank Street, Suite 1420, Ottawa, ON, K1P 1H4, Canada',
      },
    ],
  },
  AUD: {
    currency: 'AUD',
    fields: [
      accountHolder,
      { id: 'bsbCode', label: { pt: 'Código BSB', en: 'BSB code' }, value: '774-001' },
      { id: 'accountNumber', label: { pt: 'Número da conta', en: 'Account number' }, value: '247608427' },
      { id: 'swiftBic', label: { pt: 'SWIFT/BIC', en: 'SWIFT/BIC' }, value: 'TRWIAUS1XXX' },
      {
        id: 'bankNameAddress',
        label: { pt: 'Nome e endereço do banco', en: 'Bank name and address' },
        value: 'Wise Australia Pty Ltd, Suite 1, Level 11, 66 Goulburn Street, Sydney, NSW, 2000, Australia',
      },
    ],
  },
  NZD: {
    currency: 'NZD',
    fields: [
      accountHolder,
      { id: 'accountNumber', label: { pt: 'Número da conta', en: 'Account number' }, value: '04-2021-0418886-19' },
      { id: 'swiftBic', label: { pt: 'SWIFT/BIC', en: 'SWIFT/BIC' }, value: 'TRWINZ21XXX' },
      {
        id: 'bankNameAddress',
        label: { pt: 'Nome e endereço do banco', en: 'Bank name and address' },
        value: 'Wise Payments New Zealand Ltd., Level 11, 41 Shortland Street, Auckland, 1010, New Zealand',
      },
    ],
  },
  SGD: {
    currency: 'SGD',
    fields: [
      accountHolder,
      { id: 'bankCode', label: { pt: 'Código do banco', en: 'Bank code' }, value: '0516' },
      { id: 'accountNumber', label: { pt: 'Número da conta', en: 'Account number' }, value: '312-379-02' },
      { id: 'swiftBic', label: { pt: 'SWIFT/BIC', en: 'SWIFT/BIC' }, value: 'TRWISGSGXXX' },
      {
        id: 'bankNameAddress',
        label: { pt: 'Nome e endereço do banco', en: 'Bank name and address' },
        value: 'Wise Asia-Pacific Pte. Ltd., 2 Tanjong Katong Road, #07-01, PLQ3, Singapore, 437161, Singapore',
      },
    ],
  },
  CNY: {
    currency: 'CNY',
    fields: [
      accountHolder,
      { id: 'iban', label: { pt: 'IBAN', en: 'IBAN' }, value: 'GB59 TRWI 6084 6491 5767 98' },
      { id: 'swiftBic', label: { pt: 'SWIFT/BIC', en: 'SWIFT/BIC' }, value: 'TRWIGB2LXXX' },
      {
        id: 'bankNameAddress',
        label: { pt: 'Nome e endereço do banco', en: 'Bank name and address' },
        value: 'Wise Payments Limited, Worship Square, 65 Clifton Street, London, EC2A 4JE, United Kingdom',
      },
    ],
  },
};

export const WISE_CURRENCY_ORDER: WiseCurrencyCode[] = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NZD', 'SGD', 'CNY'];
