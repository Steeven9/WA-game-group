// TODO: clientside app
class App {
	constructor(object) {
		this.canvas = document.getElementById(object.canvas);

		if (this.canvas.tagName !== 'CANVAS') {
			throw new Error("It should be a canvas");
		}

		this.ctx = this.canvas.getContext('2d');
		this.width = this.canvas.width;
		this.height = this.canvas.height;

		const canvasInterface = new CanvasInterface(this.canvas);
		this.composer = new Composer(canvasInterface);

		this.keys = {};

	}

	drawMap(data) {
		this.clearCanvas();
		console.log(data);
		data.players.forEach((elem) => {

		 	this.drawPlayer(elem.bodyparts, elem.position);
		});
	}

	drawPlayer(playerBody, position) {
		// TODO: cambio colore
		const color  = { core: "#35b27d", child: "#6ee6ad" };
		this.composer.build(playerBody, color, position);
	}

	clearCanvas() {
		const ctx = this.canvas.getContext('2d');
		const rect = this.canvas.getBoundingClientRect();
		ctx.clearRect(0, 0, rect.width, rect.height);
	}

	enableInput() {
		console.log("enabled");
		this.canvas.focus();
		this.canvas.addEventListener('keydown', this.onKeyDown.bind(this));
		this.canvas.addEventListener('keyup', this.onKeyUp.bind(this));
	}

	disableInput() {
		console.log("disabled");
		this.canvas.blur();
		this.canvas.removeEventListener('keydown', this.onKeyDown);
		this.canvas.removeEventListener('keyup', this.onKeyUp);
	}

	onKeyDown(e) {

		console.log("KEYDOWN", e);

		if (e.code === "KeyW") {
			this.keys[e.code] = true;
		}

		if (e.code === "KeyD") {
			this.keys[e.code] = true;
		}

		if (e.code === "KeyS") {
			this.keys[e.code] = true;
		}

		if (e.code === "KeyA") {
			this.keys[e.code] = true;
		}

		//WD DS SA AW
		if (this.keys["KeyW"] == true && this.keys["KeyD"] == true) {
			//console.log("W");
			socket.emit('move', 1);
		}

		if (this.keys["KeyD"] == true && this.keys["KeyS"] == true) {
			//console.log("A");
			socket.emit('move', 3);
		}

		if (this.keys["KeyS"] == true && this.keys["KeyA"] == true) {
			socket.emit('move', 5);
			//console.log("S");
		}

		if (this.keys["KeyA"] == true && this.keys["KeyW"] == true) {
			socket.emit('move',7);
			//console.log("D");
		}

		// W A S D
		if (this.keys["KeyW"] == true) {
			//console.log("W");
			socket.emit('move', 0);
		}

		if (this.keys["KeyD"] == true) {
			socket.emit('move',2);
			//console.log("D");
		}

		if (this.keys["KeyS"] == true) {
			socket.emit('move', 4);
			//console.log("S");
		}

		if (this.keys["KeyA"] == true) {
			//console.log("A");
			socket.emit('move', 6);
		}

	}


	onKeyUp(e) {
		console.log("KEYUP", e);
		if (e.code === "KeyW") {
			this.keys[e.code] = false;
		}

		if (e.code === "KeyD") {
			this.keys[e.code] = false;
		}

		if (e.code === "KeyS") {
			this.keys[e.code] = false;
		}

		if (e.code === "KeyA") {
			this.keys[e.code] = false;
		}
	}
}