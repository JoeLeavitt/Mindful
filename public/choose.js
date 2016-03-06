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
var faces = [];

function recurse(arr, index){
  if(index >= arr.images.length){
    var nav = "/show.html?data=" + JSON.stringify(arr);
    window.location.href = nav;
  }

    $("#image-rects-container").empty();
    rects = [];
    faces = [];

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

                positionRect(rect, face);

                rect.onclick = function(){
                    var rectObj = {
                        top: rect.style.top,
                        left: rect.style.left,
                        width: rect.style.width,
                        height: rect.style.height
                    }
                    activeNavBar = "/show.html?url=" + arr.images[index].url + "&rec=" + JSON.stringify(rectObj) + "&data=" + JSON.stringify(arr);

                    rects.forEach(function(r) {
                        console.log(r);
                        r.style.borderColor = "black";
                    });

                    rect.style.borderColor = "red";
                }
                rects.push(rect);
                faces.push(face);

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

    function positionRect(rect, face) {
        console.log(window.innerWidth, $("#profile_picture").position().left);
        rect.id = "rect" + index;
        rect.style.position = "absolute";
        rect.style.top = face.faceRectangle.top + document.getElementById("sticky_header").offsetHeight - 26;
        rect.style.left = face.faceRectangle.left + $("#profile_picture").position().left + 26;
        rect.style.width = face.faceRectangle.width + "px";
        rect.style.height = face.faceRectangle.height + "px";
        rect.style.borderStyle = "solid";
        rect.style.borderWidth = "5px";
    }

    $(window).resize(function() {
       for(var i = 0; i < rects.length; i++) {
           positionRect(rects[i], faces[i]);
       }
    });

}
})
