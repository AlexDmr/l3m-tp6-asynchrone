import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {FeatureArret, FeatureArretCollection, FeatureLigne, FeatureLigneCollection, Ligne} from './definitions';

@Injectable({
  providedIn: 'root'
})
export class MetroService {
  arrets: FeatureArret[] = []; // La liste des arrêts
  lignes: Ligne[] = []; // La liste des lignes de transports
  // Un observable pour savoir si les listes précédentes ont été initialisées :
  private dataInitialized = new BehaviorSubject<boolean>(false);
  dataInitializedObs = this.dataInitialized.asObservable();
  // on essaie de se rappeler des descriptions de lignes qu'on a déjà
  private mapLigneDescr = new Map<string, FeatureLigne>();

  constructor() {
    this.init();
  }

  /* Fait deux requêtes pour obtenir les arrets et les lignes de transports
   * Une fois les deux résultats reçut, la méthode en informe le reste du code
   * en produisant une nouvelle valeur booléen valant true :
   * utilisez pour cela la méthode next de l'attribut dataInitialized.
   */
  private async init() {
    // à compléter
  }

  /* Renvoie la description d'une ligne dont on passe l'identifiant en paramètre
   * La méthode utilise l'attribut mapLigneDescr pour stocker les résultats
   */
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

  /* Renvoie la promesse de la description des arrêts
   *
   */
  private async getArrets(): Promise<FeatureArret[]> {
    // à compléter
    // appeler la fonction fetch sur l'URL https://data.metromobilite.fr/api/findType/json?types=arret
    // une fois la réponse obtnue, appelez la méthode json sur cette réponse.
    // Renvoyez l'attribut features de ce json
    return [];
  }

  private async getLignes(): Promise<Ligne[]> {
    const R: Response = await fetch('http://data.metromobilite.fr/api/routers/default/index/routes');
    return R.json();
  }

}
