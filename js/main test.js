import * as THREE from 'https://cdn.skypack.dev/three@0.135.0';
import * as Loader from './Loader.js'
import {OrbitControls} from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/controls/OrbitControls.js'
import {Vector3} from 'https://cdn.skypack.dev/three@0.135.0';
import { TWEEN } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/libs/tween.module.min.js'


const clock = new THREE.Clock();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
let initScroll = 0;
camera.position.set(0,0,4);

//camera.lookAt(0, 0, 0);

var isInRoom = false;
var isInPlanet = true;

var listDynamicModel = new Array();
var me = new Array();
var planet = new Array();
var room = new Array();
var classroom = new Array();
var batiments = new Array();
var listName = ['maison','ecole'];
var listKey = [0,0,0,0];
var pivot = new THREE.Object3D();
scene.add(pivot);
pivot.position.set(0,0,0);

const raycaster = new THREE.Raycaster();
raycaster.set(new Vector3(0,0,4), new Vector3(0,0,-1));


var renderer = new THREE.WebGLRenderer({
    antialias: true
});
renderer.setSize( window.innerWidth, window.innerHeight );

document.body.appendChild( renderer.domElement );

var controls;
controls = new OrbitControls( camera, renderer.domElement );
controls.enableZoom = false;
controls.update();

renderer.render(scene, camera);

scene.add( new THREE.AmbientLight( 0xffffff, 0.1 ) );
var light = new THREE.HemisphereLight( 0xffffff, 0x080820, 1);
light.position.set(0, 10, -1)
scene.add( light );

/*light = new THREE.PointLight( 0xffffff, 1 );
light.position.set( 75, 300, -75 );
camera.add( light );*/

let mixer = new Array();
let actualPos = new Array();
actualPos.push(0);
//-----------------------------------------------------------------------------INITIATE
const texture = new THREE.TextureLoader().load( './models/uploads_files_2149069_school_color.jpg' );
Loader.LoadMeFBXAnimate(scene,'./models/Walking.fbx',1,new Vector3(0,0,0),new Vector3(0,0,2),mixer,me);
Loader.LoadAsyncModelGLTF(scene,'./models/chambre.gltf',10,new THREE.Vector3(-2,-10,0),new THREE.Vector3(0,1.97,0),room,'room',false);
Loader.LoadAsyncModelGLTF(scene,'./models/classroom.gltf',10,new THREE.Vector3(-2,-10,0),new THREE.Vector3(0,1.97,0),classroom,'classroom',false);
Loader.LoadAsyncModelFBX(scene,'./models/planet.fbx',4,new THREE.Vector3(0,0,0),new Vector3(0,0,0),planet);
Loader.LoadAsyncModelGLTF(scene,'./models/house.gltf',0.4,new Vector3(-2,-10,0),new Vector3(0,1.97,0),batiments,'maison');
Loader.LoadAsyncModelFBX(scene,'./models/school.fbx',0.35,new THREE.Vector3(19,175,92),new Vector3(2.1,5,1.5),batiments,'ecole',texture);

const sky = skybox();
scene.add(sky);
//planes();
animate();

//-----------------------------------------------------------------------------LISTENER

window.addEventListener('resize', () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
})

window.addEventListener("keydown", event => {
    if(me.length==0) return;
    if(planet.length==0) return;
    if(isInPlanet){
        switch(event.code){
            case "KeyW":
                listKey[0]=1;
                cameraReset();
                break;
            case "KeyA":
                listKey[1]=1;
                cameraReset();
                break;
            case "KeyS":
                listKey[2]=1;
                cameraReset();
                break;
            case "KeyD":
                listKey[3]=1;
                cameraReset();
                break;
            case "Enter":
                    console.log(controls.target);
                    checkBat();
                    break;
        }
    }

    if(isInRoom){
        switch(event.code){
            case "Escape":
                console.log("leave");
                onVisiblePlanet();
                break;
        }
    }
    
});

window.addEventListener("keyup", event => {
    switch(event.code){
        case "KeyW":
            listKey[0]=0;
            break;
        case "KeyA":
            listKey[1]=0;
            break;
        case "KeyS":
            listKey[2]=0;
            break;
        case "KeyD":
            listKey[3]=0;
            break;
    }
});



//-----------------------------------------------------------------------------FUNCTION

function animate() {
	requestAnimationFrame( animate );
        /*pivot.add(house[0]);
        pivot.add(planet[0]);*/
        initPivot();
        const spin = 0.01;
        const delta = clock.getDelta();
	    sky.rotation.y += 0.0001;

        //camera.position.lerp(new THREE.Vector3(initScroll,0,10),0.05);
        TWEEN.update();
        listDynamicModel.forEach(element => element.position.lerp(new THREE.Vector3(initScroll,element.position.y,element.position.z),0.05));
        mixer.forEach(mix => mix.update( delta ));

        if(me.length>0){
            rotateMe();
        }
        pivot.rotateOnWorldAxis(new Vector3(1,0,0),spin*listKey[0]-spin*listKey[2]);
        pivot.rotateOnWorldAxis(new Vector3(0,1,0),spin*listKey[1]-spin*listKey[3]);


        //if ( mixer ) mixer.update( delta );

		renderer.render( scene, camera );
};

function checkBat(){
    let intersects = raycaster.intersectObjects( batiments );
    if ( intersects.length > 0 ) {
        /*console.log(scene.children)
        console.log(intersects);*/

        var clickedObj = checkParentInList(intersects[0]);
        console.log(clickedObj);
        if(clickedObj=='maison'){
            onVisibleRoom();
            //document.location = '../maison.html'
        }
        if(clickedObj=='ecole'){
            onVisibleSchool();
            //document.location = '../maison.html'
        }
    }
}

function checkParentInList(objchild){
	if(objchild === undefined)
		return
	var current = objchild.object;
	while(current.parent.parent!==null){
        for(let i=0;i<listName.length;i++){
            if(listName[i]==current.name) {
                return current.name;
            };
        }
		current = current.parent;
        
	}
}

function initPivot(){
    pivot.add(planet[0]);
    batiments.forEach(element => pivot.add(element));
}

function cameraReset(){
    camera.position.set(0,0,4);
    camera.lookAt(0, 0, 0);
}

var finalAngle = 0;
function rotateMe(){

    const parseArray = listKey => {
    const binaryString = listKey.join("");
    return parseInt(binaryString, 2);
    };

    switch(parseArray(listKey)){
        case 1: //droite
            finalAngle = degToRad(90);
            break;
        case 3: //bas-droite
            finalAngle = degToRad(45);
            break;  
        case 2: //bas
            finalAngle = degToRad(0);
            break;
        case 6: //bas-gauche
        finalAngle = degToRad(315);
            //me[0].rotation.y = 315 * Math.PI/180;
            break;
        case 4: //gauche
            finalAngle = degToRad(270);
            //me[0].rotation.y = 270 * Math.PI/180;
            break;  
        case 12: //haut-gauche
            finalAngle = degToRad(225);
            //me[0].rotation.y = 225 * Math.PI/180;
            break;
        case 8: //haut
            finalAngle = degToRad(180);
            //me[0].rotation.y = 180 * Math.PI/180;
            break;
        case 9: //haut-droite
            finalAngle = degToRad(135);
            //me[0].rotation.y = 135 * Math.PI/180;
            break;
    }
    
    var newPosRotate = {x: 90 * Math.PI/180, y: finalAngle, z:0};
    const oldRot = {x: me[0].rotation.x, y: me[0].rotation.y, z: me[0].rotation.z};
    
    new TWEEN.Tween(oldRot).to(newPosRotate,75).start().onUpdate(() => {
        me[0].rotation.x = oldRot.x;
        me[0].rotation.y = oldRot.y;
        me[0].rotation.z = oldRot.z;
    });
}

function onVisibleRoom(){
    document.getElementById('Control').innerText = "Controles :\n Utiliser le clic souris pour observer la pièce\n 'Echap' pour quitter la pièce<br>"
    planet[0].visible = false;
    me[0].visible = false;
    batiments[0].visible = false;
    room[0].visible = true;
    camera.position.set(-1.5,4,1);

    controls.target = new THREE.Vector3(camera.position.x+0.1, camera.position.y+0.1, camera.position.z+0.1)
    isInPlanet = false;
    isInRoom = true;
}

function onVisibleSchool(){
    document.getElementById('Control').innerText = "Controles :\n Utiliser le clic souris pour observer la pièce\n 'Echap' pour quitter la pièce<br>"
    planet[0].visible = false;
    me[0].visible = false;
    batiments[0].visible = false;
    classroom[0].visible = true;
    camera.position.set(-1.5,4,1);

    controls.target = new THREE.Vector3(camera.position.x+0.1, camera.position.y+0.1, camera.position.z+0.1)
    isInPlanet = false;
    isInRoom = true;
}

function onVisiblePlanet(){
    document.getElementById('Control').innerText = "Controles :\n ZQSD pour se déplacer\n Utiliser le clic souris pour observer la planète\n    'Entrée' positioné sur un batiment pour y rentrer<br>"
    planet[0].visible = true;
    me[0].visible = true;
    batiments[0].visible = true;
    room[0].visible = false;
    classroom[0].visible = false;
    camera.position.set(0,0,4);
    camera.lookAt(0,0,0);
    
    controls.target = new THREE.Vector3(0, 0, 0)

    isInPlanet = true;
    isInRoom = false;
}

function degToRad(deg){
    return deg * Math.PI/180;
}

function createArray(){
    let materialArray = [];
    let texture_ft = new THREE.TextureLoader().load( './models/Daylight_Front.bmp');
    let texture_bk = new THREE.TextureLoader().load( './models/Daylight_Back.bmp');
    let texture_up = new THREE.TextureLoader().load( './models/Daylight_Top.bmp');
    let texture_dn = new THREE.TextureLoader().load( './models/Daylight_Bottom.bmp');
    let texture_rt = new THREE.TextureLoader().load( './models/Daylight_Right.bmp');
    let texture_lf = new THREE.TextureLoader().load( './models/Daylight_Left.bmp');
    
    materialArray.push(new THREE.MeshBasicMaterial( { map: texture_rt }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: texture_lf }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: texture_up }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: texture_dn }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: texture_ft }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: texture_bk }));
   
    for (let i = 0; i < 6; i++)
        materialArray[i].side = THREE.BackSide;

    return materialArray;
}

function skybox(){
    const materialArray = createArray();
    const geometry = new THREE.BoxGeometry( 100, 100, 100 );
    const cube = new THREE.Mesh( geometry, materialArray);
    cube.translateY(-9);
    listDynamicModel.push(cube);
    return cube;
}