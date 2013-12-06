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

	"use strict";

	function Prop(entity) {
		console.log("Creating Prop");
		this.name = "Prop";
		this.entity = entity;
		this.scriptComponent = new ScriptComponent();
		this.entity.setComponent(this.scriptComponent);
	};

	Prop.prototype.translate = function(x, y, z) {
		this.entity.transformComponent.addTranslation(x, y, z);
		this.entity.transformComponent.setUpdated();
	};

	Prop.prototype.addScript = function(script) {
		console.log("Adding script to " + this.name);
		this.scriptComponent.scripts.push(script);
	};

	return Prop;

});
