import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FooterComponent } from './footer/footer.component';

@NgModule({
  declarations: [],
  imports: [CommonModule, HttpClientModule, FooterComponent],
  exports: [FooterComponent, HttpClientModule]
})
export class SharedModule {}
