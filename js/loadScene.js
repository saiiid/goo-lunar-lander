require([
	'goo/entities/GooRunner',
	'goo/statemachine/FSMSystem',
	'goo/addons/howler/systems/HowlerSystem',
	'goo/loaders/DynamicLoader',
	'goo/math/Vector3',

	'goo/entities/EntityUtils',

	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',

	'goo/entities/components/ScriptComponent',
	'goo/scripts/OrbitCamControlScript',

	'goo/renderer/light/DirectionalLight',
	'goo/entities/components/LightComponent',

	'js/Prop',
	'js/Lander',
	'js/LanderKeyScript',
	'js/SpotLight',

	'js/physics/PhysicalWorld'

], function (
	GooRunner,
	FSMSystem,
	HowlerSystem,
	DynamicLoader,
	Vector3,

	EntityUtils,

	Camera,
	CameraComponent,

	ScriptComponent,
	OrbitCamControlScript,

	DirectionalLight,
	LightComponent,

	Prop,
	Lander,
	LanderKeyScript,
	SpotLight,

	PhysicalWorld
) {
	'use strict';

	function init() {

		// If you try to load a scene without a server, you're gonna have a bad time
		if (window.location.protocol==='file:') {
			alert('You need to run this webpage on a server. Check the code for links and details.');
			return;
		}

		// Make sure user is running Chrome/Firefox and that a WebGL context works
		var isChrome, isFirefox, isIE, isOpera, isSafari, isCocoonJS;
	 	isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
	  	isFirefox = typeof InstallTrigger !== 'undefined';
	  	isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
	  	isChrome = !!window.chrome && !isOpera;
	  	isIE = false || document.documentMode;
	  	isCocoonJS = navigator.appName === "Ludei CocoonJS";
		if (!(isFirefox || isChrome || isSafari || isCocoonJS)) {
			alert("Sorry, but your browser is not supported.\nGoo works best in Google Chrome or Mozilla Firefox.\nYou will be redirected to a download page.");
			window.location.href = 'https://www.google.com/chrome';
		} else if (!window.WebGLRenderingContext) {
			alert("Sorry, but we could not find a WebGL rendering context.\nYou will be redirected to a troubleshooting page.");
			window.location.href = 'http://get.webgl.org/troubleshooting';
		} else {

			// Loading screen callback
			var progressCallback = function (handled, total) {
				var loadedPercent = (100*handled/total).toFixed();
				$('#loadingOverlay').show();
				$('#loadingOverlay .loadingMessage').show();
				$('#loadingOverlay .progressBar').show();
				$('#loadingOverlay .progressBar .progress').css('width', loadedPercent+'%');
			};

			// Create typical Goo application
			var goo = new GooRunner({
				antialias: true,
				manuallyStartGameLoop: true
			});
			var fsm = new FSMSystem(goo);
			goo.world.setSystem(fsm);
			goo.world.setSystem(new HowlerSystem());

			// Init physics
			PhysicalWorld.initPhysics();

			// The loader takes care of loading the data
			var loader = new DynamicLoader({
				world: goo.world,
				rootPath: 'res',
				progressCallback: progressCallback});

			loader.loadFromBundle('project.project', 'root.bundle', {recursive: false, preloadBinaries: true}).then(function(configs) {

				// Set up the canvas and renderer
				goo.renderer.domElement.id = 'goo';
				document.body.appendChild(goo.renderer.domElement);
			
				var landerEntity = loader.getCachedObjectForRef('ms_scene/entities/moonlander_mesh_0.entity');
				var lightEntity0 = loader.getCachedObjectForRef('ms_scene/entities/lights_mesh_0.entity');
				var lightEntity1 = loader.getCachedObjectForRef('ms_scene/entities/lights_mesh1_0.entity');
				var lightEntity2 = loader.getCachedObjectForRef('ms_scene/entities/lights_mesh2_0.entity');

				var groundEntities = [];
				var sandEntity = loader.getCachedObjectForRef('ms_scene/entities/sand_0.entity');
				groundEntities.push(sandEntity);
				buildPhysicsGround(groundEntities);

				var lander = new Lander(landerEntity);
				lander.translate(0, 1, 0);
				lander.initPhysics();

				var props = [];
				props.push(new SpotLight(lightEntity0));
				props.push(new SpotLight(lightEntity1));
				props.push(new SpotLight(lightEntity2));
				for (var each in props) {
					props[each].translate(0, 1, 0);
					props[each].initPhysics();
				}

				lander.addScript(new LanderKeyScript(lander, {
					nearLeftKey: 65, 	// A
					farLeftKey: 81,  	// Q
					nearRightKey: 68,	// D
					farRightKey: 69, 	// E
					fireRate: 10
				}));


				// Go go go!
				console.log('Starting game loop');
				PhysicalWorld.startPhysicsLoop();
				goo.startGameLoop();

			}).then(null, function(e) {
				// If something goes wrong, 'e' is the error message from the engine.
				alert('Failed to load scene: ' + e);
			});

		}
	}


	function buildPhysicsGround(groundEntities) {
		for (var i = 0; i < groundEntities.length; i++) {
			var entity = groundEntities[i];
			console.log("Building ground for " + entity);
			var meshData = entity.getComponent("meshDataComponent").meshData;
			var pos = entity.transformComponent.transform.translation;
			console.log("Ground transform: " + pos);
			//PhysicalWorld.addPhysicalWorldMesh(meshData, pos);
		}

		
		PhysicalWorld.addStaticBox(new Vector3(0, -1.9, 0), 300);
	};

	init();
});
