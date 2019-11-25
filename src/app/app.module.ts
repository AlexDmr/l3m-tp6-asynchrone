import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {YagaModule} from '@yaga/leaflet-ng2';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatButtonModule,
  MatCheckboxModule,
  MatDialogModule, MatInputModule,
  MatListModule,
  MatProgressSpinnerModule, MatSelectModule,
  MatToolbarModule
} from '@angular/material';
import { DialogLignesComponent } from './dialog-lignes/dialog-lignes.component';
import {FormsModule} from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    DialogLignesComponent
  ],
  imports: [
    BrowserModule,
    YagaModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatButtonModule,
    MatDialogModule,
    MatListModule,
    MatCheckboxModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatInputModule
  ],
  providers: [],
  entryComponents: [
    DialogLignesComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
