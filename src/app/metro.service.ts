import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {FeatureArret, FeatureArretCollection, FeatureLigne, FeatureLigneCollection, Ligne} from './definitions';

@Injectable({
  providedIn: 'root'
})
export class MetroService {
  arrets: FeatureArret[] = [];
  lignes: Ligne[] = [];
  private dataInitialized = new BehaviorSubject<boolean>(false);
  dataInitializedObs = this.dataInitialized.asObservable();
  mapLigneDescr = new Map<string, FeatureLigne>();

  constructor() {
    try {
      this.init();
    } catch (err) {
      console.error('Error while getting data:', err);
    }
  }

  async init() {
    const PA = this.getArrets();
    const PL = this.getLignes();
    [this.arrets, this.lignes] = await Promise.all([PA, PL]);
    this.dataInitialized.next(true);
  }

  async getArrets(): Promise<FeatureArret[]> {
    const url = `https://data.metromobilite.fr/api/findType/json?types=arret`;
    const R: Response = await fetch(url);
    const FC: FeatureArretCollection = await R.json();
    return FC.features;
  }

  async getLigneDescr(ligneId: string): Promise<FeatureLigne> {
    let FL: FeatureLigne = this.mapLigneDescr.get(ligneId);
    if (FL === undefined) {
      const code = ligneId.slice().replace(':', '_');
      const url = `https://data.metromobilite.fr/api/lines/json?types=ligne&codes=${code}`;
      const R: Response = await fetch(url);
      const FC: FeatureLigneCollection = await R.json();
      FL = FC.features[0];
      this.mapLigneDescr.set(ligneId, FL);
    }
    return FL;
  }

  async getLignes(): Promise<Ligne[]> {
    const R: Response = await fetch('http://data.metromobilite.fr/api/routers/default/index/routes');
    return R.json();
  }
}
