'use strict'

//global variables
var tdis,dist;
var drone_velocity =0.0001;
const time_int = 5;
var latlngs = [];
var route = [];
var len;
var id=12345678;
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const form = document.querySelector('.form');
const delivery = document.querySelector('.delivery');
const pickup = document.querySelector('.pickup');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputAera = document.querySelector('.form__input--aera');
const inputDuration = document.querySelector('.form__input--duration');
const inputWeight = document.querySelector('.form__input--weight');

// point generator function 
function getPoint(latlngs, cur_lat, cur_lng) {
     tdis = Math.pow((latlngs[len-1][0] - latlngs[len-2][0]), 2) + Math.pow((latlngs[len-1][1] - latlngs[len-2][1]), 2);
    tdis = Math.sqrt(tdis);
    // console.log('vel',drone_velocity);
    var param =  drone_velocity / tdis;
    // var prev_dis = tdis;
  
     var new_lat = cur_lat + param * (latlngs[len-1][0] - latlngs[len-2][0]);
     var new_lng = cur_lng + param * (latlngs[len-1][1] - latlngs[len-2][1]);
  
    return [new_lat, new_lng];
  
  }

//distance calculator function
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}
//degree to radian 
function deg2rad(deg) {
  return deg * (Math.PI/180)
}

//new Order class constructer 
class Order{
constructor(type,coords,duration,distance,aera,weight){
this.coords=coords;
this.duration=duration;
this.distance=distance;
this.aera=aera;
this.weight=weight;
};
// calculate price method 
calcprice() {
  return Math.floor(this.aera*this.weight/this.duration);
}
}

class  App{
    
   
    #map;
    #mapEvent;

constructor(){
    this._getPosition();
    form.addEventListener('submit',this._newWorkout.bind(this));
    inputType.addEventListener('change',this._interchange)
    
}

_getPosition(){
         //geolocation API
    navigator.geolocation.getCurrentPosition(this._loadMap.bind(this),function(){alert('Kindly permit location access by selecting the location icon in the right corner of Search Bar and reload the page')});
   
    
}


_loadMap(position){
    const lats=position.coords.latitude;
    const long=position.coords.longitude;
    //initial latlngs 
    const arr=[lats ,long ];
    this.L=L;
    //set the map view 
    this.#map = L.map('map').setView(arr, 13);  
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.#map);
    
   //OnClick function 
    this.#map.on('click',function(mapEvnt){
        
        var newMarker = L.marker([mapEvnt.latlng.lat, mapEvnt.latlng.lng]).addTo(this.#map);
        latlngs.push([mapEvnt.latlng.lat,mapEvnt.latlng.lng]);
        len=latlngs.length;
        //Set the header message 
        if(len%2!=0)
        { 
          // console.log('sjdk');
          delivery.classList.remove('hidden');
          pickup.classList.add('hidden');
          
        }

        if (len%2 == 0) {
         
          dist=getDistanceFromLatLonInKm(latlngs[len-2][0],latlngs[len-2][1],latlngs[len-1][0],latlngs[len-1][1]);  
          form.classList.remove('hidden');
          this.#mapEvent=mapEvnt; 
       
        } 


    // Code to open the form 
        
     }.bind(this))

    }
_loadRoute(){
  
// creating a poyline between start and destination 
var arr=[latlngs[len-2],latlngs[len-1]];
  var polyline = this.L.polyline(arr, {
  color: 'blue'
}).addTo(this.#map);
  this.#map.fitBounds(polyline.getBounds());

// pushing the initial coordinates to route 
route.push(latlngs[len-2]);
console.log('Latlang final',latlngs[len-1]);
// to store the starting index for the next order as the route will be filled after the first order 
this.prev=route.length-1;
// console.log(this.prev);
//calculating total distance from intial and final coords
 tdis = Math.pow((latlngs[len-1][0] - latlngs[len-2][0]), 2) + Math.pow((latlngs[len-1][1] - latlngs[len-2][1]), 2);
var prev_dis = tdis;
//prev latlangs 
var prev_lat = latlngs[len-2][0];
var prev_lng = latlngs[len-2][1];

var idx = 1;
for (idx = 1; ; idx++) 
{ 
   var next_pt = getPoint(latlngs, prev_lat, prev_lng);  //getting next point from the current point 
   var cur_dis = Math.pow((latlngs[len-2][0] - next_pt[0]), 2) + Math.pow((latlngs[len-2][1] - next_pt[1]), 2); //current distance with the destination
   if (cur_dis > prev_dis)
    break;
  route.push(next_pt);     //pushing the point into our route 
  prev_lat = next_pt[0];   //updating prrevious coordinates to current 
  prev_lng = next_pt[1];
}

}
_newWorkout(e){
    let order;
    e.preventDefault();
    this.date=new Date();
    this.month=months[new Date().getMonth()];
    this.date=(new Date()).getDate();
    const {lat,lng}=this.#mapEvent.latlng;
    const brr=[lat,lng]
    
    //check data validity 
    if(inputDuration.value<0||inputAera.value<0||inputWeight.value<0)
     {
        alert('Input values should be positive');
     }
     else if(inputDuration.value==0||inputAera.value==0||inputWeight.value==0)
     {
        alert('Input Values should not be empty');
     }
     else if(inputWeight.value>500)
     {
        alert('Weight should be less tha 500 gm');
     }
     else{
        order=new Order(inputType.value,brr,inputDuration.value,dist,inputAera.value,inputWeight.value);
         
        this.event='Order of '+this.month+' '+this.date;
    
     drone_velocity=0.0005*dist/inputDuration.value;
     console.log('vel32',drone_velocity);
     this._loadRoute();  
     route.push(latlngs[len-1]); 
     //marker icon
     //  console.log('route',route);
     var myIcon = this.L.icon({
     iconUrl: 'logo.png',
     iconSize: [45, 45],
     iconAnchor: [25, 50],
     popupAnchor: [-3, -76],
     shadowSize: [0, 0],
     shadowAnchor: [50, 0]
  });

     var marker = this.L.marker(latlngs[len-2], {icon:myIcon}).addTo(this.#map);
     var n=route.length;
     //  marker.setLatLng([route[4][0],route[4][1]]);
     var cc=0;
    
     for(let i=this.prev;i<route.length;i++)
     //  route.forEach(function (coord, index) 
     {
      
      setTimeout(function () {
        marker.setLatLng([route[i][0],route[i][1]]);
      }, 50 * cc)
     cc++;
     }
     //set the message again
     pickup.classList.remove('hidden');
     delivery.classList.add('hidden');
     //render this data as block
     id++;
     this._renderBlock(order);
    
     //hide the form
     this._hideform(order);
            }
    
}

_hideform(order){
     inputDuration.value=inputWeight.value=inputAera.value='';
     form.style.display='none';
     form.classList.add('hidden');
     setTimeout(() => (form.style.display = 'grid'), 2000);
    
  }

  
_renderBlock(order){
     //final details for the customers  
     let html=`<li class="order order--running" data-id="1234567890">
     <h2 class="workout__title">${this.event}</h2>
     <div class="workout__details">
     <span class="workout__icon">ID</span>
     <span class="workout__value">${id}</span>
   
   </div>  
     <div class="workout__details">
       <span class="workout__icon">📐</span>
       <span class="workout__value">${order.aera}</span>
       <span class="workout__unit">cm²</span>
     </div>
     <div class="workout__details">
     <span class="workout__icon">⚖️</span>
     <span class="workout__value">${order.weight}</span>
     <span class="workout__unit">gm</span>
   </div>
   <div class="workout__details">
        <span class="workout__icon">💰</span>
        <span class="workout__value">${order.calcprice()}</span>
        <span class="workout__unit">Rupess</span>
      </div>
     `;
 
     html+=`<\li>`;
     form.insertAdjacentHTML('afterend',html);
}
_interchange(){
    // inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    // inputWeight.closest('.form__row').classList.toggle('form__row--hidden');
    
}










};
//getting postion and using geolocation API
 const myapp=new App();

// display form on click on map

// change between cadence and elevation
