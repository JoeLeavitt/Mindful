$(document).ready(function() {
    function inputKeyListener(e) {
        if (e.keyCode == 13) {
            search();
        }
    }

    function search() {
        var name = $("#search").val();
        console.log(name);
        jQuery.ajax({
                url: "http://localhost:3000/verifyUser",
                type: "GET",
                data: {
                    "un": name,
                }
            })
            .done(function (data) {
                console.log(data);
                if (data == "True") {
                    window.location.href = "/choose.html?username=" + name;
                }
                else {
                    showSnackbar();
                }
            })

            .fail(function (jqXHR, textStatus, errorThrown) {
                console.log("HTTP Request Failed");
            })
    }


    window['counter'] = 0;
    var snackbarContainer = document.querySelector('#error-show');
    var showToastButton = $('#show-error');

    function showSnackbar() {
        var data = {message: 'User Not Found '};
        snackbarContainer.MaterialSnackbar.showSnackbar(data);
    };

    $(".showToastButton").click(search);


    $("#search").keyup(inputKeyListener);

});