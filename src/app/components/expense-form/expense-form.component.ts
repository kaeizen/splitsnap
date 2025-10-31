import { Component, computed, inject, signal, TemplateRef, ViewChild, WritableSignal } from '@angular/core';
import {FormsModule } from '@angular/forms';

import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzMessageComponent, NzMessageService } from 'ng-zorro-antd/message';
import { MemberStore, ExpenseStore } from '../../store/store';
import { Member,
	 MemberWithAmount,
	 MemberWithAmountPercent, Expense } from '../../store/models';
import { CommonModule, DecimalPipe } from '@angular/common';
import { nanoid } from 'nanoid';
import { validateExpense } from './util';



@Component({
	selector: 'ss-expense-form',
	imports: [
		NzCardModule, NzButtonModule, NzInputModule,
		FormsModule, NzListModule, NzInputNumberModule,
		NzSegmentedModule, NzTagModule, NzDatePickerModule,
		NzGridModule, NzFlexModule, CommonModule
	],
	templateUrl: './expense-form.component.html',
	styleUrl: './expense-form.component.scss'
})

export class ExpenseFormComponent {
	memberStore = inject( MemberStore );
	expenseStore = inject( ExpenseStore );
	description = signal<string>('');
	amount = signal<number|null>(null);
	date = signal<Date>( new Date() );
	splitMode = signal<string>('equal');

	options = ['Equal', 'Custom (%)', 'Custom (₱)'];
	formatterPercent = (value: number): string => `${value}%`;
	parserPercent = (value: string): number => +value?.replace('%', '');

	membersToPay = signal<{ [ key: string ]: MemberWithAmountPercent }>( {} );
	membersPaid = signal<{ [ key: string ]: MemberWithAmount }>( {} );
	membersToPayArr = computed(() => Object.values(this.membersToPay()));
	membersPaidArr = computed(() => Object.values(this.membersPaid()));

	constructor(private message: NzMessageService) {}

	@ViewChild('errorTpl', { static: true }) errorTpl!: TemplateRef<{
		$implicit: NzMessageComponent;
		data: string;
	  }>;

	onChangeMembersToPay(checked: boolean, member: Member): void {
		if (checked) {
			this.membersToPay.update(prev => {
				const updated = {
					...prev,
					[ member.id ]: { ...member, amount: 0, percent: 0 }
				}

				const memLength = Object.keys( updated ).length
				if (this.splitMode() === 'equal' && this.amount() != null && memLength > 0) {
					const splitAmount = this.amount()! / memLength;
					const splitPercent = 100 / memLength;
					return Object.fromEntries(
						Object.entries( updated ).map( ([ key, value ]) => ([key, { ...value, amount: splitAmount, percent: splitPercent }]))
					);
				}
				return updated;
			});
		} else {
			this.membersToPay.update(prev => {
				const { [member.id]: _, ...updated } = prev;
				const memLength = Object.keys(updated).length;

				if (this.splitMode() === 'equal' && this.amount() != null && memLength > 0) {
					const splitAmount = this.amount()! / memLength;
					const splitPercent = 100 / memLength;
					return Object.fromEntries(
						Object.entries(updated).map(([key, value]) => [key, { ...value, amount: splitAmount, percent: splitPercent }])
					);
				}
				return updated;
			});
		}
	}

	onChangeMembersPaid(checked: boolean, member: Member): void {
		if (checked) {
			this.membersPaid.update(prev => ({
				...prev,
				[member.id]: { ...member, amount: 0 }
			}));
		} else {
			this.membersPaid.update(prev => {
				const { [member.id]: _, ...updated } = prev;
				return updated;
			});
		}
	}

	onAmountPaidChange(newAmount: number, member: Member): void {
		this.membersPaid.update(prev => ({
			...prev,
			[member.id]: { ...prev[member.id], amount: newAmount }
		}));
	}


	onAmountChange( newAmount: number ): void {
		this.amount.set( newAmount );
		const members = this.membersToPay();
		const memLength = Object.keys(members).length;
		if (memLength > 0) {
			if (this.splitMode() === 'equal') {
				const splitAmount = newAmount / memLength;
				const splitPercent = 100 / memLength;
				this.membersToPay.update(prev =>
					Object.fromEntries(
						Object.entries(prev).map(([key, value]) => [key, { ...value, amount: splitAmount, percent: splitPercent }])
					)
				);
			} else {
				// For other split modes, recalculate percent based on the amount
				const totalAmount = newAmount;
				this.membersToPay.update(prev =>
					Object.fromEntries(
						Object.entries(prev).map(([key, value]) => {
							const amount = value.amount ?? 0;
							const percent = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
							return [key, { ...value, percent }];
						})
					)
				);
			}
		}
	}

	onMemberPercentChange( newPercent: number, member: MemberWithAmountPercent ): void {
		this.membersToPay.update(prev => {
			const percent = newPercent;
			const amount = this.amount() ? (this.amount() as number) * (percent / 100) : 0;
			return {
				...prev,
				[member.id]: { ...prev[member.id], percent, amount }
			};
		});
	}

	onMemberAmountChange( newAmount: number, member: MemberWithAmountPercent ): void {
		this.membersToPay.update(prev => {
			const totalAmount = this.amount() ? (this.amount() as number) : 0;
			const percent = totalAmount > 0 ? (newAmount / totalAmount) * 100 : 0;
			return {
				...prev,
				[member.id]: { ...prev[member.id], amount: newAmount, percent }
			};
		});
	}

	onSplitModeChange( newSplitMode: string ): void {
		if (newSplitMode === 'equal') {
			const members = this.membersToPay();
			const count = Object.keys(members).length;
			const totalAmount = this.amount() ?? 0;
			if (count > 0) {
				const splitAmount = totalAmount / count;
				const splitPercent = 100 / count;
				this.membersToPay.update(prev =>
					Object.fromEntries(
						Object.entries(prev).map(([key, value]) => ([key, { ...value, amount: splitAmount, percent: splitPercent }]))
					)
				);
			}
		}
	}

	onFormSubmit() {
		const newExpense: Expense = {
			id: nanoid(),
			description: this.description() ?? '',
			amount: this.amount() ?? 0,
			date: this.date() ?? new Date(),
			splitMode: this.splitMode() ?? '',
			membersToPay: this.membersToPay() ?? {},
			membersPaid: this.membersPaid() ?? {}
		}

		const errors = validateExpense(newExpense);

		if (errors.length > 0) {
			this.message.error( this.errorTpl, { nzPauseOnHover: true, nzData: errors.join("\n") });
			return;
		}


		this.expenseStore.addExpense(newExpense);

		this.message.success('Expense added successfully');
		this.description.set('');
		this.amount.set(null);
		this.date.set(new Date());
		this.splitMode.set('equal');
		this.membersToPay.set({});
		this.membersPaid.set({});
	}
}
