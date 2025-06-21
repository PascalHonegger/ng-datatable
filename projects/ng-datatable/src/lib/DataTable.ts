import {
  Directive,
  EventEmitter,
  OnChanges,
  DoCheck,
  IterableDiffers,
  IterableDiffer,
  Output,
  inject,
  SimpleChanges,
  model,
} from "@angular/core";
import { ReplaySubject } from "rxjs";

export type SortOrder = "asc" | "desc";
export type SortByFunction<T = any> = (data: T) => any;
export type SortBy<T = any> =
  | string
  | SortByFunction<T>
  | (string | SortByFunction<T>)[];

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
  selector: "table[mfData]",
  exportAs: "mfDataTable",
})
export class DataTable<T = any> implements OnChanges, DoCheck {
  #diff: IterableDiffer<T>;
  readonly inputData = model<T[]>([], { alias: "mfData" });

  readonly sortBy = model<SortBy<T>>("", { alias: "mfSortBy" });
  readonly sortOrder = model<SortOrder>("asc", { alias: "mfSortOrder" });
  @Output("mfSortByChange") sortByChange = new EventEmitter<SortBy<T>>();
  @Output("mfSortOrderChange") sortOrderChange = new EventEmitter<SortOrder>();

  readonly rowsOnPage = model(1000, { alias: "mfRowsOnPage" });
  readonly activePage = model(1, { alias: "mfActivePage" });

  #mustRecalculateData = false;

  data: T[];

  onSortChange = new ReplaySubject<SortEvent>(1);
  onPageChange = new EventEmitter<PageEvent>();

  constructor() {
    const differs = inject(IterableDiffers);

    this.#diff = differs.find([]).create();
  }

  getSort(): SortEvent {
    return { sortBy: this.sortBy(), sortOrder: this.sortOrder() };
  }

  setSort(sortBy: SortBy<T>, sortOrder: SortOrder): void {
    const sortByValue = this.sortBy();
    const sortOrderValue = this.sortOrder();
    if (sortByValue !== sortBy || sortOrderValue !== sortOrder) {
      this.sortBy.set(sortBy);
      this.sortOrder.set(
        ["asc", "desc"].indexOf(sortOrder) >= 0 ? sortOrder : "asc"
      );
      this.#mustRecalculateData = true;
      this.onSortChange.next({
        sortBy: sortByValue,
        sortOrder: sortOrderValue,
      });
      this.sortByChange.emit(sortByValue);
      this.sortOrderChange.emit(sortOrderValue);
    }
  }

  getPage(): PageEvent {
    return {
      activePage: this.activePage(),
      rowsOnPage: this.rowsOnPage(),
      dataLength: this.inputData().length,
    };
  }

  setPage(activePageIn: number, rowsOnPageIn: number): void {
    if (
      this.rowsOnPage() !== rowsOnPageIn ||
      this.activePage() !== activePageIn
    ) {
      this.activePage.set(
        this.activePage() !== activePageIn
          ? activePageIn
          : this.#calculateNewActivePage(this.rowsOnPage(), rowsOnPageIn)
      );
      this.rowsOnPage.set(rowsOnPageIn);
      this.#mustRecalculateData = true;
      const inputData = this.inputData();
      this.onPageChange.emit({
        activePage: this.activePage(),
        rowsOnPage: this.rowsOnPage(),
        dataLength: inputData ? inputData.length : 0,
      });
    }
  }

  #calculateNewActivePage(
    previousRowsOnPage: number,
    currentRowsOnPage: number
  ): number {
    const firstRowOnPage = (this.activePage() - 1) * previousRowsOnPage + 1;
    const newActivePage = Math.ceil(firstRowOnPage / currentRowsOnPage);
    return newActivePage;
  }

  #recalculatePage() {
    const lastPage = Math.ceil(this.inputData().length / this.rowsOnPage());
    this.activePage.set(
      lastPage < this.activePage() ? lastPage : this.activePage()
    );
    this.activePage.set(this.activePage() || 1);

    this.onPageChange.emit({
      activePage: this.activePage(),
      rowsOnPage: this.rowsOnPage(),
      dataLength: this.inputData().length,
    });
  }

  ngOnChanges(changes: SimpleChanges): any {
    if (changes["rowsOnPage"]) {
      this.rowsOnPage.set(changes["rowsOnPage"].previousValue);
      this.setPage(this.activePage(), changes["rowsOnPage"].currentValue);
      this.#mustRecalculateData = true;
    }
    if (changes["sortBy"] || changes["sortOrder"]) {
      const sortOrder = this.sortOrder();
      if (["asc", "desc"].indexOf(this.sortOrder()) < 0) {
        console.warn(
          "ng-datatable: value for input mfSortOrder must be one of ['asc', 'desc'], but is:",
          sortOrder
        );
        this.sortOrder.set("asc");
      }
      const sortBy = this.sortBy();
      if (sortBy) {
        this.onSortChange.next({ sortBy: sortBy, sortOrder: sortOrder });
      }
      this.#mustRecalculateData = true;
    }
    if (changes["inputData"]) {
      this.inputData.set(changes["inputData"].currentValue || []);
      this.#diff.diff(this.inputData()); // Update diff to prevent duplicate update in ngDoCheck
      this.#recalculatePage();
      this.#mustRecalculateData = true;
    }
  }

  ngDoCheck(): any {
    const changes = this.#diff.diff(this.inputData());
    if (changes) {
      this.#recalculatePage();
      this.#mustRecalculateData = true;
    }
    if (this.#mustRecalculateData) {
      this.#fillData();
      this.#mustRecalculateData = false;
    }
  }

  #fillData(): void {
    // this.activePage = this.activePage;
    // this.rowsOnPage = this.rowsOnPage;

    const offset = (this.activePage() - 1) * this.rowsOnPage();
    // let data = this.inputData;
    // const sortBy = this.sortBy;
    // if (typeof sortBy === "string" || sortBy instanceof String) {
    //     data = orderBy(data, this.caseInsensitiveIteratee(sortBy as string), [this.sortOrder]);
    // } else {
    //     data = orderBy(data, sortBy, [this.sortOrder]);
    // }
    // data = slice(data, offset, offset + this.rowsOnPage);

    this.data = [...this.inputData()]
      .sort(this.sorter(this.sortBy(), this.sortOrder()))
      .slice(offset, offset + this.rowsOnPage());
  }

  #caseInsensitiveIteratee(sortBy: string | SortByFunction) {
    return (row: any): any => {
      let value = row;
      if (typeof sortBy === "string" || sortBy instanceof String) {
        for (const sortByProperty of sortBy.split(".")) {
          if (value) {
            value = value[sortByProperty];
          }
        }
      } else if (typeof sortBy === "function") {
        value = sortBy(value);
      }

      if ((value && typeof value === "string") || value instanceof String) {
        return value.toLowerCase();
      }

      return value;
    };
  }

  #compare(left: any, right: any): number {
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

  sorter<T>(
    sortBy: SortBy<T>,
    sortOrder: SortOrder
  ): (left: T, right: T) => number {
    const order = sortOrder === "desc" ? -1 : 1;
    if (Array.isArray(sortBy)) {
      const iteratees = sortBy.map((entry) =>
        this.#caseInsensitiveIteratee(entry)
      );
      return (left, right) => {
        for (const iteratee of iteratees) {
          const comparison =
            this.#compare(iteratee(left), iteratee(right)) * order;
          if (comparison !== 0) {
            return comparison;
          }
        }
        return 0;
      };
    } else {
      const iteratee = this.#caseInsensitiveIteratee(sortBy);
      return (left, right) =>
        this.#compare(iteratee(left), iteratee(right)) * order;
    }
  }
}
