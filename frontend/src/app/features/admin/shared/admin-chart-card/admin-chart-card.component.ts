import { Component, Input, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule, ChartComponent as ApexChartComponent } from 'ng-apexcharts';

@Component({
  selector: 'fs-admin-chart-card',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  template: `
    <div class="rounded-2xl border border-slate-200/80 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <!-- Header -->
      <div class="flex items-center justify-between px-5 pt-5 pb-2">
        <div>
          <h3 class="text-sm font-semibold text-slate-900 dark:text-white">{{ title }}</h3>
          @if (subtitle) {
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{{ subtitle }}</p>
          }
        </div>
        <ng-content select="[headerActions]"></ng-content>
      </div>

      <!-- Chart -->
      <div class="px-3 pb-3 relative" [style.min-height.px]="height">
        @if (loading) {
          <div class="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm z-10 rounded-b-2xl">
            <div class="flex flex-col items-center gap-2">
              <div class="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              <span class="text-xs text-slate-400">Loading chart...</span>
            </div>
          </div>
        }
        @if (chartOptions) {
          <apx-chart
            #chartRef
            [series]="chartOptions.series"
            [chart]="chartOptions.chart"
            [xaxis]="chartOptions.xaxis"
            [yaxis]="chartOptions.yaxis"
            [stroke]="chartOptions.stroke"
            [fill]="chartOptions.fill"
            [dataLabels]="chartOptions.dataLabels"
            [plotOptions]="chartOptions.plotOptions"
            [colors]="chartOptions.colors"
            [grid]="chartOptions.grid"
            [tooltip]="chartOptions.tooltip"
            [legend]="chartOptions.legend"
            [responsive]="chartOptions.responsive"
            [labels]="chartOptions.labels"
          />
        }
      </div>
    </div>
  `
})
export class AdminChartCardComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() loading = false;
  @Input() height = 280;
  @Input() chartOptions: any = null;

  @ViewChild('chartRef') chartRef?: ApexChartComponent;
}
