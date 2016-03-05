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
        console.log(data);

        if(data == "True") {
            window.location.href = "/choose.html?username=" + name.value;
        }
        else {
            var snackbarContainer = document.querySelector('#demo-snackbar-example');
            var showSnackbarButton = document.querySelector('#demo-show-snackbar');
            var handler = function(event) {
                showSnackbarButton.style.backgroundColor = '';
            };

            showSnackbarButton.style.backgroundColor = '#' +
            Math.floor(Math.random() * 0xFFFFFF).toString(16);
            var data = {
                timeout: 2000,
                actionHandler: handler,
                actionText: 'Undo'
            };

            snackbarContainer.MaterialSnackbar.showSnackbar(data);
        }
    })
    }
}

