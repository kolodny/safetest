import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-thing',
  template: `<div (click)="inc()">State is {{ value }}</div>`,
})
export class ThingComponent {
  @Input() startingValue = 0;
  value = this.startingValue;
  inc() {
    this.value++;
  }
  ngOnInit() {
    this.value = this.startingValue;
  }
}
