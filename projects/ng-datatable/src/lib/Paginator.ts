import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { DataTable, PageEvent } from './DataTable';
import { Subscription } from 'rxjs';

@Component({
  selector: 'mfPaginator',
  template: `<ng-content />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Paginator {
  private injectMfTable = inject(DataTable, { optional: true })!;

  /** explicitly specify reference data table, by default the parent `mfData` is injected */
  readonly inputMfTable = input<DataTable>(undefined, { alias: 'mfTable' });
  private readonly mfTable = computed<DataTable>(() => this.inputMfTable() ?? this.injectMfTable);

  readonly activePage = signal<number>(0);
  readonly rowsOnPage = signal<number>(0);
  readonly dataLength = signal<number>(0);
  readonly lastPage = computed<number>(() => {
    const rowsOnPage = this.rowsOnPage();
    const dataLength = this.dataLength();
    return rowsOnPage === 0 ? 0 : Math.ceil(dataLength / rowsOnPage);
  });

  constructor() {
    let currentSubscription: Subscription | undefined = undefined;
    effect(() => {
      const currentTable = this.mfTable();
      this.onPageChangeSubscriber(currentTable.getPage());
      currentSubscription?.unsubscribe();
      currentSubscription = currentTable.onPageChange.subscribe(this.onPageChangeSubscriber);
    });
    inject(DestroyRef).onDestroy(() => {
      currentSubscription?.unsubscribe();
    });
  }

  setPage(pageNumber: number): void {
    this.mfTable().setPage(pageNumber, this.rowsOnPage());
  }

  setRowsOnPage(rowsOnPage: number): void {
    this.mfTable().setPage(this.activePage(), rowsOnPage);
  }

  private onPageChangeSubscriber = (event: PageEvent) => {
    this.activePage.set(event.activePage);
    this.rowsOnPage.set(event.rowsOnPage);
    this.dataLength.set(event.dataLength);
  };
}
