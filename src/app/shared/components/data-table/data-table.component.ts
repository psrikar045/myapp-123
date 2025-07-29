import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SelectionModel } from '@angular/cdk/collections';

import { TableColumn, TableAction, PaginationParams } from '../../models/common.models';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule
  ],
  template: `
    <div class="data-table-container">
      <!-- Search and Actions Bar -->
      <div class="data-table-header" *ngIf="showSearch || actions.length > 0">
        <div class="search-container" *ngIf="showSearch">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search</mat-label>
            <input matInput 
                   [(ngModel)]="searchQuery" 
                   (ngModelChange)="onSearchChange($event)"
                   [placeholder]="searchPlaceholder">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
        </div>
        
        <div class="actions-container" *ngIf="actions.length > 0">
          <button mat-raised-button 
                  *ngFor="let action of actions"
                  [color]="action.color || 'primary'"
                  (click)="action.handler(selectedRows)"
                  [disabled]="action.disabled && action.disabled(selectedRows)">
            <mat-icon *ngIf="action.icon">{{ action.icon }}</mat-icon>
            {{ action.label }}
          </button>
        </div>
      </div>

      <!-- Data Table -->
      <div class="table-wrapper">
        <table mat-table 
               [dataSource]="data" 
               matSort 
               (matSortChange)="onSortChange($event)"
               class="data-table">
          
          <!-- Selection Column -->
          <ng-container matColumnDef="select" *ngIf="selectable">
            <th mat-header-cell *matHeaderCellDef>
              <mat-checkbox (change)="$event ? masterToggle() : null"
                           [checked]="selection.hasValue() && isAllSelected()"
                           [indeterminate]="selection.hasValue() && !isAllSelected()">
              </mat-checkbox>
            </th>
            <td mat-cell *matCellDef="let row">
              <mat-checkbox (click)="$event.stopPropagation()"
                           (change)="$event ? selection.toggle(row) : null"
                           [checked]="selection.isSelected(row)">
              </mat-checkbox>
            </td>
          </ng-container>

          <!-- Data Columns -->
          <ng-container *ngFor="let column of columns" [matColumnDef]="getColumnKey(column)">
            <th mat-header-cell 
                *matHeaderCellDef 
                [mat-sort-header]="column.sortable ? getColumnKey(column) : ''"
                [style.width]="column.width"
                [style.text-align]="column.align || 'left'">
              {{ column.label }}
            </th>
            <td mat-cell 
                *matCellDef="let row" 
                [style.text-align]="column.align || 'left'">
              <ng-container [ngSwitch]="column.type">
                <!-- Custom render function -->
                <span *ngSwitchCase="'custom'" 
                      [innerHTML]="column.render ? column.render(row[column.key], row) : row[column.key]">
                </span>
                
                <!-- Boolean type -->
                <mat-icon *ngSwitchCase="'boolean'" 
                         [color]="row[column.key] ? 'primary' : 'warn'">
                  {{ row[column.key] ? 'check_circle' : 'cancel' }}
                </mat-icon>
                
                <!-- Date type -->
                <span *ngSwitchCase="'date'">
                  {{ formatDate(row[column.key]) }}
                </span>
                
                <!-- Number type -->
                <span *ngSwitchCase="'number'">
                  {{ formatNumber(row[column.key]) }}
                </span>
                
                <!-- Actions type -->
                <div *ngSwitchCase="'actions'" class="row-actions">
                  <button mat-icon-button 
                          *ngFor="let rowAction of rowActions"
                          [matTooltip]="rowAction.label"
                          (click)="rowAction.handler(row); $event.stopPropagation()"
                          [disabled]="rowAction.disabled && rowAction.disabled(row)">
                    <mat-icon [color]="rowAction.color" *ngIf="!rowAction.visible || rowAction.visible(row)">{{ rowAction.icon }}</mat-icon>
                  </button>
                </div>
                
                <!-- Default text -->
                <span *ngSwitchDefault>
                  {{ column.format ? column.format(row[column.key]) : row[column.key] }}
                </span>
              </ng-container>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row 
              *matRowDef="let row; columns: displayedColumns;"
              (click)="onRowClick(row)"
              [class.selected]="selection.isSelected(row)">
          </tr>
        </table>
      </div>

      <!-- Paginator -->
      <mat-paginator *ngIf="showPagination"
                     [length]="totalItems"
                     [pageSize]="pageSize"
                     [pageSizeOptions]="pageSizeOptions"
                     [pageIndex]="currentPage"
                     (page)="onPageChange($event)"
                     showFirstLastButtons>
      </mat-paginator>

      <!-- No Data Message -->
      <div class="no-data" *ngIf="data.length === 0 && !loading">
        <mat-icon>inbox</mat-icon>
        <p>{{ noDataMessage }}</p>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="loading">
        <mat-icon class="spinning">refresh</mat-icon>
        <p>Loading...</p>
      </div>
    </div>
  `,
  styles: [`
    .data-table-container {
      width: 100%;
    }

    .data-table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      gap: 16px;
    }

    .search-field {
      min-width: 300px;
    }

    .actions-container {
      display: flex;
      gap: 8px;
    }

    .table-wrapper {
      overflow-x: auto;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
    }

    .data-table {
      width: 100%;
      min-width: 600px;
    }

    .mat-mdc-row:hover {
      background-color: #f5f5f5;
    }

    .mat-mdc-row.selected {
      background-color: #e3f2fd;
    }

    .row-actions {
      display: flex;
      gap: 4px;
    }

    .no-data, .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 16px;
      color: #666;
    }

    .no-data mat-icon, .loading-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class DataTableComponent<T = any> implements OnInit, OnChanges {
  @Input() data: T[] = [];
  @Input() columns: TableColumn<T>[] = [];
  @Input() actions: TableAction<T[]>[] = [];
  @Input() rowActions: TableAction<T>[] = [];
  @Input() loading = false;
  @Input() selectable = false;
  @Input() showSearch = true;
  @Input() showPagination = true;
  @Input() searchPlaceholder = 'Search...';
  @Input() noDataMessage = 'No data available';
  @Input() totalItems = 0;
  @Input() pageSize = 10;
  @Input() currentPage = 0;
  @Input() pageSizeOptions = [5, 10, 25, 50, 100];

  @Output() sortChange = new EventEmitter<Sort>();
  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() rowClick = new EventEmitter<T>();
  @Output() selectionChange = new EventEmitter<T[]>();

  displayedColumns: string[] = [];
  searchQuery = '';
  selection = new SelectionModel<T>(true, []);
  selectedRows: T[] = [];

  ngOnInit() {
    this.updateDisplayedColumns();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['columns']) {
      this.updateDisplayedColumns();
    }
  }

  private updateDisplayedColumns() {
    this.displayedColumns = [];
    
    if (this.selectable) {
      this.displayedColumns.push('select');
    }
    
    this.displayedColumns.push(...this.columns.map(col => this.getColumnKey(col)));
  }

  getColumnKey(column: TableColumn<T>): string {
    return String(column.key);
  }

  onSortChange(sort: Sort) {
    this.sortChange.emit(sort);
  }

  onPageChange(event: PageEvent) {
    this.pageChange.emit(event);
  }

  onSearchChange(query: string) {
    this.searchQuery = query;
    this.searchChange.emit(query);
  }

  onRowClick(row: T) {
    this.rowClick.emit(row);
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.data.forEach(row => this.selection.select(row));
    }
    this.updateSelectedRows();
  }

  isAllSelected(): boolean {
    return this.selection.selected.length === this.data.length;
  }

  private updateSelectedRows() {
    this.selectedRows = this.selection.selected;
    this.selectionChange.emit(this.selectedRows);
  }

  formatDate(date: any): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  }

  formatNumber(num: any): string {
    if (num === null || num === undefined) return '';
    return Number(num).toLocaleString();
  }
}