import { Component, inject, signal } from '@angular/core';
import {FormsModule } from '@angular/forms';

import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { MemberStore } from '../../store/store';

@Component({
	selector: 'ss-members',
	imports: [ NzCardModule, NzButtonModule, NzInputModule, FormsModule, NzIconModule, NzListModule, NzGridModule ],
	templateUrl: './members.component.html',
	styleUrl: './members.component.scss'
})
export class MembersComponent {
	store = inject( MemberStore );
	newName = signal<string>('');

	submitForm(): void {
		if ( this.newName().trim() === '' ) {
			alert('Name is required');
			return;
		}
		this.store.addMember( this.newName() );
		this.newName.set('');
	}

	onDelete( id: string ): void {
		this.store.removeMember( id )
	}
}
