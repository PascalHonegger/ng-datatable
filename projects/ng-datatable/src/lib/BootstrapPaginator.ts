import {Component, Input, OnChanges} from "@angular/core";
import {DataTable} from "./DataTable";

@Component({
    selector: "mfBootstrapPaginator",
    template: `
    <mfPaginator #p [mfTable]="mfTable">
      @if (p.dataLength > p.rowsOnPage) {
        <ul class="pagination float-start">
          <li class="page-item" [class.disabled]="p.activePage <= 1" (click)="p.setPage(1)">
            <a class="page-link" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>
          </li>
          @if (p.activePage > 4 && p.activePage + 1 > p.lastPage) {
            <li class="page-item" (click)="p.setPage(p.activePage - 4)">
              <a class="page-link">{{p.activePage-4}}</a>
            </li>
          }
          @if (p.activePage > 3 && p.activePage + 2 > p.lastPage) {
            <li class="page-item" (click)="p.setPage(p.activePage - 3)">
              <a class="page-link">{{p.activePage-3}}</a>
            </li>
          }
          @if (p.activePage > 2) {
            <li class="page-item" (click)="p.setPage(p.activePage - 2)">
              <a class="page-link">{{p.activePage-2}}</a>
            </li>
          }
          @if (p.activePage > 1) {
            <li class="page-item" (click)="p.setPage(p.activePage - 1)">
              <a class="page-link">{{p.activePage-1}}</a>
            </li>
          }
          <li class="page-item active">
            <a class="page-link">{{p.activePage}}</a>
          </li>
          @if (p.activePage + 1 <= p.lastPage) {
            <li class="page-item" (click)="p.setPage(p.activePage + 1)">
              <a class="page-link">{{p.activePage+1}}</a>
            </li>
          }
          @if (p.activePage + 2 <= p.lastPage) {
            <li class="page-item" (click)="p.setPage(p.activePage + 2)">
              <a class="page-link">{{p.activePage+2}}</a>
            </li>
          }
          @if (p.activePage + 3 <= p.lastPage && p.activePage < 3) {
            <li class="page-item" (click)="p.setPage(p.activePage + 3)">
              <a class="page-link">{{p.activePage+3}}</a>
            </li>
          }
          @if (p.activePage + 4 <= p.lastPage && p.activePage < 2) {
            <li class="page-item" (click)="p.setPage(p.activePage + 4)">
              <a class="page-link">{{p.activePage+4}}</a>
            </li>
          }
          <li class="page-item" [class.disabled]="p.activePage >= p.lastPage" (click)="p.setPage(p.lastPage)">
            <a class="page-link" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>
          </li>
        </ul>
      }
      @if (p.dataLength > minRowsOnPage) {
        <ul class="pagination float-end">
          @for (rows of rowsOnPageSet; track rows) {
            <li class="page-item" [class.active]="p.rowsOnPage===rows" (click)="p.setRowsOnPage(rows)">
              <a class="page-link">{{rows}}</a>
            </li>
          }
        </ul>
      }
    </mfPaginator>
    `,
    styles: [
        ".page-link { cursor: pointer; }"
    ]
})
export class BootstrapPaginator implements OnChanges {
    @Input() rowsOnPageSet: number[] = [];
    @Input() mfTable: DataTable;

    minRowsOnPage = 0;

    ngOnChanges(changes: any): any {
        if (changes.rowsOnPageSet) {
            this.minRowsOnPage = this.rowsOnPageSet.reduce((previous, current) => current < previous ? current : previous);
        }
    }
}
