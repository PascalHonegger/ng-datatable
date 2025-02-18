import { Component, OnInit, inject } from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {DataTableModule, SortBy, SortOrder} from "ng-datatable";
import { FormsModule } from "@angular/forms";
import { DataFilterPipe } from "./data-filter.pipe";
import { UpperCasePipe } from "@angular/common";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    imports: [
        DataTableModule,
        FormsModule,
        DataFilterPipe,
        UpperCasePipe
    ]
})
export class AppComponent implements OnInit {
    private http = inject(HttpClient);


    public data: any[];
    public filterQuery = "";
    public rowsOnPage = 10;
    public sortBy: SortBy = "email";
    public sortOrder: SortOrder = "asc";

    ngOnInit(): void {
        this.http.get<any[]>("/data.json")
            .subscribe((data) => {
                setTimeout(() => {
                    this.data = data;
                }, 2000);
            });
    }

    public toInt(num: string) {
        return +num;
    }

    public sortByWordLength = (a: any) => {
        return a.city.length;
    }

    public remove(item: any) {
        const index = this.data.indexOf(item);
        if (index > -1) {
            this.data.splice(index, 1);
        }
    }

}
