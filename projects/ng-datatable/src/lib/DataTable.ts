import { Directive, input, model, effect, untracked, computed } from '@angular/core';
import { Subject } from 'rxjs';

export type SortOrder = 'asc' | 'desc';
export type SortByFunction<T = any> = (data: T) => any;
export type SortBy<T = any> = string | SortByFunction<T> | (string | SortByFunction<T>)[];

export interface SortEvent {
  sortBy: SortBy;
  sortOrder: string;
}

export interface PageEvent {
  activePage: number;
  rowsOnPage: number;
  dataLength: number;
}

export interface DataEvent {
  length: number;
}

@Directive({
  selector: 'table[mfData]',
  exportAs: 'mfDataTable',
})
export class DataTable<T = any> {
  readonly inputData = input<readonly T[], readonly T[] | null | undefined>([], {
    alias: 'mfData',
    transform: (i) => i ?? [],
  });

  readonly sortBy = model<SortBy<T>>('', { alias: 'mfSortBy' });
  readonly sortOrder = model<SortOrder>('asc', { alias: 'mfSortOrder' });

  readonly rowsOnPage = model(1000, { alias: 'mfRowsOnPage' });
  readonly activePage = model(1, { alias: 'mfActivePage' });

  readonly inputDataLength = computed(() => this.inputData().length);

  readonly data = computed<readonly T[]>(() => {
    const offset = (this.activePage() - 1) * this.rowsOnPage();

    return [...this.inputData()]
      .sort(this.sorter(this.sortBy(), this.sortOrder()))
      .slice(offset, offset + this.rowsOnPage());
  });

  onSortChange = new Subject<SortEvent>();
  onPageChange = new Subject<PageEvent>();

  constructor() {
    // Events which were published based on the old API, could probably be deleted at some point
    effect(() => {
      const sortBy = this.sortBy();
      const sortOrder = this.sortOrder();
      if (sortBy) {
        this.onSortChange.next({ sortBy: sortBy, sortOrder: sortOrder });
      }
    });
    effect(() => {
      this.onPageChange.next({
        activePage: this.activePage(),
        rowsOnPage: this.rowsOnPage(),
        dataLength: this.inputDataLength(),
      });
    });

    effect(() => {
      this.setPage(untracked(this.activePage), this.rowsOnPage());
    });
    effect(() => {
      const inputDataLength = this.inputDataLength();
      const rowsOnPage = this.rowsOnPage();
      const activePage = untracked(this.activePage);
      const lastPage = Math.ceil(inputDataLength / rowsOnPage);
      const newActivePage = (lastPage < activePage ? lastPage : activePage) || 1;
      this.activePage.set(newActivePage);
    });
  }

  getSort(): SortEvent {
    return { sortBy: this.sortBy(), sortOrder: this.sortOrder() };
  }

  setSort(sortBy: SortBy<T>, sortOrder: SortOrder): void {
    this.sortBy.set(sortBy);
    this.sortOrder.set(['asc', 'desc'].includes(sortOrder) ? sortOrder : 'asc');
  }

  getPage(): PageEvent {
    return {
      activePage: this.activePage(),
      rowsOnPage: this.rowsOnPage(),
      dataLength: this.inputDataLength(),
    };
  }

  setPage(activePage: number, rowsOnPage: number): void {
    if (this.rowsOnPage() !== rowsOnPage || this.activePage() !== activePage) {
      this.rowsOnPage.set(rowsOnPage);
      this.activePage.set(
        this.activePage() !== activePage
          ? activePage
          : this.calculateNewActivePage(this.rowsOnPage(), rowsOnPage),
      );
    }
  }

  private calculateNewActivePage(previousRowsOnPage: number, currentRowsOnPage: number): number {
    const firstRowOnPage = (this.activePage() - 1) * previousRowsOnPage + 1;
    const newActivePage = Math.ceil(firstRowOnPage / currentRowsOnPage);
    return newActivePage;
  }

  private caseInsensitiveIteratee(sortBy: string | SortByFunction) {
    return (row: any): any => {
      let value = row;
      if (typeof sortBy === 'string' || sortBy instanceof String) {
        for (const sortByProperty of sortBy.split('.')) {
          if (value) {
            value = value[sortByProperty];
          }
        }
      } else if (typeof sortBy === 'function') {
        value = sortBy(value);
      }

      if ((value && typeof value === 'string') || value instanceof String) {
        return value.toLowerCase();
      }

      return value;
    };
  }

  private compare(left: any, right: any): number {
    if (left === right) {
      return 0;
    }
    if (left == null && right != null) {
      return -1;
    }
    if (right == null) {
      return 1;
    }
    return left > right ? 1 : -1;
  }

  private sorter<T>(sortBy: SortBy<T>, sortOrder: SortOrder): (left: T, right: T) => number {
    const order = sortOrder === 'desc' ? -1 : 1;
    if (Array.isArray(sortBy)) {
      const iteratees = sortBy.map((entry) => this.caseInsensitiveIteratee(entry));
      return (left, right) => {
        for (const iteratee of iteratees) {
          const comparison = this.compare(iteratee(left), iteratee(right)) * order;
          if (comparison !== 0) {
            return comparison;
          }
        }
        return 0;
      };
    } else {
      const iteratee = this.caseInsensitiveIteratee(sortBy);
      return (left, right) => this.compare(iteratee(left), iteratee(right)) * order;
    }
  }
}
