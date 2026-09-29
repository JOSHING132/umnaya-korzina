import {products, type Item} from "./data";
export interface StoreAdapter {
 getProducts():Promise<Item[]>;
 getProductByBarcode(barcode:string):Promise<Item|undefined>;
 getProductAvailability(id:string):Promise<boolean>;
 getProductPrice(id:string):Promise<number|undefined>;
 searchProducts(query:string):Promise<Item[]>;
}
export class DemoStoreAdapter implements StoreAdapter {
 async getProducts(){return products}
 async getProductByBarcode(barcode:string){return products.find(p=>p.barcode===barcode)}
 async getProductAvailability(id:string){return products.find(p=>p.id===id)?.stock??false}
 async getProductPrice(id:string){const p=products.find(p=>p.id===id);return p?.discount??p?.price}
 async searchProducts(query:string){return products.filter(p=>p.name.toLowerCase().includes(query.toLowerCase()))}
}
export const storeAdapters=Object.fromEntries(["Пятёрочка","Перекрёсток","Магнит","Лента","Ашан","ВкусВилл","О’КЕЙ","Дикси","Чижик"].map(n=>[n,new DemoStoreAdapter()]));
// Для реальных интеграций реализуйте контракт через официально предоставленные API; демо-адаптеры не делают сетевых запросов.