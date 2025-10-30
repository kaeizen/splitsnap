import { Component } from '@angular/core'
import { FooterComponent, HeaderComponent } from './components';
import { MainComponent } from './main/main.component';

@Component({
	selector: 'ss-root',
	imports: [
		HeaderComponent,
		FooterComponent,
		MainComponent
	],
	template: `
		<header>
			<ss-header />
		</header>
		<main>
			<ss-main />
		</main>
		<footer>
			<ss-footer />
		</footer>
	`,
	styles: [],
})
export class AppComponent {
	title = 'SplitSnap';
}
