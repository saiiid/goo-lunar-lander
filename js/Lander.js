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

	function Lander(entity, thrusterEntities, goo) {
		console.log("Creating Lander");
		Prop.call(this, entity, goo);
		this.name = "Lander";
		this.thrusterEntities = thrusterEntities;
		console.log("Thruster entities");
		console.log(this.thrusterEntities);
		// For thruster particles
		this.thrusterParticleMaterial = Material.createMaterial(ShaderLib.particles);
		this.thrusterParticleTexture = new TextureCreator().loadTexture2D('res\\flare.png'); 
		this.thrusterParticleTexture.generateMipmaps = true;
		this.thrusterParticleMaterial.setTexture('DIFFUSE_MAP', this.thrusterParticleTexture);
		this.thrusterParticleMaterial.blendState.blending = 'AdditiveBlending';
		this.thrusterParticleMaterial.cullState.enabled = false;
		this.thrusterParticleMaterial.depthState.write = false;
		this.thrusterParticleMaterial.renderQueue = 2001;
	};

	Lander.prototype = Object.create(Prop.prototype);

	Lander.prototype.initPhysics = function() {
		console.log('Initializing Lander physics');
		this.rigidBody = this.buildRigidBody();
	};

	Lander.prototype.buildRigidBody = function() {
		var radius = 0.2;
		var mass = 10;
		var position = this.entity.transformComponent.transform.translation;
		//position = new Vector3(0,0,0);
		var rigidBody = PhysicalWorld.createAmmoJSSphere(radius, position, mass);
		PhysicalWorld.addRigidBody(rigidBody);
		this.addScript(PhysicalWorld.createAmmoComponentScript(rigidBody));

		AmmoDebugShapeCreator.createSphere(this.entity, radius);

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
		    	totalParticlesToSpawn : 3,
				releaseRatePerSecond : 10,
				minLifetime : 0.5,
				maxLifetime : 1.0,
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
					size : 3.0,
					color : [1, 1, 0, 1]
				}, {
					timeOffset : 0.25,
					color : [1, 0, 0, 1]
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

	// Fire numbered thruster
	Lander.prototype.fireThruster = function(thruster) {
		console.log('Firing thruster ' + thruster);
		this.addParticles(thruster);
	};

	return Lander;

});
