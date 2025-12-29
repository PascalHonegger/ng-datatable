import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataTable, DefaultSorter, BootstrapPaginator, SortBy, SortOrder } from 'ng-datatable';
import { FormsModule } from '@angular/forms';
import { DataFilterPipe } from './data-filter.pipe';
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [
    DataTable,
    DefaultSorter,
    BootstrapPaginator,
    FormsModule,
    DataFilterPipe,
    UpperCasePipe,
  ],
})
export class AppComponent implements OnInit {
  private http = inject(HttpClient);

  data = signal<any[]>([]);
  filterQuery = signal<string>('');
  rowsOnPage = signal<number>(10);
  sortBy = signal<SortBy>('email');
  sortOrder = signal<SortOrder>('asc');

  ngOnInit(): void {
    this.http.get<any[]>('/data.json').subscribe((data) => {
      setTimeout(() => {
        this.data.set(data);
      }, 2000);
    });
  }

  toInt(num: string) {
    return +num;
  }

  sortByWordLength = (a: any) => {
    return a.city.length;
  };

  remove(item: any) {
    this.data.update((d) => d.filter((it) => it !== item));
  }
}
