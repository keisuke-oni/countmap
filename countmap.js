function loadingView(flag) {
	$('#loading-view').remove();
	if(!flag) return;
		$('<div id="loading-view" />').appendTo('body');
}

var data = "";
var postArrHash = new Object();

var postPop = new Object(); //人数
var postLat = new Object(); //緯度
var postLng = new Object(); //経度

var map;

function initLocationMap(){
	var latlng = new google.maps.LatLng(34.69619, 133.926391);
	var options = {
		zoom: 12,
		center: latlng,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}
	map = new google.maps.Map(document.getElementById('map'), options);
	var marker = new google.maps.Marker({
		position: latlng,
		map: map
	});
}

function analData() {
//			alert("解析を開始しました");
//			loadingView(true);
	var file = document.getElementById("filePicker").files[0];
	var reader = new FileReader();
	reader.onload = function (event) {
		var str = event.target.result;
		str = str.replace(/\r\n/g, "\n");
		str = str.replace(/^(\n+)|(\n+)$/g, "");
		postArr = str.split(/\n/g);
		for(var i = 0; i < postArr.length; i++){
			if (postArrHash[postArr[i]]){
				postArrHash[postArr[i]] += 1;
			}else{
				postArrHash[String(postArr[i])] = parseInt(1);
			}
		}
		//次の処理はこここに書く
		loadingView(true);
		createDataPre();
	}
	reader.readAsText(file, "utf-8");
}

var judge = 0;
var judge2 = 0;
var count = 0;

function createDataPre(){
	for (var key in postArrHash){
		count++;
	}
	setTimeout(function(){
		for (var key in postArrHash) {
			createData(key);
//					console.log(count);
		}
	}, 1500);
}

function createData(postNum) {
//			console.log("Running!!");
	var geocoder = new google.maps.Geocoder();
	geocoder.geocode({
		'address': postNum
	}, function(result, status) {
		if (status == google.maps.GeocoderStatus.OK){
			data += postNum + "," + postArrHash[postNum] + "," + result[0].geometry.location.lat() + "," + result[0].geometry.location.lng() + "\n";
			judge += 1;
//					console.log(judge);
			document.getElementById('loading-view').innerHTML = count + "件中" + (judge + judge2) + "件処理しました。";
		if(judge + judge2 === count){
				loadingView(false);
				alert("解析終了！");
				createObject();
		}
		}else{
			if (status == "OVER_QUERY_LIMIT"){
				setTimeout(function(){
					createData(postNum);
				}, 100);
			}else{
				console.log(status + " " + postNum);
				judge2 += 1;
				console.log(judge2);
			}
		}
	});
}

function saveData() {
	var blob = new Blob([data], {type: "text/csv"});
	
	if(window.navigator.msSaveBlob){
		window.navigator.msSaveBlob(blob, "save_data.csv");
	}else{
		var a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.target = '_blank';
		a.download = 'save_data.csv';
		a.click();
	}
}

function openData() {
	var file = document.getElementById("filePicker").files[0];
	var reader = new FileReader();
	reader.onload = function (event) {
		data = event.target.result;
	createObject();
	}
	reader.readAsText(file, "utf-8");
}

function createObject() {
	console.log("createObjectRunning");
	data = data.replace(/\r\n/g, "\n");
	data = data.replace(/^(\n+)|(\n+)$/g, "");
	infoArr = data.split(/\n/g);
//			console.log(infoArr);
	
	for (var i = 0; i < infoArr.length; i++){
		infoArr2 = infoArr[i].split(/,/g);
		postPop[infoArr2[0]] = infoArr2[1];
		postLat[infoArr2[0]] = infoArr2[2];
		postLng[infoArr2[0]] = infoArr2[3];	
//				console.log(infoArr2);
		markCircle(infoArr2[0]);
	}
}

function markCircle(postNum){
	var clatlng = new google.maps.LatLng(postLat[postNum], postLng[postNum]);
	var popCircle = new google.maps.Circle({
		strokeColor: "#FF0000",
		strokeOpacity: 0.8,
		strokeWeight: 2,
		fillColor: "#FF0000",
		fillOpacity: 0.35,
		map: map,
		center: clatlng,
		radius: postPop[postNum] * 30
	});
	var infoWindow = new google.maps.InfoWindow();
	google.maps.event.addListener(popCircle, 'click', function(){
		infoWindow.setPosition(clatlng);
		infoWindow.setContent("〒" + postNum + "<br />来場者："+ postPop[postNum]+"人");
		infoWindow.open(map);
	});
}
