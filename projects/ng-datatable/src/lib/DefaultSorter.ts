import { Component, OnInit, inject, input, signal } from "@angular/core";
import { DataTable, SortBy, SortEvent } from "./DataTable";

@Component({
  selector: "mfDefaultSorter",
  template: ` <a
    (click)="sort()"
    (keydown.enter)="sort()"
    (keydown.space)="sort()"
    class="text-nowrap text-decoration-none"
    tabindex="0"
  >
    <ng-content></ng-content>
    @if (isSortedByMeAsc()) {
    <span aria-hidden="true" aria-label="asc">▲</span>
    } @else if (isSortedByMeDesc()) {
    <span aria-hidden="true" aria-label="desc">▼</span>
    }
  </a>`,
  styles: ["a { cursor: pointer; }"],
})
export class DefaultSorter<T = any> implements OnInit {
  #mfTable = inject(DataTable<T>);

  readonly sortBy = input.required<SortBy<T>>({ alias: "by" });

  isSortedByMeAsc = signal(false);
  isSortedByMeDesc = signal(false);

  ngOnInit(): void {
    this.#mfTable.onSortChange.subscribe((event: SortEvent) => {
      this.isSortedByMeAsc.set(
        event.sortBy == this.sortBy() && event.sortOrder === "asc"
      );
      this.isSortedByMeDesc.set(
        event.sortBy == this.sortBy() && event.sortOrder === "desc"
      );
    });
  }

  sort() {
    if (this.isSortedByMeAsc()) {
      this.#mfTable.setSort(this.sortBy(), "desc");
    } else {
      this.#mfTable.setSort(this.sortBy(), "asc");
    }
    return false;
  }
}
