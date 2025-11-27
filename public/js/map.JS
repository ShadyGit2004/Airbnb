
//Step 1: initialize communication with the platform
// const platform = new H.service.Platform({
//     apikey: mapKey,
// });

// const defaultLayers = platform.createDefaultLayers();

// //Step 2: initialize a map - this map is centered over Europe
// const map = new H.Map(
//     document.getElementById("map"),
//     defaultLayers.vector.normal.map,
//     {
//       center: { lat: 50, lng: 5 },
//       zoom: 5,
//       pixelRatio: window.devicePixelRatio || 1,
//     }
// );

// // add a resize listener to make sure that the map occupies the whole container
// window.addEventListener("resize", () => map.getViewPort().resize());
  
// //Step 3: make the map interactive MapEvents enables the event system Behavior implements default interactions for pan/zoom (also on mobile touch environments)
// const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
  
// // Create the default UI components
// const ui = H.ui.UI.createDefault(map, defaultLayers);
  
// /** Moves the map to display over Berlin @param  {H.Map} map A HERE Map instance within the application   */

// let homeIcon =`<span class="icon-box"><i class="fa-solid fa-house home-icon"></i></span>`;

// var customStyle = {
//     strokeColor: '#f72650',
//     fillColor: 'rgba(243, 44, 110, 0.300)',
// };

// function moveMapToBerlin(map) {   
//     let icon = new H.map.DomIcon(homeIcon);
//     let circle = new H.map.Circle({lat, lng}, 8000, { style: customStyle });
//     let marker = new H.map.DomMarker({lat, lng}, {icon}, {min : 4, max : 10,}); 
//     map.setCenter({ lat, lng });
//     map.addObject(marker);
//     map.addObject(circle);
//     map.setZoom(9);
//     let infoBubble = new H.ui.InfoBubble({lat, lng},{
//         content: `<h6><b>${listingName}</b></h6><p>Exact location provided after booking.</p>`,       
//     });   
//     function checkIcon(){
//         // alert(homeIcon)
//         if(homeIcon === `<span class="icon-box"><i class="fa-solid fa-house home-icon"></i></span>`){
//             homeIcon = `<span class="icon-box"><i class="fa-brands fa-airbnb home-icon"></i></span>`;
//             icon = new H.map.DomIcon(homeIcon);
//             marker = new H.map.DomMarker({lat, lng}, {icon});
//             map.addObject(marker);
//         }else{
//             homeIcon = `<span class="icon-box"><i class="fa-solid fa-house home-icon"></i></span>`;
//             icon = new H.map.DomIcon(homeIcon);
//             marker = new H.map.DomMarker({lat, lng}, {icon});
//             map.addObject(marker);
//         }
//     }    
//     circle.addEventListener("pointerenter",()=>{                       
//         checkIcon();
//         ui.addBubble(infoBubble);
//     });    
//     circle.addEventListener("pointerleave",()=>{            
//         checkIcon();
//         ui.removeBubble(infoBubble);
//     });
//     map.addEventListener("mapviewchangeend", (e)=>{
//         let currZoom = map.getZoom();
//         if(currZoom > 12){
//             // marker.setVisibility(false);           
//             circle.setVisibility(false);
//         }else if(currZoom < 1.5){
//             marker.setVisibility(false);            
//         } else {
//             marker.setVisibility(true);
//             circle.setVisibility(true);
//         }
//     })
// };

// // Now use the map
// moveMapToBerlin(map);






// mapboxgljs


mapboxgl.accessToken = mapbox_token;
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [lng, lat], // starting position [lng, lat]. Note that lat must be set between -90 and 90
        zoom: 12 // starting zoom
    });

    const marker = new mapboxgl.Marker()
  .setLngLat([lng, lat])
  .addTo(map);

//   const el = '<span class="icon-box"><i class="fa-solid fa-house home-icon"></i></span>';
// // style the element with CSS

// var customStyle = {
//     strokeColor: '#f72650',
//     fillColor: 'rgba(243, 44, 110, 0.300)',
// };

// const marker = new mapboxgl.Marker({
//     element: el,
//     StylePropertyMap
//     // specify other options here
// })
//   .setLngLat([-74.0060, 40.7128])
//   .addTo(map);


const popup = new mapboxgl.Popup()
  .setHTML(`<h6><b>${listingName}</b></h6><p>Exact location provided after booking.</p>`);

marker.setPopup(popup);


map.addControl(new mapboxgl.NavigationControl());