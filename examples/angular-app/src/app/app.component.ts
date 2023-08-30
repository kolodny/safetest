import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'angular-app';
}

@Component({
  selector: 'hello-world',
  template: `<div>Hello World!</div>`,
})
export class HelloWorldComponent {
  title = 'angular-app';
}

(window as any).Component1 = Component;

// export const HelloWorldComponent = Component({
//   selector: 'app-root',
//   template: `<div>Hello World!</div>`,
// })(class {});
