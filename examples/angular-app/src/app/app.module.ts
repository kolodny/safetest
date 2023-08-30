import { NgModule, Component } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import {
  AppComponent,
  // HelloWorldComponent
} from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

@Component({
  selector: 'my-hello-world',
  template: `<div>My Hello World!</div>`,
})
class HelloWorldComponent {}

@NgModule({
  declarations: [HelloWorldComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [],
})
export class HelloWorldModule {}

export const foo = 123;
