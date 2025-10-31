export type Member = {
	id: string,
	name: string
}

export type MemberWithAmount = Member & { amount: number };
export type MemberWithAmountPercent = MemberWithAmount & { percent: number };

export type Expense = {
	id: string,
	description: string,
	amount: number,
	date: Date,
	splitMode: string,
	membersToPay: { [ key: string ]: MemberWithAmountPercent },
	membersPaid: { [ key: string ]: MemberWithAmount }
}

// Member ID and Amount
export type Debt = Record<string, number>

// Expense/Member ID and Debts
export type IDebts = Record<string, Debt>

// Member ID and Expense Debts
// Structure: { expenseId: { memberId: { memberId: amount } } }
export type DebtCollection = Record<string, IDebts>
