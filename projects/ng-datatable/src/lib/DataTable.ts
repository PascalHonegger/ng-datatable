import { Directive, Input, EventEmitter, OnChanges, DoCheck, IterableDiffers, IterableDiffer, Output, inject, SimpleChanges } from "@angular/core";
import { ReplaySubject } from "rxjs";


export type SortOrder = "asc" | "desc";
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
    selector: "table[mfData]",
    exportAs: "mfDataTable"
})
export class DataTable<T = any> implements OnChanges, DoCheck {

    private diff: IterableDiffer<T>;
    @Input("mfData") public inputData: T[] = [];

    @Input("mfSortBy") public sortBy: SortBy<T> = "";
    @Input("mfSortOrder") public sortOrder: SortOrder = "asc";
    @Output("mfSortByChange") public sortByChange = new EventEmitter<SortBy<T>>();
    @Output("mfSortOrderChange") public sortOrderChange = new EventEmitter<SortOrder>();

    @Input("mfRowsOnPage") public rowsOnPage = 1000;
    @Input("mfActivePage") public activePage = 1;

    private mustRecalculateData = false;

    public data: T[];

    public onSortChange = new ReplaySubject<SortEvent>(1);
    public onPageChange = new EventEmitter<PageEvent>();

    public constructor() {
        const differs = inject(IterableDiffers);

        this.diff = differs.find([]).create();
    }

    public getSort(): SortEvent {
        return { sortBy: this.sortBy, sortOrder: this.sortOrder };
    }

    public setSort(sortBy: SortBy<T>, sortOrder: SortOrder): void {
        if (this.sortBy !== sortBy || this.sortOrder !== sortOrder) {
            this.sortBy = sortBy;
            this.sortOrder = ["asc", "desc"].indexOf(sortOrder) >= 0 ? sortOrder : "asc";
            this.mustRecalculateData = true;
            this.onSortChange.next({ sortBy: this.sortBy, sortOrder: this.sortOrder });
            this.sortByChange.emit(this.sortBy);
            this.sortOrderChange.emit(this.sortOrder);
        }
    }

    public getPage(): PageEvent {
        return { activePage: this.activePage, rowsOnPage: this.rowsOnPage, dataLength: this.inputData.length };
    }

    public setPage(activePage: number, rowsOnPage: number): void {
        if (this.rowsOnPage !== rowsOnPage || this.activePage !== activePage) {
            this.activePage = this.activePage !== activePage ? activePage : this.calculateNewActivePage(this.rowsOnPage, rowsOnPage);
            this.rowsOnPage = rowsOnPage;
            this.mustRecalculateData = true;
            this.onPageChange.emit({
                activePage: this.activePage,
                rowsOnPage: this.rowsOnPage,
                dataLength: this.inputData ? this.inputData.length : 0
            });
        }
    }

    private calculateNewActivePage(previousRowsOnPage: number, currentRowsOnPage: number): number {
        const firstRowOnPage = (this.activePage - 1) * previousRowsOnPage + 1;
        const newActivePage = Math.ceil(firstRowOnPage / currentRowsOnPage);
        return newActivePage;
    }

    private recalculatePage() {
        const lastPage = Math.ceil(this.inputData.length / this.rowsOnPage);
        this.activePage = lastPage < this.activePage ? lastPage : this.activePage;
        this.activePage = this.activePage || 1;

        this.onPageChange.emit({
            activePage: this.activePage,
            rowsOnPage: this.rowsOnPage,
            dataLength: this.inputData.length
        });
    }

    public ngOnChanges(changes: SimpleChanges): any {
        if (changes["rowsOnPage"]) {
            this.rowsOnPage = changes["rowsOnPage"].previousValue;
            this.setPage(this.activePage, changes["rowsOnPage"].currentValue);
            this.mustRecalculateData = true;
        }
        if (changes["sortBy"] || changes["sortOrder"]) {
            if (["asc", "desc"].indexOf(this.sortOrder) < 0) {
                console.warn("ng-datatable: value for input mfSortOrder must be one of ['asc', 'desc'], but is:", this.sortOrder);
                this.sortOrder = "asc";
            }
            if (this.sortBy) {
                this.onSortChange.next({ sortBy: this.sortBy, sortOrder: this.sortOrder });
            }
            this.mustRecalculateData = true;
        }
        if (changes["inputData"]) {
            this.inputData = changes["inputData"].currentValue || [];
            this.diff.diff(this.inputData); // Update diff to prevent duplicate update in ngDoCheck
            this.recalculatePage();
            this.mustRecalculateData = true;
        }
    }

    public ngDoCheck(): any {
        const changes = this.diff.diff(this.inputData);
        if (changes) {
            this.recalculatePage();
            this.mustRecalculateData = true;
        }
        if (this.mustRecalculateData) {
            this.fillData();
            this.mustRecalculateData = false;
        }
    }

    private fillData(): void {
        // this.activePage = this.activePage;
        // this.rowsOnPage = this.rowsOnPage;

        const offset = (this.activePage - 1) * this.rowsOnPage;
        // let data = this.inputData;
        // const sortBy = this.sortBy;
        // if (typeof sortBy === "string" || sortBy instanceof String) {
        //     data = orderBy(data, this.caseInsensitiveIteratee(sortBy as string), [this.sortOrder]);
        // } else {
        //     data = orderBy(data, sortBy, [this.sortOrder]);
        // }
        // data = slice(data, offset, offset + this.rowsOnPage);

        this.data = [...this.inputData]
            .sort(this.sorter(this.sortBy, this.sortOrder))
            .slice(offset, offset + this.rowsOnPage);
    }

    private caseInsensitiveIteratee(sortBy: string | SortByFunction) {
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

            if (value && typeof value === "string" || value instanceof String) {
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
        const order = sortOrder === "desc" ? -1 : 1;
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
