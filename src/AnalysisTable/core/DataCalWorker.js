var worker=new Worker('worker.js');
worker.postMessage(40);
worker.onmessage=function(event){
    var data=event.data;
    console.log(data)
};
worker.onerror=function(event){
    console.log(event.fileName,event.lineo,event.message);
};