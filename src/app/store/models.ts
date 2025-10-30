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

