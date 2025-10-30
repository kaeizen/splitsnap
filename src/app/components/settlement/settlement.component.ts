import { Component } from '@angular/core';

import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzFlexModule } from 'ng-zorro-antd/flex';

@Component({
	selector: 'ss-settlement',
	imports: [NzCardModule, NzListModule, NzButtonModule, NzIconModule, NzCollapseModule, NzFlexModule ],
	templateUrl: './settlement.component.html',
	styleUrl: './settlement.component.scss'
})
export class SettlementComponent {
panels = [
    {
      active: false,
      name: 'Member 1',
    },
    {
      active: false,
      name: 'Member 2'
    },
    {
      active: false,
      name: 'Member 3'
    }
  ];
}
