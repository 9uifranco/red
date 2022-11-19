import './style.css'

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls'
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader"
import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader"
import {Text} from 'troika-three-text'
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

gsap.registerPlugin(ScrollTrigger);

let size = {
  width: window.innerWidth,
  height: window.innerHeight
}

// animation route

class objectRoute {
  constructor(initPosX, initPosY, initPosZ, initRotX, initRotY, initRotZ) {
    this.route = [{
      posX: initPosX,
      posY: initPosY,
      posZ: initPosZ,
      rotX: initRotX,
      rotY: initRotY,
      rotZ: initRotZ
    }];
  }

  addNode(posX, posY, posZ, rotX, rotY, rotZ) {
    this.route.push({ 
      posX: posX,
      posY: posY,
      posZ: posZ,
      rotX: rotX,
      rotY: rotY,
      rotZ: rotZ
    });
  }

  distanceTo(index) {
    var dist = {
      posX: this.route[index].posX - this.route[index-1].posX,
      posY: this.route[index].posY - this.route[index-1].posY,
      posZ: this.route[index].posZ - this.route[index-1].posZ,
      rotX: this.route[index].rotX - this.route[index-1].rotX,
      rotY: this.route[index].rotY - this.route[index-1].rotY,
      rotZ: this.route[index].rotZ - this.route[index-1].rotZ
    };
    return dist;
  }
}

// update object position based on route

function calcPosition(object, objectRoute, index, progress) {
  // next position = current position + (distance to next position * self.progress)
  object.position.x = objectRoute.route[index].posX + (objectRoute.distanceTo(index + 1).posX * progress);
  object.position.y = objectRoute.route[index].posY + (objectRoute.distanceTo(index + 1).posY * progress);
  object.position.z = objectRoute.route[index].posZ + (objectRoute.distanceTo(index + 1).posZ * progress);
  object.rotation.x = objectRoute.route[index].rotX + (objectRoute.distanceTo(index + 1).rotX * progress);
  object.rotation.y = objectRoute.route[index].rotY + (objectRoute.distanceTo(index + 1).rotY * progress);
  object.rotation.z = objectRoute.route[index].rotZ + (objectRoute.distanceTo(index + 1).rotZ * progress);
}

// object routes 

// camera route
const cameraRoute = new objectRoute(0, 40, 120, -0.1, 0, 0); // inital position
cameraRoute.addNode(-1,22,25,-0.7,0,-1.1); 
cameraRoute.addNode(-1,22,8,-1.3,0,-1.6); 
cameraRoute.addNode(-1,11,4,-1.5,0,-3.14); 
cameraRoute.addNode(40,11,4,-1.5,0,-4.30); 
cameraRoute.addNode(80,0,2,-0.1,0,-6.28); 
cameraRoute.addNode(104.5,0,24,0,0.62,-6.28);

// plane route
const planeRoute = new objectRoute(50, 10.3, 0, 1.5708, 0, 0); // inital position
planeRoute.addNode(50, 10.3, 0, 1.5708, 0, 0);
planeRoute.addNode(50, 10.3, 0, 1.5708, 0, 0);
planeRoute.addNode(50, 10.3, 0, 1.5708, 0, 0);
planeRoute.addNode(50, 10.3, 0, 1.5708, 0, 0);
planeRoute.addNode(50, 0, 0, Math.PI, 0, 0);
planeRoute.addNode(50, 0, 0, Math.PI, 0, 0);

// scene

const scene = new THREE.Scene();

scene.background = new THREE.Color(0xffffff);

// camera

const camera = new THREE.PerspectiveCamera(45, size.width / size.height, 0.1, 1000);

camera.position.setX(0);
camera.position.setY(40);
camera.position.setZ(120);

camera.rotation.x = -0.10;

// renderer

const renderer = new THREE.WebGLRenderer({
  
  antialias: true,

  canvas: document.querySelector('#bg') // which DOM element to use
});

renderer.setSize( size.width, size.height );

document.body.appendChild(renderer.domElement);

renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.shadowMap.enabled = true;

renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

// plane

var redTexture = new THREE.TextureLoader().load('./assets/wall!.png');
redTexture.encoding = THREE.sRGBEncoding;
const geometry = new THREE.PlaneGeometry( 90, 10 );
const material = new THREE.MeshStandardMaterial( {map: redTexture, side: THREE.DoubleSide, roughness: 1, toneMapped: false, emissive: 0xff0000, emissiveIntensity: 0.1} );

const plane = new THREE.Mesh( geometry, material );
plane.castShadow = true;
scene.add( plane );

plane.position.x = 50;
plane.position.y = 10.2;
plane.rotation.x = 1.5708;
plane.visible = false;

// ground

const geometryGround = new THREE.PlaneGeometry( 2000, 1000 );
const materialGround = new THREE.MeshStandardMaterial( {color: 0x333333, roughness: 0} );

const ground = new THREE.Mesh( geometryGround, materialGround );
ground.receiveShadow = true;
scene.add( ground );

ground.rotation.x = -0.5 * Math.PI;
ground.position.x = 50;
ground.position.y = -5;

// text

const myText = new Text()
scene.add(myText)
myText.text = "Made by Guilherme Franco"
myText.font = './fonts/FingerPaint-Regular.ttf'
myText.fontSize = 4;
myText.color = 0xffffff;
myText.position.x = 18;
myText.position.y = 3;
myText.position.z = 0.1;
myText.visible = false;
myText.frustumCulled = false;

const myText2 = new Text()
scene.add(myText2)
myText2.text = "Scroll down!"
myText2.font = './fonts/FingerPaint-Regular.ttf'
myText2.fontSize = 4;
myText2.color = 0xff0000;
myText2.position.x = -13;
myText2.position.y = 43;
myText2.position.z = 70;
myText2.frustumCulled = false;

// lights

const ambientLight = new THREE.AmbientLight( 0xffffff, 1 )
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
directionalLight.position.set(-2, 20, -20);
directionalLight.castShadow = true;

//Set up shadow properties for the light
directionalLight.shadow.mapSize.x = 2048;
directionalLight.shadow.mapSize.y = 2048;
directionalLight.shadow.camera.near = -15; // default
directionalLight.shadow.camera.far = 70; // default

directionalLight.shadow.camera.left = 80;
directionalLight.shadow.camera.right = -120;
directionalLight.shadow.camera.top = 30;
directionalLight.shadow.camera.bottom = -10;

scene.add(directionalLight);

//const lightHelper = new THREE.DirectionalLightHelper(directionalLight);
//scene.add(lightHelper);

//const shadowCameraHelper = new THREE.CameraHelper( directionalLight.shadow.camera );
//scene.add(shadowCameraHelper);

// controls

// for orbit control

/*

const controls = new OrbitControls(camera, renderer.domElement);

controls.enableZoom = true;
controls.enablePan = true;

controls.update();
*/
// for fp control

/*
const controls = new FirstPersonControls(camera, renderer.domElement);
controls.movementSpeed = 50;
controls.lookSpeed = 0.2;

controls.target = new THREE.Vector3(0, 0, -40);

*/

// loading manager

const loadingManager = new THREE.LoadingManager();

const progressBar = document.getElementById("progress-bar");

let loadedEverything = false;

loadingManager.onProgress = function(url, loaded, total) {
  console.log(loaded)
  progressBar.value = (loaded / 13) * 100;
  var percentage = 0;
  var curr = progressBar.value;
  var update = setInterval(function() {
    if (curr > percentage) {
      clearInterval(update);
    }
    progressBar.value = curr++;
  }, 0)

  if(loaded == 13) {
    loadedEverything = true;
  }
}

const loadingDiv = document.querySelector('.loading');

let loadingManagerLoaded = false;

loadingManager.onLoad = function() {
  loadingManagerLoaded = true;
  setupAnimation();
}

// gsap 

function setupAnimation() {
  if (loadingManagerLoaded && loadedEverything) {
    window.scrollTo(0, 0);
    loadingDiv.style.display = "none";
    document.querySelector('body').style.overflow = "visible";
  }
  scrollAnimation();
}

function scrollAnimation() {
  const o = { a: 0 };
  
  const tl = gsap.timeline({
    default: {
      duration: 50,
      //ease: "Power2.easeInOut"
    }
  });

  tl.to(o, {
    a: 2,
    duration: 50,
    scrollTrigger: {
      trigger: ".section-a",
      start: "top top",
      end: "bottom top",
      // markers: true,
      onUpdate: (self) => {
        if(self.direction == 1) { 
          calcPosition(camera, cameraRoute, 0, self.progress); // camera
          calcPosition(plane, planeRoute, 0, self.progress); // plane
        }
        if(self.direction == -1) {
          calcPosition(camera, cameraRoute, 0, self.progress); // camera
          calcPosition(plane, planeRoute, 0, self.progress); // plane
        }
      },
    }
  });

  tl.to(o, {
    a: 2,
    duration: 50,
    scrollTrigger: {
      trigger: ".section-b",
      start: "top top",
      end: "bottom bottom",
      // markers: true,
      onUpdate: (self) => {
        if(self.direction == 1) {
          calcPosition(camera, cameraRoute, 1, self.progress); // camera
          calcPosition(plane, planeRoute, 1, self.progress); // plane
        }
        if(self.direction == -1) {
          calcPosition(camera, cameraRoute, 1, self.progress); // camera
          calcPosition(plane, planeRoute, 1, self.progress); // plane
        }
      },
    }
  });

  tl.to(o, {
    a: 2,
    duration: 50,
    scrollTrigger: {
      trigger: ".section-c",
      start: "top top",
      end: "bottom bottom",
      // markers: true,
      onUpdate: (self) => {
        if(self.direction == 1) {
          calcPosition(camera, cameraRoute, 2, self.progress); // camera
          calcPosition(plane, planeRoute, 2, self.progress); // plane
        }
        if(self.direction == -1) {
          calcPosition(camera, cameraRoute, 2, self.progress); // camera
          calcPosition(plane, planeRoute, 2, self.progress); // plane
          plane.visible = false;
          myText.visible = false;
          paintCan1.visible = true; 
        }
      },
    }
  });

  tl.to(o, {
    a: 2,
    duration: 50,
    scrollTrigger: {
      trigger: ".section-d",
      start: "top top",
      end: "bottom bottom",
      // markers: true,
      onUpdate: (self) => {
        if(self.direction == 1) {
          plane.visible = true;
          paintCan2.visible = true;
          paintCan1.visible = false; 
          calcPosition(camera, cameraRoute, 3, self.progress); // camera
          calcPosition(plane, planeRoute, 3, self.progress); // plane
        }
        if(self.direction == -1) {
          paintCan2.visible = false;
          
          calcPosition(camera, cameraRoute, 3, self.progress); // camera
          calcPosition(plane, planeRoute, 3, self.progress); // plane
        }
      },
    }
  });

  tl.to(o, {
    a: 2,
    duration: 50,
    scrollTrigger: {
      trigger: ".section-e",
      start: "top top",
      end: "bottom bottom",
      // markers: true,
      onUpdate: (self) => {
        if(self.direction == 1) {
          calcPosition(camera, cameraRoute, 4, self.progress); // camera
          calcPosition(plane, planeRoute, 4, self.progress); // plane
          myText.visible = true;
          paintCan1.visible = false; 
          paintCanLayer.visible = false;
        }
        if(self.direction == -1) {
          paintCan1.visible = false; 
          myText.visible = false;
          paintCanLayer.visible = true;
          calcPosition(camera, cameraRoute, 4, self.progress); // camera
          calcPosition(plane, planeRoute, 4, self.progress); // plane
        }
      },
    }
  });

  tl.to(o, {
    a: 2,
    duration: 50,
    scrollTrigger: {
      trigger: ".section-f",
      start: "top bottom",
      end: "bottom bottom",
      // markers: true,
      onUpdate: (self) => {
        if(self.direction == 1) {
          calcPosition(camera, cameraRoute, 5, self.progress); // camera
          calcPosition(plane, planeRoute, 5, self.progress); // plane
        }
        if(self.direction == -1) {
          calcPosition(camera, cameraRoute, 5, self.progress); // camera
          calcPosition(plane, planeRoute, 5, self.progress); // plane
        }
      },
    }
  });
}

// 3D element

const paintCanURL = new URL('./assets/scene.gltf', import.meta.url);
const paintCanURL2 = new URL('./assets/scene2.gltf', import.meta.url);
const textureURL = new URL('./assets/MR_INT-005_WhiteNeons_NAD.hdr', import.meta.url);

const assetLoader = new GLTFLoader(loadingManager);
const rgbeloader = new RGBELoader(loadingManager);

let paintCan1;
let paintCan2;
let paintCanLayer;

rgbeloader.load(textureURL.href, function(texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;

  assetLoader.load(paintCanURL.href, function(gltf) {

    gltf.scene.traverse(function(node) {
      if(node.isMesh){
        node.castShadow = true;
      }
    });

    let model = gltf.scene;
    let canClone = SkeletonUtils.clone(model);

    model.position.x = 0;
    model.position.y = -5;
    model.position.z = 2;
    model.scale.set(10, 10, 10);

    canClone.position.x = 100;
    canClone.position.y = -5;
    canClone.position.z = 0;
    canClone.rotation.y = 3 * 1,5708;
    canClone.scale.set(2, 2, 2);
    canClone.visible = false;

    scene.add(canClone);
    scene.add(model);

    paintCan1 = model;
    paintCan2 = canClone;
  }, undefined, function ( error ) {
    console.log( 'An error happened' );
  });

  assetLoader.load(paintCanURL2.href, function(gltf) {

    gltf.scene.traverse(function(node) {
      if(node.isMesh){
        node.castShadow = true;
      }
    });

    let model = gltf.scene;

    model.position.x = 0;
    model.position.y = -5;
    model.position.z = 2;
    model.scale.set(10, 10, 10);

    scene.add(model);

    paintCanLayer = model;
  }, undefined, function ( error ) {
    console.log( 'An error happened' );
  });
});

// mobile disclaimer

if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/iPhone/i)) { // for mobile devices
  document.getElementById("mobile-disclaimer").style.display = "flex"
}

// animation loop

//const clock = new THREE.Clock(); // for fp control

function animate() {
  // controls.update(clock.getDelta()) // for fp control
	renderer.render( scene, camera );
}

window.requestAnimationFrame(animate);

renderer.setAnimationLoop(animate);