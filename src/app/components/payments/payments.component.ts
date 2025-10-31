import { Component } from '@angular/core';

import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';

@Component({
	selector: 'ss-payments',
	imports: [NzListModule, NzButtonModule,  NzIconModule, NzDropDownModule, NzFlexModule],
	templateUrl: './payments.component.html',
	styleUrl: './payments.component.scss'
})
export class PaymentsComponent {
	amount = '₱ 250';
}
