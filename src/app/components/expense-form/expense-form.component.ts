import { Component, inject, signal, WritableSignal } from '@angular/core';
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
		NzGridModule, NzFlexModule, DecimalPipe, CommonModule
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

	membersToPay = signal<MemberWithAmountPercent[]>( [] );
	membersPaid = signal<MemberWithAmount[]>( [] );

	onChangeMembersToPay(checked: boolean, member: Member): void {
		if (checked) {
			this.membersToPay.update(arr => {
				const updatedArr = [
					...arr,
					{ ...member, amount: 0, percent: 0 }
				];
				if (this.splitMode() === 'equal' && this.amount() != null && updatedArr.length > 0) {
					const splitAmount = this.amount()! / updatedArr.length;
					const splitPercent = 100 / updatedArr.length;
					return updatedArr.map(m => ({
						...m,
						amount: splitAmount,
						percent: splitPercent
					}));
				}
				return updatedArr;
			});
		} else {
			this.membersToPay.update(arr => {
				const idx = arr.findIndex(m => m.id === member.id);
				if (idx !== -1) {
					const newArr = [...arr];
					newArr.splice(idx, 1);
					if (this.splitMode() === 'equal' && this.amount() != null && newArr.length > 0) {
						const splitAmount = this.amount()! / newArr.length;
						const splitPercent = 100 / newArr.length;
						return newArr.map(m => ({
							...m,
							amount: splitAmount,
							percent: splitPercent
						}));
					}
					return newArr;
				}
				return arr;
			});
		}
	}

	onChangeMembersPaid(checked: boolean, member: Member): void {
		if (checked) {
			this.membersPaid.update(arr => [...arr, { ...member, amount: 0 }]);
		} else {
			this.membersPaid.update(arr => {
			const idx = arr.findIndex(m => m.id === member.id);
			if (idx !== -1) {
				const newArr = [...arr];
				newArr.splice(idx, 1);
				return newArr;
			}
			return arr;
		});
		}
	}

	onAmountPaidChange(newAmount: number, member: Member): void {
		this.membersPaid.update(arr => {
			const idx = arr.findIndex(m => m.id === member.id);
			if (idx !== -1) {
				const newArr = [...arr];
				newArr[idx] = { ...newArr[idx], amount: newAmount };
				return newArr;
			}
			return arr;
		});
	}


	onAmountChange( newAmount: number ): void {
		const members = this.membersToPay();
		if (members.length > 1) {
			if (this.splitMode() === 'equal') {
				const splitAmount = newAmount / members.length;
				const splitPercent = 100 / members.length;
				this.membersToPay.update(arr =>
					arr.map(m => ({ ...m, amount: splitAmount, percent: splitPercent }))
				);
			} else {
				// For other split modes, recalculate percent based on the amount
				const totalAmount = newAmount;
				this.membersToPay.update(arr =>
					arr.map(m => {
						const amount = m.amount ?? 0;
						const percent = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
						return { ...m, percent };
					})
				);
			}
		}
	}

	onMemberPercentChange( newPercent: number, index: number ): void {
		this.membersToPay.update(arr => {
			if (index < 0 || index >= arr.length) return arr;
			const newArr = [...arr];
			const percent = newPercent;
			const amount = this.amount() ? (this.amount() as number) * (percent / 100) : 0;
			newArr[index] = { ...newArr[index], percent, amount };
			return newArr;
		});
	}

	onMemberAmountChange( newAmount: number, index: number ): void {
		this.membersToPay.update(arr => {
			if (index < 0 || index >= arr.length) return arr;
			const newArr = [...arr];
			const totalAmount = this.amount() ? (this.amount() as number) : 0;
			const percent = totalAmount > 0 ? (newAmount / totalAmount) * 100 : 0;
			newArr[index] = { ...newArr[index], amount: newAmount, percent };
			return newArr;
		});
	}

	onSplitModeChange( newSplitMode: string ): void {
		if (newSplitMode === 'equal') {
			const members = this.membersToPay();
			const count = members.length;
			const totalAmount = this.amount() ?? 0;
			if (count > 0) {
				const splitAmount = totalAmount / count;
				const splitPercent = 100 / count;
				this.membersToPay.update(arr =>
					arr.map(m => ({
						...m,
						amount: splitAmount,
						percent: splitPercent
					}))
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
			membersToPay: this.membersToPay() ?? [],
			membersPaid: this.membersPaid() ?? []
		}
		const errors = validateExpense(newExpense);

		if (errors.length > 0) {
			alert('Please fix the following errors:\n' + errors.join('\n'));
			return;
		}

		this.expenseStore.addExpense(newExpense);
	}
}
