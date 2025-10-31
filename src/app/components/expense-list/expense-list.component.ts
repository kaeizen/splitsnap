import { Component, computed, inject } from '@angular/core';

import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTableModule } from 'ng-zorro-antd/table';
import { ExpenseStore, MemberStore } from '../../store/store';
import { DatePipe, DecimalPipe, KeyValuePipe } from '@angular/common';
@Component({
	selector: 'ss-expense-list',
	imports: [NzCollapseModule, NzButtonModule, NzIconModule, NzListModule, NzFlexModule, NzDropDownModule, NzGridModule, NzTableModule, DatePipe, DecimalPipe, KeyValuePipe ],
	templateUrl: './expense-list.component.html',
	styleUrl: './expense-list.component.scss'
})
export class ExpenseListComponent {
	expenseStore = inject( ExpenseStore );
	memberStore = inject( MemberStore );
	expenses = computed( () => this.expenseStore.expenses() );
	members = computed( () => this.memberStore.members().reduce(
		( output: Record<string, string>, member ) => {
			output[ member.id ] = member.name
			return output
		}, {} ) );

	deleteExpense( expenseId : string ) {
		this.expenseStore.removeExpense( expenseId )
	}
}
