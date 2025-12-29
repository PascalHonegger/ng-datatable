import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DataTable, SortBy } from './DataTable';

@Component({
  selector: 'mfDefaultSorter',
  template: ` <a
    (click)="sort()"
    (keydown.enter)="sort()"
    (keydown.space)="sort()"
    class="text-nowrap text-decoration-none"
    tabindex="0"
  >
    <ng-content />
    @if (isSortedByMeAsc()) {
      <span aria-hidden="true" aria-label="asc">▲</span>
    } @else if (isSortedByMeDesc()) {
      <span aria-hidden="true" aria-label="desc">▼</span>
    }
  </a>`,
  styles: ['a { cursor: pointer; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultSorter<T = any> {
  private readonly mfTable = inject(DataTable<T>);

  readonly sortBy = input.required<SortBy<T>>({ alias: 'by' });

  readonly isSortedByMeAsc = computed<boolean>(() => {
    const tableSortBy = this.mfTable.sortBy();
    const tableSortOrder = this.mfTable.sortOrder();
    const mySort = this.sortBy();
    return tableSortBy == mySort && tableSortOrder === 'asc';
  });
  readonly isSortedByMeDesc = computed<boolean>(() => {
    const tableSortBy = this.mfTable.sortBy();
    const tableSortOrder = this.mfTable.sortOrder();
    const mySort = this.sortBy();
    return tableSortBy == mySort && tableSortOrder === 'desc';
  });

  sort() {
    if (this.isSortedByMeAsc()) {
      this.mfTable.setSort(this.sortBy(), 'desc');
    } else {
      this.mfTable.setSort(this.sortBy(), 'asc');
    }
    return false;
  }
}
