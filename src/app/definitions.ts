import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

// Liste des lignes de transport
// http://data.metromobilite.fr/api/routers/default/index/routes
// tslint:disable-next-line:max-line-length
export type TypeLigne = 'TRAM' | 'CHRONO' | 'PROXIMO' | 'FLEXO' | 'NAVETTE' | 'C38' | 'SCOL' | 'Structurantes' | 'Secondaires' | 'Urbaines' | 'Interurbaines' | 'TAD' | 'SNC';
export type ModeTransport = 'TRAM' | 'BUS' | 'RAIL';
export interface Ligne {
  id: string;
  gtfsId: string;
  shortName: string;
  longName: string;
  color: string;
  textColor: string;
  mode: ModeTransport;
  type: TypeLigne;
}

// Description des lignes de transport
// https://data.metromobilite.fr/api/lines/json?types=ligne&codes=SEM_C1
export interface FeatureLigne {
  type: 'Feature';
  geometry: GeometryMultiLineString;
  properties: {
    CODE: string; // "SEM_C1"
    COULEUR: string; // "253,234,0"
    COULEUR_TEXTE: string; // "0,0,0"
    LIBELLE: string; // "GRENOBLE Cité Jean Macé / MEYLAN Maupertuis"
    NUMERO: string; // "C1"
    PMR: number; // 1
    ZONES_ARRET: string[];
    id: string; // "SEM_C1"
    type: string; // "ligne" 'arret'
  };
}

export interface FeatureLigneCollection {
  type: 'FeatureCollection';
  features: FeatureLigne[];
}

// Recherche d'objets du référentiel à localisation ponctuelle
// https://data.metromobilite.fr/api/findType/json?types=arret
export interface FeatureArret {
  type: 'Feature';
  geometry: GeometryPoint;
  properties: {
    CODE: string;
    COMMUNE: string;
    LIBELLE: string;
    LaMetro: boolean;
    LeGresivaudan: boolean;
    PaysVoironnais: boolean;
    arr_visible: '0' | '1';
    id: string;
    type: 'arret'
  };
}

export interface FeatureArretCollection {
  type: 'FeatureCollection';
  features: FeatureArret[];
}

export type Geometry = GeometryPoint | GeometryMultiLineString;
export type GeoPoint = number[];
export interface GeometryPoint {
  type: 'Point';
  coordinates: GeoPoint;
}

export interface GeometryMultiLineString {
  type: 'MultiLineString';
  coordinates: GeoPoint[][];
}

// Description des lignes de transport
// https://data.metromobilite.fr/api/lines/json?types=ligne&codes=SEM_C1
// à faire
export interface GeoPointAndLength {
  pt: GeoPoint;
  cumulativeDistance: number;
}

export function getGeoPointAndLength([prevPt, ...path]: GeoPoint[]): GeoPointAndLength[] {
  let cumulativeDistance = 0;
  return [prevPt, ...path].map( pt => {
    const d = computeDistance(prevPt, pt);
    prevPt = pt;
    cumulativeDistance += d;
    return {pt, cumulativeDistance};
  });
}

export function getAnimationCoordinates(duration: number, path: GeoPoint[]): Observable<GeoPoint> {
  const gpl = getGeoPointAndLength(path);
  const cumulativeDistance = gpl[gpl.length - 1].cumulativeDistance;
  return getAnimationObservable(duration, 0, cumulativeDistance).pipe(
    map( ({t, v}) => {
      const i1 = gpl.findIndex( step => step.cumulativeDistance >= v );
      const i2 = (i1 + 1) < gpl.length ? i1 + 1 : i1;
      const S1 = gpl[i1];
      const S2 = gpl[i2];
      if (S1 === S2) {
        return S1.pt;
      } else {
        let delta = (v - S1.cumulativeDistance) / (S2.cumulativeDistance - S1.cumulativeDistance);
        delta = (isNaN(delta) || Math.abs(delta) === Infinity) ? 0 : delta;
        return S1.pt.map( (x, i) => x + (S2.pt[i] - x) * delta );
      }
    })
  );
}

export function getAnimationObservable(duration: number, v0: number = 0, v1: number = 100): Observable<{t: number, v: number}> {
  return new Observable( (observer) => {
    const t0 = Date.now();
    const t1 = t0 + duration;
    function F() {
      const t = Date.now();
      const v = (v1 - v0) * (t - t0) / (t1 - t0);
      if (t < t1) {
        observer.next( {t, v} );
      } else {
        observer.next( {t: t1, v: v1} );
        observer.complete();
      }
      requestAnimationFrame(F);
    }
    F();
  });
}

export function computeDistance(a: GeoPoint, b: GeoPoint): number {
  const D2 = a.map( (x, i) => x - b[i], 0)
    .map( x => x * x)
    .reduce( (acc, x) => acc + x );
  return Math.sqrt( D2 );
}
