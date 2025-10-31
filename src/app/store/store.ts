import { patchState, signalStore, withMethods, withState } from '@ngrx/signals'
import { Member, Expense, DebtCollection, IDebts } from './models'
import { nanoid } from 'nanoid'
import { computeDebts } from './util';
import { inject } from '@angular/core';

export const MemberStore = signalStore(
	{ providedIn: 'root' },
	withState( { members: [] as Member[] } ),
	withMethods(  store => ( {
		addMember( newMember: string ) {
			patchState( store, {
				members: [
					...store.members(),
					{
						id: nanoid(),
						name: newMember
					}
				]
			})
		},
		removeMember( id: string ) {
			const index = store.members().findIndex(member => member.id === id);
			if (index !== -1) {
				const updatedMembers = [...store.members()];
				updatedMembers.splice(index, 1);
				patchState(store, { members: updatedMembers });
			}
		}
	} ) )
);

export const ExpenseStore = signalStore(
	{ providedIn: 'root' },
	withState( {
		expenses: [] as Expense[],
		debtsCollection: {} as DebtCollection,
		debts: {} as IDebts
	} ),
	withMethods( store => {
		const memberStore = inject(MemberStore);
		return {
			addExpense( newExpense: Expense ) {
				const members = memberStore.members();
				const { debtsCollection, membersDebt } = computeDebts(
						newExpense, members, store.debts() )

				console.log( 'membersDebt', membersDebt )
				patchState( store, {
					expenses: [...store.expenses(), newExpense],
					debtsCollection: {
						...store.debtsCollection(),
						[ newExpense.id ]: debtsCollection
					},
					debts: { ...store.debts(), ...membersDebt }
				})
			},
			removeExpense( expenseId: string ) {
				const updatedExpenses = [ ...store.expenses() ]
				const index = updatedExpenses.findIndex(exp => exp.id == expenseId);

				let removedExpense: Expense | undefined = undefined;
				if ( index === -1 ) {
					return;
				}
				removedExpense = updatedExpenses.splice(index, 1)[0];

				const updatedDebts = { ...store.debts() };
				const updatedDebtsCollection = { ...store.debtsCollection() };

				const debtToRemove = updatedDebtsCollection[ expenseId ];

				// Iterate over the debt map for this expense and subtract debts from the global debts
				for ( const memberWithDebt in debtToRemove ) {
					for ( const memberOwed in debtToRemove[ memberWithDebt ] ) {
						if ( updatedDebts[ memberWithDebt ]?.[ memberOwed ] ) {
							updatedDebts[ memberWithDebt ][ memberOwed ] -= debtToRemove[ memberWithDebt ][ memberOwed ];
						}
					}
				}

				// Remove the expense's debts from debtsCollection.
				delete updatedDebtsCollection[ expenseId ];

				patchState( store, {
					expenses: updatedExpenses,
					debtsCollection: updatedDebtsCollection,
					debts: updatedDebts
				});
			}
		}
	} )
);
