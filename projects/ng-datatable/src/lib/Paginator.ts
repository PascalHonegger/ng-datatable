import { Component, OnChanges, inject, input } from "@angular/core";
import { DataTable, PageEvent } from "./DataTable";

@Component({
  selector: "mfPaginator",
  template: `<ng-content></ng-content>`,
})
export class Paginator implements OnChanges {
  #injectMfTable = inject(DataTable, { optional: true })!;

  readonly inputMfTable = input<DataTable>(undefined, { alias: "mfTable" });

  #mfTable: DataTable;

  activePage: number;
  rowsOnPage: number;
  dataLength = 0;
  lastPage: number;

  ngOnChanges(): any {
    this.#mfTable = this.inputMfTable() ?? this.#injectMfTable;
    this.#onPageChangeSubscriber(this.#mfTable.getPage());
    this.#mfTable.onPageChange.subscribe(this.#onPageChangeSubscriber);
  }

  setPage(pageNumber: number): void {
    this.#mfTable.setPage(pageNumber, this.rowsOnPage);
  }

  setRowsOnPage(rowsOnPage: number): void {
    this.#mfTable.setPage(this.activePage, rowsOnPage);
  }

  #onPageChangeSubscriber = (event: PageEvent) => {
    this.activePage = event.activePage;
    this.rowsOnPage = event.rowsOnPage;
    this.dataLength = event.dataLength;
    this.lastPage = Math.ceil(this.dataLength / this.rowsOnPage);
  };
}
