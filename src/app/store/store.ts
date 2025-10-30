import { patchState, signalStore, withMethods, withState } from '@ngrx/signals'
import { Member, Expense } from './models'
import { nanoid } from 'nanoid'

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
	withState( { expenses: [] as Expense[] } ),
	withMethods( store => ( {
		addExpense( newExpense: Expense ) {
			patchState( store, {
				expenses: [...store.expenses(), newExpense]
			})
		}
	} ) )
);
