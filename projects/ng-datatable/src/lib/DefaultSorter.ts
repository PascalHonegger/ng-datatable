import { Component, OnInit, inject, input } from "@angular/core";
import {DataTable, SortBy, SortEvent} from "./DataTable";

@Component({
    selector: "mfDefaultSorter",
    template: `
        <a (click)="sort()" (keydown.enter)="sort()" (keydown.space)="sort()" class="text-nowrap text-decoration-none" tabindex="0">
          <ng-content></ng-content>
          @if (isSortedByMeAsc) {
            <span aria-hidden="true" aria-label="asc">▲</span>
          } @else if (isSortedByMeDesc) {
            <span aria-hidden="true" aria-label="desc">▼</span>
          }
        </a>`,
    styles: [
        "a { cursor: pointer; }"
    ]
})
export class DefaultSorter<T = any> implements OnInit {
    private mfTable = inject(DataTable<T>);

    readonly sortBy = input.required<SortBy<T>>({ alias: "by" });

    isSortedByMeAsc = false;
    isSortedByMeDesc = false;

    public ngOnInit(): void {
        this.mfTable.onSortChange.subscribe((event: SortEvent) => {
            this.isSortedByMeAsc = (event.sortBy == this.sortBy() && event.sortOrder === "asc");
            this.isSortedByMeDesc = (event.sortBy == this.sortBy() && event.sortOrder === "desc");
        });
    }

    sort() {
        if (this.isSortedByMeAsc) {
            this.mfTable.setSort(this.sortBy(), "desc");
        } else {
            this.mfTable.setSort(this.sortBy(), "asc");
        }
        return false;
    }
}
