define([
	'goo/entities/components/ScriptComponent',
	'goo/entities/EntityUtils',
	'goo/math/Quaternion',
	'goo/math/Vector3',

	'js/AmmoDebugShapeCreator'

],
	function(
		ScriptComponent,
		EntityUtils,
		Quaternion,
		Vector3,

		AmmoDebugShapeCreator
		) {
		"use strict";

		var calcVec = new Vector3();
		var ammoWorld;

		// worker variables.
		var physTransform;
		var quaternion;
		var btVec;

		// enum PHY_ScalarType
		var PHY_FLOAT = 0;
		var PHY_DOUBLE = 1;
		var PHY_INTEGER = 2;
		var PHY_SHORT = 3;
		var PHY_FIXEDPOINT88 = 4;
		var PHY_UCHAR = 5;

		/**
		 * This class uses ammo.js which is loaded from index.html. Ammo is a JavaScript port of
		 * the Bullet physics engine: http://bulletphysics.org/wordpress/
		 * @param meshData
		 * @return {Ammo.btBvhTriangleMeshShape}
		 */

		function createTriangleMeshShape(meshData, scale) {
			var vertices = meshData.dataViews.POSITION;
			var indices = meshData.indexData.data;

			var numTriangles = meshData.indexCount / 3;
			var numVertices = meshData.vertexCount;

			var triangleMesh = new Ammo.btTriangleIndexVertexArray();

			var indexType = PHY_INTEGER;
			var mesh = new Ammo.btIndexedMesh();

			var floatByteSize = 4;
			var vertexBuffer = Ammo.allocate( floatByteSize * vertices.length, "float", Ammo.ALLOC_NORMAL );
			for ( var i = 0, il = vertices.length; i < il; i ++ ) {
				Ammo.setValue(vertexBuffer + i * floatByteSize, scale * vertices[ i ], 'float');
			}

			var use32bitIndices = true;
			var intByteSize = use32bitIndices ? 4 : 2;
			var intType = use32bitIndices ? "i32" : "i16";
			var indexBuffer = Ammo.allocate( intByteSize * indices.length, intType, Ammo.ALLOC_NORMAL );
			for ( var i = 0, il = indices.length; i < il; i ++ ) {
				Ammo.setValue(indexBuffer + i * intByteSize, indices[ i ], intType);
			}

			var indexStride = intByteSize * 3;
			var vertexStride = floatByteSize * 3;

			mesh.set_m_numTriangles( numTriangles );
			mesh.set_m_triangleIndexBase( indexBuffer );
			mesh.set_m_triangleIndexStride( indexStride );

			mesh.set_m_numVertices( numVertices );
			mesh.set_m_vertexBase( vertexBuffer );
			mesh.set_m_vertexStride( vertexStride );

			triangleMesh.addIndexedMesh( mesh, indexType );

			var useQuantizedAabbCompression = true;
			var buildBvh = true;

			var shape = new Ammo.btBvhTriangleMeshShape( triangleMesh, useQuantizedAabbCompression, buildBvh );
			return shape;
		}


		function addPhysicalWorldMesh(meshData, pos, scale) {
			// NOTE:  Assuming uniform scale, using the x value .
			var groundShape = createTriangleMeshShape(meshData, scale.x);
			var groundTransform = new Ammo.btTransform();
			groundTransform.setIdentity();
			groundTransform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
			var groundMass = 0; // Mass of 0 means ground won't move from gravity or collisions
			var localInertia = new Ammo.btVector3(0, 0, 0);
			var motionState = new Ammo.btDefaultMotionState( groundTransform );
			var rbInfo = new Ammo.btRigidBodyConstructionInfo(groundMass, motionState, groundShape, localInertia);
			var rigidBody = new Ammo.btRigidBody( rbInfo );
			ammoWorld.addRigidBody(rigidBody);
		}

		function initPhysics() {
			// Temp worker vars.
			physTransform = new Ammo.btTransform();
			quaternion = new Quaternion();
			btVec = new Ammo.btVector3();

			var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
			var dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration );
			var overlappingPairCache = new Ammo.btDbvtBroadphase();
			var solver = new Ammo.btSequentialImpulseConstraintSolver();
			ammoWorld = new Ammo.btDiscreteDynamicsWorld( dispatcher, overlappingPairCache, solver, collisionConfiguration );
			ammoWorld.setGravity(new Ammo.btVector3(0, -9.81, 0));
		}

		function createAmmoComponentScript(rigidBody) {
			var script = new ScriptComponent();
			script.run = function(entity, tpf, environment) {
				var transformComp = entity.getComponent("transformComponent");
				rigidBody.getMotionState().getWorldTransform(physTransform);
				// entity.ammoComponent.getMotionState().getWorldTransform(physTransform);
				var origin = physTransform.getOrigin();
				transformComp.setTranslation(origin.x(), origin.y(), origin.z());
				var pquat = physTransform.getRotation();
				quaternion.setd(pquat.x(), pquat.y(), pquat.z(), pquat.w());
				transformComp.transform.rotation.copyQuaternion(quaternion);
			};
			return script
		}

		function createAmmoJSSphere(radius, pos, mass) {

			var startTransform = new Ammo.btTransform();
			startTransform.setIdentity();

			startTransform.getOrigin().setX(pos.x);
			startTransform.getOrigin().setY(pos.y);
			startTransform.getOrigin().setZ(pos.z);

			var localInertia = new Ammo.btVector3(0, 0, 0);

			var shape = new Ammo.btSphereShape(radius);
			shape.calculateLocalInertia( mass, localInertia );
			var motionState = new Ammo.btDefaultMotionState( startTransform );
			var rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, shape, localInertia );
			var rBody = new Ammo.btRigidBody( rbInfo );

			return rBody;
		}

		function attachSphericalMovementScript(translateParent, visualEntity) {
			var attachToSphereScript = new ScriptComponent();
			translateParent.visualEntity = visualEntity;
			attachToSphereScript.run = function(entity, tpf) {
				var visualTransform = entity.getComponent("transformComponent");
				var physTransform = entity.sphereEntity.getComponent("transformComponent");

				var v = entity.sphereEntity.ammoComponent.getLinearVelocity();
				btVec.setValue(v.getX(), 0, v.getZ());
				var vel = btVec.length();

				calcVec.set(physTransform.transform.translation);
				calcVec.sub(visualTransform.transform.translation);
				calcVec.y=0;
				var speed = Math.sqrt(calcVec.lengthSquared());
				if (speed > 0.01) {
					calcVec.data[1] = 0.0;
					visualTransform.transform.rotation.lookAt(calcVec, Vector3.UNIT_Y);
					translateParent.visualEntity.animationComponent.setTimeScale(vel);
				}

				visualTransform.transform.translation.set(physTransform.transform.translation);
				visualTransform.setUpdated();
			};
			translateParent.setComponent(attachToSphereScript);
			return translateParent;
		}

		function removeAmmoComponent(component) {
			ammoWorld.removeRigidBody(component);
			destroy(component);
		}

		function addRigidBody(rigidBody) {
			ammoWorld.addRigidBody(rigidBody);
		}

		function startPhysicsLoop() {
			// TODO:  Try updating in a Worker()
			setInterval(function(){ammoWorld.stepSimulation(1/60, 5)}, 1000/60);
		}

		function addStaticBox(pos, width, height, depth, world){

			console.log("world ");
			console.log(world);

			var groundShape = new Ammo.btBoxShape(new Ammo.btVector3(width / 2, height / 2 , depth / 2));
			var groundTransform = new Ammo.btTransform();
			groundTransform.setIdentity();
			groundTransform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));

			var groundMass = 0; // Mass of 0 means ground won't move from gravity or collisions
			var localInertia = new Ammo.btVector3(0, 0, 0);
			var motionState = new Ammo.btDefaultMotionState( groundTransform );
			var rbInfo = new Ammo.btRigidBodyConstructionInfo(groundMass, motionState, groundShape, localInertia);
			var groundAmmo = new Ammo.btRigidBody( rbInfo );
			ammoWorld.addRigidBody(groundAmmo);

			AmmoDebugShapeCreator.createBox(null, width, height, depth, world, pos);
		}

		return {
			initPhysics:initPhysics,
			addPhysicalWorldMesh:addPhysicalWorldMesh,
			createAmmoJSSphere:createAmmoJSSphere,
			createAmmoComponentScript:createAmmoComponentScript,
			attachSphericalMovementScript:attachSphericalMovementScript,
			removeAmmoComponent:removeAmmoComponent,
			addRigidBody:addRigidBody,
			startPhysicsLoop:startPhysicsLoop,
			addStaticBox:addStaticBox
		}
	});
