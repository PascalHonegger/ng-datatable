import { Component, OnChanges, inject, input } from "@angular/core";
import {DataTable, PageEvent} from "./DataTable";

@Component({
    selector: "mfPaginator",
    template: `<ng-content></ng-content>`
})
export class Paginator implements OnChanges {
    private injectMfTable = inject(DataTable, { optional: true })!;

    readonly inputMfTable = input<DataTable>(undefined, { alias: "mfTable" });

    private mfTable: DataTable;

    public activePage: number;
    public rowsOnPage: number;
    public dataLength = 0;
    public lastPage: number;

    public ngOnChanges(): any {
        this.mfTable = this.inputMfTable() ?? this.injectMfTable;
        this.onPageChangeSubscriber(this.mfTable.getPage());
        this.mfTable.onPageChange.subscribe(this.onPageChangeSubscriber);
    }

    public setPage(pageNumber: number): void {
        this.mfTable.setPage(pageNumber, this.rowsOnPage);
    }

    public setRowsOnPage(rowsOnPage: number): void {
        this.mfTable.setPage(this.activePage, rowsOnPage);
    }

    private onPageChangeSubscriber = (event: PageEvent) => {
        this.activePage = event.activePage;
        this.rowsOnPage = event.rowsOnPage;
        this.dataLength = event.dataLength;
        this.lastPage = Math.ceil(this.dataLength / this.rowsOnPage);
    }
}
