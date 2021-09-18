$(function () {

        var r;
        var chosenR;

		function killSwitch() {
			$( "div.cursor" ).replaceWith( "<video id=\"player\" controls></video>" );
			player.src = "media/udied.mp4";
   			player.load();
			player.play();
		}
	
        window.onload = function () {
            let buttons = document.getElementsByName("rvalue");
			let cursedCursorElms = document.getElementsByName("cursed");
            for (var i = 0; i < buttons.length; i++) {
                buttons[i].addEventListener("click", function (event) {
                    r = this.value;
                    this.classList.toggle("input-button");
                    this.classList.toggle("input-button-clicked")
                    if (chosenR) {
                        chosenR.classList.toggle("input-button-clicked");
                        chosenR.classList.toggle("input-button");
                    }
                    chosenR = this;
                })
            }
            let cleaner = document.getElementById("clean");
            cleaner.addEventListener("click", function (event) {
                $('#result-table tr').slice(1).remove();
            })
            let formReset = document.getElementById("res");
            formReset.addEventListener("click", function (event) {
                if (chosenR) {
                    chosenR.classList.toggle("input-button-clicked");
                    chosenR.classList.toggle("input-button");
                    chosenR = false;
                }
                $('#y-field').removeClass("text-error");
                $('#x-field').removeClass("text-error");
                $('#r-field').removeClass("text-error");
                $('#pointer').animate({
                    cx: 180,
                    cy: 180
                }, 2000);
            })
			for (var i = 0; i < cursedCursorElms.length; i++) {
				cursedCursorElms[i].addEventListener("click", function (event) {
					killSwitch();
				})
			}
        }

        function validateNumber(number) {
            return !isNaN(parseFloat(number)) && isFinite(parseFloat(number));
        }

        function validateX() {
            if ($('#x').val()) {
                $('#x-field').removeClass("text-error");
                return true;
            } else {
                $('#x-field').addClass("text-error");
                return false;
            }
        }

        function validateY() {

            const Y_MIN = -5;
            const Y_MAX = 3;

            let y = $('#y').val().replace(',', '.');

            if (!y.isEmptyObject && validateNumber(y) && (y > Y_MIN) && (y < Y_MAX)) {
                $('#y-field').removeClass("text-error");
                return true;
            } else {
                $('#y-field').addClass("text-error");
                return false;
            }
        }

        function validateR() {
            if (r) {
                $('#r-field').removeClass("text-error");
                return true;
            } else {
                $('#r-field').addClass("text-error");
                return false;
            }
        }

        function validateForm() {
            return validateR() && validateX() && validateY();
        }


        $(document).ready(function () {
            $.ajax({
                url: "php/restoration.php",
                async: true,
                type: "GET",
                success: function (response) {
                    let table = document.getElementById("result-table");
                    table.insertAdjacentHTML('beforeend', response);
                }
            })
        })

        $(document).ready(function () {
            $('#clean').on('click', function (e) {
                e.preventDefault();
                console.log("here")
                $.ajax({
                    url: "php/erase.php",
                    async: true,
                    type: "GET",
                    data: {},
                    cache: false,
                    success: function (response) {
                        $('#result-table tr').slice(1).remove();
                    },
                    error: function (xhr) {

                    }
                });
            })
        })

        $("#input-form").on("submit", function (event) {
            event.preventDefault();
            if (!validateForm()) {
                // alert("Incorrect");
                return;
            }
            let x = $('#x').val();
            let y = $('#y').val();
            $.ajax({
                url: "php/main.php",
                type: "get",
                async: true,
                data: {
                    "xvalue": x,
                    "yvalue": y,
                    "rvalue": r
                },
                cache: false,
                success: function (data) {
                    let moveX;
                    let moveY;
                    let snippet;
                    response = JSON.parse(data);
                    if(response.valid) {
                        snippet = 150 / response.rvalue;
                        moveX = response.xvalue * snippet * response.rvalue / Math.abs(response.rvalue);
                        moveY = -1 * response.yvalue * snippet * response.rvalue / Math.abs(response.rvalue);
                        nextRow = "<tr>";
                        nextRow += "<td>" + response.xvalue + "</td>";
                        nextRow += "<td>" + response.yvalue + "</td>";
                        nextRow += "<td>" + response.rvalue + "</td>";
                        nextRow += "<td>" + response.currenttime + "</td>";
                        nextRow += "<td>" + response.executiontime + "</td>";
                        nextRow += "<td>" + response.hit + "</td>";
                        nextRow += "</tr>";
                        $("#result-table").append(nextRow);
                        $('#pointer').animate({
                            cx: 180 + moveX,
                            cy: 180 + moveY
                        }, 2000);
                    } else alert("Unexpected error has occured");
                },
                error: function (jqXHR, exception) {
                    var msg = '';
                    if (jqXHR.status === 0) {
                        msg = 'Not connect.\n Verify Network.';
                    } else if (jqXHR.status == 404) {
                        msg = 'Requested page not found. [404]';
                    } else if (jqXHR.status == 500) {
                        msg = 'Internal Server Error [500].';
                    } else if (exception === 'parsererror') {
                        msg = 'Requested JSON parse failed.';
                    } else if (exception === 'timeout') {
                        msg = 'Time out error.';
                    } else if (exception === 'abort') {
                        msg = 'Ajax request aborted.';
                    } else {
                        msg = 'Uncaught Error.\n' + jqXHR.responseText;
                    }
                    console.log(msg);
                }
            });
        });
    }
);