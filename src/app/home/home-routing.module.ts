import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';
import { DetailsComponent } from './details/details.component';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },

  {
    path: 'detail/:id',
    component: DetailsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomePageRoutingModule {}
