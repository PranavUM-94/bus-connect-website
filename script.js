/* Madurai CityBus Live prototype. Coordinates, bus positions and ETAs below are illustrative demo data. */
const routes = [
 {id:"A1",name:"Periyar ↔ Mattuthavani",color:"#137c67",stops:["Periyar Bus Stand","Goripalayam","Tallakulam","Mattuthavani"],coords:[[9.9195,78.1193],[9.9302,78.1280],[9.9361,78.1326],[9.9396,78.1660]]},
 {id:"A2",name:"Periyar ↔ Tirupparankundram",color:"#d98b27",stops:["Periyar Bus Stand","South Gate","Pasumalai","Tirupparankundram"],coords:[[9.9195,78.1193],[9.9121,78.1197],[9.8944,78.1035],[9.8818,78.0739]]},
 {id:"B3",name:"Mattuthavani ↔ Othakadai",color:"#4477bb",stops:["Mattuthavani","Uthangudi","Othakadai"],coords:[[9.9396,78.1660],[9.9530,78.1741],[9.9932,78.1768]]},
 {id:"C4",name:"Periyar ↔ Thirunagar",color:"#9564a5",stops:["Periyar Bus Stand","Arappalayam","Kochadai","Thirunagar"],coords:[[9.9195,78.1193],[9.9316,78.1010],[9.9330,78.0834],[9.8815,78.0911]]},
 {id:"D5",name:"Arappalayam ↔ Mattuthavani",color:"#c45e64",stops:["Arappalayam","Goripalayam","Tallakulam","Mattuthavani"],coords:[[9.9316,78.1010],[9.9302,78.1280],[9.9361,78.1326],[9.9396,78.1660]]},
 {id:"E6",name:"Periyar ↔ Avaniyapuram",color:"#459a8c",stops:["Periyar Bus Stand","South Gate","Avaniyapuram"],coords:[[9.9195,78.1193],[9.9121,78.1197],[9.8860,78.1190]]}
];
const allStops = [
 ["Periyar Bus Stand",9.9195,78.1193],["Goripalayam",9.9302,78.1280],["Tallakulam",9.9361,78.1326],
 ["Mattuthavani",9.9396,78.1660],["South Gate",9.9121,78.1197],["Pasumalai",9.8944,78.1035],
 ["Tirupparankundram",9.8818,78.0739],["Uthangudi",9.9530,78.1741],["Othakadai",9.9932,78.1768],
 ["Arappalayam",9.9316,78.1010],["Kochadai",9.9330,78.0834],["Avaniyapuram",9.8860,78.1190]
];
const busData = [
 {id:"TN-58 101",route:"A1",progress:.26,minutes:4,speed:28},
 {id:"TN-58 214",route:"A1",progress:.69,minutes:9,speed:24},
 {id:"TN-58 032",route:"A2",progress:.42,minutes:6,speed:22},
 {id:"TN-58 417",route:"B3",progress:.31,minutes:5,speed:30},
 {id:"TN-58 168",route:"C4",progress:.73,minutes:8,speed:21},
 {id:"TN-58 509",route:"D5",progress:.56,minutes:3,speed:26}
];
const $ = id => document.getElementById(id);
let activeRoute = null, activeStop = "Periyar Bus Stand", searchTerm = "";
let map, routeLayers = [], stopMarkers = [], busMarkers = {}, toastTimer;
const routeById = id => routes.find(r=>r.id===id);
function interpolate(coords,t){
 const scaled=Math.max(0,Math.min(.9999,t))*(coords.length-1), i=Math.floor(scaled), f=scaled-i;
 return [coords[i][0]+(coords[i+1][0]-coords[i][0])*f,coords[i][1]+(coords[i+1][1]-coords[i][1])*f];
}
function toast(msg){$("toast").textContent=msg;$("toast").classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>$("toast").classList.remove("show"),2600)}
function initMap(){
 if(!window.L){$("map").innerHTML='<div class="map-fallback">Map needs an internet connection to load. Route and arrival panels still work.</div>';return}
 map=L.map("map",{zoomControl:true}).setView([9.929,78.133],12);
 L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
 allStops.forEach(s=>{
  const marker=L.marker([s[1],s[2]],{icon:L.divIcon({className:"stop-div-icon",html:'<div class="stop-marker"></div>',iconSize:[13,13],iconAnchor:[6,6]})}).addTo(map);
  marker.bindPopup(`<strong>${s[0]}</strong><br><small>Sample bus stop</small>`);
  marker.on("click",()=>selectStop(s[0]));
  stopMarkers.push({name:s[0],marker});
 });
 busData.forEach(b=>{
  const pos=interpolate(routeById(b.route).coords,b.progress);
  const marker=L.marker(pos,{icon:L.divIcon({className:"bus-div-icon",html:'<div class="bus-marker">🚌</div>',iconSize:[31,31],iconAnchor:[15,15]}),zIndexOffset:800}).addTo(map);
  marker.bindPopup(`<strong>${b.id}</strong><br>Route ${b.route}<br>Demo speed: ${b.speed} km/h`);
  marker.on("click",()=>{activeRoute=b.route;renderRoutes();renderArrivals();focusRoute(b.route);toast(`${b.id} · Route ${b.route} · Simulated location`)});
  busMarkers[b.id]=marker;
 });
 renderRouteLines(); updateBusPositions(); 
}
function renderRouteLines(){
 routeLayers.forEach(l=>map&&map.removeLayer(l));routeLayers=[];
 if(!map)return;
 routes.filter(r=>!activeRoute||r.id===activeRoute).forEach(r=>{
  const line=L.polyline(r.coords,{color:r.color,weight:activeRoute?5:3,opacity:activeRoute?.85:.35,dashArray:activeRoute?null:"5 7"}).addTo(map);
  line.bindPopup(`<strong>Route ${r.id}</strong><br>${r.name}`);routeLayers.push(line);
 });
}
function renderRoutes(){
 const list=$("routeList");list.innerHTML="";
 const filtered=routes.filter(r=>(!searchTerm||`${r.id} ${r.name} ${r.stops.join(" ")}`.toLowerCase().includes(searchTerm))&&(!activeRoute||r.id===activeRoute));
 (filtered.length?filtered:[]).forEach(r=>{
  const count=busData.filter(b=>b.route===r.id).length;
  const btn=document.createElement("button");btn.className="route-card"+(activeRoute===r.id?" active":"");
  btn.innerHTML=`<span class="route-number" style="background:${r.color}">${r.id}</span><span class="route-copy"><strong>${r.name}</strong><small>${r.stops.length} stops · ${r.stops[0]} to ${r.stops[r.stops.length-1]}</small></span><span class="route-meta">${count} bus${count===1?"":"es"}</span>`;
  btn.onclick=()=>{activeRoute=r.id;renderRoutes();renderRouteLines();renderArrivals();focusRoute(r.id);$("mapTitle").textContent=`Route ${r.id} · ${r.name}`;$("mapSubtitle").textContent="Illustrative route path and simulated bus positions"};
  list.appendChild(btn);
 });
 if(!filtered.length)list.innerHTML='<p class="empty">No matching routes. Try another search.</p>';
}
function renderStops(){
 const list=$("stopList");list.innerHTML="";
 allStops.filter(s=>!searchTerm||s[0].toLowerCase().includes(searchTerm)).slice(0,12).forEach(s=>{
  const btn=document.createElement("button");btn.className="stop-chip"+(activeStop===s[0]?" active":"");btn.textContent=s[0];
  btn.onclick=()=>selectStop(s[0]);list.appendChild(btn);
 });
 $("stopCount").textContent=allStops.filter(s=>!searchTerm||s[0].toLowerCase().includes(searchTerm)).length;
}
function selectStop(name){
 activeStop=name;renderStops();$("arrivalHeading").textContent=`Buses approaching ${name}`;
 const stop=allStops.find(s=>s[0]===name);if(map&&stop)map.setView([stop[1],stop[2]],14,{animate:true});
 renderArrivals();
 if(map){const m=stopMarkers.find(x=>x.name===name);if(m)m.marker.openPopup()}
}
function renderArrivals(){
 const list=$("arrivalList");list.innerHTML="";
 let eligible=busData.filter(b=>{
  const r=routeById(b.route);return (!activeRoute||b.route===activeRoute)&&(!searchTerm||`${b.id} ${b.route} ${r.name}`.toLowerCase().includes(searchTerm));
 });
 if(!eligible.length)eligible=busData.filter(b=>!activeRoute||b.route===activeRoute);
 eligible.slice(0,3).forEach((b,i)=>{
  const r=routeById(b.route), mins=Math.max(1,b.minutes+(Math.floor(Date.now()/15000)%3)-1);
  const card=document.createElement("article");card.className="arrival-card";
  card.innerHTML=`<div class="arrival-top"><strong>${b.id}</strong><span>Route ${b.route}</span></div><p>${r.name}</p><div class="arrival-bottom"><span>Est. arrival</span><b>${mins} min</b></div>`;
  card.onclick=()=>{if(map&&busMarkers[b.id]){map.setView(busMarkers[b.id].getLatLng(),15);busMarkers[b.id].openPopup()}};
  list.appendChild(card);
 });
 if(!eligible.length)list.innerHTML='<p class="empty">No demo buses match this filter.</p>';
}
function focusRoute(id){
 const r=routeById(id);if(!r||!map)return;
 const group=L.featureGroup([L.polyline(r.coords),...busData.filter(b=>b.route===id).map(b=>busMarkers[b.id]).filter(Boolean)]);
 map.fitBounds(group.getBounds().pad(.18),{maxZoom:14});
}
function updateBusPositions(){
 if(!map)return;
 busData.forEach(b=>{
  b.progress=(b.progress+.0025+(b.speed/100000))%1;
  if(busMarkers[b.id])busMarkers[b.id].setLatLng(interpolate(routeById(b.route).coords,b.progress));
 });
 $("busCount").textContent=busData.filter(b=>!activeRoute||b.route===activeRoute).length;
 renderArrivals();
}
$("searchInput").addEventListener("input",e=>{searchTerm=e.target.value.trim().toLowerCase();activeRoute=null;renderRoutes();renderStops();renderRouteLines();renderArrivals();$("mapTitle").textContent=searchTerm?"Search results":"Madurai bus network"});
$("clearSearch").onclick=()=>{$("searchInput").value="";searchTerm="";activeRoute=null;renderRoutes();renderStops();renderRouteLines();renderArrivals()};
$("showAll").onclick=()=>{activeRoute=null;renderRoutes();renderRouteLines();renderArrivals();$("mapTitle").textContent="Madurai bus network";$("mapSubtitle").textContent="Select a route or bus to explore";if(map)map.setView([9.929,78.133],12)};
$("locateButton").onclick=()=>{if(map)map.setView([9.925,78.119],13,{animate:true});toast("Showing Madurai city centre (sample map view)")};
renderRoutes();renderStops();renderArrivals();initMap();
setInterval(updateBusPositions,5000);
