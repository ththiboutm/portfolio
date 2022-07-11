import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/loaders/FBXLoader.js';
import * as THREE from 'https://cdn.skypack.dev/three@0.135.0';
import { OBJLoader } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/loaders/OBJLoader.js';
import { TextureLoader, SpriteMaterial, Sprite, Box3, Vector3,} from 'https://cdn.skypack.dev/three@0.135.0/build/three.module.js';


const gltfLoader = new GLTFLoader();
const objLoader = new OBJLoader();
const fbxLoader = new FBXLoader();



export async function LoadAll(data,camera,scene,listModel,actualPos,center,distance){
    let currentbox;
    let distance2;

    await asyncForEach(data, async element => {
        await LoadModel(camera,scene, element.path, element.size, listModel, actualPos);
        currentbox = new Box3().setFromObject( listModel[listModel.length - 1])
    });
    //await LoadModel(camera,scene, element.path, 1, listModel, actualPos);
    let size = new Vector3()
    //Initialise la caméra centrée sur l'objet 0
	var box0 = new Box3().setFromObject( listModel[0] )
    box0.getCenter(center);
	box0.getSize(size);
    distance2 = Math.abs( size.y / Math.sin( camera.fov * ( Math.PI / 180 ) / 2) -1)
	camera.position.set(box0.getCenter(new Vector3).x, 
	box0.getCenter(new Vector3).y, 
	distance2)
    console.log(camera.position)
    camera.updateProjectionMatrix()

}

async function asyncForEach(array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
}

export async function LoadModel(camera,scene, path, size, listModel, actualPos){
    let splited = path.split(".")
    switch(splited[splited.length - 1]){
        case 'obj':
            await LoadModelOBJ(scene, path, size, listModel, actualPos)
            break;
        case 'glb':
            await LoadModelGLTF(camera,scene, path, size, listModel,actualPos)
            break;
        case 'gltf':
            await LoadModelGLTF(scene, path, size, listModel, actualPos)
            break;
        case 'png':
            await LoadImage(scene, path, size, listModel, actualPos)
            break;
        case 'jpg':
            await LoadImage(scene, path, size, listModel, actualPos)
            break;
    }
}

export async function LoadModelGLTF(scene, path, size,rotation,translation){

    await gltfLoader.loadAsync(
        // resource URL
        path          
    ).then(
        function ( gltf ) {
            //model = gltf.scene;
            var box = new Box3().setFromObject( gltf.scene );
            var bbSize = new Vector3();
            var center = new Vector3();
            box.getSize(bbSize);

            
            //box.position.set(0,0,0)
            console.log("X:"+translation.x + " Y:"+translation.y + " Z:"+translation.z);
            var ratio = bbSize.y/size;
            gltf.scene.position.set(translation.x,translation.y,translation.z);
            gltf.scene.rotation.y = rotation * Math.PI/180;
            gltf.scene.scale.set(1/ratio, 1/ratio, 1/ratio);
            //gltf.scene.scale.set(10, 10, 10);
            //(gltf.scene).translateY(box.min.y);
            
            
            gltf.scene.traverse( function( node ) {

                if ( node.isMesh ) { 
                    node.castShadow = true;
                    node.receiveShadow = true;
                    node.geometry.computeVertexNormals();
                }
        
            } );
            console.log(gltf.scene)

            box.getCenter(center);
            //box.getSize(size);
            /*var distance2 = Math.abs( bbSize.y / Math.sin( camera.fov * ( Math.PI / 180 ) / 2) -1)
            camera.position.set(center.x, 
            center.y, 
            distance2)*/

            scene.add(gltf.scene)
                
            gltf.animations; // Array<THREE.AnimationClip>
            gltf.scene; // THREE.Group
            gltf.scenes; // Array<THREE.Group>
            gltf.cameras; // Array<THREE.Camera>
            gltf.asset; // Object
        }
    ).catch(
        function ( error ) {
            console.log( 'An error happened' );
            console.log(error)
        }
    );


}

export function LoadAsyncModelGLTF(scene, path, size,rotation,translation,listModel,name){

    gltfLoader.load(
        path,function ( gltf ) {
            
            listModel.push(gltf.scene);
            var box = new Box3().setFromObject( gltf.scene );
            var bbSize = new Vector3();
            var center = new Vector3();
            box.getSize(bbSize);

            
            //box.position.set(0,0,0)
            var ratio = bbSize.y/size;

            gltf.scene.position.set(translation.x,translation.y,translation.z);
            gltf.scene.rotation.x = rotation.x * Math.PI/180;
            gltf.scene.rotation.y = rotation.y * Math.PI/180;
            gltf.scene.rotation.z = rotation.z * Math.PI/180;
            gltf.scene.scale.set(1/ratio, 1/ratio, 1/ratio);
            
            
            gltf.scene.traverse( function( node ) {

                if ( node.isMesh ) { 
                    node.castShadow = true;
                    node.receiveShadow = true;
                    node.geometry.computeVertexNormals();
                }
        
            } );
            gltf.scene.name = name;
            scene.add(gltf.scene)
                
            gltf.animations; // Array<THREE.AnimationClip>
            gltf.scene; // THREE.Group
            gltf.scenes; // Array<THREE.Group>
            gltf.cameras; // Array<THREE.Camera>
            gltf.asset; // Object
        }
    );


}

export function LoadAsyncModelFBXAnimate(scene, path, size, rotation, translation, mixer, listModel){
    fbxLoader.load( path, function ( object ) {
        listModel.push(object);
        var box = new Box3().setFromObject( object );
        var bbSize = new Vector3();
        box.getSize(bbSize);
        var ratio = bbSize.y/size;
    
        object.scale.set(1/ratio, 1/ratio, 1/ratio);
        object.rotation.y = rotation * Math.PI/180;
        object.position.set(translation.x,translation.y,translation.z);
        let mix = new THREE.AnimationMixer( object );
        mixer.push(mix);
        const action = mix.clipAction( object.animations[ 0 ] );
        action.play();
    
        object.traverse( function ( child ) {
    
            if ( child.isMesh ) {
    
                child.castShadow = true;
                child.receiveShadow = true;
    
            }
    
            } );
        scene.add( object );
    } );
}


export function LoadMeFBXAnimate(scene, path, size, rotation, translation, mixer, listModel){
    fbxLoader.load( path, function ( object ) {
        listModel.push(object);
        var box = new Box3().setFromObject( object );
        var bbSize = new Vector3();
        box.getSize(bbSize);
        var ratio = bbSize.y/size;
    
        object.scale.set(1/ratio, 1/ratio, 1/ratio);
        object.rotation.x = rotation.x * Math.PI/180;
        object.rotation.y = rotation.y * Math.PI/180;
        object.rotation.z = rotation.z * Math.PI/180;
        object.position.set(translation.x,translation.y,translation.z);
        let mix = new THREE.AnimationMixer( object );
        mixer.push(mix);
        const action = mix.clipAction( object.animations[ 0 ] );
        action.play();
    
        object.traverse( function ( child ) {
    
            if ( child.isMesh ) {
    
                child.castShadow = true;
                child.receiveShadow = true;
    
            }
    
            } );
        scene.add( object );
    } );
}

export function LoadAsyncModelFBX(scene, path, size, rotation, translation, listModel,texture=null){
    fbxLoader.load( path, function ( object ) {
        listModel.push(object);
        var box = new Box3().setFromObject( object );
        var bbSize = new Vector3();
        box.getSize(bbSize);
        var ratio = bbSize.y/size;
    
        object.scale.set(1/ratio, 1/ratio, 1/ratio);
        object.rotation.y = rotation * Math.PI/180;
        object.position.set(translation.x,translation.y,translation.z);
    
        object.traverse( function ( child ) {
    
            if ( child.isMesh ) {
    
                child.castShadow = true;
                child.receiveShadow = true;
                if(texture) child.material.map = texture;
            }
    
            } );
        scene.add( object );
    } );
}

export function LoadAsyncPlanetModelFBX(scene, path, size, rotation, translation, listModel,texture=null){
    fbxLoader.load( path, function ( object ) {
        listModel.push(object);
        var box = new Box3().setFromObject( object );
        var bbSize = new Vector3();
        box.getSize(bbSize);
        var ratio = bbSize.y/size;
    
        //object.scale.set(1/ratio, 1/ratio, 1/ratio);
        object.rotation.y = rotation * Math.PI/180;
        object.position.set(translation.x,translation.y,translation.z);
    
        object.traverse( function ( child ) {
    
            if ( child.isMesh ) {
    
                child.castShadow = true;
                child.receiveShadow = true;
                if(texture) child.material.map = texture;
            }
    
            } );
        scene.add( object );
    } );
}

export function LoadAsyncModelOBJ(scene, path, size, rotation, translation, listModel,texture=null){
    objLoader.load( path, function ( object ) {
        listModel.push(object);
        var box = new Box3().setFromObject( object );
        var bbSize = new Vector3();
        box.getSize(bbSize);
        var ratio = bbSize.y/size;
    
        object.scale.set(1/ratio, 1/ratio, 1/ratio);
        object.rotation.y = rotation * Math.PI/180;
        object.position.set(translation.x,translation.y,translation.z);
    
        object.traverse( function ( child ) {
    
            if ( child.isMesh ) {
    
                child.castShadow = true;
                child.receiveShadow = true;
                if(texture) child.material.map = texture;
            }
    
            } );
        scene.add( object );
    } );
}

export async function LoadModelOBJ(scene, path, size, listModel, actualPos, texture = null){
    await objLoader.loadAsync(
        // resource URL
        path           
    ).then(
        function ( obj ) {
            listModel.push(obj)
            var box = new Box3().setFromObject( obj );
            var bbSize = new Vector3();
            box.getSize(bbSize);

            var ratio = bbSize.y/size;

            obj.scale.set(1/ratio, 1/ratio, 1/ratio)
            
            box = new Box3().setFromObject( obj );
            box.getSize(bbSize);

            (obj).translateY(-box.min.y);
            (obj).translateZ(box.min.z);
            (obj).translateX(actualPos[0]+ Math.abs(box.min.x))

            obj.traverse( function ( child ) {
    
                if ( child.isMesh ) {
                    if(texture) child.material.map = texture;
                }
        
                } );
            obj.castShadow = true;
            obj.receiveShadow = true;
            scene.add(obj)
            
            actualPos[0] += Math.abs(box.max.x-box.min.x)
        }
    ).catch(
        function ( error ) {
            console.log( 'An error happened' );
            console.log(error)
        }
    );
}

export async function LoadModelFBXAnimate(scene, path, size, rotation, translation, mixer, listDynamicModel){
    await fbxLoader.loadAsync(
        // resource URL
        path           
    ).then(
        function ( obj ) {
            listDynamicModel.push(obj)
            var box = new Box3().setFromObject( obj );
            var bbSize = new Vector3();
            box.getSize(bbSize);

            var ratio = bbSize.y/size;

            obj.scale.set(1/ratio, 1/ratio, 1/ratio);

            obj.rotation.y = rotation * Math.PI/180;
            obj.position.set(translation);

	        mixer = new THREE.AnimationMixer( obj );
	        const action = mixer.clipAction( obj.animations[ 0 ] );
	        action.play();

	        obj.traverse( function ( child ) {

                if ( child.isMesh ) {

                    child.castShadow = true;
                    child.receiveShadow = true;

                }

            } );
        scene.add(obj)
        }
    ).catch(
        function ( error ) {
            console.log( 'An error happened' );
            console.log(error)
        }
    );
}

export async function LoadImage(scene, path, size, translation, listModel){
    const map = new TextureLoader().load( path );
    const material = new SpriteMaterial( { map: map } );
    const sprite = new Sprite( material );
    listModel.push(sprite);

    var box = new Box3().setFromObject( sprite );
    var bbSize = new Vector3();
    box.getSize(bbSize);

    var ratio = bbSize.y/size;

    sprite.scale.set(1/ratio, 1/ratio)
    sprite.position.set(translation.x,translation.y,translation.z);
    sprite.castShadow = true;
    sprite.receiveShadow = true;
    
    scene.add( sprite );

}