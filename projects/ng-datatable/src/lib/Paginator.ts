import {
  Component,
  OnChanges,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import { DataTable, PageEvent } from "./DataTable";

@Component({
  selector: "mfPaginator",
  template: `<ng-content></ng-content>`,
})
export class Paginator implements OnChanges {
  #injectMfTable = inject(DataTable, { optional: true })!;

  readonly inputMfTable = input<DataTable>(undefined, { alias: "mfTable" });

  #mfTable: DataTable;

  activePage = signal<number>(0);
  rowsOnPage = signal<number>(0);
  dataLength = signal<number>(0);
  lastPage = computed(() =>
    this.rowsOnPage() === 0
      ? 0
      : Math.ceil(this.dataLength() / this.rowsOnPage())
  );

  ngOnChanges(): any {
    this.#mfTable = this.inputMfTable() ?? this.#injectMfTable;
    this.#onPageChangeSubscriber(this.#mfTable.getPage());
    this.#mfTable.onPageChange.subscribe(this.#onPageChangeSubscriber);
  }

  setPage(pageNumber: number): void {
    this.#mfTable.setPage(pageNumber, this.rowsOnPage());
  }

  setRowsOnPage(rowsOnPage: number): void {
    this.#mfTable.setPage(this.activePage(), rowsOnPage);
  }

  #onPageChangeSubscriber = (event: PageEvent) => {
    this.activePage.set(event.activePage);
    this.rowsOnPage.set(event.rowsOnPage);
    this.dataLength.set(event.dataLength);
  };
}
