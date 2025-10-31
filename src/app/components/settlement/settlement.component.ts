import { Component, computed, effect, inject, signal } from '@angular/core';
import { KeyValuePipe, DecimalPipe } from '@angular/common';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { ExpenseStore, MemberStore } from '../../store/store';
import { Debt, Member, IDebts } from '../../store/models';

type Panel = Member & { active: boolean }
type Balance = { id: string, owes: Debt, owed: Debt }
@Component({
	selector: 'ss-settlement',
	imports: [NzCardModule, NzListModule, NzIconModule, NzCollapseModule, NzFlexModule, KeyValuePipe, DecimalPipe ],
	templateUrl: './settlement.component.html',
	styleUrl: './settlement.component.scss'
})

export class SettlementComponent {
	memberStore = inject(MemberStore);
	expenseStore = inject(ExpenseStore);
	Object = Object

	panels = signal<Panel[]>([]);
	balance = signal<Record<string, Balance>>({});

	membersArr = computed( () => this.memberStore.members() )
	members = computed( () => this.memberStore.members().reduce(
		( output: Record<string, string>, member ) => {
			output[ member.id ] = member.name
			return output
	}, {} ))


	constructor() {
		effect(() => {
			this.panels.set(this.membersArr().map(member => ({
				...member,
				active: false
			})));
		});

		effect( () => {
			const debts : IDebts = this.expenseStore.debts();

			if ( typeof debts !== 'object' ) {
				return;
			}

			const newBalances : Record<string, Balance> = {}

			for ( const id in debts ) {
				const others = debts[ id ]
				newBalances[ id ] =  { id, owes: {}, owed: {} }

				for (const otherId in others) {
					let debt = others[otherId];

					const otherDebt = debts[ otherId ]?.[ id ] || 0

					const balance = otherDebt - debt

					if ( balance > 0 ) {
						newBalances[ id ].owed[ otherId ] = balance
					} else if ( balance < 0 ) {
						newBalances[ id ].owes[ otherId ] = balance * -1
					}
				}
			}

			this.balance.set( newBalances )
	  	});
	}
}
