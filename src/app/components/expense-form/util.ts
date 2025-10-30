import { MemberWithAmount,MemberWithAmountPercent,  Expense } from "../../store/models";

export const validateExpense = (expense: Expense) => {
	// Basic validation for required fields
	const errors: string[] = [];

	if (!expense.description || expense.description.trim() === '') {
		errors.push('Description is required.');
	}
	if (expense.amount === null || isNaN(expense.amount) || (expense.amount <= 0)) {
		errors.push('Amount must be a positive number.');
	}
	if (!expense.date) {
		errors.push('Date is required.');
	}
	if (!expense.splitMode) {
		errors.push('Split mode is required.');
	}
	if (expense.membersToPay.length === 0) {
		errors.push('At least one member who needs to pay must be selected.');
	}
	if (expense.membersPaid.length === 0) {
		errors.push('At least one member who paid must be selected.');
	}

	const totalPaid = expense.membersPaid.reduce((sum: number, m: MemberWithAmount) => sum + (typeof m.amount === 'number' ? m.amount : 0), 0);
	const amount = expense.amount ?? 0;

	if (expense.membersToPay.length && expense.splitMode === 'custom-percentage') {
		const totalPercent = expense.membersToPay.reduce((sum: number, m: MemberWithAmountPercent) => sum + (typeof m.amount === 'number' ? m.amount : 0), 0);
		if (totalPercent !== 100) {
			errors.push(`The total percentage assigned to members (${totalPercent}%) must equal 100%.`);
		}
	} else if (expense.membersToPay.length ) {
		const totalToPay = expense.membersToPay.reduce((sum, m) => sum + (typeof m.amount === 'number' ? m.amount : 0), 0);
		if (totalToPay !== amount) {
			errors.push(`The total amount to pay by members (₱${totalToPay}) must equal the expense amount (₱${amount}).`);
		}
	}

	if (expense.membersPaid.length && totalPaid !== amount) {
		errors.push(`The total amount paid by members (₱${totalPaid}) must equal the expense amount (₱${amount}).`);
	}
	return errors;
}
