declare module 'solar-calculator' {
    declare let solar:{
        century(date: Date): number;
        equationOfTime(t: number): number;
        declination(t: number): number;
    }
  export function century(date: Date): number;
  export function equationOfTime(t: number): number;
  export function declination(t: number): number;
}
