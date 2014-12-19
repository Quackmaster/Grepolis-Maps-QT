// ==UserScript==
// @name        Grepolis Maps QT
// @namespace   Quack
// @description A screenshot tool for grepolismaps.org
// @include     http://*.grepolismaps.org/*
// @version     1.0
// @require		http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js
// @grant       none
// ==/UserScript==

var lID = window.location.href.substring(7, 9);
var wID = window.location.href.substring(7, 11);
var QT = {};

QT.Lang = {
	get : function (a, b) {
		if (QT.Lang[lID] != undefined && QT.Lang[lID][a] != undefined && QT.Lang[lID][a][b] != undefined) {
			return QT.Lang[lID][a][b]
		} else {
			return QT.Lang.en[a][b]
		}
	},
	de : {
		tools : {
			brush_size : 'Pinselstärke',
			color : 'Farbe',
			eraser : 'Radiergummi',
			pencil : 'Zeichenstift',
			arrow : 'Pfeil',
			rectangel : 'Rechteck',
			line : 'Linie',
			arc : 'Kreis',
			delete_drawing : 'Zeichnung löschen',
			fill : 'Füllen'
	},
		colors : {
			black : "schwarz",
			blue : "blau",
			red : "rot",
			green : "grün",
			yellow : "gelb",
			gray : "grau"
		}
	},
	en : {
		tools : {
			brush_size : 'Brush Size',
			color : 'Color',
			eraser : 'Eraser',
			pencil : 'Pencil',
			arrow : 'Arrow',
			rectangel : 'Rectangel',
			line : 'Line',
			arc : 'Arc',
			delete_drawing : 'Delete drawing',
			fill : 'Fill'
		},
		colors : {
			black : "black",
			blue : "blue",
			red : "red",
			green : "green",
			yellow : "yellow",
			gray : "gray"
		}
	}
};

QT.Helper = {
	regexNum : function () {
		var regexNum = /\d/g;
		if (!regexNum.test(wID)) {
			return;
		}
	},
	grepo_dropdown : function (ID, Options) {
		var str = '<span class="grepo_input"><span class="left"><span class="right"><select name="' + ID + '" id="' + ID + '" type="text">';
		$.each(Options, function (a, b) {
			if (b[1]) {
				str += '<option value="' + b[0] + '">' + b[1] + '</option>'
			} else {
				str += '<option value="' + b + '">' + b + '</option>'
			}
		});
		str += '</select></span></span></span>';
		return str;
	}
};

QT.Maps = {
	createToolbar : function () {
		$(".table").before('\
			<div id="#qt_canvas_toolbar" style="position: absolute; left:502px; top:70px">\
				<a id="eraser" class="qt_canvas_tool" href="#"></a>\
				<a id="pencil" class="qt_canvas_tool active" href="#"></a>\
				<a id="arrow" class="qt_canvas_tool" href="#"></a>\
				<a id="line" class="qt_canvas_tool" href="#"></a>\
				<a id="rectangel" class="qt_canvas_tool" href="#"></a>\
				<a id="arc" class="qt_canvas_tool" href="#"></a>\
				<div id="fill" class="checkbox_new">'+QT.Lang.get("tools", "fill")+'<div class="cbx_icon"></div></div>\
				<div class="qt_canvas_tools_select">'+QT.Lang.get("tools", "brush_size")+'\
					'+QT.Helper.grepo_dropdown("selWidth", [1,3,5,7,9,11,13,15])+'\
				</div>\
				<div class="qt_canvas_tools_select">'+QT.Lang.get("tools", "color")+'\
					'+QT.Helper.grepo_dropdown("selColor", [["black",""+QT.Lang.get("colors", "black")+""],["blue",""+QT.Lang.get("colors", "blue")+""],["red",""+QT.Lang.get("colors", "red")+""],["green",""+QT.Lang.get("colors", "green")+""],["yellow",""+QT.Lang.get("colors", "yellow")+""],["gray",""+QT.Lang.get("colors", "gray")+""]])+'\
				</div>\
				<a id="clearArea" class="qt_canvas_tool" href="#"></a>\
				<a id="upload" class="qt_canvas_tool" href="#"></a>\
			</div>\
		');
		
		$("#map").after('\
			<canvas id="myCanvas" width="1000" height="1000" style="position:absolute;left:0px;top:0px"></canvas>\
			<canvas id="canvasTemp" width="1000" height="1000" style="position:absolute;left:0px;top:0px"></canvas>\
			<div id="ajax_export" style="left:0px; top:0px; display:none; background:url(http://gpde.innogamescdn.com/images/game/ajax-loader_2.76.gif) no-repeat scroll center center rgba(0, 0, 0, 0.5); position:absolute; width:100%; height:100%; z-index:1000"></div>\
		');
		
		$(".qt_canvas_tool").css({"width":"22px", "height":"23px", "display":"inline-block","background-position":"0px 0px"});
		$("#eraser").css({"background":"url(http://fs1.directupload.net/images/141218/5u8ojvzq.png)"});
		$("#pencil").css({"background":"url(http://fs1.directupload.net/images/141213/9rjcrqfy.png)", "background-position":"0px -23px"});
		$("#arrow").css({"background":"url(http://fs1.directupload.net/images/141214/tapgcj8q.png)"});
		$("#rectangel").css({"background":"url(http://fs1.directupload.net/images/141213/xi25lbk7.png)"});
		$("#line").css({"background":"url(http://fs1.directupload.net/images/141213/8pyhdwes.png)"});
		$("#arc").css({"background":"url(http://fs1.directupload.net/images/141213/eufhyzin.png)"});
		$("#clearArea").css({"background":"url(http://fs2.directupload.net/images/141219/5agwrzkr.png)"});
		$("#upload").css({"background":"url(http://s14.directupload.net/images/141014/3j8vsimv.png)"});
		$(".checkbox_new").css({"cursor":"pointer", "display":"inline-block", "line-height":"16px", "overflow":"hidden", "padding":"0px", "position":"relative", "text-align":"left", "vertical-align":"middle", "margin-bottom":"14px"});
		$(".cbx_icon").css({"background":"url(http://fs1.directupload.net/images/141219/amylfy94.png) no-repeat scroll -14px 0px rgba(0, 0, 0, 0)","float":"right", "height":"15px", "position":"relative", "width":"14px", "margin-left":"5px"});
		$(".qt_canvas_tools_select").css({"bottom":"6px", "position":"relative", "display":"inline-block"});
		$("span.grepo_input").css({"height":"23px", "overflow":"hidden"});
		$("span.grepo_input span").css({"background":"url(http://gpde.innogamescdn.com/images/game/layout/input_bg_2.33.png) no-repeat scroll 0 0 rgba(0, 0, 0, 0)", "display":"inline-block"});
		$("span.grepo_input span.left").css({"background-position":"left 0"});
		$("span.grepo_input span.right").css({"background-position":"right -23px"});
		$("span.grepo_input select").css({"background":"url(http://gpde.innogamescdn.com/images/game/layout/input_bg_2.33.png) repeat-x scroll 0 -46px rgba(0, 0, 0, 0)", "border":"0 none", "height":"22px", "margin":"0 3px", "padding":"3px 0"});
		$("span.grepo_input option").css({"background":"none repeat scroll 0 0 #fff0cb"});

		$("#selWidth").val("5");
		$("#selColor").val("red");
		
		$(".qt_canvas_tool").hover(
			function () {
			$(this).not(".active").css({
				"background-position" : "0px -23px"
			});
		},
			function () {
			$(this).not(".active").css({
				"background-position" : "0px 0px"
			});
		});

		$(".qt_canvas_tool:not(#clearArea,#upload)").click(function () {
			$(".qt_canvas_tool").removeClass("active").css({
				"background-position" : "0px 0px"
			});
			$(this).addClass("active").css({
				"background-position" : "0px -23px"
			});
		});

		$("#fill").click(function () {
			if ($(".cbx_icon").hasClass("checked")) {
				$(".cbx_icon").removeClass("checked").css({
					"background-position" : "-14px 0px"
				});
			} else {
				$(".cbx_icon").addClass("checked").css({
					"background-position" : "0px 0px"
				});
			}
		});
	
		QT.Maps.init();
	},
	init : function () {
		var lastX, lastY, startX, startY, canvasEl, canvasTemp, ctx, ctxTemp, tool;
		var mousePressed = false;
		var fill = false;
		var map = document.getElementById('map');
		var tools = {};

		tools.arc = function (x, y) {
			ctxTemp.beginPath();
			ctxTemp.clearRect(0, 0, ctxTemp.canvas.width, ctxTemp.canvas.height);
			ctxTemp.arc(x, y, Math.abs(x-startX), 0, Math.PI*2, true);
			ctxTemp.closePath();
			ctxTemp.stroke();
			if (fill) {
				ctxTemp.fill();
			}
		};
		tools.arrow = function (x, y) {
			ctxTemp.clearRect(0, 0, ctxTemp.canvas.width, ctxTemp.canvas.height);
			ctxTemp.beginPath();
			ctxTemp.moveTo(startX, startY);
			ctxTemp.lineTo(x,y);
			ctxTemp.stroke();
			
			var endRadians=Math.atan((y-startY)/(x-startX));
			endRadians+=((x>=startX)?90:-90)*Math.PI/180;
			
			ctxTemp.save();
			ctxTemp.translate(x,y);
			ctxTemp.rotate(endRadians);
			ctxTemp.moveTo(0,-1.9*ctxTemp.lineWidth);
			ctxTemp.lineTo(2.5*ctxTemp.lineWidth,3.2*ctxTemp.lineWidth);
			ctxTemp.lineTo(-2.5*ctxTemp.lineWidth,3.2*ctxTemp.lineWidth);
			ctxTemp.closePath();
			ctxTemp.restore();
			ctxTemp.fill();
		};
		tools.eraser = function (x, y) {
			ctx.beginPath();
			ctx.lineJoin = "round";
			ctx.globalCompositeOperation = "destination-out";
			ctx.strokeStyle = 'rgba(0,0,0,1.0)';
			ctx.moveTo(lastX, lastY);
			ctx.lineTo(x, y);
			ctx.closePath();
			ctx.stroke();
		};
		tools.line = function (x, y) {
			ctxTemp.clearRect(0, 0, ctxTemp.canvas.width, ctxTemp.canvas.height);
			ctxTemp.beginPath();
			ctxTemp.moveTo(startX, startY);
			ctxTemp.lineTo(x,y);
			ctxTemp.stroke();
			ctxTemp.closePath();
		};
		tools.pencil = function (x, y) {
			ctxTemp.beginPath();
			ctxTemp.lineJoin = "round";
			ctxTemp.moveTo(lastX, lastY);
			ctxTemp.lineTo(x, y);
			ctxTemp.closePath();
			ctxTemp.stroke();
		};
		tools.rectangel = function (x, y) {
			ctxTemp.beginPath();
			ctxTemp.clearRect(0, 0, ctxTemp.canvas.width, ctxTemp.canvas.height);
			ctxTemp.rect(startX, startY, x-startX, y-startY);
			ctxTemp.closePath();
			ctxTemp.stroke();
			if (fill) {
				ctxTemp.fill();
			}
		};

		function Draw(x, y, tool, isDown) {
			if (isDown) {
				tools[tool](x, y);
			}
			lastX = x;
			lastY = y;
		}

		function img_update () {
			ctx.drawImage(canvasTemp, 0, 0);
			ctxTemp.clearRect(0, 0, canvasTemp.width, canvasTemp.height);
		}

		function clearArea() {
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
			ctx.drawImage(map, 0, 0);
		}

		canvasEl = document.getElementById('myCanvas');
		ctx = canvasEl.getContext("2d");
		canvasTemp = document.getElementById('canvasTemp');
		ctxTemp = canvasTemp.getContext("2d");

		$('#canvasTemp').mousedown(function (e) {
			mousePressed = true;
			if ($(".cbx_icon").hasClass("checked")) {
				fill = true;
			} else {
				fill = false;
			}
			ctxTemp.lineWidth = $('#selWidth').val();
			ctxTemp.strokeStyle = $('#selColor').val();
			ctxTemp.fillStyle = $('#selColor').val();
			ctx.lineWidth = $('#selWidth').val();
			ctx.globalCompositeOperation = "source-over";
			startX = e.pageX - $(this).offset().left;
			startY = e.pageY - $(this).offset().top;
			tool = $('.qt_canvas_tool.active').prop('id');
			Draw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, tool, false);
		});

		$('#canvasTemp').mousemove(function (e) {
			if (mousePressed) {
				Draw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, tool, true);
			}
		});

		$('#canvasTemp').mouseup(function (e) {
			mousePressed = false;
			img_update();
		});

		$('#canvasTemp').mouseleave(function (e) {
			mousePressed = false;
			img_update();
		});

		$('#clearArea').click(function () {
			clearArea();
		});

		$('#upload').click(function () {

			var uploadCanvas = document.createElement("canvas");
				uploadCanvas.id     = "uploadCanvas";
				uploadCanvas.width  = 1000;
				uploadCanvas.height = 1000;
			var upC_ctx = uploadCanvas.getContext("2d");
			upC_ctx.drawImage(map, 0, 0);
			upC_ctx.drawImage(canvasEl, 0, 0);
			
			$("#ajax_export").show();
			$.ajax({
				url: 'https://api.imgur.com/3/upload.json',
				type: 'POST',
				headers: {
					Authorization: 'Client-ID ed9c3c98c1f5bba'
				},
				data: {
					type: 'base64',
					name: 'quack_toolsammlung.jpg',
					title: 'Grepolis - Quack Toolsammlung',
					description: 'Powered by http://www.grepolisqt.de',
					image: uploadCanvas.toDataURL().split(',')[1]
				},
				dataType: 'json'
			}).done(function (data) {
				console.log(data);
				$("#ajax_export").hide();
				var image_url;
				if (lID == "de") {
					image_url = 'http://grepolisqt.de/de/image-de/' + data.data.id;
				} else {
					image_url = 'http://grepolisqt.de/en/image-en/';
				}

				if(/chrom(e|ium)/.test(navigator.userAgent.toLowerCase())){
					window.open(image_url, '_blank', 'width=1000,height=600');
				} else {
					window.open(image_url, '_blank');
				}
			}).fail(function() {
				$("#ajax_export").hide();
			});

		});
	}
};

$( document ).ready(function() {
	QT.Maps.createToolbar();
});

