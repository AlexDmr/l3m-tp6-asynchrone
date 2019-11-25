import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {OSM_TILE_LAYER_URL} from '@yaga/leaflet-ng2';
import {MetroService} from './metro.service';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {Feature as GeoJSONFeature} from 'geojson';
import {MatDialog} from '@angular/material';
import {DialogLignesComponent} from './dialog-lignes/dialog-lignes.component';
import {flatMap, repeat} from 'rxjs/operators';
import {AnimationFrameScheduler} from 'rxjs/internal/scheduler/AnimationFrameScheduler';
import {computeDistance, FeatureLigne, GeoPoint, getAnimationCoordinates, getAnimationObservable} from './definitions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  tileLayer = OSM_TILE_LAYER_URL;
  iconMarker = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Map_marker.svg/585px-Map_marker.svg.png';
  lignesIdsSubj = new BehaviorSubject<string[]>([]);
  lignesDescrObs: Observable<FeatureLigne[]>;
  lignePourParcours: FeatureLigne;
  animPourParcour = new BehaviorSubject<Observable<GeoPoint>[]>([]);
  LanimPoints: Observable<Observable<GeoPoint>[]> = this.animPourParcour.asObservable();

  constructor(private ms: MetroService, public dialog: MatDialog) {
    const key = 'L3M_TP6_LignesIds';
    // Subscribe to lignes descriptions updates for saving in localStorage
    const Lids: string[] = JSON.parse( localStorage.getItem(key) );
    if (Lids !== null) {
      const subscription = ms.dataInitializedObs.subscribe( async init => {
        if (init) {
          this.lignesIdsSubj.next( Lids );
          subscription.unsubscribe();
        }
      });
    }

    // Subscribe to lignesDescrSubj updates
    this.lignesIdsSubj.subscribe(
      ids => {
        console.log(ids);
        localStorage.setItem(key, JSON.stringify(this.lignesIdsSubj.getValue() ) );
      }
    );

    // Transfom ligne identifiers into FeatureLigne[]
    this.lignesDescrObs = this.lignesIdsSubj.pipe(
      flatMap( async ids => Promise.all( ids.map( id => ms.getLigneDescr(id) ) ) )
    );
  }

  ngOnInit() {
  }

  get dataInitializedObs(): Observable<boolean> {
    return this.ms.dataInitializedObs;
  }

  getLatLng(arretId: string): GeoPoint {
    const arret = this.ms.arrets.find( a => a.properties.id === arretId);
    return arret ? arret.geometry.coordinates : [999, 999];
  }

  getColor(ligneDescr: FeatureLigne): string {
    const col = ligneDescr.properties.COULEUR;
    return `rgb(${col})`;
  }

  get selectedLinesId(): string[] {
    return this.lignesIdsSubj.getValue();
  }

  geoJSON(ligneDescr: FeatureLigne): GeoJSONFeature<GeoJSON.LineString> {
    const geo: GeoJSONFeature<GeoJSON.LineString> = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: ligneDescr.geometry.coordinates[0]
      },
      properties: null
    };
    // console.log(geo);
    return geo;
  }

  async openDialogLines() {
    const dialogRef = this.dialog.open(DialogLignesComponent, {
      width: '90%',
      height: '90%',
      data: {selectedLinesId: this.selectedLinesId}
    });

    const Lids: string[] = await dialogRef.afterClosed().toPromise();
    // console.log('Selected lignes ID:', Lids);
    if (Lids) {
      this.lignesIdsSubj.next( Lids );
    }
  }

  async Parcourir(ligne: FeatureLigne) {
    const obs = getAnimationCoordinates(10000, ligne.geometry.coordinates[0]);
    this.animPourParcour.next( [...this.animPourParcour.getValue(), obs] );
    await obs.toPromise();
    this.animPourParcour.next( this.animPourParcour.getValue().filter( o => o !== obs ) );
  }

}

