import { Component, OnInit } from '@angular/core';
import { Books } from '../home.model';
import { ActivatedRoute } from '@angular/router';
import { HomeService } from '../home.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class DetailsComponent implements OnInit {
  isLoadingBook = true;
  book!: Books;

  constructor(
    private activatedRoute: ActivatedRoute,
    private service: HomeService
  ) {}

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((param) => {
      let bookid = param.get('id') as string;

      this.service.getBookById(bookid).subscribe((bk) => {
        this.book = bk;
        this.isLoadingBook = false;
      });
    });
  }

  downloadFile(link: string) {
    window.location.href = link;
  }
}
