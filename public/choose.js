$(function(){

var params = {};
URI(window.location.href).query().split("&").forEach(function(pair){
  var keyVal = pair.split("=");
  params[keyVal[0]] = decodeURIComponent(keyVal[1]);
});

jQuery.ajax({
    url: "http://localhost:3000/go",
    type: "GET",
    data: {
        "un": params.username
    },
})
.done(function(data, textStatus, jqXHR) {
    console.log("HTTP Request Succeeded: " + jqXHR.status);
    console.log(data);
    if(data.images.length > 0){
      recurse(data, 0);
    }else{
      //redirect to results
    }
})
.fail(function(jqXHR, textStatus, errorThrown) {
    console.log("HTTP Request Failed");
})
.always(function() {
    /* ... */
});

function recurse(arr, index){
  if(index >= arr.images.length) return;
  jQuery.ajax({
    url: "http://localhost:3000/check",
    type: "GET",
    data: {
        "url": arr.images[index].url,
    },
  })
  .done(function(data, textStatus, jqXHR) {
      console.log("HTTP Request Succeeded: " + jqXHR.status);
      console.log(data);
      if(data.length > 0){
        var img = document.createElement("img");
        img.src = arr.images[index].url;
        document.getElementById('image-rects-container').appendChild(img);

        data.forEach(function(face, index){
          var rect = document.createElement("div");
          rect.id = "rect" + index;
          rect.style.position = "absolute";
          rect.style.top = face.faceRectangle.top;
          rect.style.left = face.faceRectangle.left;
          rect.style.width = face.faceRectangle.width + "px";
          rect.style.height = face.faceRectangle.height + "px";
          rect.style.borderStyle = "solid";
          rect.style.borderWidth = "5px";
          rect.onclick = function(){
            this.onclick = function(){};

            console.log(this.id);
            var rectObj = {
              top: rect.style.top,
              left: rect.style.left,
              width: rect.style.width,
              height: rect.style.height
            }

            var nav = "/show.html?url=" + arr.images[index].url + "&rec=" + JSON.stringify(rectObj) + "&data=" + JSON.stringify(arr);
            window.location.href = nav;

          }

          document.getElementById('image-rects-container').appendChild(rect);
          //postition:absolute; top:10; left:10; width:50px; height:50px; border-style: solid; border-width: 5px;
        });

        if(data.length == 1) {
            document.getElementById('header').innerHTML = "Is this @"+params.username+"?";
        }

      }else{
        recurse(arr, index+1);
      }
                $(".se-pre-con").fadeOut("slow");;

  })
  .fail(function(jqXHR, textStatus, errorThrown) {
      console.log("HTTP Request Failed");
  })
  .always(function() {
      /* ... */
  });
}
})
