import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MembersComponent, ExpenseFormComponent, ExpenseListComponent, SettlementComponent } from '../components';

import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

@Component({
	selector: 'ss-main',
	imports: [MembersComponent, NzCardModule, NzTabsModule, CommonModule],
	templateUrl: './main.component.html',
	styleUrl: './main.component.scss'
})
export class MainComponent {
	expenseSelectedTab = 0;
	expenseTabs = [
		ExpenseFormComponent,
		ExpenseListComponent,
	]

	settlementSelectedTab = 0;
	settlementTabs = [
		SettlementComponent,
		// PaymentsComponent,
	]
}
