define([
'goo/math/Vector3',
'goo/entities/components/TransformComponent',
'goo/entities/components/ScriptComponent',
'goo/particles/ParticleUtils',
'goo/util/ParticleSystemUtils',
'goo/renderer/Material',
'goo/renderer/shaders/ShaderLib',
'goo/renderer/Texture',
'goo/renderer/TextureCreator',
'js/Prop',
'js/physics/PhysicalWorld',

'js/AmmoDebugShapeCreator'
],
function (
Vector3,
TransformComponent,
ScriptComponent,
ParticleUtils,
ParticleSystemUtils,
Material,
ShaderLib,
Texture,
TextureCreator,
Prop,
PhysicalWorld,

AmmoDebugShapeCreator
) {

	function Lander(entity, thrusterEntities, thrusterLightEntities, goo) {
		console.log("Creating Lander");
		Prop.call(this, entity, goo);
		this.name = "Lander";
		this.thrusterEntities = thrusterEntities;
		this.thrusterLightEntities = thrusterLightEntities;
		for (var each in this.thrusterLightEntities) {
			this.thrusterLightEntities[each].lightComponent.light.intensity = 0.0;
		}
		console.log("Thruster entities");
		console.log(this.thrusterEntities);
		console.log("Thruster light entities");
		console.log(this.thrusterLightEntities);
		// For thruster particles
		this.thrusterParticleMaterial = Material.createMaterial(ShaderLib.particles);
		this.thrusterParticleTexture = new TextureCreator().loadTexture2D('res\\flare.png');
		this.thrusterParticleTexture.generateMipmaps = true;
		this.thrusterParticleMaterial.setTexture('DIFFUSE_MAP', this.thrusterParticleTexture);
		this.thrusterParticleMaterial.blendState.blending = 'AdditiveBlending';
		this.thrusterParticleMaterial.cullState.enabled = false;
		this.thrusterParticleMaterial.depthState.write = false;
		this.thrusterParticleMaterial.renderQueue = 2001;

		this.mainForce = new Ammo.btVector3(0, 10, 0);
	};

	Lander.prototype = Object.create(Prop.prototype);

	Lander.prototype.initPhysics = function() {
		console.log('Initializing Lander physics');
		this.rigidBody = this.buildRigidBody();
	};

	Lander.prototype.buildRigidBody = function() {
		var radius = 3;
		var mass = 10;
		// var position = this.entity.transformComponent.worldTransform.translation;
		var position = new Vector3(15, 20, -10);
		var rigidBody = PhysicalWorld.createAmmoJSSphere(radius, position, mass);
		PhysicalWorld.addRigidBody(rigidBody);
		this.addScript(PhysicalWorld.createAmmoComponentScript(rigidBody));
		//var debugEntity = AmmoDebugShapeCreator.createSphere(this.entity, rigidBody, radius);
		//debugEntity.setComponent(PhysicalWorld.createAmmoComponentScript(rigidBody));
		return rigidBody;
	};

	Lander.prototype.addRoll = function(angle) {
		this.roll += angle;
	};

	Lander.prototype.addPitch = function(angle) {
		this.pitch += angle;
	};

	Lander.prototype.addYaw = function(angle) {
		this.yaw += angle;
	};

	// Set rotation according to roll, pitch and yaw params
	Lander.prototype.updateRotation = function() {
		console.log('Updating Lander rotation');
		this.entity.transformComponent.setRotation(this.roll, this.pitch, this.yaw);
		this.entity.transformComponent.setUpdated();
	};

	// Add particle system to a thruster
	Lander.prototype.addParticles = function(thruster) {
		console.log('Adding particles to thruster ' + thruster);
		// A fire-looking particle system
		var particleSystemEntity = ParticleSystemUtils.createParticleSystemEntity(
			this.goo,
		    {
		    	totalParticlesToSpawn : 1,
				releaseRatePerSecond : 5,
				minLifetime : 0.5,
				maxLifetime : 1.5,
				getEmissionVelocity : function (particle, particleEntity) {
					var vec3 = particle.velocity;
					ParticleUtils.getRandomVelocityOffY(vec3, 0, Math.PI * 5 / 180, 5);
					vec3.y *= -1;
					return vec3;
				},
				timeline : [{
					timeOffset : 0.0,
					spin : 0,
					mass : 20,
					size : 4.0,
					color : [1, 1, 0, 1]
				}, {
					timeOffset : 0.25,
					color : [1, 1, 1, 1]
				}, {
					timeOffset : 0.25,
					color : [0, 0, 0, 1]
				}, {
					timeOffset : 0.5,
					size : 3.0,
					color : [0, 0, 0, 0]
				}]
			}
		,this.thrusterParticleMaterial);

		this.thrusterEntities[thruster].transformComponent.attachChild(particleSystemEntity.transformComponent);
		particleSystemEntity.addToWorld();
	};

	Lander.prototype.turnOnThruster = function(thruster) {
		console.log('Firing thruster ' + thruster);
		this.addParticles(thruster);
		this.thrusterLightEntities[thruster].lightComponent.light.intensity = Math.random()*0.5 + 2;

		this.rigidBody.applyCentralImpulse(this.mainForce);
	};

	Lander.prototype.turnOffThruster = function(thruster) {
		this.thrusterLightEntities[thruster].lightComponent.light.intensity = 0;
	};


	return Lander;

});
