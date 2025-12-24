
export interface ReceiptData {
  id: string;
  merchant: string;
  amount: string;
  currency: string;
  date: string;
  category: string;
  image?: string;
  status: 'pending' | 'processing' | 'ready' | 'submitted' | 'error';
  error?: string;
}

export interface GoogleFormConfig {
  formUrl: string;
  amountEntryId: string;    // Expense amount in lkr
  typeEntryId: string;      // Type of expense
  methodEntryId: string;    // Cash (bill), Card
}

export const DEFAULT_CONFIG: GoogleFormConfig = {
  formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLScBqSPn8KeJNhhRkTUHMUdv4OrVptYXQMNgQqoAsPN5MUJSKQ/viewform',
  amountEntryId: 'entry.527204928',
  typeEntryId: 'entry.183344116',
  methodEntryId: 'entry.2064509286'
};
