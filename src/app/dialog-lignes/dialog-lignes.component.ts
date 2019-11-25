import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {Observable} from 'rxjs';
import {MetroService} from '../metro.service';
import {Ligne} from '../definitions';

@Component({
  selector: 'app-dialog-lignes',
  templateUrl: './dialog-lignes.component.html',
  styleUrls: ['./dialog-lignes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogLignesComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogLignesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {selectedLinesId: string[]},
    private ms: MetroService) { }

  ngOnInit() {
  }

  cancel() {
    this.dialogRef.close(undefined);
  }

  validate() {
    this.dialogRef.close( this.data.selectedLinesId ); // Liste des lignes sélectionnés
  }

  get dataInitializedObs(): Observable<boolean> {
    return this.ms.dataInitializedObs;
  }

  get Lids(): string[] {
    return this.data.selectedLinesId;
  }

  get lignes(): Ligne[] {
    return this.ms.lignes;
  }

  isSelected(ligne: Ligne): boolean {
    return this.Lids.indexOf(ligne.id) >= 0;
  }

  select(ligne: Ligne, s: boolean) {
    console.log('Select', ligne, s);
    const pos = this.data.selectedLinesId.indexOf(ligne.id);
    if (s) {
      if (pos === -1) {
        this.data.selectedLinesId.push( ligne.id );
      }
    } else {
      this.data.selectedLinesId.splice(pos, 1);
    }
  }
}
