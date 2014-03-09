function windowpop(url, width, height) {
    var leftPosition, topPosition;
    //Allow for borders.
    leftPosition = (window.screen.width / 2) - ((width / 2) + 10);
    //Allow for title and status bars.
    topPosition = (window.screen.height / 2) - ((height / 2) + 50);
    //Open the window.
    window.open(url, "Window2", "status=no,height=" + height + ",width=" + width + ",resizable=yes,left=" + leftPosition + ",top=" + topPosition + ",screenX=" + leftPosition + ",screenY=" + topPosition + ",toolbar=no,menubar=no,scrollbars=no,location=no,directories=no");
}

function terms(refid, affid)
{
	if($("#termsbox").is(':checked')) 
	{ 

		window.location='http://tweetaly.st/auth/twitter?ref_id='+refid+'&aff_id='+affid;

	} else
	 { 
	 	//alert("You have to Read and Agree to Terms and conditions in order to use this app.");

	 	$('#myModal2').modal('show');

	 }
}


// $('#myModal').on('shown.bs.modal', function () {
//     $('#textareaID').focus();
// })

function showAgreement()
{
	$('#myModal').modal('show');
}

function showContactModal()
{
	$('#myContactModal').modal('show');
}

