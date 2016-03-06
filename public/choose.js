$(function(){

var params = {};
URI(window.location.href).query().split("&").forEach(function(pair){
  var keyVal = pair.split("=");
  params[keyVal[0]] = decodeURIComponent(keyVal[1]);
});

document.getElementById('face-copy').innerHTML = "Click on @"+params.username;


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
      var nav = "/show.html?data=" + JSON.stringify(data);
      window.location.href = nav;
    }
})
.fail(function(jqXHR, textStatus, errorThrown) {
    console.log("HTTP Request Failed");
})
.always(function() {
    /* ... */
});

var activeNavBar = "";
var rects = [];

function recurse(arr, index){
  if(index >= arr.images.length){
    var nav = "/show.html?data=" + JSON.stringify(arr);
    window.location.href = nav;
  }
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
      var container = document.getElementById('image-rects-container');
      if(data.length > 0){
        var img = document.createElement("img");

        $("#image-rects-container").empty();

        img.id = "profile_picture";
        img.src = arr.images[index].url;
        img.classList.add("profile-picture");
        container.appendChild(img);

        window.setTimeout(function() {

            data.forEach(function(face, index){
                var rect = document.createElement("div");
                rect.id = "rect" + index;
                rect.style.position = "absolute";
                rect.style.top = face.faceRectangle.top + document.getElementById("sticky_header").offsetHeight - 26;
                rect.style.left = face.faceRectangle.left + (window.innerWidth / 4) - 26;
                rect.style.width = face.faceRectangle.width + "px";
                rect.style.height = face.faceRectangle.height + "px";
                rect.style.borderStyle = "solid";
                rect.style.borderWidth = "5px";
                rect.onclick = function(){
                    var rectObj = {
                        top: face.faceRectangle.top,
                        left: face.faceRectangle.left,
                        width: face.faceRectangle.width,
                        height: face.faceRectangle.height
                    }
                    activeNavBar = "/show.html?url=" + arr.images[index].url + "&rec=" + JSON.stringify(rectObj) + "&data=" + JSON.stringify(arr);

                    rects.forEach(function(r) {
                        console.log(r);
                        r.style.borderColor = "black";
                    });

                    rect.style.borderColor = "red";
                }
                rects.push(rect);

                document.getElementById('image-rects-container').appendChild(rect);
            });

            $("#thatsnotrightbutton").click(function() {
                console.log("WE'VE GOT A PROBLEM OFFICER");
                recurse(arr, index+1);
            });

            $("#continuebutton").click(function() {
                console.log("continuing, master.");
                if(activeNavBar == "") return;
                window.location.href = activeNavBar;
            })

        }, 100);

      }else{
        recurse(arr, index+1);
      }

      $(".se-pre-con").fadeOut("slow");
  })
  .fail(function(jqXHR, textStatus, errorThrown) {
      console.log("HTTP Request Failed");
  })
  .always(function() {
      /* ... */
  });
}
})
