"use strict"
const dropdown1 = document.getElementById("level1");
const buttonLevel1 = document.getElementById("level1Text");
const buttonLevel2= document.getElementById("level2Text");
          
dropdown1.addEventListener('click', function(event) {
    dropdown1.classList.toggle('is-active');
    dropdown1.span
});

const dropdown1Sweden = document.getElementById("sweden");
dropdown1Sweden.addEventListener('click', function(event){
    swedenLocation()
    buttonLevel1.innerText = "Sweden";
});

const dropdown2 = document.getElementById("level2");
dropdown2.addEventListener('click', function(event) {
    
    dropdown2.classList.toggle('is-active');
 });

 const dropDown2Skåne = document.getElementById("skåne");
 dropDown2Skåne.addEventListener('click',function(event){
    stockholmLocation()
    buttonLevel2.innerText = "Skåne";
 })


 

 const dropdown3 = document.getElementById("level3");
 dropdown3.addEventListener('click', function(event) {
     dropdown3.classList.toggle('is-active');
  });
  const dropdown4 = document.getElementById("level4");
dropdown4.addEventListener('click', function(event) {
    dropdown4.classList.toggle('is-active');
 });
 

 