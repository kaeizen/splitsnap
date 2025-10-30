import { Component } from '@angular/core';

@Component({
	selector: 'ss-footer',
	imports: [],
	templateUrl: './footer.component.html',
	styleUrl: './footer.component.scss'
})
export class FooterComponent {
	currentYear: number;

	constructor() {
		this.currentYear = new Date().getFullYear();
	}
}
