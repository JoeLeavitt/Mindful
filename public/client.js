//  (GET http://localhost:3000/go)

function search(name) {
    if(event.keyCode == 13) {
        jQuery.ajax({
            url: "http://localhost:3000/verifyUser",
            type: "GET",
            data: {
            "un": name.value,
            },
        })

    .done(function(data) {
        if(data == "True") {
            window.location.href = "/choose.html?username=" + name.value;
        }
    })

    .fail(function(jqXHR, textStatus, errorThrown) {
        console.log("HTTP Request Failed");
    })
    }
}

