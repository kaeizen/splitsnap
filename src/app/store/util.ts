import { DebtCollection, IDebts, Expense, Member,  } from "./models";

export const computeDebts = (
	newExpense : Expense,
	members: Member[],
	prevMembersDebt: IDebts ) => {
		const membersToPay = newExpense.membersToPay;
		const membersPaid = newExpense.membersPaid;

		// Gather all unique member ids (appearing anywhere in paid/toPay)
		const memberIds = new Set([
			...Object.keys(membersToPay),
			...Object.keys(membersPaid)
		]);

		// Calculate how much each member paid
		const paidAmounts: Record<string, number> = {};
		for (const id of memberIds) {
			paidAmounts[id] = membersPaid[id]?.amount ?? 0;
		}

		// Calculate how much each member owes (should pay)
		const owedAmounts: Record<string, number> = {};
		for (const id of memberIds) {
			owedAmounts[id] = membersToPay[id]?.amount ?? 0;
		}

		// Calculate net balances: positive = overpaid, negative = underpaid
		const netBalances: Record<string, number> = {};
		for (const id of memberIds) {
			netBalances[id] = (paidAmounts[id] || 0) - (owedAmounts[id] || 0);
		}

		// Build arrays of creditors (those who are owed) and debtors (those who owe)
		type Balance = { id: string, amount: number };
		const creditors: Balance[] = [];
		const debtors: Balance[] = [];
		for (const id of memberIds) {
			const balance = netBalances[id];
			// min value threshold to avoid floating point issues
			const threshold = 1e-8;
			if (balance > threshold) creditors.push({ id, amount: balance });
			else if (balance < -threshold) debtors.push({ id, amount: -balance });
		}

		// Initialize final debts object
		const debts: IDebts = {};
		for (const id of memberIds) {
			debts[id] = {};
			for (const otherId of memberIds) {
				if (id !== otherId) {
					debts[id][otherId] = 0;
				}
			}
		}

		// Greedily match debtors to creditors
		let i = 0, j = 0;
		while (i < debtors.length && j < creditors.length) {
			const debtor = debtors[i];
			const creditor = creditors[j];
			const amount = Math.min(debtor.amount, creditor.amount);

			// Debtor owes creditor
			debts[debtor.id][creditor.id] = amount;

			// Reduce paid/owing amounts
			debtor.amount -= amount;
			creditor.amount -= amount;

			// Move to next debtor/creditor if fully paid
			if (Math.abs(debtor.amount) < 1e-8) i++;
			if (Math.abs(creditor.amount) < 1e-8) j++;
		}

		console.log( 'debts', debts )
		const membersDebt: IDebts = { ...prevMembersDebt }
		for ( const member of members ) {
			if ( ! ( member.id in membersDebt ) ) {
				membersDebt[ member.id ] = {}
			}

			for (const otherMember of members) {
				if (member.id === otherMember.id) continue;
				if ( ! ( otherMember.id in membersDebt[ member.id ] ) ) {
					membersDebt[ member.id ][ otherMember.id ] = 0
				}

				membersDebt[member.id][otherMember.id] += debts[ member.id ]?.[ otherMember.id ] || 0;
			}
		}

	return { debtsCollection: debts, membersDebt }
}
