"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

type Branch = { id: string; store_name: string; name: string; city: string; address: string; lat: number; lon: number; };
const chains = ["Лента","Глобус","Пятёрочка","Магнит","Чижик","Ярче!","Дикси","Верный","Ашан","Перекрёсток","О'КЕЙ"];
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = url && key ? createClient(url,key) : null;
function distanceKm(a:number,b:number,c:number,d:number) {
 const rad=(x:number)=>x*Math.PI/180, R=6371;
 const x=rad(c-a), y=rad(d-b);
 const h=Math.sin(x/2)**2+Math.cos(rad(a))*Math.cos(rad(c))*Math.sin(y/2)**2;
 return 2*R*Math.asin(Math.sqrt(h));
}
export default function BranchesPage() {
 const [chain,setChain]=useState(chains[0]);
 const [city,setCity]=useState("");
 const [branches,setBranches]=useState<Branch[]>([]);
 const [location,setLocation]=useState<{lat:number;lon:number}|null>(null);
 const [status,setStatus]=useState("");
 const [mode,setMode]=useState("car");
 const [selected,setSelected]=useState("");
 const [loading,setLoading]=useState(false);
 async function locate() {
  if(!navigator.geolocation){setStatus("Геолокация не поддерживается браузером.");return;}
  setLoading(true);setStatus("Запрашиваем разрешение на геолокацию…");
  navigator.geolocation.getCurrentPosition(async pos=>{
   const point={lat:pos.coords.latitude,lon:pos.coords.longitude};setLocation(point);
   await loadBranches(point);
  },err=>{setLoading(false);setStatus(err.code===1?"Доступ к геолокации запрещён. Можно выбрать город и филиал вручную.":"Не удалось определить местоположение. Проверь разрешения и попробуй снова.");},{enableHighAccuracy:true,timeout:15000,maximumAge:300000});
 }
 async function loadBranches(point?:{lat:number;lon:number}) {
  if(!supabase){setStatus("Supabase не настроен. Добавь филиалы в таблицу branches и настрой .env.local.");setBranches([]);setLoading(false);return;}
  setLoading(true);setStatus("Загружаем филиалы…");
  let q=supabase.from("branches").select("id,store_name,name,city,address,lat,lon").eq("store_name",chain);
  if(city.trim()) q=q.ilike("city",city.trim());
  const {data,error}=await q.limit(500);
  setLoading(false);
  if(error){setStatus("Не удалось загрузить филиалы: "+error.message);return;}
  const rows=(data||[]) as Branch[];
  setBranches(point?rows.sort((a,b)=>distanceKm(point.lat,point.lon,a.lat,a.lon)-distanceKm(point.lat,point.lon,b.lat,b.lon)):rows);
  setStatus(rows.length?"Филиалы загружены. Сортировка пока по расстоянию по прямой. Для выбора по времени поездки подключи маршрутизацию.":"Филиалы не найдены. Проверь город и заполнение таблицы branches.");
 }
 const sorted=useMemo(()=>branches,[branches]);
 return <main className="min-h-screen bg-[#f6f8f6] p-4 md:p-8 text-[#183329]">
  <div className="max-w-4xl mx-auto space-y-5">
   <Link href="/" className="text-sm text-[#236b50] underline">← Вернуться в приложение</Link>
   <header><h1 className="text-3xl font-bold">Выбор магазина</h1><p className="text-sm text-gray-600 mt-2">Поиск филиалов выбранной сети. Геолокация запрашивается только по нажатию кнопки.</p></header>
   <section className="bg-white rounded-2xl border p-5 space-y-4">
    <label className="block text-sm font-semibold">Торговая сеть<select className="block w-full mt-1 border rounded-xl p-3 bg-white" value={chain} onChange={e=>{setChain(e.target.value);setBranches([]);setSelected("");setStatus("");}}>{chains.map(x=><option key={x}>{x}</option>)}</select></label>
    <label className="block text-sm font-semibold">Город (необязательно)<input className="block w-full mt-1 border rounded-xl p-3" value={city} onChange={e=>setCity(e.target.value)} placeholder="Например, Казань"/></label>
    <label className="block text-sm font-semibold">Способ передвижения<select className="block w-full mt-1 border rounded-xl p-3 bg-white" value={mode} onChange={e=>setMode(e.target.value)}><option value="car">Автомобиль</option><option value="foot">Пешком</option><option value="transit">Общественный транспорт</option></select></label>
    <div className="flex flex-wrap gap-2"><button className="bg-[#236b50] text-white rounded-xl px-4 py-3" onClick={locate} disabled={loading}>Определить по геолокации</button><button className="border rounded-xl px-4 py-3" onClick={()=>loadBranches()} disabled={loading}>Найти по городу</button></div>
    {status&&<p className="text-sm bg-[#f2f7f3] rounded-xl p-3">{status}</p>}
    {location&&<p className="text-xs text-gray-500">Координаты получены. Они используются только для сортировки филиалов на этом экране.</p>}
   </section>
   <section className="bg-white rounded-2xl border p-5 space-y-3">
    <h2 className="font-bold text-lg">Найденные филиалы ({sorted.length})</h2>
    {sorted.map(b=><label key={b.id} className="flex items-start gap-3 border rounded-xl p-3 cursor-pointer"><input type="radio" name="branch" checked={selected===b.id} onChange={()=>setSelected(b.id)} className="mt-1"/><span className="flex-1"><b>{b.name||b.store_name}</b><span className="block text-sm text-gray-600">{b.city}, {b.address}</span>{location&&<span className="block text-xs text-gray-500 mt-1">≈ {distanceKm(location.lat,location.lon,b.lat,b.lon).toFixed(1)} км по прямой</span>}</span></label>)}
    {!sorted.length&&<p className="text-sm text-gray-500">Список появится после настройки базы данных и загрузки филиалов.</p>}
    {selected&&<p className="text-sm text-green-700">Филиал выбран: {sorted.find(b=>b.id===selected)?.name}. Каталог пока не подключён на этой странице.</p>}
   </section>
   <p className="text-xs text-gray-500">Важно: эта версия реализует интерфейс геолокации и загрузку филиалов из Supabase. Расчёт времени поездки и реальные каталоги требуют подключённых провайдеров; расстояние по прямой не является временем поездки.</p>
  </div>
 </main>;
}
