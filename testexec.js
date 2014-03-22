rpc.call("readFile", ["/python/.gitignore"]).then(function(result){
	console.log(result);
});