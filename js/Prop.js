define([
'goo/math/Vector3',
'goo/entities/components/TransformComponent',
'goo/entities/components/ScriptComponent',

'goo'
],
function (
Vector3,
TransformComponent,
ScriptComponent
) {

	function Prop(entity, properties, goo) {
		console.log("Creating Prop");
		this.name = "Prop";
		this.goo = goo;
		this.entity = entity;
	};

	Prop.prototype.initPosition = function(position, scale, roll, pitch, yaw) {

		console.log('Initializing ' + this.name + ' position');

		this.scriptComponent = new ScriptComponent();
		this.entity.setComponent(this.scriptComponent);
		this.entity.transformComponent.setScale(scale, scale, scale);
		this.entity.transformComponent.addTranslation(position.x, position.y, position.z);
		this.entity.transformComponent.setRotation(roll, pitch, yaw);
		this.entity.transformComponent.setUpdated();
		this.roll = roll;
		this.pitch = pitch;
		this.yaw = yaw;
		this.entity.addToWorld();

	};

	Prop.prototype.addScript = function(script) {
		console.log("Adding script to " + this.name);
		this.scriptComponent.scripts.push(script);
	};

	return Prop;

});
