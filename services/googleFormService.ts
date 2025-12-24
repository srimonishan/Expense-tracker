
import { ReceiptData, GoogleFormConfig } from "../types";

export async function submitToGoogleForm(receipt: ReceiptData, config: GoogleFormConfig): Promise<boolean> {
  if (!config.formUrl) return false;

  const responseUrl = config.formUrl.includes('formResponse') 
    ? config.formUrl 
    : config.formUrl.replace(/\/viewform.*$/, '/formResponse');

  const formData = new URLSearchParams();
  
  // Mapping extracted data to the provided form entries
  formData.append(config.amountEntryId, receipt.amount);
  formData.append(config.typeEntryId, receipt.merchant);
  
  // Logical mapping for Cash/Card based on category or AI inference
  const paymentMethod = receipt.category.toLowerCase().includes('cash') ? 'Cash' : 'Card';
  formData.append(config.methodEntryId, paymentMethod);

  try {
    await fetch(responseUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });
    return true;
  } catch (error) {
    console.error("Submission failed:", error);
    return false;
  }
}
