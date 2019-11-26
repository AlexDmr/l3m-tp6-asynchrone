import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {OSM_TILE_LAYER_URL} from '@yaga/leaflet-ng2';
import {MetroService} from './metro.service';
import {BehaviorSubject, ConnectableObservable, Observable, of} from 'rxjs';
import {Feature as GeoJSONFeature} from 'geojson';
import {MatDialog} from '@angular/material';
import {DialogLignesComponent} from './dialog-lignes/dialog-lignes.component';
import {flatMap, multicast} from 'rxjs/operators';
import {FeatureArret, FeatureLigne, GeoPoint, getAnimationCoordinates, Ligne} from './definitions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  // Utile pour la partie cartographie
  tileLayer = OSM_TILE_LAYER_URL;
  iconMarker = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Map_marker.svg/585px-Map_marker.svg.png';

  // Un observable qui produit des descriptions de lignes de transports
  lignesDescrObs: ConnectableObservable<FeatureLigne[]>;

  // Un observable qui produit des liste d'identifiants de lignes de transports à visualiser
  lignesIdsSubj = new BehaviorSubject<string[]>([]);

  // Un observable pour gérer des animations de marqueurs
  private animPourParcour = new BehaviorSubject<Observable<GeoPoint>[]>([]);

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
    this.lignesIdsSubj.subscribe(ids => localStorage.setItem(key, JSON.stringify(this.lignesIdsSubj.getValue() ) ) );

    // Transfome les identifiants de lignes en FeatureLigne[]
    this.lignesDescrObs = this.lignesIdsSubj.pipe(
      flatMap( ids => Promise.all( ids.map( id => ms.getLigneDescr(id) ) ) ),
      multicast( () => new BehaviorSubject([]) )
    ) as ConnectableObservable<FeatureLigne[]>;
    this.lignesDescrObs.connect();
  }

  ngOnInit() {
  }

  get dataInitializedObs(): Observable<boolean> {
    return this.ms.dataInitializedObs;
  }

  get lignes(): Ligne[] {
    return this.ms.lignes;
  }

  get arrets(): FeatureArret[] {
    return this.ms.arrets;
  }

  getColor(ligneDescr: FeatureLigne): string {
    const col = ligneDescr.properties.COULEUR;
    return `rgb(${col})`;
  }

  get selectedLinesId(): string[] {
    return this.lignesIdsSubj.getValue();
  }

  // Pour décrire géographiquement une ligne de transport
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

    // La promesse P sera résolue avec un tableau d'identifiant de lignes
    const P: Promise<string[]> = dialogRef.afterClosed().toPromise();

    // à compléter :
    // Attendre que la promesse P soit résolue, récupérer le tableau d'identifiant de lignes
    // Si ce tableau est définit, alors publiez le via l'obervable lignesIdsSubj

  }

  Parcourir(lignes: FeatureLigne[]) {
    const LO = lignes.map( ligne => getAnimationCoordinates(10000, ligne.geometry.coordinates[0]) );
    this.animPourParcour.next( [...this.animPourParcour.getValue(), ...LO] );
    // à compléter :
    // Lorsque les animations référencées par LP sont terminées, retirez les de animPourParcour
    // Note : Pour passer d'un observable à une promesse qui indique lorsque l'observable est terminé, appelez la méthode toPromise.
  }

}

