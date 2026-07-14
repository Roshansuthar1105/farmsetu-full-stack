import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import {
  LucideCoins,
  LucideReceipt,
  LucideAward,
  LucideCalculator,
  LucidePlusCircle,
  LucideSparkles,
  LucideCheckCircle,
  LucideX
} from '@lucide/angular';

@Component({
  selector: 'fs-financial',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideCoins,
    LucideReceipt,
    LucideAward,
    LucideCalculator,
    LucidePlusCircle,
    LucideSparkles,
    LucideCheckCircle,
    LucideX
  ],
  templateUrl: './financial.component.html'
})
export class FinancialComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly schemes = signal<any[]>([]);
  readonly report = signal<any>(null);

  readonly activeTab = signal<'expenses' | 'loans' | 'roi'>('expenses');
  readonly showExpenseModal = signal(false);
  readonly submittingExpense = signal(false);
  readonly submittingLoan = signal(false);
  readonly submittingRoi = signal(false);

  readonly maxLoanAmount = signal(0);
  readonly eligibilityResult = signal<any>(null);
  readonly roiResult = signal<{
    grossReturn: number;
    netProfit: number;
    roi: number;
    profitMarginRatio: number;
  } | null>(null);

  expenseForm = {
    expenseType: 'Seeds',
    amount: null as number | null,
    date: new Date().toISOString().substring(0, 10),
    season: 'KHARIF',
    description: ''
  };

  loanForm = {
    income: null as number | null,
    area: null as number | null,
    existingDebt: null as number | null
  };

  roiForm = {
    quantity: null as number | null,
    pricePerQuintal: null as number | null,
    totalCost: null as number | null
  };

  readonly expensesList = computed(() => {
    const expenses = this.report()?.['expenses'];
    return Array.isArray(expenses) ? expenses : [];
  });

  readonly expenseCount = computed(() => this.expensesList().length);

  ngOnInit(): void {
    this.loadSchemes();
    this.loadReport();
  }

  loadSchemes(): void {
    this.api.get<any[]>('/api/finance/schemes').subscribe({
      next: (d) => this.schemes.set(d || [])
    });
  }

  loadReport(): void {
    this.loading.set(true);
    const id = this.auth.currentUser()?.id ?? 1;
    this.api.get<any>(`/api/finance/report/${id}`).subscribe({
      next: (d) => {
        this.report.set(d);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  openExpenseModal(): void {
    this.resetExpenseForm();
    this.showExpenseModal.set(true);
  }

  closeExpenseModal(): void {
    this.showExpenseModal.set(false);
  }

  resetExpenseForm(): void {
    this.expenseForm = {
      expenseType: 'Seeds',
      amount: null,
      date: new Date().toISOString().substring(0, 10),
      season: 'KHARIF',
      description: ''
    };
  }

  submitExpense(): void {
    if (!this.expenseForm.amount || !this.expenseForm.date) {
      return;
    }
    this.submittingExpense.set(true);
    const farmerId = this.auth.currentUser()?.id ?? 1;
    const year = this.expenseForm.date ? new Date(this.expenseForm.date).getFullYear() : new Date().getFullYear();
    const payload = {
      farmer: { id: farmerId },
      expenseType: this.expenseForm.expenseType,
      amount: this.expenseForm.amount,
      description: this.expenseForm.description,
      date: this.expenseForm.date,
      season: this.expenseForm.season,
      year: year
    };

    this.api.post<any>('/api/finance/expenses', payload).subscribe({
      next: () => {
        this.submittingExpense.set(false);
        this.closeExpenseModal();
        this.loadReport();
      },
      error: () => {
        this.submittingExpense.set(false);
      }
    });
  }

  checkLoanEligibility(): void {
    if (!this.loanForm.income || !this.loanForm.area) {
      return;
    }
    this.submittingLoan.set(true);
    const payload = {
      income: this.loanForm.income,
      area: this.loanForm.area,
      existingDebt: this.loanForm.existingDebt ?? 0
    };
    this.api.post<any>('/api/finance/loan-eligibility', payload).subscribe({
      next: (res) => {
        const maxAmount = res?.['maxAmount'] ?? 200000;
        this.maxLoanAmount.set(Number(maxAmount));
        this.eligibilityResult.set(res || {});
        this.submittingLoan.set(false);
      },
      error: () => {
        this.maxLoanAmount.set(0);
        this.eligibilityResult.set(null);
        this.submittingLoan.set(false);
      }
    });
  }

  calculateRoi(): void {
    if (!this.roiForm.quantity || !this.roiForm.pricePerQuintal || !this.roiForm.totalCost) {
      return;
    }
    this.submittingRoi.set(true);
    const payload = {
      quantity: this.roiForm.quantity,
      pricePerQuintal: this.roiForm.pricePerQuintal,
      totalCost: this.roiForm.totalCost
    };
    this.api.post<any>('/api/finance/calculate', payload).subscribe({
      next: (res) => {
        const inputData = res?.['result'] ?? payload;
        const qty = Number(inputData.quantity ?? payload.quantity);
        const price = Number(inputData.pricePerQuintal ?? payload.pricePerQuintal);
        const cost = Number(inputData.totalCost ?? payload.totalCost);

        const grossReturn = qty * price;
        const netProfit = grossReturn - cost;
        const roi = cost > 0 ? (netProfit / cost) * 100 : 0;
        const profitMarginRatio = grossReturn > 0 ? (netProfit / grossReturn) * 100 : 0;

        this.roiResult.set({
          grossReturn,
          netProfit,
          roi,
          profitMarginRatio
        });
        this.submittingRoi.set(false);
      },
      error: () => {
        this.roiResult.set(null);
        this.submittingRoi.set(false);
      }
    });
  }
}
